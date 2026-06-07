/**
 * Core Internationalization Engine
 * Handles translation loading, caching, and DOM updates
 */
class I18n {
    constructor(options = {}) {
        this.currentLanguage = options.defaultLanguage || 'en-SG'; // ✅ FIXED
        this.fallbackLanguage = options.fallbackLanguage || 'en-SG'; // ✅ FIXED
        this.translations = {};
        this.supportedLanguages = options.supportedLanguages || ['en-SG', 'es-MX']; // ✅ FIXED
        this.basePath = options.basePath || '/locales/';
        this.cache = new Map();
        this.interpolationRegex = /\{\{([^}]+)\}\}/g;
        
        // Event system
        this.listeners = {};
        
        // Performance optimization
        this.translationPromises = new Map();
    }

    /**
     * Initialize the i18n system
     */
    async init() {
        try {
            // Load initial language translations
            await this.loadTranslations(this.currentLanguage);
            
            // Set HTML lang attribute
            this.updateHtmlLang();
            
            // Apply initial translations
            this.updateDOM();
            
            // Emit ready event
            this.emit('ready', { language: this.currentLanguage });
            
            return true;
        } catch (error) {
            console.error('Failed to initialize i18n:', error);
            
            // Fallback to default language if current fails
            if (this.currentLanguage !== this.fallbackLanguage) {
                console.log('Falling back to default language:', this.fallbackLanguage);
                this.currentLanguage = this.fallbackLanguage;
                return this.init();
            }
            
            throw error;
        }
    }

    /**
     * Load translations for a specific language
     * @param {string} lang - Language code (e.g., 'en', 'es-MX')
     */
    async loadTranslations(lang) {
        // Check cache first
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        // Check if already loading
        if (this.translationPromises.has(lang)) {
            return this.translationPromises.get(lang);
        }

        const promise = this._fetchTranslations(lang);
        this.translationPromises.set(lang, promise);

        try {
            const translations = await promise;
            this.translations[lang] = translations;
            this.cache.set(`translations_${lang}`, translations);
            return translations;
        } catch (error) {
            this.translationPromises.delete(lang);
            throw error;
        }
    }

    /**
     * Fetch translations from server
     * @private
     */
    async _fetchTranslations(lang) {
        const url = `${this.basePath}${lang}.json`;
        console.log(`🌐 LOADING TRANSLATIONS: ${url}`);
        
        try {
            const response = await fetch(url);
            console.log(`🌐 FETCH RESPONSE:`, {
                url,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load ${url}`);
            }
            
            const data = await response.json();
            console.log(`🌐 LOADED TRANSLATIONS FOR ${lang}:`, data);
            return data;
        } catch (error) {
            console.error(`🚫 FAILED TO LOAD TRANSLATIONS FOR ${lang}:`, error);
            
            // Return fallback translations if available
            if (lang !== this.fallbackLanguage && this.translations[this.fallbackLanguage]) {
                console.log(`Using fallback translations for ${lang}`);
                return this.translations[this.fallbackLanguage];
            }
            
            throw error;
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (e.g., 'nav.home')
     * @param {Object} params - Interpolation parameters
     * @param {string} lang - Language code (optional, uses current language)
     */
    translate(key, params = {}, lang = null) {
        const targetLang = lang || this.currentLanguage;
        const translations = this.translations[targetLang] || this.translations[this.fallbackLanguage] || {};
        
        // Get nested property
        const translation = this._getNestedProperty(translations, key);
        
        if (translation === undefined) {
            console.warn(`Missing translation for key: ${key} in language: ${targetLang}`);
            return key; // Return key as fallback
        }
        
        // Handle interpolation
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return this._interpolate(translation, params);
        }
        
        return translation;
    }

    /**
     * Alias for translate method
     */
    t = this.translate.bind(this);

    /**
     * Get nested object property by dot notation
     * @private
     */
    _getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Interpolate parameters into translation string
     * @private
     */
    _interpolate(str, params) {
        return str.replace(this.interpolationRegex, (match, key) => {
            const trimmedKey = key.trim();
            return params[trimmedKey] !== undefined ? params[trimmedKey] : match;
        });
    }

    /**
     * Change current language
     * @param {string} lang - New language code
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}. Using fallback: ${this.fallbackLanguage}`);
            lang = this.fallbackLanguage;
        }

        if (lang === this.currentLanguage) {
            return; // No change needed
        }

        try {
            // Load new language if not already loaded
            await this.loadTranslations(lang);
            
            const previousLanguage = this.currentLanguage;
            this.currentLanguage = lang;
            
            // Update DOM
            this.updateHtmlLang();
            this.updateDOM();
            
            // Emit language change event
            this.emit('languageChanged', {
                previous: previousLanguage,
                current: lang,
                translations: this.translations[lang]
            });
            
        } catch (error) {
            console.error(`Failed to set language to ${lang}:`, error);
            throw error;
        }
    }

    /**
     * Update HTML lang attribute
     */
    updateHtmlLang() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.translate('meta.direction') || 'ltr';
    }

    /**
     * Update all DOM elements with data-i18n attributes
     */
    updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`🔄 UPDATING DOM: Found ${elements.length} elements with data-i18n`);
        
        elements.forEach((element, index) => {
            const key = element.getAttribute('data-i18n');
            console.log(`🔄 Element ${index + 1}: ${key} ->`, element);
            this._updateElement(element);
        });
        
        // Update language selector if it exists
        this._updateLanguageSelector();
        
        console.log(`✅ DOM UPDATE COMPLETE for language: ${this.currentLanguage}`);
    }
    
    /**
     * Force page update (public method for debugging)
     */
    updatePage() {
        console.log('🔄 FORCING PAGE UPDATE...');
        this.updateDOM();
    }

    /**
     * Update single DOM element
     * @private
     */
    _updateElement(element) {
        const key = element.getAttribute('data-i18n');
        const params = this._getElementParams(element);
        const translation = this.translate(key, params);
        
        // Handle different element types
        if (element.tagName === 'INPUT') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = translation;
            } else {
                element.placeholder = translation;
            }
        } else {
            // Use textContent for better XSS protection
            element.textContent = translation;
        }
    }

    /**
     * Get interpolation parameters from element attributes
     * @private
     */
    _getElementParams(element) {
        const params = {};
        const paramsAttr = element.getAttribute('data-i18n-params');
        
        if (paramsAttr) {
            try {
                Object.assign(params, JSON.parse(paramsAttr));
            } catch (error) {
                console.warn('Invalid data-i18n-params JSON:', paramsAttr);
            }
        }
        
        return params;
    }

    /**
     * Update language selector dropdown
     * @private
     */
    _updateLanguageSelector() {
        const selectors = document.querySelectorAll('.language-selector select, #language-dropdown-desktop, #language-dropdown-mobile, #language-select-mobile, .language-selector-dropdown');
        
        selectors.forEach(selector => {
            if (selector) {
                selector.value = this.currentLanguage;
                
                // Update visual state for dropdowns
                const currentOption = selector.querySelector(`option[value="${this.currentLanguage}"]`);
                if (currentOption) {
                    currentOption.selected = true;
                }
            }
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Check if language is supported
     */
    isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }

    /**
     * Get all loaded translations
     */
    getTranslations(lang = null) {
        const targetLang = lang || this.currentLanguage;
        return this.translations[targetLang] || {};
    }

    /**
     * Preload translations for better performance
     */
    async preloadTranslations(langs) {
        const promises = langs
            .filter(lang => this.supportedLanguages.includes(lang))
            .filter(lang => !this.translations[lang])
            .map(lang => this.loadTranslations(lang));
        
        await Promise.all(promises);
    }

    /**
     * Event system - Add event listener
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Event system - Remove event listener
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        
        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    /**
     * Event system - Emit event
     * @private
     */
    emit(event, data) {
        if (!this.listeners[event]) return;
        
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Clear all translations cache
     */
    clearCache() {
        this.translations = {};
        this.cache.clear();
        this.translationPromises.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            loadedLanguages: Object.keys(this.translations),
            cacheSize: this.cache.size,
            pendingLoads: this.translationPromises.size
        };
    }
}

// Export for both ES6 modules and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
} else if (typeof window !== 'undefined') {
    window.I18n = I18n;
}