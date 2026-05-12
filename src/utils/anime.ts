import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../config";

export type CollectionType = 1 | 2 | 3;

type BangumiSubject = {
	date?: string;
	eps?: number | string;
	total_episodes?: number | string;
	id?: number | string;
	images?: {
		large?: string;
		common?: string;
		medium?: string;
	};
	infobox?: Array<{ key?: string; value?: any }>;
	name?: string;
	name_cn?: string;
};

export type AnimeCover = string | {
	fallback: string;
	avif: string;
	webp: string;
};

export type AnimeItem = {
	id: number | string;
	title: string;
	originalTitle: string;
	status: string;
	type: CollectionType;
	date: string;
	episodes: string;
	details: string;
	detailsPrimary: string;
	detailsSecondary: string;
	cover: AnimeCover;
};

export type LoadState = {
	source: "cache" | "fallback";
	message: string;
};

type BangumiAnimeListResult = {
	items: AnimeItem[];
	state: LoadState;
};

type AnimeCachePayload = {
	generatedAt: string;
	userId: string;
	items: AnimeItem[];
};

export const ANIME_PAGE_SIZE = 12;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const animeCachePath = path.join(projectRoot, "src", "data", "anime-cache.json");
const animeCoverDir = path.join(projectRoot, "public", "anime-covers");

export const fallbackAnimeList: AnimeItem[] = [
	{
		id: "fallback-ranpo-kitan",
		title: "乱步奇谭 拉普拉斯的游戏",
		originalTitle: "乱歩奇譚 Game of Laplace",
		status: "看过",
		type: 2,
		date: "2015年7月3日",
		episodes: "11话",
		details: "11话 / 2015年7月3日 / 岸诚二 / 森田和明",
		detailsPrimary: "11话 / 2015年7月3日",
		detailsSecondary: "岸诚二 / 森田和明",
		cover: "https://lain.bgm.tv/r/400/pic/cover/l/c9/76/278614_jcIuC.jpg",
	},
	{
		id: "fallback-kyokou-suiri",
		title: "虚构推理",
		originalTitle: "虚構推理",
		status: "看过",
		type: 2,
		date: "2020年1月11日",
		episodes: "12话",
		details: "12话 / 2020年1月11日 / 后藤圭二 / 城平京（講談社タイガ刊）；漫画：片瀬茶柴（講談社『月刊少年マガジン』『少年マガジンR』連載） / 本多孝敏",
		detailsPrimary: "12话 / 2020年1月11日",
		detailsSecondary: "後藤圭二 / 城平京（講談社タイガ刊）；漫画：片瀬茶柴（講談社『月刊少年マガジン』『少年マガジンR』連載） / 本多孝敏",
		cover: "https://lain.bgm.tv/r/400/pic/cover/l/e9/53/289906_6DZN6.jpg",
	},
	{
		id: "fallback-frieren",
		title: "葬送的芙莉莲",
		originalTitle: "葬送のフリーレン",
		status: "想看",
		type: 1,
		date: "2023年9月29日",
		episodes: "28话",
		details: "28话 / 2023年9月29日 / 山田鐘人・アベツカサ / 斋藤圭一郎 / 長澤礼子 / MADHOUSE",
		detailsPrimary: "28话 / 2023年9月29日",
		detailsSecondary: "山田鐘人・アベツカサ / 斋藤圭一郎 / 長澤礼子 / MADHOUSE",
		cover: "https://lain.bgm.tv/r/400/pic/cover/l/c3/0f/306626_1Z24X.jpg",
	},
];

export const collectionStatusMap: Record<CollectionType, string> = {
	1: "想看",
	2: "看过",
	3: "在看",
};

export const animeFilters = [
	{ key: "all", label: "全部", type: null },
	{ key: "wish", label: "想看", type: 1 },
	{ key: "done", label: "看过", type: 2 },
	{ key: "watching", label: "在看", type: 3 },
] as const;

export type AnimeFilterKey = (typeof animeFilters)[number]["key"];

export function normalizeCover(image: string | undefined): string {
	if (!image) return "";
	return image.startsWith("//") ? `https:${image}` : image;
}

export function formatDate(date: string | undefined): string {
	if (!date) return "日期未知";
	const parts = String(date).split("-");
	if (parts.length !== 3) return String(date);
	return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
}

export function pickEpisodes(subject: BangumiSubject): string {
	const raw = subject?.eps ?? subject?.total_episodes;
	if (!raw || Number(raw) <= 0) return "话数未知";
	return `${raw}话`;
}

function flattenInfoboxValue(value: any): string {
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

function getInfobox(subject: BangumiSubject) {
	return Array.isArray(subject?.infobox) ? subject.infobox : [];
}

function pickInfoboxDetail(subject: BangumiSubject, keys: string[]): string {
	for (const item of getInfobox(subject)) {
		const key = String(item?.key || "");
		if (!keys.includes(key)) continue;
		const value = flattenInfoboxValue(item?.value);
		if (value) return value;
	}
	return "";
}

function pickInfoboxDetails(subject: BangumiSubject, keys: string[]): string[] {
	const values: string[] = [];
	for (const item of getInfobox(subject)) {
		const key = String(item?.key || "");
		if (!keys.includes(key)) continue;
		const value = flattenInfoboxValue(item?.value);
		if (value && !values.includes(value)) {
			values.push(value);
		}
	}
	return values;
}

function cleanDetailText(value: string): string {
	return value.replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim();
}

export function buildAnimeDetails(subject: BangumiSubject, date: string, episodes: string) {
	const primaryParts: string[] = [];
	if (episodes !== "话数未知") primaryParts.push(episodes);
	if (date !== "日期未知") primaryParts.push(date);
	const detailsPrimary = primaryParts.join(" / ") || "基础信息暂缺";

	const secondaryParts: string[] = [];
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
	].filter(Boolean) as string[];
	for (const part of staffParts) {
		if (!secondaryParts.includes(part)) secondaryParts.push(part);
	}

	const detailsSecondary = cleanDetailText(secondaryParts.join(" / "));
	const details = [detailsPrimary, detailsSecondary].filter(Boolean).join(" / ");

	return {
		details,
		detailsPrimary,
		detailsSecondary,
	};
}

export async function readAnimeCache(): Promise<AnimeCachePayload | null> {
	try {
		const raw = await readFile(animeCachePath, "utf-8");
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.items)) return null;
		return parsed as AnimeCachePayload;
	} catch {
		return null;
	}
}

export async function writeAnimeCache(payload: AnimeCachePayload) {
		await mkdir(path.dirname(animeCachePath), { recursive: true });
		await writeFile(animeCachePath, JSON.stringify(payload, null, 2) + "\n", "utf-8");
}

export function getAnimeCoverDir() {
	return animeCoverDir;
}

export function getAnimeCachePath() {
	return animeCachePath;
}

export async function getBangumiAnimeList(): Promise<BangumiAnimeListResult> {
	const { userId, mode } = siteConfig.bangumi;
	if (mode !== "bangumi" || !userId) {
		return {
			items: fallbackAnimeList,
			state: { source: "fallback", message: "Bangumi 未启用，当前显示示例数据。" },
		};
	}

	const cached = await readAnimeCache();
	if (cached && cached.items.length > 0) {
		return {
			items: cached.items,
			state: {
				source: "cache",
				message: `本地缓存已同步 ${cached.items.length} 条动画记录（${cached.generatedAt}）`,
			},
		};
	}

	return {
		items: fallbackAnimeList,
		state: { source: "fallback", message: "未检测到 anime 缓存，当前显示示例数据。" },
	};
}

export function filterAnimeItems(items: AnimeItem[], filterKey: AnimeFilterKey): AnimeItem[] {
	const filter = animeFilters.find((item) => item.key === filterKey) || animeFilters[0];
	if (filter.type === null) return items;
	return items.filter((item) => item.type === filter.type);
}

export function getAnimePageUrl(filterKey: AnimeFilterKey, page: number): string {
	if (filterKey === "all") {
		return page <= 1 ? "/anime/" : `/anime/page/${page}/`;
	}
	return page <= 1 ? `/anime/${filterKey}/` : `/anime/${filterKey}/page/${page}/`;
}
