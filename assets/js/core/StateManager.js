/**
 * StateManager - Centralized state management with persistence
 * Provides reactive state management with localStorage integration
 */
class StateManager {
    constructor(eventBus, persistKey = 'golfAdvisorState') {
        this.eventBus = eventBus;
        this.persistKey = persistKey;
        this.state = {};
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;

        // Load persisted state
        this.loadState();

        // Create reactive proxy
        this.state = new Proxy(this.state, {
            set: (target, property, value) => {
                const oldValue = target[property];
                target[property] = value;
                
                // Add to history
                this.addToHistory(property, oldValue, value);
                
                // Notify subscribers
                this.notifySubscribers(property, value, oldValue);
                
                // Emit global event
                this.eventBus.emit('stateChange', {
                    property,
                    value,
                    oldValue,
                    state: { ...target }
                });

                // Persist state
                this.persistState();
                
                return true;
            }
        });
    }

    /**
     * Set multiple state properties at once
     * @param {Object} updates - Object with state updates
     */
    setState(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.state[key] = value;
        });
    }

    /**
     * Get state value(s)
     * @param {string} [key] - Specific key to get, or entire state if omitted
     * @returns {*} State value or entire state object
     */
    getState(key) {
        return key ? this.state[key] : { ...this.state };
    }

    /**
     * Subscribe to state changes
     * @param {string} property - Property to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(property, callback) {
        if (!this.subscribers.has(property)) {
            this.subscribers.set(property, []);
        }
        this.subscribers.get(property).push(callback);

        // Return unsubscribe function
        return () => {
            const subscribers = this.subscribers.get(property);
            if (subscribers) {
                const index = subscribers.indexOf(callback);
                if (index > -1) {
                    subscribers.splice(index, 1);
                }
            }
        };
    }

    /**
     * Notify subscribers of state changes
     * @private
     */
    notifySubscribers(property, value, oldValue) {
        if (this.subscribers.has(property)) {
            this.subscribers.get(property).forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    console.error(`Error in state subscriber for "${property}":`, error);
                }
            });
        }
    }

    /**
     * Add state change to history
     * @private
     */
    addToHistory(property, oldValue, newValue) {
        this.history.push({
            timestamp: Date.now(),
            property,
            oldValue,
            newValue
        });

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Get state change history
     * @param {string} [property] - Filter by property
     * @returns {Array} History array
     */
    getHistory(property) {
        if (property) {
            return this.history.filter(entry => entry.property === property);
        }
        return [...this.history];
    }

    /**
     * Reset state to initial values
     */
    reset() {
        const oldState = { ...this.state };
        Object.keys(this.state).forEach(key => {
            delete this.state[key];
        });
        
        this.eventBus.emit('stateReset', { oldState });
        this.persistState();
    }

    /**
     * Load state from localStorage
     * @private
     */
    loadState() {
        try {
            const saved = localStorage.getItem(this.persistKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(this.state, parsed);
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
    }

    /**
     * Persist state to localStorage
     * @private
     */
    persistState() {
        try {
            localStorage.setItem(this.persistKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to persist state to localStorage:', error);
        }
    }

    /**
     * Clear persisted state
     */
    clearPersistedState() {
        try {
            localStorage.removeItem(this.persistKey);
        } catch (error) {
            console.warn('Failed to clear persisted state:', error);
        }
    }

    /**
     * Get debug information
     * @returns {Object} Debug info
     */
    getDebugInfo() {
        return {
            state: { ...this.state },
            subscribers: Object.fromEntries(
                Array.from(this.subscribers.entries()).map(([key, callbacks]) => [
                    key,
                    callbacks.length
                ])
            ),
            historySize: this.history.length,
            lastChange: this.history[this.history.length - 1]
        };
    }
}

// Export for both browser and Node.js
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}