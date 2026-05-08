import fs from "node:fs";
import path from "node:path";

export type InitialHeroImage = {
	src: string;
	position: string;
	mobilePosition: string;
};

const HERO_DIR = path.join(process.cwd(), "public", "initial-hero");
const SUPPORTED_EXTENSIONS = new Set([".avif", ".webp", ".jpg", ".jpeg", ".png"]);

export function getInitialHeroImages(): InitialHeroImage[] {
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
