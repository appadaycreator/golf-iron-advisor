/**
 * Golf Iron Advisor - Refactoring Test Suite
 * 
 * This test suite validates core functionality before and after refactoring
 * to ensure no regressions are introduced.
 */

class RefactorTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Add a test case
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Run all tests
     */
    async runAll() {
        console.log('🧪 Starting Refactor Test Suite...\n');
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total: ${this.results.total}`);
        console.log(`🎯 Success Rate: ${(this.results.passed / this.results.total * 100).toFixed(1)}%`);
        
        return this.results.failed === 0;
    }

    /**
     * Run individual test
     */
    async runTest(test) {
        try {
            this.results.total++;
            await test.testFn();
            console.log(`✅ ${test.name}`);
            this.results.passed++;
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
            this.results.failed++;
        }
    }

    /**
     * Assert helper
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    /**
     * DOM element exists helper
     */
    elementExists(selector) {
        return document.querySelector(selector) !== null;
    }

    /**
     * Function exists helper
     */
    functionExists(name) {
        return typeof window[name] === 'function';
    }
}

// Initialize test suite
const testSuite = new RefactorTestSuite();

// Test 1: Core HTML Structure
testSuite.test('Core HTML Elements Exist', () => {
    testSuite.assert(testSuite.elementExists('#diagnosis'), 'Main diagnosis section missing');
    testSuite.assert(testSuite.elementExists('#results'), 'Results section missing');
    testSuite.assert(testSuite.elementExists('#recommended'), 'Recommended section missing');
});

// Test 2: Navigation Elements
testSuite.test('Navigation Elements', () => {
    testSuite.assert(testSuite.elementExists('header'), 'Header missing');
    testSuite.assert(testSuite.elementExists('#mobileSidebar'), 'Mobile sidebar missing');
    testSuite.assert(testSuite.elementExists('nav'), 'Navigation missing');
});

// Test 3: Form Elements
testSuite.test('Diagnosis Form Elements', () => {
    testSuite.assert(testSuite.elementExists('#step-1'), 'Step 1 missing');
    testSuite.assert(testSuite.elementExists('#step-2'), 'Step 2 missing');
    testSuite.assert(testSuite.elementExists('#step-3'), 'Step 3 missing');
    testSuite.assert(testSuite.elementExists('#step-4'), 'Step 4 missing');
    testSuite.assert(testSuite.elementExists('#step-5'), 'Step 5 missing');
    testSuite.assert(testSuite.elementExists('#step-6'), 'Step 6 missing');
    testSuite.assert(testSuite.elementExists('#step-7'), 'Step 7 missing');
});

// Test 4: JavaScript Functions
testSuite.test('Core JavaScript Functions', () => {
    testSuite.assert(testSuite.functionExists('startDiagnosis'), 'startDiagnosis function missing');
    testSuite.assert(testSuite.functionExists('showQuestion'), 'showQuestion function missing');
    testSuite.assert(testSuite.functionExists('selectOption'), 'selectOption function missing');
    testSuite.assert(testSuite.functionExists('calculateResults'), 'calculateResults function missing');
    testSuite.assert(testSuite.functionExists('displayResults'), 'displayResults function missing');
});

// Test 5: Club Database
testSuite.test('Club Database Availability', () => {
    testSuite.assert(typeof window.clubDatabase !== 'undefined', 'Club database not defined');
    testSuite.assert(Array.isArray(window.clubDatabase), 'Club database is not an array');
    testSuite.assert(window.clubDatabase.length > 0, 'Club database is empty');
    testSuite.assert(window.clubDatabase.length >= 100, 'Club database has less than 100 entries');
});

// Test 6: Club Database Structure
testSuite.test('Club Database Structure', () => {
    const sampleClub = window.clubDatabase[0];
    testSuite.assert(sampleClub.hasOwnProperty('name'), 'Club missing name property');
    testSuite.assert(sampleClub.hasOwnProperty('brand'), 'Club missing brand property');
    testSuite.assert(sampleClub.hasOwnProperty('type'), 'Club missing type property');
    testSuite.assert(sampleClub.hasOwnProperty('price'), 'Club missing price property');
    testSuite.assert(sampleClub.hasOwnProperty('difficulty'), 'Club missing difficulty property');
});

// Test 7: Local Storage Functions
testSuite.test('Local Storage Functions', () => {
    testSuite.assert(testSuite.functionExists('saveToHistory'), 'saveToHistory function missing');
    testSuite.assert(testSuite.functionExists('updateHistoryDisplay'), 'updateHistoryDisplay function missing');
    testSuite.assert(typeof localStorage !== 'undefined', 'localStorage not available');
});

// Test 8: Translation System
testSuite.test('Translation System', () => {
    testSuite.assert(typeof translations !== 'undefined', 'Translations object missing');
    testSuite.assert(translations.hasOwnProperty('ja'), 'Japanese translations missing');
    testSuite.assert(translations.hasOwnProperty('en'), 'English translations missing');
    testSuite.assert(testSuite.functionExists('translatePage'), 'translatePage function missing');
});

// Test 9: Chart Dependencies
testSuite.test('Chart Dependencies', () => {
    testSuite.assert(typeof Chart !== 'undefined', 'Chart.js not loaded');
    testSuite.assert(testSuite.functionExists('createRadarChart'), 'createRadarChart function missing');
});

// Test 10: UI State Management
testSuite.test('UI State Management', () => {
    testSuite.assert(testSuite.functionExists('showSection'), 'showSection function missing');
    testSuite.assert(testSuite.functionExists('hideSection'), 'hideSection function missing');
    testSuite.assert(testSuite.functionExists('toggleSidebar'), 'toggleSidebar function missing');
});

// Functional Tests
testSuite.test('Diagnosis Flow Simulation', async () => {
    // Reset to initial state
    if (typeof currentStep !== 'undefined') {
        currentStep = 0;
    }
    
    // Start diagnosis
    if (testSuite.functionExists('startDiagnosis')) {
        startDiagnosis();
    }
    
    // Check if step 1 is visible
    const step1 = document.getElementById('step-1');
    testSuite.assert(step1 && !step1.classList.contains('hidden'), 'Step 1 should be visible after start');
});

testSuite.test('Club Scoring Algorithm', () => {
    if (testSuite.functionExists('calculateClubScore')) {
        // Test with sample data
        const sampleUser = {
            height: 170,
            weight: 70,
            experience: 'intermediate',
            swingSpeed: 'average',
            missTendency: 'slice',
            ballHeight: 'medium',
            priority: 'accuracy',
            budget: 'medium'
        };
        
        const sampleClub = window.clubDatabase[0];
        const score = calculateClubScore(sampleUser, sampleClub);
        
        testSuite.assert(typeof score === 'number', 'Score should be a number');
        testSuite.assert(score >= 0 && score <= 100, 'Score should be between 0 and 100');
    }
});

// Test 11: History Functionality
testSuite.test('History Save and Retrieve', () => {
    // Clear existing history
    localStorage.removeItem('diagnosisHistory');
    
    // Test saveToHistory function
    const testData = {
        height: 175,
        weight: 70,
        experience: 'intermediate',
        swingSpeed: 'average',
        missTendency: 'slice',
        ballHeight: 'medium',
        priority: 'accuracy',
        budget: 'medium'
    };
    
    if (testSuite.functionExists('saveToHistory')) {
        saveToHistory(testData);
        
        // Check if history was saved
        const savedHistory = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
        testSuite.assert(Array.isArray(savedHistory), 'History should be an array');
        testSuite.assert(savedHistory.length === 1, 'History should contain one item');
        testSuite.assert(savedHistory[0].data, 'History item should have data property');
        testSuite.assert(savedHistory[0].results, 'History item should have results property');
        testSuite.assert(savedHistory[0].timestamp, 'History item should have timestamp');
    }
});

// Export for use in browser
if (typeof window !== 'undefined') {
    window.RefactorTestSuite = RefactorTestSuite;
    window.refactorTests = testSuite;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RefactorTestSuite;
}