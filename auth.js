class AuthManager {
    constructor() {
        this.currentUser = null;
        this.auth = null;
        this.db = null;
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
            this.currentUser = user;
            if (window.app) {
                window.app.onAuthStateChanged(user);
            }
        });
    }

    renderLoginForm() {
        return `
            <div class="auth-container">
                <div class="auth-form">
                    <h2>Sign In to CogTest</h2>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Sign In</button>
                            <button type="button" class="btn-secondary" id="show-register">Create Account</button>
                        </div>
                    </form>
                    <div class="auth-error" id="auth-error" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    renderRegisterForm() {
        return `
            <div class="auth-container">
                <div class="auth-form">
                    <h2>Create Account</h2>
                    <form id="register-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Confirm Password:</label>
                            <input type="password" id="confirm-password" required minlength="6">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Create Account</button>
                            <button type="button" class="btn-secondary" id="show-login">Back to Sign In</button>
                        </div>
                    </form>
                    <div class="auth-error" id="auth-error" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    bindAuthEvents() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });

            document.getElementById('show-register')?.addEventListener('click', () => {
                this.showRegisterForm();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });

            document.getElementById('show-login')?.addEventListener('click', () => {
                this.showLoginForm();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleRegister() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        try {
            const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            this.showError(error.message);
        }
    }

    showLoginForm() {
        const app = document.getElementById('app');
        app.innerHTML = this.renderLoginForm();
        this.bindAuthEvents();
    }

    showRegisterForm() {
        const app = document.getElementById('app');
        app.innerHTML = this.renderRegisterForm();
        this.bindAuthEvents();
    }

    showError(message) {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
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

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();