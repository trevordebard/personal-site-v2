import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, appendFile, mkdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";

const ASSET_EXTENSIONS = new Set([
	".avif",
	".css",
	".gif",
	".ico",
	".jpeg",
	".jpg",
	".js",
	".json",
	".map",
	".png",
	".svg",
	".txt",
	".webmanifest",
	".webp",
	".woff",
	".woff2",
]);

const BOT_PATTERNS = [
	/bot/i,
	/crawler/i,
	/spider/i,
	/slurp/i,
	/duckduckgo/i,
	/baiduspider/i,
	/yandex/i,
	/facebookexternalhit/i,
	/twitterbot/i,
	/linkedinbot/i,
	/discordbot/i,
	/slackbot/i,
	/preview/i,
];

const DEFAULT_SPOOL_PATH = join(process.cwd(), "var", "analytics", "events.jsonl");
const DEFAULT_SYNC_INTERVAL_MS = 30_000;

let syncInFlight = null;
let warnedMissingSalt = false;
let warnedMissingSyncCredentials = false;
let warnedSyncFailure = false;

export function getAnalyticsConfig(env = process.env) {
	const isProduction = env.NODE_ENV === "production";
	const analyticsEnabled =
		env.ANALYTICS_ENABLED === undefined
			? isProduction
			: env.ANALYTICS_ENABLED !== "false";
	const syncEnabled =
		env.ANALYTICS_SYNC_ENABLED === undefined
			? isProduction
			: env.ANALYTICS_SYNC_ENABLED !== "false";

	return {
		enabled: analyticsEnabled,
		syncEnabled,
		salt: env.ANALYTICS_SALT ?? (isProduction ? "" : "development-analytics-salt"),
		spoolPath: env.ANALYTICS_SPOOL_PATH ?? DEFAULT_SPOOL_PATH,
		pocketBaseUrl: env.POCKETBASE_URL ?? "http://127.0.0.1:8090",
		pocketBaseIdentity:
			env.ANALYTICS_POCKETBASE_EMAIL ?? env.POCKETBASE_SUPERUSER_EMAIL ?? "",
		pocketBasePassword:
			env.ANALYTICS_POCKETBASE_PASSWORD ?? env.POCKETBASE_SUPERUSER_PASSWORD ?? "",
		syncIntervalMs: Number.parseInt(
			env.ANALYTICS_SYNC_INTERVAL_MS ?? `${DEFAULT_SYNC_INTERVAL_MS}`,
			10,
		),
		isProduction,
	};
}

export function shouldTrackPageView({ method, pathname, status, userAgent }) {
	if (method !== "GET") {
		return false;
	}

	if (status < 200 || status >= 400) {
		return false;
	}

	if (pathname.startsWith("/api/") || pathname.startsWith("/_")) {
		return false;
	}

	if (
		pathname === "/favicon.ico" ||
		pathname === "/favicon.svg" ||
		pathname === "/manifest.json" ||
		pathname === "/robots.txt"
	) {
		return false;
	}

	const extension = pathname.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();
	if (extension && ASSET_EXTENSIONS.has(extension)) {
		return false;
	}

	return !BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function normalizeAnalyticsPath(pathname) {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}

export function getClientIp(request) {
	const forwardedFor = request.headers["x-forwarded-for"];
	if (typeof forwardedFor === "string" && forwardedFor.trim()) {
		return forwardedFor.split(",")[0].trim();
	}

	const realIp = request.headers["x-real-ip"];
	if (typeof realIp === "string" && realIp.trim()) {
		return realIp.trim();
	}

	return request.socket.remoteAddress ?? "";
}

export function getVisitorId({ ip, userAgent, salt }) {
	return createHash("sha256")
		.update(`${salt}:${ip}:${userAgent}`)
		.digest("hex")
		.slice(0, 32);
}

export function summarizeUserAgent(userAgent) {
	const browser = getBrowser(userAgent);
	const device = /mobile|iphone|android/i.test(userAgent)
		? "mobile"
		: /ipad|tablet/i.test(userAgent)
			? "tablet"
			: "desktop";
	const os = getOperatingSystem(userAgent);

	return { browser, device, os };
}

export function createAnalyticsEvent({ request, status, now = new Date(), salt }) {
	const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
	const userAgent = request.headers["user-agent"] ?? "";
	const ip = getClientIp(request);
	const referrer = request.headers.referer ?? request.headers.referrer ?? "";
	const referrerUrl = getReferrerUrl(referrer);
	const userAgentSummary = summarizeUserAgent(userAgent);

	return {
		event_id: randomUUID(),
		viewed_at: now.toISOString(),
		path: normalizeAnalyticsPath(url.pathname),
		status,
		referrer: referrerUrl?.href ?? "",
		referrer_host: referrerUrl?.host ?? "",
		visitor_id: getVisitorId({ ip, userAgent, salt }),
		browser: userAgentSummary.browser,
		device: userAgentSummary.device,
		os: userAgentSummary.os,
		user_agent: userAgent.slice(0, 500),
	};
}

export async function appendAnalyticsEvent(spoolPath, event) {
	await mkdir(dirname(spoolPath), { recursive: true });
	await appendFile(spoolPath, `${JSON.stringify(event)}\n`, "utf8");
}

export function createAnalytics(env = process.env, fetchFn = globalThis.fetch) {
	const config = getAnalyticsConfig(env);

	if (config.enabled && config.isProduction && !config.salt && !warnedMissingSalt) {
		warnedMissingSalt = true;
		console.warn("Analytics disabled until ANALYTICS_SALT is configured.");
	}

	function scheduleSync() {
		if (!config.syncEnabled) {
			return;
		}

		void syncAnalyticsSpool(config, fetchFn);
	}

	const interval =
		config.enabled && config.syncEnabled
			? setInterval(scheduleSync, config.syncIntervalMs)
			: null;
	interval?.unref?.();

	return {
		recordPageView(request, status) {
			if (!config.enabled || !config.salt) {
				return;
			}

			const url = new URL(
				request.url ?? "/",
				`http://${request.headers.host ?? "localhost"}`,
			);
			const userAgent = request.headers["user-agent"] ?? "";

			if (
				!shouldTrackPageView({
					method: request.method ?? "GET",
					pathname: url.pathname,
					status,
					userAgent,
				})
			) {
				return;
			}

			void appendAnalyticsEvent(
				config.spoolPath,
				createAnalyticsEvent({ request, status, salt: config.salt }),
			).then(scheduleSync, (error) => {
				console.error("Failed to write analytics event:", error);
			});
		},
		syncNow() {
			return syncAnalyticsSpool(config, fetchFn);
		},
		close() {
			if (interval) {
				clearInterval(interval);
			}
		},
		config,
	};
}

export async function syncAnalyticsSpool(config, fetchFn = globalThis.fetch) {
	if (!config.enabled || !config.syncEnabled) {
		return { uploaded: 0, retained: 0 };
	}

	if (!config.pocketBaseIdentity || !config.pocketBasePassword) {
		if (!warnedMissingSyncCredentials) {
			warnedMissingSyncCredentials = true;
			console.warn(
				"Analytics sync skipped until ANALYTICS_POCKETBASE_EMAIL and ANALYTICS_POCKETBASE_PASSWORD are configured.",
			);
		}
		return { uploaded: 0, retained: 0 };
	}

	if (syncInFlight) {
		return syncInFlight;
	}

	syncInFlight = syncAnalyticsSpoolOnce(config, fetchFn).finally(() => {
		syncInFlight = null;
	});

	return syncInFlight;
}

async function syncAnalyticsSpoolOnce(config, fetchFn) {
	const processingPath = `${config.spoolPath}.processing`;
	const hasProcessingFile = await fileExists(processingPath);

	if (!hasProcessingFile) {
		if (!(await fileExists(config.spoolPath))) {
			return { uploaded: 0, retained: 0 };
		}

		await rename(config.spoolPath, processingPath);
	}

	if ((await stat(processingPath)).size === 0) {
		await rm(processingPath, { force: true });
		return { uploaded: 0, retained: 0 };
	}

	let token;
	try {
		token = await getPocketBaseAuthToken(config, fetchFn);
	} catch (error) {
		logSyncFailure(error);
		const retained = await restoreProcessingFile(config.spoolPath, processingPath);
		return { uploaded: 0, retained };
	}
	const retained = [];
	let uploaded = 0;

	for await (const event of readJsonLines(processingPath)) {
		try {
			const success = await uploadAnalyticsEvent(config, fetchFn, token, event);
			if (success) {
				uploaded += 1;
			} else {
				retained.push(event);
			}
		} catch (error) {
			logSyncFailure(error);
			retained.push(event);
		}
	}

	await rm(processingPath, { force: true });

	if (retained.length > 0) {
		await mkdir(dirname(config.spoolPath), { recursive: true });
		await appendFile(
			config.spoolPath,
			retained.map((event) => JSON.stringify(event)).join("\n") + "\n",
			"utf8",
		);
	}

	return { uploaded, retained: retained.length };
}

function logSyncFailure(error) {
	if (warnedSyncFailure) {
		return;
	}

	warnedSyncFailure = true;
	console.warn("Analytics sync failed; events will remain in the local spool.", error);
}

async function restoreProcessingFile(spoolPath, processingPath) {
	const events = [];

	for await (const event of readJsonLines(processingPath)) {
		events.push(event);
	}

	await rm(processingPath, { force: true });

	if (events.length > 0) {
		await mkdir(dirname(spoolPath), { recursive: true });
		await appendFile(
			spoolPath,
			events.map((event) => JSON.stringify(event)).join("\n") + "\n",
			"utf8",
		);
	}

	return events.length;
}

async function getPocketBaseAuthToken(config, fetchFn) {
	const response = await fetchFn(
		new URL("/api/collections/_superusers/auth-with-password", config.pocketBaseUrl),
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				identity: config.pocketBaseIdentity,
				password: config.pocketBasePassword,
			}),
		},
	);

	if (!response.ok) {
		throw new Error(`PocketBase auth failed: ${response.status}`);
	}

	const data = await response.json();
	if (!data.token) {
		throw new Error("PocketBase auth response did not include a token.");
	}

	return data.token;
}

async function uploadAnalyticsEvent(config, fetchFn, token, event) {
	const response = await fetchFn(
		new URL("/api/collections/analytics_events/records", config.pocketBaseUrl),
		{
			method: "POST",
			headers: {
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(event),
		},
	);

	if (response.ok) {
		return true;
	}

	const body = await response.text();
	if (response.status === 400 && body.includes("event_id")) {
		return true;
	}

	return false;
}

async function* readJsonLines(path) {
	const lineReader = createInterface({
		input: createReadStream(path, { encoding: "utf8" }),
		crlfDelay: Number.POSITIVE_INFINITY,
	});

	for await (const line of lineReader) {
		if (!line.trim()) {
			continue;
		}

		yield JSON.parse(line);
	}
}

async function fileExists(path) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

function getReferrerUrl(referrer) {
	if (!referrer) {
		return null;
	}

	try {
		return new URL(referrer);
	} catch {
		return null;
	}
}

function getBrowser(userAgent) {
	if (/edg\//i.test(userAgent)) {
		return "Edge";
	}
	if (/chrome\//i.test(userAgent) && !/chromium/i.test(userAgent)) {
		return "Chrome";
	}
	if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) {
		return "Safari";
	}
	if (/firefox\//i.test(userAgent)) {
		return "Firefox";
	}

	return "Other";
}

function getOperatingSystem(userAgent) {
	if (/windows/i.test(userAgent)) {
		return "Windows";
	}
	if (/iphone|ipad|ios/i.test(userAgent)) {
		return "iOS";
	}
	if (/android/i.test(userAgent)) {
		return "Android";
	}
	if (/mac os|macintosh/i.test(userAgent)) {
		return "macOS";
	}
	if (/linux/i.test(userAgent)) {
		return "Linux";
	}

	return "Other";
}
