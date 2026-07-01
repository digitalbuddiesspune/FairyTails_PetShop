const DURATION_MS = 700;
const FLY_SIZE = 52;
const VIEWPORT_MARGIN = 10;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;

const getTargetSelector = (type) => {
  const mobile = isMobileViewport();
  if (type === 'cart') {
    return mobile
      ? '[data-mobile-bottom-nav] [data-fly-target="cart-mobile"]'
      : '[data-fly-target="cart-desktop"]';
  }
  return mobile ? '[data-fly-target="wishlist-mobile"]' : '[data-fly-target="wishlist-desktop"]';
};

const getCenter = (rect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const getViewportBounds = (size = FLY_SIZE) => {
  const half = size / 2;
  const min = VIEWPORT_MARGIN + half;
  return {
    minX: min,
    minY: min,
    maxX: window.innerWidth - min,
    maxY: window.innerHeight - half,
  };
};

const getArcMidpoint = (start, end, size = FLY_SIZE) => {
  const { minX, minY, maxX, maxY } = getViewportBounds(size);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;

  const perpX = -dy / dist;
  const perpY = dx / dist;
  const arcOffset = Math.min(50, Math.max(24, dist * 0.18));

  const baseMidX = (start.x + end.x) / 2;
  const baseMidY = (start.y + end.y) / 2;

  const candidates = [
    { x: baseMidX + perpX * arcOffset, y: baseMidY + perpY * arcOffset },
    { x: baseMidX - perpX * arcOffset, y: baseMidY - perpY * arcOffset },
    { x: baseMidX, y: baseMidY },
  ];

  const inBounds = (point) =>
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;

  const chosen = candidates.find(inBounds) || candidates[2];

  return {
    x: clamp(chosen.x, minX, maxX),
    y: clamp(chosen.y, minY, maxY),
  };
};

const bumpTarget = (target) => {
  target.classList.add('fly-target-bump');
  window.setTimeout(() => target.classList.remove('fly-target-bump'), 320);
};

const createProductFlyer = (imageUrl) => {
  const flyer = document.createElement('div');
  flyer.setAttribute('aria-hidden', 'true');
  flyer.className = 'fly-item fly-item--product';

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.draggable = false;
    flyer.appendChild(img);
  } else {
    flyer.textContent = '🐾';
    flyer.classList.add('fly-item--placeholder');
  }

  return flyer;
};

/**
 * @param {HTMLElement} sourceEl - click source (fallback start position)
 * @param {'cart' | 'wishlist'} type
 * @param {{ imageUrl?: string, imageEl?: HTMLElement | null }} [options]
 */
export const flyToTarget = (sourceEl, type, options = {}) => {
  if (!sourceEl || !type) return;

  const target = document.querySelector(getTargetSelector(type));
  if (!target) return;

  const { imageUrl, imageEl } = options;
  const originEl =
    imageEl && imageEl.getBoundingClientRect().width > 0 ? imageEl : sourceEl;

  const from = originEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width && !from.height) return;

  const start = getCenter(from);
  const end = getCenter(to);
  const mid = getArcMidpoint(start, end);

  const startX = start.x - FLY_SIZE / 2;
  const startY = start.y - FLY_SIZE / 2;

  const flyer = createProductFlyer(imageUrl);
  flyer.style.width = `${FLY_SIZE}px`;
  flyer.style.height = `${FLY_SIZE}px`;
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  document.body.appendChild(flyer);

  const toTranslate = (point) => ({
    x: point.x - start.x,
    y: point.y - start.y,
  });

  const midOffset = toTranslate(mid);
  const endOffset = toTranslate(end);

  const animation = flyer.animate(
    [
      { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
      {
        transform: `translate(${midOffset.x}px, ${midOffset.y}px) scale(1.05)`,
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: `translate(${endOffset.x}px, ${endOffset.y}px) scale(0.25)`,
        opacity: 0.15,
      },
    ],
    {
      duration: DURATION_MS,
      easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
      fill: 'forwards',
    }
  );

  animation.onfinish = () => {
    flyer.remove();
    bumpTarget(target);
  };
};
