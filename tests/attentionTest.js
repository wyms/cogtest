class AttentionTest {
    constructor() {
        this.score = 0;
        this.maxScore = 20;
        this.subtests = [];
        this.currentSubtest = 0;
        this.callback = null;
        this.results = [];
        this.initSubtests();
    }

    initSubtests() {
        this.subtests = [
            {
                name: 'Digit Span Forward',
                type: 'digit_span_forward',
                description: 'Repeat number sequences in the same order',
                maxScore: 8
            },
            {
                name: 'Digit Span Backward',
                type: 'digit_span_backward', 
                description: 'Repeat number sequences in reverse order',
                maxScore: 7
            },
            {
                name: 'Serial Subtraction',
                type: 'serial_subtraction',
                description: 'Count backwards by 7s from 100',
                maxScore: 5
            }
        ];
    }

    start(callback = null) {
        this.callback = callback;
        this.score = 0;
        this.currentSubtest = 0;
        this.results = [];
        this.renderIntroduction();
    }

    renderIntroduction() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Attention & Concentration Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> This test measures your ability to focus attention and concentrate. It consists of three parts:</p>
                    <ul>
                        <li><strong>Digit Span Forward:</strong> Repeat numbers in the same order</li>
                        <li><strong>Digit Span Backward:</strong> Repeat numbers in reverse order</li>
                        <li><strong>Serial Subtraction:</strong> Count backwards by 7s</li>
                    </ul>
                    <p>Each part tests different aspects of attention and working memory.</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="start-attention">Begin Test</button>
                </div>
            </div>
        `;

        document.getElementById('start-attention').addEventListener('click', () => {
            this.startSubtest();
        });
    }

    startSubtest() {
        if (this.currentSubtest >= this.subtests.length) {
            this.showResults();
            return;
        }

        const subtest = this.subtests[this.currentSubtest];
        
        switch (subtest.type) {
            case 'digit_span_forward':
                this.startDigitSpanForward();
                break;
            case 'digit_span_backward':
                this.startDigitSpanBackward();
                break;
            case 'serial_subtraction':
                this.startSerialSubtraction();
                break;
        }
    }

    startDigitSpanForward() {
        const sequences = [
            [3, 7],
            [5, 2, 9],
            [4, 1, 8, 6],
            [7, 3, 9, 2, 5],
            [1, 8, 4, 6, 3, 7],
            [9, 2, 5, 8, 1, 4, 6],
            [3, 7, 1, 9, 5, 2, 8, 4]
        ];
        
        this.runDigitSpanTest(sequences, 'forward', 'Repeat the numbers in the same order');
    }

    startDigitSpanBackward() {
        const sequences = [
            [4, 2],
            [8, 5, 1],
            [6, 3, 9, 7],
            [2, 8, 4, 1, 6],
            [9, 3, 7, 2, 5, 4],
            [1, 6, 8, 3, 9, 2, 7]
        ];
        
        this.runDigitSpanTest(sequences, 'backward', 'Repeat the numbers in reverse order');
    }

    runDigitSpanTest(sequences, direction, instruction) {
        // Store test state as class properties to avoid scope issues
        this.digitSpanState = {
            currentSequence: 0,
            consecutiveFails: 0,
            subtestScore: 0,
            sequences: sequences,
            direction: direction,
            instruction: instruction
        };
        
        this.showDigitSpanSequence();
    }

    showDigitSpanSequence() {
        const state = this.digitSpanState;
        
        if (state.currentSequence >= state.sequences.length || state.consecutiveFails >= 2) {
            this.results.push({
                subtest: state.direction === 'forward' ? 'Digit Span Forward' : 'Digit Span Backward',
                score: state.subtestScore,
                maxScore: state.direction === 'forward' ? 8 : 7
            });
            this.score += state.subtestScore;
            this.currentSubtest++;
            this.startSubtest();
            return;
        }

        const sequence = state.sequences[state.currentSequence];
        const progress = ((this.currentSubtest * 33) + ((state.currentSequence / state.sequences.length) * 33)) / 100;
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Digit Span ${state.direction === 'forward' ? 'Forward' : 'Backward'}</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress * 100}%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> ${state.instruction}</p>
                    <p>Sequence ${state.currentSequence + 1} of ${state.sequences.length} (Length: ${sequence.length})</p>
                </div>
                
                <div class="sequence-display">
                    <div class="sequence-numbers" id="sequence-display">
                        Click "Show Sequence" to begin
                    </div>
                </div>
                
                <div class="answer-section" id="answer-section" style="display: none;">
                    <input type="text" id="digit-input" placeholder="Enter numbers separated by spaces" maxlength="20">
                    <button class="btn-primary" id="submit-digits">Submit</button>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="show-sequence">Show Sequence</button>
                </div>
            </div>
        `;

        document.getElementById('show-sequence').addEventListener('click', () => {
            this.displayDigitSpanSequence(sequence);
        });
    }

    displayDigitSpanSequence(sequence) {
        const display = document.getElementById('sequence-display');
        const showBtn = document.getElementById('show-sequence');
        const answerSection = document.getElementById('answer-section');
        const state = this.digitSpanState;
        
        showBtn.style.display = 'none';
        display.innerHTML = '';
        
        // Show numbers one by one
        let index = 0;
        const showNext = () => {
            if (index < sequence.length) {
                display.innerHTML = `<div class="current-digit">${sequence[index]}</div>`;
                index++;
                setTimeout(showNext, 1000);
            } else {
                display.innerHTML = '<div class="sequence-complete">Sequence complete - enter your answer</div>';
                answerSection.style.display = 'block';
                document.getElementById('digit-input').focus();
            }
        };
        
        setTimeout(showNext, 500);
        
        const submitAnswer = () => {
            const input = document.getElementById('digit-input').value.trim();
            const userSequence = input.split(/\s+/).map(num => parseInt(num)).filter(num => !isNaN(num));
            
            let expectedSequence = [...sequence];
            if (state.direction === 'backward') {
                expectedSequence = expectedSequence.reverse();
            }
            
            const isCorrect = userSequence.length === expectedSequence.length && 
                            userSequence.every((num, i) => num === expectedSequence[i]);
            
            if (isCorrect) {
                state.subtestScore++;
                state.consecutiveFails = 0;
            } else {
                state.consecutiveFails++;
            }
            
            // Show feedback briefly
            display.innerHTML = `
                <div class="sequence-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? 'Correct!' : 'Incorrect'}
                    <br>Expected: ${expectedSequence.join(' ')}
                    <br>Your answer: ${userSequence.join(' ') || '(no answer)'}
                </div>
            `;
            
            setTimeout(() => {
                state.currentSequence++;
                this.showDigitSpanSequence();
            }, 2000);
        };
        
        document.getElementById('submit-digits').addEventListener('click', submitAnswer);
        document.getElementById('digit-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
    }

    startSerialSubtraction() {
        const app = document.getElementById('app');
        const progress = (this.currentSubtest / this.subtests.length) * 100;
        
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Serial Subtraction</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> Starting with 100, subtract 7 each time. Continue until I tell you to stop.</p>
                    <p>For example: 100 - 7 = 93, then 93 - 7 = 86, and so on.</p>
                </div>
                
                <div class="serial-subtraction">
                    <div class="subtraction-chain">
                        <div class="subtraction-step">
                            <span class="step-number">Start:</span>
                            <span class="step-value">100</span>
                        </div>
                    </div>
                    
                    <div class="current-step">
                        <label>100 - 7 = </label>
                        <input type="number" id="subtract-input" placeholder="?" min="0" max="100">
                        <button class="btn-primary" id="submit-subtraction">Submit</button>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-secondary" id="stop-subtraction" style="display: none;">Stop Test</button>
                </div>
            </div>
        `;

        this.runSerialSubtraction();
    }

    runSerialSubtraction() {
        let currentValue = 100;
        let stepCount = 0;
        let correctAnswers = 0;
        const expectedAnswers = [93, 86, 79, 72, 65];
        
        const processStep = () => {
            const input = document.getElementById('subtract-input');
            const userAnswer = parseInt(input.value);
            const expectedAnswer = expectedAnswers[stepCount];
            const isCorrect = userAnswer === expectedAnswer;
            
            if (isCorrect) {
                correctAnswers++;
            }
            
            // Add step to chain
            const chain = document.querySelector('.subtraction-chain');
            const stepDiv = document.createElement('div');
            stepDiv.className = `subtraction-step ${isCorrect ? 'correct' : 'incorrect'}`;
            stepDiv.innerHTML = `
                <span class="step-number">Step ${stepCount + 1}:</span>
                <span class="step-value">${currentValue} - 7 = ${userAnswer}</span>
                <span class="step-result">${isCorrect ? '✓' : '✗'}</span>
            `;
            chain.appendChild(stepDiv);
            
            stepCount++;
            currentValue = userAnswer;
            
            if (stepCount >= 5 || currentValue < 65) {
                // Test complete
                this.results.push({
                    subtest: 'Serial Subtraction',
                    score: correctAnswers,
                    maxScore: 5
                });
                this.score += correctAnswers;
                this.currentSubtest++;
                
                setTimeout(() => {
                    this.startSubtest();
                }, 1500);
                return;
            }
            
            // Update for next step
            const currentStep = document.querySelector('.current-step');
            currentStep.innerHTML = `
                <label>${currentValue} - 7 = </label>
                <input type="number" id="subtract-input" placeholder="?" min="0" max="100">
                <button class="btn-primary" id="submit-subtraction">Submit</button>
            `;
            
            // Re-bind events
            document.getElementById('submit-subtraction').addEventListener('click', processStep);
            document.getElementById('subtract-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    processStep();
                }
            });
            document.getElementById('subtract-input').focus();
        };
        
        document.getElementById('submit-subtraction').addEventListener('click', processStep);
        document.getElementById('subtract-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processStep();
            }
        });
        document.getElementById('subtract-input').focus();
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

        const resultsHtml = this.results.map(result => 
            `<p><strong>${result.subtest}:</strong> ${result.score}/${result.maxScore}</p>`
        ).join('');

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Attention Test Results</h2>
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
                        ${resultsHtml}
                    </div>
                </div>
                
                <div class="attention-feedback">
                    <h4>What This Measures:</h4>
                    <p>Attention tests evaluate working memory, concentration, and mental flexibility. These abilities are essential for daily tasks and can be affected by stress, fatigue, or cognitive changes.</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="continue-next">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-next').addEventListener('click', () => {
            if (window.app) {
                window.app.saveTestResult('attention', this.score, {
                    percentage,
                    subtests: this.results
                });
            }
            
            if (this.callback) {
                this.callback();
            } else {
                window.location.reload();
            }
        });
    }
}