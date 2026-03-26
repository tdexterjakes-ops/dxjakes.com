// ═══════════════════════════════════════════════
//  DX — ESSAY ENHANCEMENTS
//  Scroll reveals, terminal status bar, keyboard nav
// ═══════════════════════════════════════════════

(function() {
  'use strict';

  // ── SCROLL-TRIGGERED SECTION REVEALS ──
  // Tag each major content block with .reveal
  var revealSelectors = [
    '.post-header',
    '.section-head',
    '.pull-quote',
    '.callout',
    '.scripture',
    '.stat-block',
    '.scripture-list',
    '.closing',
    '.share-bar'
  ];

  revealSelectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.classList.add('reveal');
    });
  });

  // Also reveal each body paragraph with stagger
  document.querySelectorAll('.post-body > p').forEach(function(p, i) {
    p.classList.add('reveal');
    p.style.transitionDelay = Math.min(i * 0.04, 0.2) + 's';
  });

  // If user prefers reduced motion, show everything immediately
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('visible');
    });
  } else {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function(el) {
      observer.observe(el);
    });
  }


  // ── TERMINAL STATUS BAR ──
  var sections = document.querySelectorAll('.section-head h2');
  var readTime = 12; // minutes, matches the post metadata

  // Build the bar (decorative — hidden from screen readers)
  var bar = document.createElement('div');
  bar.className = 'status-bar';
  bar.setAttribute('aria-hidden', 'true');
  // ── EXPOSED STRUCTURAL METADATA ──
  var perf = performance.getEntriesByType('resource');
  var totalBytes = 0;
  var fileCount = perf.length;
  perf.forEach(function(r) { totalBytes += r.transferSize || 0; });
  var pageKB = totalBytes > 0 ? (totalBytes / 1024).toFixed(1) : '—';
  var loadMs = Math.round(performance.now());

  bar.innerHTML =
    '<span class="status-bar-section">—</span>' +
    '<span class="status-bar-meta">' + pageKB + ' KB · ' + fileCount + ' files · ' + loadMs + 'ms</span>' +
    '<span class="status-bar-keys"><kbd>x</kbd> <kbd>d</kbd> sections · <kbd>esc</kbd> back</span>' +
    '<span class="status-bar-time">' + readTime + ' min left</span>';
  document.body.appendChild(bar);

  var sectionLabel = bar.querySelector('.status-bar-section');
  var timeLabel = bar.querySelector('.status-bar-time');

  function updateStatus() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? scrollTop / docHeight : 0;

    // Update time remaining
    var remaining = Math.max(Math.ceil(readTime * (1 - pct)), 0);
    if (remaining === 0) {
      timeLabel.textContent = 'finished';
    } else {
      timeLabel.textContent = remaining + ' min left';
    }

    // Find current section
    var current = '—';
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.4) {
        current = sections[i].textContent;
        break;
      }
    }
    sectionLabel.textContent = current;
  }

  window.addEventListener('scroll', updateStatus, { passive: true });
  updateStatus();


  // ── KEYBOARD NAVIGATION ──
  // Collect navigable anchors: post-header + all section-heads
  var anchors = [document.querySelector('.post-header')];
  sections.forEach(function(h) {
    anchors.push(h.closest('.section-head') || h);
  });
  anchors = anchors.filter(Boolean);

  function getCurrentAnchorIndex() {
    var midpoint = window.innerHeight * 0.35;
    var idx = 0;
    for (var i = anchors.length - 1; i >= 0; i--) {
      if (anchors[i].getBoundingClientRect().top < midpoint) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  document.addEventListener('keydown', function(e) {
    // Don't capture if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'x') {
      e.preventDefault();
      var next = Math.min(getCurrentAnchorIndex() + 1, anchors.length - 1);
      anchors[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (e.key === 'd') {
      e.preventDefault();
      var prev = Math.max(getCurrentAnchorIndex() - 1, 0);
      anchors[prev].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (e.key === 'Escape') {
      window.location.href = '/words';
    }
  });

})();
