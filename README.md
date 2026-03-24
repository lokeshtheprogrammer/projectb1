<div align="center">

<img src="https://img.shields.io/badge/RedNova-FF6B35?style=for-the-badge&logoColor=white" alt="RedNova" height="40"/>

# RedNova — Agency Website

**Premium websites & apps for restaurants and local businesses**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![EmailJS](https://img.shields.io/badge/EmailJS-FF6B35?style=flat-square&logoColor=white)](https://www.emailjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 Live Demo](https://rednova.in) · [🐛 Report Bug](https://github.com/yourusername/rednova-website/issues) · [✨ Request Feature](https://github.com/yourusername/rednova-website/issues)

</div>

---

## 📸 Preview

| Desktop | Mobile |
|---|---|
| ![Desktop Preview](assets/img/preview-desktop.png) | ![Mobile Preview](assets/img/preview-mobile.png) |

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [EmailJS Setup](#-emailjs-setup)
- [Sections](#-sections)
- [Performance](#-performance)
- [Accessibility](#-accessibility)
- [Customisation](#-customisation)
- [License](#-license)

---

## 🚀 About

RedNova is a **single-page agency website** built for a digital agency specialising in premium websites and apps for restaurants and local businesses. It is a fully static, zero-dependency frontend — no build step, no framework — just hand-crafted HTML, CSS, and vanilla JavaScript.

The site targets **restaurant owners and local business operators** and is optimised for the Indian market with INR pricing and WhatsApp as a primary contact channel.

---

## ✨ Features

### 🎨 Design & UX
- **Dark luxury theme** with glassmorphism cards and radial gradient backgrounds
- **Supernova loading screen** — cinematic circular progress ring with animated star field
- **Custom cursor** with smooth follower animation (desktop only)
- **Typing text effect** in the hero — cycles through 4 brand phrases
- **Scroll-triggered entrance animations** — `reveal-up`, `reveal-left`, `reveal-right` with stagger delays
- **Animated stat counters** that count up when scrolled into view
- **Parallax section glows** on desktop (halved speed for subtlety)
- **Back-to-top button** that appears after 500px of scroll

### 📱 Mobile
- **Right-side drawer navigation** with numbered links, staggered entrance, and orange accent bars
- **Close on outside click**, close button, Escape key, or nav link tap
- **WhatsApp CTA button** in hero and mobile menu
- **Responsive hero buttons** — wraps to two rows on small screens, stacks on < 375px
- **CSS gradient mesh background** on mobile (no Three.js, high performance)
- **`safe-area-inset-top`** support for notched iPhones

### 🖥️ Desktop
- **Three.js interactive 3D scene** in the hero — particle field, icosahedron core, torus knot wireframe shell, and dual halo rings
- **Three.js abstract orb** in the About section
- **3D card tilt** on service and portfolio cards (mouse-tracking)
- **Swipeable testimonial carousel** with drag, touch-swipe, auto-play, and dot navigation

### ⚡ Performance
- `requestAnimationFrame`-throttled scroll and resize listeners
- Lazy-loaded portfolio images with `onerror` fallback to CSS initials
- `will-change` only on animated elements
- `devicePixelRatio` capped at `2×` for WebGL renderer
- `prefers-reduced-motion` respected — Three.js and all animations disabled

### ♿ Accessibility
- Skip-to-content link for keyboard users
- `aria-live` regions for loader and form feedback
- `role="progressbar"` with `aria-valuenow` on loader
- `role="dialog"` + `aria-modal` on mobile menu
- `:focus-visible` styles for keyboard navigation
- All images have descriptive `alt` text

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom properties, glassmorphism, CSS Grid, Flexbox |
| Scripting | Vanilla JavaScript (ES Modules) |
| 3D Graphics | [Three.js r160](https://threejs.org/) via CDN |
| Contact Form | [EmailJS Browser SDK v4](https://www.emailjs.com/) |
| Fonts | Google Fonts — **Poppins** (headings) + **Inter** (body) |

> No bundler. No framework. No `node_modules`. Open `index.html` and it works.

---

## 📁 Project Structure

```
rednova-website/
│
├── index.html          # Single-page HTML — all 7 sections
├── style.css           # Full stylesheet (~2,300 lines, mobile-first)
├── main.js             # All JavaScript — ES Module (~1,300 lines)
│
└── assets/
    └── img/
        ├── steakhouse.png      # Portfolio: Ember & Oak
        ├── coffee_bar.png      # Portfolio: Bloom Coffee Bar
        ├── spice_market.png    # Portfolio: Saffron Spice Market
        ├── ramen_house.png     # Portfolio: Koji Ramen House
        ├── juice_bar.png       # Portfolio: The Green Press
        └── bakery.png          # Portfolio: Casa Dulce Bakery
```

---

## 🏁 Getting Started

### Prerequisites

None. This is a fully static site. All dependencies are loaded from CDN.

### Running locally

```bash
# Clone the repository
git clone https://github.com/yourusername/rednova-website.git

# Navigate into the project
cd rednova-website

# Open in browser — any of the following work:
open index.html                        # macOS
start index.html                       # Windows
xdg-open index.html                    # Linux

# Or use a local dev server (recommended to avoid CORS on ES Modules)
npx serve .
# or
python3 -m http.server 3000
# then visit http://localhost:3000
```

> **Note:** Because `main.js` uses ES Module syntax (`import * as THREE from '...'`), you must open the file through a local server — not directly as a `file://` URL — or the browser will block the module import.

---

## 📧 EmailJS Setup

The contact form uses EmailJS to send emails without a backend. Setup takes about 3 minutes:

1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Add an **Email Service** (Gmail, Outlook, etc.) → copy the **Service ID**
3. Create an **Email Template** → copy the **Template ID**

   Use these variables in your template:
   ```
   {{from_name}}    — sender's name
   {{from_email}}   — sender's email
   {{business}}     — business name
   {{phone}}        — phone number (optional)
   {{service}}      — selected service
   {{message}}      — project message
   {{reply_to}}     — reply-to address
   ```

4. Go to **Account → API Keys** → copy your **Public Key**

5. Open `main.js` and replace the three constants near the bottom (Section 12):

```js
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← replace
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← replace
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← replace
```

6. Also update the **WhatsApp number** in `index.html`:
```html
<!-- Replace 91XXXXXXXXXX with your country code + number -->
<a href="https://wa.me/91XXXXXXXXXX" ...>
```

---

## 📄 Sections

| # | Section | Description |
|---|---|---|
| 1 | **Hero** | Typing headline, 3 CTAs, animated stat counters, Three.js 3D scene |
| 2 | **Services** | 6 service cards with 3D tilt, glow effects, and tag chips |
| 3 | **Portfolio** | Filterable grid (All / Restaurants / Cafés / Retail) with 6 case studies |
| 4 | **About** | Timeline (2019 → 2024), Three.js orb, floating stat badges |
| 5 | **Testimonials** | 5-card carousel — swipe, drag, auto-play, dot navigation |
| 6 | **Pricing** | 3-tier cards (Starter ₹1,500 / Growth ₹3,000 / Pro ₹4,500) |
| 7 | **Contact** | EmailJS form with floating labels, validation, and success/error states |

---

## ⚡ Performance

Targets and techniques used:

| Goal | Technique |
|---|---|
| Fast initial paint | No render-blocking JS, fonts use `display=swap` |
| Smooth 60fps scroll | All scroll handlers throttled with `requestAnimationFrame` |
| Mobile performance | Three.js skipped entirely on `window.innerWidth ≤ 768` |
| Reduced motion | All animations disabled when `prefers-reduced-motion: reduce` |
| Image resilience | `onerror` fallback to CSS initials when portfolio images are missing |
| WebGL safety | Full try/catch on renderer creation — falls back to CSS gradient mesh |
| Pixel density | `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` |

---

## ♿ Accessibility

| Feature | Implementation |
|---|---|
| Skip navigation | `.skip-to-content` link, visible on `:focus` |
| Keyboard nav | `:focus-visible` orange outline on all interactive elements |
| Screen readers | `aria-live`, `aria-atomic`, `aria-label`, `role` attributes throughout |
| Loading screen | `role="progressbar"` with live `aria-valuenow` updates |
| Mobile menu | `role="dialog"`, `aria-modal="true"`, Escape key closes |
| Reduced motion | `prefers-reduced-motion: reduce` collapses all animation durations |
| Touch targets | All buttons and links meet 44×44px minimum touch target size |

---

## 🎨 Customisation

### Changing brand colours

All colours are CSS custom properties in `:root` inside `style.css`:

```css
:root {
  --c-orange: #FF6B35;   /* primary brand */
  --c-amber:  #FFB347;   /* secondary */
  --c-gold:   #F7C948;   /* accent */
  --c-cyan:   #00F5FF;   /* highlight */
  --c-purple: #BF00FF;   /* accent 2 */
}
```

### Changing pricing

Edit the three pricing cards in the `#pricing` section of `index.html`. Prices are plain text — just update the `₹` values.

### Adding portfolio projects

Duplicate a `.portfolio-card` div in `index.html`, update the `data-category` attribute, replace the image path, and update the name/description text.

### Changing typing phrases

In `index.html`, find the `data-phrases` attribute on the hero typing element:

```html
data-phrases="a Website That Sells.|More Direct Orders.|a Brand Guests Remember.|a Digital Presence That Converts."
```

Each phrase is separated by a `|` pipe character.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for restaurant owners everywhere.

**[⬆ Back to top](#rednova--agency-website)**

</div>
