/**
 * Main Application Module
 * Initializes and coordinates the i18n system
 */
class FoxTradingApp {
    constructor() {
        this.i18n = null;
        this.detector = null;
        this.lazyLoader = null;
        this.isInitialized = false;
        this.debug = window.location.hostname === 'localhost' || window.location.search.includes('debug=true') || true; // Force debug for now
        
        // Configuration
        this.config = {
            supportedLanguages: ['en-SG', 'es-MX'],
            defaultLanguage: 'en-SG',
            fallbackLanguage: 'en-SG',
            basePath: '/locales/',
            autoInit: true,
            enableLazyLoading: true
        };
        
        // Flag emoji mapping
        this.flags = {
            'en-SG': '🇬🇧',
            'es-MX': '🇲🇽'
        };
        
        // Language names
        this.languageNames = {
            'en-SG': 'English',
            'es-MX': 'Español'
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            if (this.isInitialized) {
                console.warn('FoxTradingApp already initialized');
                return;
            }

            this.log('Initializing FoxTrading App...');

            // Initialize language detector
            this.detector = new LanguageDetector({
                supportedLanguages: this.config.supportedLanguages,
                defaultLanguage: this.config.defaultLanguage,
                fallbackLanguage: this.config.fallbackLanguage
            });

            // Detect initial language
            const detection = await this.detector.detectLanguage();
            this.log('Language detection result:', detection);
            console.log('🔍 FULL URL ANALYSIS:', {
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
                href: window.location.href
            });

            // Initialize i18n system
            this.i18n = new I18n({
                supportedLanguages: this.config.supportedLanguages,
                defaultLanguage: detection.language,
                fallbackLanguage: this.config.fallbackLanguage,
                basePath: this.config.basePath
            });

            // Set up event listeners
            this.setupEventListeners();

            // Initialize i18n
            await this.i18n.init();

            // If language was detected from URL, ensure it's applied
            if (detection.method === 'path' && detection.language !== this.config.defaultLanguage) {
                this.log(`Applying URL-detected language: ${detection.language}`);
                await this.i18n.setLanguage(detection.language);
            }

            // Add translation attributes to HTML
            this.addTranslationAttributes();

            // Create and setup language selector
            this.createLanguageSelector();

            // Force initial translation update for debug
            if (this.debug) {
                setTimeout(() => {
                    this.log('Debug: Forcing initial translation update');
                    this.i18n.updatePage();
                }, 1000);
            }

            // Setup form handlers
            this.setupFormHandlers();

            // Initialize lazy loading for performance
            if (this.config.enableLazyLoading) {
                this.initializeLazyLoading();
            }

            // Preload other language for better UX
            this.preloadLanguages();

            // Mark as initialized
            this.isInitialized = true;

            this.log('FoxTrading App initialized successfully');

            // Analytics/tracking
            this.trackLanguageUsage(detection);

        } catch (error) {
            console.error('Failed to initialize FoxTrading App:', error);
            
            // Fallback initialization
            this.initializeFallback();
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen to i18n events
        this.i18n.on('ready', (data) => {
            this.log('i18n ready:', data);
            this.updateLanguageDisplay();
        });

        this.i18n.on('languageChanged', (data) => {
            this.log('Language changed:', data);
            this.updateLanguageDisplay();
            this.updateURL(data.current);
            this.trackLanguageChange(data);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleURLChange();
        });

        // Handle page visibility for analytics
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackSessionEnd();
            }
        });
    }

    /**
     * Create language selector UI
     */
    createLanguageSelector() {
        // Remove old language selector if exists
        this.removeOldLanguageSelector();

        const createSelectors = () => {
            // Desktop selector - insert before book-call-wrapper
            const bookCallWrapper = document.querySelector('.book-call-wrapper:not(.is-mobile)');
            if (bookCallWrapper) {
                const desktopSelector = this.createLanguageSelectorElement('desktop');
                bookCallWrapper.parentNode.insertBefore(desktopSelector, bookCallWrapper);
                this.log('Desktop language selector created');
            }

            // Mobile selector already exists in HTML, just update it
            this.updateLanguageDisplay();
        };

        // Execute immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createSelectors);
        } else {
            setTimeout(createSelectors, 100);
        }
        
        this.log('Language selector creation initiated');
    }

    /**
     * Create language selector element
     */
    createLanguageSelectorElement(type) {
        const container = document.createElement('div');
        container.className = `language-selector ${type === 'mobile' ? 'mobile' : 'desktop'}`;
        
        const select = document.createElement('select');
        select.id = type === 'mobile' ? 'language-dropdown-mobile' : 'language-dropdown-desktop';
        select.className = 'language-selector-dropdown';
        select.setAttribute('aria-label', 'Select Language');

        // Add options
        this.config.supportedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = `${this.flags[lang]} ${this.languageNames[lang]}`;
            select.appendChild(option);
        });

        // Set current language
        if (this.i18n) {
            select.value = this.i18n.getCurrentLanguage();
        }

        // Event handling
        const handleChange = (event) => {
            console.log('🎯 Language selector CHANGE event!', event.target.value);
            const newLanguage = event.target.value;
            if (newLanguage && newLanguage !== this.i18n?.getCurrentLanguage()) {
                this.log(`Language selector changed to: ${newLanguage}`);
                setTimeout(() => {
                    this.handleLanguageChange(newLanguage, 'manual');
                }, 10);
            }
        };
        
        // Add multiple event listeners for reliability
        select.onchange = handleChange;
        select.addEventListener('change', handleChange);
        select.addEventListener('input', handleChange);
        
        // Debug events
        select.addEventListener('click', (e) => {
            console.log('🎯 Language selector CLICKED!', e);
        });
        select.addEventListener('focus', () => console.log('🎯 Language selector FOCUSED'));
        select.addEventListener('mousedown', (e) => {
            console.log('🎯 Language selector MOUSEDOWN', e);
        });

        container.appendChild(select);
        
        this.log(`Created ${type} language selector with options:`, this.config.supportedLanguages);
        console.log('🎯 Language selector element:', container);
        return container;
    }

    /**
     * Remove old language selector
     */
    removeOldLanguageSelector() {
        const selectors = document.querySelectorAll('.language-selector');
        selectors.forEach(selector => selector.remove());
    }

    /**
     * Handle language change
     */
    async handleLanguageChange(newLanguage, method = 'unknown') {
        try {
            this.log(`Changing language to ${newLanguage} via ${method}`);
            
            if (!this.isInitialized) {
                this.log('App not initialized yet, skipping language change');
                return;
            }

            if (!this.config.supportedLanguages.includes(newLanguage)) {
                this.log(`Unsupported language: ${newLanguage}`);
                return;
            }

            // Store user preference
            if (this.detector) {
                this.detector.setLanguagePreference(newLanguage);
            }
            
            // Change language in i18n system
            if (this.i18n) {
                await this.i18n.setLanguage(newLanguage);
                this.log(`Language changed successfully to ${newLanguage}`);
                
                // Update URL to reflect language change
                this.updateURL(newLanguage);
            } else {
                this.log('i18n system not available');
            }
            
        } catch (error) {
            console.error('Error changing language:', error);
            this.showLanguageError(error);
        }
    }

    /**
     * Update language display
     */
    updateLanguageDisplay() {
        const currentLang = this.i18n.getCurrentLanguage();
        
        // Update dropdowns
        const selectors = document.querySelectorAll('#language-dropdown, #language-dropdown-mobile');
        selectors.forEach(selector => {
            if (selector) {
                selector.value = currentLang;
            }
        });

        // Add language indicator to body for CSS targeting
        document.body.className = document.body.className.replace(/\blang-\w+/g, '');
        document.body.classList.add(`lang-${currentLang}`);
    }

    /**
     * Update URL with language path
     */
    updateURL(language) {
        try {
            const currentPath = window.location.pathname;
            const targetPath = language === this.config.defaultLanguage ? '/' : `/${language}`;
            
            // Only redirect if we're not already on the correct path
            if (currentPath !== targetPath) {
                this.log(`Updating URL from ${currentPath} to ${targetPath}`);
                
                // Use history.pushState for better UX instead of hard redirect
                if (history && history.pushState) {
                    history.pushState(null, '', targetPath);
                } else {
                    window.location.href = targetPath;
                }
            }
            
        } catch (error) {
            console.warn('Error updating URL:', error);
        }
    }

    /**
     * Handle URL changes (back/forward navigation)
     */
    async handleURLChange() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            
            if (urlLang && urlLang !== this.i18n.getCurrentLanguage()) {
                await this.handleLanguageChange(urlLang, 'url_navigation');
            }
            
        } catch (error) {
            console.warn('Error handling URL change:', error);
        }
    }

    /**
     * Preload other languages for better UX
     */
    async preloadLanguages() {
        try {
            const currentLang = this.i18n.getCurrentLanguage();
            const otherLangs = this.config.supportedLanguages.filter(lang => lang !== currentLang);
            
            if (otherLangs.length > 0) {
                this.log('Preloading languages:', otherLangs);
                await this.i18n.preloadTranslations(otherLangs);
                this.log('Languages preloaded successfully');
            }
            
        } catch (error) {
            this.log('Error preloading languages:', error);
        }
    }

    /**
     * Setup form handlers with i18n support
     */
    setupFormHandlers() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        });

        // Setup modal form if exists
        const modal = document.getElementById('modal');
        if (modal) {
            this.setupModalForm(modal);
        }
    }

    /**
     * Handle form submission with i18n messages
     */
    async handleFormSubmit(event) {
        try {
            // Add form validation and submission logic here
            // Show success/error messages using i18n
            
            const form = event.target;
            const formData = new FormData(form);
            
            // Example: Show loading message
            this.showMessage(this.i18n.t('form.processing', {}, 'Please wait...'));
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(this.i18n.t('form.error'), 'error');
        }
    }

    /**
     * Setup modal form
     */
    setupModalForm(modal) {
        const openButtons = document.querySelectorAll('[data-modal="open"]');
        const closeButtons = modal.querySelectorAll('[data-modal="close"], .close-modal');
        
        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    /**
     * Open modal
     */
    openModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create or update notification
        let notification = document.getElementById('foxtrading-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'foxtrading-notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Show language error
     */
    showLanguageError(error) {
        const message = this.i18n.t('errors.languageChange', {}, 'Failed to change language. Please try again.');
        this.showMessage(message, 'error');
    }

    /**
     * Initialize fallback (minimal functionality)
     */
    initializeFallback() {
        console.warn('Initializing fallback mode');
        
        // Set default language
        document.documentElement.lang = this.config.defaultLanguage;
        
        // Create basic language selector
        this.createBasicLanguageSelector();
        
        this.isInitialized = true;
    }

    /**
     * Create basic language selector for fallback
     */
    createBasicLanguageSelector() {
        // Language selector disabled - no fallback selector needed
        this.log('Basic language selector disabled');
        return;
    }

    /**
     * Track language usage for analytics
     */
    trackLanguageUsage(detection) {
        if (!this.debug) return;
        
        try {
            const analytics = {
                language: detection.language,
                method: detection.method,
                confidence: detection.confidence,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            
            this.log('Language usage:', analytics);
            
            // Here you would send to your analytics service
            // Example: gtag('event', 'language_detected', analytics);
            
        } catch (error) {
            console.warn('Error tracking language usage:', error);
        }
    }

    /**
     * Track language change
     */
    trackLanguageChange(data) {
        if (!this.debug) return;
        
        try {
            const analytics = {
                from: data.previous,
                to: data.current,
                timestamp: new Date().toISOString()
            };
            
            this.log('Language change:', analytics);
            
        } catch (error) {
            console.warn('Error tracking language change:', error);
        }
    }

    /**
     * Track session end
     */
    trackSessionEnd() {
        if (!this.debug) return;
        
        try {
            const analytics = {
                language: this.i18n ? this.i18n.getCurrentLanguage() : 'unknown',
                duration: Date.now() - this.startTime,
                timestamp: new Date().toISOString()
            };
            
            this.log('Session end:', analytics);
            
        } catch (error) {
            console.warn('Error tracking session end:', error);
        }
    }

    /**
     * Add translation attributes to HTML elements
     */
    addTranslationAttributes() {
        try {
            this.log('Adding translation attributes to HTML elements...');

            // Navigation links
            const navSelectors = [
                { selector: 'a[href="#hero-section"]', key: 'nav.home' },
                { selector: 'a[href="#about-section"]', key: 'nav.about' },
                { selector: 'a[href="#service-section"]', key: 'nav.services' },
                { selector: 'a[href="#project-section"]', key: 'nav.project' },
                { selector: 'a[href="#testimonial-section"]', key: 'nav.testimonial' },
                { selector: 'a[href="#team-section"]', key: 'nav.team' },
                { selector: 'a[href="#faq-section"]', key: 'nav.faq' }
            ];

            navSelectors.forEach(({selector, key}) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.setAttribute('data-i18n', key));
            });

            // Hero section
            const heroTitle = document.querySelector('.hero-titile-text');
            if (heroTitle) heroTitle.setAttribute('data-i18n', 'hero.title');

            const heroSubtitle = document.querySelector('.hero-sub-title');
            if (heroSubtitle) heroSubtitle.setAttribute('data-i18n', 'hero.subtitle');

            const brandTitle = document.querySelector('.brand-partner-title');
            if (brandTitle) brandTitle.setAttribute('data-i18n', 'hero.toolsPartners');

            // About section
            const aboutLabel = document.querySelector('#about-section .sub-label-section');
            if (aboutLabel) aboutLabel.setAttribute('data-i18n', 'about.label');

            const aboutTitle = document.querySelector('.title-about-us');
            if (aboutTitle) aboutTitle.setAttribute('data-i18n', 'about.title');

            const aboutDesc = document.querySelector('.desription-about-us');
            if (aboutDesc) aboutDesc.setAttribute('data-i18n', 'about.description');

            // About stats
            const stats = [
                { selector: '.amount-categoty', keys: ['about.established', 'about.workAcross', 'about.over'] },
                { selector: '.amount-type', keys: ['about.years', 'about.countries', 'about.projects'] }
            ];

            stats.forEach(({selector, keys}) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el, index) => {
                    if (keys[index]) {
                        el.setAttribute('data-i18n', keys[index]);
                    }
                });
            });

            // Services section
            const servicesLabel = document.querySelector('#service-section .sub-label-section');
            if (servicesLabel) servicesLabel.setAttribute('data-i18n', 'services.label');

            // Service tabs - need to map each service
            const serviceTitles = document.querySelectorAll('.benefit-title');
            const serviceKeys = ['services.nutsSeeds.title', 'services.citrusFruits.title', 'services.berriesVegetables.title', 'services.avocadoSpecialty.title'];
            serviceTitles.forEach((title, index) => {
                if (serviceKeys[index]) {
                    title.setAttribute('data-i18n', serviceKeys[index]);
                }
            });

            const serviceDescs = document.querySelectorAll('.benefit-desc');
            const serviceDescKeys = ['services.nutsSeeds.description', 'services.citrusFruits.description', 'services.berriesVegetables.description', 'services.avocadoSpecialty.description'];
            serviceDescs.forEach((desc, index) => {
                if (serviceDescKeys[index]) {
                    desc.setAttribute('data-i18n', serviceDescKeys[index]);
                }
            });

            // Service facts and stats in detail cards
            const serviceFacts = document.querySelectorAll('.benefit-wrapper-content .paragraph-body-3');
            const serviceFactKeys = ['services.nutsSeeds.fact', 'services.citrusFruits.fact', 'services.berriesVegetables.fact', 'services.avocadoSpecialty.fact'];
            serviceFacts.forEach((fact, index) => {
                if (serviceFactKeys[index]) {
                    fact.setAttribute('data-i18n', serviceFactKeys[index]);
                }
            });

            // Service stat values and labels
            const serviceStatValues = document.querySelectorAll('.benefit-amount-text');
            const serviceStatLabels = document.querySelectorAll('.benefit-value');
            // These are complex nested elements, let's add specific mapping for each service

            // Projects section
            const projectsLabel = document.querySelector('#project-section .sub-label-section');
            if (projectsLabel) projectsLabel.setAttribute('data-i18n', 'projects.label');

            const projectsTitle = document.querySelector('#project-section .title-section');
            if (projectsTitle) projectsTitle.setAttribute('data-i18n', 'projects.title');

            // Project titles and descriptions
            const projectTitles = document.querySelectorAll('.title-project');
            const projectKeys = ['projects.project1.title', 'projects.project2.title', 'projects.project3.title'];
            projectTitles.forEach((title, index) => {
                if (projectKeys[index]) {
                    title.setAttribute('data-i18n', projectKeys[index]);
                }
            });

            const projectDescs = document.querySelectorAll('.description-project');
            const projectDescKeys = ['projects.project1.description', 'projects.project2.description', 'projects.project3.description'];
            projectDescs.forEach((desc, index) => {
                if (projectDescKeys[index]) {
                    desc.setAttribute('data-i18n', projectDescKeys[index]);
                }
            });

            // Project specifications
            const specTitles = document.querySelectorAll('.title-spesification');
            const specKeys = ['projects.project1.totalArea', 'projects.project1.totalRoom', 'projects.project1.dateOfBuild'];
            specTitles.forEach((spec, index) => {
                if (specKeys[index]) {
                    spec.setAttribute('data-i18n', specKeys[index]);
                }
            });

            // Project specification values 
            const specValues = document.querySelectorAll('.value-spesification');
            const specValueKeys = ['projects.project1.area', 'projects.project1.rooms', 'projects.project1.date', 
                                   'projects.project2.area', 'projects.project2.rooms', 'projects.project2.date',
                                   'projects.project3.area', 'projects.project3.rooms', 'projects.project3.date'];
            specValues.forEach((value, index) => {
                if (specValueKeys[index]) {
                    value.setAttribute('data-i18n', specValueKeys[index]);
                }
            });

            // Project type labels (product category names)
            const projectTypes = document.querySelectorAll('.project-type-text');
            const projectTypeKeys = ['projects.avocado', 'projects.pecan', 'projects.mango', 'projects.berries'];
            projectTypes.forEach((type, index) => {
                if (projectTypeKeys[index]) {
                    type.setAttribute('data-i18n', projectTypeKeys[index]);
                }
            });

            // Testimonials section
            const testimonialsLabel = document.querySelector('#testimonial-section .sub-label-section');
            if (testimonialsLabel) testimonialsLabel.setAttribute('data-i18n', 'testimonials.label');

            const testimonialsTitle = document.querySelector('#testimonial-section .title-section');
            if (testimonialsTitle) testimonialsTitle.setAttribute('data-i18n', 'testimonials.title');

            // Testimonial texts and authors
            const testimonialTexts = document.querySelectorAll('.testimonial-text');
            const testimonialKeys = ['testimonials.testimonial1.text', 'testimonials.testimonial2.text', 'testimonials.testimonial3.text'];
            testimonialTexts.forEach((text, index) => {
                if (testimonialKeys[index]) {
                    text.setAttribute('data-i18n', testimonialKeys[index]);
                }
            });

            const testimonialNames = document.querySelectorAll('.testimonial-name');
            const testimonialNameKeys = ['testimonials.testimonial1.author', 'testimonials.testimonial2.author', 'testimonials.testimonial3.author'];
            testimonialNames.forEach((name, index) => {
                if (testimonialNameKeys[index]) {
                    name.setAttribute('data-i18n', testimonialNameKeys[index]);
                }
            });

            // Team section
            const teamLabel = document.querySelector('#team-section .sub-label-section');
            if (teamLabel) teamLabel.setAttribute('data-i18n', 'team.label');

            const teamTitle = document.querySelector('#team-section .title-section');
            if (teamTitle) teamTitle.setAttribute('data-i18n', 'team.title');

            // Team member names and positions
            const teamNames = document.querySelectorAll('.team-name');
            const teamNameKeys = ['team.member1.name', 'team.member2.name', 'team.member3.name', 'team.member4.name'];
            teamNames.forEach((name, index) => {
                if (teamNameKeys[index]) {
                    name.setAttribute('data-i18n', teamNameKeys[index]);
                }
            });

            const teamPositions = document.querySelectorAll('.team-position');
            const teamPositionKeys = ['team.member1.position', 'team.member2.position', 'team.member3.position', 'team.member4.position'];
            teamPositions.forEach((position, index) => {
                if (teamPositionKeys[index]) {
                    position.setAttribute('data-i18n', teamPositionKeys[index]);
                }
            });

            const teamDescriptions = document.querySelectorAll('.team-description');
            const teamDescKeys = ['team.member1.description', 'team.member2.description', 'team.member3.description', 'team.member4.description'];
            teamDescriptions.forEach((desc, index) => {
                if (teamDescKeys[index]) {
                    desc.setAttribute('data-i18n', teamDescKeys[index]);
                }
            });

            // FAQ section
            const faqLabel = document.querySelector('#faq-section .sub-label-section');
            if (faqLabel) faqLabel.setAttribute('data-i18n', 'faq.label');

            // FAQ questions and answers
            const faqQuestions = document.querySelectorAll('.title-question');
            const faqKeys = ['faq.q1.question', 'faq.q2.question', 'faq.q3.question', 'faq.q4.question'];
            faqQuestions.forEach((question, index) => {
                if (faqKeys[index]) {
                    question.setAttribute('data-i18n', faqKeys[index]);
                }
            });

            const faqAnswers = document.querySelectorAll('.answer-text');
            const faqAnswerKeys = ['faq.q1.answer', 'faq.q2.answer', 'faq.q3.answer', 'faq.q4.answer'];
            faqAnswers.forEach((answer, index) => {
                if (faqAnswerKeys[index]) {
                    answer.setAttribute('data-i18n', faqAnswerKeys[index]);
                }
            });

            // Let's meet! buttons
            const bookCallButtons = document.querySelectorAll('.button-book-a-call div');
            bookCallButtons.forEach(btn => btn.setAttribute('data-i18n', 'nav.bookCall'));

            // Footer
            const footerLinks = document.querySelectorAll('.footer-link');
            const footerKeys = ['footer.changelog', 'footer.styleGuide', 'footer.licence'];
            footerLinks.forEach((link, index) => {
                if (footerKeys[index]) {
                    link.setAttribute('data-i18n', footerKeys[index]);
                }
            });

            const copyright = document.querySelector('.copyright-footer');
            if (copyright) copyright.setAttribute('data-i18n', 'footer.rights');

            this.log('Translation attributes added successfully to ALL sections');

        } catch (error) {
            console.error('Error adding translation attributes:', error);
        }
    }

    /**
     * Initialize lazy loading system
     */
    initializeLazyLoading() {
        try {
            this.log('Initializing lazy loading system...');
            
            // Check if LazyLoader is available
            if (typeof LazyLoader === 'undefined') {
                this.log('LazyLoader not available, skipping lazy loading initialization');
                return;
            }
            
            this.lazyLoader = new LazyLoader({
                debug: this.debug
            });
            
            this.lazyLoader.init();
            this.log('Lazy loading initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize lazy loading:', error);
            this.log('Continuing without lazy loading...');
            // Continue without lazy loading
        }
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentLanguage: this.i18n ? this.i18n.getCurrentLanguage() : null,
            supportedLanguages: this.config.supportedLanguages,
            detectorInfo: this.detector ? this.detector.getDebugInfo() : null,
            i18nStats: this.i18n ? this.i18n.getCacheStats() : null,
            lazyLoaderStats: this.lazyLoader ? this.lazyLoader.getPerformanceStats() : null
        };
    }

    /**
     * Log debug information
     */
    log(...args) {
        if (this.debug) {
            console.log('[FoxTradingApp]', ...args);
        }
    }

    /**
     * Public API for manual language change
     */
    async changeLanguage(language) {
        return this.handleLanguageChange(language, 'api');
    }

    /**
     * Public API to get current language
     */
    getCurrentLanguage() {
        return this.i18n ? this.i18n.getCurrentLanguage() : this.config.defaultLanguage;
    }

    /**
     * Public API to translate text
     */
    translate(key, params) {
        return this.i18n ? this.i18n.translate(key, params) : key;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.foxTradingApp = new FoxTradingApp();
        window.app = window.foxTradingApp; // Compatibility alias
        await window.foxTradingApp.init();
    } catch (error) {
        console.error('Failed to initialize FoxTrading App:', error);
    }
});

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FoxTradingApp;
} else if (typeof window !== 'undefined') {
    window.FoxTradingApp = FoxTradingApp;
}