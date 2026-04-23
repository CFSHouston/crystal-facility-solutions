/* ============================================
   TESTIMONIALS MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        autoplayDelay: 6000,
        animationLockMs: 800,
        swipeThreshold: 50,
        scrollThrottleMs: 16,
        marqueeSpeed: 0.5,
        marqueeScrollAmount: 300,
        marqueePauseDuration: 1500
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        timeouts: [],
        intervals: [],
        rafIds: [],
        boundHandlers: {}
    };

    // ─── Testimonials Carousel ──────────────────────────────────
    function initTestimonials() {
        const cards = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.carousel-nav .dot');
        const prevBtn = document.querySelector('.nav-prev');
        const nextBtn = document.querySelector('.nav-next');
        const progressBar = document.querySelector('.progress-bar');
        const carousel = document.querySelector('.testimonials-carousel');
        const totalCards = cards.length;

        if (totalCards === 0) return;

        let currentIndex = 0;
        let isAnimating = false;
        let isPaused = false;
        let autoSlideInterval = null;
        let progressInterval = null;
        let touchStartX = 0;
        let touchEndX = 0;

        function updateCarousel() {
            isAnimating = true;

            cards.forEach((card, index) => {
                card.classList.remove('active', 'prev', 'next');
                if (index === currentIndex) {
                    card.classList.add('active');
                    animateCardContent(card);
                } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                    card.classList.add('prev');
                } else if (index === (currentIndex + 1) % totalCards) {
                    card.classList.add('next');
                }
            });

            dots.forEach((dot, index) => {
                const isActive = index === currentIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-selected', isActive.toString());
                dot.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            const timeoutId = setTimeout(() => { isAnimating = false; }, CONFIG.animationLockMs);
            state.timeouts.push(timeoutId);
        }

        function animateCardContent(card) {
            const text = card.querySelector('.testimonial-text');
            const author = card.querySelector('.testimonial-author');

            if (text) {
                text.style.animation = 'none';
                void text.offsetWidth;
                text.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (author) {
                author.style.animation = 'none';
                void author.offsetWidth;
                author.style.animation = 'fadeInUp 0.8s ease 0.2s forwards';
            }
        }

        function prev() {
            if (isAnimating) return;
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
            resetAutoplay();
        }

        function next() {
            if (isAnimating) return;
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
            resetAutoplay();
        }

        function goToSlide(index) {
            if (index === currentIndex || isAnimating) return;
            currentIndex = index;
            updateCarousel();
            resetAutoplay();
        }

        function startAutoplay() {
            stopAutoplay();
            if (progressBar) progressBar.style.width = '0%';

            let progress = 0;
            const progressStep = 100 / (CONFIG.autoplayDelay / 100);

            progressInterval = setInterval(() => {
                progress += progressStep;
                if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
            }, 100);
            state.intervals.push(progressInterval);

            autoSlideInterval = setInterval(() => {
                if (!isPaused) next();
            }, CONFIG.autoplayDelay);
            state.intervals.push(autoSlideInterval);
        }

        function stopAutoplay() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            if (progressBar) progressBar.style.width = '0%';
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        function pauseAutoplay() { isPaused = true; }
        function resumeAutoplay() { isPaused = false; }

        // Navigation buttons
        if (prevBtn) {
            const onClick = () => { if (!isAnimating) prev(); };
            prevBtn.addEventListener('click', onClick);
            if (!state.boundHandlers.nav) state.boundHandlers.nav = [];
            state.boundHandlers.nav.push({ el: prevBtn, onClick });
        }
        if (nextBtn) {
            const onClick = () => { if (!isAnimating) next(); };
            nextBtn.addEventListener('click', onClick);
            if (!state.boundHandlers.nav) state.boundHandlers.nav = [];
            state.boundHandlers.nav.push({ el: nextBtn, onClick });
        }

        // Dot navigation (event delegation)
        const dotsContainer = document.querySelector('.nav-dots');
        if (dotsContainer) {
            const onClick = (e) => {
                const dot = e.target.closest('.dot');
                if (!dot) return;
                const index = parseInt(dot.dataset.index);
                if (!isNaN(index) && !isAnimating) goToSlide(index);
            };
            dotsContainer.addEventListener('click', onClick);
            if (!state.boundHandlers.dots) state.boundHandlers.dots = [];
            state.boundHandlers.dots.push({ el: dotsContainer, onClick });
        }

        // Focus listeners (keyboard accessibility only — hover no longer pauses autoplay)
        const container = document.querySelector('.testimonials-container');
        if (container) {
            const onFocusIn = pauseAutoplay;
            const onFocusOut = (e) => {
                if (!container.contains(e.relatedTarget)) resumeAutoplay();
            };

            container.addEventListener('focusin', onFocusIn);
            container.addEventListener('focusout', onFocusOut);

            if (!state.boundHandlers.container) state.boundHandlers.container = [];
            state.boundHandlers.container.push(
                { el: container, onFocusIn, onFocusOut }
            );
        }

        // Card hover listeners (pause autoplay only when hovering over a card)
        cards.forEach(card => {
            const onMouseEnter = pauseAutoplay;
            const onMouseLeave = resumeAutoplay;
            card.addEventListener('mouseenter', onMouseEnter);
            card.addEventListener('mouseleave', onMouseLeave);
            if (!state.boundHandlers.cardHover) state.boundHandlers.cardHover = [];
            state.boundHandlers.cardHover.push({ el: card, onMouseEnter, onMouseLeave });
        });

        // Touch support
        if (carousel) {
            const onTouchStart = (e) => {
                touchStartX = e.changedTouches[0].screenX;
                pauseAutoplay();
            };
            const onTouchEnd = (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > CONFIG.swipeThreshold) {
                    if (diff > 0 && !isAnimating) next();
                    else if (diff < 0 && !isAnimating) prev();
                }
                resumeAutoplay();
            };

            carousel.addEventListener('touchstart', onTouchStart, { passive: true });
            carousel.addEventListener('touchend', onTouchEnd, { passive: true });

            if (!state.boundHandlers.touch) state.boundHandlers.touch = [];
            state.boundHandlers.touch.push({ el: carousel, onTouchStart, onTouchEnd });
        }

        // Keyboard navigation
        if (carousel) {
            carousel.setAttribute('tabindex', '0');
            carousel.setAttribute('role', 'region');
            carousel.setAttribute('aria-label', 'Client testimonials carousel');

            const onKeyDown = (e) => {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (!isAnimating) prev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        if (!isAnimating) next();
                        break;
                    case 'Home':
                        e.preventDefault();
                        if (!isAnimating) goToSlide(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        if (!isAnimating) goToSlide(totalCards - 1);
                        break;
                }
            };
            carousel.addEventListener('keydown', onKeyDown);
            if (!state.boundHandlers.keyboard) state.boundHandlers.keyboard = [];
            state.boundHandlers.keyboard.push({ el: carousel, onKeyDown });
        }

        // Visibility API
        const onVisibilityChange = () => {
            if (document.hidden) stopAutoplay();
            else startAutoplay();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        state.boundHandlers.visibility = onVisibilityChange;

        // Intersection Observer
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) startAutoplay();
                    else stopAutoplay();
                });
            }, { threshold: 0.5 });

            const section = document.querySelector('.testimonials-cinematic');
            if (section) observer.observe(section);
            state.boundHandlers.observer = observer;
        }

        // Magnetic buttons
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            const onMouseMove = (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const maxMove = 10;
                btn.style.transform = `translate(${(x / rect.width) * maxMove}px, ${(y / rect.height) * maxMove}px)`;
            };
            const onMouseLeave = () => { btn.style.transform = 'translate(0, 0)'; };

            btn.addEventListener('mousemove', onMouseMove);
            btn.addEventListener('mouseleave', onMouseLeave);

            if (!state.boundHandlers.magnetic) state.boundHandlers.magnetic = [];
            state.boundHandlers.magnetic.push({ el: btn, onMouseMove, onMouseLeave });
        });

        // CTA button scroll
        const ctaBtn = document.querySelector('.btn-cta[data-scroll="contact"]');
        if (ctaBtn) {
            const onClick = (e) => {
                e.preventDefault();
                const target = document.getElementById('contact');
                if (target) {
                    window.scrollTo({
                        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                        behavior: 'smooth'
                    });
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            };
            ctaBtn.addEventListener('click', onClick);
            if (!state.boundHandlers.cta) state.boundHandlers.cta = [];
            state.boundHandlers.cta.push({ el: ctaBtn, onClick });
        }

        // Ripple effect
        const rippleButtons = document.querySelectorAll('.nav-btn, .btn-cta');
        rippleButtons.forEach(button => {
            const onClick = (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                ripple.style.marginLeft = '-10px';
                ripple.style.marginTop = '-10px';

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                const timeoutId = setTimeout(() => ripple.remove(), 600);
                state.timeouts.push(timeoutId);
            };
            button.addEventListener('click', onClick);
            if (!state.boundHandlers.ripple) state.boundHandlers.ripple = [];
            state.boundHandlers.ripple.push({ el: button, onClick });
        });

        // Parallax
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            const rafId = requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            state.rafIds.push(rafId);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        state.boundHandlers.parallax = onScroll;

        // Initial state
        updateCarousel();
        startAutoplay();
    }

    function handleParallax() {
        const section = document.querySelector('.testimonials-cinematic');
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollProgress = -rect.top / window.innerHeight;

        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.querySelectorAll('.bg-glow').forEach((glow, index) => {
                glow.style.transform = `translateY(${scrollProgress * (index + 1) * 20}px)`;
            });
            section.querySelectorAll('.quote-mark').forEach((quote, index) => {
                quote.style.transform = `translateY(${scrollProgress * (index + 1) * 10}px)`;
            });
        }
    }

    // ─── Clients Marquee ──────────────────────────────────────
    function initMarquee() {
        const marquee = document.getElementById('clientMarquee');
        const track = document.getElementById('marqueeTrack');
        const prevBtn = document.querySelector('.marquee-prev');
        const nextBtn = document.querySelector('.marquee-next');

        if (!marquee || !track || !prevBtn || !nextBtn) return;

        let position = 0;
        let isPaused = false;
        let animationId = null;
        let contentWidth = 0;

        function calculateWidth() {
            contentWidth = track.scrollWidth / 2;
        }

        function animate() {
            if (!isPaused) {
                position -= CONFIG.marqueeSpeed;
                if (Math.abs(position) >= contentWidth) position = 0;
                track.style.transform = `translateX(${position}px)`;
            }
            animationId = requestAnimationFrame(animate);
            state.rafIds.push(animationId);
        }

        calculateWidth();
        animate();

        const onResize = () => calculateWidth();
        window.addEventListener('resize', onResize, { passive: true });
        if (!state.boundHandlers.marqueeResize) state.boundHandlers.marqueeResize = [];
        state.boundHandlers.marqueeResize.push({ onResize });

        const onPrevClick = () => {
            position += CONFIG.marqueeScrollAmount;
            if (position > 0) position = -contentWidth + CONFIG.marqueeScrollAmount;
            track.style.transform = `translateX(${position}px)`;
            isPaused = true;
            const timeoutId = setTimeout(() => { isPaused = false; }, CONFIG.marqueePauseDuration);
            state.timeouts.push(timeoutId);
        };

        const onNextClick = () => {
            position -= CONFIG.marqueeScrollAmount;
            if (Math.abs(position) >= contentWidth) position = 0;
            track.style.transform = `translateX(${position}px)`;
            isPaused = true;
            const timeoutId = setTimeout(() => { isPaused = false; }, CONFIG.marqueePauseDuration);
            state.timeouts.push(timeoutId);
        };

        prevBtn.addEventListener('click', onPrevClick);
        nextBtn.addEventListener('click', onNextClick);

        if (!state.boundHandlers.marqueeNav) state.boundHandlers.marqueeNav = [];
        state.boundHandlers.marqueeNav.push({ el: prevBtn, onClick: onPrevClick });
        state.boundHandlers.marqueeNav.push({ el: nextBtn, onClick: onNextClick });

        const onMouseEnter = () => { isPaused = true; };
        const onMouseLeave = () => { isPaused = false; };
        marquee.addEventListener('mouseenter', onMouseEnter);
        marquee.addEventListener('mouseleave', onMouseLeave);

        if (!state.boundHandlers.marqueeHover) state.boundHandlers.marqueeHover = [];
        state.boundHandlers.marqueeHover.push({ el: marquee, onMouseEnter, onMouseLeave });

        // Touch support
        let touchStartX = 0;
        const onTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            isPaused = true;
        };
        const onTouchEnd = (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > CONFIG.swipeThreshold) {
                if (diff > 0) position -= CONFIG.marqueeScrollAmount;
                else position += CONFIG.marqueeScrollAmount;
                if (position > 0) position = -contentWidth + CONFIG.marqueeScrollAmount;
                if (Math.abs(position) >= contentWidth) position = 0;
                track.style.transform = `translateX(${position}px)`;
            }
            isPaused = false;
        };

        marquee.addEventListener('touchstart', onTouchStart, { passive: true });
        marquee.addEventListener('touchend', onTouchEnd, { passive: true });

        if (!state.boundHandlers.marqueeTouch) state.boundHandlers.marqueeTouch = [];
        state.boundHandlers.marqueeTouch.push({ el: marquee, onTouchStart, onTouchEnd });

        // Visibility
        const onVisibilityChange = () => {
            if (document.hidden) cancelAnimationFrame(animationId);
            else animate();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        state.boundHandlers.marqueeVisibility = onVisibilityChange;
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];
        state.intervals.forEach(id => clearInterval(id));
        state.intervals = [];
        state.rafIds.forEach(id => cancelAnimationFrame(id));
        state.rafIds = [];

        Object.keys(state.boundHandlers).forEach(key => {
            const handlers = state.boundHandlers[key];
            if (Array.isArray(handlers)) {
                handlers.forEach(h => {
                    if (h.el) {
                        if (h.onClick) h.el.removeEventListener('click', h.onClick);
                        if (h.onMouseEnter) h.el.removeEventListener('mouseenter', h.onMouseEnter);
                        if (h.onMouseLeave) h.el.removeEventListener('mouseleave', h.onMouseLeave);
                        if (h.onFocusIn) h.el.removeEventListener('focusin', h.onFocusIn);
                        if (h.onFocusOut) h.el.removeEventListener('focusout', h.onFocusOut);
                        if (h.onTouchStart) h.el.removeEventListener('touchstart', h.onTouchStart);
                        if (h.onTouchEnd) h.el.removeEventListener('touchend', h.onTouchEnd);
                        if (h.onKeyDown) h.el.removeEventListener('keydown', h.onKeyDown);
                        if (h.onMouseMove) h.el.removeEventListener('mousemove', h.onMouseMove);
                        if (h.onFocus) h.el.removeEventListener('focus', h.onFocus);
                        if (h.onBlur) h.el.removeEventListener('blur', h.onBlur);
                    }
                });
            } else if (key === 'observer' && handlers) {
                handlers.disconnect();
            } else if (key === 'visibility' || key === 'parallax' || key === 'marqueeVisibility') {
                document.removeEventListener('visibilitychange', handlers);
                window.removeEventListener('scroll', handlers);
            } else if (key === 'marqueeResize') {
                window.removeEventListener('resize', handlers.onResize);
            }
        });

        state.boundHandlers = {};
        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;
        initTestimonials();
        initMarquee();
        state.isInitialized = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();