/* ============================================
   CRYSTAL FACILITY SOLUTIONS - CINEMATIC TESTIMONIALS MODULE
   Modern Event Listeners, No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    let currentIndex = 0;
    let autoSlideInterval = null;
    let progressInterval = null;
    let isPaused = false;
    let isAnimating = false;
    let touchStartX = 0;
    let touchEndX = 0;
    const autoplayDelay = 6000; // 6 seconds per slide

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let cards = null;
    let dots = null;
    let prevBtn = null;
    let nextBtn = null;
    let progressBar = null;
    let carousel = null;
    let totalCards = 0;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        cards = document.querySelectorAll('.testimonial-card');
        dots = document.querySelectorAll('.carousel-nav .dot');
        prevBtn = document.querySelector('.nav-prev');
        nextBtn = document.querySelector('.nav-next');
        progressBar = document.querySelector('.progress-bar');
        carousel = document.querySelector('.testimonials-carousel');
        totalCards = cards.length;

        if (totalCards === 0) {
            console.warn('No testimonial cards found in DOM');
            return;
        }

        setupNavigation();
        setupDotNavigation();
        setupHoverListeners();
        setupTouchSupport();
        setupKeyboardNav();
        setupVisibilityCheck();
        setupIntersectionObserver();

        // Initial state
        updateCarousel();
        startAutoplay();
    }

    // ============================================
    // NAVIGATION BUTTONS
    // ============================================
    function setupNavigation() {
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (isAnimating) return;
                prev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (isAnimating) return;
                next();
            });
        }
    }

    // ============================================
    // DOT NAVIGATION (Event Delegation)
    // ============================================
    function setupDotNavigation() {
        const dotsContainer = document.querySelector('.nav-dots');
        if (!dotsContainer) return;

        dotsContainer.addEventListener('click', function(e) {
            const dot = e.target.closest('.dot');
            if (!dot) return;

            const index = parseInt(dot.dataset.index);
            if (!isNaN(index) && !isAnimating) {
                goToSlide(index);
            }
        });
    }

    // ============================================
    // CAROUSEL LOGIC
    // ============================================
    function prev() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
        resetAutoplay();
    }

    function next() {
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

    function updateCarousel() {
        isAnimating = true;

        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');

            if (index === currentIndex) {
                card.classList.add('active');
                // Trigger text animation
                animateCardContent(card);
            } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else if (index === (currentIndex + 1) % totalCards) {
                card.classList.add('next');
            }
        });

        // Update dots
        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive.toString());
            dot.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Reset animation lock after transition
        setTimeout(function() {
            isAnimating = false;
        }, 800);
    }

    function animateCardContent(card) {
        const text = card.querySelector('.testimonial-text');
        const author = card.querySelector('.testimonial-author');

        if (text) {
            text.style.animation = 'none';
            void text.offsetWidth; // Trigger reflow
            text.style.animation = 'fadeInUp 0.8s ease forwards';
        }

        if (author) {
            author.style.animation = 'none';
            void author.offsetWidth;
            author.style.animation = 'fadeInUp 0.8s ease 0.2s forwards';
        }
    }

    // ============================================
    // AUTOPLAY WITH PROGRESS BAR
    // ============================================
    function startAutoplay() {
        stopAutoplay();

        if (progressBar) {
            progressBar.style.width = '0%';
        }

        let progress = 0;
        const progressStep = 100 / (autoplayDelay / 100);

        progressInterval = setInterval(function() {
            progress += progressStep;
            if (progressBar) {
                progressBar.style.width = Math.min(progress, 100) + '%';
            }
        }, 100);

        autoSlideInterval = setInterval(function() {
            if (!isPaused) {
                next();
            }
        }, autoplayDelay);
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
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    function pauseAutoplay() {
        isPaused = true;
    }

    function resumeAutoplay() {
        isPaused = false;
    }

    // ============================================
    // HOVER/FOCUS LISTENERS
    // ============================================
    function setupHoverListeners() {
        if (!carousel) return;

        const container = document.querySelector('.testimonials-container');
        if (!container) return;

        container.addEventListener('mouseenter', pauseAutoplay);
        container.addEventListener('mouseleave', resumeAutoplay);

        // Pause on focus, resume on blur (if leaving container)
        container.addEventListener('focusin', pauseAutoplay);
        container.addEventListener('focusout', function(e) {
            if (!container.contains(e.relatedTarget)) {
                resumeAutoplay();
            }
        });
    }

    // ============================================
    // TOUCH/SWIPE SUPPORT
    // ============================================
    function setupTouchSupport() {
        if (!carousel) return;

        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Pause while touching
        carousel.addEventListener('touchstart', pauseAutoplay, { passive: true });
        carousel.addEventListener('touchend', resumeAutoplay, { passive: true });
    }

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                if (!isAnimating) {
                    next();
                }
            } else {
                // Swipe right - previous
                if (!isAnimating) {
                    prev();
                }
            }
        }
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    function setupKeyboardNav() {
        if (!carousel) return;

        carousel.setAttribute('tabindex', '0');
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-label', 'Client testimonials carousel');

        carousel.addEventListener('keydown', function(e) {
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
        });
    }

    // ============================================
    // VISIBILITY API - Pause when tab hidden
    // ============================================
    function setupVisibilityCheck() {
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
    }

    // ============================================
    // INTERSECTION OBSERVER - Pause when not visible
    // ============================================
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, {
            threshold: 0.5
        });

        const section = document.querySelector('.testimonials-cinematic');
        if (section) {
            observer.observe(section);
        }
    }

    // ============================================
    // MAGNETIC BUTTON EFFECT (Optional Enhancement)
    // ============================================
    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.nav-btn');

        buttons.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const maxMove = 10;
                const moveX = (x / rect.width) * maxMove;
                const moveY = (y / rect.height) * maxMove;

                btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
            });

            btn.addEventListener('mouseleave', function() {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ============================================
    // CTA BUTTON SCROLL
    // ============================================
    function initCtaButton() {
        const ctaBtn = document.querySelector('.btn-cta[data-scroll="contact"]');
        if (!ctaBtn) return;

        ctaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = ctaBtn.getAttribute('data-scroll');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Set focus for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    }

    // ============================================
    // RIPPLE EFFECT FOR BUTTONS
    // ============================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.nav-btn, .btn-cta');

        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = [
                    'position: absolute;',
                    'background: rgba(255, 255, 255, 0.5);',
                    'border-radius: 50%;',
                    'pointer-events: none;',
                    'transform: scale(0);',
                    'animation: ripple 0.6s ease-out;',
                    'left: ' + x + 'px;',
                    'top: ' + y + 'px;',
                    'width: 20px;',
                    'height: 20px;',
                    'margin-left: -10px;',
                    'margin-top: -10px;'
                ].join('');

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple keyframes if not present
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
            document.head.appendChild(style);
        }
    }

    // ============================================
    // PARALLAX EFFECT ON SCROLL
    // ============================================
    function initParallax() {
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    function handleParallax() {
        const section = document.querySelector('.testimonials-cinematic');
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollProgress = -rect.top / window.innerHeight;

        // Only apply when section is in view
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const glows = section.querySelectorAll('.bg-glow');
            glows.forEach(function(glow, index) {
                const speed = (index + 1) * 20;
                const yPos = scrollProgress * speed;
                glow.style.transform = 'translateY(' + yPos + 'px)';
            });

            // Parallax for floating quotes
            const quotes = section.querySelectorAll('.quote-mark');
            quotes.forEach(function(quote, index) {
                const speed = (index + 1) * 10;
                const yPos = scrollProgress * speed;
                quote.style.transform = 'translateY(' + yPos + 'px)';
            });
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        init();
        initMagneticButtons();
        initCtaButton();
        initRippleEffect();
        initParallax();
    });

})();