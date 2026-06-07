/**
 * Language Detection Module for FoxTrading Singapore
 * Handles automatic language detection optimized for Singapore market
 * Supports en-SG (British English) and es-MX (Mexican Spanish)
 * Primary market: Singapore with Mexican food exports
 */
class LanguageDetector {
    constructor(options = {}) {
        // Singapore market focus - English as primary, Spanish for Mexican suppliers/content
        this.supportedLanguages = options.supportedLanguages || ['en-SG', 'es-MX'];
        this.defaultLanguage = options.defaultLanguage || 'en-SG'; // English default for Singapore
        this.fallbackLanguage = options.fallbackLanguage || 'en-SG';
        
        // Singapore timezone identifiers (primary market)
        this.singaporeTimezones = [
            'Asia/Singapore',
            'Singapore'
        ];
        
        // Mexican timezone identifiers (supplier market)
        this.mexicanTimezones = [
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
        
        // Other English-speaking regions in Asia-Pacific
        this.englishRegionTimezones = [
            'Asia/Hong_Kong',
            'Asia/Kuala_Lumpur',
            'Australia/Sydney',
            'Australia/Melbourne',
            'Pacific/Auckland',
            'Asia/Manila',
            'Asia/Bangkok', // Common business language
            'Asia/Jakarta'  // Common business language
        ];
        
        // Storage keys with FoxTrading namespace
        this.storageKeys = {
            language: 'foxtrading_sg_language',
            detectionMethod: 'foxtrading_sg_detection_method',
            lastDetection: 'foxtrading_sg_last_detection',
            userOverride: 'foxtrading_sg_user_override'
        };
        
        // Detection priorities optimized for Singapore market
        this.detectionPriorities = {
            url: 10,
            manual: 9,
            stored: 8,
            timezone_singapore: 7,      // High priority - primary market
            timezone_mexico: 6,         // Mexican suppliers
            timezone_english_region: 5, // Other English regions in APAC
            browser_exact: 4,
            browser_base: 3,
            geolocation: 2,
            default: 1
        };
    }

    /**
     * Detect the most appropriate language for the Singapore market
     * @param {Object} options - Detection options
     * @returns {Object} Detection result with language and method
     */
    async detectLanguage(options = {}) {
        const {
            checkURL = true,
            checkStorage = true,
            checkBrowser = true,
            checkTimezone = true,
            checkGeolocation = false,
            respectUserChoice = true,
            debug = false
        } = options;

        const detectionSignals = [];
        let bestResult = {
            language: this.defaultLanguage,
            method: 'default',
            confidence: 0.9, // High confidence in English default for Singapore
            priority: this.detectionPriorities.default,
            signals: []
        };

        try {
            if (debug) console.log('🇸🇬 Starting language detection for FoxTrading Singapore market...');

            // 1. Check URL parameter first (highest priority)
            if (checkURL) {
                const urlResult = this._detectFromURL();
                detectionSignals.push(urlResult);
                if (urlResult.detected && urlResult.priority > bestResult.priority) {
                    bestResult = { ...urlResult, signals: detectionSignals };
                    if (debug) console.log('✅ URL detection:', urlResult);
                }
            }

            // 2. Check stored user preference (high priority)
            if (checkStorage && respectUserChoice) {
                const storedResult = this._detectFromStorage();
                detectionSignals.push(storedResult);
                if (storedResult.detected && storedResult.priority > bestResult.priority && this._isRecentDetection()) {
                    bestResult = { ...storedResult, signals: detectionSignals };
                    if (debug) console.log('✅ Storage detection:', storedResult);
                }
            }

            // 3. Check timezone (Singapore gets highest priority)
            if (checkTimezone) {
                const timezoneResult = this._detectFromTimezone();
                detectionSignals.push(timezoneResult);
                if (timezoneResult.detected && timezoneResult.priority > bestResult.priority) {
                    bestResult = { ...timezoneResult, signals: detectionSignals };
                    if (debug) console.log('✅ Timezone detection:', timezoneResult);
                }
            }

            // 4. Check browser language preferences
            if (checkBrowser) {
                const browserResult = this._detectFromBrowser();
                detectionSignals.push(browserResult);
                if (browserResult.detected && browserResult.priority > bestResult.priority) {
                    bestResult = { ...browserResult, signals: detectionSignals };
                    if (debug) console.log('✅ Browser detection:', browserResult);
                }
            }

            // 5. Optional geolocation check (Singapore-focused)
            if (checkGeolocation) {
                try {
                    const geoResult = await this._detectFromGeolocation();
                    detectionSignals.push(geoResult);
                    if (geoResult.detected && geoResult.priority > bestResult.priority) {
                        bestResult = { ...geoResult, signals: detectionSignals };
                        if (debug) console.log('✅ Geolocation detection:', geoResult);
                    }
                } catch (error) {
                    if (debug) console.warn('⚠️ Geolocation detection failed:', error);
                }
            }

            // Final validation and fallback
            if (!this.supportedLanguages.includes(bestResult.language)) {
                bestResult.language = this.fallbackLanguage;
                bestResult.method = 'fallback';
                bestResult.confidence = 0.9; // High confidence in English for Singapore
                bestResult.priority = this.detectionPriorities.default;
            }

            // Store the detection result
            this._storeDetection(bestResult);
            
            bestResult.signals = detectionSignals;
            bestResult.market = 'singapore';
            
            if (debug) {
                console.log('🇸🇬 Final detection result for Singapore market:', bestResult);
                console.log('📊 All detection signals:', detectionSignals);
            }

            return bestResult;
            
        } catch (error) {
            console.error('❌ Error in Singapore market language detection:', error);
            return {
                language: this.fallbackLanguage,
                method: 'error_fallback',
                confidence: 0.9,
                priority: 0,
                signals: detectionSignals,
                error: error.message,
                market: 'singapore'
            };
        }
    }

    /**
     * Detect language from URL parameters or path
     * @private
     */
    _detectFromURL() {
        const result = { 
            detected: false, 
            language: null, 
            source: 'url',
            priority: this.detectionPriorities.url,
            confidence: 1.0,
            method: null
        };
        
        try {
            // Check for path-based routing (e.g., /en-SG/ or /es-MX/)
            const pathname = window.location.pathname;
            const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
            
            if (pathSegments.length > 0) {
                const potentialLang = pathSegments[0];
                if (this.supportedLanguages.includes(potentialLang)) {
                    result.detected = true;
                    result.language = potentialLang;
                    result.method = 'path';
                    result.pathSegment = potentialLang;
                    return result;
                }
            }
            
            // Check for query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang') || urlParams.get('language') || urlParams.get('locale');
            
            if (langParam) {
                const normalizedParam = this._normalizeLanguageCode(langParam);
                if (this.supportedLanguages.includes(normalizedParam)) {
                    result.detected = true;
                    result.language = normalizedParam;
                    result.method = 'query';
                    result.originalParam = langParam;
                    result.normalizedParam = normalizedParam;
                }
            }
            
        } catch (error) {
            console.warn('Error detecting language from URL:', error);
        }
        
        return result;
    }

    /**
     * Detect language from localStorage
     * @private
     */
    _detectFromStorage() {
        const result = { 
            detected: false, 
            language: null, 
            source: 'storage',
            priority: this.detectionPriorities.stored,
            confidence: 0.95
        };
        
        try {
            const storedLang = localStorage.getItem(this.storageKeys.language);
            const storedMethod = localStorage.getItem(this.storageKeys.detectionMethod);
            const userOverride = localStorage.getItem(this.storageKeys.userOverride);
            
            if (storedLang && this.supportedLanguages.includes(storedLang)) {
                result.detected = true;
                result.language = storedLang;
                result.storedMethod = storedMethod;
                result.timestamp = localStorage.getItem(this.storageKeys.lastDetection);
                result.isUserOverride = userOverride === 'true';
                
                // Higher priority if user manually selected
                if (result.isUserOverride) {
                    result.priority = this.detectionPriorities.manual;
                    result.confidence = 1.0;
                }
            }
            
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
        }
        
        return result;
    }

    /**
     * Detect language from timezone (Singapore-focused)
     * @private
     */
    _detectFromTimezone() {
        const result = { 
            detected: false, 
            language: null, 
            source: 'timezone',
            confidence: 0.8
        };
        
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            result.detectedTimezone = timezone;
            
            // Check for Singapore timezone (highest priority)
            if (this.singaporeTimezones.includes(timezone)) {
                result.detected = true;
                result.language = 'en-SG';
                result.priority = this.detectionPriorities.timezone_singapore;
                result.reason = 'singapore_timezone';
                result.confidence = 0.95;
                result.market = 'primary';
            }
            // Check for Mexican timezones (supplier market)
            else if (this.mexicanTimezones.includes(timezone)) {
                result.detected = true;
                result.language = 'es-MX';
                result.priority = this.detectionPriorities.timezone_mexico;
                result.reason = 'mexican_timezone';
                result.confidence = 0.8;
                result.market = 'supplier';
            }
            // Check for other English-speaking regions in APAC
            else if (this.englishRegionTimezones.includes(timezone)) {
                result.detected = true;
                result.language = 'en-SG';
                result.priority = this.detectionPriorities.timezone_english_region;
                result.reason = 'english_region_timezone';
                result.confidence = 0.7;
                result.market = 'regional';
            }
            
        } catch (error) {
            console.warn('Error detecting timezone:', error);
        }
        
        return result;
    }

    /**
     * Detect language from browser settings (Singapore market optimized)
     * @private
     */
    _detectFromBrowser() {
        const result = { 
            detected: false, 
            language: null, 
            source: 'browser',
            confidence: 0
        };
        
        try {
            const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
            result.allBrowserLanguages = browserLanguages;
            
            for (let i = 0; i < browserLanguages.length; i++) {
                const browserLang = browserLanguages[i];
                const normalized = this._normalizeBrowserLanguage(browserLang);
                
                // Exact match gets priority
                if (this.supportedLanguages.includes(normalized.full)) {
                    result.detected = true;
                    result.language = normalized.full;
                    result.priority = this.detectionPriorities.browser_exact;
                    result.confidence = Math.max(0.7 - (i * 0.1), 0.4);
                    result.browserLanguage = browserLang;
                    result.normalized = normalized;
                    result.matchType = 'exact';
                    break;
                }
                
                // Base language match (lower priority)
                if (this.supportedLanguages.includes(normalized.base)) {
                    result.detected = true;
                    result.language = normalized.base;
                    result.priority = this.detectionPriorities.browser_base;
                    result.confidence = Math.max(0.5 - (i * 0.1), 0.2);
                    result.browserLanguage = browserLang;
                    result.normalized = normalized;
                    result.matchType = 'base';
                    // Continue looking for exact matches
                }
            }
            
        } catch (error) {
            console.warn('Error detecting browser language:', error);
        }
        
        return result;
    }

    /**
     * Detect language from geolocation (Singapore & APAC focused)
     * @private
     */
    _detectFromGeolocation() {
        return new Promise((resolve) => {
            const result = { 
                detected: false, 
                language: null, 
                source: 'geolocation',
                priority: this.detectionPriorities.geolocation,
                confidence: 0.7
            };

            if (!navigator.geolocation) {
                result.error = 'Geolocation not supported';
                resolve(result);
                return;
            }

            const timeout = setTimeout(() => {
                result.error = 'Geolocation timeout';
                resolve(result);
            }, 3000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeout);
                    const { latitude, longitude } = position.coords;
                    result.coordinates = { latitude, longitude };
                    
                    // Singapore: 1.2966° N, 103.7764° E (with buffer)
                    if (latitude >= 1.1 && latitude <= 1.5 && longitude >= 103.6 && longitude <= 104.0) {
                        result.detected = true;
                        result.language = 'en-SG';
                        result.country = 'Singapore';
                        result.confidence = 0.95;
                        result.market = 'primary';
                    }
                    // Mexico: roughly 14°N to 33°N, 118°W to 86°W
                    else if (latitude >= 14 && latitude <= 33 && longitude >= -118 && longitude <= -86) {
                        result.detected = true;
                        result.language = 'es-MX';
                        result.country = 'Mexico';
                        result.confidence = 0.8;
                        result.market = 'supplier';
                    }
                    // Malaysia: 1°N to 7°N, 100°E to 119°E
                    else if (latitude >= 1 && latitude <= 7 && longitude >= 100 && longitude <= 119) {
                        result.detected = true;
                        result.language = 'en-SG';
                        result.country = 'Malaysia';
                        result.confidence = 0.7;
                        result.market = 'regional';
                    }
                    // Indonesia: 11°S to 6°N, 95°E to 141°E
                    else if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
                        result.detected = true;
                        result.language = 'en-SG';
                        result.country = 'Indonesia';
                        result.confidence = 0.6;
                        result.market = 'regional';
                    }
                    // Philippines: 4°N to 21°N, 116°E to 127°E
                    else if (latitude >= 4 && latitude <= 21 && longitude >= 116 && longitude <= 127) {
                        result.detected = true;
                        result.language = 'en-SG';
                        result.country = 'Philippines';
                        result.confidence = 0.7;
                        result.market = 'regional';
                    }
                    // Thailand: 5°N to 21°N, 97°E to 106°E
                    else if (latitude >= 5 && latitude <= 21 && longitude >= 97 && longitude <= 106) {
                        result.detected = true;
                        result.language = 'en-SG';
                        result.country = 'Thailand';
                        result.confidence = 0.6;
                        result.market = 'regional';
                    }
                    
                    resolve(result);
                },
                (error) => {
                    clearTimeout(timeout);
                    result.error = `Geolocation error: ${error.message}`;
                    resolve(result);
                },
                { 
                    timeout: 3000, 
                    enableHighAccuracy: false,
                    maximumAge: 600000 // 10 minutes cache for Singapore market
                }
            );
        });
    }

    /**
     * Normalize browser language code (Singapore market focused)
     * @private
     */
    _normalizeBrowserLanguage(browserLang) {
        const normalized = {
            original: browserLang,
            full: null,
            base: null,
            region: null
        };
        
        try {
            const clean = browserLang.toLowerCase().replace('_', '-');
            const parts = clean.split('-');
            
            normalized.base = parts[0];
            normalized.region = parts[1];
            
            // Handle language mappings for Singapore market
            if (normalized.base === 'es') {
                // All Spanish variants to Mexican Spanish (supplier market)
                normalized.full = 'es-MX';
            } else if (normalized.base === 'en') {
                // All English variants to British English (Singapore standard)
                normalized.full = 'en-SG';
            } else {
                normalized.full = normalized.base;
            }
            
        } catch (error) {
            console.warn('Error normalizing browser language:', browserLang, error);
        }
        
        return normalized;
    }

    /**
     * Normalize any language code to supported format
     * @private
     */
    _normalizeLanguageCode(langCode) {
        if (!langCode) return null;
        
        const clean = langCode.toLowerCase().replace('_', '-');
        const parts = clean.split('-');
        const base = parts[0];
        
        // Map to our supported languages for Singapore market
        if (base === 'es') {
            return 'es-MX';
        } else if (base === 'en') {
            return 'en-SG';
        }
        
        // Return as-is if it's already supported
        if (this.supportedLanguages.includes(clean)) {
            return clean;
        }
        
        return null;
    }

    /**
     * Check if stored detection is recent enough to use
     * @private
     */
    _isRecentDetection() {
        try {
            const lastDetection = localStorage.getItem(this.storageKeys.lastDetection);
            if (!lastDetection) return false;
            
            const detectionTime = new Date(lastDetection);
            const now = new Date();
            const daysDiff = (now - detectionTime) / (1000 * 60 * 60 * 24);
            
            // Consider detection recent if less than 30 days old
            return daysDiff < 30;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Store detection result in localStorage
     * @private
     */
    _storeDetection(detectionResult, isUserChoice = false) {
        try {
            localStorage.setItem(this.storageKeys.language, detectionResult.language);
            localStorage.setItem(this.storageKeys.detectionMethod, detectionResult.method || 'unknown');
            localStorage.setItem(this.storageKeys.lastDetection, new Date().toISOString());
            localStorage.setItem(this.storageKeys.userOverride, isUserChoice.toString());
        } catch (error) {
            console.warn('Error storing detection result:', error);
        }
    }

    /**
     * Manually set language preference (user choice)
     */
    setLanguagePreference(language) {
        if (!this.supportedLanguages.includes(language)) {
            throw new Error(`Unsupported language: ${language}. Supported for Singapore market: ${this.supportedLanguages.join(', ')}`);
        }
        
        const result = {
            language: language,
            method: 'manual',
            confidence: 1.0,
            priority: this.detectionPriorities.manual,
            timestamp: new Date().toISOString(),
            market: 'singapore'
        };
        
        this._storeDetection(result, true);
        return result;
    }

    /**
     * Force refresh detection (ignores stored preferences)
     */
    async refreshDetection() {
        try {
            this.clearPreferences();
            return await this.detectLanguage({ checkStorage: false });
        } catch (error) {
            console.error('Error refreshing detection:', error);
            return await this.detectLanguage();
        }
    }

    /**
     * Clear all stored preferences
     */
    clearPreferences() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing preferences:', error);
            return false;
        }
    }

    /**
     * Get comprehensive debug information for Singapore market
     */
    getDebugInfo() {
        const debug = {
            market: 'Singapore (Primary), Mexico (Supplier)',
            config: {
                supportedLanguages: this.supportedLanguages,
                defaultLanguage: this.defaultLanguage,
                fallbackLanguage: this.fallbackLanguage,
                singaporeTimezones: this.singaporeTimezones,
                mexicanTimezones: this.mexicanTimezones,
                englishRegionTimezones: this.englishRegionTimezones
            },
            browser: {
                languages: navigator.languages || [navigator.language],
                userAgent: navigator.userAgent,
                timezone: null,
                geolocationSupported: !!navigator.geolocation
            },
            storage: {},
            url: {
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash
            }
        };
        
        try {
            debug.browser.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            debug.browser.timezone = 'unknown';
        }
        
        try {
            Object.keys(this.storageKeys).forEach(key => {
                debug.storage[key.replace('foxtrading_sg_', '')] = localStorage.getItem(this.storageKeys[key]);
            });
        } catch (e) {
            debug.storage.error = 'localStorage not available';
        }
        
        return debug;
    }

    /**
     * Test detection for Singapore market scenarios
     */
    async runDetectionTest() {
        console.log('🇸🇬 Running FoxTrading Singapore Market Language Detection Test...');
        
        const debugInfo = this.getDebugInfo();
        console.log('📋 Singapore Market Environment:', debugInfo);
        
        const result = await this.detectLanguage({ debug: true });
        console.log('🎯 Singapore Market Detection Result:', result);
        
        return { debugInfo, result };
    }

    /**
     * Get current language (convenience method)
     */
    getCurrentLanguage() {
        try {
            return localStorage.getItem(this.storageKeys.language) || this.defaultLanguage;
        } catch {
            return this.defaultLanguage;
        }
    }

    /**
     * Check if language is supported
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }

    /**
     * Get supported languages info for Singapore market
     */
    getSupportedLanguagesInfo() {
        return {
            'en-SG': {
                code: 'en-SG',
                name: 'English (United Kingdom)',
                nativeName: 'English (UK)',
                flag: '🇬🇧',
                direction: 'ltr',
                market: 'Primary (Singapore business language)',
                usage: 'Main website language, business communication'
            },
            'es-MX': {
                code: 'es-MX',
                name: 'Spanish (Mexico)',
                nativeName: 'Español (México)',
                flag: '🇲🇽',
                direction: 'ltr',
                market: 'Supplier (Mexican food exporters)',
                usage: 'Mexican supplier communication, product descriptions'
            }
        };
    }

    /**
     * Get market-specific recommendations
     */
    getMarketRecommendations() {
        return {
            singapore: {
                primaryLanguage: 'en-SG',
                reasoning: 'English is the primary business language in Singapore',
                confidence: 0.95,
                alternatives: []
            },
            mexico: {
                primaryLanguage: 'es-MX',
                reasoning: 'Spanish for Mexican suppliers and product information',
                confidence: 0.9,
                alternatives: ['en-SG']
            },
            regional: {
                primaryLanguage: 'en-SG',
                reasoning: 'English as lingua franca for APAC business',
                confidence: 0.8,
                alternatives: []
            }
        };
    }
}

// Export for both ES6 modules and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageDetector;
} else if (typeof window !== 'undefined') {
    window.LanguageDetector = LanguageDetector;
}