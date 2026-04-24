import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import app from "../dist/server/server.js";

const host = "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const clientDir = normalize(join(process.cwd(), "dist/client"));

const contentTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".html", "text/html; charset=utf-8"],
	[".ico", "image/x-icon"],
	[".js", "text/javascript; charset=utf-8"],
	[".json", "application/json; charset=utf-8"],
	[".map", "application/json; charset=utf-8"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".txt", "text/plain; charset=utf-8"],
	[".webmanifest", "application/manifest+json; charset=utf-8"],
]);

function getContentType(pathname) {
	return contentTypes.get(extname(pathname)) ?? "application/octet-stream";
}

function getStaticFilePath(urlPathname) {
	const pathname = urlPathname === "/" ? "/index.html" : urlPathname;
	const filePath = normalize(join(clientDir, pathname));

	if (!filePath.startsWith(clientDir)) {
		return null;
	}

	return filePath;
}

async function tryServeStatic(request, response) {
	if (!request.url) {
		return false;
	}

	const url = new URL(request.url, `http://${request.headers.host ?? "127.0.0.1"}`);
	const filePath = getStaticFilePath(url.pathname);

	if (!filePath || !existsSync(filePath)) {
		return false;
	}

	const fileStats = await stat(filePath);

	if (!fileStats.isFile()) {
		return false;
	}

	response.statusCode = 200;
	response.setHeader("content-type", getContentType(filePath));
	response.setHeader("content-length", fileStats.size);

	await pipeline(createReadStream(filePath), response);

	return true;
}

function getRequestOrigin(request) {
	const forwardedProto = request.headers["x-forwarded-proto"];
	const forwardedHost = request.headers["x-forwarded-host"];
	const proto =
		typeof forwardedProto === "string"
			? forwardedProto.split(",")[0].trim()
			: "http";
	const hostname =
		typeof forwardedHost === "string"
			? forwardedHost.split(",")[0].trim()
			: request.headers.host ?? `127.0.0.1:${port}`;

	return `${proto}://${hostname}`;
}

function toWebRequest(request) {
	const url = new URL(request.url ?? "/", getRequestOrigin(request));
	const headers = new Headers();

	for (const [key, value] of Object.entries(request.headers)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				headers.append(key, item);
			}
			continue;
		}

		if (typeof value === "string") {
			headers.set(key, value);
		}
	}

	return new Request(url, {
		method: request.method,
		headers,
		body:
			request.method === "GET" || request.method === "HEAD"
				? undefined
				: request,
		duplex: "half",
	});
}

const server = createServer(async (request, response) => {
	try {
		if (await tryServeStatic(request, response)) {
			return;
		}

		const webResponse = await app.fetch(toWebRequest(request));

		response.statusCode = webResponse.status;
		response.statusMessage = webResponse.statusText;

		for (const [key, value] of webResponse.headers) {
			response.setHeader(key, value);
		}

		if (!webResponse.body) {
			response.end();
			return;
		}

		await pipeline(Readable.fromWeb(webResponse.body), response);
	} catch (error) {
		console.error("Failed to handle request:", error);

		if (!response.headersSent) {
			response.statusCode = 500;
			response.setHeader("content-type", "text/plain; charset=utf-8");
		}

		response.end("Internal Server Error");
	}
});

server.listen(port, host, () => {
	console.log(`Server listening on http://${host}:${port}`);
});
