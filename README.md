<div align="center">

# ✦ HALITE START ✦
### *The Ultra-Fast, Glassmorphic & Modular New Tab Dashboard for Power Users*

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](https://github.com/)

<br />

**Halite Start** turns your browser's default blank tab into a breathtaking, customizable productivity cockpit. Built with a component-driven architecture, ultra-smooth `@dnd-kit` drag-and-drop mechanics, rich glassmorphic aesthetics, and local-first privacy.

[**Explore Features**](#-key-features) • [**Quick Start**](#-quick-start) • [**Tech Stack**](#-tech-stack) • [**Keyboard Shortcuts**](#-keyboard-shortcuts) • [**Deploy**](#-one-click-deployment)

</div>

---

## 🌟 Why Halite?

Traditional new tab extensions are slow, bloated, and track your data. **Halite Start** is engineered for speed, privacy, and aesthetic bliss:

* ⚡ **Blazing Fast**: Modular component architecture with isolated widget ticking — zero unnecessary tree re-renders.
* 🔒 **100% Privacy & Local-First**: Your bookmarks, notes, water tracker, and background images stay strictly on your device via `localStorage` and `IndexedDB`.
* 🎨 **Curated Aesthetics**: Frosted glassmorphism, dynamic backdrop blurs, animated gradient presets, and custom wallpaper filters.
* 🧩 **Modular Drag & Drop**: Freely drag, arrange, and reorder app cards, widgets, and entire dashboard sections.
* 🔍 **Smart Search with Bangs**: Instant debounced query autocomplete, direct YouTube search mode, and quick actions.

---

## ✨ Key Features

### 🖥️ 1. Dynamic Dashboard & Group Reordering
* **Reorderable Groups**: Effortlessly reorder the 🕒 **Clock Group**, 📱 **App Cards Group**, and 🧩 **Widgets Group** directly from Settings.
* **Hero Clock Group**: Customizable digital clock with elegant fonts (Playfair, Bebas Neue, Space Grotesk, Poppins, Outfit), sizing presets, and glowing glass gradients.
* **App Folders ("Halite Multi-Launch")**: Group 2–4 websites into a single folder card that opens all associated tabs simultaneously with one click.
* **Bookmarks Bar**: 6 interchangeable viewing layouts — *Cards*, *Chips*, *List*, *Minimal*, *Compact*, and *Modern*.

### 🧩 2. Interactive Widget Ecosystem
Halite comes pre-packaged with 11 responsive, self-contained widgets:

| Widget | Description |
| :--- | :--- |
| 🕒 **Digital Clock** | Live time with self-contained interval rendering |
| 🌤️ **Live Weather** | Auto-detected local temperature, conditions & detailed forecast dropdown |
| 📅 **Calendar** | Current day, month, date, and visual calendar preview |
| 🕰️ **Analog Clock** | Classic watch-face clock with ticking second/minute hands |
| 💧 **Water Tracker** | Daily hydration counter with persistent goal tracking |
| 📝 **Quick Notes** | In-place scratchpad for jotting thoughts and tasks |
| 🖼️ **Photo Frame** | Showcase your favorite pictures stored securely in IndexedDB |
| 🌀 **Fidget Spinner** | Physics-driven interactive spinner with pointer drag & inertia |
| 🍅 **Pomodoro Timer** | 25-minute productivity timer with an active progress indicator |
| 📊 **Top Apps** | Instant access to your top 4 most visited dashboard apps |
| 🔲 **Spacer** | Modular grid placeholder for layout customization |

### 🎨 3. State-of-the-Art Visual Customization
* **Glassmorphic & Normal Modes**: Switch between ultra-modern frosted glass with backdrop blur or clean flat minimalism.
* **Animated Gradient Themes**: Select from vibrant animated themes including *Ocean*, *Sunset*, *Aurora*, and *Midnight*.
* **Custom Wallpaper Engine**: Upload high-res backgrounds stored locally in IndexedDB with real-time blur and contrast sliders.
* **Hover Micro-Animations**: 9 distinct card hover effects (`scale`, `tilt`, `skew`, `spin`, `bounce`, `pulse`, `float`, `slide`, `glow`).
* **Icon & Card Styling**: Modify border radiuses (rounded, squircle, full), toggle borders, set custom card dimensions, and adjust inner shadow depth.

### 🛡️ 4. API Rate Limiting & TTL Memory Cache
Halite's backend API routes are engineered with built-in sliding-window rate limiters and memory TTL caches for peak resilience:
* **`/api/fetch-title`**: 40 req/min limit with a 24-hour title cache.
* **`/api/suggest`**: 120 req/min limit with 1-hour query suggestion cache.
* **`/api/favicon`**: 60 req/min limit with 24-hour domain favicon cache.

---

## ⌨️ Power-User Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Command Palette |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Toggle YouTube Search Mode |
| <kbd>Shift</kbd> + <kbd>Click</kbd> (on App Card) | Open link in a new background tab |
| <kbd>Right Click</kbd> (on App Card) | Open contextual menu (Edit App / Open New Tab) |
| <kbd>Esc</kbd> | Close any open modal, sidebar, or dropdown |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: `18.18.0` or later
* **Package Manager**: `npm`, `pnpm`, `yarn`, or `bun`

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Halite-start.git

# 2. Navigate to project directory
cd Halite-start

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view your dashboard.

---

## 🏗️ Tech Stack

* **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
* **UI & Rendering**: [React 19](https://react.dev/)
* **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Drag and Drop**: [@dnd-kit/core](https://dndkit.com/) & [@dnd-kit/sortable](https://dndkit.com/)
* **Local Persistence**: `IndexedDB` (Images/Blobs) + `localStorage` (Settings/State)
* **Icons & Assets**: Google S2 Favicon API + Custom SVG Icons

---

## 🚢 One-Click Deployment

Deploy your own personal Halite dashboard instance to Vercel in seconds:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/Halite-start)

Or build manually for production:

```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```
Halite-start/
├── app/
│   ├── api/
│   │   ├── favicon/route.ts       # Domain favicon resolution
│   │   ├── fetch-title/route.ts   # Website metadata scraper
│   │   └── suggest/route.ts       # Autocomplete search suggestions
│   ├── components/
│   │   ├── dashboard/             # AppGrid, BigClock, TopHeader, SearchBar, BookmarksBar
│   │   ├── widgets/               # Clock, Weather, Calendar, Pomodoro, Notes, etc.
│   │   ├── modals/                # QuickAdd, EditApp, HaliteFolder, ContextMenu
│   │   ├── LeftSidebar.tsx        # Settings & personalization sidebar
│   │   ├── RightSidebar.tsx       # Quick bookmarks drawer
│   │   ├── CommandPalette.tsx     # Spotlight-style command bar (Cmd+K)
│   │   ├── UsageStatistics.tsx    # Click tracking & time analytics
│   │   └── UpdateNotification.tsx # Top-center version pill & changelog
│   ├── lib/
│   │   ├── rateLimit.ts           # Token-bucket rate limiting & TTL cache
│   │   ├── updates.ts             # Version changelog definitions
│   │   ├── idb.ts                 # IndexedDB blob management
│   │   └── favicon.ts             # Favicon helpers
│   ├── globals.css                # Glassmorphism & custom utility styles
│   └── page.tsx                   # Declarative root orchestrator
└── public/                        # Static assets and icons
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create:

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Made with 💙 and Next.js by the Halite Team.

⭐ **If you like Halite Start, give it a star on GitHub!** ⭐

</div>
