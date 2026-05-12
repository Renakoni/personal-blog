/// <reference types="mdast" />
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

export function FuwariColorComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "primary", tones);
	return h("span", { class: `fuwari-color fuwari-color--${tone}` }, children);
}

export function FuwariMarkComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "amber", tones);
	return h("mark", { class: `fuwari-mark fuwari-mark--${tone}` }, children);
}

export function FuwariBadgeComponent(properties, children) {
	const tone = cleanToken(properties?.tone || properties?.color, "blue", tones);
	return h("span", { class: `fuwari-badge fuwari-badge--${tone}` }, children);
}

export function FuwariCalloutComponent(properties, children) {
	const type = cleanToken(properties?.type, "note", calloutTypes);
	const title = properties?.title || type.toUpperCase();
	return h("aside", { class: `fuwari-callout fuwari-callout--${type}` }, [
		h("div", { class: "fuwari-callout__title" }, String(title)),
		h("div", { class: "fuwari-callout__body" }, children),
	]);
}

export function FuwariAsideComponent(properties, children) {
	const title = properties?.title || "Aside";
	return h("aside", { class: "fuwari-aside" }, [
		h("div", { class: "fuwari-aside__title" }, String(title)),
		...children,
	]);
}

export function FuwariEvidenceComponent(properties, children) {
	const label = properties?.label || "Evidence";
	return h("aside", { class: "fuwari-evidence" }, [
		h("div", { class: "fuwari-evidence__label" }, String(label)),
		...children,
	]);
}

export function FuwariFigureComponent(properties, children) {
	const caption = properties?.caption || properties?.title || textFromChildren(children);
	const imageChildren = children.map(paragraphToFigureImage);
	return h("figure", { class: "fuwari-figure" }, [
		...imageChildren,
		caption ? h("figcaption", { class: "fuwari-figure__caption" }, String(caption)) : null,
	].filter(Boolean));
}

export function FuwariGalleryComponent(properties, children) {
	const caption = properties?.caption || properties?.title || "";
	const items = children.map(paragraphToFigureImage);
	return h("figure", { class: "fuwari-gallery" }, [
		h("div", { class: "fuwari-gallery__grid" }, items),
		caption ? h("figcaption", { class: "fuwari-gallery__caption" }, String(caption)) : null,
	].filter(Boolean));
}

export function FuwariVideoComponent(properties, children) {
	const src = properties?.src || properties?.url;
	const title = properties?.title || "Embedded video";
	if (!src) {
		return h("div", { class: "hidden" }, 'Invalid video directive. Use ::video{src="https://..."}');
	}
	return h("figure", { class: "fuwari-video" }, [
		h("div", { class: "fuwari-video__frame" }, [
			h("iframe", {
				src,
				title,
				loading: "lazy",
				allowfullscreen: true,
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
			}),
		]),
		properties?.caption ? h("figcaption", { class: "fuwari-video__caption" }, String(properties.caption)) : null,
		...children,
	].filter(Boolean));
}
