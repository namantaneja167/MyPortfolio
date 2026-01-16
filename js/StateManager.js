/**
 * StateManager - Centralized UI State Management
 * Handles theme, mobile menu state, and chat history with localStorage persistence
 * Uses IIFE pattern for compatibility with file:// protocol
 */

(function (global) {
    'use strict';

    // Storage keys
    const THEME_KEY = 'theme';
    const CHAT_HISTORY_KEY = 'chatHistory';

    // Private state storage
    let state = {
        theme: 'light',
        mobileMenuOpen: false,
        chatHistory: []
    };

    /**
     * Load persisted state from localStorage
     */
    function loadPersistedState() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme) {
                state.theme = savedTheme;
            } else {
                // Default to system preference
                state.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }

            // Load chat history
            const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (savedHistory) {
                state.chatHistory = JSON.parse(savedHistory);
            }
        } catch (e) {
            console.warn('StateManager: Failed to load persisted state', e);
        }
    }

    /**
     * Persist chat history to localStorage
     */
    function persistChatHistory() {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(state.chatHistory));
        } catch (e) {
            console.warn('StateManager: Failed to persist chat history', e);
        }
    }

    // Initialize on load
    loadPersistedState();

    // Export StateManager to global scope
    global.StateManager = {
        // ==================== THEME ====================
        getTheme: function () {
            return state.theme;
        },

        setTheme: function (theme) {
            state.theme = theme;
            try {
                localStorage.setItem(THEME_KEY, theme);
            } catch (e) {
                console.warn('StateManager: Failed to persist theme', e);
            }
        },

        toggleTheme: function () {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            return newTheme;
        },

        // ==================== MOBILE MENU ====================
        getMobileMenuOpen: function () {
            return state.mobileMenuOpen;
        },

        setMobileMenuOpen: function (isOpen) {
            state.mobileMenuOpen = isOpen;
        },

        toggleMobileMenu: function () {
            state.mobileMenuOpen = !state.mobileMenuOpen;
            return state.mobileMenuOpen;
        },

        // ==================== CHAT HISTORY ====================
        getChatHistory: function () {
            return [...state.chatHistory];
        },

        addChatMessage: function (text, sender) {
            const message = {
                text: text,
                sender: sender,
                time: new Date().toISOString()
            };
            state.chatHistory.push(message);
            persistChatHistory();
        },

        clearChatHistory: function () {
            state.chatHistory = [];
            persistChatHistory();
        }
    };

})(window);
