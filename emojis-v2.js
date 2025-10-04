/**
 * Modern emoji integration - replaces ASP + JSONP approach
 * Uses dynamic import to load emojis-modern.mjs
 */

// Global emojis object for backward compatibility
var emojis = {
    emojisJSON: undefined,
    modernInstance: null,
    isLoading: false,
    
    // Initialize modern emojis
    async init() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            // Dynamic import of the modern module
            const module = await import('./emojis-modern.mjs');
            this.modernInstance = module.default;
            
            // Wait for emojis to load
            await this.modernInstance.loadEmojis();
            
            // Map data for backward compatibility
            this.emojisJSON = this.modernInstance.emojisData.map(emoji => ({
                name: emoji.label,
                html: emoji.unicode,
                utf16: emoji.unicode.codePointAt(0)?.toString() || '',
                unicode: emoji.unicode
            }));
            
            console.log(`Loaded ${this.emojisJSON.length} emojis from emojibase-data`);
            
        } catch (error) {
            console.error('Failed to load modern emojis:', error);
            // The modern module has its own fallback data
        }
        
        this.isLoading = false;
    },
    

    /** Retorna un emoji por su nombre */
    emoji: function (pName) {
        // Use modern instance if available
        if (this.modernInstance && this.modernInstance.isLoaded) {
            return this.modernInstance.emoji(pName);
        }
        
        // Fallback to legacy method
        if (!this.emojisJSON) return '';
        
        for (var i = 0; i < this.emojisJSON.length; i++) {
            var it = this.emojisJSON[i];
            if (it.name && it.name.toLowerCase() == pName.toLowerCase()) {
                if (it.unicode) return it.unicode;
                
                // Legacy UTF16 conversion
                var ret = '';
                var code = it.utf16.split(';');
                code.forEach(it2 => {
                    ret += String.fromCharCode(it2);
                });
                if (it.modifiers) {
                    var modif = it.modifiers.split(';');
                    modif.forEach(it2 => {
                        ret += String.fromCharCode(it2);
                    });
                }
                return ret;
            }
        }
        return '';
    },

    /**
     * Creates an emoji picker - enhanced version
     */
    createPicker: function (pOptions) {
        // Use modern instance if available
        if (this.modernInstance && this.modernInstance.isLoaded) {
            this.modernInstance.createPicker(pOptions);
            return;
        }
        
        // No fallback needed - modern instance handles its own fallback
    },
    
    // Search functionality
    search: function(term) {
        if (this.modernInstance && this.modernInstance.isLoaded) {
            return this.modernInstance.search(term);
        }
        return [];
    }
};

// Auto-initialize when DOM is ready
$(document).ready(function () {
    // Load jslib if not already loaded
    if (typeof include === 'function') {
        include('jslib');
    }
    
    // Initialize modern emojis
    emojis.init().catch(error => {
        console.error('Emoji initialization failed:', error);
    });
});