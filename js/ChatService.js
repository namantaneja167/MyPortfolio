/**
 * ChatService - Async Chat Bot with Natural Typing Simulation
 * Provides keyword-based responses with simulated typing delays
 * Uses IIFE pattern for compatibility with file:// protocol
 */

(function (global) {
    'use strict';

    // Typing delay range in milliseconds
    const MIN_TYPING_DELAY = 800;
    const MAX_TYPING_DELAY = 1500;

    /**
     * Create a ChatService instance
     * @param {Object} knowledgeBase - The chat knowledge base object
     */
    function ChatService(knowledgeBase) {
        this.knowledgeBase = knowledgeBase || null;
    }

    /**
     * Simulate typing delay with random duration
     * @returns {Promise<void>}
     */
    ChatService.prototype._simulateTyping = function () {
        const delay = Math.floor(
            Math.random() * (MAX_TYPING_DELAY - MIN_TYPING_DELAY) + MIN_TYPING_DELAY
        );
        return new Promise(function (resolve) {
            setTimeout(resolve, delay);
        });
    };

    /**
     * Find the best matching response based on keywords
     * @param {string} text - User input text
     * @returns {string} - Matching response or default
     */
    ChatService.prototype._findBestMatch = function (text) {
        if (!this.knowledgeBase) {
            return "I'm sorry, I don't have access to my knowledge base right now.";
        }

        const lowerText = text.toLowerCase();

        // Search through all knowledge base entries for keyword matches
        for (const key in this.knowledgeBase) {
            if (key === 'quickPrompts' || key === 'default') continue;

            const entry = this.knowledgeBase[key];
            if (entry.keywords && Array.isArray(entry.keywords)) {
                const hasMatch = entry.keywords.some(function (keyword) {
                    return lowerText.includes(keyword.toLowerCase());
                });

                if (hasMatch) {
                    return entry.response;
                }
            }
        }

        // Return default response if no match found
        return (this.knowledgeBase.default && this.knowledgeBase.default.response) ||
            "I'm not sure how to help with that. Try asking about skills, experience, or projects!";
    };

    /**
     * Get a response for the user message with simulated typing delay
     * @param {string} userMessage - The user's message
     * @returns {Promise<string>} - The bot's response
     */
    ChatService.prototype.getResponse = function (userMessage) {
        const self = this;
        return this._simulateTyping().then(function () {
            return self._findBestMatch(userMessage);
        });
    };

    /**
     * Get quick prompts for the chat UI
     * @returns {string[]} Array of quick prompt strings
     */
    ChatService.prototype.getQuickPrompts = function () {
        return (this.knowledgeBase && this.knowledgeBase.quickPrompts) || [];
    };

    /**
     * Update the knowledge base
     * @param {Object} knowledgeBase 
     */
    ChatService.prototype.setKnowledgeBase = function (knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    };

    // Export ChatService to global scope
    global.ChatService = ChatService;

})(window);
