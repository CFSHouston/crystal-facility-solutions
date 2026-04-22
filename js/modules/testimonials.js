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

    // ─── Industry Tooltips ──────────────────────────────────────
    function initTooltips() {
        const industryData = {
            'Education Facilities': {
                icon: 'fa-graduation-cap',
                title: 'Education Facilities',
                description: 'Comprehensive facility solutions for schools, colleges, and universities ensuring safe, clean learning environments.',
                services: {
                    cleaning: ['Classroom sanitization', 'Laboratory deep cleaning', 'Cafeteria & kitchen hygiene', 'Gym & locker room maintenance', 'Daycare disinfection protocols'],
                    transportation: ['School bus fleet management', 'Field trip transportation', 'Sports team travel', 'Safe route planning'],
                    landscaping: ['Campus grounds maintenance', 'Sports field care', 'Playground safety surfacing', 'Seasonal planting programs'],
                    maintenance: ['HVAC system servicing', 'Plumbing & electrical repairs', 'Preventive maintenance plans', 'Emergency repair services']
                },
                highlight: 'Trusted by 50+ educational institutions'
            },
            'Corporate Offices': {
                icon: 'fa-building',
                title: 'Corporate Offices',
                description: 'Professional facility management for modern workspaces and corporate headquarters.',
                services: {
                    cleaning: ['Workspace sanitization', 'Conference room preparation', 'Break room & kitchen cleaning', 'Carpet & upholstery care', 'Window cleaning services'],
                    transportation: ['Employee shuttle services', 'Corporate event transport', 'Airport transfer coordination', 'Executive car services'],
                    landscaping: ['Corporate campus grounds', 'Entryway & reception gardens', 'Outdoor meeting spaces', 'Sustainable landscape design'],
                    maintenance: ['Building system maintenance', 'Office equipment repairs', 'Lighting & electrical work', 'Facility upgrades & renovations']
                },
                highlight: 'Serving 200+ corporate clients'
            },
            'Apartment Complex': {
                icon: 'fa-home',
                title: 'Apartment Complex',
                description: 'Full-service facility solutions for apartment communities and condominiums.',
                services: {
                    cleaning: ['Common area maintenance', 'Move-in/out deep cleaning', 'Clubhouse & amenity cleaning', 'Trash chute & dumpster areas', 'Window washing services'],
                    landscaping: ['Community grounds keeping', 'Pool area maintenance', 'Walking path care', 'Seasonal flower programs', 'Tree & shrub management'],
                    maintenance: ['Unit turnover repairs', 'Plumbing & electrical', 'HVAC servicing', 'Appliance maintenance', '24/7 emergency repairs']
                },
                highlight: 'Managing 75+ apartment communities'
            },
            'Car Dealerships': {
                icon: 'fa-car',
                title: 'Car Dealerships',
                description: 'Spotless facility solutions for showrooms, service centers, and dealership lots.',
                services: {
                    cleaning: ['Showroom floor polishing', 'Vehicle display detailing', 'Customer lounge maintenance', 'Service bay degreasing', 'Window & glass cleaning'],
                    landscaping: ['Lot maintenance & debris removal', 'Entryway presentation', 'Test drive route care', 'Seasonal decorations'],
                    maintenance: ['Service equipment upkeep', 'Lighting maintenance', 'Building repairs', 'Signage maintenance']
                },
                highlight: 'Trusted by major auto brands'
            },
            'Gyms': {
                icon: 'fa-dumbbell',
                title: 'Gyms',
                description: 'Hygiene-focused facility solutions for gyms, studios, and wellness centers.',
                services: {
                    cleaning: ['Equipment sanitization', 'Locker room deep cleaning', 'Steam room & sauna care', 'Pool & spa maintenance', 'Studio floor care', 'Shower & restroom disinfection'],
                    landscaping: ['Outdoor training areas', 'Pool deck maintenance', 'Entryway greenery', 'Parking lot cleanliness'],
                    maintenance: ['Equipment repairs', 'HVAC & ventilation', 'Plumbing for showers', 'Electrical systems']
                },
                highlight: 'Health club certified protocols'
            },
            'Retail Stores': {
                icon: 'fa-shopping-bag',
                title: 'Retail Stores',
                description: 'Immaculate facility solutions for stores, boutiques, and shopping centers.',
                services: {
                    cleaning: ['Sales floor care', 'Fitting room sanitization', 'Restroom maintenance', 'Display & fixture cleaning', 'Stock room organization', 'Window & entrance cleaning'],
                    landscaping: ['Storefront presentation', 'Entryway maintenance', 'Seasonal decorations', 'Outdoor display areas'],
                    maintenance: ['Fixture repairs', 'Lighting maintenance', 'HVAC systems', 'Point-of-sale equipment']
                },
                highlight: 'Serving 100+ retail locations'
            },
            'Industrial Facilities': {
                icon: 'fa-industry',
                title: 'Industrial Facilities',
                description: 'Heavy-duty facility solutions for warehouses, factories, and manufacturing plants.',
                services: {
                    cleaning: ['Industrial floor scrubbing', 'Machinery degreasing', 'Warehouse dust control', 'Loading dock cleaning', 'High-dusting services', 'Confined space cleaning'],
                    transportation: ['Employee shuttle services', 'Inter-facility transport', 'Shift change coordination', 'Logistics support'],
                    landscaping: ['Industrial grounds maintenance', 'Perimeter fencing care', 'Storm water management', 'Environmental compliance'],
                    maintenance: ['Production equipment care', 'Building envelope repairs', 'Electrical & mechanical', 'Preventive maintenance programs', 'OSHA compliance support']
                },
                highlight: 'OSHA compliant operations'
            },
            'Hotels & Hospitality': {
                icon: 'fa-hotel',
                title: 'Hotels & Hospitality',
                description: 'Guest-ready facility solutions for hotels, resorts, and hospitality venues.',
                services: {
                    cleaning: ['Guest room turnover', 'Lobby & common areas', 'Restaurant & bar cleaning', 'Spa & wellness center care', 'Pool & recreation areas', 'Back-of-house deep cleaning'],
                    transportation: ['Guest shuttle services', 'Airport transfers', 'Tour & excursion transport', 'Valet parking management'],
                    landscaping: ['Resort grounds & gardens', 'Poolscape maintenance', 'Outdoor event spaces', 'Entryway & porte-cochère', 'Tropical plant programs'],
                    maintenance: ['Room repairs & upkeep', 'HVAC & climate control', 'Plumbing & electrical', 'Pool & spa equipment', '24/7 engineering support']
                },
                highlight: '4.9/5 guest satisfaction rating'
            },
            'Event Venues': {
                icon: 'fa-calendar-alt',
                title: 'Event Venues',
                description: 'Pre and post-event facility solutions for convention centers, halls, and arenas.',
                services: {
                    cleaning: ['Pre-event venue preparation', 'Post-event deep cleaning', 'Stage & backstage care', 'Catering prep areas', 'Restroom servicing', 'Same-day turnaround service'],
                    transportation: ['Attendee shuttle coordination', 'VIP transport services', 'Equipment & gear moving', 'Parking management support'],
                    landscaping: ['Outdoor event preparation', 'Tent & pavilion areas', 'Grounds beautification', 'Post-event restoration'],
                    maintenance: ['Setup & breakdown support', 'Equipment installation', 'Lighting & AV coordination', 'Emergency repairs during events']
                },
                highlight: 'Handled 500+ events in 2024'
            },
            'Recreation And Shopping Areas': {
                icon: 'fa-shopping-cart',
                title: 'Recreation And Shopping Areas',
                description: 'Comprehensive care for malls, entertainment centers, and recreation facilities.',
                services: {
                    cleaning: ['Food court sanitization', 'Theater & cinema cleaning', 'Play area disinfection', 'Common area maintenance', 'Escalator & elevator care', 'Seasonal deep cleaning'],
                    transportation: ['Customer shuttle services', 'Security transport', 'Employee parking shuttles', 'Special event transport'],
                    landscaping: ['Outdoor mall areas', 'Parking lot islands', 'Entryway gardens', 'Seasonal displays', 'Storm debris management'],
                    maintenance: ['Building systems', 'Security equipment', 'Lighting & signage', 'Emergency repairs']
                },
                highlight: 'Managing 2M+ sq ft of retail space'
            },
            'Healthcare Facilities': {
                icon: 'fa-hospital',
                title: 'Healthcare Facilities',
                description: 'Medical-grade facility solutions following CDC and Joint Commission standards.',
                services: {
                    cleaning: ['Patient room terminal cleaning', 'OR & surgical suite sterilization', 'Waiting area disinfection', 'Medical waste handling', 'Infection control protocols', 'Pharmacy & lab cleaning'],
                    transportation: ['Patient transport services', 'Medical equipment moving', 'Staff shuttle coordination', 'Emergency logistics'],
                    landscaping: ['Healing garden maintenance', 'Patient outdoor areas', 'Entryway wellness gardens', 'Smoke-free zone enforcement'],
                    maintenance: ['Medical equipment calibration', 'HVAC & air quality', 'Plumbing & medical gases', 'Emergency generator care', '24/7 biomedical support']
                },
                highlight: 'Joint Commission compliant'
            },
            'Places of Worship': {
                icon: 'fa-place-of-worship',
                title: 'Places of Worship',
                description: 'Respectful, thorough facility solutions for churches, temples, mosques, and synagogues.',
                services: {
                    cleaning: ['Sanctuary & worship hall care', 'Fellowship hall cleaning', 'Classroom & nursery sanitization', 'Kitchen & dining areas', 'Restroom maintenance', 'Religious artifact care'],
                    transportation: ['Congregation shuttle services', 'Youth group transport', 'Event & retreat coordination', 'Elderly & special needs access'],
                    landscaping: ['Grounds & cemetery care', 'Memorial garden maintenance', 'Entryway presentation', 'Seasonal decorations', 'Parking lot landscaping'],
                    maintenance: ['Historic building preservation', 'Stained glass & artwork care', 'HVAC for large halls', 'Sound system support', 'Event setup assistance']
                },
                highlight: 'Serving 40+ faith communities'
            },
            'Government Buildings': {
                icon: 'fa-landmark',
                title: 'Government Buildings',
                description: 'Secure, reliable facility solutions for federal, state, and municipal buildings.',
                services: {
                    cleaning: ['Office & workspace cleaning', 'Public area maintenance', 'Courtroom preparation', 'Secure facility protocols', 'Record storage care', 'High-security clearance staff'],
                    transportation: ['Official vehicle services', 'Employee shuttle programs', 'Secure transport coordination', 'Event logistics support'],
                    landscaping: ['Public grounds maintenance', 'Monument & memorial care', 'Sustainable practices', 'Storm response'],
                    maintenance: ['Building system maintenance', 'Security system support', 'Emergency preparedness', 'Energy efficiency programs', 'Historic preservation']
                },
                highlight: 'GSA schedule holder'
            },
            'Banks And Financial Institutions': {
                icon: 'fa-university',
                title: 'Banks and Financial Institutions',
                description: 'Discreet, professional facility solutions for banks and financial centers.',
                services: {
                    cleaning: ['Lobby & customer areas', 'Teller station sanitization', 'Safe deposit vault care', 'Office & conference rooms', 'ATM area maintenance', 'High-security protocols'],
                    landscaping: ['Professional exterior presentation', 'Drive-thru lane maintenance', 'Entryway gardens', 'Seasonal decorations'],
                    maintenance: ['Security system maintenance', 'Vault & safe care', 'HVAC & climate control', 'Technology infrastructure', 'After-hours service available']
                },
                highlight: 'Trusted by 25+ financial institutions'
            }
        };

        const marquee = document.getElementById('clientMarquee');
        if (!marquee) return;

        let tooltip = null;
        let hideTimeout = null;

        function createTooltip() {
            tooltip = document.createElement('div');
            tooltip.className = 'industry-tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            tooltip.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '999999';
            document.body.appendChild(tooltip);
        }

        function buildTooltipContent(data) {
            const categories = [
                { key: 'cleaning', icon: 'fa-broom', label: 'Cleaning' },
                { key: 'transportation', icon: 'fa-bus', label: 'Transportation' },
                { key: 'landscaping', icon: 'fa-leaf', label: 'Landscaping' },
                { key: 'maintenance', icon: 'fa-tools', label: 'Maintenance' }
            ];

            let servicesHtml = '';
            categories.forEach(cat => {
                if (data.services[cat.key]) {
                    const items = data.services[cat.key].map(s =>
                        `<li style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:rgba(255,255,255,0.9);margin-bottom:0.4rem;">
                            <i class="fas fa-check" style="color:#7cb342;font-size:0.75rem;"></i>${s}
                        </li>`
                    ).join('');

                    servicesHtml += `
                        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1rem;">
                            <h6 style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;font-weight:700;color:#7cb342;margin:0 0 0.75rem 0;text-transform:uppercase;letter-spacing:0.05em;">
                                <i class="fas ${cat.icon}" style="font-size:0.85rem;"></i>${cat.label}
                            </h6>
                            <ul style="list-style:none;padding:0;margin:0;">${items}</ul>
                        </div>`;
                }
            });

            return `
                <div style="flex-shrink:0;display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(124,179,66,0.2);">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#7cb342,#9ccc65);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:white;">
                        <i class="fas ${data.icon}"></i>
                    </div>
                    <h4 style="font-size:1.1rem;font-weight:700;color:#ffffff;margin:0;">${data.title}</h4>
                </div>
                <p style="flex-shrink:0;font-size:0.9rem;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:1rem;">${data.description}</p>
                <div style="flex:1;overflow-y:auto;min-height:0;margin-bottom:1rem;padding-right:0.5rem;">
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">${servicesHtml}</div>
                </div>
                <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem;background:rgba(124,179,66,0.15);border-radius:8px;font-size:0.85rem;font-weight:600;color:#7cb342;">
                    <i class="fas fa-star" style="color:#ffd700;"></i>
                    <span>${data.highlight}</span>
                </div>`;
        }

        function showTooltip(industryName) {
            const data = industryData[industryName];
            if (!data) return;

            if (!tooltip) createTooltip();

            tooltip.innerHTML = buildTooltipContent(data);

            const viewportWidth = window.innerWidth;
            const scrollY = window.pageYOffset;
            const left = (viewportWidth - Math.min(700, viewportWidth * 0.9)) / 2;
            const top = scrollY + (window.innerHeight * 0.1);

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

        const onMouseEnter = (e) => {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;
            showTooltip(logo.textContent.trim());
        };

        const onMouseLeave = (e) => {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;
            hideTimeout = setTimeout(hideTooltip, 100);
            state.timeouts.push(hideTimeout);
        };

        const onFocus = (e) => {
            const logo = e.target.closest('.client-logo');
            if (!logo) return;
            showTooltip(logo.textContent.trim());
        };

        const onBlur = (e) => {
            hideTooltip();
        };

        marquee.addEventListener('mouseenter', onMouseEnter, true);
        marquee.addEventListener('mouseleave', onMouseLeave, true);
        marquee.addEventListener('focus', onFocus, true);
        marquee.addEventListener('blur', onBlur, true);

        if (!state.boundHandlers.tooltip) state.boundHandlers.tooltip = [];
        state.boundHandlers.tooltip.push({ el: marquee, onMouseEnter, onMouseLeave, onFocus, onBlur });

        // Hide on scroll
        const onScroll = () => hideTooltip();
        window.addEventListener('scroll', onScroll, { passive: true });
        state.boundHandlers.tooltipScroll = onScroll;
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Clear timeouts
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];

        // Clear intervals
        state.intervals.forEach(id => clearInterval(id));
        state.intervals = [];

        // Cancel rAF
        state.rafIds.forEach(id => cancelAnimationFrame(id));
        state.rafIds = [];

        // Remove event listeners
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
            } else if (key === 'visibility' || key === 'parallax' || key === 'marqueeVisibility' || key === 'tooltipScroll') {
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
        initTooltips();

        state.isInitialized = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();