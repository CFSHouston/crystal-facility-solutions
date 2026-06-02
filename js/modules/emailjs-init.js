/* ============================================
   EMAILJS INITIALIZATION
   Crystal Facility Solutions
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK failed to load.');
        return;
    }

    emailjs.init({
        publicKey: "WdC_iLm3gS_5aSWQz",
        blockHeadless: true,
        limitRate: {
            id: "cfs-website",
            throttle: 30000
        }
    });
});