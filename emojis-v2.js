/**
 * Modern emoji integration - replaces ASP + JSONP approach
 * Uses dynamic import to load emojis-modern.mjs
 */

// Global emojis object for backward compatibility
var emojis = {
    emojisJSON: undefined,
    modernInstance: null,
    isLoading: false,
    
    // Auto-initialize on first use
    async _ensureLoaded() {
        if (this.modernInstance || this.isLoading) return;
        this.isLoading = true;
        
        try {
            // Dynamic import of the modern module
            const module = await import('https://cdn.cloudycrm.net/ghcv/cdn/emojis-modern.mjs?_fresh=1');
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
        }
        
        this.isLoading = false;
    },
    

    /** Retorna un emoji por su nombre */
    emoji: function (pName) {
        // Auto-load if needed
        this._ensureLoaded();
        
        // Use modern instance if available
        if (this.modernInstance && this.modernInstance.isLoaded) {
            return this.modernInstance.emoji(pName);
        }
        
        return '';
    },

    /**
     * Creates an emoji picker - enhanced version
     */
    createPicker: function (pOptions) {
        // Auto-load if needed
        this._ensureLoaded().then(() => {
            if (this.modernInstance && this.modernInstance.isLoaded) {
                this.modernInstance.createPicker(pOptions);
            }
        });
    },
    
    // Search functionality
    search: function(term) {
        this._ensureLoaded();
        if (this.modernInstance && this.modernInstance.isLoaded) {
            return this.modernInstance.search(term);
        }
        return [];
    }
};

// No dependencies needed - modern implementation is self-contained