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
});

// Load audio engine on first interaction.
// AudioContext must be created and resumed synchronously within the user
// gesture — iOS Safari blocks audio if creation happens after an await.
//
// touchstart is used to unlock the AudioContext because on real iOS devices
// pointerdown alone may not be recognized as a user-activation gesture.
// The subsequent pointerdown (which fires after touchstart on the same touch)
// is used to load and mount the audio engine so it receives a PointerEvent.
let audioContext: AudioContext | null = null;

container.addEventListener(
  "touchstart",
  function unlockAudio() {
    container.removeEventListener("touchstart", unlockAudio);
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioCtx();
    audioContext.resume();
  },
  { passive: true, once: true },
);

container.addEventListener("pointerdown", function handleFirst(e) {
  container.removeEventListener("pointerdown", handleFirst);
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!audioContext) {
    audioContext = new AudioCtx();
    audioContext.resume();
  }
  import("./grid-player.ts").then(({ mount }) =>
    mount(dot, container, e, audioContext!),
  );
});
