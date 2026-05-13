import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
	appendAnalyticsEvent,
	createAnalyticsEvent,
	createGeoLocation,
	getGeoLocationFields,
	getVisitorId,
	isPrivateOrLocalIp,
	shouldTrackPageView,
	syncAnalyticsSpool,
} from "./analytics.mjs";

const tempDirs = [];

afterEach(async () => {
	for (const dir of tempDirs.splice(0)) {
		await rm(dir, { recursive: true, force: true });
	}
});

describe("shouldTrackPageView", () => {
	test("tracks successful page routes", () => {
		for (const pathname of ["/", "/home", "/blog", "/blog/some-post"]) {
			expect(
				shouldTrackPageView({
					method: "GET",
					pathname,
					status: 200,
					userAgent:
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
				}),
			).toBe(true);
		}
	});

	test("tracks the built index document served for the root path", () => {
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/",
				status: 200,
				userAgent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
			}),
		).toBe(true);
	});

	test("skips assets, internal routes, bots, non-GET requests, and errors", () => {
		const userAgent =
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";

		expect(
			shouldTrackPageView({ method: "GET", pathname: "/app.js", status: 200, userAgent }),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/favicon.ico",
				status: 200,
				userAgent,
			}),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/robots.txt",
				status: 200,
				userAgent,
			}),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/api/analytics",
				status: 200,
				userAgent,
			}),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/blog",
				status: 200,
				userAgent: "Googlebot/2.1",
			}),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "POST",
				pathname: "/blog",
				status: 200,
				userAgent,
			}),
		).toBe(false);
		expect(
			shouldTrackPageView({
				method: "GET",
				pathname: "/missing",
				status: 404,
				userAgent,
			}),
		).toBe(false);
	});
});

describe("analytics privacy", () => {
	test("hashes visitors with a salt and never serializes the raw IP", () => {
		const request = makeRequest({
			url: "/blog/example?utm_source=newsletter",
			headers: {
				host: "trevordebard.com",
				"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15",
				"x-forwarded-for": "203.0.113.42, 10.0.0.1",
				referer: "https://example.com/source?campaign=test",
			},
		});

		const event = createAnalyticsEvent({
			request,
			status: 200,
			now: new Date("2026-05-12T12:00:00.000Z"),
			salt: "test-salt",
		});
		const serialized = JSON.stringify(event);

		expect(event.path).toBe("/blog/example");
		expect(event.referrer_host).toBe("example.com");
		expect(event.device).toBe("mobile");
		expect(event.country).toBe("");
		expect(event.region).toBe("");
		expect(event.city).toBe("");
		expect(serialized).not.toContain("203.0.113.42");
		expect(event.visitor_id).toBe(
			getVisitorId({
				ip: "203.0.113.42",
				userAgent: request.headers["user-agent"],
				salt: "test-salt",
			}),
		);
		expect(event.visitor_id).not.toBe(
			getVisitorId({
				ip: "203.0.113.42",
				userAgent: request.headers["user-agent"],
				salt: "different-salt",
			}),
		);
	});
});

describe("GeoIP enrichment", () => {
	test("maps MaxMind city records into coarse analytics fields", () => {
		expect(
			getGeoLocationFields({
				country: { names: { en: "United States" } },
				subdivisions: [{ names: { en: "Georgia" } }],
				city: { names: { en: "Atlanta" } },
				location: { time_zone: "America/New_York" },
			}),
		).toEqual({
			country: "United States",
			region: "Georgia",
			city: "Atlanta",
			timezone: "America/New_York",
		});
	});

	test("skips local and private IP geolocation", async () => {
		const geoLookup = Promise.resolve({
			get: vi.fn(() => ({
				country: { names: { en: "United States" } },
			})),
		});

		expect(isPrivateOrLocalIp("127.0.0.1")).toBe(true);
		expect(isPrivateOrLocalIp("10.0.0.5")).toBe(true);
		expect(isPrivateOrLocalIp("192.168.1.20")).toBe(true);
		expect(isPrivateOrLocalIp("172.16.1.20")).toBe(true);
		expect(isPrivateOrLocalIp("8.8.8.8")).toBe(false);
		expect(await createGeoLocation(geoLookup, "127.0.0.1")).toEqual({});
		expect((await geoLookup).get).not.toHaveBeenCalled();
	});

	test("adds GeoIP fields when a public IP lookup returns a match", async () => {
		const geoLookup = Promise.resolve({
			get: vi.fn(() => ({
				country: { names: { en: "Canada" } },
				subdivisions: [{ names: { en: "Ontario" } }],
				city: { names: { en: "Toronto" } },
				location: { time_zone: "America/Toronto" },
			})),
		});

		await expect(createGeoLocation(geoLookup, "8.8.8.8")).resolves.toEqual({
			country: "Canada",
			region: "Ontario",
			city: "Toronto",
			timezone: "America/Toronto",
		});
	});
});

describe("syncAnalyticsSpool", () => {
	test("retains events when PocketBase sync fails", async () => {
		const spoolPath = await makeSpoolPath();
		const event = makeEvent("event-1");
		await appendAnalyticsEvent(spoolPath, event);

		const fetchFn = vi.fn(async () => new Response("unavailable", { status: 503 }));
		const result = await syncAnalyticsSpool(makeConfig(spoolPath), fetchFn);

		expect(result).toEqual({ uploaded: 0, retained: 1 });
		expect(await readJsonLines(spoolPath)).toEqual([event]);
	});

	test("uploads events and clears the spool after success", async () => {
		const spoolPath = await makeSpoolPath();
		const event = makeEvent("event-2");
		await appendAnalyticsEvent(spoolPath, event);

		const fetchFn = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ token: "pb-token" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(new Response("{}", { status: 200 }));

		const result = await syncAnalyticsSpool(makeConfig(spoolPath), fetchFn);

		expect(result).toEqual({ uploaded: 1, retained: 0 });
		expect(fetchFn).toHaveBeenCalledTimes(2);
		await expect(readFile(spoolPath, "utf8")).rejects.toThrow();
	});
});

function makeRequest({ url, headers }) {
	return {
		method: "GET",
		url,
		headers,
		socket: {
			remoteAddress: "127.0.0.1",
		},
	};
}

function makeEvent(eventId) {
	return {
		event_id: eventId,
		viewed_at: "2026-05-12T12:00:00.000Z",
		path: "/blog/example",
		status: 200,
		referrer: "https://example.com/",
		referrer_host: "example.com",
		visitor_id: "visitor-1",
		browser: "Safari",
		device: "desktop",
		os: "macOS",
		country: "United States",
		region: "Georgia",
		city: "Atlanta",
		timezone: "America/New_York",
		user_agent: "Safari",
	};
}

function makeConfig(spoolPath) {
	return {
		enabled: true,
		syncEnabled: true,
		spoolPath,
		pocketBaseUrl: "http://127.0.0.1:8090",
		pocketBaseIdentity: "admin@example.com",
		pocketBasePassword: "password",
	};
}

async function makeSpoolPath() {
	const dir = await mkdtemp(join(tmpdir(), "personal-site-analytics-"));
	tempDirs.push(dir);
	return join(dir, "events.jsonl");
}

async function readJsonLines(path) {
	const text = await readFile(path, "utf8");
	return text
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));
}
