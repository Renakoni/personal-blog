#!/usr/bin/env node
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const configPath = path.join(projectRoot, "src", "config.ts");
const cachePath = path.join(projectRoot, "src", "data", "anime-cache.json");
const coverDir = path.join(projectRoot, "public", "anime-covers");
const envPath = path.join(projectRoot, ".env");
const pageSize = 50;
const maxPages = 20;
const detailConcurrency = 8;

function parseEnv(source) {
	const entries = {};
	for (const rawLine of source.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#") || !line.includes("=")) continue;
		const [rawKey, ...rawValueParts] = line.split("=");
		const key = rawKey.trim();
		const value = rawValueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
		entries[key] = value;
	}
	return entries;
}

async function loadEnvToken() {
	if (process.env.BANGUMI_TOKEN) return process.env.BANGUMI_TOKEN;
	try {
		const envSource = await readFile(envPath, "utf-8");
		const parsed = parseEnv(envSource);
		return parsed.BANGUMI_TOKEN || "";
	} catch {
		return "";
	}
}

function extractBangumiConfig(source) {
	const userMatch = source.match(/userId:\s*"([^"]+)"/);
	const modeMatch = source.match(/mode:\s*"([^"]+)"/);
	return {
		userId: userMatch?.[1] || "",
		mode: modeMatch?.[1] || "local",
	};
}

const token = await loadEnvToken();
const configSource = await readFile(configPath, "utf-8");
const { userId, mode } = extractBangumiConfig(configSource);

if (mode !== "bangumi" || !userId) {
	console.error("Bangumi mode is not enabled in src/config.ts");
	process.exit(1);
}

if (!token) {
	console.error("BANGUMI_TOKEN is required to sync anime cache.");
	process.exit(1);
}

await mkdir(path.dirname(cachePath), { recursive: true });
await mkdir(coverDir, { recursive: true });

const collectionStatusMap = {
	1: "想看",
	2: "看过",
	3: "在看",
};

function normalizeCover(image) {
	if (!image) return "";
	return image.startsWith("//") ? `https:${image}` : image;
}

function formatDate(date) {
	if (!date) return "日期未知";
	const parts = String(date).split("-");
	if (parts.length !== 3) return String(date);
	return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
}

function pickEpisodes(subject) {
	const raw = subject?.eps ?? subject?.total_episodes;
	if (!raw || Number(raw) <= 0) return "话数未知";
	return `${raw}话`;
}

function flattenInfoboxValue(value) {
	if (Array.isArray(value)) {
		return value.map((entry) => flattenInfoboxValue(entry)).filter(Boolean).join(" / ");
	}
	if (value && typeof value === "object") {
		if ("v" in value) return flattenInfoboxValue(value.v);
		if ("name" in value) return flattenInfoboxValue(value.name);
		if ("k" in value) return flattenInfoboxValue(value.k);
		return "";
	}
	return String(value || "").trim();
}

function getInfobox(subject) {
	return Array.isArray(subject?.infobox) ? subject.infobox : [];
}

function pickInfoboxDetail(subject, keys) {
	for (const item of getInfobox(subject)) {
		const key = String(item?.key || "");
		if (!keys.includes(key)) continue;
		const value = flattenInfoboxValue(item?.value);
		if (value) return value;
	}
	return "";
}

function pickInfoboxDetails(subject, keys) {
	const values = [];
	for (const item of getInfobox(subject)) {
		const key = String(item?.key || "");
		if (!keys.includes(key)) continue;
		const value = flattenInfoboxValue(item?.value);
		if (value && !values.includes(value)) values.push(value);
	}
	return values;
}

function cleanDetailText(value) {
	return value.replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim();
}

function buildAnimeDetails(subject, date, episodes) {
	const primaryParts = [];
	if (episodes !== "话数未知") primaryParts.push(episodes);
	if (date !== "日期未知") primaryParts.push(date);
	const detailsPrimary = primaryParts.join(" / ") || "基础信息暂缺";

	const secondaryParts = [];
	const director = pickInfoboxDetail(subject, ["导演", "监督"]);
	if (director) secondaryParts.push(director);

	const sourceParts = pickInfoboxDetails(subject, ["原作", "漫画", "小说", "轻小说", "游戏", "作者"]);
	for (const part of sourceParts) {
		if (!secondaryParts.includes(part)) secondaryParts.push(part);
	}

	const staffParts = [
		pickInfoboxDetail(subject, ["脚本", "系列构成", "シリーズ構成"]),
		pickInfoboxDetail(subject, ["人物设定", "人设", "キャラクターデザイン"]),
		pickInfoboxDetail(subject, ["动画制作", "アニメーション制作", "制作公司", "制作"]),
	].filter(Boolean);
	for (const part of staffParts) {
		if (!secondaryParts.includes(part)) secondaryParts.push(part);
	}

	const detailsSecondary = cleanDetailText(secondaryParts.join(" / "));
	const details = [detailsPrimary, detailsSecondary].filter(Boolean).join(" / ");
	return { details, detailsPrimary, detailsSecondary };
}

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
			"User-Agent": "fuwari-personal-blog/0.1",
		},
	});
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status} ${url}`);
	}
	return response.json();
}

async function fetchCollectionPage(offset) {
	const payload = await fetchJson(
		`https://api.bgm.tv/v0/users/${encodeURIComponent(userId)}/collections?subject_type=2&limit=${pageSize}&offset=${offset}`,
	);
	return Array.isArray(payload.data) ? payload.data : [];
}

async function fetchSubjectDetail(subjectId) {
	try {
		return await fetchJson(`https://api.bgm.tv/v0/subjects/${encodeURIComponent(String(subjectId))}`);
	} catch {
		return null;
	}
}

async function mapWithConcurrency(items, limit, mapper) {
	const results = new Array(items.length);
	let index = 0;
	async function worker() {
		while (index < items.length) {
			const current = index;
			index += 1;
			results[current] = await mapper(items[current]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
}

function createCoverFileName(id, imageUrl) {
	const normalized = normalizeCover(imageUrl);
	const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 10);
	const extension = path.extname(new URL(normalized).pathname) || ".jpg";
	return `${id}-${hash}${extension}`;
}

async function ensureLocalCover(id, imageUrl) {
	const normalized = normalizeCover(imageUrl);
	if (!normalized) return "";
	const fileName = createCoverFileName(id, normalized);
	const filePath = path.join(coverDir, fileName);
	try {
		await stat(filePath);
		return `/anime-covers/${fileName}`;
	} catch {}

	const response = await fetch(normalized, {
		headers: {
			Accept: "image/*",
			"User-Agent": "fuwari-personal-blog/0.1",
		},
	});
	if (!response.ok) return normalized;
	const buffer = Buffer.from(await response.arrayBuffer());
	await writeFile(filePath, buffer);
	return `/anime-covers/${fileName}`;
}

const baseItems = [];
for (let page = 0; page < maxPages; page += 1) {
	const offset = page * pageSize;
	const data = await fetchCollectionPage(offset);
	const pageItems = data
		.map((item) => {
			const subject = item.subject || {};
			const type = Number(item.type || 2);
			if (![1, 2, 3].includes(type)) return null;
			const image = subject.images?.large || subject.images?.common || subject.images?.medium;
			return {
				id: subject.id || item.subject_id,
				title: subject.name_cn || subject.name || "未命名条目",
				originalTitle: subject.name || subject.name_cn || "Unknown",
				status: collectionStatusMap[type] || "看过",
				type,
				date: formatDate(subject.date),
				episodes: pickEpisodes(subject),
				cover: normalizeCover(image),
			};
		})
		.filter(Boolean);
	baseItems.push(...pageItems);
	if (data.length < pageSize) break;
}

const detailSubjects = await mapWithConcurrency(baseItems, detailConcurrency, async (item) => {
	return (await fetchSubjectDetail(item.id)) || null;
});

const items = [];
for (let index = 0; index < baseItems.length; index += 1) {
	const item = baseItems[index];
	const detailSubject = detailSubjects[index];
	const detailSource = detailSubject || {
		date: item.date,
		eps: item.episodes,
		name: item.originalTitle,
		name_cn: item.title,
	};
	const detailDate = detailSubject?.date ? formatDate(detailSubject.date) : item.date;
	const detailEpisodes = detailSubject ? pickEpisodes(detailSubject) : item.episodes;
	const { details, detailsPrimary, detailsSecondary } = buildAnimeDetails(detailSource, detailDate, detailEpisodes);
	const cover = await ensureLocalCover(item.id, item.cover);
	items.push({
		...item,
		date: detailDate,
		episodes: detailEpisodes,
		details,
		detailsPrimary,
		detailsSecondary,
		cover,
	});
}

const payload = {
	generatedAt: new Date().toISOString(),
	userId,
	items,
};

await writeFile(cachePath, JSON.stringify(payload, null, 2) + "\n", "utf-8");
console.log(`Synced ${items.length} anime items at ${payload.generatedAt}`);
