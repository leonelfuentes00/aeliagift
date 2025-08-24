export function initValentineCard() {
  const root = document.querySelector('#panel-letter');
  if (!root) return;

  const envelope = root.querySelector('.envelope-wrapper');
  const letter   = root.querySelector('.letter');
  const ctaBox   = root.querySelector('.proposal-cta');

  // mostrar siempre el botón
  if (ctaBox) ctaBox.hidden = false;

  root.addEventListener('click', (e) => {
    if (e.target.closest('.proposal-cta')) return;

    if (e.target.matches('.envelope, .tap-right, .tap-left, .heart')) {
      envelope.classList.toggle('flap');

      if (!letter.classList.contains('opened')) {
        setTimeout(() => {
          letter.classList.add('letter-opening');
          setTimeout(() => {
            letter.classList.remove('letter-opening');
            letter.classList.add('opened');
          }, 500);
        }, 1000);
      }
      return;
    }

    if (e.target.closest('.envelope') && !e.target.closest('.letter')) {
      envelope.classList.remove('flap');
      if (letter.classList.contains('opened')) {
        letter.classList.add('closing-letter');
        setTimeout(() => {
          letter.classList.remove('closing-letter', 'opened');
        }, 500);
      }
    }
  });
}
