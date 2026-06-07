/**
 * Lazy Loading Module for Performance Optimization
 * Loads non-critical content after hero section for better SEO and site speed
 */
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            // Hero section threshold - start loading when hero is 50% visible
            heroThreshold: 0.5,
            // Image loading threshold - load images when 10% visible
            imageThreshold: 0.1,
            // Section loading threshold
            sectionThreshold: 0.1,
            // Root margin for intersection observer
            rootMargin: '50px 0px',
            // Enable debug logging
            debug: window.location.hostname === 'localhost' || window.location.search.includes('debug=true'),
            ...options
        };

        this.heroSection = null;
        this.sectionsToLazyLoad = [];
        this.imagesToLazyLoad = [];
        this.isHeroVisible = false;
        this.isInitialized = false;
        
        // Performance tracking
        this.performanceMarks = {};
        this.startTime = performance.now();
    }

    /**
     * Initialize lazy loading system
     */
    init() {
        if (this.isInitialized) {
            console.warn('LazyLoader already initialized');
            return;
        }

        this.log('Initializing lazy loading system...');
        
        // Mark performance start
        this.markPerformance('lazyloader_init');

        // Find hero section
        this.heroSection = document.querySelector('#hero-section') || 
                          document.querySelector('.hero-section') ||
                          document.querySelector('section:first-of-type');

        if (!this.heroSection) {
            this.log('Warning: Hero section not found, loading all content immediately');
            this.loadAllContent();
            return;
        }

        // Identify content to lazy load
        this.identifyLazyContent();
        
        // Set up intersection observers
        this.setupObservers();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();

        this.isInitialized = true;
        this.log('Lazy loading initialized successfully');
    }

    /**
     * Identify content that should be lazy loaded
     */
    identifyLazyContent() {
        // Find all sections after hero
        const allSections = document.querySelectorAll('section');
        allSections.forEach((section, index) => {
            if (index > 0) { // Skip hero (first section)
                section.dataset.lazySection = 'true';
                section.classList.add('lazy-section');
                this.sectionsToLazyLoad.push(section);
            }
        });

        // Find images to lazy load (excluding hero section images)
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            // Skip images in hero section and those already loading
            if (!this.heroSection.contains(img) && img.loading !== 'eager') {
                // Store original src and replace with placeholder
                if (img.src && !img.dataset.originalSrc) {
                    img.dataset.originalSrc = img.src;
                    img.dataset.originalSrcset = img.srcset || '';
                    
                    // Create placeholder (1x1 transparent pixel)
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    img.srcset = '';
                    img.classList.add('lazy-image');
                    
                    this.imagesToLazyLoad.push(img);
                }
            }
        });

        // Also handle background images
        const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
        elementsWithBg.forEach(el => {
            if (!this.heroSection.contains(el)) {
                el.classList.add('lazy-bg');
            }
        });

        this.log(`Found ${this.sectionsToLazyLoad.length} sections and ${this.imagesToLazyLoad.length} images to lazy load`);
    }

    /**
     * Setup intersection observers
     */
    setupObservers() {
        // Observer for hero section visibility
        this.heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= this.options.heroThreshold) {
                    if (!this.isHeroVisible) {
                        this.isHeroVisible = true;
                        this.markPerformance('hero_visible');
                        this.log('Hero section is visible, starting lazy loading...');
                        this.startLazyLoading();
                    }
                }
            });
        }, {
            threshold: [this.options.heroThreshold],
            rootMargin: this.options.rootMargin
        });

        // Observer for sections
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadSection(entry.target);
                }
            });
        }, {
            threshold: this.options.sectionThreshold,
            rootMargin: this.options.rootMargin
        });

        // Observer for images
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, {
            threshold: this.options.imageThreshold,
            rootMargin: this.options.rootMargin
        });

        // Start observing hero section
        if (this.heroSection) {
            this.heroObserver.observe(this.heroSection);
        }
    }

    /**
     * Start lazy loading process
     */
    startLazyLoading() {
        // Load critical sections first (about, services)
        this.loadCriticalSections();
        
        // Start observing remaining sections
        this.sectionsToLazyLoad.forEach(section => {
            this.sectionObserver.observe(section);
        });

        // Start observing images
        this.imagesToLazyLoad.forEach(img => {
            this.imageObserver.observe(img);
        });

        // Preload some critical images
        this.preloadCriticalImages();
    }

    /**
     * Load critical sections immediately
     */
    loadCriticalSections() {
        const criticalSectionIds = ['about-section', 'service-section'];
        
        criticalSectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section && section.classList.contains('lazy-section')) {
                this.loadSection(section, true);
            }
        });
    }

    /**
     * Load a section
     */
    loadSection(section, isCritical = false) {
        if (section.dataset.lazyLoaded === 'true') {
            return; // Already loaded
        }

        this.log(`Loading section: ${section.id || section.className}${isCritical ? ' (critical)' : ''}`);
        
        // Mark as loaded
        section.dataset.lazyLoaded = 'true';
        section.classList.remove('lazy-section');
        section.classList.add('lazy-loaded');
        
        // Stop observing this section
        this.sectionObserver.unobserve(section);
        
        // Load images within this section
        const sectionImages = section.querySelectorAll('.lazy-image');
        sectionImages.forEach(img => {
            this.loadImage(img);
        });
        
        // Trigger animation if needed
        this.animateSection(section);
        
        // Mark performance
        this.markPerformance(`section_loaded_${section.id || 'unknown'}`);
    }

    /**
     * Load an image
     */
    loadImage(img) {
        if (img.dataset.lazyLoaded === 'true') {
            return; // Already loaded
        }

        const originalSrc = img.dataset.originalSrc;
        const originalSrcset = img.dataset.originalSrcset;

        if (originalSrc) {
            this.log(`Loading image: ${originalSrc}`);
            
            // Create new image for preloading
            const newImg = new Image();
            
            newImg.onload = () => {
                // Replace placeholder with actual image
                img.src = originalSrc;
                if (originalSrcset) {
                    img.srcset = originalSrcset;
                }
                
                img.classList.remove('lazy-image');
                img.classList.add('lazy-loaded');
                img.dataset.lazyLoaded = 'true';
                
                // Fade in animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
                
                // Stop observing
                this.imageObserver.unobserve(img);
            };
            
            newImg.onerror = () => {
                this.log(`Failed to load image: ${originalSrc}`);
                img.classList.add('lazy-error');
            };
            
            // Start loading
            if (originalSrcset) {
                newImg.srcset = originalSrcset;
            }
            newImg.src = originalSrc;
        }
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        // Preload first few images from projects section
        const projectImages = document.querySelectorAll('#project-section .lazy-image');
        const criticalImages = Array.from(projectImages).slice(0, 3);
        
        criticalImages.forEach(img => {
            this.loadImage(img);
        });
    }

    /**
     * Animate section entrance
     */
    animateSection(section) {
        // Add entrance animation
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
    }

    /**
     * Load all content immediately (fallback)
     */
    loadAllContent() {
        this.log('Loading all content immediately...');
        
        // Load all sections
        this.sectionsToLazyLoad.forEach(section => {
            this.loadSection(section);
        });
        
        // Load all images
        this.imagesToLazyLoad.forEach(img => {
            this.loadImage(img);
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor when page becomes interactive
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.markPerformance('dom_ready');
            });
        }
        
        window.addEventListener('load', () => {
            this.markPerformance('window_load');
            this.logPerformanceMetrics();
        });
        
        // Monitor largest contentful paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.markPerformance('lcp', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }
        }
    }

    /**
     * Mark performance milestone
     */
    markPerformance(name, time = null) {
        this.performanceMarks[name] = time || (performance.now() - this.startTime);
        this.log(`Performance: ${name} at ${this.performanceMarks[name].toFixed(2)}ms`);
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        if (!this.options.debug) return;
        
        console.group('🚀 Lazy Loading Performance Metrics');
        Object.entries(this.performanceMarks).forEach(([name, time]) => {
            console.log(`${name}: ${time.toFixed(2)}ms`);
        });
        console.groupEnd();
    }

    /**
     * Get performance stats
     */
    getPerformanceStats() {
        return {
            marks: { ...this.performanceMarks },
            sectionsLoaded: this.sectionsToLazyLoad.filter(s => s.dataset.lazyLoaded === 'true').length,
            totalSections: this.sectionsToLazyLoad.length,
            imagesLoaded: this.imagesToLazyLoad.filter(img => img.dataset.lazyLoaded === 'true').length,
            totalImages: this.imagesToLazyLoad.length,
            isHeroVisible: this.isHeroVisible
        };
    }

    /**
     * Debug logging
     */
    log(...args) {
        if (this.options.debug) {
            console.log('[LazyLoader]', ...args);
        }
    }

    /**
     * Cleanup observers
     */
    destroy() {
        if (this.heroObserver) {
            this.heroObserver.disconnect();
        }
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        this.log('LazyLoader destroyed');
    }
}

// Export for both ES6 modules and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
} else if (typeof window !== 'undefined') {
    window.LazyLoader = LazyLoader;
}