(() => {
	"use strict";

	const API_BASE = "https://api.modrinth.com/v2/project/";

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function renderChangelog(raw) {
		const lines = raw.replace(/\r\n/g, "\n").split("\n");
		const htmlParts = [];
		let listOpen = false;

		function closeList() {
			if (listOpen) {
				htmlParts.push("</ul>");
				listOpen = false;
			}
		}

		function inline(text) {
			return escapeHtml(text)
				.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
				.replace(/__(.+?)__/g, "<b>$1</b>")
				.replace(/(?:^|[^*])\*([^*]+)\*(?!\*)/g, (m, p1) => m.replace(`*${p1}*`, `<i>${p1}</i>`));
		}

		lines.forEach(line => {
			const trimmed = line.trim();
			if (!trimmed) { closeList(); return; }

			const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
			if (heading) {
				closeList();
				htmlParts.push(`<p><b>${inline(heading[1])}</b></p>`);
				return;
			}

			const bullet = trimmed.match(/^[-*]\s+(.*)$/);
			if (bullet) {
				if (!listOpen) { htmlParts.push("<ul>"); listOpen = true; }
				htmlParts.push(`<li>${inline(bullet[1])}</li>`);
				return;
			}

			closeList();
			htmlParts.push(`<p>${inline(trimmed)}</p>`);
		});
		closeList();
		return htmlParts.join("");
	}

	function existingVersionNumbers(list, projectId) {
		const known = new Set();
		list.querySelectorAll(`.changelog-entry[data-project="${projectId}"] h3`).forEach(h3 => {
			known.add(h3.textContent.trim().replace(/^v/i, ""));
		});
		return known;
	}

	function ensureFilterOption(source) {
		const optgroups = document.querySelectorAll("#changelog-filter optgroup");
		let projectGroup = null;
		optgroups.forEach(g => { if (g.label === "Project") projectGroup = g; });
		if (!projectGroup) return;
		if (projectGroup.querySelector(`option[value="${source.id}"]`)) return;
		const opt = document.createElement("option");
		opt.value = source.id;
		opt.textContent = source.badge;
		projectGroup.appendChild(opt);
	}

	function statusOf(version) {
		return ["release", "beta", "alpha"].includes(version.version_type) ? version.version_type : "release";
	}

	function isBig(source, version) {
		const list = (window.CHANGELOG_BIG_VERSIONS && window.CHANGELOG_BIG_VERSIONS[source.id]) || [];
		return list.includes(version.version_number);
	}

	function buildEntry(source, version) {
		const article = document.createElement("article");
		article.className = "changelog-entry";
		article.dataset.project = source.id;
		article.dataset.status = statusOf(version);
		article.dataset.big = isBig(source, version) ? "true" : "false";

		const changelogText = (version.changelog || "").trim();

		article.innerHTML = `
			<div class="changelog-meta">
				<time class="changelog-date" datetime="${escapeHtml(version.date_published || "")}"></time>
				<span class="badge">${escapeHtml(source.badge)}</span>
			</div>
			<h3>v${escapeHtml(version.version_number)}</h3>
			${changelogText ? renderChangelog(changelogText) : ""}
		`;
		return article;
	}

	async function syncSource(list, source) {
		let versions;
		try {
			const res = await fetch(`${API_BASE}${encodeURIComponent(source.slug)}/version`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			versions = await res.json();
		} catch (err) {
			console.warn(`[changelog-auto-sync] échec pour "${source.slug}" :`, err);
			return 0;
		}
		if (!Array.isArray(versions) || versions.length === 0) return 0;

		const known = existingVersionNumbers(list, source.id);
		let added = 0;
		versions.forEach(version => {
			if (!version || !version.version_number) return;
			if (known.has(version.version_number)) return;
			list.appendChild(buildEntry(source, version));
			known.add(version.version_number);
			added++;
		});
		if (added > 0) ensureFilterOption(source);
		return added;
	}

	async function run() {
		const list = document.getElementById("changelog-list");
		const sources = window.CHANGELOG_SOURCES || [];
		if (!list || sources.length === 0) return;

		const results = await Promise.all(sources.map(source => syncSource(list, source)));
		const totalAdded = results.reduce((a, b) => a + b, 0);
		if (totalAdded > 0 && window.ChangelogUI) {
			window.ChangelogUI.refresh();
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run);
	} else {
		run();
	}
})();
