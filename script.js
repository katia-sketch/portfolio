/* fullpage snap helper: scroll to next section button */
document.addEventListener('DOMContentLoaded', function () {
  // UPDATE FOOTER YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll indicator -> go to next snap section
  const scrollNext = document.getElementById('scrollNext');
  if (scrollNext) {
    scrollNext.addEventListener('click', () => {
      const main = document.getElementById('main-snap');
      if (!main) return;
      // find currently visible section
      const sections = Array.from(document.querySelectorAll('.snap-section'));
      const middle = main.scrollTop + (window.innerHeight / 2);
      let currentIndex = sections.findIndex(sec => {
        const rect = sec.getBoundingClientRect();
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        return middle >= top && middle <= bottom;
      });
      if (currentIndex === -1) currentIndex = 0;
      const next = sections[currentIndex + 1] || sections[sections.length - 1];
      next.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Projects horizontal scrolling controls
  const scrollContainer = document.getElementById('projectsScroll');
  const prevBtn = document.getElementById('projPrev');
  const nextBtn = document.getElementById('projNext');

  function scrollByCard(dir = 1) {
    if (!scrollContainer) return;
    // scroll by container width (approx one "page" of cards)
    const amount = Math.round(scrollContainer.clientWidth * 0.8) * dir;
    scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));

  // enable mouse-drag to scroll horizontally (nice UX)
  (function enableDragScroll(el) {
    if (!el) return;
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', (e) => {
      isDown = true;
      el.classList.add('dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll-fast
      el.scrollLeft = scrollLeft - walk;
    });
    // touch support handled by native overflow scrolling
  })(scrollContainer);

  // CONTACT FORM: AJAX submit (enhanced UX) — will still work with Formspree endpoint
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.action || form.action.includes('{YOUR_FORM_ID}')) {
        status.textContent = '⚠️ Remplace {YOUR_FORM_ID} par ton identifiant Formspree (voir instructions).';
        return;
      }
      const data = new FormData(form);
      try {
        const resp = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (resp.ok) {
          form.reset();
          status.textContent = '✅ Merci — message envoyé.';
        } else {
          const json = await resp.json().catch(()=>null);
          status.textContent = (json && json.error) ? `Erreur: ${json.error}` : 'Erreur envoi du formulaire.';
        }
      } catch (err) {
        status.textContent = 'Erreur réseau — vérifie ta connexion.';
      }
    });
  }

  // keyboard accessibility for horizontal projects (left/right)
  if (scrollContainer) {
    scrollContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { scrollByCard(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { scrollByCard(-1); e.preventDefault(); }
    });
  }

}); // DOMContentLoaded
