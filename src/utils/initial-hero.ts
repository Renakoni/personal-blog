import fs from "node:fs";
import path from "node:path";

export type InitialHeroImage = {
	name?: string;
	avif?: string;
	webp?: string;
	src: string;
	position: string;
	mobilePosition: string;
};

const HERO_DIR = path.join(process.cwd(), "public", "initial-hero");
const OPTIMIZED_COVER_DIR = path.join(process.cwd(), "public", "optimized", "covers");
const SUPPORTED_EXTENSIONS = new Set([".avif", ".webp", ".jpg", ".jpeg", ".png"]);

function getOptimizedHeroImages(): InitialHeroImage[] {
	if (!fs.existsSync(OPTIMIZED_COVER_DIR)) {
		return [];
	}

	return fs
		.readdirSync(OPTIMIZED_COVER_DIR, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((name) => fs.existsSync(path.join(OPTIMIZED_COVER_DIR, name, "fallback.webp")))
		.sort((a, b) => a.localeCompare(b, "en"))
		.map((name) => ({
			name,
			avif: [640, 960, 1280, 1600, 1920].map((width) => `/optimized/covers/${name}/${width}.avif ${width}w`).join(", "),
			webp: [640, 960, 1280, 1600, 1920].map((width) => `/optimized/covers/${name}/${width}.webp ${width}w`).join(", "),
			src: `/optimized/covers/${name}/fallback.webp`,
			position: "center",
			mobilePosition: "center",
		}));
}

function getLegacyHeroImages(): InitialHeroImage[] {
	if (!fs.existsSync(HERO_DIR)) {
		return [];
	}

	return fs
		.readdirSync(HERO_DIR, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) => SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
		.sort((a, b) => a.localeCompare(b, "en"))
		.map((fileName) => ({
			src: `/initial-hero/${fileName}`,
			position: "center",
			mobilePosition: "center",
		}));
}

export function getInitialHeroImages(): InitialHeroImage[] {
	const optimizedImages = getOptimizedHeroImages();
	return optimizedImages.length > 0 ? optimizedImages : getLegacyHeroImages();
}
