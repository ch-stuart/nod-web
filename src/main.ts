const container = document.getElementById("grid-player") as HTMLElement;
const dot = document.getElementById("grid-dot") as HTMLElement;

requestAnimationFrame(() => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const minX = 5;
  const maxX = width - 45;
  const minY = 44;
  const maxY = height - 55;
  dot.style.transform = `translate(${minX + 0.75 * (maxX - minX)}px, ${minY + 0.75 * (maxY - minY)}px)`;
  dot.style.display = "block";
});

// Load audio engine on first interaction.
// AudioContext must be created and resumed synchronously within the user
// gesture — iOS Safari blocks audio if creation happens after an await.
container.addEventListener("pointerdown", function handleFirst(event) {
  container.removeEventListener("pointerdown", handleFirst);
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext: AudioContext = new AudioCtx();

  audioContext.resume();

  import("./grid-player.ts").then(({ mount }) =>
    mount(dot, container, event, audioContext!, "playing"),
  );
});
