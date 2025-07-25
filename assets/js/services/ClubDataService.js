/**
 * ClubDataService - Manages club database operations
 * Provides centralized access to club data with caching and filtering
 */
class ClubDataService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.clubs = [];
        this.loaded = false;
        this.loading = false;
        this.dataUrl = './assets/data/clubs.json';
        this.fallbackData = null;
    }

    /**
     * Load club data from JSON file
     * @returns {Promise<Array>} Array of club objects
     */
    async loadClubs() {
        if (this.loaded) {
            return this.clubs;
        }

        if (this.loading) {
            // Wait for existing load to complete
            return new Promise((resolve) => {
                this.eventBus.once('clubsLoaded', () => resolve(this.clubs));
            });
        }

        this.loading = true;
        this.eventBus.emit('clubsLoading', { started: true });

        try {
            console.log('[ClubDataService] Loading club data...');
            const response = await fetch(this.dataUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format: expected array');
            }

            this.clubs = this.processClubData(data);
            this.loaded = true;
            this.loading = false;

            console.log(`[ClubDataService] Loaded ${this.clubs.length} clubs`);
            this.eventBus.emit('clubsLoaded', { 
                clubs: this.clubs, 
                count: this.clubs.length 
            });

            return this.clubs;
        } catch (error) {
            console.error('[ClubDataService] Failed to load club data:', error);
            this.loading = false;
            
            // Try fallback data
            const fallbackClubs = this.getFallbackData();
            if (fallbackClubs.length > 0) {
                console.warn('[ClubDataService] Using fallback data');
                this.clubs = fallbackClubs;
                this.loaded = true;
                this.eventBus.emit('clubsLoaded', { 
                    clubs: this.clubs, 
                    count: this.clubs.length,
                    fallback: true 
                });
                return this.clubs;
            }

            this.eventBus.emit('clubsLoadError', { error });
            throw error;
        }
    }

    /**
     * Process and validate club data
     * @private
     */
    processClubData(data) {
        return data.map((club, index) => {
            // Ensure required fields
            const processed = {
                id: club.id || index + 1,
                name: club.basic_info?.name || club.name || 'Unknown Club',
                brand: club.basic_info?.brand || club.brand || 'Unknown Brand',
                type: club.basic_info?.type || club.type || 'unknown',
                price: club.specifications?.price || club.price || 0,
                forgiveness: club.performance?.forgiveness || 0,
                workability: club.performance?.workability || 0,
                distance: club.performance?.distance || 0,
                feel: club.performance?.feel || 0,
                difficulty: club.basic_info?.difficulty || this.determineDifficulty(club),
                suitableFor: club.suitability?.suitable_for || [],
                swingSpeed: club.suitability?.swing_speed || [],
                priority: club.suitability?.priority || [],
                features: club.features || [],
                amazonUrl: club.links?.affiliate_amazon || club.affiliate_amazon || '',
                rakutenUrl: club.links?.affiliate_rakuten || club.affiliate_rakuten || '',
                ...club // Keep all original properties
            };

            return processed;
        });
    }

    /**
     * Determine club difficulty based on performance metrics
     * @private
     */
    determineDifficulty(club) {
        const forgiveness = club.performance?.forgiveness || 0;
        if (forgiveness >= 8) return '初心者向け';
        if (forgiveness >= 6) return '中級者向け';
        return '上級者向け';
    }

    /**
     * Get all clubs with optional filtering
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered clubs array
     */
    getClubs(filters = {}) {
        if (!this.loaded) {
            console.warn('[ClubDataService] Clubs not loaded yet');
            return [];
        }

        let filteredClubs = [...this.clubs];

        // Apply filters
        if (filters.brand) {
            filteredClubs = filteredClubs.filter(club => 
                club.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        if (filters.name) {
            filteredClubs = filteredClubs.filter(club => 
                club.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        if (filters.type) {
            filteredClubs = filteredClubs.filter(club => club.type === filters.type);
        }

        if (filters.difficulty) {
            filteredClubs = filteredClubs.filter(club => club.difficulty === filters.difficulty);
        }

        if (filters.priceMin) {
            filteredClubs = filteredClubs.filter(club => club.price >= filters.priceMin);
        }

        if (filters.priceMax) {
            filteredClubs = filteredClubs.filter(club => club.price <= filters.priceMax);
        }

        if (filters.suitableFor) {
            filteredClubs = filteredClubs.filter(club => 
                club.suitableFor.includes(filters.suitableFor)
            );
        }

        return filteredClubs;
    }

    /**
     * Get club by ID
     * @param {number} id - Club ID
     * @returns {Object|null} Club object or null if not found
     */
    getClubById(id) {
        return this.clubs.find(club => club.id === id) || null;
    }

    /**
     * Search clubs by query
     * @param {string} query - Search query
     * @returns {Array} Matching clubs
     */
    searchClubs(query) {
        if (!query || query.length < 2) {
            return this.clubs;
        }

        const searchTerm = query.toLowerCase();
        return this.clubs.filter(club => 
            club.name.toLowerCase().includes(searchTerm) ||
            club.brand.toLowerCase().includes(searchTerm) ||
            club.type.toLowerCase().includes(searchTerm) ||
            club.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Get available brands
     * @returns {Array} Array of unique brands
     */
    getBrands() {
        return [...new Set(this.clubs.map(club => club.brand))].sort();
    }

    /**
     * Get available types
     * @returns {Array} Array of unique types
     */
    getTypes() {
        return [...new Set(this.clubs.map(club => club.type))].sort();
    }

    /**
     * Get price range
     * @returns {Object} Min and max prices
     */
    getPriceRange() {
        const prices = this.clubs.map(club => club.price).filter(price => price > 0);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    /**
     * Get fallback data (hardcoded clubs)
     * @private
     */
    getFallbackData() {
        // Use hardcoded data as fallback if available
        if (typeof window !== 'undefined' && window.clubDatabase) {
            return window.clubDatabase;
        }
        return [];
    }

    /**
     * Reload club data
     * @returns {Promise<Array>} Reloaded clubs
     */
    async reload() {
        this.loaded = false;
        this.clubs = [];
        return this.loadClubs();
    }

    /**
     * Get service statistics
     * @returns {Object} Service stats
     */
    getStats() {
        return {
            loaded: this.loaded,
            loading: this.loading,
            totalClubs: this.clubs.length,
            brands: this.getBrands().length,
            types: this.getTypes().length,
            priceRange: this.loaded ? this.getPriceRange() : null
        };
    }
}

// Export for both browser and Node.js
if (typeof window !== 'undefined') {
    window.ClubDataService = ClubDataService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClubDataService;
}