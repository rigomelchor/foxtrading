# FoxTrading - HTML5 Internationalization Project

A complete, professional-grade internationalization (i18n) implementation for the FoxTrading architecture & construction website, featuring advanced language detection, seamless switching, and comprehensive multilingual support.

## 🌍 Overview

This project demonstrates best practices for HTML5 internationalization with:

- **Default Language**: English (UK) for all users
- **Secondary Language**: Spanish (México) - es-MX
- **Smart Detection**: Automatic Spanish for Mexican users via timezone/browser locale detection
- **Manual Override**: Professional navigation dropdown with flag icons (🇬🇧/🇲🇽)
- **Dynamic Switching**: Instant language changes without page reload
- **Persistent Storage**: Remembers user language choice across sessions
- **SEO Friendly**: Proper HTML lang attributes and URL parameter support

## 🚀 Quick Start

1. **Clone and Setup**:
   ```bash
   git clone https://github.com/kaufast/foxtrading.git
   cd foxtrading
   ```

2. **Serve Locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or open index.html directly in browser
   ```

3. **Test Language Features**:
   - Visit `http://localhost:8000` (English by default)
   - Visit `http://localhost:8000?lang=es-MX` (Spanish override)
   - Use language dropdown to switch languages
   - Inspect localStorage to see preferences

## 📁 Project Structure

```
foxtrading/
├── index.html                 # Main HTML file with semantic structure
├── locales/                   # Translation files
│   ├── en.json               # English (UK) translations
│   └── es-MX.json            # Spanish (Mexico) translations
├── assets/
│   ├── js/
│   │   ├── modules/          # Modular JavaScript architecture
│   │   │   ├── i18n.js      # Core internationalization engine
│   │   │   ├── language-detector.js # Detection logic
│   │   │   └── app.js       # Main application controller
│   │   ├── jquery-3.5.1.min.js
│   │   ├── gsap.min.js      # Animations
│   │   └── ScrollTrigger.min.js
│   └── css/
│       ├── i18n/            # Internationalization styles
│       │   ├── language-selector.css # Language dropdown styles
│       │   ├── notifications.css     # Toast notifications
│       │   └── responsive.css        # Responsive i18n enhancements
│       └── google-fonts.css
├── README.md                  # This file
└── setup-guide.md            # Development setup guide
```

## 🔧 Technical Implementation

### Core Architecture

The i18n system uses a modular JavaScript architecture:

1. **`I18n` Class** (`assets/js/modules/i18n.js`):
   - Core translation engine
   - DOM updates and language switching
   - Caching and performance optimization
   - Event system for language changes

2. **`LanguageDetector` Class** (`assets/js/modules/language-detector.js`):
   - Mexican timezone detection (America/Mexico_City, etc.)
   - Browser language analysis
   - localStorage persistence
   - Fallback strategies

3. **`FoxTradingApp` Class** (`assets/js/modules/app.js`):
   - Application controller
   - UI management
   - Event coordination
   - Analytics integration

### Detection Logic

The system prioritizes language selection in this order:

1. **URL Parameters** (highest priority): `?lang=es-MX`
2. **Stored User Preference**: localStorage (recent selections)
3. **Browser Language**: `navigator.languages` analysis
4. **Mexican Timezone**: Auto-detect Mexican users
5. **Default Fallback**: English (UK)

### Mexican Detection

Mexican users are detected through:

```javascript
const mexicanTimezones = [
    'America/Mexico_City',
    'America/Cancun',
    'America/Merida',
    'America/Monterrey',
    'America/Mazatlan',
    'America/Chihuahua',
    'America/Hermosillo',
    'America/Tijuana',
    'America/Bahia_Banderas'
];
```

## 🎨 Features

### Language Selector

- **Professional Design**: Elegant dropdown with flag icons
- **Responsive**: Desktop and mobile-optimized
- **Accessible**: ARIA labels and keyboard navigation
- **Smooth Animations**: Transitions and hover effects

### Content Translation

- **Complete Coverage**: All page content translated
- **Semantic HTML**: Proper `data-i18n` attributes
- **Dynamic Updates**: Real-time content switching
- **Fallback System**: Graceful handling of missing translations

### User Experience

- **Instant Switching**: No page reload required
- **Memory**: Remembers language choice
- **URL Integration**: Shareable language-specific URLs
- **Visual Feedback**: Loading states and notifications

## 🌐 Translation System

### Translation Keys

Translations use dot notation for organization:

```javascript
// English (en.json)
{
  "nav": {
    "home": "Home",
    "about": "About",
    "services": "Services"
  },
  "hero": {
    "title": "Let's bring your dream building to life!",
    "subtitle": "Our skilled team offers..."
  }
}

// Spanish (es-MX.json)
{
  "nav": {
    "home": "Inicio",
    "about": "Nosotros",
    "services": "Servicios"
  },
  "hero": {
    "title": "¡Hagamos realidad el edificio de tus sueños!",
    "subtitle": "Nuestro equipo especializado ofrece..."
  }
}
```

### HTML Integration

```html
<!-- Simple translation -->
<h1 data-i18n="hero.title">Let's bring your dream building to life!</h1>

<!-- Form inputs -->
<input placeholder="Enter Your Name" data-i18n="form.enterName">

<!-- Navigation -->
<a href="#about" data-i18n="nav.about">About</a>
```

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Language-Specific**: Adjustments for longer Spanish text
- **Touch-Friendly**: Mobile language selector
- **Performance**: Optimized animations and transitions

## 🔒 Security & Performance

- **XSS Protection**: Safe DOM updates using `textContent`
- **Input Validation**: Sanitized translation keys
- **Caching**: Translation file caching
- **Lazy Loading**: On-demand language loading
- **Performance Monitoring**: Debug mode available

## 📊 Analytics & Tracking

Built-in support for language usage analytics:

```javascript
// Track language detection
trackLanguageUsage(detection);

// Track manual changes
trackLanguageChange(data);

// Custom events
window.addEventListener('languageChanged', (e) => {
    console.log('Language changed to:', e.detail.current);
});
```

## 🧪 Testing Different Scenarios

### Test Mexican User Detection

1. **Timezone Simulation**:
   ```javascript
   // In browser console
   window.foxTradingApp.detector.detectLanguage({ checkTimezone: true });
   ```

2. **Browser Language Override**:
   ```javascript
   Object.defineProperty(navigator, 'language', {
       value: 'es-MX',
       writable: true
   });
   ```

3. **URL Parameters**:
   - `?lang=es-MX` - Force Spanish
   - `?lang=en` - Force English
   - `?debug=true` - Enable debug mode

### Test Storage & Persistence

1. **Clear Preferences**:
   ```javascript
   window.foxTradingApp.detector.clearPreferences();
   ```

2. **Check Storage**:
   ```javascript
   console.log(localStorage.getItem('foxtrading_language'));
   ```

3. **Debug Information**:
   ```javascript
   console.log(window.foxTradingApp.getDebugInfo());
   ```

## 🚢 Deployment

The project is automatically deployed via:

- **GitHub**: Version control and collaboration
- **Vercel**: Continuous deployment from main branch
- **CDN**: Global content delivery
- **Custom Domain**: Professional URL structure

### Production URL

- **Live Site**: https://foxtrading.vercel.app
- **Spanish Version**: https://foxtrading.vercel.app?lang=es-MX

## 🛠 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Support**: iOS Safari, Chrome Mobile, Samsung Internet

## 📋 API Reference

### Public Methods

```javascript
// Change language programmatically
await window.foxTradingApp.changeLanguage('es-MX');

// Get current language
const currentLang = window.foxTradingApp.getCurrentLanguage();

// Translate text
const translated = window.foxTradingApp.translate('nav.home');

// Get debug information
const debug = window.foxTradingApp.getDebugInfo();
```

### Events

```javascript
// Language initialization
window.addEventListener('languageReady', (e) => {
    console.log('i18n ready:', e.detail.language);
});

// Language change
window.addEventListener('languageChanged', (e) => {
    console.log('Changed from', e.detail.previous, 'to', e.detail.current);
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-language`
3. Add translations to `locales/` folder
4. Update language detector if needed
5. Test thoroughly
6. Submit a pull request

## 📜 License

This project is based on a web template with custom development and enhancements.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/kaufast/foxtrading/issues)
- **Documentation**: This README and `setup-guide.md`
- **Live Demo**: [https://foxtrading.vercel.app](https://foxtrading.vercel.app)

---

**Built with ❤️ for the global web**

*FoxTrading - Professional internationalization for modern websites*