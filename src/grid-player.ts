import { GridEngine } from './audio/grid-engine.js';

const DOT_SIZE = 35;
const EDGE_PAD = 5;
const BOTTOM_PAD = 15;
// Dynamic island: top 10px + height 24px = bottom at 34px, plus 10px clearance
const TOP_PAD = 34 + 10;
const DRAG_THRESHOLD_SQ = 6 * 6;

function getBounds(w: number, h: number) {
  return {
    minX: EDGE_PAD,
    maxX: w - DOT_SIZE - EDGE_PAD,
    minY: TOP_PAD,
    maxY: h - DOT_SIZE - BOTTOM_PAD,
  };
}

export function mount(dot: HTMLElement, container: HTMLElement, initialEvent: PointerEvent, ctx: AudioContext) {
  const engine = new GridEngine(ctx);
  let isPlaying = false;
  let pos = { x: 0.75, y: 0.75 };
  let downClient: { x: number; y: number } | null = null;
  let isDragging = false;
  let downOnDot = false;

  function updateDot() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const { minX, maxX, minY, maxY } = getBounds(w, h);
    const x = minX + pos.x * (maxX - minX);
    const y = minY + pos.y * (maxY - minY);
    dot.style.transform = `translate(${x}px, ${y}px)`;
  }

  function normalize(clientX: number, clientY: number) {
    const r = container.getBoundingClientRect();
    const { minX, maxX, minY, maxY } = getBounds(r.width, r.height);
    const px = Math.max(minX, Math.min(maxX, clientX - r.left - DOT_SIZE / 2));
    const py = Math.max(minY, Math.min(maxY, clientY - r.top - DOT_SIZE / 2));
    return {
      x: (px - minX) / (maxX - minX),
      y: (py - minY) / (maxY - minY),
    };
  }

  function togglePlay() {
    if (isPlaying) {
      engine.stop();
      isPlaying = false;
    } else {
      engine.start(pos.x, pos.y);
      isPlaying = true;
    }
    dot.classList.toggle('playing', isPlaying);
    container.setAttribute('aria-pressed', String(isPlaying));
  }

  container.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    container.setPointerCapture(e.pointerId);
    downClient = { x: e.clientX, y: e.clientY };
    isDragging = false;
    const r = dot.getBoundingClientRect();
    const pad = 12;
    downOnDot =
      e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
      e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
  });

  container.addEventListener('pointermove', (e) => {
    if (!downClient || !downOnDot) return;
    const dx = e.clientX - downClient.x;
    const dy = e.clientY - downClient.y;
    if (!isDragging && dx * dx + dy * dy < DRAG_THRESHOLD_SQ) return;
    isDragging = true;
    pos = normalize(e.clientX, e.clientY);
    updateDot();
    if (isPlaying) engine.setPosition(pos.x, pos.y);
  });

  container.addEventListener('pointerup', () => {
    if (!downClient) return;
    downClient = null;
    if (!isDragging) togglePlay();
    isDragging = false;
    downOnDot = false;
  });

  container.addEventListener('pointercancel', () => {
    downClient = null;
    isDragging = false;
    downOnDot = false;
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlay();
    }
  });

  window.addEventListener('resize', updateDot);

  downClient = { x: initialEvent.clientX, y: initialEvent.clientY };
  updateDot();
}
