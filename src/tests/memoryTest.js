class MemoryTest {
    constructor() {
        this.currentPhase = 'immediate';
        this.wordList = [];
        this.userResponses = [];
        this.score = 0;
        this.maxScore = 15;
        this.callback = null;
        
        // Common word lists used in cognitive assessments
        this.wordLists = [
            ['apple', 'penny', 'table'],
            ['ball', 'flag', 'tree'],
            ['face', 'velvet', 'church'],
            ['daisy', 'red', 'eyedrop']
        ];
    }

    start(callback = null) {
        this.callback = callback;
        this.wordList = this.wordLists[Math.floor(Math.random() * this.wordLists.length)];
        this.userResponses = [];
        this.score = 0;
        this.currentPhase = 'immediate';
        this.renderTest();
    }

    renderTest() {
        const app = document.getElementById('app');
        
        if (this.currentPhase === 'immediate') {
            app.innerHTML = `
                <div class="test-container">
                    <div class="test-header">
                        <h2>Memory Test - Immediate Recall</h2>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 33%"></div>
                        </div>
                    </div>
                    
                    <div class="test-instructions">
                        <p><strong>Instructions:</strong> I will show you three words. Please remember them as I will ask you to repeat them back immediately, and again after a few minutes.</p>
                    </div>
                    
                    <div class="word-display">
                        <h3>Please remember these words:</h3>
                        <div class="word-list">
                            ${this.wordList.map(word => `<div class="word-item">${word.toUpperCase()}</div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="test-actions">
                        <button class="btn-primary" id="continue-memory">I've Read the Words</button>
                    </div>
                </div>
            `;
            
            document.getElementById('continue-memory').addEventListener('click', () => {
                this.startImmediateRecall();
            });
            
        } else if (this.currentPhase === 'immediate-recall') {
            this.renderImmediateRecall();
        } else if (this.currentPhase === 'distraction') {
            this.renderDistraction();
        } else if (this.currentPhase === 'delayed-recall') {
            this.renderDelayedRecall();
        } else if (this.currentPhase === 'recognition') {
            this.renderRecognition();
        }
    }

    startImmediateRecall() {
        this.currentPhase = 'immediate-recall';
        this.renderTest();
    }

    renderImmediateRecall() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Memory Test - Immediate Recall</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 50%"></div>
                    </div>
                </div>
                
                <div class="question-container">
                    <div class="question">Please type the three words you just saw:</div>
                    <div class="word-inputs">
                        <input type="text" class="word-input" placeholder="First word" data-index="0">
                        <input type="text" class="word-input" placeholder="Second word" data-index="1">
                        <input type="text" class="word-input" placeholder="Third word" data-index="2">
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="submit-immediate">Submit Answers</button>
                </div>
            </div>
        `;

        document.getElementById('submit-immediate').addEventListener('click', () => {
            this.collectImmediateResponses();
        });
    }

    collectImmediateResponses() {
        const inputs = document.querySelectorAll('.word-input');
        const immediateResponses = Array.from(inputs).map(input => input.value.toLowerCase().trim());
        
        // Score immediate recall (1 point per correct word)
        let immediateScore = 0;
        immediateResponses.forEach((response, index) => {
            if (response === this.wordList[index]) {
                immediateScore++;
            }
        });
        
        this.score += immediateScore;
        this.userResponses.push({
            phase: 'immediate',
            responses: immediateResponses,
            score: immediateScore
        });
        
        this.currentPhase = 'distraction';
        this.renderTest();
    }

    renderDistraction() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Memory Test - Attention Task</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> Now we'll do a quick attention task. Count backwards from 100 by 7s. Stop when you reach a number below 65.</p>
                </div>
                
                <div class="question-container">
                    <div class="question">Starting from 100, subtract 7 each time:</div>
                    <div class="counting-inputs">
                        <input type="number" class="count-input" placeholder="100 - 7 = ?" data-expected="93">
                        <input type="number" class="count-input" placeholder="93 - 7 = ?" data-expected="86">
                        <input type="number" class="count-input" placeholder="86 - 7 = ?" data-expected="79">
                        <input type="number" class="count-input" placeholder="79 - 7 = ?" data-expected="72">
                        <input type="number" class="count-input" placeholder="72 - 7 = ?" data-expected="65">
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="finish-distraction">Continue to Delayed Recall</button>
                </div>
            </div>
        `;

        document.getElementById('finish-distraction').addEventListener('click', () => {
            this.scoreDistraction();
        });
    }

    scoreDistraction() {
        const inputs = document.querySelectorAll('.count-input');
        let distractionScore = 0;
        
        inputs.forEach(input => {
            const expected = parseInt(input.dataset.expected);
            const actual = parseInt(input.value);
            if (actual === expected) {
                distractionScore++;
            }
        });
        
        this.score += distractionScore;
        this.userResponses.push({
            phase: 'distraction',
            score: distractionScore,
            maxScore: 5
        });
        
        this.currentPhase = 'delayed-recall';
        this.renderTest();
    }

    renderDelayedRecall() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Memory Test - Delayed Recall</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 90%"></div>
                    </div>
                </div>
                
                <div class="question-container">
                    <div class="question">Now, please try to remember the three words from the beginning of the test:</div>
                    <div class="word-inputs">
                        <input type="text" class="word-input" placeholder="First word" data-index="0">
                        <input type="text" class="word-input" placeholder="Second word" data-index="1">
                        <input type="text" class="word-input" placeholder="Third word" data-index="2">
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="submit-delayed">Submit Final Answers</button>
                </div>
            </div>
        `;

        document.getElementById('submit-delayed').addEventListener('click', () => {
            this.collectDelayedResponses();
        });
    }

    collectDelayedResponses() {
        const inputs = document.querySelectorAll('.word-input');
        const delayedResponses = Array.from(inputs).map(input => input.value.toLowerCase().trim());
        
        // Score delayed recall (2 points per correct word)
        let delayedScore = 0;
        delayedResponses.forEach((response, index) => {
            if (response === this.wordList[index]) {
                delayedScore += 2;
            }
        });
        
        this.score += delayedScore;
        this.userResponses.push({
            phase: 'delayed',
            responses: delayedResponses,
            score: delayedScore
        });
        
        this.showResults();
    }

    showResults() {
        const app = document.getElementById('app');
        const percentage = Math.round((this.score / this.maxScore) * 100);
        let scoreClass = 'score-needs-improvement';
        let interpretation = 'Needs Improvement';
        
        if (percentage >= 80) {
            scoreClass = 'score-excellent';
            interpretation = 'Excellent';
        } else if (percentage >= 60) {
            scoreClass = 'score-good';
            interpretation = 'Good';
        }

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Memory Test Results</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 100%"></div>
                    </div>
                </div>
                
                <div class="score-display ${scoreClass}">
                    ${this.score}/${this.maxScore} (${percentage}%)
                </div>
                
                <div class="score-interpretation">
                    <h3>Performance: ${interpretation}</h3>
                    <div class="score-breakdown">
                        <p><strong>Immediate Recall:</strong> ${this.userResponses[0].score}/3 points</p>
                        <p><strong>Attention Task:</strong> ${this.userResponses[1].score}/5 points</p>
                        <p><strong>Delayed Recall:</strong> ${this.userResponses[2].score}/6 points</p>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-secondary" id="review-answers">Review Answers</button>
                    <button class="btn-primary" id="continue-next">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-next').addEventListener('click', () => {
            // Save results to main app
            if (window.app) {
                window.app.saveTestResult('memory', this.score, {
                    percentage,
                    breakdown: this.userResponses,
                    wordList: this.wordList
                });
            }
            
            if (this.callback) {
                this.callback();
            } else {
                // Return to main menu
                window.location.reload();
            }
        });

        document.getElementById('review-answers').addEventListener('click', () => {
            this.showDetailedReview();
        });
    }

    showDetailedReview() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Memory Test - Detailed Review</h2>
                </div>
                
                <div class="review-section">
                    <h3>Original Words:</h3>
                    <div class="word-list">
                        ${this.wordList.map(word => `<div class="word-item correct">${word.toUpperCase()}</div>`).join('')}
                    </div>
                </div>
                
                <div class="review-section">
                    <h3>Your Immediate Recall:</h3>
                    <div class="response-review">
                        ${this.userResponses[0].responses.map((response, index) => {
                            const isCorrect = response === this.wordList[index];
                            return `<div class="response-item ${isCorrect ? 'correct' : 'incorrect'}">
                                ${response || '(no answer)'} ${isCorrect ? '✓' : '✗'}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                
                <div class="review-section">
                    <h3>Your Delayed Recall:</h3>
                    <div class="response-review">
                        ${this.userResponses[2].responses.map((response, index) => {
                            const isCorrect = response === this.wordList[index];
                            return `<div class="response-item ${isCorrect ? 'correct' : 'incorrect'}">
                                ${response || '(no answer)'} ${isCorrect ? '✓' : '✗'}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="back-to-results">Back to Results</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-results').addEventListener('click', () => {
            this.showResults();
        });
    }
}