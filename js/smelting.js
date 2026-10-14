(() => {
	"use strict";
	function setup() {
		const root = document.getElementById("bf-recipes-root");
		if (!root) return;
		const expandBtn = document.getElementById("bf-expand-all");
		const collapseBtn = document.getElementById("bf-collapse-all");
		if (expandBtn) {
			expandBtn.addEventListener("click", () => {
				root.querySelectorAll(".recipe-group").forEach(g => { g.open = true; });
			});
		}
		if (collapseBtn) {
			collapseBtn.addEventListener("click", () => {
				root.querySelectorAll(".recipe-group").forEach(g => { g.open = false; });
			});
		}
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", setup);
	} else {
		setup();
	}
})();
