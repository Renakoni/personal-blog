/// <reference types="mdast" />
import katex from "katex";
import { h } from "hastscript";

const tones = new Set([
	"primary",
	"red",
	"amber",
	"green",
	"blue",
	"purple",
	"muted",
]);

const calloutTypes = new Set([
	"note",
	"tip",
	"info",
	"idea",
	"important",
	"warning",
	"caution",
	"danger",
	"proof",
]);

function cleanToken(value, fallback, allowed) {
	const token = String(value || fallback).toLowerCase();
	return allowed.has(token) ? token : fallback;
}

function textFromChildren(children) {
	return children
		.flatMap((child) => {
			if (child.type === "text") return child.value;
			if (child.children) return textFromChildren(child.children);
			return "";
		})
		.join("");
}

function paragraphToFigureImage(child) {
	if (!child || child.tagName !== "p" || !Array.isArray(child.children)) return child;
	const image = child.children.find((node) => node.tagName === "img");
	return image || child;
}

function textFromNode(node) {
	if (!node) return "";
	if (node.type === "text") return node.value || "";
	if (Array.isArray(node.children)) return node.children.map(textFromNode).join("");
	return "";
}

function normalizeLines(value) {
	return String(value || "").replace(/\r\n?/g, "\n");
}

function guessTabLang(label, body) {
	const value = `${label} ${body}`.toLowerCase();
	if (/\b(pnpm|npm|yarn|bun|npx|node|git|cd|mkdir|rm|cp|mv)\b/.test(value)) return "shell";
	if (/\b(import|export|const|let|function|return|=>)\b/.test(body)) return "ts";
	return "text";
}

function splitInlineTabs(value) {
	return normalizeLines(value).split("\n").flatMap((line) => {
		const match = line.match(/^([^=\n]+?)\s*=\s*(.+)$/);
		if (!match) return [];
		const label = match[1].trim();
		const body = match[2].trim();
		return [{ label, body, lang: guessTabLang(label, body) }];
	});
}

function splitSectionTabs(value) {
	const tabs = [];
	let current = null;
	for (const line of normalizeLines(value).split("\n")) {
		const match = line.match(/^\\?==\s+(.+)$/);
		if (match) {
			if (current) {
				const body = current.lines.join("\n").trim();
				tabs.push({ label: current.label, body, lang: guessTabLang(current.label, body) });
			}
			current = { label: match[1].trim(), lines: [] };
			continue;
		}
		current?.lines.push(line);
	}
	if (current) {
		const body = current.lines.join("\n").trim();
		tabs.push({ label: current.label, body, lang: guessTabLang(current.label, body) });
	}
	return tabs.filter((tab) => tab.label);
}

function splitTabs(value) {
	const sectionTabs = splitSectionTabs(value);
	return sectionTabs.length > 0 ? sectionTabs : splitInlineTabs(value);
}

function parseMetricLines(value) {
	return String(value || "")
		.split("\n")
		.map((line) => line.match(/^([^=\n]+?)\s*=\s*(.+)$/))
		.filter(Boolean)
		.map((match) => ({ label: match[1].trim(), value: match[2].trim() }))
		.filter((item) => item.label && item.value);
}

function normalizePercent(value) {
	const number = Number.parseFloat(String(value || "").replace("%", ""));
	if (!Number.isFinite(number)) return "0%";
	return `${Math.max(0, Math.min(100, number))}%`;
}

export function FuwariColorComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "primary", tones);
	return h("span", { class: `fuwari-color fuwari-color--${tone}` }, children);
}

export function FuwariMarkComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "amber", tones);
	return h("span", { class: `fuwari-mark fuwari-mark--${tone}` }, children);
}

export function FuwariBadgeComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "blue", tones);
	return h("span", { class: `fuwari-badge fuwari-badge--${tone}` }, children);
}

export function FuwariCalloutComponent(properties, children) {
	const rawType = cleanToken(properties?.type, "note", calloutTypes);
	const type = rawType === "important" ? "proof" : rawType;
	const title = properties?.title || type.toUpperCase();
	return h("section", { class: `fuwari-callout fuwari-callout--${type}` }, [
		h("div", { class: "fuwari-callout__title" }, String(title)),
		h("div", { class: "fuwari-callout__body" }, children),
	]);
}

export function FuwariAsideComponent(properties, children) {
	const title = properties?.title || "Aside";
	return h("section", { class: "fuwari-aside" }, [
		h("div", { class: "fuwari-aside__title" }, String(title)),
		...children,
	]);
}

export function FuwariEvidenceComponent(properties, children) {
	const label = properties?.label || "Evidence";
	return h("section", { class: "fuwari-evidence" }, [
		h("div", { class: "fuwari-evidence__label" }, String(label)),
		...children,
	]);
}

export function FuwariFigureComponent(properties, children) {
	const caption = properties?.caption || properties?.title || textFromChildren(children);
	const src = properties?.src;
	const alt = properties?.alt || caption || "Image";
	const isPlaceholder = src && String(src).trim().startsWith("./");
	const imageChildren = src && !isPlaceholder ? [h("img", { src, alt, loading: "lazy" })] : children.map(paragraphToFigureImage);
	return h("section", { class: "fuwari-figure" }, [
		h("div", { class: `fuwari-image-frame${isPlaceholder ? " fuwari-image-frame--placeholder" : ""}` }, isPlaceholder ? [h("span", src)] : imageChildren),
		caption ? h("p", { class: "fuwari-figure__caption" }, String(caption)) : null,
	].filter(Boolean));
}

export function FuwariGalleryComponent(properties, children) {
	const caption = properties?.caption || properties?.title || "";
	const items = children.map(paragraphToFigureImage);
	return h("div", { class: "fuwari-gallery" }, [
		h("div", { class: "fuwari-gallery__grid" }, items),
		caption ? h("figcaption", { class: "fuwari-gallery__caption" }, String(caption)) : null,
	].filter(Boolean));
}

export function FuwariVideoComponent(properties, children) {
	const src = properties?.src || properties?.url;
	const title = properties?.title || properties?.caption || "Video player";
	if (!src) {
		return h("div", { class: "hidden" }, 'Invalid video directive. Use ```video with src: https://...');
	}
	return h("section", { class: "fuwari-video" }, [
		h("iframe", {
			src,
			title,
			loading: "lazy",
			allowfullscreen: true,
			allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
		}),
		properties?.caption ? h("p", String(properties.caption)) : null,
		...children,
	].filter(Boolean));
}

export function FuwariTabsComponent(properties, children) {
	const tabs = splitTabs(textFromChildren(children));
	if (tabs.length === 0) return h("div", { class: "hidden" }, 'Invalid tabs block. Use "label = content" lines or "== Tab" sections.');
	const name = `fuwari-tabs-${String(properties?.id || tabs.map((tab) => tab.label).join("-")).toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
	return h("section", { class: "fuwari-tabs" }, [
		...tabs.map((tab, index) => h("input", { id: `${name}-${index}`, name, type: "radio", checked: index === 0 })),
		h("div", { class: "fuwari-tabs-rail", role: "tablist", ariaLabel: "Tabs" }, tabs.map((tab, index) => h("label", { for: `${name}-${index}`, role: "tab" }, tab.label))),
		...tabs.map((tab, index) => h("div", { class: "fuwari-tab-panel", role: "tabpanel", dataTabIndex: String(index) }, [
			tab.lang === "text" ? h("p", tab.body) : h("div", { class: "fuwari-tab-code" }, [h("code", tab.body)]),
		])),
	]);
}

export function FuwariMathComponent(_properties, children) {
	const formula = textFromChildren(children);
	const rendered = katex.renderToString(formula, {
		displayMode: true,
		throwOnError: false,
		strict: false,
	});
	return h("section", { class: "fuwari-math-block" }, [
		h("div", { class: "fuwari-math-label" }, "LaTeX"),
		h("div", { class: "fuwari-math-formula" }, [
			{ type: "raw", value: rendered },
		]),
	]);
}

function metricNumbers(properties, kind) {
	const fallbackMax = kind === "rating" ? 5 : 100;
	const value = Number.parseFloat(properties?.value || "0");
	const max = Number.parseFloat(properties?.max || String(fallbackMax));
	const safeValue = Number.isFinite(value) ? value : 0;
	const safeMax = Number.isFinite(max) && max > 0 ? max : fallbackMax;
	return { value: safeValue, max: safeMax, percent: `${Math.round(Math.max(0, Math.min(1, safeValue / safeMax)) * 100)}%` };
}

function ratingStars(value, max) {
	const count = Math.ceil(max);
	const filled = Math.round(Math.max(0, Math.min(1, value / max)) * count);
	return Array.from({ length: count }, (_, index) => h("span", { class: index >= filled ? "star-empty" : undefined }, "★"));
}

export function FuwariRatingComponent(properties, children) {
	const label = properties?.label || "Rating";
	const { value, max, percent } = metricNumbers(properties, "rating");
	return h("section", { class: "fuwari-metric fuwari-metric--rating", style: `--metric-progress: ${percent};` }, [
		h("div", { class: "fuwari-metric-topline" }, [h("span", "Rating"), h("strong", [String(value), h("small", `/ ${max}`)])]),
		h("div", { class: "fuwari-metric-main" }, [
			h("h3", String(label)),
			h("div", { class: "fuwari-rating-stars", ariaLabel: `${value} out of ${max}` }, ratingStars(value, max)),
		]),
		h("div", { class: "fuwari-metric-track", ariaHidden: "true" }, [h("span")]),
		properties?.note ? h("p", String(properties.note)) : null,
		...children,
	].filter(Boolean));
}

export function FuwariStatComponent(properties, children) {
	const label = properties?.label || "Stat";
	const { value, max, percent } = metricNumbers(properties, "stat");
	return h("section", { class: "fuwari-metric fuwari-metric--stat", style: `--metric-progress: ${percent};` }, [
		h("div", { class: "fuwari-metric-topline" }, [h("span", "Stat"), h("strong", [String(value), h("small", `/ ${max}`)])]),
		h("div", { class: "fuwari-metric-main" }, [h("h3", String(label))]),
		h("div", { class: "fuwari-metric-track", ariaHidden: "true" }, [h("span")]),
		properties?.note ? h("p", String(properties.note)) : null,
		...children,
	].filter(Boolean));
}
