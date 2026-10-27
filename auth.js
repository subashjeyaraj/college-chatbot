/**
 * College Chatbot - Authentication & Session Engine
 */

// Show Toast Alert Notification
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Toggle between Login and Register tabs
function showLogin() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTab = document.getElementById("tabLogin");
    const registerTab = document.getElementById("tabRegister");

    if (loginForm && registerForm) {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    }
    if (loginTab && registerTab) {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    }
}

function showRegister() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTab = document.getElementById("tabLogin");
    const registerTab = document.getElementById("tabRegister");

    if (loginForm && registerForm) {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    }
    if (loginTab && registerTab) {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
    }
}

// Register a new user
function register() {
    const roleInput = document.querySelector('input[name="registerRole"]:checked');
    const role = roleInput ? roleInput.value : "student";
    const usernameInput = document.getElementById("registerUsername");
    const passwordInput = document.getElementById("registerPassword");
    const nameInput = document.getElementById("registerName");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    const name = nameInput ? nameInput.value.trim() : username;

    if (!username || !password) {
        showToast("Please enter both username and password.", "error");
        return;
    }

    if (username.length < 3) {
        showToast("Username must be at least 3 characters.", "error");
        return;
    }

    if (password.length < 4) {
        showToast("Password must be at least 4 characters.", "error");
        return;
    }

    let users = CollegeStorage.getUsers();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showToast("Username already exists! Please choose another.", "error");
        return;
    }

    users.push({
        username,
        password,
        role,
        name: name || username
    });

    CollegeStorage.saveUsers(users);
    showToast("Account registered successfully! You can now log in.", "success");

    // Auto-fill login form and switch
    const loginUserInput = document.getElementById("loginUsername");
    if (loginUserInput) loginUserInput.value = username;
    
    // Clear registration inputs
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (nameInput) nameInput.value = "";

    setTimeout(() => {
        showLogin();
    }, 600);
}

// Log in existing user
function login() {
    const roleInput = document.querySelector('input[name="loginRole"]:checked');
    const role = roleInput ? roleInput.value : "student";
    const username = document.getElementById("loginUsername")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();

    if (!username || !password) {
        showToast("Please enter your username and password.", "error");
        return;
    }

    const users = CollegeStorage.getUsers();
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password && 
        u.role === role
    );

    if (user) {
        CollegeStorage.setCurrentUser(user);
        showToast(`Welcome back, ${user.name || user.username}!`, "success");
        setTimeout(() => {
            if (user.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "student.html";
            }
        }, 600);
    } else {
        showToast("Invalid credentials or role. Check your details or use 1-Click Demo Login below.", "error");
    }
}

// 1-Click Demo Login Shortcut
function loginAsDemo(role) {
    if (role === "admin") {
        const adminUser = { username: "admin", role: "admin", name: "Campus Administrator" };
        CollegeStorage.setCurrentUser(adminUser);
        showToast("Logged in as Demo Admin!", "success");
        setTimeout(() => {
            window.location.href = "admin.html";
        }, 400);
    } else {
        const studentUser = { username: "student", role: "student", name: "Alex (Student Demo)" };
        CollegeStorage.setCurrentUser(studentUser);
        showToast("Logged in as Demo Student!", "success");
        setTimeout(() => {
            window.location.href = "student.html";
        }, 400);
    }
}

// Direct Guest Login
function loginAsGuest() {
    const guestUser = { username: "guest", role: "student", name: "Guest Student" };
    CollegeStorage.setCurrentUser(guestUser);
    showToast("Entering as Guest...", "info");
    setTimeout(() => {
        window.location.href = "student.html";
    }, 400);
}

// Global Logout
function logout() {
    CollegeStorage.logout();
}

// Auth Guard Check for protected pages
function checkPageAuth(requiredRole = null) {
    const currentUser = CollegeStorage.getCurrentUser();
    
    // If not logged in, redirect to login
    if (!currentUser) {
        window.location.href = "index.html";
        return null;
    }

    // Role restriction
    if (requiredRole && currentUser.role !== requiredRole) {
        showToast(`Access restricted: ${requiredRole} account required.`, "error");
        setTimeout(() => {
            if (currentUser.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "student.html";
            }
        }, 1000);
        return null;
    }

    return currentUser;
}