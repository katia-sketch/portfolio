// fullpage jump navigation + Swiper coverflow + demos + form handling
document.addEventListener('DOMContentLoaded', () => {
  // --- fullpage jump logic (no smooth) ---
  const sections = Array.from(document.querySelectorAll('.section'));
  let current = 0;
  let isBusy = false;
  const JUMP_DELAY = 700;

  // initial position from hash if any
  const hash = window.location.hash;
  if (hash) {
    const idx = sections.findIndex(s => '#' + s.id === hash);
    if (idx >= 0) current = idx;
  }
  function jumpToIndex(idx) {
    idx = Math.max(0, Math.min(sections.length - 1, idx));
    current = idx;
    const target = sections[current];
    if (!target) return;
    target.scrollIntoView({ behavior: 'auto' });
    history.replaceState(null, '', '#' + target.id);
  }
  jumpToIndex(current);

  function goNext(){ if (current < sections.length - 1) jumpToIndex(current + 1); }
  function goPrev(){ if (current > 0) jumpToIndex(current - 1); }

  function isInProjects(target) {
    return !!(target && (target.closest && (target.closest('#projets') || target.closest('.projects-swiper') || target.closest('.project-card') || target.closest('.swiper'))));
  }

  // wheel => jump (except when pointer is over projects carousel)
  window.addEventListener('wheel', (e) => {
    if (isBusy) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (isInProjects(el)) return; // let Swiper handle
    const delta = e.deltaY;
    if (delta > 20) {
      if (current < sections.length - 1) { isBusy = true; goNext(); setTimeout(()=>isBusy=false, JUMP_DELAY); }
    } else if (delta < -20) {
      if (current > 0) { isBusy = true; goPrev(); setTimeout(()=>isBusy=false, JUMP_DELAY); }
    }
  }, { passive: true });

  // keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (isBusy) return;
    if (['ArrowDown','PageDown'].includes(e.key)) { e.preventDefault(); isBusy=true; goNext(); setTimeout(()=>isBusy=false,JUMP_DELAY); }
    if (['ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); isBusy=true; goPrev(); setTimeout(()=>isBusy=false,JUMP_DELAY); }
    if (e.key === 'Home') { e.preventDefault(); isBusy=true; jumpToIndex(0); setTimeout(()=>isBusy=false,JUMP_DELAY); }
    if (e.key === 'End') { e.preventDefault(); isBusy=true; jumpToIndex(sections.length-1); setTimeout(()=>isBusy=false,JUMP_DELAY); }
  });

  // touch swipe vertical
  (function(){
    let startY=0,endY=0,active=false;
    window.addEventListener('touchstart',(e)=>{ if(e.touches && e.touches.length){ startY = e.touches[0].clientY; active=true; } },{passive:true});
    window.addEventListener('touchmove',(e)=>{ if(!active) return; endY = e.touches[0].clientY; },{passive:true});
    window.addEventListener('touchend',()=>{ if(!active||isBusy){ active=false; return; } const diff = startY - endY; if(Math.abs(diff)>60){ isBusy=true; if(diff>0) goNext(); else goPrev(); setTimeout(()=>isBusy=false,JUMP_DELAY); } active=false; },{passive:true});
  })();

  // nav links (data-goto)
  document.querySelectorAll('[data-goto]').forEach(link=>{
    link.addEventListener('click',(e)=>{
      e.preventDefault();
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const idx = sections.findIndex(s=>('#'+s.id)===href);
      if (idx>=0) jumpToIndex(idx);
    });
  });

  // scroll-next button
  const toNext = document.getElementById('toNext');
  if (toNext) toNext.addEventListener('click', ()=> { if (current < sections.length-1) jumpToIndex(current+1); });

  // handle window resize to recenter
  window.addEventListener('resize', ()=> jumpToIndex(current));

  // --- Swiper coverflow initialization (projects) ---
  const projectsSwiper = new Swiper('.projects-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 48,
    loop: true,
    coverflowEffect: { rotate: 0, stretch: 60, depth: 220, modifier: 1, slideShadows: false },
    speed: 700,
    autoplay: { delay: 4500, disableOnInteraction: true },
    pagination: { el: '.projects-swiper .swiper-pagination', clickable: true },
    keyboard: { enabled: true },
    mousewheel: { forceToAxis: true, invert: false, sensitivity: 0.8 },
    breakpoints: { 0: { spaceBetween: 20 }, 700: { spaceBetween: 36 }, 1100: { spaceBetween: 48 } },
    on: {
      init() {
        this.slides.forEach(s => { const img = s.querySelector('.project-media'); if (img) img.style.transform = 'scale(1)'; });
        // ensure page index remains; if pointer over swiper we don't hijack wheel (isInProjects handles this)
      },
      slideChangeTransitionStart() {
        this.slides.forEach(slide => { const img = slide.querySelector('.project-media'); if (img) img.style.transform = 'scale(1)'; });
        const active = this.slides[this.activeIndex] && this.slides[this.activeIndex].querySelector('.project-media');
        if (active) active.style.transform = 'scale(1.06)';
      }
    }
  });

  // Prevent page jump while using mousewheel inside the swiper by listening enter/leave
  const swiperEl = document.querySelector('.projects-swiper');
  if (swiperEl) {
    swiperEl.addEventListener('mouseenter', ()=> { swiperEl.dataset.over = 'true'; });
    swiperEl.addEventListener('mouseleave', ()=> { swiperEl.dataset.over = 'false'; });
  }

  // --- demo toggles for skill examples ---
  document.querySelectorAll('.tag').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const demoId = btn.getAttribute('data-demo');
      document.querySelectorAll('.demo').forEach(d=> d.classList.add('hidden'));
      const show = document.getElementById(demoId);
      if (show) show.classList.remove('hidden');
    });
  });

  // --- contact form AJAX submit (Formspree compatible) ---
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.action || form.action.includes('{YOUR_FORM_ID}')) {
        status.textContent = '⚠️ Remplace {YOUR_FORM_ID} par ton endpoint Formspree.';
        return;
      }
      const data = new FormData(form);
      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (resp.ok) {
          form.reset();
          status.textContent = '✅ Merci — message envoyé.';
        } else {
          const json = await resp.json().catch(()=>null);
          status.textContent = json?.error || 'Erreur lors de l’envoi.';
        }
      } catch (err) {
        status.textContent = 'Erreur réseau — réessaye.';
      }
    });
  }

  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
