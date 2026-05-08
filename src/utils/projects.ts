import type { Icon } from "astro-icon/components";

export type Project = {
	slug: string;
	name: string;
	category: string;
	status: string;
	role: string;
	description: string;
	tags: string[];
	link: string;
	icon: Parameters<typeof Icon>[0]["name"];
	image: string;
};

export const projects: Project[] = [
	{
		slug: "fuwari-personal-os",
		name: "Fuwari Personal OS",
		category: "Site",
		status: "ACTIVE BUILD",
		role: "Design / Frontend / Content System",
		description: "把个人博客改造成二次元审美驱动的技术档案站：主页、文章、动画记录、项目展示都围绕同一套个人世界观重组。",
		tags: ["Astro", "TypeScript", "Personal OS", "视觉重构中"],
		link: "/",
		icon: "material-symbols:article-outline",
		image: "/about-cover.png",
	},
	{
		slug: "anime-shelf",
		name: "Anime Shelf",
		category: "Archive",
		status: "CURATED ARCHIVE",
		role: "Data Curation / Interface Design",
		description: "不是评分表，而是一个持续记录观看痕迹的动画档案库：状态筛选、分页和个人收藏感优先于普通列表效率。",
		tags: ["Anime", "Archive", "个人记录", "仍在补完"],
		link: "/anime/",
		icon: "material-symbols:movie-outline",
		image: "",
	},
];
