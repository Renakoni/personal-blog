import { visit } from "unist-util-visit";

const inlinePattern = /(\|\|([^|]+)\|\||\+\+([^+]+)\+\+)/g;

function inlineNode(tagName, value) {
	return {
		type: "text",
		value,
		data: {
			hName: tagName,
			hProperties: tagName === "spoiler" ? { tabIndex: 0 } : undefined,
		},
	};
}

function splitInlineText(value) {
	const nodes = [];
	let cursor = 0;
	for (const match of value.matchAll(inlinePattern)) {
		if (match.index > cursor) nodes.push({ type: "text", value: value.slice(cursor, match.index) });
		if (match[2]) nodes.push(inlineNode("spoiler", match[2]));
		if (match[3]) nodes.push(inlineNode("u", match[3]));
		cursor = match.index + match[0].length;
	}
	if (cursor < value.length) nodes.push({ type: "text", value: value.slice(cursor) });
	return nodes;
}

export function remarkAdminInline() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			inlinePattern.lastIndex = 0;
			if (!parent || typeof index !== "number" || !inlinePattern.test(node.value)) return;
			inlinePattern.lastIndex = 0;
			parent.children.splice(index, 1, ...splitInlineText(node.value));
		});
	};
}
