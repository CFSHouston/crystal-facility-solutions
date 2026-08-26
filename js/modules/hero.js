/* ============================================
   HERO MODULE - Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Typing Animation Config ───────────────────────────────
    const TYPING_CONFIG = {
        words: ['CLEANING', 'MAINTENANCE', 'LANDSCAPING', 'TRANSPORTATION'],
        typeSpeed: 120,
        deleteSpeed: 60,
        pauseTime: 800,
        startDelay: 1000
    };

    let typingElement = null;
    let cursorElement = null;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let typingTimeoutId = null;
    let typingActive = true;

    function initTyping() {
        typingElement = document.querySelector('.typing-text');
        cursorElement = document.querySelector('.typing-cursor');

        if (!typingElement || !cursorElement) {
            showStaticFallback();
            return;
        }

        typingElement.textContent = '';
        wordIndex = 0;
        charIndex = 0;
        isDeleting = false;
        isPaused = false;

        typingTimeoutId = setTimeout(() => {
            if (typingActive) typingLoop();
        }, TYPING_CONFIG.startDelay);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                typingActive = false;
                if (typingTimeoutId) clearTimeout(typingTimeoutId);
            } else {
                typingActive = true;
                typingTimeoutId = setTimeout(typingLoop, 200);
            }
        });
    }

    function showStaticFallback() {
        const line3 = document.querySelector('.title-line-3');
        if (line3) {
            line3.innerHTML = '<span class="typing-fallback">Cleaning &middot; Transportation &middot; Landscaping &middot; Maintenance</span>';
        }
    }

    function typingLoop() {
        if (!typingActive || !typingElement) return;

        if (!TYPING_CONFIG.words || TYPING_CONFIG.words.length === 0) {
            typingElement.textContent = 'Facility Services';
            return;
        }

        const currentWord = TYPING_CONFIG.words[wordIndex];

        if (typeof currentWord !== 'string') {
            wordIndex = (wordIndex + 1) % TYPING_CONFIG.words.length;
            typingTimeoutId = setTimeout(typingLoop, 100);
            return;
        }

        if (isPaused) {
            isPaused = false;
            isDeleting = true;
            typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.pauseTime);
            return;
        }

        if (isDeleting) {
            charIndex = Math.max(0, charIndex - 1);
            typingElement.textContent = currentWord.substring(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % TYPING_CONFIG.words.length;
                typingTimeoutId = setTimeout(typingLoop, 300);
            } else {
                typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.deleteSpeed);
            }
        } else {
            charIndex = Math.min(currentWord.length, charIndex + 1);
            typingElement.textContent = currentWord.substring(0, charIndex);
            if (charIndex === currentWord.length) {
                isPaused = true;
                typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.pauseTime);
            } else {
                typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.typeSpeed);
            }
        }
    }

    // ─── Background Image Rotator ─────────────────────────────
    const HERO_IMAGES_DESKTOP = [
        { src: './images/cleanings.webp', alt: 'Crystal Facility Solutions - Premium Services' },
        { src: './images/transportation.webp', alt: 'Safe School Transportation Services' },
        { src: './images/landscaping.webp', alt: 'Professional Landscaping Services' },
        { src: './images/maintenance.webp', alt: 'Comprehensive Maintenance Services' }
    ];

    const HERO_IMAGES_MOBILE = [
        { src: './images/cleaning_mobile.webp', alt: 'Crystal Facility Solutions - Premium Services' },
        { src: './images/transportation_mobile.webp', alt: 'Safe School Transportation Services' },
        { src: './images/landscaping_mobile.webp', alt: 'Professional Landscaping Services' },
        { src: './images/maintenance_mobile.webp', alt: 'Comprehensive Maintenance Services' }
    ];

    let currentImageIndex = 0;
    let imageRotationInterval = null;
    let heroImageEl = null;
    let isFirstImageLoaded = false;
    let isMobile = false;

    function getHeroImages() {
        return isMobile ? HERO_IMAGES_MOBILE : HERO_IMAGES_DESKTOP;
    }

    function checkMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function initImageRotator() {
        heroImageEl = document.getElementById('heroImage');
        if (!heroImageEl) return;

        isMobile = checkMobile();
        heroImageEl.style.opacity = '0';

        let loadedCount = 0;
        const images = getHeroImages();
        const totalImages = images.length;

        images.forEach((imgData, index) => {
            const preload = new Image();

            preload.onload = () => {
                loadedCount++;
                if (index === 0 && !isFirstImageLoaded) {
                    isFirstImageLoaded = true;
                    heroImageEl.src = imgData.src;
                    heroImageEl.alt = imgData.alt;
                    heroImageEl.classList.add('loaded');
                    requestAnimationFrame(() => {
                        heroImageEl.style.opacity = '1';
                    });
                }
                if (loadedCount === totalImages) {
                    startImageRotation();
                }
            };

            preload.onerror = () => {
                loadedCount++;
                console.warn('Failed to preload hero image:', imgData.src);
                if (loadedCount === totalImages) {
                    if (!isFirstImageLoaded) {
                        isFirstImageLoaded = true;
                        heroImageEl.src = images[0].src;
                        heroImageEl.alt = images[0].alt;
                        heroImageEl.classList.add('loaded');
                        heroImageEl.style.opacity = '1';
                    }
                    startImageRotation();
                }
            };

            preload.src = imgData.src;
        });

        // Fallback timeout
        setTimeout(() => {
            if (!isFirstImageLoaded) {
                isFirstImageLoaded = true;
                const images = getHeroImages();
                heroImageEl.src = images[0].src;
                heroImageEl.alt = images[0].alt;
                heroImageEl.classList.add('loaded');
                heroImageEl.style.opacity = '1';
                startImageRotation();
            }
        }, 2000);

        // Listen for resize to switch between mobile/desktop images
        window.addEventListener('resize', utils.debounce(() => {
            const newIsMobile = checkMobile();
            if (newIsMobile !== isMobile) {
                isMobile = newIsMobile;
                const images = getHeroImages();
                heroImageEl.src = images[currentImageIndex].src;
                heroImageEl.alt = images[currentImageIndex].alt;
            }
        }, 250));
    }

    function startImageRotation() {
        if (imageRotationInterval) clearInterval(imageRotationInterval);

        imageRotationInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % getHeroImages().length;
            const nextImage = getHeroImages()[currentImageIndex];

            heroImageEl.style.opacity = '0';

            setTimeout(() => {
                heroImageEl.src = nextImage.src;
                heroImageEl.alt = nextImage.alt;
                heroImageEl.style.opacity = '1';
            }, 800);

        }, 6000);
    }

    function stopImageRotation() {
        if (imageRotationInterval) {
            clearInterval(imageRotationInterval);
            imageRotationInterval = null;
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopImageRotation();
        } else {
            startImageRotation();
        }
    });

    // ─── Hero Quote Button ──────────────────────────────────────
    function initHeroQuoteButton() {
        const heroQuoteBtn = document.getElementById('heroRequestQuote');
        if (!heroQuoteBtn) return;

        const onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Dispatch custom event that services.js listens for
            const event = new CustomEvent('cfs:openDrawer', {
                detail: { serviceType: 'choose' },
                bubbles: true
            });
            document.dispatchEvent(event);
        };

        heroQuoteBtn.addEventListener('click', onClick);
    }

    // ─── Utilities ──────────────────────────────────────────────
    const utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ─── Bootstrap ──────────────────────────────────────────────
    function init() {
        initTyping();
        initImageRotator();
        initHeroQuoteButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();