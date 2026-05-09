#!/usr/bin/env node
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const rawCoverDir = path.join(projectRoot, "raw_cover");
const outputRoot = path.join(projectRoot, "public", "optimized", "covers");
const supportedExtensions = new Set([".avif", ".webp", ".jpg", ".jpeg", ".png"]);

const profiles = {
	hero: {
		widths: [640, 960, 1280, 1600, 1920],
		avifQuality: 52,
		webpQuality: 80,
		fallbackQuality: 86,
	},
	cover: {
		widths: [480, 768, 1024, 1280],
		avifQuality: 50,
		webpQuality: 78,
		fallbackQuality: 84,
	},
};

function getProfile(fileName) {
	return fileName.startsWith("hero-") || fileName === "about-cover.png" ? profiles.hero : profiles.cover;
}

function getSlug(fileName) {
	return path.basename(fileName, path.extname(fileName));
}

async function exists(filePath) {
	try {
		await stat(filePath);
		return true;
	} catch {
		return false;
	}
}

async function optimizeImage(fileName) {
	const inputPath = path.join(rawCoverDir, fileName);
	const slug = getSlug(fileName);
	const profile = getProfile(fileName);
	const outputDir = path.join(outputRoot, slug);
	await mkdir(outputDir, { recursive: true });

	const image = sharp(inputPath, { animated: false }).rotate();
	const metadata = await image.metadata();
	const sourceWidth = metadata.width || Math.max(...profile.widths);
	const widths = profile.widths.filter((width) => width <= sourceWidth);
	const targetWidths = widths.length > 0 ? widths : [sourceWidth];

	for (const width of targetWidths) {
		const resized = image.clone().resize({ width, withoutEnlargement: true });
		await resized
			.clone()
			.avif({ quality: profile.avifQuality, effort: 6 })
			.toFile(path.join(outputDir, `${width}.avif`));
		await resized
			.clone()
			.webp({ quality: profile.webpQuality, effort: 6 })
			.toFile(path.join(outputDir, `${width}.webp`));
	}

	const fallbackWidth = Math.max(...targetWidths);
	await image
		.clone()
		.resize({ width: fallbackWidth, withoutEnlargement: true })
		.webp({ quality: profile.fallbackQuality, effort: 6 })
		.toFile(path.join(outputDir, "fallback.webp"));

	console.log(`optimized ${fileName} -> public/optimized/covers/${slug}`);
}

if (!(await exists(rawCoverDir))) {
	console.log("raw_cover does not exist; skipping cover optimization.");
	process.exit(0);
}

const entries = await readdir(rawCoverDir, { withFileTypes: true });
const images = entries
	.filter((entry) => entry.isFile())
	.map((entry) => entry.name)
	.filter((fileName) => supportedExtensions.has(path.extname(fileName).toLowerCase()))
	.sort((a, b) => a.localeCompare(b, "en"));

if (images.length === 0) {
	console.log("raw_cover contains no supported images; skipping cover optimization.");
	process.exit(0);
}

for (const image of images) {
	await optimizeImage(image);
}
