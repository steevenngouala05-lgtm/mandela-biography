/* ============================================================
   NELSON MANDELA — BIOGRAPHY WEBSITE
   Interactive Module
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     DOM Cache
     ---------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const navHeader   = $('#navHeader');
  const navToggle   = $('#navToggle');
  const navLinks    = $('#navLinks');
  const navAnchors  = $$('.nav__link');
  const heroParallax     = $('.hero__parallax');
  const statsParallax    = $('.stats__parallax');
  const finalParallax    = $('.final-quote__parallax');
  const statNumbers      = $$('.stats__number');
  const revealElements   = $$('.reveal');
  const sections         = $$('section[id]');

  /* ----------------------------------------------------------
     Navigation — Scroll Behaviour
     ---------------------------------------------------------- */
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }

  function updateOnScroll() {
    ticking = false;

    // Navbar background
    if (lastScrollY > 80) {
      navHeader.classList.add('is-scrolled');
    } else {
      navHeader.classList.remove('is-scrolled');
    }

    // Parallax
    applyParallax(heroParallax, lastScrollY, 0.35);
    applyParallax(statsParallax, lastScrollY, 0.2);
    applyParallax(finalParallax, lastScrollY, 0.2);

    // Active nav link
    highlightActiveSection();
  }

  function applyParallax(element, scrollY, speed) {
    if (!element) return;
    const rect = element.parentElement.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    if (inView) {
      const offset = (scrollY - element.parentElement.offsetTop) * speed;
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  }

  function highlightActiveSection() {
    let currentId = '';
    const scrollPos = lastScrollY + window.innerHeight * 0.35;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navAnchors.forEach(link => {
      link.classList.toggle(
        'is-active',
        link.getAttribute('href') === `#${currentId}`
      );
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----------------------------------------------------------
     Mobile Menu
     ---------------------------------------------------------- */
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ----------------------------------------------------------
     Intersection Observer — Reveal Animations
     ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.1}s`;
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Counter Animation
     ---------------------------------------------------------- */
  let countersTriggered = false;

  function animateCounters() {
    if (countersTriggered) return;
    countersTriggered = true;

    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = target > 100 ? 2200 : 1800;
      const startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = Math.round(easedProgress * target);

        el.textContent = current.toLocaleString('fr-FR') + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = $('#chiffres');
  if (statsSection) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    counterObserver.observe(statsSection);
  }

  /* ----------------------------------------------------------
     Smooth Scroll (enhanced for Safari)
     ---------------------------------------------------------- */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = $(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const offset = navHeader.offsetHeight + 20;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     Staggered Reveal for Grid Items
     ---------------------------------------------------------- */
  const staggerContainers = [
    '.quotes__grid',
    '.stats__grid',
    '.gallery__grid',
    '.legacy__grid'
  ];

  staggerContainers.forEach(selector => {
    const container = $(selector);
    if (!container) return;

    const children = $$('.reveal', container);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  /* ----------------------------------------------------------
     Keyboard Accessibility — Escape closes mobile menu
     ---------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });

  /* ----------------------------------------------------------
     Init — Trigger first scroll check
     ---------------------------------------------------------- */
  updateOnScroll();

})();
