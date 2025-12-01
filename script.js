// Init: Locomotive Scroll + GSAP + Swiper + form handling
document.addEventListener('DOMContentLoaded', function () {
  // year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // LOCOMOTIVE SCROLL
  const loco = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1,
    class: 'is-reveal'
  });

  // connect GSAP ScrollTrigger with Locomotive
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.scrollerProxy('[data-scroll-container]', {
    scrollTop(value) {
      return arguments.length ? loco.scrollTo(value, 0, 0) : loco.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    // pinType: document.querySelector('[data-scroll-container]').style.transform ? "transform" : "fixed"
  });

  loco.on('scroll', ScrollTrigger.update);

  // basic GSAP entrance animations for each section
  document.querySelectorAll('[data-scroll-section]').forEach((section) => {
    gsap.from(section.querySelectorAll('h2, h1, p, .project-card, img, .project-card h4'), {
      scrollTrigger: {
        trigger: section,
        scroller: '[data-scroll-container]',
        start: 'top 75%',
      },
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out'
    });
  });

  // "scroll to next" button logic using locomotive
  const nextBtn = document.getElementById('scrollNext');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const sections = [...document.querySelectorAll('[data-scroll-section]')];
      const currentY = loco.scroll.instance.scroll.y;
      const next = sections.find(s => s.offsetTop > currentY + 20) || sections[sections.length - 1];
      loco.scrollTo(next);
    });
  }

  // SWIPER (horizontal projects)
  const swiper = new Swiper('.mySwiper', {
    slidesPerView: 1.2,
    spaceBetween: 20,
    centeredSlides: false,
    breakpoints: {
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 3 },
    }
  });

  // nav for swiper
  document.getElementById('projPrev').addEventListener('click', () => swiper.slidePrev());
  document.getElementById('projNext').addEventListener('click', () => swiper.slideNext());

  // Smooth anchor links using locomotive
  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const href = el.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) loco.scrollTo(target);
    });
  });

  // FORM: AJAX submit to Formspree (works on GitHub Pages)
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
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (res.ok) {
          form.reset();
          status.textContent = '✅ Merci — message envoyé.';
        } else {
          const json = await res.json().catch(() => null);
          status.textContent = json?.error || 'Erreur lors de l’envoi.';
        }
      } catch (err) {
        status.textContent = 'Erreur réseau — réessaye.';
      }
    });
  }

  // refresh Locomotive on images loaded (to get correct offsets)
  window.addEventListener('load', () => loco.update());
});
