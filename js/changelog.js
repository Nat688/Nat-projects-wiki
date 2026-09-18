(() => {
	"use strict";

	const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	const STATUS_VALUES = ["alpha", "beta", "release"];
	const FILTER_STORAGE_KEY = "changelog-filter-value";

	const state = { list: null, filter: null, countEl: null, emptyEl: null, bound: false };

	function restoreFilter() {
		if (!state.filter) return;
		let stored;
		try { stored = localStorage.getItem(FILTER_STORAGE_KEY); } catch (e) { return; }
		if (!stored) return;
		const optionExists = Array.from(state.filter.options).some(o => o.value === stored);
		if (optionExists) state.filter.value = stored;
	}

	function saveFilter() {
		if (!state.filter) return;
		try { localStorage.setItem(FILTER_STORAGE_KEY, state.filter.value); } catch (e) {}
	}
	
	function localizeDates() {
		document.querySelectorAll(".changelog-date").forEach(el => {
			const iso = el.getAttribute("datetime");
			if (!iso) return;
			const date = new Date(iso);
			if (isNaN(date.getTime())) return;
			const month = MONTHS[date.getMonth()];
			const day = date.getDate();
			const year = date.getFullYear();
			const hour = date.getHours();
			const minutes = String(date.getMinutes()).padStart(2, "0");
			const offsetMin = -date.getTimezoneOffset();
			const sign = offsetMin >= 0 ? "+" : "-";
			const abs = Math.abs(offsetMin);
			const offH = Math.floor(abs / 60);
			const offM = abs % 60;
			const offsetLabel = offM === 0 ? `UTC${sign}${offH}` : `UTC${sign}${offH}:${String(offM).padStart(2, "0")}`;
			el.textContent = `${month} ${day}, ${year} - ${hour}:${minutes} (${offsetLabel})`;
		});
	}

	function sortEntries() {
		if (!state.list) return;
		const entries = Array.from(state.list.querySelectorAll(".changelog-entry"));
		entries.sort((a, b) => {
			const da = a.querySelector("time")?.getAttribute("datetime") || "";
			const db = b.querySelector("time")?.getAttribute("datetime") || "";
			return db.localeCompare(da);
		});
		entries.forEach(entry => state.list.appendChild(entry));
	}

	function applyFilter() {
		if (!state.list || !state.filter) return;
		const value = state.filter.value;
		let visible = 0;
		state.list.querySelectorAll(".changelog-entry").forEach(entry => {
			const isBig = entry.dataset.big === "true";
			const project = entry.dataset.project;
			const status = entry.dataset.status;
			let show;
			if (value === "all") show = true;
			else if (value === "big") show = isBig;
			else if (STATUS_VALUES.includes(value)) show = status === value;
			else show = project === value;
			entry.classList.toggle("changelog-hidden", !show);
			if (show) visible++;
		});
		if (state.countEl) {
			state.countEl.textContent = visible + (visible === 1 ? " update" : " updates");
		}
		if (state.emptyEl) {
			state.emptyEl.hidden = visible !== 0;
		}
	}

	function refresh() {
		localizeDates();
		sortEntries();
		restoreFilter();
		applyFilter();
	}

	function onFilterChange() {
		saveFilter();
		applyFilter();
	}

	function setup() {
		state.list = document.getElementById("changelog-list");
		state.filter = document.getElementById("changelog-filter");
		state.countEl = document.getElementById("changelog-count");
		state.emptyEl = document.getElementById("changelog-empty");
		if (!state.list || !state.filter) return;
		if (!state.bound) {
			state.filter.addEventListener("change", onFilterChange);
			state.bound = true;
		}
		refresh();
	}

	window.ChangelogUI = { refresh };

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", setup);
	} else {
		setup();
	}
})();
