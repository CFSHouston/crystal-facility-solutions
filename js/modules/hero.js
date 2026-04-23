/* ============================================
   HERO MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        particles: {
            mobileCount: 25,
            desktopCount: 50,
            connectionDistance: 100,
            connectionOpacity: 0.1,
            mobileBreakpoint: 768
        },
        typing: {
            typeSpeed: 150,
            deleteSpeed: 100,
            pauseBeforeDelete: 2000,
            pauseBeforeType: 500,
            startDelay: 2000
        },
        scroll: {
            indicatorFadeThreshold: 100,
            parallaxRate: 0.3,
            throttleMs: 16
        },
        glow: {
            lerpFactor: 0.1
        }
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isTouchDevice: window.matchMedia('(pointer: coarse)').matches
    };

    // Store all cleanup functions
    const cleanupRegistry = [];

    function registerCleanup(fn) {
        cleanupRegistry.push(fn);
    }

    function clearAllTimeouts() {
        // Track highest timeout ID and clear all up to it
        const highest = setTimeout(() => {}, 0);
        for (let i = 0; i <= highest; i++) {
            clearTimeout(i);
        }
    }

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;
        if (!document.querySelector('.hero')) return;

        initParticles();
        initTypingAnimation();
        initMouseGlow();
        initButtonRipple();
        initParallax();

        state.isInitialized = true;
    }

    // ─── Particle System ────────────────────────────────────────
    function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        let particles = [];
        let animationId = null;
        let isVisible = true;

        const particleCount = window.innerWidth < CONFIG.particles.mobileBreakpoint
            ? CONFIG.particles.mobileCount
            : CONFIG.particles.desktopCount;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.color = Math.random() > 0.5 ? '124, 179, 66' : '156, 204, 101';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            const maxDist = CONFIG.particles.connectionDistance;
            const maxOpacity = CONFIG.particles.connectionOpacity;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(124, 179, 66, ${maxOpacity * (1 - distance / maxDist)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!isVisible) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            animationId = requestAnimationFrame(animate);
        }

        function onVisibilityChange() {
            isVisible = document.visibilityState === 'visible';
            if (isVisible && !animationId) {
                animate();
            }
        }

        function onResize() {
            resize();
            createParticles();
        }

        resize();
        createParticles();
        animate();

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('resize', onResize);

        registerCleanup(() => {
            isVisible = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('resize', onResize);
        });
    }

    // ─── Typing Animation ───────────────────────────────────────
    function initTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;

        const text = typingElement.dataset.text || '';
        if (!text) return;

        let index = 0;
        let isDeleting = false;
        let timeoutId = null;
        let isRunning = true;

        function type() {
            if (!isRunning) return;

            if (!isDeleting && index <= text.length) {
                typingElement.textContent = text.slice(0, index++);
                timeoutId = setTimeout(type, CONFIG.typing.typeSpeed);
            } else if (isDeleting && index > 0) {
                typingElement.textContent = text.slice(0, --index);
                timeoutId = setTimeout(type, CONFIG.typing.deleteSpeed);
            } else {
                isDeleting = !isDeleting;
                timeoutId = setTimeout(type, isDeleting
                    ? CONFIG.typing.pauseBeforeDelete
                    : CONFIG.typing.pauseBeforeType);
            }
        }

        timeoutId = setTimeout(type, CONFIG.typing.startDelay);

        registerCleanup(() => {
            isRunning = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        });
    }

    // ─── Mouse Glow Effect ──────────────────────────────────────
    function initMouseGlow() {
        const glow = document.getElementById('mouseGlow');
        const hero = document.querySelector('.hero');
        if (!glow || !hero || state.isTouchDevice) return;

        let rafId = null;
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        let isActive = true;

        function onMouseMove(e) {
            const rect = hero.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }

        function onMouseLeave() {
            glow.style.opacity = '0';
        }

        function onMouseEnter() {
            glow.style.opacity = '1';
        }

        function animate() {
            if (!isActive) return;
            currentX += (mouseX - currentX) * CONFIG.glow.lerpFactor;
            currentY += (mouseY - currentY) * CONFIG.glow.lerpFactor;
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';
            rafId = requestAnimationFrame(animate);
        }

        hero.addEventListener('mousemove', onMouseMove);
        hero.addEventListener('mouseleave', onMouseLeave);
        hero.addEventListener('mouseenter', onMouseEnter);

        if (!state.prefersReducedMotion) {
            animate();
        }

        registerCleanup(() => {
            isActive = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            hero.removeEventListener('mousemove', onMouseMove);
            hero.removeEventListener('mouseleave', onMouseLeave);
            hero.removeEventListener('mouseenter', onMouseEnter);
        });
    }

    // ─── Button Ripple Effect ───────────────────────────────────
    function initButtonRipple() {
        const btn = document.querySelector('.btn-hero-primary');
        if (!btn) return;

        const ripple = btn.querySelector('.btn-ripple');
        if (!ripple) return;

        function onMouseMove(e) {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            ripple.style.setProperty('--x', x + '%');
            ripple.style.setProperty('--y', y + '%');
        }

        btn.addEventListener('mousemove', onMouseMove);

        registerCleanup(() => {
            btn.removeEventListener('mousemove', onMouseMove);
        });
    }

    // ─── Parallax Effect ────────────────────────────────────────
    function initParallax() {
        const shapes = document.querySelectorAll('.shape');
        if (!shapes.length || state.prefersReducedMotion) return;

        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * CONFIG.scroll.parallaxRate;
                shapes.forEach((shape, index) => {
                    const speed = (index + 1) * 0.1;
                    shape.style.transform = `translateY(${rate * speed}px)`;
                });
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        registerCleanup(() => {
            window.removeEventListener('scroll', onScroll);
        });
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        cleanupRegistry.forEach(fn => {
            try { fn(); } catch (e) { /* ignore cleanup errors */ }
        });
        cleanupRegistry.length = 0;

        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();