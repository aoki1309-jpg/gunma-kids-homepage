// main.js
// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
});
