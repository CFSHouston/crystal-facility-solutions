/* ============================================
   HERO MODULE - Crystal & Water Drop Background + Typing Animation
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Crystal Canvas Config ─────────────────────────────────
    const CANVAS_CONFIG = {
        crystalCount: 7,
        dropletCount: 18,
        sparkleCount: 30,
        connectionDistance: 150,
        mouseInfluenceRadius: 200,
        colors: {
            crystal: { r: 200, g: 230, b: 255 },
            crystalHighlight: { r: 255, g: 255, b: 255 },
            droplet: { r: 168, g: 216, b: 255 },
            dropletCore: { r: 255, g: 255, b: 255 },
            sparkle: { r: 220, g: 240, b: 255 },
            greenAccent: { r: 124, g: 179, b: 66 }
        }
    };

    // ─── Typing Animation Config ───────────────────────────────
    const TYPING_CONFIG = {
        words: ['CLEANING', 'MAINTENANCE', 'LANDSCAPING', 'TRANSPORTATION'],
        typeSpeed: 120,
        deleteSpeed: 60,
        pauseTime: 800,
        startDelay: 1000
    };

    // ─── Shared State ──────────────────────────────────────────
    let canvas, ctx;
    let width, height;
    let crystals = [];
    let droplets = [];
    let sparkles = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId = null;
    let isActive = true;

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
    //  CRYSTAL & WATER DROP CANVAS CLASSES
    // ═══════════════════════════════════════════════════════════

    class Crystal {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 60 + 30;
            this.sides = Math.floor(Math.random() * 3) + 5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.002;
            this.opacity = Math.random() * 0.15 + 0.05;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.001 + 0.0005;
            this.driftX = (Math.random() - 0.5) * 0.2;
            this.driftY = (Math.random() - 0.5) * 0.15;
        }
        update() {
            this.rotation += this.rotationSpeed;
            this.pulsePhase += this.pulseSpeed;
            this.x += this.driftX;
            this.y += this.driftY;
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CANVAS_CONFIG.mouseInfluenceRadius) {
                const force = (CANVAS_CONFIG.mouseInfluenceRadius - dist) / CANVAS_CONFIG.mouseInfluenceRadius;
                this.rotation += force * 0.01;
                this.opacity = Math.min(0.25, this.opacity + force * 0.001);
            } else {
                this.opacity = Math.max(0.05, this.opacity - 0.0001);
            }
            if (this.x < -100) this.x = width + 100;
            if (this.x > width + 100) this.x = -100;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;
        }
        draw() {
            const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
            const currentOpacity = this.opacity * (0.8 + pulse * 0.2);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            for (let i = 0; i < this.sides; i++) {
                const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? this.size : this.size * 0.6;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            grad.addColorStop(0, `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, ${currentOpacity * 0.8})`);
            grad.addColorStop(0.5, `rgba(${CANVAS_CONFIG.colors.crystal.r}, ${CANVAS_CONFIG.colors.crystal.g}, ${CANVAS_CONFIG.colors.crystal.b}, ${currentOpacity * 0.5})`);
            grad.addColorStop(1, `rgba(${CANVAS_CONFIG.colors.crystal.r}, ${CANVAS_CONFIG.colors.crystal.g}, ${CANVAS_CONFIG.colors.crystal.b}, 0)`);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, ${currentOpacity * 0.6})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            for (let i = 0; i < this.sides; i++) {
                const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? this.size * 0.7 : this.size * 0.4;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.strokeStyle = `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, ${currentOpacity * 0.3})`;
            ctx.stroke();
            ctx.restore();
        }
    }

    class Droplet {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 4 + 2;
            this.speedY = Math.random() * 0.8 + 0.2;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.wobblePhase = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.trail = [];
            this.maxTrailLength = 8;
        }
        update() {
            this.wobblePhase += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobblePhase) * 0.5;
            this.y += this.speedY;
            this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
            if (this.trail.length > this.maxTrailLength) this.trail.shift();
            if (this.y > height + 20) {
                this.y = -20;
                this.x = Math.random() * width;
                this.trail = [];
            }
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CANVAS_CONFIG.mouseInfluenceRadius * 0.5) {
                const force = (CANVAS_CONFIG.mouseInfluenceRadius * 0.5 - dist) / (CANVAS_CONFIG.mouseInfluenceRadius * 0.5);
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;
            }
        }
        draw() {
            this.trail.forEach((point, index) => {
                const trailOpacity = (index / this.trail.length) * this.opacity * 0.3;
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.radius * (index / this.trail.length), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CANVAS_CONFIG.colors.droplet.r}, ${CANVAS_CONFIG.colors.droplet.g}, ${CANVAS_CONFIG.colors.droplet.b}, ${trailOpacity})`;
                ctx.fill();
            });
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(
                this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
                this.x, this.y, this.radius
            );
            grad.addColorStop(0, `rgba(${CANVAS_CONFIG.colors.dropletCore.r}, ${CANVAS_CONFIG.colors.dropletCore.g}, ${CANVAS_CONFIG.colors.dropletCore.b}, ${this.opacity * 0.9})`);
            grad.addColorStop(0.4, `rgba(${CANVAS_CONFIG.colors.droplet.r}, ${CANVAS_CONFIG.colors.droplet.g}, ${CANVAS_CONFIG.colors.droplet.b}, ${this.opacity * 0.7})`);
            grad.addColorStop(1, `rgba(${CANVAS_CONFIG.colors.droplet.r}, ${CANVAS_CONFIG.colors.droplet.g}, ${CANVAS_CONFIG.colors.droplet.b}, ${this.opacity * 0.3})`);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            const glowGrad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 2);
            glowGrad.addColorStop(0, `rgba(${CANVAS_CONFIG.colors.droplet.r}, ${CANVAS_CONFIG.colors.droplet.g}, ${CANVAS_CONFIG.colors.droplet.b}, ${this.opacity * 0.2})`);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.fill();
        }
    }

    class Sparkle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.life = 0;
            this.maxLife = Math.random() * 120 + 60;
            this.fadeIn = this.maxLife * 0.2;
            this.fadeOut = this.maxLife * 0.2;
            this.driftX = (Math.random() - 0.5) * 0.5;
            this.driftY = (Math.random() - 0.5) * 0.5;
            this.twinkleSpeed = Math.random() * 0.1 + 0.05;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.life++;
            this.x += this.driftX;
            this.y += this.driftY;
            this.twinklePhase += this.twinkleSpeed;
            if (this.life >= this.maxLife) this.reset();
        }
        draw() {
            let opacity = 0;
            if (this.life < this.fadeIn) opacity = this.life / this.fadeIn;
            else if (this.life > this.maxLife - this.fadeOut) opacity = (this.maxLife - this.life) / this.fadeOut;
            else opacity = 1;
            const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
            opacity *= twinkle;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.twinklePhase * 0.5);
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 2);
            ctx.lineTo(0, this.size * 2);
            ctx.moveTo(-this.size * 2, 0);
            ctx.lineTo(this.size * 2, 0);
            ctx.strokeStyle = `rgba(${CANVAS_CONFIG.colors.sparkle.r}, ${CANVAS_CONFIG.colors.sparkle.g}, ${CANVAS_CONFIG.colors.sparkle.b}, ${opacity * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
            ctx.restore();
        }
    }

    // ─── Canvas Helpers ────────────────────────────────────────
    function drawConnections() {
        for (let i = 0; i < crystals.length; i++) {
            for (let j = i + 1; j < crystals.length; j++) {
                const dx = crystals[i].x - crystals[j].x;
                const dy = crystals[i].y - crystals[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CANVAS_CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CANVAS_CONFIG.connectionDistance) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(crystals[i].x, crystals[i].y);
                    ctx.lineTo(crystals[j].x, crystals[j].y);
                    ctx.strokeStyle = `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawLightRays() {
        const time = Date.now() * 0.0003;
        const rayCount = 5;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + time;
            const x1 = width * 0.5 + Math.cos(angle) * 100;
            const y1 = height * 0.5 + Math.sin(angle) * 100;
            const x2 = x1 + Math.cos(angle) * 400;
            const y2 = y1 + Math.sin(angle) * 400;
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, 0)`);
            grad.addColorStop(0.5, `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, 0.03)`);
            grad.addColorStop(1, `rgba(${CANVAS_CONFIG.colors.crystalHighlight.r}, ${CANVAS_CONFIG.colors.crystalHighlight.g}, ${CANVAS_CONFIG.colors.crystalHighlight.b}, 0)`);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2 + Math.cos(angle + Math.PI / 2) * 30, y2 + Math.sin(angle + Math.PI / 2) * 30);
            ctx.lineTo(x2 - Math.cos(angle + Math.PI / 2) * 30, y2 - Math.sin(angle + Math.PI / 2) * 30);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    // ─── Canvas Init ───────────────────────────────────────────
    function initCanvas() {
        canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d', { willReadFrequently: false });
        resizeCanvas();
        for (let i = 0; i < CANVAS_CONFIG.crystalCount; i++) crystals.push(new Crystal());
        for (let i = 0; i < CANVAS_CONFIG.dropletCount; i++) droplets.push(new Droplet());
        for (let i = 0; i < CANVAS_CONFIG.sparkleCount; i++) sparkles.push(new Sparkle());
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });
            hero.addEventListener('mouseleave', () => {
                mouse.x = -1000;
                mouse.y = -1000;
            });
        }
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('visibilitychange', () => {
            isActive = !document.hidden;
            if (isActive) animateCanvas();
        });
        animateCanvas();
    }

    function resizeCanvas() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        width = hero.offsetWidth;
        height = hero.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function animateCanvas() {
        if (!isActive) {
            animationId = null;
            return;
        }
        ctx.clearRect(0, 0, width, height);
        drawLightRays();
        drawConnections();
        crystals.forEach(c => { c.update(); c.draw(); });
        droplets.forEach(d => { d.update(); d.draw(); });
        sparkles.forEach(s => { s.update(); s.draw(); });
        animationId = requestAnimationFrame(animateCanvas);
    }

    // ═══════════════════════════════════════════════════════════
    //  TYPING ANIMATION
    // ═══════════════════════════════════════════════════════════

    function initTyping() {
        typingElement = document.querySelector('.typing-text');
        cursorElement = document.querySelector('.typing-cursor');
        if (!typingElement) {
            console.warn('Typing animation: .typing-text element not found');
            return;
        }
        typingElement.textContent = '';
        setTimeout(() => {
            if (typingActive) typingLoop();
        }, TYPING_CONFIG.startDelay);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                typingActive = false;
                if (typingTimeoutId) clearTimeout(typingTimeoutId);
            } else {
                typingActive = true;
                typingLoop();
            }
        });
    }

    function typingLoop() {
        if (!typingActive || !typingElement) return;
        const currentWord = TYPING_CONFIG.words[wordIndex];
        if (isPaused) {
            isPaused = false;
            isDeleting = true;
            typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.pauseTime);
            return;
        }
        if (isDeleting) {
            charIndex--;
            typingElement.textContent = currentWord.substring(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % TYPING_CONFIG.words.length;
                typingTimeoutId = setTimeout(typingLoop, 300);
            } else {
                typingTimeoutId = setTimeout(typingLoop, TYPING_CONFIG.deleteSpeed);
            }
        } else {
            charIndex++;
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

    function init() {
        initCanvas();
        initTyping();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();