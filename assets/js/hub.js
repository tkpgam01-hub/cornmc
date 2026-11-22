import { 
    auth, 
    db, 
    loginUser, 
    registerUser, 
    loginGoogle, 
    resetPassword, 
    logout, 
    subscribeToAuth, 
    showCustomModal, 
    getFirebaseErrorMessage 
} from '/assets/js/core.js';
import { 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    updateProfile, 
    updatePassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentUser = null;
let currentRole = 'guest';
let currentUserData = {};

// Chuyển đổi giữa các form đăng nhập / đăng ký / quên mật khẩu
window.switchAuthForm = (type) => {
    const fLogin = document.getElementById('form-login');
    const fRegister = document.getElementById('form-register');
    const fForgot = document.getElementById('form-forgot');
    if (!fLogin || !fRegister || !fForgot) return;

    fLogin.classList.add('hidden');
    fRegister.classList.add('hidden');
    fForgot.classList.add('hidden');

    if (type === 'login') fLogin.classList.remove('hidden');
    if (type === 'register') fRegister.classList.remove('hidden');
    if (type === 'forgot') fForgot.classList.remove('hidden');
};

// Đóng modal
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.classList.remove('active');
    };
});

window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
};

// Thiết lập các sự kiện cho Auth Form
function setupAuthForms() {
    const emailLoginForm = document.getElementById('email-login-form');
    if (emailLoginForm) {
        emailLoginForm.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;
            try {
                await loginUser(input, pass);
                document.getElementById('auth-modal')?.classList.remove('active');
            } catch (err) {
                showCustomModal("ĐĂNG NHẬP THẤT BẠI", getFirebaseErrorMessage(err), "danger");
            }
        };
    }

    const emailRegisterForm = document.getElementById('email-register-form');
    if (emailRegisterForm) {
        emailRegisterForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const pass = document.getElementById('reg-pass').value;
            try {
                await registerUser(username, pass);
                document.getElementById('auth-modal')?.classList.remove('active');
                showCustomModal("THÀNH CÔNG", "Tài khoản của bạn đã được khởi tạo!", "info");
            } catch (err) {
                showCustomModal("ĐĂNG KÝ THẤT BẠI", getFirebaseErrorMessage(err), "danger");
            }
        };
    }

    const forgotPassForm = document.getElementById('forgot-pass-form');
    if (forgotPassForm) {
        forgotPassForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            try {
                await resetPassword(email);
                showCustomModal("ĐÃ GỬI LIÊN KẾT", "Vui lòng kiểm tra hộp thư email của bạn để đặt lại mật khẩu.", "info");
                window.switchAuthForm('login');
            } catch (err) {
                showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
            }
        };
    }

    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.onclick = async () => {
            try {
                await loginGoogle();
                document.getElementById('auth-modal')?.classList.remove('active');
            } catch (e) {
                showCustomModal("LỖI", getFirebaseErrorMessage(e), "danger");
            }
        };
    }
}

// Xử lý UI Auth và Profile
function handleAuthUI(user, role, dbData) {
    currentUser = user;
    currentRole = role;
    currentUserData = dbData || {};
    const authDisplay = document.getElementById('auth-display');
    if (!authDisplay) return;

    if (user) {
        const avatar = user.photoURL || `https://mc-heads.net/avatar/${user.displayName}`;
        authDisplay.innerHTML = `
            <div class="relative group z-50">
                <button class="flex items-center gap-2.5 glass-panel p-1 lg:pl-1.5 lg:pr-4 lg:py-1.5 rounded-full hover:bg-white/10 transition border border-cyan-400/50 w-max">
                    <img src="${avatar}" class="w-8 h-8 rounded-full border border-cyan-400 object-cover shrink-0">
                    <div class="text-left hidden xl:block whitespace-nowrap">
                        <div class="text-sm font-bold text-white leading-none mb-1">${user.displayName}</div>
                        <div class="text-[10px] text-purple-300 font-bold uppercase leading-none">${role}</div>
                    </div>
                </button>
                <div class="absolute right-0 mt-2 w-56 bg-[#0f0f1a] border border-purple-500/30 rounded-xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                    <button id="btn-profile" class="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white border-b border-white/5 transition">👤 Hồ sơ</button>
                    ${['admin', 'dev', 'mod', 'staff', 'media', 'helper'].includes(role) ? `<a href="/internal.html" class="block w-full text-left px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-500/20 font-bold border-b border-white/5 no-underline transition">🏢 Khu Vực Nội Bộ</a>` : ''}
                    ${['admin', 'dev'].includes(role) ? `<a href="/admin.html" class="block w-full text-left px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/20 font-bold border-b border-white/5 no-underline transition">🛡️ Admin Panel</a>` : ''}
                    <button id="btn-logout" class="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition">⏏ Đăng xuất</button>
                </div>
            </div>`;

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                showCustomModal("ĐĂNG XUẤT", "Bạn có chắc chắn muốn đăng xuất?", "confirm", () => logout());
            };
        }

        const btnProfile = document.getElementById('btn-profile');
        if (btnProfile) {
            btnProfile.onclick = () => {
                if (document.getElementById('edit-name')) document.getElementById('edit-name').value = user.displayName || '';
                if (document.getElementById('edit-avatar')) document.getElementById('edit-avatar').value = user.photoURL || '';
                if (document.getElementById('profile-preview')) document.getElementById('profile-preview').src = avatar;
                if (document.getElementById('edit-discord-link')) document.getElementById('edit-discord-link').value = currentUserData.discordLink || '';
                if (document.getElementById('edit-website-link')) document.getElementById('edit-website-link').value = currentUserData.websiteLink || '';
                if (document.getElementById('edit-new-password')) document.getElementById('edit-new-password').value = '';
                if (document.getElementById('edit-confirm-password')) document.getElementById('edit-confirm-password').value = '';

                document.getElementById('profile-modal')?.classList.add('active');
            };
        }
    } else {
        authDisplay.innerHTML = `<button id="login-btn" class="cyber-btn px-6 py-2.5 rounded-lg font-bold text-sm title-font">LOGIN</button>`;
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => {
                document.getElementById('auth-modal')?.classList.add('active');
            };
        }
    }
}

// Lắng nghe cập nhật profile
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const newName = document.getElementById('edit-name')?.value.trim();
        const newAvatar = document.getElementById('edit-avatar')?.value.trim();
        const newPass = document.getElementById('edit-new-password')?.value;
        const confirmPass = document.getElementById('edit-confirm-password')?.value;

        try {
            if (newName && newName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: newName });
            }
            if (newAvatar) {
                await updateProfile(currentUser, { photoURL: newAvatar });
            }
            if (newPass) {
                if (newPass !== confirmPass) {
                    return showCustomModal("LỖI", "Mật khẩu xác nhận không khớp!", "danger");
                }
                await updatePassword(currentUser, newPass);
            }

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                displayName: newName || currentUser.displayName,
                photoURL: newAvatar || currentUser.photoURL || '',
                discordLink: document.getElementById('edit-discord-link')?.value.trim() || '',
                websiteLink: document.getElementById('edit-website-link')?.value.trim() || ''
            });

            showCustomModal("THÀNH CÔNG", "Đã lưu thay đổi hồ sơ!", "info");
            document.getElementById('profile-modal')?.classList.remove('active');
        } catch (err) {
            showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
        }
    };
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    setupAuthForms();
    subscribeToAuth(handleAuthUI);
});

