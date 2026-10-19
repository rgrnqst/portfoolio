// Mobiilimenüü
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Piltide suurendus
const lb = document.getElementById('lb');
if (lb && typeof lb.showModal === 'function') {
  const img = lb.querySelector('img');
  const cap = lb.querySelector('.cap');
  document.querySelectorAll('.shot button[data-full]').forEach(btn => {
    btn.addEventListener('click', () => {
      const small = btn.querySelector('img');
      img.src = btn.dataset.full;
      img.alt = small ? small.alt : '';
      const fc = btn.closest('figure').querySelector('figcaption');
      cap.textContent = fc ? fc.textContent : '';
      lb.showModal();
    });
  });
  lb.querySelector('button').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
}
