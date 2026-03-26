// ═══════════════════════════════════════════════
//  DX — HOMEPAGE
//  Rotating tagline + live clock
// ═══════════════════════════════════════════════

(function() {
  'use strict';

  // ── ROTATING TAGLINE ──
  var lines = [
    'The room doesn\u2019t owe you clarity. Stay anyway.',
    'Most of what matters will never be measured.',
    'Faithfulness is strategy that outlives the strategist.',
    'Stillness is not the absence of work. It\u2019s the posture of trust.',
    'You were not built for comfort. You were built for weight.',
    'The waiting is not wasted. It\u2019s where the roots go deep.',
    'Obedience doesn\u2019t need applause. It needs follow-through.',
    'Integrity is what you do when the room empties.',
    'You don\u2019t earn rest. You receive it.',
    'The hardest word to say in a loud room is no.'
  ];

  var tagline = document.getElementById('tagline');
  if (tagline) {
    var idx = Math.floor(Math.random() * lines.length);
    tagline.textContent = lines[idx];

    setInterval(function() {
      tagline.style.opacity = '0';
      setTimeout(function() {
        idx = (idx + 1) % lines.length;
        tagline.textContent = lines[idx];
        tagline.style.opacity = '1';
      }, 800);
    }, 8000);
  }


  // ── LIVE CLOCK ──
  var clock = document.getElementById('clock');
  if (clock) {
    function tick() {
      var now = new Date();
      var opts = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      clock.textContent = now.toLocaleString('en-US', opts);
    }
    tick();
    setInterval(tick, 1000);
  }

})();
