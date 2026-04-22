# BippyDNS

BippyDNS is a modern web application for managing and visualizing DNS collections with a playful, interactive UI. It features a Node.js/Express backend, a vanilla JS frontend, and dynamic screenshot generation using Puppeteer.

## Features
- View and manage DNS collections
- Animated, responsive card UI with Shadow DOM encapsulation
- Dynamic screenshots of subdomains using Puppeteer
- RESTful API endpoints for collections and screenshots
- Admin and private routes with API key protection
- Modern CSS animations and responsive design

## Project Structure
```
bippydns/
├── src/
│   ├── db.js
│   ├── index.js              # Express server entry
│   ├── middleware/
│   ├── routes/
│   │   ├── admin.js
│   │   ├── private.js
│   │   ├── public.js
│   │   └── front/
│   │       ├── index.html
│   │       └── scripts/
│   │           ├── api.js
│   │           ├── app.js
│   │           ├── router.js
│   │           └── components/
│   │               └── card/
│   │                   ├── card.js
│   │                   └── card.css
│   │           └── views/
│   │               └── collections.js
│   │       └── style/
│   │           ├── global.css
│   │           └── collections.css
│   ├── screenshot.js         # Puppeteer screenshot logic
│   └── screenshots/          # Saved screenshots
├── package.json
└── README.md
```

## Setup & Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   node src/index.js
   ```
3. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints
- `GET /get-collections` — List all DNS collections
- `GET /api/screenshot/:subdomain` — Get or generate a screenshot for a subdomain
- `GET /screenshots/:file` — Serve screenshot images
- `POST /post-sign-up` — Create account and send activation email
- `POST /activate-account` — Activate account using email token
- `POST /post-sign-in` — Sign in verified users and start session
- `POST /resend-activation` — Regenerate verify token and resend activation email (rate-limited)
- `POST /sign-out` — Sign out and destroy session
- `GET /auth/session` — Check session auth status

## Security middleware
- CORS enabled for `https://bippydns.com` and `http://localhost:3000` (default, configurable via env)
- Rate limits applied to auth routes and `/api`

## Development Notes
- Uses Shadow DOM for true component style encapsulation
- All CSS is modular and responsive
- Admin and private routes require API keys (see `.env`)
- Screenshots are auto-named with date for cache-busting

## License
MIT
