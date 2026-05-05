import { siteConfig } from "../config";

export type CollectionType = 1 | 2 | 3;

export type AnimeItem = {
	id: number | string;
	title: string;
	originalTitle: string;
	status: string;
	type: CollectionType;
	date: string;
	episodes: string;
	staff: string;
	cover: string;
};

export type LoadState = {
	source: "bangumi" | "fallback";
	message: string;
};

export const ANIME_PAGE_SIZE = 12;

export const fallbackAnimeList: AnimeItem[] = [
	{
		id: "demo-1",
		title: "乱步奇谭 拉普拉斯的游戏",
		originalTitle: "乱歩奇譚 Game of Laplace",
		status: "看过",
		type: 2,
		date: "2015年7月3日",
		episodes: "11话",
		staff: "岸诚二 / 森田和明",
		cover: "https://lain.bgm.tv/r/400/pic/cover/l/c9/76/278614_jcIuC.jpg",
	},
	{
		id: "demo-2",
		title: "虚构推理",
		originalTitle: "虚構推理",
		status: "看过",
		type: 2,
		date: "2020年1月11日",
		episodes: "12话",
		staff: "后藤圭二 / 本多孝敏",
		cover: "https://lain.bgm.tv/r/400/pic/cover/l/e9/53/289906_6DZN6.jpg",
	},
	{
		id: "demo-3",
		title: "葬送的芙莉莲",
		originalTitle: "葬送のフリーレン",
		status: "想看",
		type: 1,
		date: "2023年9月29日",
		episodes: "28话",
		staff: "斋藤圭一郎 / 长泽礼子",
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

export function pickEpisodes(subject: any): string {
	const raw = subject?.eps ?? subject?.total_episodes;
	if (!raw || Number(raw) <= 0) return "话数未知";
	return `${raw}话`;
}

export function pickStaff(subject: any): string {
	const infobox = Array.isArray(subject?.infobox) ? subject.infobox : [];
	const picks: string[] = [];

	for (const item of infobox) {
		const key = String(item?.key || "");
		if (key === "导演" || key === "监督") {
			const value = Array.isArray(item?.value)
				? item.value.map((entry: any) => entry?.v).filter(Boolean).join(" / ")
				: String(item?.value || "");
			if (value) picks.push(value);
		}
		if (key === "人物设定" || key === "人设" || key === "キャラクターデザイン") {
			const value = Array.isArray(item?.value)
				? item.value.map((entry: any) => entry?.v).filter(Boolean).join(" / ")
				: String(item?.value || "");
			if (value) picks.push(value);
		}
		if (picks.length >= 2) break;
	}

	return picks.length > 0 ? picks.join(" / ") : "制作信息暂缺";
}

const BANGUMI_PAGE_SIZE = 50;
const BANGUMI_MAX_PAGES = 20;

export async function getBangumiAnimeList(): Promise<{
	items: AnimeItem[];
	state: LoadState;
}> {
	const { userId, mode } = siteConfig.bangumi;
	if (mode !== "bangumi" || !userId) {
		return {
			items: fallbackAnimeList,
			state: { source: "fallback", message: "Bangumi 未启用，当前显示示例数据。" },
		};
	}

	const token = import.meta.env.BANGUMI_TOKEN;
	if (!token) {
		return {
			items: fallbackAnimeList,
			state: { source: "fallback", message: "未检测到 BANGUMI_TOKEN，当前显示示例数据。" },
		};
	}

	try {
		const allItems: AnimeItem[] = [];

		for (let page = 0; page < BANGUMI_MAX_PAGES; page += 1) {
			const offset = page * BANGUMI_PAGE_SIZE;
			const response = await fetch(
				`https://api.bgm.tv/v0/users/${encodeURIComponent(userId)}/collections?subject_type=2&limit=${BANGUMI_PAGE_SIZE}&offset=${offset}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
						"User-Agent": "fuwari-personal-blog/0.1",
					},
				},
			);

			if (!response.ok) {
				return {
					items: fallbackAnimeList,
					state: { source: "fallback", message: `Bangumi 请求失败，HTTP ${response.status}。` },
				};
			}

			const payload = await response.json();
			const data = Array.isArray(payload.data) ? payload.data : [];

			const pageItems = data
				.map((item: any): AnimeItem | null => {
					const subject = item.subject || {};
					const type = Number(item.type || 2) as CollectionType;
					if (type !== 1 && type !== 2 && type !== 3) return null;

					const image =
						subject.images?.large || subject.images?.common || subject.images?.medium;

					return {
						id: subject.id || item.subject_id,
						title: subject.name_cn || subject.name || "未命名条目",
						originalTitle: subject.name || subject.name_cn || "Unknown",
						status: collectionStatusMap[type] || "看过",
						type,
						date: formatDate(subject.date),
						episodes: pickEpisodes(subject),
						staff: pickStaff(subject),
						cover: normalizeCover(image),
					};
				})
				.filter(Boolean) as AnimeItem[];

			allItems.push(...pageItems);

			if (data.length < BANGUMI_PAGE_SIZE) {
				break;
			}
		}

		return {
			items: allItems,
			state: { source: "bangumi", message: `已同步 ${allItems.length} 条动画记录` },
		};
	} catch {
		return {
			items: fallbackAnimeList,
			state: { source: "fallback", message: "Bangumi 拉取异常，当前显示示例数据。" },
		};
	}
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
