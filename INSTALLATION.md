# Installation Guide

Complete setup guide for Car Sound Changer - Vue 3 + Vite + TypeScript web app.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`
   - npm comes bundled with Node.js

2. **Git** (optional, for version control)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

3. **Code Editor** (recommended)
   - [VS Code](https://code.visualstudio.com/) - Recommended
   - [WebStorm](https://www.jetbrains.com/webstorm/)
   - Or any text editor

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with GPS support

## Project Setup

### 1. Navigate to Project

```bash
cd c:\Users\disha\Documents\CODES\studio\carSOUNDMOD
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list
```

This will install:
- Vue 3 (UI framework)
- Vite (build tool)
- TypeScript (type safety)
- Testing libraries (Vitest, Vue Test Utils)
- Linting tools (ESLint, Prettier)
- And more...

## Development Setup

### 1. Start Development Server

```bash
# Start Vite dev server on http://localhost:5173
npm run dev

# With custom port
npm run dev -- --port 3000
```

The browser will automatically reload when you save files.

### 2. Access the App

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Car Sound Changer app homepage.

### 3. Enable GPS (Required for Testing)

For the app to work properly, you need to enable location access:

#### On Desktop
- Google Chrome: 
  1. Right-click page → Inspect
  2. Sensors tab → Location
  3. Set custom location (e.g., New Delhi: 28.6139, 77.2090)

- Firefox:
  1. Type `about:config`
  2. Search for `geo.enabled`
  3. Set to `true`

#### On Mobile
- Grant location permission when prompted
- Ensure device has GPS enabled

## Build & Production

### Build for Production

```bash
# Create optimized production build
npm run build

# Output goes to dist/ folder
```

### Preview Production Build

```bash
# Test production build locally
npm run preview

# Open http://localhost:4173 in browser
```

### Deploy to Production

Choose one of these deployment options:

#### Option 1: Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: GitHub Pages
```bash
# Add to vite.config.ts
export default {
  base: '/carSOUNDMOD/'
}

# Build
npm run build

# Push dist/ to gh-pages branch
```

#### Option 4: Traditional Web Server
```bash
# Build
npm run build

# Upload dist/ folder to your web server
# Configure web server to serve index.html for all routes
```

## Development Commands

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code with Prettier
npm run format

# Check TypeScript
npm run type-check
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- RPMGauge.test.ts

# Run E2E tests (if configured)
npm run test:e2e
```

### Other Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# View Vite configuration
npm run config

# Generate types
npm run type-check
```

## Keyboard Testing Controls (Development Mode)

When running in development, you can test without GPS:

```
Arrow Up    → Increase speed
Arrow Down  → Decrease speed
1-5         → Change gear (1-5)
Space       → Accelerate (boost)
M           → Mute/Unmute audio
Escape      → Reset/Stop
```

These work only when the app has focus.

## Troubleshooting

### Common Issues

#### 1. Port 5173 Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

#### 2. GPS Not Working
- Ensure you granted location permission
- Check browser location settings
- On desktop, use DevTools to set location
- On mobile, enable GPS in device settings

#### 3. Audio Not Playing
- Check browser audio permissions
- Ensure volume is not muted
- Try different browser
- Check browser's Web Audio API support

#### 4. Build Fails
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 5. TypeScript Errors
```bash
# Check TypeScript
npm run type-check

# Regenerate types
npm run type-check -- --force
```

#### 6. Dependencies Conflict
```bash
# Update dependencies
npm update

# Or install specific version
npm install vue@latest vite@latest
```

### View Detailed Error Logs

```bash
# Verbose npm output
npm run dev -- --debug

# Or
npm --verbose run build
```

## Project Structure for Development

```
carSOUNDMOD/
├── src/
│   ├── domain/              # Business logic (no Vue code)
│   ├── application/         # Services and composables
│   ├── infrastructure/      # API adapters (Audio, GPS, etc.)
│   ├── presentation/        # Vue components
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point
│
├── public/                  # Static files
│   └── sounds/             # Audio files
│
├── __tests__/              # Test files
├── dist/                   # Production build (created by npm run build)
├── node_modules/           # Dependencies (created by npm install)
├── package.json            # Project metadata
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── index.html              # HTML template
```

## IDE Setup

### VS Code (Recommended)

1. **Install Extensions**:
   - Volar (Vue official extension)
   - TypeScript Vue Plugin
   - ESLint
   - Prettier
   - REST Client

2. **VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### WebStorm

1. Open project
2. WebStorm automatically detects Vue 3
3. Enable TypeScript strict mode
4. Install Vue.js plugin

## Performance Testing

### Measure App Performance

```bash
# Start dev server
npm run dev

# Open DevTools (F12)
# Go to Performance tab
# Record and reload page
# Analyze results
```

### Browser Compatibility Testing

Test on different browsers:
- Chrome DevTools (Ctrl+Shift+J)
- Firefox DevTools (F12)
- Safari DevTools (Cmd+Option+I)
- Mobile browsers

## Database & Storage (Optional)

The app uses browser storage:

```typescript
// LocalStorage (for settings)
localStorage.setItem('volume', '0.8');
const volume = localStorage.getItem('volume');

// IndexedDB (for sound files - optional)
const db = new IDBDatabase();
```

No server/database required by default.

## Environment Configuration

Create `.env` file for environment variables:

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_AUDIO_BUFFER_SIZE=2048
VITE_GPS_UPDATE_INTERVAL=100
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## SSL/HTTPS (for Geolocation on Web)

Geolocation API requires HTTPS (except localhost). For production:

```bash
# Deploy to Netlify/Vercel (automatic HTTPS)
# Or use self-signed certificate locally:

# Generate certificate
openssl req -x509 -newkey rsa:4096 -out cert.pem -keyout key.pem -days 365 -nodes

# Update vite.config.ts
export default {
  server: {
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    }
  }
}
```

## First Run Checklist

- [ ] Node.js v18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Browser opens to http://localhost:5173
- [ ] GPS permission granted
- [ ] Can see RPM gauge (test with keyboard controls)
- [ ] Audio plays (if speakers connected)
- [ ] No console errors (F12)

## Next Steps

After setup:

1. **Read Architecture**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. **Learn Code Division**: [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md)
3. **Understand Gear Logic**: [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md)
4. **Start Development**: See [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md)
5. **Run Tests**: `npm run test`
6. **Build Project**: `npm run build`

## Help & Support

- 📖 Read [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- ❓ Check [FAQ.md](./docs/FAQ.md)
- 🐛 Report issues on GitHub
- 💬 Join discussions

---

**Happy coding!** 🚗🔊

