/**
 * Language Dropdown Functions
 * Handles the language icon dropdown functionality
 */

// Track currently open dropdown
let currentOpenDropdown = null;

/**
 * Toggle language dropdown visibility
 * @param {string} type - Type of dropdown (main, scroll, mobile)
 */
function toggleLanguageDropdown(type = 'navbar', event) {
    console.log('🎯 Language dropdown clicked!', type);
    
    // Stop event propagation
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const dropdownId = `language-dropdown-${type}`;
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) {
        console.warn(`Dropdown ${dropdownId} not found`);
        return;
    }
    
    console.log('🎯 Found dropdown:', dropdown);
    console.log('🎯 Dropdown computed styles BEFORE:', window.getComputedStyle(dropdown));
    
    // Close any other open dropdowns
    if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
        currentOpenDropdown.classList.remove('show');
    }
    
    // Toggle current dropdown
    const isShowing = dropdown.classList.contains('show');
    console.log('🎯 Dropdown currently showing:', isShowing);
    console.log('🎯 Dropdown classes BEFORE:', dropdown.className);
    
    if (isShowing) {
        dropdown.classList.remove('show');
        currentOpenDropdown = null;
        console.log('🎯 Dropdown closed');
    } else {
        dropdown.classList.add('show');
        currentOpenDropdown = dropdown;
        console.log('🎯 Dropdown opened');
        console.log('🎯 Dropdown classes AFTER:', dropdown.className);
        console.log('🎯 Dropdown computed styles AFTER:', window.getComputedStyle(dropdown));
    }
}

/**
 * Change language from dropdown selection
 * @param {string} languageCode - Language code (en-SG, es-MX)
 */
function changeLanguageFromDropdown(languageCode) {
    console.log(`Changing language to: ${languageCode}`);
    
    // Close all dropdowns
    const dropdowns = document.querySelectorAll('.language-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    currentOpenDropdown = null;
    
    // Change language using the app's language system
    if (window.foxTradingApp && typeof window.foxTradingApp.changeLanguage === 'function') {
        window.foxTradingApp.changeLanguage(languageCode);
    } else {
        console.warn('App language system not available');
        // Fallback: reload page with language parameter
        const url = new URL(window.location);
        url.searchParams.set('lang', languageCode);
        window.location.href = url.toString();
    }
}

/**
 * Close dropdown when clicking outside
 */
function handleClickOutside(event) {
    const languageWrappers = document.querySelectorAll('.language-icon-wrapper');
    let clickedInside = false;
    
    languageWrappers.forEach(wrapper => {
        if (wrapper.contains(event.target)) {
            clickedInside = true;
        }
    });
    
    if (!clickedInside && currentOpenDropdown) {
        currentOpenDropdown.classList.remove('show');
        currentOpenDropdown = null;
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {
    if (event.key === 'Escape' && currentOpenDropdown) {
        currentOpenDropdown.classList.remove('show');
        currentOpenDropdown = null;
    }
}

/**
 * Initialize dropdown event listeners
 */
function initLanguageDropdown() {
    console.log('🎯 Initializing language dropdown...');
    
    // Add click outside listener
    document.addEventListener('click', handleClickOutside);
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Wait a bit for DOM to be fully ready, then add event listeners
    setTimeout(() => {
        const languageButtons = document.querySelectorAll('.language-icon-btn');
        console.log('🎯 Found language buttons:', languageButtons.length);
        
        languageButtons.forEach((button, index) => {
            console.log(`🎯 Adding event listener to button ${index}:`, button);
            
            // Remove any existing onclick to avoid conflicts
            button.removeAttribute('onclick');
            
            button.addEventListener('click', function(event) {
                console.log('🎯 DIRECT click event fired on button!', event);
                event.stopPropagation();
                event.preventDefault();
                
                // Determine type based on button location
                let type = 'navbar';
                if (button.classList.contains('mobile-menu')) {
                    type = 'mobile';
                }
                
                console.log('🎯 Calling toggleLanguageDropdown with type:', type);
                toggleLanguageDropdown(type, event);
            });
            
            // Also add mousedown event as backup
            button.addEventListener('mousedown', function(event) {
                console.log('🎯 MOUSEDOWN event fired!', event);
            });
        });
        
        // Also set up language option click handlers
        const languageOptions = document.querySelectorAll('.language-option');
        console.log('🎯 Found language options:', languageOptions.length);
        
        languageOptions.forEach((option, index) => {
            console.log(`🎯 Adding event listener to option ${index}:`, option);
            option.removeAttribute('onclick');
            
            option.addEventListener('click', function(event) {
                console.log('🎯 Language option clicked!', option);
                const langCode = option.textContent.includes('English') ? 'en-SG' : 'es-MX';
                changeLanguageFromDropdown(langCode);
            });
        });
        
    }, 500);
    
    // Update current language display when language changes
    if (window.foxTradingApp && window.foxTradingApp.i18n) {
        // Listen for language changes if available
        console.log('Language dropdown initialized with foxTradingApp');
    }
    
    console.log('Language dropdown initialization complete');
}

/**
 * Update the current language display in dropdowns
 */
function updateLanguageDisplay() {
    // This will be called when language changes to update any visual indicators
    console.log('Language display updated');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageDropdown);
} else {
    initLanguageDropdown();
}

// Export functions for global access
window.toggleLanguageDropdown = toggleLanguageDropdown;
window.changeLanguageFromDropdown = changeLanguageFromDropdown;