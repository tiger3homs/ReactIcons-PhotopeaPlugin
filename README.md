# IconForge — Photopea Icon Plugin

Shape your design, one icon at a time. IconForge is a production-ready React web app that functions as a Photopea plugin, allowing you to browse, search, and inject SVG icons directly into your Photopea projects.

## Features

- **10,000+ Icons**: Includes Font Awesome 6, Material Design, Ant Design, BoxIcons, HeroIcons, and Lucide.
- **Virtualized Grid**: Smooth scrolling even with thousands of icons using `react-window`.
- **Live Preview**: Adjust size and color with real-time updates.
- **Photopea Integration**: One-click insertion into Photopea via the `postMessage` API.
- **Favorites**: Save your most-used icons locally.
- **Dark/Light Mode**: Persists to your browser.
- **Keyboard Shortcuts**: Power-user friendly navigation.

## Tech Stack

- **React + Vite**
- **Tailwind CSS v4**
- **Framer Motion**
- **React Icons**
- **React Window** (Virtualization)

## Photopea Setup Instructions

To use IconForge as a plugin in Photopea:

1.  Open [Photopea](https://www.photopea.com).
2.  Go to **Window** > **Plugins**.
3.  Click on **Add Plugin** (or the "+" icon).
4.  Enter the URL of your deployed IconForge app:
    `https://ais-pre-r4rizp5r5z3lv64mfvfajy-36060060809.europe-west1.run.app`
5.  IconForge will now appear in your plugins list.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This app is ready to be deployed to **Netlify**, **Vercel**, or any static hosting provider.
Ensure the `dist` folder is served as the root.

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `Ctrl+K` | Focus search |
| `Esc` | Clear search / Close preview |
| `Enter` | Insert selected icon into Photopea |
| `F` | Toggle favorite on selected icon |
| `Arrow keys` | Navigate grid |

---

Built with ❤️ for designers.
