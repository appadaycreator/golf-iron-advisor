/**
 * EventBus - Centralized event management system
 * Provides pub/sub pattern for loose coupling between components
 */
class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    once(event, callback) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        this.onceEvents.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    emit(event, data) {
        // Handle regular subscribers
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            });
        }

        // Handle once subscribers
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once handler for "${event}":`, error);
                }
            });
            this.onceEvents.delete(event);
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
            this.onceEvents.delete(event);
        } else {
            this.events.clear();
            this.onceEvents.clear();
        }
    }

    /**
     * Get list of events with listener counts
     * @returns {Object} Event statistics
     */
    getStats() {
        const stats = {};
        for (const [event, callbacks] of this.events.entries()) {
            stats[event] = {
                regular: callbacks.length,
                once: this.onceEvents.has(event) ? this.onceEvents.get(event).length : 0
            };
        }
        return stats;
    }
}

// Export for both browser and Node.js
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}