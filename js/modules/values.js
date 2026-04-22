/* ============================================
   CORE VALUES MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        tiltMaxAngle: 15,
        tiltPerspective: 1000,
        particleCount: 12,
        magneticStrength: 0.3,
        animationDuration: 500,
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
        random: (min, max) => Math.random() * (max - min) + min,
        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        timeouts: [],
        rafIds: [],
        boundHandlers: {}
    };

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;
        if (!document.querySelector('.values-container')) return;

        new CoreValuesModule();
        state.isInitialized = true;
    }

    class CoreValuesModule {
        constructor() {
            this.cards = [];
            this.activeCard = null;
            this.isTouch = utils.isTouchDevice();
            this.timeouts = [];
            this.rafIds = [];
            this.boundHandlers = {};
            this.init();
        }

        init() {
            this.cacheElements();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupProgressIndicator();
            if (!this.isTouch) {
                this.setup3DTilt();
                this.setupMagneticButtons();
            }
            this.animateEntry();
        }

        cacheElements() {
            this.container = document.querySelector('.values-container');
            this.cards = document.querySelectorAll('.value-card');
            this.toggles = document.querySelectorAll('.value-toggle');
        }

        setupEventListeners() {
            const self = this;

            // Card click handlers
            this.cards.forEach((card, index) => {
                const onClick = (e) => self.handleCardClick(e, card, index);
                const onKeyDown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.handleCardClick(e, card, index);
                    }
                };

                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-expanded', 'false');
                card.addEventListener('click', onClick);
                card.addEventListener('keydown', onKeyDown);

                if (!this.boundHandlers.cards) this.boundHandlers.cards = [];
                this.boundHandlers.cards.push({ card, onClick, onKeyDown });
            });

            // Escape key
            const onEscape = (e) => {
                if (e.key === 'Escape') self.closeAllCards();
            };
            document.addEventListener('keydown', onEscape);
            this.boundHandlers.escape = onEscape;

            // Click outside
            const onDocumentClick = (e) => {
                if (!e.target.closest('.value-card')) self.closeAllCards();
            };
            document.addEventListener('click', onDocumentClick);
            this.boundHandlers.documentClick = onDocumentClick;

            // Resize
            const onResize = utils.throttle(() => self.handleResize(), 250);
            window.addEventListener('resize', onResize);
            this.boundHandlers.resize = onResize;
        }

        handleCardClick(e, card, index) {
            if (e.target.tagName === 'A') return;
            const isActive = card.classList.contains('active');
            this.closeAllCards();
            if (!isActive) {
                this.openCard(card, index);
                if (!this.isTouch) this.createParticleBurst(card);
            }
        }

        openCard(card, index) {
            card.classList.add('active');
            card.setAttribute('aria-expanded', 'true');
            this.activeCard = card;
            this.updateProgressIndicator(index);

            if (window.innerWidth < 768) {
                const timeoutId = setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }, 100);
                this.timeouts.push(timeoutId);
            }

            const title = card.querySelector('h3')?.textContent || '';
            this.announceToScreenReader('Expanded ' + title);
        }

        closeAllCards() {
            this.cards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-expanded', 'false');
            });
            this.activeCard = null;
            this.updateProgressIndicator(-1);
        }

        // ─── 3D Tilt ──────────────────────────────────────────────
        setup3DTilt() {
            this.cards.forEach(card => {
                const onMove = utils.throttle((e) => {
                    if (card.classList.contains('active')) return;
                    this.handleTilt(e, card);
                }, 16);
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
            card.style.transform = `perspective(${CONFIG.tiltPerspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-12px) scale(1.02)`;
        }

        resetTilt(card) { card.style.transform = ''; }

        // ─── Magnetic Buttons ─────────────────────────────────────
        setupMagneticButtons() {
            this.toggles.forEach(toggle => {
                const onMove = (e) => {
                    const rect = toggle.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    toggle.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
                };
                const onLeave = () => { toggle.style.transform = ''; };

                toggle.addEventListener('mousemove', onMove);
                toggle.addEventListener('mouseleave', onLeave);

                if (!this.boundHandlers.magnetic) this.boundHandlers.magnetic = [];
                this.boundHandlers.magnetic.push({ toggle, onMove, onLeave });
            });
        }

        // ─── Particle Burst ───────────────────────────────────────
        createParticleBurst(card) {
            const rect = card.getBoundingClientRect();
            const particles = [];

            for (let i = 0; i < CONFIG.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = utils.random(6, 12);
                const color = i % 2 === 0 ? 'var(--cfs-green, #7cb342)' : 'var(--cfs-light-green, #9ccc65)';
                particle.style.position = 'fixed';
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.background = color;
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                particle.style.left = (rect.left + rect.width / 2) + 'px';
                particle.style.top = (rect.top + rect.height / 2) + 'px';
                document.body.appendChild(particle);

                particles.push({
                    element: particle,
                    vx: utils.random(-8, 8),
                    vy: utils.random(-8, 8),
                    life: 1
                });
            }

            const animateParticles = () => {
                let active = 0;
                particles.forEach(p => {
                    if (p.life > 0) {
                        const left = parseFloat(p.element.style.left);
                        const top = parseFloat(p.element.style.top);
                        p.element.style.left = (left + p.vx) + 'px';
                        p.element.style.top = (top + p.vy) + 'px';
                        p.element.style.opacity = p.life;
                        p.element.style.transform = `scale(${p.life})`;
                        p.vx *= 0.98;
                        p.vy *= 0.98;
                        p.life -= 0.02;
                        active++;
                    } else {
                        p.element.remove();
                    }
                });
                if (active > 0) {
                    const rafId = requestAnimationFrame(animateParticles);
                    this.rafIds.push(rafId);
                }
            };

            const rafId = requestAnimationFrame(animateParticles);
            this.rafIds.push(rafId);
        }

        // ─── Progress Indicator ───────────────────────────────────
        setupProgressIndicator() {
            if (!document.querySelector('.values-progress')) {
                const progress = document.createElement('div');
                progress.className = 'values-progress';

                this.cards.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'progress-dot';
                    dot.setAttribute('aria-label', 'Go to value ' + (index + 1));
                    const onClick = () => {
                        this.cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        this.cards[index].focus();
                    };
                    dot.addEventListener('click', onClick);
                    progress.appendChild(dot);

                    if (!this.boundHandlers.progress) this.boundHandlers.progress = [];
                    this.boundHandlers.progress.push({ dot, onClick });
                });

                this.container.after(progress);
            }
        }

        updateProgressIndicator(activeIndex) {
            document.querySelectorAll('.progress-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }

        // ─── Intersection Observer ────────────────────────────────
        setupIntersectionObserver() {
            const opts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        entry.target.style.animationPlayState = 'running';
                        entry.target.querySelectorAll('.value-icon, .value-content').forEach((child, i) => {
                            child.style.animationDelay = (i * 0.1) + 's';
                            child.classList.add('animate-in');
                        });
                    }
                });
            }, opts);

            this.cards.forEach(card => {
                card.style.animationPlayState = 'paused';
                this.observer.observe(card);
            });
        }

        // ─── Entry Animation ──────────────────────────────────────
        animateEntry() {
            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px)';

                const timeoutId = setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = '';
                }, index * 100);
                this.timeouts.push(timeoutId);
            });
        }

        // ─── Resize Handler ───────────────────────────────────────
        handleResize() {
            this.cards.forEach(card => { card.style.transform = ''; });
            if (window.innerWidth < 768 && this.activeCard) {
                this.closeAllCards();
            }
        }

        // ─── Screen Reader Announcements ──────────────────────────
        announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.style.position = 'absolute';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.padding = '0';
            announcement.style.margin = '-1px';
            announcement.style.overflow = 'hidden';
            announcement.style.clip = 'rect(0, 0, 0, 0)';
            announcement.style.whiteSpace = 'nowrap';
            announcement.style.border = '0';
            announcement.textContent = message;

            document.body.appendChild(announcement);
            const timeoutId = setTimeout(() => { if (announcement.parentNode) announcement.remove(); }, 1000);
            this.timeouts.push(timeoutId);
        }

        // ─── Cleanup ──────────────────────────────────────────────
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
                            if (item.onClick) item.card.removeEventListener('click', item.onClick);
                            if (item.onKeyDown) item.card.removeEventListener('keydown', item.onKeyDown);
                        } else if (item.toggle) {
                            if (item.onMove) item.toggle.removeEventListener('mousemove', item.onMove);
                            if (item.onLeave) item.toggle.removeEventListener('mouseleave', item.onLeave);
                        } else if (item.dot && item.onClick) {
                            item.dot.removeEventListener('click', item.onClick);
                        }
                    });
                } else if (key === 'escape' || key === 'documentClick') {
                    document.removeEventListener(key === 'escape' ? 'keydown' : 'click', h);
                } else if (key === 'resize') {
                    window.removeEventListener('resize', h);
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