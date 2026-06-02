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



    // ─── Typing State ──────────────────────────────────────────
    let typingElement = null;
    let cursorElement = null;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let typingTimeoutId = null;
    let typingActive = true;

    // ═══════════════════════════════════════════════════════════
    //  TYPING ANIMATION — Defensive with Fallback
    // ═══════════════════════════════════════════════════════════

    function initTyping() {
        typingElement = document.querySelector('.typing-text');
        cursorElement = document.querySelector('.typing-cursor');

        // Defensive: if elements missing, show static fallback
        if (!typingElement || !cursorElement) {
            console.warn('Typing animation: elements not found, using fallback');
            showStaticFallback();
            return;
        }

        // Clear any stale state
        typingElement.textContent = '';
        wordIndex = 0;
        charIndex = 0;
        isDeleting = false;
        isPaused = false;

        // Start after delay
        typingTimeoutId = setTimeout(() => {
            if (typingActive) typingLoop();
        }, TYPING_CONFIG.startDelay);

        // Pause/resume on tab visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                typingActive = false;
                if (typingTimeoutId) clearTimeout(typingTimeoutId);
            } else {
                typingActive = true;
                // Resume from current state
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

        // Safety: ensure words array is valid
        if (!TYPING_CONFIG.words || TYPING_CONFIG.words.length === 0) {
            typingElement.textContent = 'Facility Services';
            return;
        }

        const currentWord = TYPING_CONFIG.words[wordIndex];

        // Safety: ensure current word is a string
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



    // ═══════════════════════════════════════════════════════════
    //  BOOTSTRAP
    // ═══════════════════════════════════════════════════════════

    function initHeroQuoteButton() {
        const quoteBtn = document.getElementById('heroRequestQuote');
        if (!quoteBtn) return;

        quoteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('cfs:openDrawer', {
                detail: {
                    serviceType: 'choose',
                    serviceName: 'Custom Package'
                },
                bubbles: true,
                cancelable: true
            }));
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  HERO BACKGROUND IMAGE ROTATOR
    //  Cycles through 4 service images every 6 seconds
    // ═══════════════════════════════════════════════════════════

    // Desktop images (landscape/wide format)
    const HERO_IMAGES_DESKTOP = [
        { src: './images/cleanings.png', alt: 'Crystal Facility Solutions - Premium Services' },
        { src: './images/transportation.png', alt: 'Safe School Transportation Services' },
        { src: './images/landscaping.png', alt: 'Professional Landscaping Services' },
        { src: './images/maintenance.png', alt: 'Comprehensive Maintenance Services' }
    ];

    // Mobile images (portrait/tall format - better for phone screens)
    const HERO_IMAGES_MOBILE = [
        { src: './images/cleaning_mobile.png', alt: 'Crystal Facility Solutions - Premium Services' },
        { src: './images/transportation_mobile.png', alt: 'Safe School Transportation Services' },
        { src: './images/landscaping_mobile.png', alt: 'Professional Landscaping Services' },
        { src: './images/maintenance_mobile.png', alt: 'Comprehensive Maintenance Services' }
    ];

    // Track which image set we're using
    let isMobile = window.innerWidth <= 768;
    let HERO_IMAGES = isMobile ? HERO_IMAGES_MOBILE : HERO_IMAGES_DESKTOP;

    // Handle resize: switch image sets when crossing 768px breakpoint
    window.addEventListener('resize', () => {
        const nowMobile = window.innerWidth <= 768;
        if (nowMobile !== isMobile) {
            isMobile = nowMobile;
            HERO_IMAGES = isMobile ? HERO_IMAGES_MOBILE : HERO_IMAGES_DESKTOP;
            // Update current image to the correct version
            if (heroImageEl && isFirstImageLoaded) {
                const currentImg = HERO_IMAGES[currentImageIndex];
                heroImageEl.src = currentImg.src;
                heroImageEl.alt = currentImg.alt;
            }
        }
    });

    let currentImageIndex = 0;
    let imageRotationInterval = null;
    let heroImageEl = null;
    let heroBgContainer = null;
    let imagesPreloaded = 0;
    let isFirstImageLoaded = false;

    function initImageRotator() {
        heroImageEl = document.getElementById('heroImage');
        heroBgContainer = document.querySelector('.hero-bg');
        if (!heroImageEl || !heroBgContainer) return;

        // Set initial opacity to 0 while loading
        heroImageEl.style.opacity = '0';

        // Preload all images, then show first one and start rotation
        let loadedCount = 0;
        const totalImages = HERO_IMAGES.length;

        HERO_IMAGES.forEach((imgData, index) => {
            const preload = new Image();

            preload.onload = () => {
                loadedCount++;
                // When first image loads, show it immediately
                if (index === 0 && !isFirstImageLoaded) {
                    isFirstImageLoaded = true;
                    heroImageEl.src = imgData.src;
                    heroImageEl.alt = imgData.alt;
                    heroImageEl.classList.add('loaded');
                    // Fade in the first image
                    requestAnimationFrame(() => {
                        heroImageEl.style.opacity = '1';
                    });
                }
                // Start rotation only after ALL images are preloaded
                if (loadedCount === totalImages) {
                    startImageRotation();
                }
            };

            preload.onerror = () => {
                loadedCount++;
                console.warn('Failed to preload hero image:', imgData.src);
                // Still start rotation if all images attempted to load
                if (loadedCount === totalImages) {
                    if (!isFirstImageLoaded) {
                        // Fallback: show first image even if it failed to preload
                        isFirstImageLoaded = true;
                        heroImageEl.src = HERO_IMAGES[0].src;
                        heroImageEl.alt = HERO_IMAGES[0].alt;
                        heroImageEl.classList.add('loaded');
                        heroImageEl.style.opacity = '1';
                    }
                    startImageRotation();
                }
            };

            preload.src = imgData.src;
        });

        // Fallback: if images take too long, show first image anyway after 2 seconds
        setTimeout(() => {
            if (!isFirstImageLoaded) {
                isFirstImageLoaded = true;
                heroImageEl.src = HERO_IMAGES[0].src;
                heroImageEl.alt = HERO_IMAGES[0].alt;
                heroImageEl.classList.add('loaded');
                heroImageEl.style.opacity = '1';
                startImageRotation();
            }
        }, 2000);
    }

    function startImageRotation() {
        if (imageRotationInterval) clearInterval(imageRotationInterval);

        imageRotationInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % HERO_IMAGES.length;
            const nextImage = HERO_IMAGES[currentImageIndex];

            // Create transition: fade out current, swap, fade in
            heroImageEl.style.opacity = '0';

            setTimeout(() => {
                heroImageEl.src = nextImage.src;
                heroImageEl.alt = nextImage.alt;
                heroImageEl.style.opacity = '1';
            }, 800); // Match CSS transition duration

        }, 5000); // Change every 5 seconds
    }

    function stopImageRotation() {
        if (imageRotationInterval) {
            clearInterval(imageRotationInterval);
            imageRotationInterval = null;
        }
    }

    // Pause rotation when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopImageRotation();
        } else {
            startImageRotation();
        }
    });

    function init() {
        initTyping();
        initHeroQuoteButton();
        initImageRotator();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();