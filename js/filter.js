// Words index — tag filter
const btns = document.querySelectorAll('.filter-btn');
const posts = document.querySelectorAll('.entry');
const empty = document.getElementById('empty-state');
const countEl = document.getElementById('entry-count');

btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const filter = btn.dataset.filter;
    let visible = 0;
    posts.forEach(post => {
      const match = filter === 'all' || (post.dataset.tags || '').split(',').includes(filter);
      post.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    countEl.textContent = visible + (visible === 1 ? ' entry' : ' entries');
    empty.style.display = visible === 0 ? 'block' : 'none';
  });
});
