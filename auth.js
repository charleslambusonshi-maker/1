/* DIDAS PWA Admin Auth System v2.1 */

/* ================= GLOBAL STATE ================= */
const ADMIN_EMAIL = 'admin@didas.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_HASH = btoa(ADMIN_PASSWORD + 'didas_salt');

let users = [];
let currentSession = null;

// Initialize admin account
function initAdmin() {
  if (!localStorage.getItem('didas_admin_initialized')) {
    const adminUser = {
      id: 'admin_001',
      name: 'System Administrator',
      email: ADMIN_EMAIL,
      idNumber: 'ADMIN001',
      role: 'admin',
      passwordHash: ADMIN_HASH,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    users = [adminUser];
    localStorage.setItem('didas_users', JSON.stringify(users));
    localStorage.setItem('didas_admin_initialized', 'true');
    console.log('✅ DIDAS Admin account initialized');
  } else {
    users = JSON.parse(localStorage.getItem('didas_users') || '[]');
  }
}

// Load current session
function loadCurrentSession() {
  const stored = localStorage.getItem('didas_current_user');
  currentSession = stored ? JSON.parse(stored) : null;
}

initAdmin();
loadCurrentSession();

/* ================= CORE AUTH FUNCTIONS ================= */

// ❌ CREATE ACCOUNT - Disabled
window.createAccount = async function() {
  return { 
    success: false, 
    error: '❌ Registration DISABLED. Single admin account only.\nLogin: admin@didas.com / Password: admin123' 
  };
};

// 🔑 LOGIN - Admin Only
window.loginAccount = async function(email, password) {
  return new Promise((resolve) => {
    if (email.toLowerCase().trim() !== ADMIN_EMAIL || btoa(password + 'didas_salt') !== ADMIN_HASH) {
      return resolve({ success: false, error: `Invalid credentials.\nUse: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}` });
    }

    initAdmin();
    const admin = users.find(u => u.id === 'admin_001');
    if (!admin) {
      return resolve({ success: false, error: 'Admin setup error. Clear browser data.' });
    }

    // Update session
    admin.lastLogin = new Date().toISOString();
    currentSession = admin;
    localStorage.setItem('didas_current_user', JSON.stringify(admin));
    localStorage.setItem('didas_users', JSON.stringify(users));

    resolve({ 
      success: true, 
      user: admin, 
      message: `✅ Welcome Admin! Top access granted.`,
      token: btoa(JSON.stringify({ email: admin.email, role: 'admin', iat: Date.now() }))
    });
  });
};

// 🚪 LOGOUT - Clear all app data
window.logoutAccount = async function() {
  return new Promise(resolve => {
    localStorage.removeItem('didas_current_user');
    localStorage.removeItem('didas_users');
    localStorage.removeItem('didas_admin_initialized');
    localStorage.removeItem('didas_students');
    localStorage.removeItem('didas_attendance');
    currentSession = null;
    users = [];
    resolve({ success: true, message: '✅ Logged out & app data cleared' });
  });
};

// 👤 GET CURRENT USER
window.getCurrentUser = function() {
  if (!currentSession) loadCurrentSession();
  return currentSession;
};

// ✅ CHECK LOGIN STATUS
window.isLoggedIn = function() {
  const user = window.getCurrentUser();
  return user && user.lastLogin;
};

/* ================= UI HELPERS ================= */
window.showMessage = function(type, message, duration = 4000) {
  const msg = document.createElement('div');
  msg.className = `message message-${type}`;
  msg.textContent = message;
  msg.style.cssText = `
    position: fixed; top: 20px; right: 20px; 
    padding: 16px 24px; border-radius: 12px; 
    color: white; font-weight: 600; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  
  // Colors
  if (type === 'success') msg.style.background = 'linear-gradient(135deg,#4CAF50,#45a049)';
  if (type === 'error') msg.style.background = 'linear-gradient(135deg,#f44336,#d32f2f)';

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => msg.remove(), 300);
  }, duration);
};

window.showError = function(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }
  window.showMessage('error', msg);
};

window.showSuccess = function(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }
  window.showMessage('success', msg);
};

/* ================= AUTO LOGIN CHECK ================= */
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
  if (window.isLoggedIn()) window.dashboardRedirect();
});

// 🌐 DASHBOARD REDIRECT
window.dashboardRedirect = function() {
  const user = window.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'pro-auth.html';
    return;
  }
  window.location.href = 'TeacherDashboard.html';
};

/* ================= EXPORTS ================= */
window.DIDASAuth = {
  createAccount,
  loginAccount,
  logoutAccount,
  getCurrentUser,
  isLoggedIn
};

console.log('✅ DIDAS Auth Loaded - Single Admin System Active');