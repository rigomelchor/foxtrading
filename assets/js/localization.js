// Localization System for FoxTrading
class LocalizationManager {
    constructor() {
        this.currentLanguage = 'en-SG';
        this.translations = {};
        this.supportedLanguages = ['en-SG', 'es-MX'];
        this.init();
    }

    async init() {
        // Load saved language preference or detect user location
        this.currentLanguage = this.getInitialLanguage();
        
        // Load translations
        await this.loadTranslations();
        
        // Apply translations
        this.applyTranslations();
        
        // Initialize language dropdown
        this.initializeDropdown();
        
        // Set HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    getInitialLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }

        // Check if user is from Mexico (using timezone as a proxy)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone && timezone.includes('Mexico')) {
            return 'es-MX';
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            if (browserLang.startsWith('es') && browserLang.includes('MX')) {
                return 'es-MX';
            }
            // Check for Spanish speakers who might prefer Spanish
            if (browserLang.startsWith('es')) {
                // Optional: You could return 'es-MX' here if you want all Spanish speakers to see Spanish
                // return 'es-MX';
            }
        }

        // Default to English
        return 'en-SG';
    }

    async loadTranslations() {
        try {
            // Load both language files
            const enResponse = await fetch('/assets/lang/en-SG.json');
            const esResponse = await fetch('/assets/lang/es-MX.json');
            
            this.translations['en-SG'] = await enResponse.json();
            this.translations['es-MX'] = await esResponse.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to embedded translations if files don't load
            this.loadFallbackTranslations();
        }
    }

    loadFallbackTranslations() {
        // Embedded fallback translations
        this.translations['en-SG'] = {
            "nav": {
                "home": "Home",
                "about": "About",
                "services": "Services",
                "project": "Project",
                "testimonial": "Testimonial",
                "faq": "FAQs",
                "bookCall": "Let's meet!"
            },
            "hero": {
                "title": "Let's bring your dream building to life!",
                "subtitle": "Our skilled team offers tailored solutions for all your construction needs. Get the support you require today!"
            },
            "about": {
                "label": "ABOUT US",
                "title": "At Foxtrading, our passionate team of architects and designers is dedicated to turning your visions into breathtaking spaces.",
                "description": "From concept to completion, we blend creativity, functionality, and precision in every project. At Foxtrading, your space isn't just built — it's thoughtfully crafted to inspire, impress, and endure.",
                "established": "Established for",
                "workAcross": "Work across",
                "over": "Over",
                "years": "Years",
                "countries": "Countries",
                "projects": "Projects"
            }
        };

        this.translations['es-MX'] = {
            "nav": {
                "home": "Inicio",
                "about": "Nosotros",
                "services": "Servicios",
                "project": "Proyectos",
                "testimonial": "Testimonios",
                "team": "Equipo",
                "faq": "Preguntas Frecuentes",
                "bookCall": "Agendar llamada"
            },
            "hero": {
                "title": "¡Hagamos realidad el edificio de tus sueños!",
                "subtitle": "Nuestro equipo especializado ofrece soluciones personalizadas para todas tus necesidades de construcción. ¡Obtén el apoyo que necesitas hoy!"
            },
            "about": {
                "label": "ACERCA DE NOSOTROS",
                "title": "En Foxtrading, nuestro apasionado equipo de arquitectos y diseñadores está dedicado a convertir tus visiones en espacios impresionantes.",
                "description": "Desde el concepto hasta la finalización, combinamos creatividad, funcionalidad y precisión en cada proyecto. En Foxtrading, tu espacio no solo se construye, se elabora cuidadosamente para inspirar, impresionar y perdurar.",
                "established": "Establecidos desde hace",
                "workAcross": "Trabajamos en",
                "over": "Más de",
                "years": "Años",
                "countries": "Países",
                "projects": "Proyectos"
            }
        };
    }

    applyTranslations() {
        const lang = this.translations[this.currentLanguage];
        if (!lang) return;

        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedProperty(lang, key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.placeholder) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update language dropdown display
        this.updateDropdownDisplay();
    }

    getNestedProperty(obj, key) {
        return key.split('.').reduce((o, k) => o && o[k], obj);
    }

    initializeDropdown() {
        // Create language dropdown if it doesn't exist - COMMENTED OUT FOR NOW
        // const existingDropdown = document.getElementById('language-dropdown');
        // if (!existingDropdown) {
        //     this.createDropdown();
        // }

        // Add event listeners - COMMENTED OUT FOR NOW
        // const dropdown = document.getElementById('language-dropdown');
        // if (dropdown) {
        //     dropdown.addEventListener('change', (e) => {
        //         this.changeLanguage(e.target.value);
        //     });
        // }
    }

    // createDropdown() - COMMENTED OUT FOR NOW
    /*
    createDropdown() {
        // Find the navigation menu
        const bookCallWrapper = document.querySelector('.book-call-wrapper');
        if (bookCallWrapper) {
            // Create dropdown container
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'language-selector';
            dropdownContainer.innerHTML = `
                <select id="language-dropdown" class="lang-dropdown">
                    <option value="en-SG">🇬🇧 English (UK)</option>
                    <option value="es-MX">🇲🇽 Español (MX)</option>
                </select>
            `;
            
            // Insert before book call button
            bookCallWrapper.parentNode.insertBefore(dropdownContainer, bookCallWrapper);

            // Also add to mobile menu
            const mobileBookCall = document.querySelector('.book-call-wrapper.is-mobile');
            if (mobileBookCall) {
                const mobileDropdown = dropdownContainer.cloneNode(true);
                mobileDropdown.querySelector('select').id = 'language-dropdown-mobile';
                mobileBookCall.parentNode.insertBefore(mobileDropdown, mobileBookCall);
                
                // Add event listener to mobile dropdown
                mobileDropdown.querySelector('select').addEventListener('change', (e) => {
                    this.changeLanguage(e.target.value);
                });
            }
        }
    }
    */

    updateDropdownDisplay() {
        const dropdowns = document.querySelectorAll('#language-dropdown, #language-dropdown-mobile');
        dropdowns.forEach(dropdown => {
            if (dropdown) {
                dropdown.value = this.currentLanguage;
            }
        });
    }

    changeLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            document.documentElement.lang = lang;
            this.applyTranslations();
            
            // Trigger custom event for other scripts that might need to know
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        }
    }

    // Public method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Public method to get translation
    translate(key) {
        const lang = this.translations[this.currentLanguage];
        return this.getNestedProperty(lang, key) || key;
    }
}

// Initialize localization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.localizationManager = new LocalizationManager();
    });
} else {
    window.localizationManager = new LocalizationManager();
}