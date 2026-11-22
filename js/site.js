/* Image viewer: any button with data-full="big-image.jpg" opens its picture large.
   Close with the X, the Esc key, or a click outside the picture.
   Screenshots in the same roll can be stepped through with the arrow buttons or arrow keys. */
(function () {
  var dlg = document.getElementById('lightbox');
  if (!dlg || !dlg.showModal) return;
  var img = dlg.querySelector('img');
  var cap = dlg.querySelector('.lightbox-cap');

  var view = dlg.querySelector('.lightbox-view');

  /* Zoom: click a spot to zoom in on that spot, drag to look around, click again to zoom back out. */
  function zoomOut() {
    img.classList.remove('zoomed', 'panning');
    img.style.width = '';
    view.style.width = view.style.height = '';
  }
  function zoomIn(x, y) {
    var r = img.getBoundingClientRect();
    var fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
    view.style.width = view.clientWidth + 'px';      /* keep the window the same size while zoomed */
    view.style.height = view.clientHeight + 'px';
    img.style.width = Math.max(img.naturalWidth, r.width * 2) + 'px';   /* full size, or at least twice as big */
    img.classList.add('zoomed');
    var v = view.getBoundingClientRect();
    view.scrollLeft = fx * img.offsetWidth - (x - v.left);   /* the clicked spot stays under the pointer */
    view.scrollTop = fy * img.offsetHeight - (y - v.top);
  }
  function fit() {
    zoomOut();
    dlg.classList.add('can-zoom');
  }
  img.addEventListener('load', fit);
  dlg.addEventListener('close', zoomOut);

  /* pictures in the same roll of screenshots open as a set: step through them with the arrows */
  var group = [], at = 0, loadToken = 0;
  var ARROW = '<svg viewBox="0 0 5 7" width="15" height="21" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h2v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-2v-1h1v-1h1v-1h1v-1h-1v-1h-1v-1h-1z"/></svg>';
  function navButton(cls, label, step) {
    var n = document.createElement('button');
    n.type = 'button'; n.className = 'lightbox-nav ' + cls; n.setAttribute('aria-label', label); n.innerHTML = ARROW;
    n.addEventListener('click', function () { show(at + step); });
    dlg.querySelector('.lightbox-bar').insertBefore(n, dlg.querySelector('.lightbox-close'));
  }
  navButton('lightbox-prev', 'Previous picture', -1);
  navButton('lightbox-next', 'Next picture', 1);

  function show(i) {
    at = (i + group.length) % group.length;
    var b = group[at], thumb = b.querySelector('img');
    var card = b.closest('.proj') || b.closest('li');
    var title = card && card.querySelector('h3');
    dlg.classList.remove('can-zoom');
    img.alt = thumb ? thumb.alt : '';
    /* show the small picture straight away (it is already loaded), then swap in the big one when it arrives,
       so the viewer never shows the previous picture for a moment */
    var full = b.dataset.full || (thumb && thumb.src);
    var token = ++loadToken;
    img.src = thumb ? thumb.currentSrc || thumb.src : full;
    if (full && full !== img.src) {
      var pre = new Image();
      pre.onload = function () { if (token === loadToken) img.src = full; };
      pre.src = full;
    }
    cap.textContent = (title ? title.textContent : img.alt) + (group.length > 1 ? ', ' + (at + 1) + ' of ' + group.length : '');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-full]');
    if (!b) return;
    var roll = b.closest('.roll, .art-grid');   /* a roll of screenshots or the grid of drawings opens as a set */
    group = roll ? Array.prototype.slice.call(roll.querySelectorAll('[data-full]')) : [b];
    dlg.classList.toggle('has-group', group.length > 1);
    show(group.indexOf(b));
    dlg.showModal();
  });
  dlg.addEventListener('keydown', function (e) {
    if (group.length < 2) return;
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });

  dlg.querySelector('.lightbox-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  var pan = null, panned = false;
  img.addEventListener('dragstart', function (e) { e.preventDefault(); });
  img.addEventListener('pointerdown', function (e) {
    if (!img.classList.contains('zoomed') || e.pointerType === 'touch' || e.button !== 0) return;   /* fingers already scroll it */
    pan = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop };
    panned = false;
    img.setPointerCapture(e.pointerId);
  });
  img.addEventListener('pointermove', function (e) {
    if (!pan) return;
    var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
    if (!panned && Math.abs(dx) + Math.abs(dy) > 5) { panned = true; img.classList.add('panning'); }
    if (panned) { view.scrollLeft = pan.l - dx; view.scrollTop = pan.t - dy; }
  });
  function endPan() { pan = null; img.classList.remove('panning'); }
  img.addEventListener('pointerup', endPan);
  img.addEventListener('pointercancel', endPan);
  img.addEventListener('click', function (e) {
    if (panned) { panned = false; return; }            /* the end of a drag is not a click */
    if (img.classList.contains('zoomed')) zoomOut();
    else if (dlg.classList.contains('can-zoom')) zoomIn(e.clientX, e.clientY);
  });
})();

/* Soap bubbles pop when touched, and come back on their next trip up. */
(function () {
  document.querySelectorAll('.sky .bubble').forEach(function (b) {
    b.addEventListener('pointerdown', function () { b.classList.add('pop'); });
    b.addEventListener('animationiteration', function (e) {
      if (e.animationName === 'rise') b.classList.remove('pop');
    });
  });
})();

/* Item pile: the last item you touched stays on top. */
(function () {
  document.querySelectorAll('.pile').forEach(function (pile) {
    pile.addEventListener('pointerover', function (e) {
      var it = e.target.closest('.pile-item');
      if (!it) return;
      pile.querySelectorAll('.front').forEach(function (o) { o.classList.remove('front'); });
      it.classList.add('front');
    });
  });
})();

/* Cursor trail and click stars, drawn on one see-through canvas above the page.
   Trail: small pastel squares that follow the mouse, shrink and fade in under half a second.
   Click: a few little yellow pixel stars with orange outlines pop outwards and fade. Nothing runs while the mouse is still,
   and none of it runs for visitors who ask for reduced motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d'), dpr = 1, running = false;
  var dots = [], stars = [], last = null, hue = 0;
  var TRAIL_MS = 420, STAR_MS = 600, GRID = 4;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  }
  resize(); addEventListener('resize', resize);

  function pastel(h, a) { return 'hsla(' + (h % 360) + ',95%,80%,' + a + ')'; }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var now = performance.now(), x = e.clientX, y = e.clientY;
    if (!last || now - last.t > 120) last = { x: x, y: y, t: now };
    var dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy), n = Math.max(1, Math.floor(dist / 7));
    if (dist < 3) return;
    for (var i = 1; i <= n; i++) {            /* fill the gap so fast moves leave no holes */
      hue += 9;
      dots.push({ x: last.x + dx * i / n, y: last.y + dy * i / n, t: now, h: hue });
    }
    if (dots.length > 160) dots.splice(0, dots.length - 160);
    last = { x: x, y: y, t: now };
    start();
  }, { passive: true });

  addEventListener('click', function (e) {
    if (e.clientX === 0 && e.clientY === 0) return;      /* keyboard "clicks" have no position */
    var now = performance.now(), n = 7, spin = Math.random() * Math.PI;
    for (var i = 0; i < n; i++) {
      var a = spin + i * 2 * Math.PI / n + (Math.random() - 0.5) * 0.5, sp = 90 + Math.random() * 80;
      stars.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t: now, h: Math.random() * 360, s: 2 + Math.round(Math.random()) });
    }
    start();
  });

  /* the star sprite: a five-point pixel star, yellow inside with an orange outline */
  var STAR = ['....O....', '...OYO...', 'OOOOYOOOO', 'OYYYWYYYO', '.OYYWYYO.', '..OYYYO..', '.OYYOYYO.', '.OYO.OYO.', '.OO...OO.'];
  var sprite = document.createElement('canvas'); sprite.width = sprite.height = 9;
  (function () {
    var s = sprite.getContext('2d'), col = { O: '#ff9a1f', Y: '#ffe14d', W: '#fff8c4' };
    STAR.forEach(function (row, y) { row.split('').forEach(function (ch, x) { if (col[ch]) { s.fillStyle = col[ch]; s.fillRect(x, y, 1, 1); } }); });
  })();
  function star(x, y, u) {                    /* u = size of one star pixel on screen */
    var size = Math.max(9, Math.round(9 * u));
    ctx.drawImage(sprite, Math.round(x - size / 2), Math.round(y - size / 2), size, size);
  }

  function frame(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;        /* keep the star pixels crisp */
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var i, k, age;
    while (dots.length && now - dots[0].t > TRAIL_MS) dots.shift();
    for (i = 0; i < dots.length; i++) {
      k = 1 - (now - dots[i].t) / TRAIL_MS;                 /* 1 = new, 0 = gone */
      var size = Math.max(2, Math.round(10 * k / 2) * 2);
      ctx.fillStyle = pastel(dots[i].h, 0.42 * k);
      ctx.fillRect(Math.round((dots[i].x - size / 2) / GRID) * GRID, Math.round((dots[i].y - size / 2) / GRID) * GRID, size, size);
    }
    for (i = stars.length - 1; i >= 0; i--) {
      var s = stars[i]; age = (now - s.t) / 1000;
      if (age * 1000 > STAR_MS) { stars.splice(i, 1); continue; }
      k = 1 - age * 1000 / STAR_MS;
      var ease = 1 - Math.pow(1 - Math.min(1, age / 0.35), 3);        /* fast at first, then settling */
      var x = s.x + s.vx * 0.35 * ease, y = s.y + s.vy * 0.35 * ease + 120 * age * age;
      ctx.globalAlpha = Math.min(1, k * 1.8);
      star(x, y, s.s * (0.55 + 0.45 * k));
      ctx.globalAlpha = 1;
    }
    if (dots.length || stars.length) requestAnimationFrame(frame); else running = false;
  }
})();

/* Drag and spring back: the cards, stickers and pictures that grow on hover can be picked up with the mouse.
   Let go and they bounce back to their place. A drag never counts as a click. */
(function () {
  var DRAGGABLE = '.pix, .pile-item, .sticker, .cloud, .panel .chip, .panel .when, .recs li, .proof li, .quote, .steps li, .facts li';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = null, sx = 0, sy = 0, moved = false, swallowClick = false, pid = null;

  addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' || e.button !== 0) return;      /* touch is for scrolling */
    var t = e.target.closest && e.target.closest(DRAGGABLE);
    if (!t) return;
    el = t; sx = e.clientX; sy = e.clientY; moved = false; pid = e.pointerId;
  });

  addEventListener('pointermove', function (e) {
    if (!el || e.pointerId !== pid) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved) {
      if (Math.hypot(dx, dy) < 5) return;                         /* a small wobble is still a click */
      moved = true;
      el.getAnimations().forEach(function (a) { if (a.id === 'spring-back') a.cancel(); });
      el.classList.add('dragging');
      document.documentElement.classList.add('is-dragging');
      try { el.setPointerCapture(pid); } catch (err) {}
      var sel = window.getSelection && window.getSelection(); if (sel) sel.removeAllRanges();
    }
    el.style.translate = dx + 'px ' + dy + 'px';
  });

  function drop(e) {
    if (!el || (e && e.pointerId !== pid)) return;
    var item = el; el = null;
    if (!moved) return;
    swallowClick = true; setTimeout(function () { swallowClick = false; }, 60);
    var from = item.style.translate || '0px 0px';
    item.style.translate = '';
    document.documentElement.classList.remove('is-dragging');
    var back = item.animate([{ translate: from }, { translate: '0px 0px' }],
      { duration: calm ? 1 : 520, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });   /* overshoots a little, then settles */
    back.id = 'spring-back';
    back.onfinish = back.oncancel = function () { item.classList.remove('dragging'); };
  }
  addEventListener('pointerup', drop);
  addEventListener('pointercancel', drop);

  /* the click that ends a drag should not open pictures, follow links or set off the stars */
  addEventListener('click', function (e) {
    if (!swallowClick) return;
    swallowClick = false; e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  addEventListener('dragstart', function (e) {                    /* stop the browser's own image dragging */
    if (e.target.closest && e.target.closest(DRAGGABLE)) e.preventDefault();
  });
})();


/* Pixel leaves fall from a leaf block of the design process tree while the mouse is on it
   (or when it is tapped on a touch screen). */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tree = document.querySelector('.sec.tree');
  if (!tree || !tree.animate) return;
  var live = 0, MAX = 18;

  function leaf(block) {
    if (live >= MAX) return;
    var b = block.getBoundingClientRect(), t = tree.getBoundingClientRect();
    var el = document.createElement('i');
    el.className = 'leaf-fall' + (Math.random() < 0.4 ? ' dark' : '');
    el.setAttribute('aria-hidden', 'true');
    /* start somewhere along the bottom edge, kept away from the sides so the sway never leaves the block's width */
    var x = b.left - t.left + 20 + Math.random() * Math.max(0, b.width - 68);
    var y = b.bottom - t.top - 22;
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
    if (Math.random() < 0.5) el.style.scale = '-1 1';
    tree.appendChild(el);
    live++;
    var fall = 90 + Math.random() * 60, sway = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 6);
    var time = 1200 + Math.random() * 600, ease = 'ease-in-out';
    /* swings side to side on the way down, and tilts one step at each turn */
    el.animate([
      { translate: '0px 0px', easing: ease },
      { translate: sway + 'px ' + fall * 0.3 + 'px', easing: ease },
      { translate: -sway + 'px ' + fall * 0.65 + 'px', easing: ease },
      { translate: sway * 0.5 + 'px ' + fall + 'px' }
    ], { duration: time, fill: 'forwards' });
    el.animate([
      { rotate: '-16deg', easing: 'step-end' }, { rotate: '16deg', easing: 'step-end', offset: 0.3 },
      { rotate: '-16deg', easing: 'step-end', offset: 0.65 }, { rotate: '16deg' }
    ], { duration: time, fill: 'forwards' });
    el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
      { duration: time, fill: 'forwards' }).onfinish = function () { el.remove(); live--; };
  }
  function burst(block, n) {
    for (var i = 0; i < n; i++) setTimeout(leaf, i * 90, block);
  }

  Array.prototype.forEach.call(tree.querySelectorAll('.steps li'), function (block) {
    var timer = null;
    /* a real mouse keeps them falling while it stays on the block; a finger gets one small burst per tap */
    block.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch') return;
      burst(block, 3);
      clearInterval(timer);
      timer = setInterval(leaf, 280, block);
    });
    block.addEventListener('pointerleave', function () { clearInterval(timer); timer = null; });
    block.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') burst(block, 4); });
  });
})();


/* Rolls of screenshots: arrow buttons for people on a mouse, shown only when there is more to see on that side. */
(function () {
  var ARROW = '<svg viewBox="0 0 5 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h2v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-2v-1h1v-1h1v-1h1v-1h-1v-1h-1v-1h-1z"/></svg>';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.roll-wrap'), function (wrap) {
    var roll = wrap.querySelector('.roll');
    if (!roll) return;
    function button(cls, label, dir) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'roll-btn ' + cls; b.setAttribute('aria-label', label); b.innerHTML = ARROW; b.hidden = true;
      b.addEventListener('click', function () {
        var item = roll.querySelector('li');
        var step = item ? item.getBoundingClientRect().width + 12 : roll.clientWidth * 0.8;
        roll.scrollBy({ left: dir * step, behavior: calm ? 'auto' : 'smooth' });
      });
      wrap.appendChild(b);
      return b;
    }
    var prev = button('roll-prev', 'Earlier screenshots', -1), next = button('roll-next', 'More screenshots', 1);
    function update() {
      prev.hidden = roll.scrollLeft < 4;
      next.hidden = roll.scrollLeft + roll.clientWidth > roll.scrollWidth - 4;
    }
    roll.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });
})();


/* When the site is shown inside a preview frame, the frame's host keeps its own scroll position
   from one page to the next, so a new page could open at the bottom. Start it at the top instead.
   On the real site (not in a frame) the browser already does this, so nothing runs there. */
(function () {
  var framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (!framed || location.hash) return;
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.type === 'back_forward') return;
  document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' });
})();


/* Rolls of screenshots can also be dragged sideways with the mouse, like a scroll bar.
   (Fingers already swipe them.) A drag never opens the picture it started on. */
(function () {
  var roll = null, sx = 0, sl = 0, moved = false, justDragged = false;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    var r = e.target.closest && e.target.closest('.roll');
    if (!r || r.scrollWidth <= r.clientWidth) return;
    roll = r; sx = e.clientX; sl = r.scrollLeft; moved = false;
  });
  addEventListener('pointermove', function (e) {
    if (!roll) return;
    var dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      roll.classList.add('rolling');
      roll.style.scrollSnapType = 'none';            /* snapping would fight the drag */
    }
    if (moved) { roll.scrollLeft = sl - dx; e.preventDefault(); }
  });
  function end() {
    if (!roll) return;
    if (moved) {
      roll.classList.remove('rolling');
      roll.style.scrollSnapType = '';
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 0);
    }
    roll = null;
  }
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  document.addEventListener('click', function (e) {
    if (justDragged && e.target.closest && e.target.closest('.roll')) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('dragstart', function (e) {
    if (e.target.closest && e.target.closest('.roll')) e.preventDefault();
  });
})();


/* "Why?" buttons: a click or tap keeps the reasons open; a click anywhere else or Esc closes them. */
(function () {
  function closeAll(except) {
    document.querySelectorAll('.why-pop.open').forEach(function (p) {
      if (p === except) return;
      p.classList.remove('open');
      var b = document.querySelector('[aria-controls="' + p.id + '"]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.why-btn');
    if (!b) { if (!e.target.closest || !e.target.closest('.why-pop')) closeAll(); return; }
    var pop = document.getElementById(b.getAttribute('aria-controls'));
    if (!pop) return;
    var open = !pop.classList.contains('open');
    closeAll(pop);
    pop.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
})();


/* Start the hero animation once the page has finished loading, so visitors see the wave, rain and flowers.
   (If loading takes very long, start anyway after 6 seconds.) */
(function () {
  function go() { document.documentElement.classList.add('loaded'); }
  if (document.readyState === 'complete') go();
  else { addEventListener('load', go); setTimeout(go, 6000); }
})();
