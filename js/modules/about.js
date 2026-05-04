/* ============================================
   ABOUT MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        tiltMaxAngle: 10,
        tiltPerspective: 1000,
        particleCount: 20,
        counterDuration: 2000,
        magneticStrength: 0.3,
        scrollThrottleMs: 16
    };

    // ─── Utilities ──────────────────────────────────────────────
    const utils = {
        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => { inThrottle = false; }, limit);
                }
            };
        },
        lerp: (start, end, factor) => start + (end - start) * factor,
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
        random: (min, max) => Math.random() * (max - min) + min,
        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        timeouts: [],
        rafIds: [],
        boundHandlers: {},
        observer: null
    };

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;
        if (!document.querySelector('.why-crystal-section')) return;

        new AboutSectionModule();
        state.isInitialized = true;
    }

    class AboutSectionModule {
        constructor() {
            this.isTouch = utils.isTouchDevice();
            this.animatedElements = new Set();
            this.timeouts = [];
            this.rafIds = [];
            this.boundHandlers = {};
            this.init();
        }

        init() {
            this.cacheElements();
            this.createParticles();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            if (!this.isTouch) {
                this.setup3DTilt();
                this.setupMagneticElements();
            }
            this.initTimeline();
            this.initCertTooltips();
            this.initFacilityTooltips();
            this.initDetailsToggle();
        }

        cacheElements() {
            this.section = document.querySelector('.why-crystal-section');
            this.storyCard = document.querySelector('.story-card');
            this.statCards = document.querySelectorAll('.stat-card');
            this.excellenceCard = document.querySelector('.excellence-card');
            this.timelineItems = document.querySelectorAll('.timeline-item');
            this.timelineProgress = document.querySelector('.timeline-progress');
            this.certBadges = document.querySelectorAll('.cert-badge');
        }

        createParticles() {
            if (!this.section) return;
            const container = document.createElement('div');
            container.className = 'about-particles';
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const p = document.createElement('div');
                p.className = 'about-particle';
                const size = utils.random(4, 8);
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = utils.random(0, 100) + '%';
                p.style.top = utils.random(0, 100) + '%';
                p.style.animationDelay = utils.random(0, 15) + 's';
                p.style.animationDuration = utils.random(10, 20) + 's';
                p.style.opacity = utils.random(0.2, 0.5);
                container.appendChild(p);
            }
            this.section.insertBefore(container, this.section.firstChild);
        }

        setup3DTilt() {
            const cards = [this.storyCard, this.excellenceCard, ...this.statCards];
            cards.forEach(card => {
                if (!card) return;
                const onMove = utils.throttle((e) => this.handleTilt(e, card), 16);
                const onLeave = () => this.resetTilt(card);
                card.addEventListener('mousemove', onMove);
                card.addEventListener('mouseleave', onLeave);
                if (!this.boundHandlers.tilt) this.boundHandlers.tilt = [];
                this.boundHandlers.tilt.push({ card, onMove, onLeave });
            });
        }

        handleTilt(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = ((y - cy) / cy) * -CONFIG.tiltMaxAngle;
            const ry = ((x - cx) / cx) * CONFIG.tiltMaxAngle;
            card.style.transform = `perspective(${CONFIG.tiltPerspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;
        }

        resetTilt(card) { card.style.transform = ''; }

        setupMagneticElements() {
            const els = document.querySelectorAll('.cert-badge, .feature-item');
            els.forEach(el => {
                const onMove = (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    el.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
                };
                const onLeave = () => { el.style.transform = ''; };
                el.addEventListener('mousemove', onMove);
                el.addEventListener('mouseleave', onLeave);
                if (!this.boundHandlers.magnetic) this.boundHandlers.magnetic = [];
                this.boundHandlers.magnetic.push({ el, onMove, onLeave });
            });
        }

        setupIntersectionObserver() {
            const opts = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.animatedElements.add(entry.target);
                        if (entry.target.classList.contains('stats-container')) this.animateCounters();
                        else if (entry.target.classList.contains('timeline')) this.animateTimeline();
                        else { entry.target.classList.add('animated'); this.animateElement(entry.target); }
                        this.observer.unobserve(entry.target);
                    }
                });
            }, opts);

            ['.story-card', '.stats-container', '.excellence-card', '.timeline'].forEach(sel => {
                const el = document.querySelector(sel);
                if (el) { el.classList.add('animate-on-scroll'); this.observer.observe(el); }
            });
        }

        animateElement(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            const rafId = requestAnimationFrame(() => {
                el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = '';
            });
            this.rafIds.push(rafId);
        }

        animateCounters() {
            this.statCards.forEach((card, i) => {
                const target = parseInt(card.dataset.target);
                const counter = card.querySelector('.counter');
                const progress = card.querySelector('.stat-progress');
                if (!counter) return;

                let pct;
                switch(target) { case 99: pct = 99; break; case 15: pct = 70; break; case 500: pct = 85; break; case 50: pct = 75; break; default: pct = 80; }

                const t1 = setTimeout(() => { if (progress) progress.style.width = pct + '%'; }, i * 200);
                this.timeouts.push(t1);
                const t2 = setTimeout(() => this.animateCounterValue(counter, target), i * 200 + 300);
                this.timeouts.push(t2);
            });
        }

        animateCounterValue(el, target) {
            const start = performance.now();
            const update = (now) => {
                const elapsed = now - start;
                const p = Math.min(elapsed / CONFIG.counterDuration, 1);
                const eased = utils.easeOutQuart(p);
                el.textContent = Math.floor(target * eased);
                if (p < 1) {
                    const rafId = requestAnimationFrame(update);
                    this.rafIds.push(rafId);
                } else {
                    el.textContent = target;
                    this.pulseElement(el);
                }
            };
            const rafId = requestAnimationFrame(update);
            this.rafIds.push(rafId);
        }

        pulseElement(el) {
            el.style.transform = 'scale(1.2)';
            el.style.transition = 'transform 0.3s ease';
            const t = setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
            this.timeouts.push(t);
        }

        animateTimeline() {
            if (this.timelineProgress) {
                const t = setTimeout(() => { this.timelineProgress.style.width = '80%'; }, 500);
                this.timeouts.push(t);
            }
            this.timelineItems.forEach((item, i) => {
                const t = setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    const rafId = requestAnimationFrame(() => {
                        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        item.style.opacity = '1';
                        item.style.transform = '';
                    });
                    this.rafIds.push(rafId);
                }, i * 200);
                this.timeouts.push(t);
            });
        }

        initTimeline() {
            this.timelineItems.forEach((item, i) => {
                const onClick = () => {
                    this.timelineItems.forEach(it => it.classList.remove('active'));
                    item.classList.add('active');
                    if (this.timelineProgress) {
                        this.timelineProgress.style.width = ((i + 1) / this.timelineItems.length) * 100 + '%';
                    }
                };
                const onKey = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
                };
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                item.addEventListener('click', onClick);
                item.addEventListener('keydown', onKey);
                if (!this.boundHandlers.timeline) this.boundHandlers.timeline = [];
                this.boundHandlers.timeline.push({ item, onClick, onKey });

                const dot = item.querySelector('.timeline-dot');
                const year = item.dataset.year;
                if (dot && year) dot.setAttribute('data-year', year);
            });
            if (this.timelineItems.length > 0) {
                this.timelineItems[this.timelineItems.length - 1].classList.add('active');
            }
        }

        initCertTooltips() {
            this.certBadges.forEach(badge => {
                const onEnter = () => {
                    const text = badge.getAttribute('title') || badge.getAttribute('aria-label');
                    if (text) this.showCertTooltip(badge, text);
                };
                const onLeave = () => this.hideCertTooltip(badge);
                const onFocus = () => {
                    const text = badge.getAttribute('title') || badge.getAttribute('aria-label');
                    if (text) this.showCertTooltip(badge, text);
                };
                const onBlur = () => this.hideCertTooltip(badge);
                badge.addEventListener('mouseenter', onEnter);
                badge.addEventListener('mouseleave', onLeave);
                badge.addEventListener('focus', onFocus);
                badge.addEventListener('blur', onBlur);
                if (!this.boundHandlers.tooltips) this.boundHandlers.tooltips = [];
                this.boundHandlers.tooltips.push({ badge, onEnter, onLeave, onFocus, onBlur });
            });
        }

        showCertTooltip(el, text) {
            let tip = el.querySelector('.cert-tooltip');
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'cert-tooltip';
                tip.textContent = text;
                tip.style.cssText = `
                    position: absolute;
                    bottom: calc(100% + 10px);
                    left: 50%;
                    transform: translateX(-50%) scale(0.8);
                    background: #212529;
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    z-index: 100;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                `;
                const arrow = document.createElement('div');
                arrow.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-top-color: #212529;
                `;
                tip.appendChild(arrow);
                el.style.position = 'relative';
                el.appendChild(tip);
                requestAnimationFrame(() => {
                    tip.style.opacity = '1';
                    tip.style.transform = 'translateX(-50%) scale(1)';
                });
            }
        }

        hideCertTooltip(el) {
            const tip = el.querySelector('.cert-tooltip');
            if (tip) {
                tip.style.opacity = '0';
                tip.style.transform = 'translateX(-50%) scale(0.8)';
                setTimeout(() => { if (tip.parentNode) tip.remove(); }, 300);
            }
        }

        // ─── Facility Type Tooltips ─────────────────────────────
        initFacilityTooltips() {
            const tooltip = document.createElement('div');
            tooltip.className = 'facility-tooltip';
            tooltip.id = 'facility-tooltip';
            document.body.appendChild(tooltip);

            const facilityData = {
                'Education Facilities': {
                    icon: '🎓', title: 'Education Facilities',
                    desc: 'Reliable cleaning and maintenance support for schools, colleges, and educational institutions through our trusted partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Classroom cleaning', 'Cafeteria cleaning', 'Gymnasium floor care', 'Restroom cleaning', 'Window cleaning'] },
                        'Transportation': { icon: '🚌', items: ['School bus coordination', 'Field trip transport', 'Athletic team travel'] },
                        'Landscaping': { icon: '🌿', items: ['Campus grounds keeping', 'Sports field maintenance', 'Seasonal planting'] },
                        'Maintenance': { icon: '🛠️', items: ['General repairs', 'Plumbing & electrical', 'HVAC filter changes', 'Playground upkeep'] }
                    },
                    highlight: { icon: '📚', text: 'Trusted partner for educational institutions' }
                },
                'Corporate Offices': {
                    icon: '🏢', title: 'Corporate Offices',
                    desc: 'Professional facility support for corporate offices and business centers through our vetted partner companies.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Office cleaning', 'Carpet & floor care', 'Window washing', 'Restroom cleaning', 'Trash removal'] },
                        'Transportation': { icon: '🚌', items: ['Employee shuttle coordination', 'Corporate event transport', 'Airport transfer support'] },
                        'Landscaping': { icon: '🌿', items: ['Office grounds maintenance', 'Entryway presentation', 'Outdoor meeting spaces'] },
                        'Maintenance': { icon: '🛠️', items: ['General repairs', 'Light fixture maintenance', 'Plumbing & electrical', 'Furniture assembly'] }
                    },
                    highlight: { icon: '💼', text: 'Partnering with businesses across Houston' }
                },
                'Apartment Complex': {
                    icon: '🏠', title: 'Apartment Complex',
                    desc: 'Comprehensive facility solutions for apartment communities through our reliable contractor network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Common area cleaning', 'Move-in/out cleaning', 'Clubhouse cleaning', 'Trash area maintenance', 'Window washing'] },
                        'Transportation': { icon: '🚌', items: ['Resident shuttle coordination', 'Moving day support', 'Visitor transport'] },
                        'Landscaping': { icon: '🌿', items: ['Community grounds keeping', 'Pool area maintenance', 'Seasonal planting', 'Tree & shrub care'] },
                        'Maintenance': { icon: '🛠️', items: ['Unit turnover repairs', 'Plumbing & electrical', 'HVAC servicing', 'Appliance maintenance'] }
                    },
                    highlight: { icon: '⭐', text: 'Supporting apartment communities with care' }
                },
                'Car Dealerships': {
                    icon: '🚗', title: 'Car Dealerships',
                    desc: 'Specialized cleaning and maintenance for car showrooms and service centers through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Showroom floor care', 'Vehicle area cleaning', 'Service bay cleaning', 'Customer lounge care', 'Window cleaning'] },
                        'Landscaping': { icon: '🌿', items: ['Lot maintenance', 'Entryway presentation', 'Seasonal decorations'] },
                        'Maintenance': { icon: '🛠️', items: ['Lot maintenance', 'Light fixture cleaning', 'Pressure washing', 'Signage cleaning'] }
                    },
                    highlight: { icon: '🏆', text: 'Trusted by dealerships throughout Houston' }
                },
                'Gyms': {
                    icon: '💪', title: 'Fitness Centers',
                    desc: 'Thorough cleaning and upkeep for gyms, yoga studios, and fitness facilities through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Equipment cleaning', 'Locker room cleaning', 'Floor mat cleaning', 'Shower & sauna care', 'Mirror polishing'] },
                        'Landscaping': { icon: '🌿', items: ['Outdoor training areas', 'Pool deck maintenance', 'Entryway greenery'] },
                        'Maintenance': { icon: '🛠️', items: ['HVAC filter changes', 'Plumbing repairs', 'Lighting maintenance'] }
                    },
                    highlight: { icon: '🏋️', text: 'Keeping fitness facilities clean and ready' }
                },
                'Retail Stores': {
                    icon: '🛍️', title: 'Retail Stores',
                    desc: 'Retail-focused cleaning and maintenance that enhances customer experience through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Floor care & buffing', 'Fitting room cleaning', 'Display case cleaning', 'Restroom maintenance', 'Window washing'] },
                        'Landscaping': { icon: '🌿', items: ['Storefront presentation', 'Entryway maintenance', 'Seasonal decorations'] },
                        'Maintenance': { icon: '🛠️', items: ['Fixture repairs', 'Lighting maintenance', 'HVAC servicing', 'Signage cleaning'] }
                    },
                    highlight: { icon: '🛒', text: 'Serving retail locations across the region' }
                },
                'Industrial Facilities': {
                    icon: '🏭', title: 'Industrial Facilities',
                    desc: 'Heavy-duty cleaning and maintenance for warehouses and manufacturing plants through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Warehouse floor scrubbing', 'Machinery area cleaning', 'High-dust removal', 'Loading dock cleaning', 'Safety line painting'] },
                        'Landscaping': { icon: '🌿', items: ['Industrial grounds maintenance', 'Perimeter care', 'Storm debris management'] },
                        'Maintenance': { icon: '🛠️', items: ['Equipment maintenance', 'Electrical repairs', 'Plumbing services', 'Structural repairs'] }
                    },
                    highlight: { icon: '⚙️', text: 'Supporting industrial operations reliably' }
                },
                'Hotels & Hospitality': {
                    icon: '🏨', title: 'Hotels & Hospitality',
                    desc: 'Premium cleaning standards for hotels, resorts, and hospitality venues through our trusted partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Guest room cleaning', 'Lobby & common areas', 'Pool & spa cleaning', 'Restaurant kitchen cleaning', 'Laundry support'] },
                        'Landscaping': { icon: '🌿', items: ['Resort grounds & gardens', 'Poolscape maintenance', 'Outdoor event spaces', 'Entryway presentation'] },
                        'Maintenance': { icon: '🛠️', items: ['Room repairs', 'HVAC & climate control', 'Plumbing & electrical', 'Pool & spa equipment'] }
                    },
                    highlight: { icon: '🌟', text: 'Proudly serving the hospitality industry' }
                },
                'Event Venues': {
                    icon: '🎉', title: 'Event Venues',
                    desc: 'Pre and post-event cleaning for conference centers, stadiums, and banquet halls through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Pre-event setup cleaning', 'Post-event deep cleaning', 'Carpet & upholstery care', 'Restroom servicing', 'Waste management'] },
                        'Landscaping': { icon: '🌿', items: ['Outdoor event preparation', 'Grounds beautification', 'Post-event restoration'] },
                        'Maintenance': { icon: '🛠️', items: ['Setup & breakdown support', 'Equipment installation', 'Lighting coordination', 'Emergency repairs'] }
                    },
                    highlight: { icon: '🎊', text: 'Making every event space shine' }
                },
                'Recreation And Shopping Areas': {
                    icon: '🎮', title: 'Recreation & Shopping',
                    desc: 'Comprehensive maintenance for malls, shopping centers, and recreational facilities through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Common area cleaning', 'Food court cleaning', 'Restroom hygiene', 'Parking structure cleaning', 'Escalator care'] },
                        'Transportation': { icon: '🚌', items: ['Customer shuttle coordination', 'Security transport', 'Event transport'] },
                        'Landscaping': { icon: '🌿', items: ['Outdoor mall areas', 'Parking lot islands', 'Entryway gardens', 'Seasonal displays'] },
                        'Maintenance': { icon: '🛠️', items: ['HVAC maintenance', 'Plumbing repairs', 'Electrical work', 'Signage maintenance'] }
                    },
                    highlight: { icon: '🏬', text: 'Managing recreation and shopping spaces' }
                },
                'Healthcare Facilities': {
                    icon: '🏥', title: 'Healthcare Facilities',
                    desc: 'Cleaning and maintenance support for clinics and care facilities through our trusted partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['General area cleaning', 'Waiting area cleaning', 'Floor cleaning', 'Window cleaning'] },
                        'Landscaping': { icon: '🌿', items: ['Outdoor patient areas', 'Entryway gardens', 'Grounds maintenance'] },
                        'Maintenance': { icon: '🛠️', items: ['General repairs', 'HVAC & air quality', 'Plumbing & electrical', 'Emergency support'] }
                    },
                    highlight: { icon: '❤️', text: 'Supporting healthcare facilities with care' }
                },
                'Places of Worship': {
                    icon: '⛪', title: 'Places of Worship',
                    desc: 'Respectful cleaning and maintenance for churches, mosques, temples, and synagogues through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Sanctuary cleaning', 'Fellowship hall care', 'Kitchen cleaning', 'Restroom maintenance', 'Window washing'] },
                        'Landscaping': { icon: '🌿', items: ['Grounds & cemetery care', 'Memorial garden maintenance', 'Entryway presentation', 'Seasonal decorations'] },
                        'Maintenance': { icon: '🛠️', items: ['HVAC servicing', 'Plumbing repairs', 'Electrical work', 'General upkeep'] }
                    },
                    highlight: { icon: '🙏', text: 'Serving places of worship with respect' }
                },
                'Government Buildings': {
                    icon: '🏛️', title: 'Government Buildings',
                    desc: 'Facility services for municipal and federal buildings through our reliable partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Office cleaning', 'Public area maintenance', 'Restroom cleaning', 'Window cleaning', 'Floor care'] },
                        'Transportation': { icon: '🚌', items: ['Official vehicle coordination', 'Employee shuttle programs', 'Event transport'] },
                        'Landscaping': { icon: '🌿', items: ['Public grounds maintenance', 'Monument care', 'Sustainable practices'] },
                        'Maintenance': { icon: '🛠️', items: ['HVAC maintenance', 'Plumbing repairs', 'Electrical work', 'Emergency response'] }
                    },
                    highlight: { icon: '📋', text: 'Partnering with government agencies' }
                },
                'Banks And Financial Institutions': {
                    icon: '🏦', title: 'Banking & Finance',
                    desc: 'Discreet cleaning and maintenance for banks and financial institutions through our partner network.',
                    services: {
                        'Cleaning': { icon: '🧹', items: ['Teller area cleaning', 'Vault room cleaning', 'Customer lounge care', 'ATM area maintenance', 'Window cleaning'] },
                        'Landscaping': { icon: '🌿', items: ['Professional exterior presentation', 'Drive-thru maintenance', 'Entryway gardens'] },
                        'Maintenance': { icon: '🛠️', items: ['Security system checks', 'HVAC maintenance', 'Plumbing repairs', 'Electrical work'] }
                    },
                    highlight: { icon: '💰', text: 'Securing financial institutions with trust' }
                }
            };;

            const buildHtml = (key) => {
                const data = facilityData[key];
                if (!data) return '';
                const entries = Object.entries(data.services);
                const isThree = false; 
                const services = entries.map(([name, svc]) => `
                    <div class="tooltip-service-col ${isThree ? 'full-width' : ''}">
                        <div class="service-col-header"><span>${svc.icon}</span><span>${name}</span></div>
                        <ul class="service-list">${svc.items.map(i => `<li>${i}</li>`).join('')}</ul>
                    </div>
                `).join('');
                return `
                    <div class="tooltip-header"><div class="tooltip-icon">${data.icon}</div><h4 class="tooltip-title">${data.title}</h4></div>
                    <p class="tooltip-description">${data.desc}</p>
                    <div class="tooltip-services">${services}</div>
                    <div class="tooltip-highlight"><span>${data.highlight.icon}</span><span>${data.highlight.text}</span></div>
                `;
            };

            const position = (target) => {
                const rect = target.getBoundingClientRect();
                const tw = tooltip.offsetWidth || 380;
                const th = tooltip.offsetHeight || 400;
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const m = 12;

                // Default: below the target
                let top = rect.bottom + 10;
                let left = rect.left + rect.width / 2 - tw / 2;

                // If too close to bottom, flip above
                if (top + th > vh - m) {
                    top = rect.top - th - 10;
                    tooltip.classList.add('position-above');
                } else {
                    tooltip.classList.remove('position-above');
                }

                // If still off-screen above, force to viewport top with margin
                if (top < m) {
                    top = m;
                }

                // Horizontal bounds
                if (left < m) left = m;
                if (left + tw > vw - m) left = vw - tw - m;

                tooltip.style.top = top + 'px';
                tooltip.style.left = left + 'px';
            };

            let hideTimer = null;
            let overTip = false;

            const show = (logo) => {
                const key = logo.getAttribute('data-facility');
                if (!key || !facilityData[key]) return;
                if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                tooltip.innerHTML = buildHtml(key);
                tooltip.classList.add('visible');
                requestAnimationFrame(() => requestAnimationFrame(() => position(logo)));
            };

            const hide = () => {
                tooltip.classList.remove('visible');
                hideTimer = setTimeout(() => { if (!overTip) tooltip.innerHTML = ''; }, 300);
            };

            const logos = document.querySelectorAll('.client-logo[data-facility]');
            logos.forEach(logo => {
                logo.addEventListener('mouseenter', () => show(logo));
                logo.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => { if (!overTip) hide(); }, 60); });
                logo.addEventListener('focus', () => show(logo));
                logo.addEventListener('blur', hide);
            });

            tooltip.addEventListener('mouseenter', () => { overTip = true; if (hideTimer) clearTimeout(hideTimer); });
            tooltip.addEventListener('mouseleave', () => { overTip = false; hide(); });

            const onEsc = (e) => { if (e.key === 'Escape') { tooltip.classList.remove('visible'); tooltip.innerHTML = ''; } };
            document.addEventListener('keydown', onEsc);

            const onResize = () => {
                if (tooltip.classList.contains('visible')) {
                    const active = document.querySelector('.client-logo[data-facility]:hover');
                    if (active) position(active);
                }
            };
            window.addEventListener('resize', onResize);

            this.boundHandlers.facilityTooltips = { onEsc, onResize, tooltip };
        }

        setupEventListeners() {
            let ticking = false;
            const onScroll = () => {
                if (ticking) return;
                ticking = true;
                const rafId = requestAnimationFrame(() => {
                    this.handleParallax();
                    ticking = false;
                });
                this.rafIds.push(rafId);
            };
            window.addEventListener('scroll', onScroll, { passive: true });

            const onResize = utils.throttle(() => this.handleResize(), 250);
            window.addEventListener('resize', onResize);

            if (!this.boundHandlers.scroll) this.boundHandlers.scroll = { onScroll, onResize };
        }

        handleParallax() {
            if (!this.section) return;
            const scrolled = window.pageYOffset;
            const top = this.section.offsetTop;
            const h = this.section.offsetHeight;
            if (scrolled > top - window.innerHeight && scrolled < top + h) {
                const rate = (scrolled - top) * 0.05;
                this.section.style.backgroundPosition = `center ${rate}px`;
                this.section.querySelectorAll('.about-particle').forEach((p, i) => {
                    const speed = (i % 3 + 1) * 0.02;
                    p.style.transform = `translateY(${rate * speed}px)`;
                });
            }
        }

        handleResize() {
            [this.storyCard, this.excellenceCard, ...this.statCards].forEach(card => {
                if (card) card.style.transform = '';
            });
        }

        initDetailsToggle() {
            const toggle = document.getElementById('detailsToggle');
            const content = document.getElementById('detailsContent');
            if (!toggle || !content) return;

            const onClick = () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !expanded);
                content.setAttribute('aria-hidden', expanded);

                // Smooth scroll to content when opening
                if (!expanded) {
                    const rafId = requestAnimationFrame(() => {
                        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    });
                    this.rafIds.push(rafId);
                }
            };

            const onKey = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            };

            toggle.addEventListener('click', onClick);
            toggle.addEventListener('keydown', onKey);
            if (!this.boundHandlers.detailsToggle) this.boundHandlers.detailsToggle = [];
            this.boundHandlers.detailsToggle.push({ toggle, onClick, onKey });
        }

        destroy() {
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
            this.rafIds.forEach(id => cancelAnimationFrame(id));
            this.rafIds = [];
            if (this.observer) { this.observer.disconnect(); this.observer = null; }

            const ft = this.boundHandlers.facilityTooltips;
            if (ft) {
                document.removeEventListener('keydown', ft.onEsc);
                window.removeEventListener('resize', ft.onResize);
                if (ft.tooltip) ft.tooltip.remove();
            }

            Object.keys(this.boundHandlers).forEach(key => {
                if (key === 'facilityTooltips') return;
                const h = this.boundHandlers[key];
                if (Array.isArray(h)) {
                    h.forEach(item => {
                        if (item.card) {
                            if (item.onMove) item.card.removeEventListener('mousemove', item.onMove);
                            if (item.onLeave) item.card.removeEventListener('mouseleave', item.onLeave);
                        } else if (item.el) {
                            if (item.onMove) item.el.removeEventListener('mousemove', item.onMove);
                            if (item.onLeave) item.el.removeEventListener('mouseleave', item.onLeave);
                        } else if (item.item) {
                            if (item.onClick) item.item.removeEventListener('click', item.onClick);
                            if (item.onKey) item.item.removeEventListener('keydown', item.onKey);
                        } else if (item.badge) {
                            if (item.onEnter) item.badge.removeEventListener('mouseenter', item.onEnter);
                            if (item.onLeave) item.badge.removeEventListener('mouseleave', item.onLeave);
                            if (item.onFocus) item.badge.removeEventListener('focus', item.onFocus);
                            if (item.onBlur) item.badge.removeEventListener('blur', item.onBlur);
                        }
                    });
                } else if (h && h.onScroll) {
                    window.removeEventListener('scroll', h.onScroll);
                    window.removeEventListener('resize', h.onResize);
                }
            });
            this.boundHandlers = {};
        }
    }

    function destroy() {
        if (!state.isInitialized) return;
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];
        state.rafIds.forEach(id => cancelAnimationFrame(id));
        state.rafIds = [];
        state.isInitialized = false;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();