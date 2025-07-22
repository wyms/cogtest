class OrientationTest {
    constructor() {
        this.score = 0;
        this.maxScore = 10;
        this.questions = [];
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.callback = null;
        this.initQuestions();
    }

    initQuestions() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentDate = now.getDate();
        const currentDay = now.toLocaleString('default', { weekday: 'long' });
        const currentSeason = this.getCurrentSeason();

        this.questions = [
            {
                question: "What year is it?",
                type: "input",
                correctAnswer: currentYear.toString(),
                category: "time"
            },
            {
                question: "What season are we in?",
                type: "multiple",
                options: ["Spring", "Summer", "Fall/Autumn", "Winter"],
                correctAnswer: currentSeason,
                category: "time"
            },
            {
                question: "What month is it?",
                type: "multiple",
                options: ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"],
                correctAnswer: currentMonth,
                category: "time"
            },
            {
                question: "What is today's date?",
                type: "input",
                correctAnswer: currentDate.toString(),
                category: "time",
                tolerance: 1 // Allow ±1 day
            },
            {
                question: "What day of the week is it?",
                type: "multiple",
                options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                correctAnswer: currentDay,
                category: "time"
            },
            {
                question: "What country are we in?",
                type: "input",
                correctAnswer: "united states",
                alternativeAnswers: ["usa", "us", "america", "united states of america"],
                category: "place"
            },
            {
                question: "What state/province are we in?",
                type: "input",
                correctAnswer: "", // This would need to be configured
                category: "place",
                note: "Answer based on your current location"
            },
            {
                question: "What city are we in?",
                type: "input",
                correctAnswer: "", // This would need to be configured
                category: "place",
                note: "Answer based on your current location"
            },
            {
                question: "What type of place is this?",
                type: "multiple",
                options: ["Hospital", "Home", "Office", "School", "Clinic", "Other"],
                correctAnswer: "Home", // Default assumption
                category: "place"
            },
            {
                question: "What floor/level are we on?",
                type: "multiple",
                options: ["Ground/First Floor", "Second Floor", "Third Floor", "Fourth Floor", "Higher"],
                correctAnswer: "Ground/First Floor", // Default assumption
                category: "place"
            }
        ];
    }

    getCurrentSeason() {
        const now = new Date();
        const month = now.getMonth() + 1; // JavaScript months are 0-indexed
        
        if (month >= 3 && month <= 5) return "Spring";
        if (month >= 6 && month <= 8) return "Summer";
        if (month >= 9 && month <= 11) return "Fall/Autumn";
        return "Winter";
    }

    start(callback = null) {
        this.callback = callback;
        this.score = 0;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.renderIntroduction();
    }

    renderIntroduction() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Orientation Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> I'm going to ask you some questions about time and place. Please answer as accurately as you can.</p>
                    <p>This test evaluates your awareness of your current surroundings and the current time.</p>
                </div>
                
                <div class="test-info">
                    <p><strong>Questions:</strong> ${this.questions.length}</p>
                    <p><strong>Time:</strong> No time limit</p>
                    <p><strong>Scoring:</strong> 1 point per correct answer</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="start-orientation">Begin Test</button>
                </div>
            </div>
        `;

        document.getElementById('start-orientation').addEventListener('click', () => {
            this.renderQuestion();
        });
    }

    renderQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        const app = document.getElementById('app');

        let questionHtml = '';
        
        if (question.type === 'multiple') {
            questionHtml = `
                <div class="question-container">
                    <div class="question">${question.question}</div>
                    <div class="answer-options">
                        ${question.options.map((option, index) => 
                            `<button class="answer-btn" data-answer="${option}">${option}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
        } else {
            questionHtml = `
                <div class="question-container">
                    <div class="question">${question.question}</div>
                    ${question.note ? `<div class="question-note">${question.note}</div>` : ''}
                    <div class="answer-input">
                        <input type="text" id="answer-input" placeholder="Type your answer here..." autocomplete="off">
                    </div>
                </div>
            `;
        }

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Orientation Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="question-counter">Question ${this.currentQuestion + 1} of ${this.questions.length}</div>
                </div>
                
                ${questionHtml}
                
                <div class="test-actions">
                    <button class="btn-primary" id="submit-answer" disabled>Submit Answer</button>
                    ${this.currentQuestion > 0 ? '<button class="btn-secondary" id="previous-question">Previous</button>' : ''}
                </div>
            </div>
        `;

        this.bindQuestionEvents();
    }

    bindQuestionEvents() {
        const question = this.questions[this.currentQuestion];
        const submitBtn = document.getElementById('submit-answer');

        if (question.type === 'multiple') {
            document.querySelectorAll('.answer-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Remove previous selection
                    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
                    // Select current
                    e.target.classList.add('selected');
                    submitBtn.disabled = false;
                });
            });
        } else {
            const input = document.getElementById('answer-input');
            input.addEventListener('input', () => {
                submitBtn.disabled = input.value.trim() === '';
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !submitBtn.disabled) {
                    this.submitAnswer();
                }
            });
            input.focus();
        }

        submitBtn.addEventListener('click', () => {
            this.submitAnswer();
        });

        const prevBtn = document.getElementById('previous-question');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousQuestion();
            });
        }
    }

    submitAnswer() {
        const question = this.questions[this.currentQuestion];
        let userAnswer = '';
        let isCorrect = false;

        if (question.type === 'multiple') {
            const selected = document.querySelector('.answer-btn.selected');
            if (selected) {
                userAnswer = selected.dataset.answer;
                isCorrect = userAnswer === question.correctAnswer;
            }
        } else {
            userAnswer = document.getElementById('answer-input').value.trim();
            isCorrect = this.checkAnswer(userAnswer, question);
        }

        // Store the answer
        this.userAnswers[this.currentQuestion] = {
            question: question.question,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            category: question.category
        };

        if (isCorrect) {
            this.score++;
        }

        this.currentQuestion++;
        this.renderQuestion();
    }

    checkAnswer(userAnswer, question) {
        const normalizedAnswer = userAnswer.toLowerCase().trim();
        const normalizedCorrect = question.correctAnswer.toLowerCase().trim();

        // Check exact match
        if (normalizedAnswer === normalizedCorrect) {
            return true;
        }

        // Check alternative answers if provided
        if (question.alternativeAnswers) {
            return question.alternativeAnswers.some(alt => 
                normalizedAnswer === alt.toLowerCase().trim()
            );
        }

        // Check tolerance for numeric answers (like dates)
        if (question.tolerance && !isNaN(userAnswer) && !isNaN(question.correctAnswer)) {
            const userNum = parseInt(userAnswer);
            const correctNum = parseInt(question.correctAnswer);
            return Math.abs(userNum - correctNum) <= question.tolerance;
        }

        return false;
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
        }
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

        // Calculate category scores
        const timeQuestions = this.userAnswers.filter(a => a.category === 'time');
        const placeQuestions = this.userAnswers.filter(a => a.category === 'place');
        const timeScore = timeQuestions.filter(a => a.isCorrect).length;
        const placeScore = placeQuestions.filter(a => a.isCorrect).length;

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Orientation Test Results</h2>
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
                        <p><strong>Time Orientation:</strong> ${timeScore}/${timeQuestions.length} correct</p>
                        <p><strong>Place Orientation:</strong> ${placeScore}/${placeQuestions.length} correct</p>
                    </div>
                </div>
                
                <div class="orientation-feedback">
                    <h4>What This Measures:</h4>
                    <p>Orientation tests assess your awareness of time and place, which are fundamental cognitive abilities. Good orientation indicates intact memory and attention functions.</p>
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
                window.app.saveTestResult('orientation', this.score, {
                    percentage,
                    timeScore,
                    placeScore,
                    answers: this.userAnswers
                });
            }
            
            if (this.callback) {
                this.callback();
            } else {
                window.location.reload();
            }
        });

        document.getElementById('review-answers').addEventListener('click', () => {
            this.showDetailedReview();
        });
    }

    showDetailedReview() {
        const app = document.getElementById('app');
        
        const reviewHtml = this.userAnswers.map((answer, index) => `
            <div class="review-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-question">Q${index + 1}: ${answer.question}</div>
                <div class="review-answer">
                    <span class="user-answer">Your answer: ${answer.userAnswer || '(no answer)'}</span>
                    ${!answer.isCorrect ? `<span class="correct-answer">Correct answer: ${answer.correctAnswer}</span>` : ''}
                    <span class="answer-result">${answer.isCorrect ? '✓' : '✗'}</span>
                </div>
            </div>
        `).join('');

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Orientation Test - Detailed Review</h2>
                </div>
                
                <div class="review-summary">
                    <p>Score: ${this.score}/${this.maxScore} (${Math.round((this.score / this.maxScore) * 100)}%)</p>
                </div>
                
                <div class="review-list">
                    ${reviewHtml}
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