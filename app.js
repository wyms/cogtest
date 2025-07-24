class CognitiveTestApp {
    constructor() {
        this.currentTest = null;
        this.testResults = [];
        this.currentUser = null;
        this.auth = null;
        this.db = null;
        this.testModules = {
            memory: new MemoryTest(),
            attention: new AttentionTest(),
            orientation: new OrientationTest(),
            language: new LanguageTest(),
            visuospatial: new VisuospatialTest()
        };
        this.initFirebase();
    }

    async initFirebase() {
        // Wait for Firebase to be available
        while (!window.Firebase) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const firebaseConfig = {
            apiKey: "AIzaSyDxoJxZCpQ2QYPRCBOGguhXDsEDjY_K9Es",
            authDomain: "cogtest-ee9cd.firebaseapp.com",
            projectId: "cogtest-ee9cd",
            storageBucket: "cogtest-ee9cd.appspot.com",
            messagingSenderId: "53360309728",
            appId: "1:53360309728:web:cogtest"
        };

        const app = window.Firebase.initializeApp(firebaseConfig);
        this.auth = window.Firebase.getAuth(app);
        this.db = window.Firebase.getFirestore(app);

        // Listen for auth state changes
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        onAuthStateChanged(this.auth, (user) => {
            this.onAuthStateChanged(user);
        });
    }

    onAuthStateChanged(user) {
        this.currentUser = user;
        if (user) {
            this.loadUserResults();
            this.renderMainMenu();
        } else {
            this.testResults = [];
            if (window.authManager) {
                window.authManager.showLoginForm();
            }
        }
        this.bindEvents();
    }

    renderMainMenu() {
        if (!this.currentUser) return;
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="user-info">
                <span class="user-email">${this.currentUser.email}</span>
                <button class="sign-out-btn" id="sign-out">Sign Out</button>
            </div>
            <div class="main-menu">
                <h1>CogTest - Cognitive Assessment</h1>
                <div class="test-selection">
                    <button class="test-btn" data-test="memory">Memory Test</button>
                    <button class="test-btn" data-test="attention">Attention Test</button>
                    <button class="test-btn" data-test="orientation">Orientation Test</button>
                    <button class="test-btn" data-test="language">Language Test</button>
                    <button class="test-btn" data-test="visuospatial">Visuospatial Test</button>
                </div>
                <div class="actions">
                    <button class="btn-secondary" id="view-results">View Results</button>
                    <button class="btn-primary" id="start-full-battery">Start Full Assessment</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('test-btn')) {
                const testType = e.target.dataset.test;
                this.startTest(testType);
            }
            
            if (e.target.id === 'start-full-battery') {
                this.startFullAssessment();
            }
            
            if (e.target.id === 'view-results') {
                this.showResults();
            }
            
            if (e.target.id === 'sign-out') {
                this.signOut();
            }
        });
    }

    startTest(testType) {
        this.currentTest = this.testModules[testType];
        this.currentTest.start();
    }

    startFullAssessment() {
        // Run all tests in sequence
        const testOrder = ['orientation', 'memory', 'attention', 'language', 'visuospatial'];
        this.runTestBattery(testOrder, 0);
    }

    runTestBattery(tests, index) {
        if (index >= tests.length) {
            this.showFinalResults();
            return;
        }
        
        const testType = tests[index];
        this.currentTest = this.testModules[testType];
        this.currentTest.start(() => {
            this.runTestBattery(tests, index + 1);
        });
    }

    async saveTestResult(testType, score, details) {
        const result = {
            testType,
            score,
            details,
            timestamp: new Date().toISOString(),
            userId: this.currentUser.uid
        };
        
        this.testResults.push(result);
        
        // Save to Firestore
        try {
            const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await addDoc(collection(this.db, 'testResults'), result);
        } catch (error) {
            console.error('Error saving test result:', error);
        }
    }

    showResults() {
        this.renderResultsDashboard();
    }

    renderResultsDashboard() {
        if (this.testResults.length === 0) {
            this.showNoResults();
            return;
        }

        const app = document.getElementById('app');
        const totalTests = this.testResults.length;
        const averageScore = this.testResults.reduce((sum, result) => sum + result.score, 0) / totalTests;
        const maxPossibleScore = this.testResults.reduce((sum, result) => sum + (result.details.maxScore || 30), 0) / totalTests;
        const overallPercentage = Math.round((averageScore / maxPossibleScore) * 100);

        let overallClass = 'score-needs-improvement';
        let overallInterpretation = 'Needs Improvement';
        
        if (overallPercentage >= 80) {
            overallClass = 'score-excellent';
            overallInterpretation = 'Excellent';
        } else if (overallPercentage >= 60) {
            overallClass = 'score-good';
            overallInterpretation = 'Good';
        }

        const resultsHtml = this.testResults.map((result, index) => {
            const testDate = new Date(result.timestamp).toLocaleDateString();
            const testTime = new Date(result.timestamp).toLocaleTimeString();
            
            return `
                <div class="result-item" data-index="${index}">
                    <div class="result-header">
                        <h4>${this.getTestDisplayName(result.testType)}</h4>
                        <div class="result-meta">
                            <span class="result-date">${testDate} ${testTime}</span>
                        </div>
                    </div>
                    <div class="result-score">
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${result.details.percentage || 0}%"></div>
                        </div>
                        <span class="score-text">${result.score}/${result.details.maxScore || 30} (${result.details.percentage || 0}%)</span>
                    </div>
                    <button class="btn-secondary view-detail" data-index="${index}">View Details</button>
                </div>
            `;
        }).join('');

        app.innerHTML = `
            <div class="results-dashboard">
                <div class="dashboard-header">
                    <h1>Cognitive Assessment Results</h1>
                    <div class="overall-score ${overallClass}">
                        <div class="overall-percentage">${overallPercentage}%</div>
                        <div class="overall-label">Overall Performance: ${overallInterpretation}</div>
                    </div>
                </div>

                <div class="results-summary">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <div class="stat-value">${totalTests}</div>
                            <div class="stat-label">Tests Completed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${averageScore.toFixed(1)}</div>
                            <div class="stat-label">Average Score</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${new Date(this.testResults[this.testResults.length - 1].timestamp).toLocaleDateString()}</div>
                            <div class="stat-label">Last Assessment</div>
                        </div>
                    </div>
                </div>

                <div class="results-list">
                    <h3>Test Results</h3>
                    ${resultsHtml}
                </div>

                <div class="dashboard-actions">
                    <button class="btn-secondary" id="export-results">Export Results</button>
                    <button class="btn-secondary" id="clear-results">Clear All Results</button>
                    <button class="btn-primary" id="back-to-menu">Back to Main Menu</button>
                </div>
            </div>
        `;

        this.bindResultsEvents();
    }

    showNoResults() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="no-results">
                <h2>No Test Results Available</h2>
                <p>You haven't completed any cognitive assessments yet.</p>
                <div class="test-actions">
                    <button class="btn-primary" id="back-to-menu">Back to Main Menu</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.renderMainMenu();
        });
    }

    getTestDisplayName(testType) {
        const names = {
            'memory': 'Memory Test',
            'attention': 'Attention & Concentration',
            'orientation': 'Orientation Test',
            'language': 'Language Test',
            'visuospatial': 'Visuospatial Test'
        };
        return names[testType] || testType;
    }

    bindResultsEvents() {
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.renderMainMenu();
        });

        document.getElementById('export-results').addEventListener('click', () => {
            this.exportResults();
        });

        document.getElementById('clear-results').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all test results? This action cannot be undone.')) {
                this.testResults = [];
                this.showNoResults();
            }
        });

        document.querySelectorAll('.view-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.showDetailedResults(index);
            });
        });
    }

    showDetailedResults(index) {
        const result = this.testResults[index];
        const app = document.getElementById('app');

        let detailsHtml = '';
        
        if (result.testType === 'memory') {
            const breakdown = result.details.breakdown;
            detailsHtml = `
                <div class="detailed-breakdown">
                    <h4>Memory Test Breakdown:</h4>
                    <p><strong>Immediate Recall:</strong> ${breakdown[0].score}/3 points</p>
                    <p><strong>Attention Task:</strong> ${breakdown[1].score}/5 points</p>
                    <p><strong>Delayed Recall:</strong> ${breakdown[2].score}/6 points</p>
                    <p><strong>Word List:</strong> ${result.details.wordList.join(', ')}</p>
                </div>
            `;
        } else if (result.testType === 'attention') {
            const subtests = result.details.subtests;
            detailsHtml = `
                <div class="detailed-breakdown">
                    <h4>Attention Test Breakdown:</h4>
                    ${subtests.map(subtest => 
                        `<p><strong>${subtest.subtest}:</strong> ${subtest.score}/${subtest.maxScore} points</p>`
                    ).join('')}
                </div>
            `;
        } else if (result.testType === 'orientation') {
            detailsHtml = `
                <div class="detailed-breakdown">
                    <h4>Orientation Test Breakdown:</h4>
                    <p><strong>Time Orientation:</strong> ${result.details.timeScore}/${result.details.answers.filter(a => a.category === 'time').length} correct</p>
                    <p><strong>Place Orientation:</strong> ${result.details.placeScore}/${result.details.answers.filter(a => a.category === 'place').length} correct</p>
                </div>
            `;
        }

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>${this.getTestDisplayName(result.testType)} - Detailed Results</h2>
                </div>
                
                <div class="result-overview">
                    <div class="score-display">
                        Score: ${result.score}/${result.details.maxScore || 30} (${result.details.percentage}%)
                    </div>
                    <div class="test-date">
                        Completed: ${new Date(result.timestamp).toLocaleString()}
                    </div>
                </div>

                ${detailsHtml}

                <div class="cognitive-interpretation">
                    <h4>Clinical Significance:</h4>
                    <p><strong>Disclaimer:</strong> This is a screening tool only and should not be used for diagnosis. Consult a healthcare professional for proper cognitive assessment.</p>
                    ${this.getClinicalInterpretation(result.testType, result.details.percentage)}
                </div>

                <div class="test-actions">
                    <button class="btn-secondary" id="retake-test">Retake This Test</button>
                    <button class="btn-primary" id="back-to-results">Back to Results</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-results').addEventListener('click', () => {
            this.showResults();
        });

        document.getElementById('retake-test').addEventListener('click', () => {
            this.startTest(result.testType);
        });
    }

    getClinicalInterpretation(testType, percentage) {
        let interpretation = '';
        
        if (percentage >= 80) {
            interpretation = '<p class="score-excellent">Performance is within normal limits. This suggests good cognitive function in this domain.</p>';
        } else if (percentage >= 60) {
            interpretation = '<p class="score-good">Performance is borderline. Some mild difficulties may be present but could be due to various factors including fatigue, stress, or lack of familiarity with testing.</p>';
        } else {
            interpretation = '<p class="score-needs-improvement">Performance is below expected levels. This may warrant further evaluation by a qualified healthcare professional, though many factors can affect test performance.</p>';
        }

        const domainInfo = {
            'memory': 'Memory tests assess short-term recall and working memory, which are often affected early in dementia.',
            'attention': 'Attention tests measure concentration and mental control, which can be affected by stress, depression, or cognitive impairment.',
            'orientation': 'Orientation assesses awareness of time and place, fundamental cognitive abilities that help detect significant cognitive changes.',
            'language': 'Language tests evaluate naming, repetition, and word-finding abilities, which can indicate specific types of cognitive decline.',
            'visuospatial': 'Visuospatial tests assess perception and spatial processing, important for daily activities like driving and navigation.'
        };

        return interpretation + `<p><strong>About ${this.getTestDisplayName(testType)}:</strong> ${domainInfo[testType]}</p>`;
    }

    exportResults() {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTests: this.testResults.length,
            results: this.testResults.map(result => ({
                testType: result.testType,
                score: result.score,
                percentage: result.details.percentage,
                timestamp: result.timestamp,
                maxScore: result.details.maxScore || 30
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cognitive-test-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async loadUserResults() {
        if (!this.currentUser) return;
        
        try {
            const { getDocs, collection, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const q = query(
                collection(this.db, 'testResults'),
                where('userId', '==', this.currentUser.uid),
                orderBy('timestamp', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            this.testResults = [];
            querySnapshot.forEach((doc) => {
                this.testResults.push(doc.data());
            });
        } catch (error) {
            console.error('Error loading user results:', error);
            this.testResults = [];
        }
    }

    async signOut() {
        try {
            const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            await signOut(this.auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    showFinalResults() {
        // Calculate overall cognitive score
        const totalScore = this.testResults.reduce((sum, result) => sum + result.score, 0);
        const averageScore = totalScore / this.testResults.length;
        
        console.log(`Assessment Complete. Average Score: ${averageScore.toFixed(1)}`);
        this.renderMainMenu();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CognitiveTestApp();
});