document.querySelectorAll(".copy-command").forEach(command => {
	command.addEventListener("click", async () => {
		await navigator.clipboard.writeText(command.textContent);
		const oldText = command.textContent;
		command.textContent = "✓ Copied!";
		setTimeout(() => {
			command.textContent = oldText;
		}, 1200);
	});
});
