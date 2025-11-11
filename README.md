# Halite Start - Customizable Dashboard

A beautiful, customizable start page and dashboard built with Next.js, React, and Tailwind CSS. Transform your browser's new tab into a personalized productivity hub with widgets, app shortcuts, bookmarks, and stunning visual effects.

## ✨ Features

### 🎯 Core Functionality
- **App Cards**: Add, remove, and organize your favorite websites as quick-access cards
- **Drag & Drop**: Reorder apps and widgets with smooth drag-and-drop functionality
- **Bookmarks**: Manage bookmarks with multiple display styles (cards, chips, list, minimal, compact, modern)
- **Search Bar**: Quick search functionality with suggestions
- **Context Menu**: Right-click app cards to open links in new tabs
- **Personalization**: Customize your greeting with a personalized name

### 🎨 Visual Effects
- **Normal Mode**: Clean, standard appearance
- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Liquid Glass**: Apple-inspired liquid glass effect with customizable reflection colors
- **Dark/Light Mode**: Toggle between themes
- **Custom Backgrounds**: Upload your own background images (stored in IndexedDB)
- **Animations**: 9 different hover animation styles (scale, tilt, skew, spin, bounce, pulse, float, slide, glow)

### 📱 Widgets
Choose from 14 different widgets to enhance your dashboard:

1. **Clock** - Digital clock widget
2. **Weather** - Weather information display
3. **Calendar** - Calendar widget
4. **Analog Clock** - Classic analog clock
5. **Water Tracker** - Track your daily water intake
6. **Quick Notes** - Take quick notes on the fly
7. **Spacer** - Add spacing between widgets
8. **Photo** - Display your photos
9. **Fidget Spinner** - Interactive fidget spinner
10. **Mood Tracker** - Track your daily mood
11. **Pomodoro Timer** - Productivity timer
12. **Random Quote** - Inspirational quotes
13. **Dice Roller** - Random dice roll
14. **Coin Flip** - Flip a coin

### 🎛️ Customization Options
- **Icon Styles**: Full rounded, square rounded, or default icons
- **App Titles**: Show/hide app titles with customizable colors
- **Layout**: Center apps and widgets, adjust margins
- **Typography**: Customize text colors for apps and widgets
- **Animations**: Enable/disable animations for icons and widgets
- **Auto-fill Icons**: Automatic icon detection for supported sites (e.g., YouTube)
- **Bookmark Styles**: Choose from 6 different bookmark display styles
- **Floating Notes**: Add draggable floating notes to your dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Halite-start
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **React**: React 19
- **Styling**: Tailwind CSS 4
- **TypeScript**: Type-safe development
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) for smooth drag-and-drop
- **Storage**: IndexedDB for background images, localStorage for app state
- **Analytics**: Vercel Analytics

## 📖 Usage

### Adding Apps
1. Click the settings icon to open the sidebar
2. Navigate to the "Add App" section
3. Enter the app title and URL
4. Click "Add App" or press Enter

### Managing Widgets
1. Open the settings sidebar
2. Navigate to the "Widgets" section
3. Click on any widget to add it to your dashboard
4. Drag widgets to reorder them
5. Click the edit button to enter edit mode and remove widgets

### Customizing Appearance
1. Open the settings sidebar
2. Navigate to "Preferences" for layout options
3. Navigate to "Background" to upload custom backgrounds
4. Toggle visual effects (Normal, Glass, Liquid) in the Visual Effects section
5. Customize colors, animations, and display options

### Editing Mode
- Click the edit button to enter edit mode
- In edit mode, you can drag and drop apps/widgets to reorder them
- Click the × button on apps/widgets to remove them
- Click the edit button again to exit edit mode

### Context Menu
- Right-click on any app card to open a context menu
- Select "Open in new tab" to open the link in a new browser tab
- Press Escape or click outside to close the menu

## 🎨 Visual Effects

### Normal Mode
Clean and minimal design with standard shadows and borders.

### Glassmorphism
Frosted glass effect with:
- Backdrop blur
- Semi-transparent backgrounds
- Subtle borders
- Enhanced depth

### Liquid Glass
Apple-inspired liquid glass effect with:
- Dynamic reflections
- Customizable reflection colors
- Smooth animations
- Premium feel

## 💾 Data Storage

- **localStorage**: Stores app cards, widgets, bookmarks, and settings
- **IndexedDB**: Stores background images (up to 15MB)
- All data is stored locally in your browser

## 🔧 Configuration

### Environment Variables
No environment variables are required for basic functionality.

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 📝 Development

### Project Structure
```
app/
  ├── api/          # API routes
  ├── components/   # React components
  ├── lib/          # Utility functions
  ├── page.tsx      # Main page component
  └── globals.css   # Global styles
```

### Key Files
- `app/page.tsx`: Main dashboard component
- `app/components/LeftSidebar.tsx`: Settings sidebar component
- `app/lib/idb.ts`: IndexedDB utilities for image storage
- `app/api/suggest/route.ts`: Search suggestions API

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and deploy

### Deploy to Other Platforms

```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000` in production mode.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Drag and drop powered by [@dnd-kit](https://dndkit.com/)
- Icons and favicons provided by Google's favicon service

## 📞 Support

For issues, questions, or feature requests, please open an issue on the repository.

---

Made with ❤️ using Next.js and React
