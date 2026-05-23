# Crystal Facility Solutions Website

A modern, single-page website for Crystal Facility Solutions — a Houston-based facility management company providing commercial cleaning, school transportation, landscaping, and maintenance services since 2010.

---

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Modular architecture (15 CSS files), custom properties, animations
- **Vanilla JavaScript** — Modular ES6 pattern, no frameworks
- **EmailJS** — Contact form handling
- **GitHub Pages** — Hosting

---

## File Structure

```
├── index.html              # Main page
├── css/
│   ├── 1-variables.css     # CSS custom properties
│   ├── 2-reset.css         # Normalize & reset
│   ├── 3-utilities.css     # Helper classes
│   ├── 4-layout.css        # Grid, containers
│   ├── 5-navigation.css    # Nav + mobile menu
│   ├── 6-hero.css          # Hero section
│   ├── 7-services.css      # Service cards + drawers
│   ├── 8-about.css         # About, stats, timeline
│   ├── 9-core-values.css   # Value cards
│   ├── 10-testimonials.css # Reviews carousel
│   ├── 11-contact.css      # Contact form + methods
│   ├── 12-footer.css       # Footer
│   ├── 13-forms.css        # Form components
│   ├── 14-chat.css         # (disabled)
│   └── 15-responsive.css   # Media queries
├── js/
│   ├── modules/
│   │   ├── navigation.js
│   │   ├── hero.js
│   │   ├── services.js
│   │   ├── forms.js
│   │   ├── testimonials.js
│   │   ├── google-reviews.js
│   │   ├── footer.js
│   │   ├── values.js
│   │   ├── about.js
│   │   ├── contact.js
│   │   └── emailjs-init.js
│   └── main.js
├── images/
├── robots.txt
└── sitemap.xml
```

---

## Sections

| Section | Features |
|---------|----------|
| **Hero** | Crystal city background, typing animation, trust indicators |
| **Services** | 3D flip cards, filter tabs, detail drawers, quick quote |
| **About** | Story card, animated stats, expandable details, timeline |
| **Core Values** | Expandable value cards with icons |
| **Testimonials** | 3D carousel, Google review CTA |
| **Contact** | Glassmorphism form, live status, contact methods |
| **Footer** | Navigation, services, social links |

---

## Key Features

- **Responsive** — Mobile-first, breakpoints at 768px / 480px
- **Accessible** — ARIA labels, skip links, keyboard navigation, reduced motion support
- **SEO** — JSON-LD schema, Open Graph, canonical URLs, sitemap
- **Performance** — Preloaded critical CSS, lazy images, deferred scripts
- **CSP Compliant** — Content Security Policy headers

---

## Setup

1. Clone the repo
2. Open `index.html` in a browser, or serve via local server:
   ```bash
   python -m http.server 8000
   ```
3. Deploy to GitHub Pages:
   - Push to `main` branch
   - Enable Pages in repo settings

---

## Notes

- `thank-you.html` removed — not currently used
- Chat widget disabled (commented out in HTML/JS/CSS)
- Video background replaced with static hero image
- All image paths use `./images/` prefix for GitHub Pages compatibility
