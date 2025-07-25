# Golf Iron Advisor - Refactoring Plan

## Phase 1: Foundation Restructuring (Immediate)

### 1.1 Extract Club Database
- **Goal**: Separate data from code
- **Actions**:
  - Create `assets/data/clubs.json` with all club data
  - Remove hardcoded club arrays from HTML/JS
  - Create `ClubDataService.js` for data access
  - Implement data validation

### 1.2 Create Module Structure
```
assets/js/
├── core/
│   ├── App.js              # Main application controller
│   ├── EventBus.js         # Event management system
│   └── StateManager.js     # Centralized state management
├── components/
│   ├── DiagnosisForm.js    # Diagnosis form component
│   ├── ResultDisplay.js    # Results display component
│   ├── ClubCard.js         # Individual club card
│   └── Navigation.js       # Navigation component
├── services/
│   ├── ClubDataService.js  # Club database service
│   ├── DiagnosisEngine.js  # Diagnosis calculation logic
│   └── StorageService.js   # LocalStorage abstraction
├── utils/
│   ├── DOM.js              # DOM manipulation utilities
│   ├── Validation.js       # Form validation utilities
│   └── Analytics.js        # Analytics integration
└── config/
    └── constants.js        # Application constants
```

### 1.3 Break Down Monolithic Code
- **DiagnosisEngine** (1,047 lines) → Multiple focused modules
- **Inline JavaScript** (2,000+ lines) → Separate modules
- **HTML** (3,600 lines) → Clean structure with external JS

## Phase 2: Component Implementation

### 2.1 Core System Classes

#### StateManager.js
```javascript
class StateManager {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
    }
    
    setState(updates) {
        Object.assign(this.state, updates);
        this.notifySubscribers(updates);
    }
    
    getState(key) {
        return key ? this.state[key] : { ...this.state };
    }
    
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }
}
```

#### EventBus.js
```javascript
class EventBus {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }
}
```

### 2.2 Service Layer

#### ClubDataService.js
```javascript
class ClubDataService {
    constructor() {
        this.clubs = [];
        this.loaded = false;
    }
    
    async loadClubs() {
        if (this.loaded) return this.clubs;
        
        try {
            const response = await fetch('/assets/data/clubs.json');
            this.clubs = await response.json();
            this.loaded = true;
            return this.clubs;
        } catch (error) {
            console.error('Failed to load club data:', error);
            return [];
        }
    }
    
    getClubs(filters = {}) {
        return this.clubs.filter(club => this.matchesFilters(club, filters));
    }
    
    getClubById(id) {
        return this.clubs.find(club => club.id === id);
    }
}
```

#### DiagnosisEngine.js
```javascript
class DiagnosisEngine {
    constructor(clubDataService) {
        this.clubDataService = clubDataService;
        this.scoringWeights = {
            physicalFit: 0.25,
            skillLevel: 0.30,
            swingCharacteristics: 0.25,
            missTendency: 0.15,
            preference: 0.05
        };
    }
    
    async calculateRecommendations(userProfile) {
        const clubs = await this.clubDataService.loadClubs();
        return clubs
            .map(club => ({
                club,
                score: this.calculateClubScore(userProfile, club),
                reasons: this.generateReasons(userProfile, club)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }
    
    calculateClubScore(user, club) {
        // Modular scoring implementation
    }
}
```

### 2.3 Component Architecture

#### Base Component Class
```javascript
class Component {
    constructor(element, props = {}) {
        this.element = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        this.props = props;
        this.state = {};
        this.eventBus = window.eventBus;
        this.stateManager = window.stateManager;
    }
    
    render() {
        // Override in subclasses
    }
    
    setState(newState) {
        Object.assign(this.state, newState);
        this.render();
    }
    
    destroy() {
        // Cleanup event listeners
    }
}
```

## Phase 3: Migration Strategy

### 3.1 Gradual Migration
1. **Week 1**: Create new module structure
2. **Week 2**: Extract club database and core services  
3. **Week 3**: Migrate diagnosis logic
4. **Week 4**: Migrate UI components
5. **Week 5**: Remove old code and cleanup

### 3.2 Testing Strategy
- Run test suite before each migration step
- Maintain functional parity at each stage
- Use feature flags for gradual rollout

### 3.3 Rollback Plan
- Git branches for each phase
- Automated rollback if tests fail
- Backup of working state at each milestone

## Phase 4: Optimization

### 4.1 Build System
- Webpack configuration
- ES6 module bundling
- CSS preprocessing
- Asset optimization

### 4.2 Type Safety
- JSDoc annotations initially
- Future TypeScript migration path

### 4.3 Performance
- Code splitting
- Lazy loading
- Caching strategies

## Implementation Priority

### High Priority (This Phase)
1. ✅ Extract club database to JSON
2. ✅ Create ClubDataService
3. ✅ Break down DiagnosisEngine
4. ✅ Implement StateManager
5. ✅ Create component base classes

### Medium Priority
1. Implement build system
2. Add comprehensive testing
3. Performance optimization
4. Type safety improvements

### Low Priority
1. TypeScript migration  
2. Advanced build features
3. CI/CD pipeline
4. Advanced monitoring

## Success Metrics
- ✅ All existing functionality preserved
- ✅ Test suite passes 100%
- ✅ Code complexity reduced by 60%
- ✅ Module coupling reduced
- ✅ Development velocity improved

This plan ensures a systematic, safe refactoring that maintains functionality while dramatically improving code organization and maintainability.