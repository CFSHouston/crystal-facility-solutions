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
                switch(target) { case 99: pct = 99; break; case 14: pct = 70; break; case 500: pct = 85; break; case 50: pct = 75; break; default: pct = 80; }

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
                    if (text) this.showTooltip(badge, text);
                };
                const onLeave = () => this.hideTooltip(badge);
                const onFocus = () => {
                    const text = badge.getAttribute('title') || badge.getAttribute('aria-label');
                    if (text) this.showTooltip(badge, text);
                };
                const onBlur = () => this.hideTooltip(badge);
                badge.addEventListener('mouseenter', onEnter);
                badge.addEventListener('mouseleave', onLeave);
                badge.addEventListener('focus', onFocus);
                badge.addEventListener('blur', onBlur);
                if (!this.boundHandlers.tooltips) this.boundHandlers.tooltips = [];
                this.boundHandlers.tooltips.push({ badge, onEnter, onLeave, onFocus, onBlur });
            });
        }

        showTooltip(el, text) {
            let tip = el.querySelector('.cert-tooltip');
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'cert-tooltip';
                tip.textContent = text;
                tip.style.position = 'absolute';
                tip.style.bottom = 'calc(100% + 10px)';
                tip.style.left = '50%';
                tip.style.transform = 'translateX(-50%) scale(0.8)';
                tip.style.background = '#212529';
                tip.style.color = 'white';
                tip.style.padding = '0.75rem 1rem';
                tip.style.borderRadius = '10px';
                tip.style.fontSize = '0.85rem';
                tip.style.whiteSpace = 'nowrap';
                tip.style.zIndex = '100';
                tip.style.opacity = '0';
                tip.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                tip.style.pointerEvents = 'none';

                const arrow = document.createElement('div');
                arrow.style.position = 'absolute';
                arrow.style.top = '100%';
                arrow.style.left = '50%';
                arrow.style.transform = 'translateX(-50%)';
                arrow.style.border = '6px solid transparent';
                arrow.style.borderTopColor = '#212529';
                tip.appendChild(arrow);

                el.style.position = 'relative';
                el.appendChild(tip);

                const rafId = requestAnimationFrame(() => {
                    tip.style.opacity = '1';
                    tip.style.transform = 'translateX(-50%) scale(1)';
                });
                this.rafIds.push(rafId);
            }
        }

        hideTooltip(el) {
            const tip = el.querySelector('.cert-tooltip');
            if (tip) {
                tip.style.opacity = '0';
                tip.style.transform = 'translateX(-50%) scale(0.8)';
                const t = setTimeout(() => { if (tip.parentNode) tip.remove(); }, 300);
                this.timeouts.push(t);
            }
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

        destroy() {
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
            this.rafIds.forEach(id => cancelAnimationFrame(id));
            this.rafIds = [];
            if (this.observer) { this.observer.disconnect(); this.observer = null; }

            Object.keys(this.boundHandlers).forEach(key => {
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

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];
        state.rafIds.forEach(id => cancelAnimationFrame(id));
        state.rafIds = [];
        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();