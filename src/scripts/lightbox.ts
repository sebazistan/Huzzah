/**
 * Simple photo carousel. Click any photo inside a `.gallery` to open it.
 * Arrows / keyboard (← → Esc Home End) / swipe to move, click the dark area to close.
 * Without JavaScript the links just open the full image, so nothing breaks.
 */
type Item = { src: string; alt: string; caption: string };

const chevron = (d: string) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

let root: HTMLDivElement | null = null;
let img: HTMLImageElement;
let cap: HTMLElement;
let count: HTMLElement;
let prevBtn: HTMLButtonElement;
let nextBtn: HTMLButtonElement;
let closeBtn: HTMLButtonElement;

let items: Item[] = [];
let index = 0;
let opener: HTMLElement | null = null;
let token = 0;

function build() {
  root = document.createElement('div');
  root.className = 'lb';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Photo viewer');
  root.innerHTML = `
    <div class="lb-top">
      <span class="lb-count" aria-live="polite"></span>
      <button class="lb-close" type="button" aria-label="Close (Esc)">${chevron('M6 6l12 12M18 6L6 18')}</button>
    </div>
    <button class="lb-nav lb-prev" type="button" aria-label="Previous photo">${chevron('M15 5l-7 7 7 7')}</button>
    <figure class="lb-stage"><img class="lb-img" alt="" draggable="false" /><figcaption class="lb-cap"></figcaption></figure>
    <button class="lb-nav lb-next" type="button" aria-label="Next photo">${chevron('M9 5l7 7-7 7')}</button>`;
  document.body.appendChild(root);

  img = root.querySelector('.lb-img')!;
  cap = root.querySelector('.lb-cap')!;
  count = root.querySelector('.lb-count')!;
  prevBtn = root.querySelector('.lb-prev')!;
  nextBtn = root.querySelector('.lb-next')!;
  closeBtn = root.querySelector('.lb-close')!;

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  closeBtn.addEventListener('click', close);
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === root || t.classList.contains('lb-stage')) close();
  });

  // swipe left / right
  let startX = 0;
  let startY = 0;
  root.addEventListener('pointerdown', (e) => { startX = e.clientX; startY = e.clientY; });
  root.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (e.pointerType !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  });
}

function show(i: number) {
  index = (i + items.length) % items.length;
  const item = items[index];
  const mine = ++token;

  count.textContent = `${index + 1} / ${items.length}`;
  cap.textContent = item.caption;
  cap.hidden = !item.caption;
  img.classList.add('is-loading');

  const loader = new Image();
  loader.onload = loader.onerror = () => {
    if (mine !== token) return; // user already moved on
    img.src = item.src;
    img.alt = item.alt;
    img.classList.remove('is-loading');
  };
  loader.src = item.src;

  // warm the cache for the neighbours
  for (const n of [index + 1, index - 1]) new Image().src = items[(n + items.length) % items.length].src;
}

function go(step: number) {
  if (items.length > 1) show(index + step);
}

function open(list: Item[], start: number, from: HTMLElement) {
  if (!root) build();
  items = list;
  opener = from;
  const multi = items.length > 1;
  prevBtn.hidden = nextBtn.hidden = !multi;
  root!.hidden = false;
  document.documentElement.classList.add('lb-open');
  requestAnimationFrame(() => root!.classList.add('open'));
  show(start);
  closeBtn.focus();
  document.addEventListener('keydown', onKey);
}

function close() {
  if (!root || root.hidden) return;
  root.classList.remove('open');
  root.hidden = true;
  document.documentElement.classList.remove('lb-open');
  document.removeEventListener('keydown', onKey);
  img.removeAttribute('src');
  opener?.focus();
}

function onKey(e: KeyboardEvent) {
  switch (e.key) {
    case 'Escape': close(); break;
    case 'ArrowRight': go(1); break;
    case 'ArrowLeft': go(-1); break;
    case 'Home': show(0); break;
    case 'End': show(items.length - 1); break;
    case 'Tab': {
      // keep keyboard focus inside the viewer
      const stops = [closeBtn, prevBtn, nextBtn].filter((b) => !b.hidden);
      const i = stops.indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault();
      stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
      break;
    }
    default: return;
  }
  if (e.key !== 'Tab') e.preventDefault();
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element).closest<HTMLAnchorElement>('.gallery a');
  if (!link) return;
  const gallery = link.closest('.gallery')!;
  const links = [...gallery.querySelectorAll<HTMLAnchorElement>('a')];
  const list: Item[] = links.map((a) => ({
    src: a.href,
    alt: a.querySelector('img')?.alt ?? '',
    caption: a.parentElement?.querySelector('figcaption')?.textContent?.trim() ?? '',
  }));
  e.preventDefault();
  open(list, links.indexOf(link), link);
});

// label the thumbnails for screen readers
document.querySelectorAll<HTMLElement>('.gallery').forEach((g) => {
  const links = g.querySelectorAll<HTMLAnchorElement>('a');
  links.forEach((a, i) => a.setAttribute('aria-label', `View photo ${i + 1} of ${links.length}`));
});
