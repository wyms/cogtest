class LanguageTest {
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
                name: 'Object Naming',
                type: 'naming',
                description: 'Name common objects shown in images',
                maxScore: 5
            },
            {
                name: 'Sentence Repetition',
                type: 'repetition',
                description: 'Repeat sentences exactly as heard',
                maxScore: 5
            },
            {
                name: 'Verbal Fluency',
                type: 'fluency',
                description: 'Name as many animals as possible in 60 seconds',
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
                    <h2>Language Test</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> This test evaluates different aspects of language ability including naming, repetition, and verbal fluency.</p>
                    <ul>
                        <li><strong>Object Naming:</strong> Identify common objects</li>
                        <li><strong>Sentence Repetition:</strong> Repeat sentences exactly</li>
                        <li><strong>Verbal Fluency:</strong> Generate words in a category</li>
                    </ul>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="start-language">Begin Test</button>
                </div>
            </div>
        `;

        document.getElementById('start-language').addEventListener('click', () => {
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
            case 'naming':
                this.startNamingTest();
                break;
            case 'repetition':
                this.startRepetitionTest();
                break;
            case 'fluency':
                this.startFluencyTest();
                break;
        }
    }

    startNamingTest() {
        const objects = [
            { name: 'watch', description: 'A device worn on the wrist to tell time' },
            { name: 'pencil', description: 'A writing instrument with graphite core' },
            { name: 'chair', description: 'Furniture with four legs and a back for sitting' },
            { name: 'book', description: 'Bound pages with text for reading' },
            { name: 'phone', description: 'Device used for communication and calls' }
        ];

        let currentObject = 0;
        let subtestScore = 0;

        const showObject = () => {
            if (currentObject >= objects.length) {
                this.results.push({
                    subtest: 'Object Naming',
                    score: subtestScore,
                    maxScore: 5
                });
                this.score += subtestScore;
                this.currentSubtest++;
                this.startSubtest();
                return;
            }

            const object = objects[currentObject];
            const progress = ((this.currentSubtest * 33) + ((currentObject / objects.length) * 33)) / 100;

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="test-container">
                    <div class="test-header">
                        <h2>Object Naming</h2>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="test-instructions">
                        <p>Object ${currentObject + 1} of ${objects.length}</p>
                        <p><strong>What is this object called?</strong></p>
                    </div>
                    
                    <div class="object-description">
                        <div class="description-box">
                            ${object.description}
                        </div>
                    </div>
                    
                    <div class="answer-section">
                        <input type="text" id="object-name" placeholder="Type the name of this object">
                        <button class="btn-primary" id="submit-name">Submit</button>
                    </div>
                </div>
            `;

            const submitAnswer = () => {
                const input = document.getElementById('object-name');
                const userAnswer = input.value.toLowerCase().trim();
                const isCorrect = userAnswer === object.name.toLowerCase() || 
                                this.checkAlternativeNames(userAnswer, object.name);

                if (isCorrect) {
                    subtestScore++;
                }

                // Show feedback
                const app = document.getElementById('app');
                app.innerHTML = `
                    <div class="test-container">
                        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                            <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                            <p>Your answer: ${userAnswer || '(no answer)'}</p>
                            <p>Correct answer: ${object.name}</p>
                        </div>
                    </div>
                `;

                setTimeout(() => {
                    currentObject++;
                    showObject();
                }, 1500);
            };

            document.getElementById('submit-name').addEventListener('click', submitAnswer);
            document.getElementById('object-name').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitAnswer();
                }
            });
            document.getElementById('object-name').focus();
        };

        showObject();
    }

    checkAlternativeNames(userAnswer, correctName) {
        const alternatives = {
            'watch': ['clock', 'timepiece', 'wristwatch'],
            'pencil': ['pen', 'writing tool'],
            'chair': ['seat'],
            'book': ['novel', 'text'],
            'phone': ['telephone', 'mobile', 'cell phone', 'smartphone']
        };

        const alts = alternatives[correctName.toLowerCase()] || [];
        return alts.some(alt => alt.toLowerCase() === userAnswer);
    }

    startRepetitionTest() {
        const sentences = [
            "The cat is sleeping on the mat.",
            "John is a lawyer from New York.",
            "The quick brown fox jumps over the lazy dog.",
            "She sells seashells by the seashore.",
            "Peter Piper picked a peck of pickled peppers."
        ];

        let currentSentence = 0;
        let subtestScore = 0;

        const showSentence = () => {
            if (currentSentence >= sentences.length) {
                this.results.push({
                    subtest: 'Sentence Repetition',
                    score: subtestScore,
                    maxScore: 5
                });
                this.score += subtestScore;
                this.currentSubtest++;
                this.startSubtest();
                return;
            }

            const sentence = sentences[currentSentence];
            const progress = ((this.currentSubtest * 33) + ((currentSentence / sentences.length) * 33)) / 100;

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="test-container">
                    <div class="test-header">
                        <h2>Sentence Repetition</h2>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="test-instructions">
                        <p>Sentence ${currentSentence + 1} of ${sentences.length}</p>
                        <p><strong>Listen carefully and then repeat the sentence exactly as you hear it.</strong></p>
                    </div>
                    
                    <div class="sentence-display">
                        <div class="sentence-text" id="sentence-text">
                            Click "Show Sentence" to see the sentence
                        </div>
                    </div>
                    
                    <div class="answer-section" id="answer-section" style="display: none;">
                        <textarea id="sentence-repeat" placeholder="Type the sentence exactly as shown" rows="3"></textarea>
                        <button class="btn-primary" id="submit-repetition">Submit</button>
                    </div>
                    
                    <div class="test-actions">
                        <button class="btn-primary" id="show-sentence">Show Sentence</button>
                    </div>
                </div>
            `;

            document.getElementById('show-sentence').addEventListener('click', () => {
                const sentenceText = document.getElementById('sentence-text');
                const showBtn = document.getElementById('show-sentence');
                const answerSection = document.getElementById('answer-section');

                sentenceText.innerHTML = `<div class="displayed-sentence">${sentence}</div>`;
                showBtn.style.display = 'none';

                setTimeout(() => {
                    sentenceText.innerHTML = 'Now type the sentence exactly as it was shown:';
                    answerSection.style.display = 'block';
                    document.getElementById('sentence-repeat').focus();
                }, 3000);
            });

            const submitAnswer = () => {
                const userAnswer = document.getElementById('sentence-repeat').value.trim();
                const isCorrect = this.compareSentences(userAnswer, sentence);

                if (isCorrect) {
                    subtestScore++;
                }

                // Show feedback
                const app = document.getElementById('app');
                app.innerHTML = `
                    <div class="test-container">
                        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                            <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                            <p><strong>Original:</strong> "${sentence}"</p>
                            <p><strong>Your answer:</strong> "${userAnswer || '(no answer)'}"</p>
                        </div>
                    </div>
                `;

                setTimeout(() => {
                    currentSentence++;
                    showSentence();
                }, 2500);
            };

            // Event delegation for submit button
            document.addEventListener('click', function handler(e) {
                if (e.target.id === 'submit-repetition') {
                    document.removeEventListener('click', handler);
                    submitAnswer();
                }
            });
        };

        showSentence();
    }

    compareSentences(userSentence, originalSentence) {
        // Remove punctuation and convert to lowercase for comparison
        const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
        return normalize(userSentence) === normalize(originalSentence);
    }

    startFluencyTest() {
        const app = document.getElementById('app');
        const progress = (this.currentSubtest / this.subtests.length) * 100;

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Verbal Fluency - Animals</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="test-instructions">
                    <p><strong>Instructions:</strong> You will have 60 seconds to name as many different animals as you can.</p>
                    <p>Type each animal name and press Enter. Don't repeat the same animal.</p>
                    <p>Ready? Click "Start Timer" to begin.</p>
                </div>
                
                <div class="fluency-test" id="fluency-test" style="display: none;">
                    <div class="timer" id="timer">60</div>
                    <div class="animal-input">
                        <input type="text" id="animal-name" placeholder="Type an animal name and press Enter">
                    </div>
                    <div class="animal-list">
                        <h4>Animals named:</h4>
                        <div id="animals-listed"></div>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="start-fluency">Start Timer</button>
                </div>
            </div>
        `;

        document.getElementById('start-fluency').addEventListener('click', () => {
            this.runFluencyTest();
        });
    }

    runFluencyTest() {
        const fluencyTest = document.getElementById('fluency-test');
        const startBtn = document.getElementById('start-fluency');
        const timerDisplay = document.getElementById('timer');
        const animalInput = document.getElementById('animal-name');
        const animalsList = document.getElementById('animals-listed');

        fluencyTest.style.display = 'block';
        startBtn.style.display = 'none';
        animalInput.focus();

        let timeLeft = 60;
        let animals = [];
        let subtestScore = 0;

        const timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.finishFluencyTest(animals);
            }
        }, 1000);

        const addAnimal = () => {
            const animalName = animalInput.value.trim().toLowerCase();
            if (animalName && !animals.includes(animalName) && this.isValidAnimal(animalName)) {
                animals.push(animalName);
                const animalDiv = document.createElement('div');
                animalDiv.className = 'animal-item';
                animalDiv.textContent = animalName;
                animalsList.appendChild(animalDiv);
                animalInput.value = '';
                
                // Scroll to show new animal
                animalsList.scrollTop = animalsList.scrollHeight;
            } else {
                animalInput.value = '';
            }
            animalInput.focus();
        };

        animalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addAnimal();
            }
        });
    }

    isValidAnimal(name) {
        // Basic list of common animals - in a real app this would be more comprehensive
        const validAnimals = [
            'cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken',
            'duck', 'turkey', 'rabbit', 'mouse', 'rat', 'hamster', 'guinea pig', 'ferret',
            'lion', 'tiger', 'bear', 'elephant', 'giraffe', 'zebra', 'hippo', 'rhino',
            'monkey', 'ape', 'gorilla', 'chimpanzee', 'orangutan', 'baboon', 'lemur',
            'wolf', 'fox', 'deer', 'elk', 'moose', 'caribou', 'antelope', 'gazelle',
            'kangaroo', 'koala', 'platypus', 'echidna', 'opossum', 'raccoon', 'skunk',
            'squirrel', 'chipmunk', 'beaver', 'otter', 'seal', 'walrus', 'whale', 'dolphin',
            'shark', 'octopus', 'jellyfish', 'crab', 'lobster', 'shrimp', 'starfish',
            'snake', 'lizard', 'turtle', 'crocodile', 'alligator', 'frog', 'toad',
            'eagle', 'hawk', 'owl', 'parrot', 'robin', 'sparrow', 'pigeon', 'swan',
            'penguin', 'flamingo', 'ostrich', 'emu', 'peacock', 'rooster', 'hen',
            'butterfly', 'bee', 'ant', 'spider', 'fly', 'mosquito', 'beetle', 'cricket'
        ];
        
        return validAnimals.includes(name);
    }

    finishFluencyTest(animals) {
        // Score based on number of valid animals named
        // Typical scoring: 18+ = excellent, 12-17 = good, 8-11 = fair, <8 = poor
        let subtestScore = 0;
        const animalCount = animals.length;
        
        if (animalCount >= 18) subtestScore = 5;
        else if (animalCount >= 12) subtestScore = 4;
        else if (animalCount >= 8) subtestScore = 3;
        else if (animalCount >= 5) subtestScore = 2;
        else if (animalCount >= 2) subtestScore = 1;

        this.results.push({
            subtest: 'Verbal Fluency',
            score: subtestScore,
            maxScore: 5,
            animalCount: animalCount,
            animals: animals
        });
        this.score += subtestScore;
        this.currentSubtest++;

        // Show fluency results
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="test-container">
                <div class="fluency-results">
                    <h3>Verbal Fluency Results</h3>
                    <p><strong>Animals named:</strong> ${animalCount}</p>
                    <p><strong>Score:</strong> ${subtestScore}/5</p>
                    <div class="animals-summary">
                        <h4>Your animals:</h4>
                        <div class="animals-grid">
                            ${animals.map(animal => `<span class="animal-tag">${animal}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="continue-language">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-language').addEventListener('click', () => {
            this.startSubtest();
        });
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

        const resultsHtml = this.results.map(result => {
            let detail = `${result.score}/${result.maxScore}`;
            if (result.animalCount !== undefined) {
                detail += ` (${result.animalCount} animals)`;
            }
            return `<p><strong>${result.subtest}:</strong> ${detail}</p>`;
        }).join('');

        app.innerHTML = `
            <div class="test-container">
                <div class="test-header">
                    <h2>Language Test Results</h2>
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
                
                <div class="language-feedback">
                    <h4>What This Measures:</h4>
                    <p>Language tests assess naming ability, verbal memory, and word-finding skills. These functions can be affected by various cognitive conditions and are important for daily communication.</p>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="continue-next">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-next').addEventListener('click', () => {
            if (window.app) {
                window.app.saveTestResult('language', this.score, {
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