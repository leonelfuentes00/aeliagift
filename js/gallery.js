export function mostrarFotosUnaPorUna(intervalMs = 2200){
  const root  = document.querySelector('.comp-gallery .galeria') || document.querySelector('.galeria');
  if(!root) return;

  const panel          = root.closest('#panel-gallery') || document;
  const galleryOverlay = panel.querySelector('.gallery-overlay');
  const grid           = panel.querySelector('.go-grid');
  const btnShowAll     = panel.querySelector('.gallery-showall');
  const btnClose       = panel.querySelector('.go-close');

  // === imágenes y orden real mostrado ===
  const imgs  = Array.from(root.querySelectorAll('img'));
  if (imgs.length < 2) return;
  const order = shuffle([...imgs]);          // <— orden consistente

  // === estado inicial del slideshow ===
  order.forEach((img,i)=>{
    img.style.setProperty('--rot', rand(-6,6)+'deg');
    img.style.setProperty('--stack-rot', rand(-4,4)+'deg');
    img.classList.remove('is-show','is-leave','is-stack');
    if(i===0) img.classList.add('is-show');
    else if(i===1) img.classList.add('is-stack');
  });

  let i = 0, timer = null;
  const tick = () => {
    const current = order[i];
    const next    = order[(i+1) % order.length];
    const stack   = order[(i+2) % order.length];

    current.classList.remove('is-show','is-stack'); current.classList.add('is-leave');
    next.style.setProperty('--rot', rand(-6,6)+'deg');
    next.classList.remove('is-leave','is-stack'); next.classList.add('is-show');

    order.forEach(el=>el.classList.remove('is-stack'));
    stack.style.setProperty('--stack-rot', rand(-4,4)+'deg'); stack.classList.add('is-stack');

    setTimeout(()=>current.classList.remove('is-leave'),480);
    i = (i+1) % order.length;
  };
  const start = ()=>{ if(!timer) timer=setInterval(tick, intervalMs); };
  const stop  = ()=>{ if(timer){ clearInterval(timer); timer=null; } };

  // === grilla del overlay usando el mismo orden (data-idx en 'order') ===
  if (grid) {
  grid.innerHTML = order.map((img, idx) =>
    `<figure style="--r:${rand(-5,5)}deg">
       <img data-idx="${idx}" src="${img.src}" alt="">
     </figure>`
  ).join('');
}

  // === Lightbox único y consistente ===
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lb-btn lb-close" aria-label="Cerrar">✕</button>
    <button class="lb-btn lb-prev"  aria-label="Anterior">‹</button>
    <img alt="">
    <button class="lb-btn lb-next"  aria-label="Siguiente">›</button>`;
  document.body.appendChild(lightbox);

  const big    = lightbox.querySelector('img');
  const lbPrev = lightbox.querySelector('.lb-prev');
  const lbNext = lightbox.querySelector('.lb-next');
  const lbClose= lightbox.querySelector('.lb-close');

  let current = 0;
  const show    = idx => { current=(idx+order.length)%order.length; big.src=order[current].src; };
  const openLB  = idx => { stop(); show(idx); lightbox.classList.add('open'); document.addEventListener('keydown', onKey); };
  const closeLB = ()  => { lightbox.classList.remove('open'); document.removeEventListener('keydown', onKey); runVisibility(); };
  const next    = ()  => show(current+1);
  const prev    = ()  => show(current-1);
  const onKey   = e   => { if(e.key==='Escape') closeLB(); else if(e.key==='ArrowRight') next(); else if(e.key==='ArrowLeft') prev(); };

  // Clicks sobre imágenes visibles y grilla → usan índice en 'order'
  order.forEach((img,idx)=>{ img.style.cursor='zoom-in'; img.addEventListener('click', ()=> openLB(idx)); });
  grid?.addEventListener('click', e=>{
    const t=e.target.closest('img[data-idx]'); if(!t) return;
    closeOverlay(); openLB(parseInt(t.dataset.idx,10));
  });

  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lbClose.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e=>{ if(e.target===lightbox||e.target===big) closeLB(); });

  // === Overlay “See all” ===
  const openOverlay  = () => { if(!galleryOverlay) return; galleryOverlay.hidden=false; document.body.classList.add('no-scroll'); stop(); };
  const closeOverlay = () => { if(!galleryOverlay) return; galleryOverlay.hidden=true;  document.body.classList.remove('no-scroll'); runVisibility(); };
  const isOverlayOpen= () => galleryOverlay && !galleryOverlay.hasAttribute('hidden');

  btnShowAll?.addEventListener('click', openOverlay);
  btnClose  ?.addEventListener('click', closeOverlay);
  galleryOverlay?.addEventListener('click', e=>{ if(e.target === galleryOverlay) closeOverlay(); });

  // === visibilidad / hover ===
  const runVisibility = () => {
    const visible = (!panel.hasAttribute?.('hidden')) && !isOverlayOpen() && !lightbox.classList.contains('open');
    if (visible) start(); else stop();
  };
  const mo = new MutationObserver(runVisibility);
  if(panel) mo.observe(panel, { attributes:true, attributeFilter:['hidden','class'] });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', runVisibility);

  runVisibility();
}

// utils
function rand(min,max){ return (Math.random()*(max-min)+min).toFixed(2); }
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
