# Kampung Pantry

**Share What You Can, Take What You Need.**

Kampung Pantry is a mobile-first, accessible Progressive Web Application (PWA) built to support physical community refrigerators and dry pantries across HDB estates in Singapore.

## Key Capabilities

- **Home Dashboard**: Displays live available item counts, *Today's Fresh Finds*, items expiring within 48 hours, and community food-rescue impact metrics.
- **Food Donation System**: Guided minimal-typing donation flow supporting strictly approved halal-friendly food categories (`Vegetables`, `Fruits`, `Dried Goods`, `Bakery & Bread`, `Dairy & Eggs`, `Condiments & Spices`), optional photo upload, allergen declarations, and automatic generation of a scannable **QR Code** + readable Donation ID (`KP-XXXX`) with placement instructions.
- **Live Food Inventory & QR / Manual Collection**: Searchable and filterable inventory that automatically excludes expired food. Supports both camera/code **QR scanning** and a **Manual Collection** flow designed for elderly residents without smartphones, with server-side duplicate and over-collection prevention.
- **Smart Waste-Saving Recipes**: Recommends practical local recipes ranked by ingredients currently in the fridge, prioritising items approaching their use-by dates.
- **SMS Daily Digest**: Formats a concise daily SMS-friendly summary and noticeboard printout for residents who prefer SMS or void-deck noticeboards over mobile apps.
- **Volunteer & Fridge Safety Dashboard**: Protected by `ADMIN_VOLUNTEER_PIN` for community volunteers to log 2°C–4°C fridge temperatures, sanitisation records, and remove expired or unsuitable items.
- **Accessibility & PWA**: Large Text (`A+`) mode, 44px+ touch targets, multi-language greetings (`EN`, `中文`, `Melayu`, `தமிழ்`), offline caching via Service Worker, and in-app install prompt.

## Setup & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (optional — defaults to demo volunteer PIN `2026`):
   ```bash
   cp .env.example .env
   ```
3. Start the full-stack development server (Express API + Vite on port 3000):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Data Persistence & Mock vs Live Notice

- Inventory, donation/collection activity, SMS opt-ins, and fridge temperature logs are persisted locally on the server in `data/pantry-db.json` and served over REST endpoints (`/api/*`).
- The **SMS Daily Digest** subscription stores opt-in preferences locally and generates ready-to-send SMS bulletins; connect an external SMS gateway (e.g., Twilio or Gov.sg Postman) on the server when deploying to a live town council estate.
- Automated QR scanning verifies item IDs against the live server inventory; physical food freshness and fridge temperature still require human volunteer inspection.
