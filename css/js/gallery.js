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
      return x.getAttribute('data-lightbox') === name && !x.closest('.hidden');
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
