/**
Modern emoji implementation using emojibase-data

Fresh: https://cdn.cloudycrm.net/ghcv/cdn/emojis.mjs?_fresh=1
*/

class ModernEmojis {
    constructor() {
        this.emojisData = null;
        this.picker = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load emoji data from emojibase-data CDN
     * @param {string} locale - Language locale (default: 'es')
     * @returns {Promise}
     */
    async loadEmojis(locale = 'es') {
        if (this.loadPromise) return this.loadPromise;
        
        this.loadPromise = this._fetchEmojiData(locale);
        return this.loadPromise;
    }

    async _fetchEmojiData(locale) {
        try {
            const response = await fetch(`https://cdn.jsdelivr.net/npm/emojibase-data@latest/${locale}/compact.json`);
            if (!response.ok) throw new Error(`Failed to load emoji data: ${response.status}`);
            
            this.emojisData = await response.json();
            this.isLoaded = true;
            
            // Create picker after data loads
            this._createPicker();
            
            return this.emojisData;
        } catch (error) {
            console.error('Error loading emoji data:', error);
            // Fallback to basic emoji set
            this._createFallbackData();
            this._createPicker();
        }
    }

    /**
     * Fallback emoji data if CDN fails
     */
    _createFallbackData() {
        this.emojisData = [
            { unicode: '😀', label: 'grinning face', tags: ['happy', 'smile'] },
            { unicode: '😃', label: 'grinning face with big eyes', tags: ['happy', 'joy'] },
            { unicode: '😄', label: 'grinning face with smiling eyes', tags: ['happy', 'joy'] },
            { unicode: '😁', label: 'beaming face with smiling eyes', tags: ['happy', 'grin'] },
            { unicode: '😊', label: 'smiling face with smiling eyes', tags: ['happy', 'blush'] },
            { unicode: '😉', label: 'winking face', tags: ['wink', 'flirt'] },
            { unicode: '😍', label: 'smiling face with heart-eyes', tags: ['love', 'heart'] },
            { unicode: '😘', label: 'face blowing a kiss', tags: ['love', 'kiss'] },
            { unicode: '😋', label: 'face savoring food', tags: ['tongue', 'delicious'] },
            { unicode: '😎', label: 'smiling face with sunglasses', tags: ['cool', 'sunglasses'] },
            { unicode: '😢', label: 'crying face', tags: ['sad', 'cry'] },
            { unicode: '😭', label: 'loudly crying face', tags: ['cry', 'sad'] },
            { unicode: '😡', label: 'pouting face', tags: ['angry', 'mad'] },
            { unicode: '🤔', label: 'thinking face', tags: ['thinking', 'hmm'] },
            { unicode: '👍', label: 'thumbs up', tags: ['like', 'ok', 'good'] },
            { unicode: '👎', label: 'thumbs down', tags: ['dislike', 'bad'] },
            { unicode: '👏', label: 'clapping hands', tags: ['applause', 'clap'] },
            { unicode: '🙏', label: 'folded hands', tags: ['pray', 'please', 'thanks'] },
            { unicode: '❤️', label: 'red heart', tags: ['love', 'heart'] },
            { unicode: '💯', label: 'hundred points', tags: ['100', 'perfect'] },
            { unicode: '🎉', label: 'party popper', tags: ['party', 'celebration'] },
            { unicode: '🔥', label: 'fire', tags: ['fire', 'hot', 'awesome'] }
        ];
        this.isLoaded = true;
    }

    /**
     * Create the emoji picker UI
     */
    _createPicker() {
        // Remove existing picker if any
        const existingPicker = document.getElementById('emojiPicker');
        if (existingPicker) existingPicker.remove();

        // Create picker container
        this.picker = document.createElement('div');
        this.picker.id = 'emojiPicker';
        this.picker.style.cssText = `
            background-color: #ECECEC;
            border-radius: 12px;
            display: none;
            position: absolute;
            padding: 10px;
            height: 300px;
            width: 400px;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid #ddd;
            z-index: 10000;
        `;

        // Add search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-sizing: border-box;
        `;
        this.picker.appendChild(searchInput);

        // Add emoji container
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-container';
        emojiContainer.style.cssText = `
            height: 240px;
            overflow-y: auto;
        `;
        this.picker.appendChild(emojiContainer);

        // Populate emojis
        this._populateEmojis(emojiContainer);

        // Add search functionality
        searchInput.addEventListener('input', (e) => {
            this._filterEmojis(emojiContainer, e.target.value);
        });
        
        // Prevent picker from closing when clicking on search input
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add click handler for emojis
        emojiContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-item')) {
                this._insertEmoji(e.target.textContent);
                e.stopPropagation();
            }
        });

        // Hide picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.picker.contains(e.target)) {
                this.picker.style.display = 'none';
            }
        });

        // Append to body
        document.body.appendChild(this.picker);
    }

    /**
     * Populate emoji container with emoji items
     */
    _populateEmojis(container, filter = '') {
        container.innerHTML = '';
        
        let emojis = this.emojisData.filter(emoji => {
            if (!filter) return true;
            const searchTerm = filter.toLowerCase();
            return emoji.label?.toLowerCase().includes(searchTerm) ||
                   emoji.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                   emoji.unicode.includes(searchTerm);
        });

        // If no filter, sort to show faces first, then others
        if (!filter) {
            emojis = emojis.sort((a, b) => {
                const aIsFace = /[\u{1F600}-\u{1F64F}\u{1F910}-\u{1F96B}\u{1F970}-\u{1F978}]/u.test(a.unicode);
                const bIsFace = /[\u{1F600}-\u{1F64F}\u{1F910}-\u{1F96B}\u{1F970}-\u{1F978}]/u.test(b.unicode);
                
                if (aIsFace && !bIsFace) return -1;
                if (!aIsFace && bIsFace) return 1;
                return 0; // Keep original order within same category
            });
        }

        // Create all emoji items without limit
        const fragment = document.createDocumentFragment();
        
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('span');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji.unicode;
            emojiItem.title = emoji.label || emoji.unicode;
            emojiItem.style.cssText = `
                font-size: 24px;
                cursor: pointer;
                padding: 4px;
                margin: 2px;
                display: inline-block;
                border-radius: 4px;
                transition: background-color 0.2s;
            `;
            
            emojiItem.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#ddd';
            });
            
            emojiItem.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            fragment.appendChild(emojiItem);
        });
        
        // Append all at once for better performance
        container.appendChild(fragment);
    }

    /**
     * Filter emojis based on search term
     */
    _filterEmojis(container, filter) {
        this._populateEmojis(container, filter);
    }

    /**
     * Insert emoji at cursor position
     */
    _insertEmoji(emoji) {
        if (this.currentTarget) {
            let target = this.currentTarget;
            
            // Handle jQuery objects
            if (target.jquery) {
                target = target[0];
            }
            
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const value = target.value || '';
                target.value = value.substring(0, start) + emoji + value.substring(end);
                target.selectionStart = target.selectionEnd = start + emoji.length;
                target.focus();
            } else if (target && target.contentEditable === 'true') {
                // For contenteditable elements
                if (document.execCommand) {
                    target.focus();
                    document.execCommand('insertText', false, emoji);
                } else {
                    // Fallback for newer browsers
                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(emoji));
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else if (target) {
                // Last resort - just append
                target.value = (target.value || '') + emoji;
            }
        }
        this.picker.style.display = 'none';
    }

    /**
     * Show picker at specified position
     */
    showPicker(x, y, targetElement) {
        if (!this.isLoaded) {
            console.warn('Emojis not loaded yet');
            return;
        }

        this.currentTarget = targetElement;
        
        // Position picker
        const picker = this.picker;
        const pickerWidth = 400;
        const pickerHeight = 320;
        
        // Adjust position to keep picker on screen (considering scroll)
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const maxX = scrollLeft + window.innerWidth - pickerWidth - 10;
        const maxY = scrollTop + window.innerHeight - pickerHeight - 10;
        
        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
        
        picker.style.left = x + 'px';
        picker.style.top = y + 'px';
        picker.style.display = 'block';
        
        // Focus search input
        const searchInput = picker.querySelector('input');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    /**
     * Create emoji picker for a specific element
     */
    createPicker(options) {
        let { el, inputEl } = options;
        el = $(el)[0];
        
        if (!el || !inputEl) {
            console.error('createPicker requires el and inputEl options');
            return;
        }

        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Use event coordinates that account for page scroll
            const x = e.pageX;
            const y = e.pageY + 10;
            
            this.showPicker(x, y, inputEl);
        });
    }

    /**
     * Get emoji by name (for backward compatibility)
     */
    emoji(name) {
        if (!this.isLoaded || !this.emojisData) return '';
        
        const found = this.emojisData.find(emoji => 
            emoji.label?.toLowerCase() === name.toLowerCase() ||
            emoji.tags?.some(tag => tag.toLowerCase() === name.toLowerCase())
        );
        
        return found ? found.unicode : '';
    }

    /**
     * Search emojis by term
     */
    search(term) {
        if (!this.isLoaded || !this.emojisData) return [];
        
        const searchTerm = term.toLowerCase();
        return this.emojisData.filter(emoji =>
            emoji.label?.toLowerCase().includes(searchTerm) ||
            emoji.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
}

// Create global instance
const modernEmojis = new ModernEmojis();

// Auto-load on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        modernEmojis.loadEmojis();
    });
} else {
    modernEmojis.loadEmojis();
}

// Export for use
export default modernEmojis;
