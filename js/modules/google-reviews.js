/* ============================================
   GOOGLE REVIEWS MODULE
   Manual values — no API, no window globals
   ============================================ */

(function() {
    'use strict';

    // ─── CONFIG: Update these manually ────────────────────────
    const CONFIG = {
        rating: 5.0,      // ← Change this when reviews update
        count: 3,         // ← Change this when reviews update
        lastUpdated: '2026-05-14'  // ← Change date when updated
    };

    // ─── Star Generator ───────────────────────────────────────
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const decimal = rating - fullStars;
        let partialStar = '';
        let emptyStars = 5 - fullStars;

        if (decimal >= 0.75) {
            emptyStars -= 1;
        } else if (decimal >= 0.25) {
            partialStar = '<span class="star"><i class="fas fa-star-half-alt"></i></span>';
            emptyStars -= 1;
        }

        let html = '';

        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star"><i class="fas fa-star"></i></span>';
        }

        if (partialStar) {
            html += partialStar;
        } else if (decimal >= 0.75) {
            html += '<span class="star"><i class="fas fa-star"></i></span>';
        }

        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star"><i class="far fa-star"></i></span>';
        }

        return html;
    }

    // ─── UI Update ────────────────────────────────────────────
    function updateUI() {
        const skeleton = document.getElementById('ratingSkeleton');
        const stars = document.getElementById('ratingStars');
        const text = document.getElementById('ratingText');
        const count = document.getElementById('ratingCount');
        const reviewCount = document.getElementById('reviewCount');
        const updated = document.getElementById('ratingUpdated');

        if (!stars || !text) {
            console.warn('[Reviews] DOM elements not found');
            return;
        }

        // Hide skeleton
        if (skeleton) skeleton.style.display = 'none';

        // Show and populate stars
        stars.innerHTML = generateStars(CONFIG.rating);
        stars.style.display = 'flex';

        // Animate stars
        const starEls = stars.querySelectorAll('.star');
        starEls.forEach(function(star, i) {
            star.style.animationDelay = (i * 0.08) + 's';
            star.classList.add('pop-in');
        });

        // Update text
        text.textContent = CONFIG.rating.toFixed(1) + ' out of 5';
        text.style.display = 'block';

        if (count) count.style.display = 'block';
        if (reviewCount) reviewCount.textContent = CONFIG.count.toLocaleString();

        // Update timestamp
        if (updated) {
            updated.textContent = 'Updated ' + CONFIG.lastUpdated;
        }
    }

    // ─── Run ───────────────────────────────────────────────────
    function init() {
        try {
            updateUI();
        } catch (e) {
            console.error('[Reviews] Init failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();