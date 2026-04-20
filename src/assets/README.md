# Asset Files

## Logo Placement

**Location:** `website/src/assets/logo_ruangin.png`

**Specifications:**
- Format: PNG (recommended for transparency)
- Recommended size: 150-200px width
- Height: proportional to maintain aspect ratio
- Recommended resolution: 2x for retina displays

**How to add:**
1. Save your logo as `logo_ruangin.png` to this folder
2. The logo will automatically appear at the top-left of the login page
3. Recommended to use SVG or PNG with transparent background

---

## Wallpaper Placement

**Location:** `website/public/assets/auth/wallpaper_auth.jpg`

**Specifications:**
- Format: JPG/PNG
- Recommended resolution: 1920x1080 or higher
- Aspect ratio: 16:9 or landscape
- File size: < 1MB for optimal performance

---

## Current Setup

- ✅ Logo import in Login.jsx: `import logoImage from '../assets/logo_ruangin.png';`
- ✅ Wallpaper import in Login.jsx: `const wallpaperImage = '/assets/auth/wallpaper_auth.jpg';`

Both files are ready to be placed in their respective folders.
