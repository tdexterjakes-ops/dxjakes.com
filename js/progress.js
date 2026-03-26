// Reading progress — smooth bar anchored to bottom of nav
(function() {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  var track = document.createElement('div');
  track.className = 'nav-progress';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', 'Reading progress');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', '0');
  var bar = document.createElement('div');
  bar.className = 'nav-progress-bar';
  track.appendChild(bar);
  nav.appendChild(track);

  var current = 0;
  var target = 0;
  var ticking = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    current = lerp(current, target, 0.12);

    // Snap when close enough
    if (Math.abs(current - target) < 0.1) current = target;

    bar.style.width = current + '%';
    track.setAttribute('aria-valuenow', Math.round(current));

    if (current !== target) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function onScroll() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    target = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
