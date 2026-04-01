/* ============================================
   CRYSTAL FACILITY SOLUTIONS - FOOTER SECTION
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // FOOTER PARTICLE SYSTEM
    // ============================================
    function initFooterParticles() {
        const canvas = document.getElementById('footerParticleCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let isActive = true;
        
        function resize() {
            const footer = canvas.closest('.footer');
            if (footer) {
                canvas.width = footer.offsetWidth;
                canvas.height = footer.offsetHeight;
            }
        }
        
        class Particle {
            constructor() {
                this.reset();
            }
            
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
        
        function init() {
            resize();
            const particleCount = window.innerWidth < 768 ? 15 : 30;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        function animate() {
            if (!isActive) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
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
    // BACK TO TOP BUTTON
    // ============================================
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 500;
                    btn.classList.toggle('visible', scrolled);
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // CURRENT YEAR
    // ============================================
    function initCurrentYear() {
        const yearElement = document.querySelector('.copy-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ============================================
    // FOOTER LINK SMOOTH SCROLL
    // ============================================
    function initFooterLinks() {
        document.querySelectorAll('.footer-link[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.scroll;
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.footer-column').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        initFooterParticles();
        initBackToTop();
        initCurrentYear();
        initFooterLinks();
        initScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();