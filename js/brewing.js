(() => {
	"use strict";

	const POTION_COLORS = {
		absorption: "#ffcc33",
		blindness: "#1b1b1b",
		conduit_power: "#1ca9c9",
		darkness: "#0c4a4a",
		glowing: "#fff176",
		haste: "#ffd700",
		hero_of_the_village: "#17ce6a",
		hunger: "#6b4226",
		levitation: "#a85cc1",
		luck: "#ffaa00",
		mining_fatigue: "#1e5f5f",
		nausea: "#8a9a5b",
		resistance: "#708090",
		saturation: "#c68e17",
		wither: "#2b2b2b",
	};

	function applyPotionColors(root) {
		root.querySelectorAll("bb-potion[data-effect]").forEach((el) => {
			const color = POTION_COLORS[el.dataset.effect];
			if (color) el.style.setProperty("--potion-color", color);
		});
	}

	function setup() {
		const root = document.getElementById("bb-recipes-root");
		if (!root) return;

		applyPotionColors(root);

		const expandBtn = document.getElementById("bb-expand-all");
		const collapseBtn = document.getElementById("bb-collapse-all");

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
