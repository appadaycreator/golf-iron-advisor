# Golf Iron Advisor - Technical Specification

## Current System Architecture

### File Structure
```
golf-iron-advisor/
├── index.html (Main app - ~3,600 lines)
├── clubs.html (Club listing page)
├── lp.html (Landing page)
├── function.html (Feature documentation)
├── assets/
│   ├── js/
│   │   ├── app.js (Core logic - 721 lines)
│   │   └── diagnosis.js (Diagnosis engine - 1,047 lines)
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   └── data/ (Empty - clubs.json missing)
├── manifest.json (PWA config)
└── sw.js (Service Worker)
```

## Core Functionality Specification

### 1. Diagnosis System
**Input Parameters:**
- Physical: height, weight, age
- Experience: beginner/intermediate/advanced
- Swing: speed (slow/average/fast)
- Miss tendency: slice/hook/top/fat
- Ball flight: low/medium/high
- Priority: distance/accuracy/control/forgiveness
- Budget: <5万/<10万/<15万/15万+

**Scoring Algorithm:**
- Physical fit: 25% weight
- Skill level fit: 30% weight
- Swing characteristics: 25% weight
- Miss tendency correction: 15% weight
- Preference/budget: 5% weight

**Output:**
- Top 3 club recommendations
- Compatibility scores (0-100)
- Detailed reasoning
- Shaft recommendations
- Purchase links

### 2. Club Database
**Structure:**
- 100+ club entries
- Properties: name, brand, type, price, specs
- Currently hardcoded in HTML (needs extraction)

### 3. User Interface
**Components:**
- 7-step diagnosis form
- Results display with charts
- Club listing page with search/filter
- History management
- Social sharing

### 4. Data Persistence
- LocalStorage for user state
- Diagnosis history (max 10)
- User preferences

## Architecture Issues Identified

### Critical Issues
1. **Code Duplication:** Diagnosis logic duplicated between files
2. **Monolithic Structure:** 3,600-line HTML file
3. **Poor Separation:** Business logic mixed with UI
4. **No Module System:** Everything global
5. **Data Issues:** Club database hardcoded in HTML

### Refactoring Requirements
1. Extract JavaScript modules
2. Separate club database to JSON
3. Implement proper state management
4. Create component system
5. Remove code duplication

## Current Test Coverage
- No automated tests
- Manual testing only
- No CI/CD pipeline

## Dependencies
- TailwindCSS (CDN)
- Chart.js (CDN)
- FontAwesome (CDN)
- No build system

## Performance Metrics
- First load: ~2-3 seconds
- Diagnosis completion: ~5 minutes
- Club data: ~100 entries
- Browser compatibility: Modern browsers only

This specification documents the current state before refactoring begins.