const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navigation');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

const detailImages = Array.from(document.querySelectorAll('img')).filter((image) =>
  !image.closest('a, button, .image-lightbox')
);

const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const textNodes = [];
while (walker.nextNode()) {
  const node = walker.currentNode;
  const parent = node.parentElement;
  if (node.textContent.trim() && parent && !parent.closest(
    'script, style, noscript, code, pre, .sr-only, [aria-hidden="true"], .image-lightbox'
  )) textNodes.push(node);
}
textNodes.forEach((node) => {
  const fragment = document.createDocumentFragment();
  node.textContent.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      fragment.append(document.createTextNode(part));
      return;
    }
    const wrapper = document.createElement('span');
    wrapper.className = 'hover-grow-text';
    wrapper.textContent = part;
    fragment.append(wrapper);
  });
  node.replaceWith(fragment);
});

if (detailImages.length) {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('aria-label', 'Expanded project image');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close image">×</button>
    <button class="lightbox-nav lightbox-previous" type="button" aria-label="Previous image">‹</button>
    <figure class="lightbox-frame"><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">›</button>
    <span class="lightbox-count" aria-live="polite"></span>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('figure img');
  const caption = lightbox.querySelector('figcaption');
  const count = lightbox.querySelector('.lightbox-count');
  const previous = lightbox.querySelector('.lightbox-previous');
  const next = lightbox.querySelector('.lightbox-next');
  let currentIndex = 0;
  let opener;

  function showImage(index) {
    currentIndex = (index + detailImages.length) % detailImages.length;
    const image = detailImages[currentIndex];
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    caption.textContent = image.alt;
    count.textContent = `${currentIndex + 1} / ${detailImages.length}`;
    const multiple = detailImages.length > 1;
    previous.hidden = !multiple;
    next.hidden = !multiple;
    count.hidden = !multiple;
  }

  detailImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Expand image: ${image.alt}`);
    image.addEventListener('click', () => {
      opener = image;
      showImage(index);
      lightbox.showModal();
    });
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        image.click();
      }
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  previous.addEventListener('click', () => showImage(currentIndex - 1));
  next.addEventListener('click', () => showImage(currentIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
  lightbox.addEventListener('close', () => opener?.focus());
}
