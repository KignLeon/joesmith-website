/* Endorsement carousel, filters, and image lightbox (shared across pages) */
(function () {
  'use strict';

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---- Carousel arrows ----
  document.querySelectorAll('[data-carousel]').forEach(function (wrap) {
    var track = wrap.querySelector('[data-carousel-track]');
    var prev = wrap.querySelector('[data-carousel-prev]');
    var next = wrap.querySelector('[data-carousel-next]');
    if (!track) return;
    function step() {
      var card = track.querySelector(':scope > *');
      return card ? card.getBoundingClientRect().width + 24 : 300;
    }
    function update() {
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // ---- Endorsement filters ----
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var cards = document.querySelectorAll('[data-category]');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('[data-filter]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      cards.forEach(function (c) {
        c.classList.toggle('hidden', f !== 'all' && c.getAttribute('data-category') !== f);
      });
    });
  }

  // ---- Masonry: balanced columns (each photo goes in the shortest column) ----
  document.querySelectorAll('.masonry').forEach(function (grid) {
    var cells = Array.prototype.slice.call(grid.querySelectorAll('.masonry-item'));
    cells.forEach(function (c, i) { c.setAttribute('data-order', i); });
    var current = 0;
    function cols() { return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1; }
    function layout(force) {
      var n = cols();
      if (n === current && !force) return;
      current = n;
      grid.innerHTML = '';
      var columns = [], heights = [];
      for (var k = 0; k < n; k++) {
        var col = document.createElement('div');
        col.className = 'masonry-col';
        grid.appendChild(col);
        columns.push(col);
        heights.push(0);
      }
      var visible = cells.filter(function (c) { return !c.classList.contains('is-collapsed'); });
      var collapsed = cells.filter(function (c) { return c.classList.contains('is-collapsed'); });
      visible.forEach(function (c) {
        var min = 0;
        for (var j = 1; j < n; j++) if (heights[j] < heights[min] - 0.01) min = j;
        columns[min].appendChild(c);
        heights[min] += (parseFloat(c.getAttribute('data-ratio')) || 1) + 0.08; // 0.08 ~ gap
      });
      collapsed.forEach(function (c) { columns[0].appendChild(c); });
    }
    grid._relayout = function () { layout(true); };
    layout();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(layout, 150); });
  });

  // ---- Load more (masonry gallery) ----
  document.querySelectorAll('[data-load-more]').forEach(function (btn) {
    var batch = parseInt(btn.getAttribute('data-load-more'), 10) || 12;
    var scope = document.querySelector(btn.getAttribute('data-target'));
    if (!scope) return;
    btn.addEventListener('click', function () {
      var hidden = Array.prototype.slice.call(scope.querySelectorAll('.is-collapsed')).sort(function (a, b) {
        return (+a.getAttribute('data-order') || 0) - (+b.getAttribute('data-order') || 0);
      });
      for (var i = 0; i < Math.min(batch, hidden.length); i++) hidden[i].classList.remove('is-collapsed');
      if (scope._relayout) scope._relayout();
      var left = scope.querySelectorAll('.is-collapsed').length;
      if (!left) btn.parentElement.remove();
      else btn.querySelector('[data-remaining]').textContent = left;
    });
  });

  // ---- Lightbox ----
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (!items.length) return;

  var box = document.createElement('div');
  box.id = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button type="button" class="lb-btn lb-close" id="lightbox-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
    '<button type="button" class="lb-btn lb-prev" id="lightbox-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>' +
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button type="button" class="lb-btn lb-next" id="lightbox-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>';
  document.body.appendChild(box);

  var img = box.querySelector('.lb-img');
  var cap = box.querySelector('.lb-cap');
  var group = [];
  var idx = 0;
  var lastFocus = null;

  function show(i) {
    idx = (i + group.length) % group.length;
    var el = group[idx];
    img.src = el.getAttribute('data-full') || el.getAttribute('src');
    img.alt = el.getAttribute('alt') || '';
    cap.textContent = el.getAttribute('data-caption') || el.getAttribute('alt') || '';
  }
  function open(el) {
    var name = el.getAttribute('data-lightbox');
    group = items.filter(function (x) {
      return x.getAttribute('data-lightbox') === name && !x.closest('.hidden, .is-collapsed');
    }).sort(function (a, b) {
      var oa = a.closest('[data-order]'), ob = b.closest('[data-order]');
      return (oa ? +oa.getAttribute('data-order') : 0) - (ob ? +ob.getAttribute('data-order') : 0);
    });
    lastFocus = document.activeElement;
    show(group.indexOf(el));
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    img.src = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (el) {
    var trigger = el.closest('button, a') || el;
    trigger.addEventListener('click', function (e) { e.preventDefault(); open(el); });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
