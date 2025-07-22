class VisuospatialTest {
    constructor() {
        this.score = 0;
        this.maxScore = 15;
        this.subtests = [];
        this.currentSubtest = 0;
        this.callback = null;
        this.results = [];
        this.initSubtests();
    }

    initSubtests() {
        this.subtests = [
            {
                name: 'Clock Drawing',
                type: 'clock_drawing',
                description: 'Draw a clock showing a specific time',
                maxScore: 6
            },
            {
                name: 'Cube Copying',
                type: 'cube_copying',
                description: 'Copy a three-dimensional cube',
                maxScore: 4
            },
            {
                name: 'Pattern Recognition',
                type: 'pattern_recognition',
                description: 'Identify missing pieces in visual patterns',
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
                    <h2>Visuospatial Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> This test evaluates your ability to perceive and manipulate visual and spatial information.</p>
                    <ul>
                        <li><strong>Clock Drawing:</strong> Draw a clock face with hands showing a specific time</li>
                        <li><strong>Cube Copying:</strong> Copy a three-dimensional cube drawing</li>
                        <li><strong>Pattern Recognition:</strong> Complete visual patterns</li>
                    </ul>
                    <p>You can use your mouse or finger (on touch devices) to draw.</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="start-visuospatial">Begin Test</button>
                </div>
            </div>
        `;

        document.getElementById('start-visuospatial').addEventListener('click', () => {
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
            case 'clock_drawing':
                this.startClockDrawing();
                break;
            case 'cube_copying':
                this.startCubeCopying();
                break;
            case 'pattern_recognition':
                this.startPatternRecognition();
                break;
        }
    }

    startClockDrawing() {
        const app = document.getElementById('app');
        const progress = (this.currentSubtest / this.subtests.length) * 100;

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Clock Drawing Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> Draw a clock face in the circle below. Include all the numbers and draw the hands to show the time <strong>10:10</strong> (ten past ten).</p>
                    <p>Use your mouse to draw. Click "Clear" to start over if needed.</p>
                </div>
                
                <div class="drawing-area">
                    <canvas id="clock-canvas" width="300" height="300"></canvas>
                    <div class="drawing-controls">
                        <button class="btn-secondary" id="clear-clock">Clear</button>
                        <button class="btn-primary" id="submit-clock">Submit Drawing</button>
                    </div>
                </div>
                
                <div class="clock-criteria">
                    <h4>Scoring Criteria:</h4>
                    <ul>
                        <li>Circle drawn (1 point)</li>
                        <li>Numbers 1-12 present (1 point)</li>
                        <li>Numbers in correct positions (1 point)</li>
                        <li>Two hands present (1 point)</li>
                        <li>Hour hand pointing to 10 (1 point)</li>
                        <li>Minute hand pointing to 2 (1 point)</li>
                    </ul>
                </div>
            </div>
        `;

        this.initDrawingCanvas('clock-canvas', true);
        
        document.getElementById('clear-clock').addEventListener('click', () => {
            this.clearCanvas('clock-canvas');
        });
        
        document.getElementById('submit-clock').addEventListener('click', () => {
            this.evaluateClockDrawing();
        });
    }

    initDrawingCanvas(canvasId, showCircle = false) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Set up canvas
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        if (showCircle) {
            // Draw initial circle for clock
            ctx.beginPath();
            ctx.arc(150, 150, 120, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        const startDrawing = (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            lastX = currentX;
            lastY = currentY;
        };
        
        const stopDrawing = () => {
            isDrawing = false;
        };
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
    }

    clearCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (canvasId === 'clock-canvas') {
            // Redraw the initial circle
            ctx.beginPath();
            ctx.arc(150, 150, 120, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    evaluateClockDrawing() {
        // For demo purposes, we'll use a simplified scoring system
        // In a real application, this would use image analysis
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Clock Drawing - Self Evaluation</h2>
                </div>
                
                <div class="self-evaluation">
                    <p>Please evaluate your own drawing honestly. Check each item that applies to your clock:</p>
                    
                    <div class="criteria-checklist">
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>I drew a complete circle</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>All numbers 1-12 are present</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>Numbers are in approximately correct positions</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>I drew two hands (hour and minute)</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>Hour hand points to 10 (or between 10 and 11)</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>Minute hand points to 2 (showing 10 minutes)</span>
                        </label>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="submit-clock-eval">Submit Evaluation</button>
                </div>
            </div>
        `;

        document.getElementById('submit-clock-eval').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.criteria-checkbox:checked');
            const subtestScore = checkboxes.length;
            
            this.results.push({
                subtest: 'Clock Drawing',
                score: subtestScore,
                maxScore: 6
            });
            this.score += subtestScore;
            this.currentSubtest++;
            this.startSubtest();
        });
    }

    startCubeCopying() {
        const app = document.getElementById('app');
        const progress = (this.currentSubtest / this.subtests.length) * 100;

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Cube Copying Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> Copy the cube shown below as accurately as possible in the drawing area.</p>
                </div>
                
                <div class="cube-reference">
                    <h4>Copy this cube:</h4>
                    <canvas id="reference-cube" width="200" height="200"></canvas>
                </div>
                
                <div class="drawing-area">
                    <h4>Draw your copy here:</h4>
                    <canvas id="cube-canvas" width="300" height="300"></canvas>
                    <div class="drawing-controls">
                        <button class="btn-secondary" id="clear-cube">Clear</button>
                        <button class="btn-primary" id="submit-cube">Submit Drawing</button>
                    </div>
                </div>
            </div>
        `;

        this.drawReferenceCube();
        this.initDrawingCanvas('cube-canvas');
        
        document.getElementById('clear-cube').addEventListener('click', () => {
            this.clearCanvas('cube-canvas');
        });
        
        document.getElementById('submit-cube').addEventListener('click', () => {
            this.evaluateCubeCopying();
        });
    }

    drawReferenceCube() {
        const canvas = document.getElementById('reference-cube');
        const ctx = canvas.getContext('2d');
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw a 3D cube
        const size = 60;
        const x = 70;
        const y = 70;
        const depth = 30;
        
        // Front face
        ctx.strokeRect(x, y, size, size);
        
        // Back face
        ctx.strokeRect(x + depth, y - depth, size, size);
        
        // Connect corners
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth);
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size + depth, y - depth);
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + depth, y + size - depth);
        ctx.moveTo(x + size, y + size);
        ctx.lineTo(x + size + depth, y + size - depth);
        ctx.stroke();
    }

    evaluateCubeCopying() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Cube Copying - Self Evaluation</h2>
                </div>
                
                <div class="self-evaluation">
                    <p>Please evaluate your cube drawing. Check each item that applies:</p>
                    
                    <div class="criteria-checklist">
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>I drew two square faces</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>The faces are connected properly</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>The drawing shows 3D depth</span>
                        </label>
                        <label class="criteria-item">
                            <input type="checkbox" class="criteria-checkbox" data-points="1">
                            <span>The proportions look reasonable</span>
                        </label>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="submit-cube-eval">Submit Evaluation</button>
                </div>
            </div>
        `;

        document.getElementById('submit-cube-eval').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.criteria-checkbox:checked');
            const subtestScore = checkboxes.length;
            
            this.results.push({
                subtest: 'Cube Copying',
                score: subtestScore,
                maxScore: 4
            });
            this.score += subtestScore;
            this.currentSubtest++;
            this.startSubtest();
        });
    }

    startPatternRecognition() {
        const patterns = [
            {
                pattern: ['■', '□', '■', '□', '■'],
                missing: 3,
                options: ['■', '□', '●', '○'],
                correct: '□'
            },
            {
                pattern: ['●', '●●', '●●●', '●●●●'],
                missing: 4,
                options: ['●●●●●', '●●●', '●●', '●'],
                correct: '●●●●●'
            },
            {
                pattern: ['▲', '▼', '▲', '▼'],
                missing: 4,
                options: ['▲', '▼', '●', '■'],
                correct: '▲'
            },
            {
                pattern: ['AB', 'BC', 'CD', 'DE'],
                missing: 4,
                options: ['EF', 'FG', 'GH', 'DE'],
                correct: 'EF'
            },
            {
                pattern: ['1', '4', '9', '16'],
                missing: 4,
                options: ['20', '25', '30', '36'],
                correct: '25'
            }
        ];

        let currentPattern = 0;
        let subtestScore = 0;

        const showPattern = () => {
            if (currentPattern >= patterns.length) {
                this.results.push({
                    subtest: 'Pattern Recognition',
                    score: subtestScore,
                    maxScore: 5
                });
                this.score += subtestScore;
                this.currentSubtest++;
                this.startSubtest();
                return;
            }

            const pattern = patterns[currentPattern];
            const progress = ((this.currentSubtest * 33) + ((currentPattern / patterns.length) * 33)) / 100;

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="test-container">
                    <div class="test-header">
                        <h2>Pattern Recognition</h2>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="test-instructions">
                        <p>Pattern ${currentPattern + 1} of ${patterns.length}</p>
                        <p><strong>What comes next in this pattern?</strong></p>
                    </div>
                    
                    <div class="pattern-display">
                        <div class="pattern-sequence">
                            ${pattern.pattern.map((item, index) => 
                                `<div class="pattern-item ${index === pattern.missing ? 'missing' : ''}">${index === pattern.missing ? '?' : item}</div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="pattern-options">
                        <h4>Choose the correct answer:</h4>
                        <div class="options-grid">
                            ${pattern.options.map((option, index) => 
                                `<button class="option-btn" data-answer="${option}">${option}</button>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userAnswer = e.target.dataset.answer;
                    const isCorrect = userAnswer === pattern.correct;
                    
                    if (isCorrect) {
                        subtestScore++;
                    }

                    // Show feedback
                    const app = document.getElementById('app');
                    app.innerHTML = `
                        <div class="test-container">
                            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                                <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                                <p>The pattern was: ${pattern.pattern.join(' ')}</p>
                                <p>Your answer: ${userAnswer}</p>
                                <p>Correct answer: ${pattern.correct}</p>
                            </div>
                        </div>
                    `;

                    setTimeout(() => {
                        currentPattern++;
                        showPattern();
                    }, 2000);
                });
            });
        };

        showPattern();
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
                    <h2>Visuospatial Test Results</h2>
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
                
                <div class="visuospatial-feedback">
                    <h4>What This Measures:</h4>
                    <p>Visuospatial tests assess your ability to perceive, analyze, and manipulate visual information. These skills are important for navigation, reading maps, and understanding spatial relationships.</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="continue-next">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-next').addEventListener('click', () => {
            if (window.app) {
                window.app.saveTestResult('visuospatial', this.score, {
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