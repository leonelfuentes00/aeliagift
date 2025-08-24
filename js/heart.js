// js/heart.js
export function initHeart() {
  document.addEventListener('click', e => {
    const heart = e.target.closest('.heart-heart');
    if (!heart) return;
    heart.classList.toggle('is-beating');
  });
}
