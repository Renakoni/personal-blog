<script lang="ts">
import Icon from "@iconify/svelte/dist/OfflineIcon.svelte";
import { navbarIcons } from "./navbar-icons";
import { url } from "@utils/url-utils.ts";
import { onMount, tick } from "svelte";
import type { SearchResult } from "@/global";

type CommandItem = {
	kind: "command";
	title: string;
	description: string;
	href: string;
	icon: string;
	badge: string;
	external?: boolean;
};

type PostItem = {
	kind: "post";
	title: string;
	description: string;
	href: string;
};

type PaletteItem = CommandItem | PostItem;

let keyword = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let isOpen = false;
let activeIndex = 0;
let inputEl: HTMLInputElement;
let panelEl: HTMLDivElement;
let searchTimeout: ReturnType<typeof setTimeout>;
let isCompactScreen = false;

const commandItems: CommandItem[] = [
	{
		kind: "command",
		title: "Blog",
		description: "Open the card article feed",
		href: url("/blog/"),
		icon: "material-symbols:article-outline-rounded",
		badge: "BLOG",
	},
	{
		kind: "command",
		title: "Anime Archive",
		description: "Open the Bangumi watch dossier",
		href: url("/anime/"),
		icon: "material-symbols:movie-outline",
		badge: "ANI",
	},
	{
		kind: "command",
		title: "Projects",
		description: "Inspect experiments and build logs",
		href: url("/projects/"),
		icon: "material-symbols:code-rounded",
		badge: "LAB",
	},
	{
		kind: "command",
		title: "Archive",
		description: "Browse indexed posts by timeline",
		href: url("/archive/"),
		icon: "material-symbols:inventory-2-outline-rounded",
		badge: "IDX",
	},
	{
		kind: "command",
		title: "About",
		description: "Open profile and identity record",
		href: url("/about/"),
		icon: "material-symbols:person-outline-rounded",
		badge: "ID",
	},
	{
		kind: "command",
		title: "GitHub",
		description: "Jump to external source repository",
		href: "https://github.com/Renakoni",
		icon: "fa6-brands:github",
		badge: "EXT",
		external: true,
	},
];

const normalize = (value: string) => value.trim().toLowerCase();

$: normalizedKeyword = normalize(keyword);
$: filteredCommands = normalizedKeyword
	? commandItems.filter((item) =>
			`${item.title} ${item.description} ${item.badge}`
				.toLowerCase()
				.includes(normalizedKeyword),
		)
	: commandItems;
$: visibleCommands = !normalizedKeyword && isCompactScreen
	? filteredCommands.slice(0, 5)
	: filteredCommands;
$: postItems = result.map<PostItem>((item) => ({
	kind: "post",
	title: item.meta.title,
	description: item.excerpt,
	href: item.url,
}));
$: hasPostSearchQuery = !!normalizedKeyword;
$: showDevPostNotice = import.meta.env.DEV && hasPostSearchQuery;
$: showPostSearchUnavailable = !import.meta.env.DEV && hasPostSearchQuery && initialized && !pagefindLoaded;
$: paletteItems = [...visibleCommands, ...postItems];
$: if (activeIndex >= paletteItems.length) {
	activeIndex = Math.max(0, paletteItems.length - 1);
}

const focusInput = async () => {
	await tick();
	inputEl?.focus();
	inputEl?.select();
};

const syncPanelVisibility = (show: boolean) => {
	isOpen = show;
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed", !show);
};

const openPalette = async () => {
	syncPanelVisibility(true);
	activeIndex = 0;
	await focusInput();
};

const closePalette = () => {
	syncPanelVisibility(false);
};

const togglePanel = () => {
	if (isOpen) {
		closePalette();
	} else {
		void openPalette();
	}
};

const runItem = (item: PaletteItem | undefined) => {
	if (!item) return;
	closePalette();
	if (item.kind === "command" && item.external) {
		window.open(item.href, "_blank", "noopener,noreferrer");
		return;
	}
	window.location.href = item.href;
};

const search = async (searchKeyword: string): Promise<void> => {
	if (!searchKeyword) {
		result = [];
		isSearching = false;
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(searchKeyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (!import.meta.env.DEV) {
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
	} catch (error) {
		console.error("Search error:", error);
		result = [];
	} finally {
		isSearching = false;
	}
};

const handleKeydown = (event: KeyboardEvent) => {
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
		event.preventDefault();
		void openPalette();
		return;
	}

	if (!isOpen) return;

	if (event.key === "Escape") {
		event.preventDefault();
		closePalette();
		return;
	}

	if (event.key === "ArrowDown") {
		event.preventDefault();
		activeIndex = paletteItems.length
			? (activeIndex + 1) % paletteItems.length
			: 0;
		return;
	}

	if (event.key === "ArrowUp") {
		event.preventDefault();
		activeIndex = paletteItems.length
			? (activeIndex - 1 + paletteItems.length) % paletteItems.length
			: 0;
		return;
	}

	if (event.key === "Enter") {
		event.preventDefault();
		runItem(paletteItems[activeIndex]);
	}
};

const handleInput = () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		if (initialized) {
			void search(keyword);
		}
	}, 120);
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		if (keyword) void search(keyword);
	};

	const updateCompactScreen = () => {
		isCompactScreen = window.matchMedia("(max-width: 767px)").matches;
	};

	updateCompactScreen();
	window.addEventListener("resize", updateCompactScreen);
	document.addEventListener("keydown", handleKeydown);

	const observer = new MutationObserver(() => {
		isOpen = !panelEl?.classList.contains("float-panel-closed");
	});
	if (panelEl) {
		observer.observe(panelEl, { attributes: true, attributeFilter: ["class"] });
	}

	if (import.meta.env.DEV) {
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", initializeSearch);
		document.addEventListener("pagefindloaderror", initializeSearch);

		setTimeout(() => {
			if (!initialized) {
				initializeSearch();
			}
		}, 2000);
	}

	return () => {
		clearTimeout(searchTimeout);
		window.removeEventListener("resize", updateCompactScreen);
		document.removeEventListener("keydown", handleKeydown);
		document.removeEventListener("pagefindready", initializeSearch);
		document.removeEventListener("pagefindloaderror", initializeSearch);
		observer.disconnect();
	};
});
</script>

<div class="relative">
	<button
		id="search-bar"
		type="button"
		on:click={openPalette}
		aria-label="Open Command Palette"
		class="hidden lg:flex command-trigger transition-all items-center h-11 mr-2 rounded-lg px-3 gap-2
		bg-black/[0.04] hover:bg-black/[0.06] focus-visible:bg-black/[0.06]
		dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:bg-white/10"
	>
		<Icon icon={navbarIcons["material-symbols:search"]} class="text-[1.2rem] text-black/45 dark:text-white/45" />
		<span class="command-trigger__key">⌘K</span>
	</button>

	<button
		on:click={togglePanel}
		aria-label="Search Panel"
		id="search-switch"
		class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
	>
		<Icon icon={navbarIcons["material-symbols:search"]} class="text-[1.25rem]"></Icon>
	</button>

	<div
		bind:this={panelEl}
		id="search-panel"
		class="float-panel float-panel-closed search-panel command-palette fixed lg:absolute w-[calc(100vw-1.5rem)] md:w-[34rem]
		top-24 left-3 right-3 lg:left-auto lg:right-0 shadow-2xl rounded-2xl p-2"
	>
		<div class="command-palette__header">
			<div>
				<div class="system-label">Command Center</div>
				<div class="command-palette__subtitle">Jump to pages or search indexed posts</div>
			</div>
			<div class="command-palette__shortcut">ESC</div>
		</div>

		<div id="search-bar-inside" class="command-palette__input-wrap">
			<Icon icon={navbarIcons["material-symbols:terminal-rounded"]} class="command-palette__input-icon" />
			<input
				bind:this={inputEl}
				placeholder="Jump to a page or search posts..."
				bind:value={keyword}
				on:input={handleInput}
				class="command-palette__input"
				role="combobox"
				aria-expanded={isOpen}
				aria-controls="command-palette-results"
			/>
			{#if isSearching}
				<span class="command-palette__status">SYNC</span>
			{:else}
				<span class="command-palette__status">↵ RUN</span>
			{/if}
		</div>

		<div id="command-palette-results" class="command-palette__results" role="listbox">
			{#if visibleCommands.length}
				<div class="command-palette__section">Quick Jump</div>
				{#each visibleCommands as item, index}
					<button
						type="button"
						class:command-palette__row--active={activeIndex === index}
						class="command-palette__row"
						on:mouseenter={() => (activeIndex = index)}
						on:click={() => runItem(item)}
						role="option"
						aria-selected={activeIndex === index}
					>
						<span class="command-palette__icon"><Icon icon={navbarIcons[item.icon]} /></span>
						<span class="command-palette__copy">
							<span class="command-palette__title">{item.title}</span>
							<span class="command-palette__desc">{item.description}</span>
						</span>
						<span class="command-palette__badge">{item.badge}</span>
					</button>
				{/each}
			{/if}

				{#if hasPostSearchQuery}
					<div class="command-palette__section">Post Search</div>
					{#if showDevPostNotice}
						<div class="command-palette__notice">
							<div class="system-label">Dev Index Offline</div>
							<p>Full-text post search is available after build preview. Quick Jump still works here.</p>
						</div>
					{:else if showPostSearchUnavailable}
						<div class="command-palette__notice">
							<div class="system-label">Post Index Unavailable</div>
							<p>Pagefind did not load, so only Quick Jump results are available.</p>
						</div>
					{/if}
				{/if}

				{#if postItems.length}
					{#if !hasPostSearchQuery}
						<div class="command-palette__section">Post Search</div>
					{/if}
				{#each postItems as item, index}
					{@const itemIndex = visibleCommands.length + index}
					<button
						type="button"
						class:command-palette__row--active={activeIndex === itemIndex}
						class="command-palette__row"
						on:mouseenter={() => (activeIndex = itemIndex)}
						on:click={() => runItem(item)}
						role="option"
						aria-selected={activeIndex === itemIndex}
					>
						<span class="command-palette__icon"><Icon icon={navbarIcons["material-symbols:article-outline-rounded"]} /></span>
						<span class="command-palette__copy">
							<span class="command-palette__title">{item.title}</span>
							<span class="command-palette__desc">{@html item.description}</span>
						</span>
						<span class="command-palette__badge">POST</span>
					</button>
				{/each}
			{/if}

			{#if !paletteItems.length && !showDevPostNotice && !showPostSearchUnavailable}
				<div class="command-palette__empty">
					<div class="system-label">No Signal</div>
					<p>No matching command or indexed post.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
input:focus {
	outline: 0;
}
.search-panel {
	max-height: calc(100vh - 100px);
	overflow-y: auto;
}
</style>
