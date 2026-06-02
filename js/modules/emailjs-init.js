/* ============================================
   EMAILJS INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK failed to load.');
        return;
    }

    emailjs.init({
        publicKey: "WdC_iLm3gS_5aSWQz",

        // Reduce simple automated abuse
        blockHeadless: true,

        // Allow one submission attempt every 10 seconds
        limitRate: {
            id: "cfs-contact-form",
            throttle: 10000
        }
    });
});