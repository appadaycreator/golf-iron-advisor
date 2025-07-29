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
│   └── data/
│       └── clubs.json (Club database - 6,414 lines, 50+ clubs)
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
- 50+ club entries in JSON format
- Properties: basic_info, performance, specifications, suitability, features, links
- Data format: Direct array of club objects
- SVG placeholder images for club visualization

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
5. ~~**Data Issues:** Club database hardcoded in HTML~~ ✅ **RESOLVED** - Moved to clubs.json

### Refactoring Requirements
1. Extract JavaScript modules
2. ~~Separate club database to JSON~~ ✅ **COMPLETED**
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
- Club data: ~50 entries (extendable)
- Browser compatibility: Modern browsers only

## Recent Updates
- ✅ **2025-01-20**: Fixed "Unexpected identifier 'viewBox'" SyntaxError & Template Literal Issues
  - Resolved club database access pattern mismatch  
  - Updated diagnosis.js to handle array-based club data structure
  - Fixed image path references: `club.image` → `club.links?.image`
  - Corrected SVG template literal processing in onerror attributes
  - **CRITICAL FIX**: Resolved "Missing } in template expression" JavaScript syntax errors
  - Separated complex template literals into variables to avoid nesting issues
  - Validated all SVG data structures for proper formatting
  - Aligned data processing with clubs.json format

This specification documents the current state before refactoring begins.