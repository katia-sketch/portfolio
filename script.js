// Update year
document.getElementById("year").textContent = new Date().getFullYear();

// Init Swiper
const swiper = new Swiper('.swiper', {
  loop: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  spaceBetween: 14,
  grabCursor: true,
  effect: 'coverflow',
  coverflowEffect: {
    rotate: 0,
    stretch: 20,
    depth: 120,
    modifier: 1,
    slideShadows: false
  },
  autoplay: {
    delay: 4000,
    disableOnInteraction: false
  },
  breakpoints: {
    0: { slidesPerView: 1.05 },
    640: { slidesPerView: 1.2 },
    900: { slidesPerView: 1.5 }
  }
});

// Buttons prev/next
document.getElementById('prevBtn').onclick = () => swiper.slidePrev();
document.getElementById('nextBtn').onclick = () => swiper.slideNext();

// Scroll down button → next section
document.getElementById('scrollDownBtn').onclick = () => {
  document.querySelector('#projets').scrollIntoView({ behavior: 'smooth' });
};

// Hide scroll indicator when not in hero
const sideScroll = document.getElementById('sideScroll');
const hero = document.getElementById('hero');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    sideScroll.style.opacity = e.isIntersecting ? '1' : '0';
    sideScroll.style.pointerEvents = e.isIntersecting ? '' : 'none';
  });
}, { threshold: 0.6 });

observer.observe(hero);

