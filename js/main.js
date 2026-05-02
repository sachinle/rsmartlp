/* ============================================================
   RAISE SMART — School of Technology | main.js
   ============================================================ */

(function () {
    'use strict';

    /* ── 1. NAVBAR SCROLL EFFECT ── */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        toggleBackToTop();
    });

    /* ── 2. BACK TO TOP ── */
    const backToTopBtn = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (window.scrollY > 320) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ── 3. ANIMATED COUNTER ── */
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '+';
        const duration = 2000; // ms
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;

        const timer = setInterval(function () {
            frame++;
            // easeOutQuart for smooth deceleration
            const progress = 1 - Math.pow(1 - frame / totalFrames, 4);
            const current = Math.round(progress * target);

            el.textContent = current.toLocaleString() + suffix;

            if (frame === totalFrames) {
                clearInterval(timer);
                el.textContent = target.toLocaleString() + suffix;
            }
        }, frameDuration);
    }

    const counterObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    document.querySelectorAll('.counter-num[data-target]').forEach(function (el) {
        el.textContent = '0+';
        counterObserver.observe(el);
    });

    /* ── 4. SCROLL REVEAL ── */
    const revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    var revealSelectors = [
        '.training-card',
        '.program-card',
        '.eng-card',
        '.about-feat',
        '.mgmt-point',
        '.counter-item',
        '.about-strip-inner',
        '.cta-inner',
        '.hero-stats',
        '.intellect-card'
    ];

    revealSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el, i) {
            el.classList.add('reveal');
            el.style.transitionDelay = (i * 0.08) + 's';
            revealObserver.observe(el);
        });
    });

    /* ── 5. PROGRAM SLIDER + FILTER TABS ── */
    var programState = {
        category: 'all',
        index: 0,
        perView: 3
    };

    function getPerView() {
        var w = window.innerWidth;
        if (w <= 640) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    function getVisibleCards() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.program-card'));
        return cards.filter(function (card) {
            return programState.category === 'all' || card.dataset.category === programState.category;
        });
    }

    function renderSlider() {
        var allCards = document.querySelectorAll('.program-card');
        var visible = getVisibleCards();
        programState.perView = getPerView();

        allCards.forEach(function (card) {
            var match = programState.category === 'all' || card.dataset.category === programState.category;
            card.style.display = match ? 'flex' : 'none';
            card.style.flexDirection = 'column';
        });

        var maxIndex = Math.max(0, visible.length - programState.perView);
        if (programState.index > maxIndex) programState.index = maxIndex;
        if (programState.index < 0) programState.index = 0;

        var track = document.getElementById('program-cards');
        if (!track) return;
        var firstVisible = visible[0];
        if (!firstVisible) {
            track.style.transform = 'translateX(0)';
            updateDots(0, 0);
            updateNavButtons(0, 0);
            return;
        }
        var cardWidth = firstVisible.getBoundingClientRect().width;
        var gap = parseInt(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 28;
        var step = cardWidth + gap;
        track.style.transform = 'translateX(' + (-programState.index * step) + 'px)';

        updateDots(visible.length, programState.perView);
        updateNavButtons(visible.length, programState.perView);
    }

    function updateDots(total, perView) {
        var dotsContainer = document.getElementById('program-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        if (total <= perView) return;
        var pages = Math.max(1, total - perView + 1);
        for (var i = 0; i < pages; i++) {
            (function (i) {
                var d = document.createElement('button');
                d.className = 'program-dot' + (i === programState.index ? ' active' : '');
                d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                d.onclick = function () {
                    programState.index = i;
                    renderSlider();
                };
                dotsContainer.appendChild(d);
            })(i);
        }
    }

    function updateNavButtons(total, perView) {
        var prev = document.querySelector('.program-nav-prev');
        var next = document.querySelector('.program-nav-next');
        if (!prev || !next) return;
        var maxIndex = Math.max(0, total - perView);
        prev.disabled = programState.index <= 0;
        next.disabled = programState.index >= maxIndex;
        prev.classList.toggle('disabled', prev.disabled);
        next.classList.toggle('disabled', next.disabled);
    }

    window.filterPrograms = function (category, btn) {
        document.querySelectorAll('.program-tab').forEach(function (t) {
            t.classList.remove('active');
        });
        btn.classList.add('active');
        programState.category = category;
        programState.index = 0;
        renderSlider();
    };

    window.slidePrograms = function (direction) {
        if (direction === 'next') programState.index++;
        else programState.index--;
        renderSlider();
    };

    window.addEventListener('load', renderSlider);
    window.addEventListener('resize', renderSlider);
    setTimeout(renderSlider, 100);

    /* ── 6. SMOOTH ANCHOR SCROLL (offset for fixed nav) ── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navHeight = navbar.offsetHeight;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ── 7. HERO BADGE PULSE ── */
    window.addEventListener('load', function () {
        const badge = document.querySelector('.hero-badge');
        if (badge) badge.style.opacity = '1';
    });

    /* ── 8. MOBILE NAV TOGGLE ── */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
            navToggle.classList.toggle('active');
        });
        document.querySelectorAll('.nav-menu a').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

})();
