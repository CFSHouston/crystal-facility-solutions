/* ============================================
   GOOGLE REVIEWS MODULE
   Manual update via browser console
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        defaultRating: 4.8,
        defaultCount: 127,
        cacheMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // ─── Cache Helpers ──────────────────────────────────────────
    function getStoredData() {
        try {
            const stored = localStorage.getItem('cfs_google_reviews');
            if (!stored) return null;
            
            const data = JSON.parse(stored);
            const age = Date.now() - data.timestamp;
            
            return {
                rating: data.rating,
                count: data.count,
                timestamp: data.timestamp,
                isStale: age > CONFIG.cacheMaxAge,
                daysOld: Math.floor(age / (24 * 60 * 60 * 1000))
            };
        } catch (e) {
            console.error('Error reading stored reviews:', e);
            return null;
        }
    }

    function storeData(rating, count) {
        try {
            const data = {
                rating: parseFloat(rating),
                count: parseInt(count),
                timestamp: Date.now()
            };
            localStorage.setItem('cfs_google_reviews', JSON.stringify(data));
            return data;
        } catch (e) {
            console.error('Error storing reviews:', e);
            return null;
        }
    }

    // ─── Star Generator ───────────────────────────────────────
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const decimal = rating - fullStars;
        let partialStar = '';
        let emptyStars = 5 - fullStars;

        // Determine partial star
        if (decimal >= 0.75) {
            // 0.75+ = another full star (round up visually)
            emptyStars -= 1;
        } else if (decimal >= 0.25) {
            // 0.25-0.74 = half star
            partialStar = '<span class="star"><i class="fas fa-star-half-alt"></i></span>';
            emptyStars -= 1;
        }

        let html = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star"><i class="fas fa-star"></i></span>';
        }

        // Partial star
        if (partialStar) {
            html += partialStar;
        } else if (decimal >= 0.75) {
            html += '<span class="star"><i class="fas fa-star"></i></span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star"><i class="far fa-star"></i></span>';
        }

        return html;
    }

    // ─── UI Update ────────────────────────────────────────────
    function updateUI(data, animate) {
        const skeleton = document.getElementById('ratingSkeleton');
        const stars = document.getElementById('ratingStars');
        const text = document.getElementById('ratingText');
        const count = document.getElementById('ratingCount');
        const reviewCount = document.getElementById('reviewCount');
        const updated = document.getElementById('ratingUpdated');

        if (!stars || !text) {
            console.error('Google review DOM elements not found');
            return false;
        }

        // Hide skeleton
        if (skeleton) skeleton.style.display = 'none';
        
        // Show and populate stars
        stars.innerHTML = generateStars(data.rating);
        stars.style.display = 'flex';
        
        // Animate stars
        if (animate) {
            const starEls = stars.querySelectorAll('.star');
            starEls.forEach(function(star, i) {
                star.style.animationDelay = (i * 0.08) + 's';
                star.classList.add('pop-in');
            });
        }
        
        // Update text
        text.textContent = data.rating.toFixed(1) + ' out of 5';
        text.style.display = 'block';
        
        if (count) count.style.display = 'block';
        if (reviewCount) reviewCount.textContent = data.count.toLocaleString();
        
        // Update timestamp
        if (updated) {
            const daysAgo = Math.floor((Date.now() - data.timestamp) / (24 * 60 * 60 * 1000));
            
            if (daysAgo === 0) {
                updated.textContent = 'Updated today';
            } else if (daysAgo === 1) {
                updated.textContent = 'Updated yesterday';
            } else {
                updated.textContent = 'Updated ' + daysAgo + ' days ago';
            }
            
            if (data.isStale) {
                updated.innerHTML += ' <span style="color:#fbbc05;font-size:0.75em;">(may be outdated)</span>';
            }
        }

        return true;
    }

    // ─── Initialize ────────────────────────────────────────────
    function init() {
        console.log('[Google Reviews] Initializing...');
        
        const stored = getStoredData();
        
        if (stored) {
            console.log('[Google Reviews] Found stored data:', stored.rating + '/5, ' + stored.count + ' reviews');
            updateUI(stored, true);
        } else {
            console.log('[Google Reviews] No stored data, using defaults');
            const defaults = storeData(CONFIG.defaultRating, CONFIG.defaultCount);
            if (defaults) {
                updateUI(defaults, true);
            }
        }
    }

    // ─── Public API: Update Reviews ───────────────────────────
    window.updateGoogleReviews = function(rating, count) {
        // Validate inputs
        if (typeof rating !== 'number' || isNaN(rating)) {
            console.log('❌ First argument must be a number (rating, e.g., 4.9)');
            console.log('   Usage: updateGoogleReviews(5, 3)');
            return;
        }
        
        if (typeof count !== 'number' || isNaN(count) || count < 0) {
            console.log('❌ Second argument must be a positive number (review count, e.g., 135)');
            console.log('   Usage: updateGoogleReviews(5, 3)');
            return;
        }
        
        if (rating < 0 || rating > 5) {
            console.log('❌ Rating must be between 0 and 5');
            return;
        }
        
        const data = storeData(rating, count);
        if (!data) {
            console.log('❌ Failed to store data');
            return;
        }
        
        const success = updateUI(data, true);
        
        if (success) {
            console.log('✅ Google reviews updated!');
            console.log('   Rating: ' + data.rating.toFixed(1) + ' / 5.0');
            console.log('   Reviews: ' + data.count.toLocaleString());
            console.log('   Stored in browser for 30+ days');
        }
    };

    // ─── Public API: Check Current Data ───────────────────────
    window.checkGoogleReviews = function() {
        const stored = getStoredData();
        
        if (!stored) {
            console.log('ℹ️  No data stored yet.');
            console.log('   Defaults: ' + CONFIG.defaultRating + ' / 5.0 (' + CONFIG.defaultCount + ' reviews)');
            return;
        }
        
        console.log('📊 Current stored reviews:');
        console.log('   Rating: ' + stored.rating.toFixed(1) + ' / 5.0');
        console.log('   Reviews: ' + stored.count.toLocaleString());
        console.log('   Stored: ' + stored.daysOld + ' days ago');
        console.log('   Status: ' + (stored.isStale ? '⚠️ Stale — update recommended' : '✅ Fresh'));
    };

    // ─── Public API: Reset to Defaults ────────────────────────
    window.resetGoogleReviews = function() {
        localStorage.removeItem('cfs_google_reviews');
        console.log('🗑️  Cleared from storage. Refresh page to reload defaults.');
    };

    // ─── Run ───────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();