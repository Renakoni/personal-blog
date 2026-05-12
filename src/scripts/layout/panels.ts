let floatingPanelsInitialized = false;

function closePanel(panel: Element | null) {
	panel?.classList.add("float-panel-closed");
}

function setClickOutsideToClose(panel: string, ignores: string[]) {
	document.addEventListener("click", event => {
		const panelDom = document.getElementById(panel);
		if (!panelDom) return;
		const tDom = event.target;
		if (!(tDom instanceof Node)) return;
		for (const ig of ignores) {
			const ie = document.getElementById(ig)
			if (ie == tDom || (ie?.contains(tDom))) {
				return;
			}
		}
		closePanel(panelDom);
	});
}

export function closeFloatingPanels() {
	document.querySelectorAll(".float-panel").forEach(closePanel);
}

export function initFloatingPanels() {
	if (floatingPanelsInitialized) return;
	floatingPanelsInitialized = true;
	setClickOutsideToClose("display-setting", ["display-setting", "display-settings-switch"])
	setClickOutsideToClose("nav-menu-panel", ["nav-menu-panel", "nav-menu-switch"])
	setClickOutsideToClose("search-panel", ["search-panel", "search-bar", "search-switch"])
}
