// main.js
// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
   const willOpen = !menu.classList.contains('open');
    menu.classList.toggle('open', willOpen);
    btn.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});
