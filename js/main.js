// js/main.js
import { mostrarFotosUnaPorUna } from './gallery.js';
import { initValentineCard } from './valentinecard.js';
import { initHeart } from './heart.js';
import { initCard } from './card.js';
import { initIntroCard } from './intro.js';

function loadComponent(p){ return fetch(p).then(r=>r.text()); }

function createPanel({id, html}){
  return `
    <section class="panel" id="panel-${id}" hidden>
      <div class="panel-content">
        <section class="comp comp-${id}" hidden aria-hidden="true">
          ${html}
        </section>
        <div class="flow-actions" data-flow-for="${id}"></div>
      </div>
    </section>`;
}

function setupUI(root){
  const ids   = ['intro','heart','gallery','card','letter'];
  const titles= ['intro','cœur','galerie','carte','lettre'];

  const bar = document.createElement('div');
  bar.className = 'comp-bar';
  bar.innerHTML = titles.map((t,i)=>
    `<button class="comp-btn" data-btn="${ids[i]}" aria-expanded="false" disabled>${t}</button>`
  ).join('');
  root.prepend(bar);

  const setOpen = (id, open) => {
    const panel = root.querySelector(`#panel-${id}`);
    const btn   = bar.querySelector(`[data-btn="${id}"]`);
    const comp  = panel.querySelector('.comp');

    if (btn) {
      btn.classList.toggle('is-active', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    comp.toggleAttribute('hidden', !open);
    comp.setAttribute('aria-hidden', String(!open));

    if (open && panel.classList.contains('open')) return;
    if (!open && !panel.classList.contains('open')) return;

    if (open) {
      panel.hidden = false;
      panel.offsetHeight;
      panel.classList.add('open');
    } else {
      panel.classList.remove('open');
      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        if (!panel.classList.contains('open')) panel.hidden = true;
        panel.removeEventListener('transitionend', onEnd);
      };
      panel.addEventListener('transitionend', onEnd);
    }
  };

  const openOnly  = (id)=> ids.forEach(x => setOpen(x, x===id));
  const enableTab = id => { const b = bar.querySelector(`[data-btn="${id}"]`); if (b) b.disabled = false; };
  const showBar   = () => bar.classList.add('is-visible');

  bar.addEventListener('click', e=>{
    const b = e.target.closest('.comp-btn'); if(!b || b.disabled) return;
    openOnly(b.dataset.btn);
    root.querySelector(`#panel-${b.dataset.btn}`).scrollIntoView({ behavior:'smooth', block:'start' });
  });

  return { setOpen, openOnly, enableTab, showBar, ids };
}

function injectNext(root, fromId, toId, label='Siguiente'){
  const zone = root.querySelector(`.flow-actions[data-flow-for="${fromId}"]`);
  if (!zone || zone.querySelector(`[data-next="${toId}"]`)) return;
  const btn = document.createElement('button');
  btn.className = 'flow-next';
  btn.textContent = label;
  btn.setAttribute('data-next', toId);
  zone.appendChild(btn);
}

Promise.all([
  loadComponent('./components/intro.html'),
  loadComponent('./components/heart.html'),
  loadComponent('./components/gallery.html'),
  loadComponent('./components/card.html'),
  loadComponent('./components/valentinecard.html')
]).then(([intro, heart, gallery, card, letter]) => {
  const w = document.querySelector('.main-wrapper');

  // montar panels
  w.insertAdjacentHTML('beforeend', createPanel({id:'intro',   html:intro}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'heart',   html:heart}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'gallery', html:gallery}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'card',    html:card}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'letter',  html:letter}));

  // inicializar componentes
  initIntroCard();
  initHeart();
  initCard();
  mostrarFotosUnaPorUna();
  initValentineCard();

  const ui = setupUI(w);

  // estado inicial
  ui.openOnly('intro');

  // botones fallback para los tres primeros pasos
  injectNext(w, 'intro',   'heart',   'Suivant');
  injectNext(w, 'heart',   'gallery', 'Suivant');
  injectNext(w, 'gallery', 'card',    'Suivant');

  // Intro → Corazón
  w.addEventListener('click', e=>{
    const n = e.target.closest('.flow-next[data-next="heart"]');
    if (!n) return;
    ui.enableTab('heart');
    ui.openOnly('heart');
  });

  // Corazón → Galería
  w.addEventListener('heart:completed', () => { ui.enableTab('gallery'); ui.openOnly('gallery'); });
  w.addEventListener('click', e=>{
    const n = e.target.closest('.flow-next[data-next="gallery"]');
    if (!n) return;
    ui.enableTab('gallery');
    ui.openOnly('gallery');
  });

  // Galería → Carta
  w.addEventListener('gallery:completed', () => { ui.enableTab('card'); ui.openOnly('card'); });
  w.addEventListener('click', e=>{
    const n = e.target.closest('.flow-next[data-next="card"]');
    if (!n) return;
    ui.enableTab('card');
    ui.openOnly('card');
  });

  // Carta → Carta final
  const finishFlow = () => {
    ui.enableTab('letter');
    ui.openOnly('letter');

    setupCTAReveal();                 // revela el botón final al llegar al fondo
    ui.ids.forEach(ui.enableTab);
    ui.showBar();
  };

  // botón dentro de la carta (última página) o evento propio
  w.addEventListener('card:completed', finishFlow);
  w.addEventListener('click', e=>{
    const n = e.target.closest('.flow-next[data-next="letter"]');
    if (!n) return;
    finishFlow();
  });

  // revela .footer-cta cuando scrolleás al final de la carta
  function setupCTAReveal(){
  const cta  = document.querySelector('.footer-cta'); // <- faltaba
  const cont = document.querySelector('#panel-letter .panel-content');
  if (!cta || !cont) return;

  // oculto hasta revelar
  cta.hidden = true;
  cta.classList.remove('is-revealed');

  // sentinel al final
  let s = cont.querySelector('.cta-sentinel');
  if (!s) {
    s = document.createElement('div');
    s.className = 'cta-sentinel';
    s.style.cssText = 'height:1px;margin-top:24px;';
    cont.appendChild(s);
  }

  const io = new IntersectionObserver((entries, obs)=>{
    if (entries.some(e => e.isIntersecting)) {
      cta.hidden = false;
      requestAnimationFrame(()=> cta.classList.add('is-revealed'));
      obs.disconnect();
    }
  }, { root: null, threshold: 0.6 });

  io.observe(s);
}

});
