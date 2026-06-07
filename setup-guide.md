# FoxTrading - Development Setup Guide

A comprehensive guide for setting up, developing, and extending the FoxTrading internationalization system.

## 🛠 Development Environment Setup

### Prerequisites

- **Web Server**: For proper CORS handling (required for JSON file loading)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor
- **Git**: For version control (optional but recommended)

### Quick Setup

1. **Clone/Download Project**:
   ```bash
   git clone https://github.com/kaufast/foxtrading.git
   cd foxtrading
   ```

2. **Choose a Development Server**:

   **Option A: Python (if installed)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Node.js (if installed)**
   ```bash
   # Install serve globally
   npm install -g serve
   
   # Serve current directory
   serve -p 8000
   ```

   **Option C: PHP (if installed)**
   ```bash
   php -S localhost:8000
   ```

   **Option D: Live Server (VS Code Extension)**
   - Install "Live Server" extension in VS Code
   - Right-click `index.html` → "Open with Live Server"

3. **Access Website**:
   - Open browser to `http://localhost:8000`
   - Test language switching immediately

## 🔧 Development Workflow

### File Structure Understanding

```
foxtrading/
├── index.html                    # Main HTML - add data-i18n attributes here
├── locales/                      # Translation files
│   ├── en.json                  # English translations - master reference
│   └── es-MX.json               # Spanish translations - keep in sync
├── assets/
│   ├── js/modules/              # Core i18n system (rarely modified)
│   │   ├── i18n.js             # Translation engine
│   │   ├── language-detector.js # Language detection logic
│   │   └── app.js              # App coordination
│   └── css/i18n/               # i18n-specific styles
│       ├── language-selector.css # Language dropdown styles
│       ├── notifications.css     # User feedback
│       └── responsive.css        # Language-responsive design
```

### Common Development Tasks

#### Adding New Translatable Content

1. **Add to HTML with `data-i18n` attribute**:
   ```html
   <!-- Before -->
   <button>Contact Us</button>
   
   <!-- After -->
   <button data-i18n="buttons.contact">Contact Us</button>
   ```

2. **Add translation keys to both language files**:
   
   `locales/en.json`:
   ```json
   {
     "buttons": {
       "contact": "Contact Us"
     }
   }
   ```
   
   `locales/es-MX.json`:
   ```json
   {
     "buttons": {
       "contact": "Contáctanos"
     }
   }
   ```

3. **Test both languages** to ensure proper display

#### Modifying Existing Translations

1. **Update both language files simultaneously**
2. **Test text length differences** (Spanish is often 20-30% longer)
3. **Check responsive behavior** on mobile devices

#### Styling Language-Specific Content

```css
/* Target specific language content */
.lang-es-MX .long-title {
    font-size: 0.9em; /* Smaller font for longer Spanish text */
    line-height: 1.3;
}

.lang-en .navigation-item {
    padding: 10px 15px;
}

.lang-es-MX .navigation-item {
    padding: 8px 12px; /* Tighter spacing for longer text */
}
```

## 🧪 Testing Procedures

### Local Testing Checklist

1. **Basic Functionality**:
   - [ ] Website loads in English by default
   - [ ] Language dropdown appears in navigation
   - [ ] Clicking dropdown shows both language options
   - [ ] Switching to Spanish changes all content
   - [ ] Switching back to English works correctly
   - [ ] Page refresh maintains selected language

2. **URL Parameter Testing**:
   ```
   http://localhost:8000                    # Should show English
   http://localhost:8000?lang=es-MX         # Should show Spanish
   http://localhost:8000?lang=invalid       # Should fallback to English
   ```

3. **Storage Persistence**:
   - Switch to Spanish, close browser, reopen → Should remember Spanish
   - Clear localStorage and refresh → Should return to English

4. **Responsive Testing**:
   - Test language dropdown on mobile devices
   - Verify longer Spanish text doesn't break layouts
   - Check language selector in mobile menu

### Browser Console Testing

Open browser console (F12) and test these commands:

```javascript
// Get debug information
window.foxTradingApp.getDebugInfo();

// Force language change
await window.foxTradingApp.changeLanguage('es-MX');

// Check current language
window.foxTradingApp.getCurrentLanguage();

// Clear stored preferences
window.foxTradingApp.detector.clearPreferences();

// Test Mexican timezone detection
window.foxTradingApp.detector.detectLanguage({ 
    checkTimezone: true, 
    checkBrowser: false 
});
```

### Simulating Mexican Users

1. **Timezone Simulation**:
   - Change system timezone to "America/Mexico_City"
   - Clear localStorage and refresh page
   - Should automatically show Spanish

2. **Browser Language Simulation**:
   ```javascript
   // Override browser language
   Object.defineProperty(navigator, 'language', {
       value: 'es-MX',
       writable: true
   });
   
   // Refresh detection
   window.foxTradingApp.detector.refreshDetection();
   ```

## 🌐 Adding New Languages

### Step-by-Step Process

1. **Create Translation File**:
   ```bash
   # Copy English as template
   cp locales/en.json locales/fr.json
   # Translate all values to French
   ```

2. **Update Language Lists**:
   
   In `assets/js/modules/app.js`:
   ```javascript
   this.config = {
       supportedLanguages: ['en', 'es-MX', 'fr'], // Add your language
       // ...
   };
   
   // Add flag and name
   this.flags = {
       'en': '🇬🇧',
       'es-MX': '🇲🇽',
       'fr': '🇫🇷'  // Add flag
   };
   
   this.languageNames = {
       'en': 'English (UK)',
       'es-MX': 'Español (México)',
       'fr': 'Français'  // Add name
   };
   ```

3. **Update Detection Logic** (if needed):
   
   In `assets/js/modules/language-detector.js`:
   ```javascript
   // Add timezone detection for your country if needed
   const frenchTimezones = [
       'Europe/Paris',
       'Europe/Monaco'
   ];
   ```

4. **Test New Language**:
   - `http://localhost:8000?lang=fr`
   - Switch via dropdown
   - Test all content translates properly

## 🎨 Customizing the UI

### Language Selector Styling

Modify `assets/css/i18n/language-selector.css`:

```css
/* Change dropdown appearance */
.lang-dropdown {
    background: #your-brand-color;
    border: 2px solid #your-accent-color;
    border-radius: 12px; /* More rounded */
}

/* Customize flags/text */
.lang-dropdown option::before {
    content: "🌍 "; /* Add globe icon to all options */
}

/* Different hover effects */
.lang-dropdown:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

### Notification System

Customize `assets/css/i18n/notifications.css`:

```css
/* Change notification position */
.notification {
    top: auto;
    bottom: 20px; /* Move to bottom */
    right: 20px;
}

/* Custom notification colors */
.notification.success {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
}
```

## 🔍 Debugging Common Issues

### Language Not Switching

1. **Check Console for Errors**:
   ```javascript
   // Look for failed requests
   console.log('Translation loading errors?');
   ```

2. **Verify JSON Syntax**:
   - Use JSON validator on translation files
   - Check for missing commas or brackets

3. **Check data-i18n Attributes**:
   ```javascript
   // Find elements without translations
   document.querySelectorAll('[data-i18n]').forEach(el => {
       const key = el.getAttribute('data-i18n');
       const translation = window.foxTradingApp.translate(key);
       if (translation === key) {
           console.warn('Missing translation:', key);
       }
   });
   ```

### Translation Files Not Loading

1. **CORS Issues**:
   - Ensure you're using a proper web server
   - Check browser console for CORS errors
   - File:// URLs won't work - need http://

2. **File Path Issues**:
   ```javascript
   // Test direct file access
   fetch('/locales/en.json')
       .then(r => r.json())
       .then(data => console.log('Translation loaded:', data))
       .catch(e => console.error('Load failed:', e));
   ```

### Mobile Issues

1. **Language Selector Not Showing**:
   - Check CSS media queries in `language-selector.css`
   - Verify mobile navigation implementation

2. **Touch Events**:
   - Test dropdown on actual mobile devices
   - Check for touch event conflicts

### Performance Issues

1. **Enable Debug Mode**:
   ```
   http://localhost:8000?debug=true
   ```

2. **Check Network Tab**:
   - Verify translation files load quickly
   - Look for unnecessary re-downloads

3. **Memory Usage**:
   ```javascript
   // Monitor memory usage
   console.log(window.foxTradingApp.i18n.getCacheStats());
   ```

## 🚀 Deployment Considerations

### Pre-Deployment Checklist

1. **Validate All Translations**:
   ```bash
   # Use JSON linter
   jsonlint locales/en.json
   jsonlint locales/es-MX.json
   ```

2. **Test in Production Mode**:
   - Disable debug mode
   - Test with minified assets
   - Verify HTTPS works correctly

3. **Performance Optimization**:
   - Enable gzip compression
   - Set proper caching headers for locales/*.json
   - Test loading speeds

### CDN Setup

For better performance, serve translation files from CDN:

```javascript
// In app.js, modify basePath
this.config = {
    basePath: 'https://cdn.yourdomain.com/locales/',
    // ...
};
```

### Analytics Integration

```javascript
// Track language usage
window.addEventListener('languageChanged', (e) => {
    // Google Analytics 4
    gtag('event', 'language_change', {
        'from_language': e.detail.previous,
        'to_language': e.detail.current,
        'method': 'manual'
    });
    
    // Or your preferred analytics service
});
```

## 📱 Mobile Development

### Testing on Mobile Devices

1. **Use Browser DevTools**:
   - Chrome DevTools → Toggle Device Toolbar
   - Test various screen sizes
   - Verify language selector accessibility

2. **Test on Real Devices**:
   - Use `ngrok` or similar to expose localhost
   - Test touch interactions
   - Verify performance on slower devices

### Mobile-Specific Considerations

```css
/* Mobile-first language selector */
@media (max-width: 768px) {
    .lang-dropdown {
        width: 100%;
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 12px;
    }
}
```

## 🔐 Security Best Practices

### Translation Content Security

1. **Sanitize User Content**:
   ```javascript
   // Never use innerHTML with translations
   element.innerHTML = translation; // ❌ Dangerous
   element.textContent = translation; // ✅ Safe
   ```

2. **Validate Translation Keys**:
   ```javascript
   // Whitelist allowed characters in keys
   const isValidKey = (key) => /^[a-zA-Z0-9._-]+$/.test(key);
   ```

3. **CSP Headers**:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
   ```

## ⚡ Performance Optimization

### Loading Strategies

1. **Preload Critical Languages**:
   ```javascript
   // In app.js
   async preloadLanguages() {
       const criticalLangs = ['en', 'es-MX'];
       await this.i18n.preloadTranslations(criticalLangs);
   }
   ```

2. **Lazy Load Large Translations**:
   ```javascript
   // Split large translation files
   const loadExtendedTranslations = async (lang) => {
       const extended = await fetch(`/locales/${lang}-extended.json`);
       return extended.json();
   };
   ```

### Caching Strategy

```javascript
// Service Worker for offline support
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/locales/')) {
        event.respondWith(
            caches.open('translations-v1').then(cache => {
                return cache.match(event.request) || fetch(event.request);
            })
        );
    }
});
```

## 🎯 Advanced Features

### Dynamic Content Translation

```javascript
// For content that changes dynamically
const updateDynamicContent = (newData) => {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = ''; // Clear existing
    
    newData.forEach(item => {
        const element = document.createElement('div');
        element.setAttribute('data-i18n', item.translationKey);
        element.textContent = window.foxTradingApp.translate(item.translationKey);
        container.appendChild(element);
    });
};
```

### Form Validation Messages

```javascript
// Localized form validation
const validateForm = (form) => {
    const errors = [];
    
    if (!form.name.value) {
        errors.push(window.foxTradingApp.translate('validation.nameRequired'));
    }
    
    if (!form.email.value.includes('@')) {
        errors.push(window.foxTradingApp.translate('validation.emailInvalid'));
    }
    
    return errors;
};
```

---

## 🆘 Getting Help

- **Documentation**: Complete README.md for user guide
- **Code Comments**: Extensive documentation in source files
- **Browser Console**: Use debug mode for detailed logging
- **GitHub Issues**: Report bugs or request features

**Happy developing! 🚀**