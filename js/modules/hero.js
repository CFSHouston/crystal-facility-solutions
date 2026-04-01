/* ============================================
   CRYSTAL FACILITY SOLUTIONS - HERO MODULE
   Interactive Hero Section with Particles & Effects
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // PARTICLE SYSTEM
    // ============================================
    function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let isActive = true;
        
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
        
        function init() {
            resize();
            const particleCount = window.innerWidth < 768 ? 25 : 50;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        function animate() {
            if (!isActive) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Draw connections
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(124, 179, 66, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        // Visibility check
        document.addEventListener('visibilitychange', () => {
            isActive = !document.hidden;
            if (isActive) animate();
        });
        
        window.addEventListener('resize', () => {
            resize();
            init();
        });
        
        init();
        animate();
    }

    // ============================================
    // TYPING ANIMATION
    // ============================================
    function initTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;
        
        const text = typingElement.dataset.text;
        let index = 0;
        let isDeleting = false;
        
        function type() {
            if (!isDeleting && index <= text.length) {
                typingElement.textContent = text.slice(0, index++);
                setTimeout(type, 150);
            } else if (isDeleting && index > 0) {
                typingElement.textContent = text.slice(0, --index);
                setTimeout(type, 100);
            } else {
                isDeleting = !isDeleting;
                setTimeout(type, isDeleting ? 2000 : 500);
            }
        }
        
        setTimeout(type, 2000);
    }

    // ============================================
    // MOUSE GLOW EFFECT
    // ============================================
    function initMouseGlow() {
        const glow = document.getElementById('mouseGlow');
        const hero = document.querySelector('.hero');
        if (!glow || !hero || window.matchMedia('(pointer: coarse)').matches) return;
        
        let rafId;
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        function animate() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';
            
            rafId = requestAnimationFrame(animate);
        }
        
        animate();
        
        hero.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
        
        hero.addEventListener('mouseenter', () => {
            glow.style.opacity = '1';
        });
    }

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================
    function initButtonRipple() {
        const btn = document.querySelector('.btn-hero-primary');
        if (!btn) return;
        
        const ripple = btn.querySelector('.btn-ripple');
        if (!ripple) return;
        
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            ripple.style.setProperty('--x', x + '%');
            ripple.style.setProperty('--y', y + '%');
        });
    }

    // ============================================
    // SCROLL INDICATOR
    // ============================================
    function initScrollIndicator() {
        const indicator = document.querySelector('.scroll-indicator');
        if (!indicator) return;
        
        indicator.addEventListener('click', () => {
            const services = document.getElementById('services');
            if (services) {
                services.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 100;
                    indicator.style.opacity = scrolled ? '0' : '1';
                    indicator.style.pointerEvents = scrolled ? 'none' : 'auto';
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // PARALLAX EFFECT
    // ============================================
    function initParallax() {
        const shapes = document.querySelectorAll('.shape');
        if (!shapes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    
                    shapes.forEach((shape, index) => {
                        const speed = (index + 1) * 0.1;
                        shape.style.transform = `translateY(${rate * speed}px)`;
                    });
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        setTimeout(() => {
            initParticles();
            initTypingAnimation();
            initMouseGlow();
            initButtonRipple();
            initScrollIndicator();
            initParallax();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();