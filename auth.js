// auth.js
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_eL0qAAcGO9Ivgqi-inMLm67eJn_VJhc",
  authDomain: "login-95abf.firebaseapp.com",
  projectId: "login-95abf",
  storageBucket: "login-95abf.firebasestorage.app",
  messagingSenderId: "959524075978",
  appId: "1:959524075978:web:ce011568ca369b7427f733",
  measurementId: "G-JZBMLM8BJF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Initialize Firestore

// --- Event Listeners for Forms ---

// Register Form
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = registerForm.firstName.value;
        const lastName = registerForm.lastName.value;
        const countryCode = registerForm.countryCode.value;
        const phone = registerForm.phone.value;
        const address = registerForm.address.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // After creating the user, save additional data to Firestore
                const user = userCredential.user;
                return db.collection('users').doc(user.uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    phone: `${countryCode} ${phone}`,
                    address: address,
                    email: email, // Store email for easier access
                });
            })
            .then(() => {
                alert("Registration successful! Welcome to GradSurge.");
                window.location.href = 'profile.html'; // Go directly to profile
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = 'profile.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// Google Login Button
const googleLoginButton = document.getElementById('google-login-button');
if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                 // The signed-in user info.
                const user = result.user;
                // Check if user is new
                const isNewUser = result.additionalUserInfo.isNewUser;

                // If new user, save their name to Firestore
                if (isNewUser) {
                     db.collection('users').doc(user.uid).set({
                        firstName: user.displayName.split(' ')[0], // Simple split for name
                        lastName: user.displayName.split(' ').slice(1).join(' '),
                        email: user.email,
                    });
                }
                window.location.href = 'profile.html';
            }).catch((error) => {
                alert(error.message);
            });
    });
}

// --- Authentication State Observer ---

auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname.split("/").pop();
    
    // Manage links on index.html
    const authLinksContainer = document.getElementById('auth-links');
    if (authLinksContainer) {
        if (user) {
             authLinksContainer.innerHTML = `
                <a href="profile.html" class="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-white px-3 py-2 text-sm font-medium rounded-md transition">My Profile</a>
                <button id="logout-button-nav" class="cta-button text-primary-900 px-4 py-2 rounded-md text-sm font-medium transition">Logout</button>
             `;
             const logoutBtnNav = document.getElementById('logout-button-nav');
             if(logoutBtnNav) {
                logoutBtnNav.addEventListener('click', handleLogout);
             }
        } else {
            authLinksContainer.innerHTML = `
                <a href="login.html" class="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-white px-3 py-2 text-sm font-medium rounded-md transition">Login</a>
                <a href="register.html" class="cta-button text-primary-900 px-4 py-2 rounded-md text-sm font-medium transition">Register</a>
            `;
        }
    }


    if (user) {
        // User is signed in.
        if (currentPath === 'profile.html') {
            loadUserProfile(user);
        }
    } else {
        // User is signed out.
        if (currentPath === 'profile.html') {
            window.location.href = 'login.html'; // Protect the profile page
        }
    }
});


// --- Profile Page Logic ---
function loadUserProfile(user) {
    const loader = document.getElementById('user-details-loader');
    const content = document.getElementById('user-details-content');

    // Fetch user data from Firestore
    db.collection('users').doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            
            // Populate sidebar
            document.getElementById('profile-name').textContent = `${userData.firstName} ${userData.lastName}`;
            document.getElementById('profile-email').textContent = user.email; // Always use auth email for this
             if (user.photoURL) { // Use Google photo if available
                document.getElementById('profile-pic').src = user.photoURL;
            }

            // Populate main content
            document.getElementById('detail-firstName').textContent = userData.firstName || 'N/A';
            document.getElementById('detail-lastName').textContent = userData.lastName || 'N/A';
            document.getElementById('detail-email').textContent = user.email;
            document.getElementById('detail-phone').textContent = userData.phone || 'N/A';
            document.getElementById('detail-address').textContent = userData.address || 'N/A';

            loader.style.display = 'none';
            content.classList.remove('hidden');
            
        } else {
             // This might happen for users who signed up before Firestore was implemented
            loader.textContent = 'Could not find user details. Please contact support.';
        }
    }).catch((error) => {
        console.error("Error getting user document:", error);
        loader.textContent = 'Error loading data.';
    });
}


// --- Logout Logic ---
function handleLogout() {
     auth.signOut().then(() => {
        alert("You have been logged out.");
        window.location.href = 'index.html'; // Redirect to home page
    }).catch((error) => {
        alert(error.message);
    });
}

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}