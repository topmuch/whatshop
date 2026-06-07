---
Task ID: 3
Agent: Landing Page + Auth Agent
Task: Build landing page and authentication components

Work Log:
- Created /src/components/landing.tsx with hero, features, pricing, testimonials
- Created /src/components/auth/auth-login.tsx with login form
- Created /src/components/auth/auth-register.tsx with registration form
- Created stub files for SellerDashboard and PublicShop (other agents' tasks) to prevent import errors

Stage Summary:
- Landing page with 6 sections (hero, features, how it works, pricing, testimonials, CTA)
- Mobile-first responsive design with WhatsApp green theme
- Sticky header with mobile hamburger menu (Sheet component)
- Hero with CSS phone mockup showing mini shop preview
- 6 feature cards in responsive grid with hover effects
- 3-step "How it works" section with numbered steps
- 3 pricing cards (Gratuit, Standard, Premium) with popular badge
- Testimonial section with social proof
- CTA section with gradient primary background
- Sticky footer with mt-auto
- Auth forms with validation, password toggle, loading states
- Login form: email + password, forgot password toast, redirect to register
- Register form: name, email, password, confirm, shop name, WhatsApp number
- Framer Motion animations (fadeIn, fadeInUp, stagger)
- All text in French, no blue/indigo colors
- ESLint passes with zero errors
- Dev server serving 200 responses successfully
