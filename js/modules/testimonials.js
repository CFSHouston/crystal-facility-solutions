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

// ============================================
// CLIENTS MARQUEE WITH MANUAL NAVIGATION
// ============================================

(function() {
    'use strict';

    const marquee = document.getElementById('clientMarquee');
    const track = document.getElementById('marqueeTrack');
    const prevBtn = document.querySelector('.marquee-prev');
    const nextBtn = document.querySelector('.marquee-next');

    if (!marquee || !track || !prevBtn || !nextBtn) return;

    let position = 0;
    let isPaused = false;
    let animationId = null;
    let speed = 0.5; // pixels per frame
    let contentWidth = 0;

    // Calculate content width
    function calculateWidth() {
        contentWidth = track.scrollWidth / 2; // Half because we duplicated content
    }

    // Auto-scroll animation
    function animate() {
        if (!isPaused) {
            position -= speed;

            // Reset for seamless loop
            if (Math.abs(position) >= contentWidth) {
                position = 0;
            }

            track.style.transform = 'translateX(' + position + 'px)';
        }
        animationId = requestAnimationFrame(animate);
    }

    // Initialize
    calculateWidth();
    animate();

    // Update width on resize
    window.addEventListener('resize', calculateWidth, { passive: true });

    // Navigation handlers
    prevBtn.addEventListener('click', function() {
        // Scroll left (move content right)
        position += 300; // Scroll 300px per click
        if (position > 0) {
            position = -contentWidth + 300; // Wrap around to end
        }
        track.style.transform = 'translateX(' + position + 'px)';

        // Brief pause after manual navigation
        isPaused = true;
        setTimeout(function() { isPaused = false; }, 1500);
    });

    nextBtn.addEventListener('click', function() {
        // Scroll right (move content left)
        position -= 300; // Scroll 300px per click
        if (Math.abs(position) >= contentWidth) {
            position = 0; // Wrap around to start
        }
        track.style.transform = 'translateX(' + position + 'px)';

        // Brief pause after manual navigation
        isPaused = true;
        setTimeout(function() { isPaused = false; }, 1500);
    });

    // Pause on hover
    marquee.addEventListener('mouseenter', function() {
        isPaused = true;
    });

    marquee.addEventListener('mouseleave', function() {
        isPaused = false;
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    marquee.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        isPaused = true;
    }, { passive: true });

    marquee.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isPaused = false;
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - scroll right
                position -= 300;
            } else {
                // Swipe right - scroll left
                position += 300;
            }

            // Handle wrap-around
            if (position > 0) position = -contentWidth + 300;
            if (Math.abs(position) >= contentWidth) position = 0;

            track.style.transform = 'translateX(' + position + 'px)';
        }
    }

    // Cleanup on page hide
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();

// ============================================
// INDUSTRY HOVER TOOLTIP
// ============================================

(function() {
    'use strict';

    // Industry data
    const industryData = {
        'Education Cleaning': {
            icon: 'fa-graduation-cap',
            title: 'Education Facilities',
            description: 'Comprehensive cleaning for schools, colleges, and universities.',
            services: ['Classroom sanitization', 'Laboratory cleaning', 'Cafeteria deep clean', 'Gym maintenance', 'Daycare hygiene'],
            highlight: 'Trusted by 50+ educational institutions'
        },
        'Office Building Cleaning': {
            icon: 'fa-building',
            title: 'Corporate Offices',
            description: 'Professional cleaning for modern workspaces and corporate headquarters.',
            services: ['Workspace sanitization', 'Conference room prep', 'Break room cleaning', 'Carpet care', 'Window cleaning'],
            highlight: 'Serving 200+ corporate clients'
        },
        'Apartment Complex': {
            icon: 'fa-home',
            title: 'Multi-Family Residences',
            description: 'Full-service cleaning for apartment communities and condominiums.',
            services: ['Common area maintenance', 'Move-in/out cleaning', 'Clubhouse care', 'Pool area cleaning', 'Parking garage wash'],
            highlight: 'Managing 75+ apartment communities'
        },
        'Car Dealerships': {
            icon: 'fa-car',
            title: 'Automotive Showrooms',
            description: 'Spotless cleaning for showrooms, service centers, and lots.',
            services: ['Showroom polishing', 'Service bay degreasing', 'Customer lounge care', 'Vehicle prep', 'Exterior maintenance'],
            highlight: 'Trusted by major auto brands'
        },
        'Gyms': {
            icon: 'fa-dumbbell',
            title: 'Fitness Centers',
            description: 'Hygiene-focused cleaning for gyms, studios, and wellness centers.',
            services: ['Equipment sanitization', 'Locker room deep clean', 'Pool & spa care', 'Studio maintenance', 'Steam room cleaning'],
            highlight: 'Health club certified protocols'
        },
        'Retail Stores': {
            icon: 'fa-shopping-bag',
            title: 'Retail Spaces',
            description: 'Immaculate cleaning for stores, boutiques, and shopping centers.',
            services: ['Sales floor care', 'Fitting room sanitization', 'Restroom maintenance', 'Display cleaning', 'Stock room organization'],
            highlight: 'Serving 100+ retail locations'
        },
        'Industrial Cleaning': {
            icon: 'fa-industry',
            title: 'Industrial Facilities',
            description: 'Heavy-duty cleaning for warehouses, factories, and plants.',
            services: ['Floor scrubbing', 'Machinery degreasing', 'Loading dock care', 'Office cleaning', 'Safety compliance'],
            highlight: 'OSHA compliant operations'
        },
        'Hospitality Cleaning': {
            icon: 'fa-hotel',
            title: 'Hotels & Hospitality',
            description: 'Guest-ready cleaning for hotels, resorts, and venues.',
            services: ['Guest room turnover', 'Lobby maintenance', 'Restaurant cleaning', 'Event prep', 'Spa sanitization'],
            highlight: '4.9/5 guest satisfaction rating'
        },
        'Event Center Cleaning': {
            icon: 'fa-calendar-alt',
            title: 'Event Venues',
            description: 'Pre and post-event cleaning for convention centers and halls.',
            services: ['Pre-event setup', 'Post-event deep clean', 'Stage cleaning', 'Catering prep', 'Same-day service'],
            highlight: 'Handled 500+ events in 2024'
        },
        'Recreation And Shopping Cleaning': {
            icon: 'fa-shopping-cart',
            title: 'Recreation & Shopping',
            description: 'Comprehensive care for malls, entertainment, and recreation centers.',
            services: ['Food court sanitization', 'Theater cleaning', 'Play area care', 'Parking structure wash', 'Seasonal deep cleans'],
            highlight: 'Managing 2M+ sq ft of retail space'
        },
        'Healthcare Environmental Services': {
            icon: 'fa-hospital',
            title: 'Healthcare Facilities',
            description: 'Medical-grade cleaning following CDC and Joint Commission standards.',
            services: ['Patient room care', 'OR terminal cleaning', 'Waiting area disinfection', 'Medical waste handling', 'Infection control'],
            highlight: 'Joint Commission compliant'
        },
        'Religious Building Cleaning': {
            icon: 'fa-place-of-worship',
            title: 'Places of Worship',
            description: 'Respectful, thorough cleaning for churches, temples, and mosques.',
            services: ['Sanctuary care', 'Fellowship hall cleaning', 'Classroom sanitization', 'Kitchen service', 'Event preparation'],
            highlight: 'Serving 40+ faith communities'
        },
        'Government Building Cleaning': {
            icon: 'fa-landmark',
            title: 'Government Facilities',
            description: 'Secure, reliable cleaning for federal, state, and municipal buildings.',
            services: ['Office cleaning', 'Public area maintenance', 'Secure protocols', 'Courtroom prep', 'Record storage care'],
            highlight: 'GSA schedule holder'
        },
        'Banks And Financial Institution Cleaning': {
            icon: 'fa-university',
            title: 'Financial Institutions',
            description: 'Discreet, professional cleaning for banks and financial centers.',
            services: ['Lobby care', 'Teller area cleaning', 'Safe deposit maintenance', 'Office service', 'ATM area care'],
            highlight: 'Trusted by 25+ financial institutions'
        }
    };

    // Create tooltip element
    let tooltip = null;
    let hideTimeout = null;

    function createTooltip() {
        tooltip = document.createElement('div');
        tooltip.className = 'industry-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(40, 40, 40, 0.98));
            border: 1px solid rgba(124, 179, 66, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            width: 320px;
            max-width: 90vw;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 179, 66, 0.1);
            backdrop-filter: blur(10px);
            pointer-events: none;
        `;
        document.body.appendChild(tooltip);
    }

    function showTooltip(industryName, x, y) {
        const data = industryData[industryName];
        if (!data) return;

        if (!tooltip) createTooltip();

        const servicesHtml = data.services.map(s => 
            `<li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-bottom: 0.4rem;">
                <i class="fas fa-check" style="color: #7cb342; font-size: 0.75rem;"></i>${s}
            </li>`
        ).join('');

        tooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(124, 179, 66, 0.2);">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7cb342, #9ccc65); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: white;">
                    <i class="fas ${data.icon}"></i>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0;">${data.title}</h4>
            </div>
            <p style="font-size: 0.9rem; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 1rem;">${data.description}</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 1rem;">${servicesHtml}</ul>
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: rgba(124, 179, 66, 0.15); border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: #7cb342;">
                <i class="fas fa-star" style="color: #ffd700;"></i>
                <span>${data.highlight}</span>
            </div>
        `;

        // Position tooltip above the element
        const tooltipRect = tooltip.getBoundingClientRect();
        let top = y - tooltipRect.height - 15;
        let left = x - tooltipRect.width / 2;

        // Keep within viewport
        if (top < 10) top = y + 30; // Show below if not enough space above
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';

        clearTimeout(hideTimeout);
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        const marquee = document.getElementById('clientMarquee');
        if (!marquee) return;

        // Use event delegation for hover
        marquee.addEventListener('mouseover', function(e) {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;

            const industryName = logo.textContent.trim();
            const rect = logo.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;

            showTooltip(industryName, x, y);
        });

        marquee.addEventListener('mouseout', function(e) {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;

            hideTimeout = setTimeout(hideTooltip, 100);
        });

        // Keep tooltip visible when hovering over it
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('.industry-tooltip')) {
                clearTimeout(hideTimeout);
            }
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('.industry-tooltip')) {
                hideTimeout = setTimeout(hideTooltip, 100);
            }
        });

        // Keyboard support
        marquee.addEventListener('focus', function(e) {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;

            const industryName = logo.textContent.trim();
            const rect = logo.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;

            showTooltip(industryName, x, y);
        }, true);

        marquee.addEventListener('blur', function(e) {
            hideTooltip();
        }, true);
    });

    // Hide on scroll
    window.addEventListener('scroll', hideTooltip, { passive: true });
})();