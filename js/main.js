(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initFormHandler();
    initSmoothScroll();
    initMobileNav();
    initScrollAnimations();
  });

  /**
   * Form submission handler
   * Intercepts form submit, validates email, POSTs via fetch, shows feedback.
   */
  function initFormHandler() {
    var form = document.querySelector('.signup__form');
    if (!form) return;

    var input = form.querySelector('.signup__input');
    var submitBtn = form.querySelector('.signup__submit');
    var successMsg = form.querySelector('.signup__success');
    var errorMsg = form.querySelector('.signup__error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = input.value.trim();
      if (!isValidEmail(email)) {
        showMessage(errorMsg, successMsg);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';

      fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email })
      })
        .then(function (response) {
          if (response.ok) {
            showMessage(successMsg, errorMsg);
            form.reset();
          } else {
            showMessage(errorMsg, successMsg);
          }
        })
        .catch(function () {
          showMessage(errorMsg, successMsg);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Join the Waitlist';
        });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showMessage(toShow, toHide) {
    toShow.hidden = false;
    toHide.hidden = true;
  }

  /**
   * Smooth scroll for anchor links with sticky nav offset.
   */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    var header = document.querySelector('.site-header');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var offset = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /**
   * Mobile navigation toggle with accessibility support.
   */
  function initMobileNav() {
    var toggle = document.querySelector('.nav__toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      setNavState(!expanded);
    });

    // Close on link click
    menu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavState(false);
      });
    });

    // Close on overlay click
    var overlay = document.querySelector('.nav__overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        setNavState(false);
      });
    }

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !menu.contains(e.target) && !toggle.contains(e.target)) {
        setNavState(false);
      }
    });

    // Trap focus within open nav
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true') return;

      var focusable = menu.querySelectorAll('a, button');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    function setNavState(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      var overlay = document.querySelector('.nav__overlay');
      if (overlay) {
        overlay.classList.toggle('is-visible', open);
      }
    }
  }

  /**
   * Intersection observer for scroll-triggered fade-in animations.
   */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var sections = document.querySelectorAll('.feature-card, .step, .signup__inner');
    sections.forEach(function (el) {
      el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
