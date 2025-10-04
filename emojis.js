/**
 * Modern emoji integration - replaces ASP + JSONP approach
*/

// Global emojis object for backward compatibility
var emojis = {
    emojisJSON: undefined,
    modEmojis: null,
    isLoading: false,
    
    // Auto-initialize on first use
    async _ensureLoaded() {
        if (this.modEmojis || this.isLoading) return;
        this.isLoading = true;
        
        try {
            // Dynamic import of the emojis module
            const module = await import('https://cdn.cloudycrm.net/ghcv/global/emojis.mjs');
            this.modEmojis = module.default;
            
            // Wait for emojis to load
            await this.modEmojis.loadEmojis();
            
            // Map data for backward compatibility
            this.emojisJSON = this.modEmojis.emojisData.map(emoji => ({
                name: emoji.label,
                html: emoji.unicode,
                utf16: emoji.unicode.codePointAt(0)?.toString() || '',
                unicode: emoji.unicode
            }));
            
            console.log(`Loaded ${this.emojisJSON.length} emojis from emojibase-data`);
            
        } catch (error) {
            console.error('Failed to load emojis mod:', error);
        }
        
        this.isLoading = false;
    },
    

    /** Retorna un emoji por su nombre */
    emoji: function (pName) {
        // Auto-load if needed
        this._ensureLoaded();
        
        // Use mod instance if available
        if (this.modEmojis && this.modEmojis.isLoaded) {
            return this.modEmojis.emoji(pName);
        }
        
        return '';
    },

    /**
     * Creates an emoji picker - enhanced version
     */
    createPicker: function (pOptions) {
        // Auto-load if needed
        this._ensureLoaded().then(() => {
            if (this.modEmojis && this.modEmojis.isLoaded) {
                this.modEmojis.createPicker(pOptions);
            }
        });
    },
};
