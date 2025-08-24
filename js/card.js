export function initCard() {
  document.querySelectorAll('.valentines-day-card').forEach(card => {
    const chk    = card.querySelector('#open');
    const inside = card.querySelector('.card-inside');

    let pages = Array.from(inside.querySelectorAll('.page'));
    if (pages.length === 0) {
      const page = document.createElement('div');
      page.className = 'page';
      while (inside.firstChild) page.appendChild(inside.firstChild);
      inside.appendChild(page);
      pages = [page];
    }

    let idx = 0;
    const show = n => {
      pages.forEach((p,i)=>p.classList.toggle('is-active', i===n));
      idx = n;
    };
    show(0);

    chk?.addEventListener('change', () => {
      if (chk.checked) setTimeout(() => { chk.disabled = true; }, 0);
    });

    const next = () => {
      if (!chk?.checked || pages.length <= 1) return;

      const lastIndex = pages.length - 1;
      const current   = pages[idx];

      if (idx === lastIndex) {
        current.classList.add('turn-over');            // sigue visible
        current.addEventListener('animationend', function onEnd(){
          current.removeEventListener('animationend', onEnd);
          current.classList.remove('turn-over','is-active');
          chk.disabled = false;
          chk.checked  = false;
          show(0);
        }, { once:true });
        return;
      }

      const nextIndex = idx + 1;
      const coming    = pages[nextIndex];

      coming.classList.add('pre-active');              // debajo
      current.classList.add('turn-over');              // no ocultar aún

      current.addEventListener('animationend', function onEnd(){
        current.removeEventListener('animationend', onEnd);
        current.classList.remove('turn-over','is-active');
        coming.classList.remove('pre-active');
        coming.classList.add('is-active');
        idx = nextIndex;
      }, { once:true });
    };

    inside.addEventListener('click', next);
    card.addEventListener('keydown', e=>{
      if (!chk?.checked) return;
      if (e.key==='ArrowRight' || e.key===' ') { e.preventDefault(); next(); }
    });
  });
}
