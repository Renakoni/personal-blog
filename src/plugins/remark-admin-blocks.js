const specialLanguages = new Set(["note", "warning", "proof", "image", "video", "github", "tabs", "rating", "stat", "fuwari-latex"]);

function normalizeGithubRepo(value) {
	const trimmed = String(value || "")
		.trim()
		.replace(/^https?:\/\/github\.com\//i, "")
		.replace(/^github\.com\//i, "")
		.replace(/\.git$/i, "");
	const repo = trimmed.split(/[?#]/)[0].split("/").slice(0, 2).join("/");
	return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ? repo : "";
}

function parseKeyValueLines(value) {
	return String(value || "")
		.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((line) => line.match(/^([^=:\n]+?)\s*[:=]\s*(.+)$/))
		.filter(Boolean)
		.map((match) => ({ key: match[1].trim(), value: match[2].trim() }))
		.filter((item) => item.key && item.value);
}

function parseFields(value) {
	return Object.fromEntries(parseKeyValueLines(value).map((item) => [item.key.toLowerCase(), item.value]));
}

function textNode(value) {
	return { type: "text", value };
}

function paragraph(value) {
	return { type: "paragraph", children: [textNode(value)] };
}

function elementNode(name, properties = {}, children = []) {
	return {
		type: "paragraph",
		data: { hName: name, hProperties: properties },
		children,
	};
}

function divNode(properties = {}, children = []) {
	return {
		type: "paragraph",
		data: { hName: "div", hProperties: properties },
		children,
	};
}

function imageNode(src, alt = "") {
	return { type: "image", url: src, alt, title: null };
}

function imageFigureNode(src, alt = "", caption = "") {
	return {
		type: "paragraph",
		data: { hName: "div", hProperties: { class: "fuwari-figure" } },
		children: [
			imageNode(src, alt),
			...(caption ? [{ type: "html", value: `<figcaption class="fuwari-figure__caption">${caption}</figcaption>` }] : []),
		],
	};
}

function adminBlockNode(node) {
	const language = String(node.lang || "").toLowerCase();
	const value = String(node.value || "").trim();

	if (!specialLanguages.has(language)) return node;

	if (language === "fuwari-latex") {
		return elementNode("latex", {}, [textNode(value)]);
	}

	if (language === "github") {
		const repo = normalizeGithubRepo(value.split("\n").find((line) => line.trim()) || "");
		return repo ? elementNode("github", { repo }, []) : node;
	}

	if (language === "image") {
		const fields = parseFields(value);
		if (!fields.src) return node;
		return imageFigureNode(fields.src, fields.alt || fields.caption || "", fields.caption || fields.alt || "");
	}

	if (language === "video") {
		const fields = parseFields(value);
		return fields.src ? elementNode("video", { src: fields.src, caption: fields.note || "" }, []) : node;
	}

	if (language === "tabs") {
		return elementNode("tabs", {}, [textNode(value)]);
	}

	if (language === "rating") {
		return elementNode("rating", parseFields(value), []);
	}

	if (language === "stat") {
		return elementNode("stat", parseFields(value), []);
	}

	const titleMatch = value.match(/^title\s*:\s*(.+)$/im);
	const body = value
		.split("\n")
		.filter((line) => !/^title\s*:/i.test(line.trim()))
		.join("\n")
		.trim();
	const type = language === "proof" ? "proof" : language;
	const title = titleMatch?.[1]?.trim() || (language === "proof" ? "PROOF" : language.toUpperCase());
	return divNode({ className: ["fuwari-callout", `fuwari-callout--${type}`] }, [
		divNode({ className: ["fuwari-callout__title"] }, [textNode(title)]),
		divNode({ className: ["fuwari-callout__body"] }, body ? [paragraph(body)] : []),
	]);
}

export function remarkAdminBlocks() {
	return (tree) => {
		function walk(parent) {
			if (!parent || !Array.isArray(parent.children)) return;
			parent.children = parent.children.map((child) => {
				if (child.type === "code") return adminBlockNode(child);
				walk(child);
				return child;
			});
		}
		walk(tree);
	};
}
