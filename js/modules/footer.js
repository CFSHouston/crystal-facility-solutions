
/* ============================================
   FOOTER MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        scrollThreshold: 500,
        scrollThrottleMs: 16,
        mobileParticleCount: 15,
        desktopParticleCount: 30,
        mobileBreakpoint: 768
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
        if (!document.querySelector('.footer')) return;

        initFooterParticles();
        initBackToTop();
        initCurrentYear();
        initFooterLinks();
        initScrollAnimations();

        state.isInitialized = true;
    }

    // ─── Footer Particles ───────────────────────────────────────
    function initFooterParticles() {
        const canvas = document.getElementById('footerParticleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        let particles = [];
        let animationId = null;
        let isActive = true;

        function resize() {
            const footer = canvas.closest('.footer');
            if (footer) {
                canvas.width = footer.offsetWidth;
                canvas.height = footer.offsetHeight;
            }
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 179, 66, ${this.opacity})`;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            const count = window.innerWidth < CONFIG.mobileBreakpoint
                ? CONFIG.mobileParticleCount
                : CONFIG.desktopParticleCount;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!isActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationId = requestAnimationFrame(animate);
        }

        const onVisibilityChange = () => {
            isActive = !document.hidden;
            if (isActive) animate();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const onResize = () => { resize(); createParticles(); };
        window.addEventListener('resize', onResize);

        resize();
        createParticles();
        animate();

        state.boundHandlers.particles = { onVisibilityChange, onResize, animationId };
    }

    // ─── Back to Top ────────────────────────────────────────────
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            const rafId = requestAnimationFrame(() => {
                btn.classList.toggle('visible', window.scrollY > CONFIG.scrollThreshold);
                ticking = false;
            });
            state.rafIds.push(rafId);
        };

        const onClick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        btn.addEventListener('click', onClick);

        state.boundHandlers.backToTop = { onScroll, onClick };
    }

    // ─── Current Year ───────────────────────────────────────────
    function initCurrentYear() {
        const yearElement = document.querySelector('.copy-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ─── Footer Links ───────────────────────────────────────────
    function initFooterLinks() {
        const links = document.querySelectorAll('.footer-link[data-scroll]');
        const handlers = [];

        links.forEach(link => {
            const onClick = (e) => {
                e.preventDefault();
                const targetId = link.dataset.scroll;
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            link.addEventListener('click', onClick);
            handlers.push({ link, onClick });
        });

        state.boundHandlers.footerLinks = handlers;
    }

    // ─── Scroll Animations ──────────────────────────────────────
    function initScrollAnimations() {
        const opts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, opts);

        document.querySelectorAll('.footer-column').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });

        state.boundHandlers.scrollObserver = observer;
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Clear timeouts
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];

        // Cancel rAF
        state.rafIds.forEach(id => cancelAnimationFrame(id));
        state.rafIds = [];

        // Stop particles
        if (state.boundHandlers.particles) {
            const { onVisibilityChange, onResize, animationId } = state.boundHandlers.particles;
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('resize', onResize);
            if (animationId) cancelAnimationFrame(animationId);
        }

        // Back to top
        if (state.boundHandlers.backToTop) {
            window.removeEventListener('scroll', state.boundHandlers.backToTop.onScroll);
            const btn = document.getElementById('backToTop');
            if (btn) btn.removeEventListener('click', state.boundHandlers.backToTop.onClick);
        }

        // Footer links
        if (state.boundHandlers.footerLinks) {
            state.boundHandlers.footerLinks.forEach(h => {
                h.link.removeEventListener('click', h.onClick);
            });
        }

        // Observer
        if (state.boundHandlers.scrollObserver) {
            state.boundHandlers.scrollObserver.disconnect();
        }

        state.boundHandlers = {};
        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();