# PWA Install Feature - Testing Guide

## Overview
The PWA (Progressive Web App) install feature has been successfully implemented in ExpenseAI. This allows users to install the application on their devices for a native app-like experience.

## What Was Implemented

### 1. Core Files Created
- **`public/manifest.json`** - PWA manifest with app metadata
- **`public/sw.js`** - Service worker for offline functionality
- **`public/icon-192.svg`** - App icon (192x192)
- **`public/icon-512.svg`** - App icon (512x512)
- **`lib/utils/pwa.ts`** - PWA utility functions
- **`hooks/usePWAInstall.tsx`** - Custom hook for install prompt management
- **`components/pwa/InstallButton.tsx`** - Install button component
- **`components/pwa/PWARegister.tsx`** - Service worker registration component
- **`components/pwa/index.ts`** - PWA components export

### 2. Modified Files
- **`app/layout.tsx`** - Added manifest link, PWA meta tags, and PWARegister component
- **`components/app-sidebar.tsx`** - Integrated InstallButton in sidebar
- **`next.config.ts`** - Updated CSP headers for manifest and service worker

## How It Works

1. **Service Worker Registration**: Automatically registers when the app loads
2. **Install Prompt Detection**: Listens for browser's `beforeinstallprompt` event
3. **Install Button Display**: Shows "Install App" button in sidebar when installable
4. **User Installation**: Clicking the button triggers the native install dialog
5. **Button Hiding**: Install button automatically hides after installation

## Testing Instructions

### Prerequisites
- The app must be served over **HTTPS** (or localhost for development)
- Use a browser that supports PWA (Chrome, Edge, Safari 16.4+)

### Local Development Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open in Chrome/Edge**:
   - Navigate to `http://localhost:3000`
   - Open DevTools (F12)
   - Go to "Application" tab
   - Check "Manifest" section - should show ExpenseAI manifest
   - Check "Service Workers" section - should show registered worker

3. **Test Install Prompt**:
   - Log in to the application
   - Navigate to `/dashboard`
   - Look for "Install App" button in the sidebar
   - Click the button to trigger install dialog
   - Accept the installation
   - Verify the button disappears after installation

4. **Test Installed App**:
   - Find ExpenseAI in your applications
   - Launch it - should open in standalone mode (no browser UI)
   - Should open directly to `/dashboard`

### Production Testing

1. **Deploy to HTTPS**:
   ```bash
   npm run build
   npm start
   ```

2. **Test on Different Browsers**:

   **Chrome/Edge (Desktop)**:
   - Visit the site
   - Look for install button in sidebar
   - Or use browser's install icon in address bar
   - Verify standalone mode after installation

   **Chrome (Android)**:
   - Visit the site
   - Browser may show automatic install banner
   - Or use "Add to Home Screen" from menu
   - Verify app icon on home screen
   - Launch and verify standalone mode

   **Safari (iOS)**:
   - Visit the site
   - Tap Share button
   - Select "Add to Home Screen"
   - Verify app icon on home screen
   - Launch and verify standalone mode

   **Safari (macOS)**:
   - Visit the site
   - File > Add to Dock
   - Verify app in Dock
   - Launch and verify standalone mode

### Verification Checklist

- [ ] Service worker registers successfully (check DevTools)
- [ ] Manifest loads without errors (check DevTools)
- [ ] Icons display correctly in install dialog
- [ ] Install button appears in sidebar when installable
- [ ] Install button triggers native install dialog
- [ ] App installs successfully
- [ ] Install button hides after installation
- [ ] Installed app opens to `/dashboard`
- [ ] Installed app runs in standalone mode (no browser UI)
- [ ] App icon displays correctly on device
- [ ] Basic offline functionality works (cached pages load)

## Troubleshooting

### Install Button Not Showing

**Possible Causes**:
1. Not using HTTPS (except localhost)
2. Service worker not registered
3. Already installed
4. Browser doesn't support PWA

**Solutions**:
- Check browser console for errors
- Verify service worker in DevTools > Application
- Try in incognito/private mode
- Test in Chrome/Edge (best PWA support)

### Service Worker Not Registering

**Check**:
1. Console for registration errors
2. `public/sw.js` file exists
3. CSP headers allow `worker-src 'self'`
4. No syntax errors in service worker

### Manifest Not Loading

**Check**:
1. `public/manifest.json` file exists
2. Manifest link in `<head>` tag
3. CSP headers allow `manifest-src 'self'`
4. JSON syntax is valid

### Icons Not Displaying

**Check**:
1. SVG files exist in `public/` directory
2. Icon paths in manifest are correct
3. SVG syntax is valid
4. Icons are accessible via URL

## Browser Support

### Full Support
- ✅ Chrome 67+ (Desktop & Android)
- ✅ Edge 79+
- ✅ Samsung Internet 8.2+
- ✅ Opera 54+

### Partial Support
- ⚠️ Safari 16.4+ (iOS/macOS) - No `beforeinstallprompt`, manual "Add to Home Screen"
- ⚠️ Firefox - Limited PWA support

### No Support
- ❌ Internet Explorer
- ❌ Safari < 16.4

## Features

### Current Features
- ✅ Install prompt detection
- ✅ Custom install button in sidebar
- ✅ Service worker with basic caching
- ✅ Standalone mode (no browser UI)
- ✅ Custom app icons
- ✅ Opens to dashboard on launch

### Future Enhancements
- [ ] Advanced offline caching
- [ ] Background sync for transactions
- [ ] Push notifications for budgets
- [ ] App shortcuts (quick actions)
- [ ] Share target API (import receipts)

## Development Notes

### Icon Customization
The current icons use a simple lightbulb design. To customize:
1. Edit `public/icon-192.svg` and `public/icon-512.svg`
2. Keep the design centered for maskable icons
3. Use high contrast for visibility
4. Test on different device backgrounds

### Service Worker Updates
To update the service worker:
1. Modify `public/sw.js`
2. Change `CACHE_NAME` version (e.g., `expenseai-v2`)
3. Old caches will be automatically cleaned up

### Manifest Updates
To update app metadata:
1. Edit `public/manifest.json`
2. Changes take effect on next install
3. Existing installations may need reinstall to see changes

## Resources

- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Install Criteria](https://web.dev/install-criteria/)
- [Next.js PWA Guide](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
