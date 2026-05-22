/* ============================================
   HERO VIDEO BACKGROUND - Cinematic Sequence
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        videos: [
            'videos/video.mp4',
            'videos/video4.mp4',
            'videos/video6.mp4',
            'videos/video8.mp4',
            'videos/video2.mp4',
            'videos/video3.mp4',
            'videos/video5.mp4',
            'videos/video7.mp4',
            'videos/video1.mp4'
        ],
        playbackRate: 1.0,        // Slow motion (30% speed)
        crossfadeDuration: 1000,  // 1.2s fade between videos
        minDisplayTime: 6000     // Minimum 10 seconds per video
    };

    let currentIndex = 0;
    let videoElement = null;
    let isTransitioning = false;
    let videoStartTime = 0;

    function init() {
        videoElement = document.getElementById('heroVideo');
        if (!videoElement) {
            console.warn('[Hero Video] Video element not found');
            return;
        }

        videoElement.addEventListener('ended', onVideoEnded);
        videoElement.addEventListener('error', onVideoError);

        loadVideo(0);
    }

    function loadVideo(index) {
        if (isTransitioning || !videoElement) return;

        currentIndex = index;
        const videoPath = CONFIG.videos[index];

        if (videoElement.src && videoElement.src !== window.location.href) {
            isTransitioning = true;
            videoElement.style.opacity = '0';

            setTimeout(() => {
                setVideoSource(videoPath);
                videoElement.style.opacity = '1';
                isTransitioning = false;
            }, CONFIG.crossfadeDuration);
        } else {
            setVideoSource(videoPath);
        }
    }

    function setVideoSource(src) {
        videoElement.src = src;
        videoElement.load();
        videoElement.playbackRate = CONFIG.playbackRate;
        videoStartTime = Date.now();

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('[Hero Video] Autoplay blocked:', err);
            });
        }
    }

    function onVideoEnded() {
        const elapsed = Date.now() - videoStartTime;
        const remaining = CONFIG.minDisplayTime - elapsed;

        if (remaining > 0) {
            // Video ended too fast — loop it until min time reached
            videoElement.currentTime = 0;
            setTimeout(() => {
                videoElement.play();
            }, 100);
        } else {
            goToNextVideo();
        }
    }

    function goToNextVideo() {
        const nextIndex = (currentIndex + 1) % CONFIG.videos.length;
        loadVideo(nextIndex);
    }

    function onVideoError(e) {
        console.error('[Hero Video] Error loading:', CONFIG.videos[currentIndex]);
        goToNextVideo();
    }

    // Public API for debugging
    window.heroVideo = {
        next: () => goToNextVideo(),
        prev: () => loadVideo((currentIndex - 1 + CONFIG.videos.length) % CONFIG.videos.length),
        goTo: (index) => loadVideo(index % CONFIG.videos.length),
        getCurrent: () => ({ index: currentIndex, src: CONFIG.videos[currentIndex] }),
        setSpeed: (rate) => { CONFIG.playbackRate = rate; videoElement.playbackRate = rate; }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();