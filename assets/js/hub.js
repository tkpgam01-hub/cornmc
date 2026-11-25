// ==========================================
// CORNHUB - CỔNG THÔNG TIN TRUNG TÂM CORNMC NETWORK
// Toàn bộ luồng chính: Đăng nhập, Hồ sơ, Quà tặng, Tin tức, Diễn đàn, Đội ngũ, Tài nguyên, Quản lý User
// ==========================================
import {
    db,
    subscribeToAuth,
    loginUser,
    registerUser,
    loginGoogle,
    resetPassword,
    logout,
    updateUserProfile,
    changeUserPassword,
    uploadImage,
    checkDiscordIdExists,
    fetchNews,
    fetchForumPosts,
    fetchMyPosts,
    fetchAllUsers,
    fetchStaffMembers,
    createPost,
    editDocument,
    deleteDocument,
    deleteUserAndData,
    fetchComments,
    addComment,
    deleteComment,
    createGiveaway,
    fetchActiveGiveaways,
    joinGiveaway,
    endGiveaway,
    sendDiscordWebhook,
    showCustomModal,
    getFirebaseErrorMessage
} from '/assets/js/core.js';
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let currentUser = null;
let currentRole = 'guest';
let currentUserData = {};

window.showCustomModal = showCustomModal;
window.deleteDocument = deleteDocument;

// ==========================================
// 1. TIỆN ÍCH CHUNG (IP, DISCORD, TÀI NGUYÊN, LITE MODE)
// ==========================================
window.copyServerIP = () => {
    navigator.clipboard.writeText("cornmc.vn").then(() => {
        showCustomModal("SERVER IP", "Đã copy IP thành công:\ncornmc.vn\nPC: play.cornmc.vn\nPE: pe.cornmc.vn (Port 19132)", "info");
    });
};

window.showDownloadModal = () => {
    const linkShaderpacks = "https://drive.google.com/drive/folders/1ZKLCqALrOFLbDbzW_5DcOfozMk2suMK4?usp=sharing";
    const linkResourcepacks = "https://drive.google.com/drive/folders/1c0kkKdMumDKh614uJizv4p3stRE5x3d9?usp=sharing";
    const linkMods = "https://drive.google.com/drive/folders/1RvbSeqH3EGBn-7fIpoOmjeDd4L8EYW-0?usp=sharing";
    const linkFullfile = "https://drive.google.com/uc?export=download&id=1oPo2PjK5qnnrE9FXfCm_ybS6zFR1eMGA";

    const htmlContent = `
        <div class="space-y-3 text-center mt-4 pb-2">
            <p class="text-gray-300 text-sm mb-4">Chọn mục bạn muốn tải. Hệ thống sẽ chuyển hướng tải trực tiếp về máy!</p>
            <a href="${linkShaderpacks}" target="_blank" class="flex items-center justify-between w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white font-bold py-3 px-5 rounded-xl border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] transition mb-2 no-underline">
                <div class="flex items-center gap-3"><span class="text-2xl">✨</span><span class="text-base title-font">SHADERPACKS</span></div>
                <span class="text-xl">⬇️</span>
            </a>
            <a href="${linkResourcepacks}" target="_blank" class="flex items-center justify-between w-full bg-green-600/20 hover:bg-green-600/40 text-green-300 hover:text-white font-bold py-3 px-5 rounded-xl border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition mb-2 no-underline">
                <div class="flex items-center gap-3"><span class="text-2xl">🎨</span><span class="text-base title-font">RESOURCEPACKS</span></div>
                <span class="text-xl">⬇️</span>
            </a>
            <a href="${linkMods}" target="_blank" class="flex items-center justify-between w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white font-bold py-3 px-5 rounded-xl border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition mb-2 no-underline">
                <div class="flex items-center gap-3"><span class="text-2xl">📦</span><span class="text-base title-font">MODS TỐI ƯU</span></div>
                <span class="text-xl">⬇️</span>
            </a>
            <a href="${linkFullfile}" target="_blank" class="flex items-center justify-between w-full bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 hover:text-white font-bold py-3 px-5 rounded-xl border border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)] transition no-underline">
                <div class="flex items-center gap-3"><span class="text-2xl">📁</span><span class="text-base title-font">FULLFILE (.ZIP)</span></div>
                <span class="text-xl">⬇️</span>
            </a>
        </div>
    `;
    showCustomModal("TẢI TÀI NGUYÊN GAME", htmlContent, "info");
};

window.showMcPeModal = () => {
    const linkDrive = "https://drive.google.com/file/d/1Q-SBCm5FcK8a9q_7WE3bwV5RKavStbXR/view?usp=sharing";
    const htmlContent = `
        <div class="space-y-4 text-center mt-4">
            <p class="text-gray-300 text-sm">Phiên bản Minecraft PE đã được cấu hình tối ưu cho <b>CornMC Network</b>.</p>
            <div class="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                <p class="text-xs text-cyan-400 mb-2 font-bold title-font">THÔNG TIN FILE CÀI ĐẶT:</p>
                <ul class="text-[12px] text-gray-400 text-left list-disc list-inside space-y-1">
                    <li>Dung lượng: ~450MB</li>
                    <li>Phiên bản: 1.21+ (Bedrock Edition)</li>
                    <li>Hỗ trợ hệ điều hành: Android (APK)</li>
                </ul>
            </div>
            <a href="${linkDrive}" target="_blank" class="cyber-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition shadow-lg w-full text-sm title-font text-white no-underline">
                <span>TẢI XUỐNG NGAY (GOOGLE DRIVE)</span>
            </a>
        </div>
    `;
    showCustomModal("TẢI BẢN MINECRAFT PE", htmlContent, "info");
};

window.togglePerformance = () => {
    const body = document.body;
    body.classList.toggle('lite-mode');
    const isLite = body.classList.contains('lite-mode');
    localStorage.setItem('liteMode', isLite ? 'on' : 'off');

    if (isLite) {
        showCustomModal("CHẾ ĐỘ TỐI ƯU", "⚡ Đã BẬT chế độ Siêu Mượt!\nTắt hiệu ứng hạt, ảnh nền và kính mờ để tối ưu 100% GPU.", "info");
    } else {
        showCustomModal("CHẾ ĐỘ ĐỒ HỌA CAO", "✨ Đã TẮT chế độ Siêu Mượt!\nĐồ họa và các hiệu ứng đã được bật tối đa.", "info");
    }
};

// Mặc định Lite Mode giống hệ thống cũ
const savedLiteMode = localStorage.getItem('liteMode');
if (savedLiteMode === null || savedLiteMode === 'on') {
    document.body.classList.add('lite-mode');
    if (savedLiteMode === null) localStorage.setItem('liteMode', 'on');
} else {
    document.body.classList.remove('lite-mode');
}

// ==========================================
// 2. AUTHENTICATION & PROFILE & USER ADMIN
// ==========================================
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
                showCustomModal("LỖI KHÔI PHỤC", getFirebaseErrorMessage(err), "danger");
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
                    ${['admin'].includes(role) ? `<button id="btn-admin" class="block w-full text-left px-4 py-3 text-sm text-orange-400 hover:bg-orange-500/20 font-bold border-b border-white/5 transition">👥 Quản Lý User</button>` : ''}
                    ${['admin', 'dev'].includes(role) ? `<a href="/admin.html" class="block w-full text-left px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/20 font-bold border-b border-white/5 no-underline transition">🛡️ Admin Panel</a>` : ''}
                    <button id="btn-logout" class="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition">⏏ Đăng xuất</button>
                </div>
            </div>`;

        document.getElementById('btn-logout').onclick = () => {
            showCustomModal("ĐĂNG XUẤT", "Bạn có chắc chắn muốn đăng xuất?", "confirm", () => logout());
        };

        document.getElementById('btn-profile').onclick = () => {
            if (document.getElementById('edit-name')) document.getElementById('edit-name').value = user.displayName || '';
            if (document.getElementById('edit-avatar')) document.getElementById('edit-avatar').value = user.photoURL || '';
            if (document.getElementById('profile-preview')) document.getElementById('profile-preview').src = avatar;
            if (document.getElementById('edit-discord-link')) {
                document.getElementById('edit-discord-link').value = currentUserData.discordLink || '';
                document.getElementById('edit-discord-link').disabled = false;
            }
            if (document.getElementById('edit-website-link')) document.getElementById('edit-website-link').value = currentUserData.websiteLink || '';
            if (document.getElementById('edit-new-password')) document.getElementById('edit-new-password').value = '';
            if (document.getElementById('edit-confirm-password')) document.getElementById('edit-confirm-password').value = '';
            document.getElementById('discord-verify-zone')?.classList.add('hidden');
            document.getElementById('edit-avatar-preview')?.classList.add('hidden');
            document.getElementById('profile-modal')?.classList.add('active');
        };

        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.onclick = () => {
                document.getElementById('admin-modal')?.classList.add('active');
                renderAdminTable();
            };
        }

        if (['admin', 'dev', 'mod', 'staff', 'helper', 'media', 'member'].includes(role)) {
            document.getElementById('create-post-trigger')?.classList.remove('hidden');
        }
    } else {
        authDisplay.innerHTML = `<button id="login-btn" class="cyber-btn px-6 py-2.5 rounded-lg font-bold text-sm title-font">LOGIN</button>`;
        document.getElementById('login-btn').onclick = () => {
            document.getElementById('auth-modal')?.classList.add('active');
        };
        document.getElementById('create-post-trigger')?.classList.add('hidden');
    }

    // Re-render active auth-dependent sections
    const oldTabs = document.getElementById('forum-tabs');
    if (oldTabs) oldTabs.remove();
    if (document.getElementById('section-forum')?.classList.contains('active')) renderForum('approved');
    if (document.getElementById('section-giveaway')?.classList.contains('active')) renderGiveaways();
    if (document.getElementById('section-news')?.classList.contains('active')) renderNews();
}

function setupProfileAndDiscordVerify() {
    // Preview avatar before upload
    document.getElementById('edit-avatar-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = document.getElementById('edit-avatar-preview');
            if (preview) {
                preview.src = URL.createObjectURL(file);
                preview.classList.remove('hidden');
            }
        }
    });

    // Request Discord verify code
    const btnRequestVerify = document.getElementById('btn-request-verify');
    if (btnRequestVerify) {
        btnRequestVerify.onclick = async () => {
            if (!currentUser) return;
            const discordId = document.getElementById('edit-discord-link').value.trim();
            if (!/^\d{17,19}$/.test(discordId)) {
                return showCustomModal("LỖI", "ID Discord không hợp lệ! Vui lòng nhập đúng dãy số ID (17-19 chữ số).", "danger");
            }

            btnRequestVerify.innerText = "ĐANG XỬ LÝ...";
            btnRequestVerify.disabled = true;

            try {
                const isExist = await checkDiscordIdExists(discordId);
                if (isExist) {
                    showCustomModal("LỖI LIÊN KẾT", "ID Discord này đã được sử dụng bởi một tài khoản khác trên hệ thống!", "danger");
                    return;
                }

                const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
                await setDoc(doc(db, "discord_verify", currentUser.uid), {
                    discordId: discordId,
                    code: verifyCode,
                    createdAt: serverTimestamp()
                });

                document.getElementById('discord-verify-zone')?.classList.remove('hidden');
                document.getElementById('edit-discord-link').disabled = true;

                showCustomModal("THÀNH CÔNG", "Mã xác minh đã được tạo trên hệ thống.\n\n⚠️ LƯU Ý: Website đã lưu yêu cầu gửi mã cho Bot. Vui lòng kiểm tra tin nhắn Discord!", "info");
            } catch (err) {
                showCustomModal("LỖI", "Lỗi tạo mã: " + getFirebaseErrorMessage(err), "danger");
            } finally {
                btnRequestVerify.innerText = "NHẬN MÃ";
                btnRequestVerify.disabled = false;
            }
        };
    }

    // Confirm Discord verify code
    const btnConfirmVerify = document.getElementById('btn-confirm-verify');
    if (btnConfirmVerify) {
        btnConfirmVerify.onclick = async () => {
            if (!currentUser) return;
            const inputCode = document.getElementById('discord-verify-code').value.trim();
            if (inputCode.length !== 6) return;

            btnConfirmVerify.innerText = "...";
            btnConfirmVerify.disabled = true;

            try {
                const docRef = doc(db, "discord_verify", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().code === inputCode) {
                    const verifiedDiscordId = docSnap.data().discordId;
                    await deleteDoc(docRef);
                    showCustomModal("LIÊN KẾT THÀNH CÔNG", `Đã xác minh thành công ID Discord: ${verifiedDiscordId}!\n\nHãy ấn LƯU THAY ĐỔI để hoàn tất.`, "info");
                    document.getElementById('discord-verify-zone')?.classList.add('hidden');
                    const inputEl = document.getElementById('edit-discord-link');
                    if (inputEl) {
                        inputEl.value = verifiedDiscordId;
                        inputEl.disabled = false;
                    }
                } else {
                    showCustomModal("SAI MÃ", "Mã xác minh không chính xác hoặc đã hết hạn!", "danger");
                }
            } catch (err) {
                showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
            } finally {
                btnConfirmVerify.innerText = "XÁC NHẬN";
                btnConfirmVerify.disabled = false;
            }
        };
    }

    // Save profile
    document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const btn = e.target.querySelector('button[type="submit"]');
        const statusText = document.getElementById('avatar-upload-status');
        btn.innerHTML = "Đang xử lý...";
        btn.disabled = true;

        try {
            let avatarUrl = document.getElementById('edit-avatar')?.value || '';
            const fileInput = document.getElementById('edit-avatar-file');
            const file = fileInput?.files?.[0];

            if (file) {
                if (statusText) {
                    statusText.classList.remove('hidden');
                    statusText.innerText = 'Đang tải ảnh lên...';
                    statusText.className = "text-xs mt-2 text-yellow-400 font-bold block animate-pulse";
                }
                avatarUrl = await uploadImage(file);
                if (statusText) {
                    statusText.innerText = 'Tải ảnh xong!';
                    statusText.className = "text-xs mt-2 text-green-400 font-bold block";
                }
            }

            const newName = document.getElementById('edit-name').value.trim();
            const discordLink = document.getElementById('edit-discord-link').value.trim();
            const websiteLink = document.getElementById('edit-website-link').value.trim();

            await updateUserProfile(newName || currentUser.displayName, avatarUrl, discordLink, websiteLink);

            const newPass = document.getElementById('edit-new-password')?.value;
            const confirmPass = document.getElementById('edit-confirm-password')?.value;

            if (newPass) {
                if (newPass !== confirmPass) throw new Error("Mật khẩu xác nhận không khớp!");
                if (newPass.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự!");
                try {
                    await changeUserPassword(newPass);
                } catch (passErr) {
                    if (passErr.code === 'auth/requires-recent-login') {
                        throw new Error("Vì lý do bảo mật, bạn cần Đăng Xuất và Đăng Nhập lại trước khi đổi mật khẩu!");
                    }
                    throw passErr;
                }
            }

            currentUserData.discordLink = discordLink;
            currentUserData.websiteLink = websiteLink;
            handleAuthUI(currentUser, currentRole, currentUserData);

            showCustomModal("THÀNH CÔNG", "Hồ sơ đã được cập nhật!", "info");
            document.getElementById('profile-modal')?.classList.remove('active');
            if (fileInput) fileInput.value = '';
            statusText?.classList.add('hidden');
        } catch (err) {
            showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
            if (statusText) {
                statusText.innerText = 'Lỗi tải ảnh!';
                statusText.className = "text-xs mt-2 text-red-500 font-bold block";
            }
        } finally {
            btn.innerHTML = "LƯU THAY ĐỔI 💾";
            btn.disabled = false;
        }
    });
}

// ==========================================
// 3. QUẢN LÝ USER (ADMIN MODAL)
// ==========================================
window.handleRoleChange = async (uid, newRole) => {
    showCustomModal(
        "XÁC NHẬN PHÂN QUYỀN",
        `Bạn có chắc muốn đổi quyền thành viên này sang [${newRole.toUpperCase()}]?`,
        "confirm",
        async () => {
            try {
                await editDocument('users', uid, { role: newRole });
                showCustomModal("THÀNH CÔNG", "Đã cập nhật quyền thành công!", "info");
            } catch (e) { showCustomModal("LỖI", e.message, "danger"); }
        }
    );
};

window.handleDeleteUser = async (uid, name) => {
    showCustomModal(
        "CẢNH BÁO XÓA USER",
        `Bạn đang xóa toàn bộ dữ liệu của [${name}]?\nHành động này KHÔNG THỂ khôi phục!`,
        "danger",
        async () => {
            try {
                await deleteUserAndData(uid);
                renderAdminTable();
                showCustomModal("THÀNH CÔNG", "Đã xóa thành viên!", "info");
            } catch (e) { showCustomModal("LỖI", e.message, "danger"); }
        }
    );
};

async function renderAdminTable() {
    const tbody = document.getElementById('admin-user-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-purple-300">Đang tải dữ liệu...</td></tr>';

    try {
        const users = await fetchAllUsers();
        const totalEl = document.getElementById('total-users-count');
        if (totalEl) totalEl.innerText = users.length;

        tbody.innerHTML = users.map(u => {
            const isMe = currentUser && currentUser.uid === u.id;
            const avatar = u.photoURL || `https://mc-heads.net/avatar/${u.username}`;
            const roles = ['member', 'vip', 'media', 'helper', 'staff', 'mod', 'dev', 'admin'];

            return `
            <tr class="hover:bg-white/5 transition border-b border-purple-500/10 user-row" data-search="${(u.username || '').toLowerCase()} ${(u.email || '').toLowerCase()}">
                <td class="p-4 flex items-center gap-3">
                    <img src="${avatar}" class="w-8 h-8 rounded border border-purple-500/30">
                    <div>
                        <div class="font-bold text-white text-sm">${u.username} ${isMe ? '<span class="text-cyan-400">(Bạn)</span>' : ''}</div>
                    </div>
                </td>
                <td class="p-4 text-gray-400 text-xs">${u.email}</td>
                <td class="p-4 text-gray-400 text-xs">${u.joinedAt ? new Date(u.joinedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td class="p-4">
                    <select onchange="window.handleRoleChange('${u.id}', this.value)" class="bg-black/50 border border-purple-500/30 text-xs text-white rounded px-2 py-1 outline-none">
                        ${roles.map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''} class="bg-gray-900">${r.toUpperCase()}</option>`).join('')}
                    </select>
                </td>
                <td class="p-4 text-center">
                    ${!isMe ? `<button onclick="window.handleDeleteUser('${u.id}', '${u.username}')" class="text-red-500 hover:text-white bg-red-500/10 p-1.5 rounded inline-flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>` : ''}
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-red-500 text-center">Lỗi: ${e.message}</td></tr>`;
    }

    const searchInput = document.getElementById('user-search');
    if (searchInput && !searchInput.hasAttribute('data-search-bound')) {
        searchInput.setAttribute('data-search-bound', 'true');
        searchInput.addEventListener('input', function (e) {
            const val = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.user-row').forEach(row => {
                if (row.dataset.search) {
                    row.style.display = row.dataset.search.includes(val) ? '' : 'none';
                }
            });
        });
    }
}

// ==========================================
// 4. TIN TỨC (NEWS)
// ==========================================
window.deletePost = (collectionName, docId) => {
    showCustomModal(
        "XÓA BÀI VIẾT",
        "Bạn chắc chắn muốn xóa bài viết này vĩnh viễn?",
        "danger",
        async () => {
            try {
                await deleteDocument(collectionName, docId);
                if (collectionName === 'news') renderNews();
                if (collectionName === 'forum_posts') {
                    const isPending = document.getElementById('tab-pending')?.classList.contains('bg-yellow-600');
                    renderForum(isPending ? 'pending' : 'approved');
                }
                showCustomModal("THÔNG BÁO", "Đã xóa bài viết.", "info");
            } catch (e) { showCustomModal("LỖI", e.message, "danger"); }
        }
    );
};

async function renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    const news = await fetchNews();
    const isStaff = ['admin', 'dev', 'staff', 'mod', 'media'].includes(currentRole);

    if (news.length === 0) {
        container.innerHTML = `<div class="glass-panel p-6 text-center text-gray-400">Chưa có tin tức nào.</div>`;
        return;
    }

    container.innerHTML = news.map(item => {
        const safeTitle = (item.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        let modalContent = item.content || '';
        if (item.imageUrl) {
            modalContent = `<img src="${item.imageUrl}" class="w-full h-auto rounded-lg mb-4 border border-cyan-500/30 shadow-lg"><br>` + modalContent;
        }
        const safeContent = modalContent.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        const plainTextDesc = (item.content || '').replace(/<[^>]*>?/gm, '');

        return `
        <div class="glass-panel p-5 rounded-xl forum-post mb-4 border-l-4 border-cyan-500 bg-gradient-to-r from-white/10 to-transparent hover:bg-white/15 transition cursor-pointer group shadow-[0_0_15px_rgba(34,211,238,0.1)]"
             onclick="window.showCustomModal('${safeTitle}', '${safeContent}', 'news')">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3 mb-2">
                        <span class="text-xs text-white bg-purple-600/40 border border-purple-400/30 px-2 rounded shadow-sm">${item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                        <span class="bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">${item.category || 'TIN TỨC'}</span>
                    </div>
                    <h3 class="text-xl font-bold title-font text-cyan-100 drop-shadow-md group-hover:text-white transition">${item.title}</h3>
                    <p class="text-gray-400 text-sm mt-1 line-clamp-2">${plainTextDesc}</p>
                </div>
                <div class="flex flex-col items-end gap-2 flex-shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 w-full sm:w-auto">
                    <span class="text-xs text-gray-400 hidden sm:block">Bởi: <b class="text-cyan-300">${item.author}</b></span>
                    <span class="text-cyan-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">ĐỌC CHI TIẾT ➔</span>
                    ${isStaff ? `<button onclick="event.stopPropagation(); window.deletePost('news', '${item.id}')" class="text-red-400 text-xs hover:text-white font-bold bg-red-900/30 hover:bg-red-600 px-3 py-1.5 rounded border border-red-500/30 mt-1 transition shadow-md inline-flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>XÓA</button>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

// ==========================================
// 5. DIỄN ĐÀN CỘNG ĐỒNG (FORUM)
// ==========================================
window.approvePost = (docId) => {
    showCustomModal(
        "DUYỆT BÀI",
        "Bạn muốn duyệt bài viết này hiển thị công khai?",
        "confirm",
        async () => {
            try {
                await editDocument('forum_posts', docId, { status: 'approved' });
                renderForum('pending');
                showCustomModal("THÀNH CÔNG", "Đã duyệt bài!", "info");
            } catch (e) { showCustomModal("LỖI", e.message, "danger"); }
        }
    );
};

window.filterForum = (status) => {
    renderForum(status);
};

window.toggleComments = (postId) => {
    const section = document.getElementById(`comments-section-${postId}`);
    if (!section) return;
    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) {
        renderComments(postId);
    }
};

window.sendComment = async (postId) => {
    if (!currentUser) return showCustomModal("YÊU CẦU", "Vui lòng đăng nhập để bình luận!", "info");
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input?.value.trim();
    if (!content) return;

    try {
        await addComment(postId, content, currentRole);
        input.value = '';
        renderComments(postId);
    } catch (e) { showCustomModal("LỖI", "Gửi comment thất bại: " + getFirebaseErrorMessage(e), "danger"); }
};

window.deleteCommentAction = (postId, commentId) => {
    showCustomModal(
        "XÓA BÌNH LUẬN",
        "Bạn muốn xóa bình luận này?",
        "danger",
        async () => {
            try {
                await deleteComment(postId, commentId);
                renderComments(postId);
            } catch (e) { showCustomModal("LỖI", e.message, "danger"); }
        }
    );
};

async function renderForum(filterMode = 'approved') {
    const container = document.getElementById('forum-container');
    if (!container) return;

    if (!document.getElementById('forum-tabs')) {
        let tabsHTML = `
        <div id="forum-tabs" class="flex flex-wrap gap-3 mb-6">
            <button id="tab-approved" onclick="window.filterForum('approved')"
                class="px-5 py-2 rounded-lg font-bold text-sm transition border border-cyan-500/30 bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                🌐 CỘNG ĐỒNG
            </button>`;

        if (['admin', 'dev', 'staff', 'mod'].includes(currentRole)) {
            tabsHTML += `
            <button id="tab-pending" onclick="window.filterForum('pending')"
                class="px-5 py-2 rounded-lg font-bold text-sm transition border border-yellow-500/30 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10">
                🛡️ KHO DUYỆT BÀI ⚠️
            </button>`;
        }

        if (currentUser) {
            tabsHTML += `
            <button id="tab-mine" onclick="window.filterForum('mine')"
                class="px-5 py-2 rounded-lg font-bold text-sm transition border border-purple-500/30 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10">
                👤 BÀI CỦA TÔI
            </button>`;
        }

        tabsHTML += `</div><div id="forum-list" class="space-y-4"></div>`;
        container.innerHTML = tabsHTML;
    }

    const buttons = {
        approved: document.getElementById('tab-approved'),
        pending: document.getElementById('tab-pending'),
        mine: document.getElementById('tab-mine')
    };

    Object.values(buttons).forEach(btn => {
        if (btn) btn.className = "px-5 py-2 rounded-lg font-bold text-sm transition border border-gray-700 text-gray-400 hover:bg-white/5";
    });

    if (filterMode === 'approved' && buttons.approved) {
        buttons.approved.className = "px-5 py-2 rounded-lg font-bold text-sm transition bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)] border border-cyan-400";
    } else if (filterMode === 'pending' && buttons.pending) {
        buttons.pending.className = "px-5 py-2 rounded-lg font-bold text-sm transition bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)] border border-yellow-400";
    } else if (filterMode === 'mine' && buttons.mine) {
        buttons.mine.className = "px-5 py-2 rounded-lg font-bold text-sm transition bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] border border-purple-400";
    }

    const listContainer = document.getElementById('forum-list');
    listContainer.innerHTML = '<div class="text-center py-8"><div class="loader-ring w-8 h-8 mx-auto"></div><p class="text-xs text-gray-500 mt-2">Đang tải dữ liệu...</p></div>';

    let posts = [];
    try {
        if (filterMode === 'mine' && currentUser) {
            posts = await fetchMyPosts(currentUser.uid);
        } else {
            if (filterMode === 'pending' && !['admin', 'dev', 'staff', 'mod'].includes(currentRole)) filterMode = 'approved';
            posts = await fetchForumPosts(filterMode);
        }
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = `<div class="text-red-500 text-center">Lỗi tải dữ liệu.</div>`;
        return;
    }

    const isStaff = ['admin', 'dev', 'staff', 'mod'].includes(currentRole);

    if (posts.length === 0) {
        let emptyMsg = "Chưa có bài viết nào.";
        if (filterMode === 'pending') emptyMsg = "Tuyệt vời! Đã duyệt hết bài.";
        if (filterMode === 'mine') emptyMsg = "Bạn chưa đăng bài viết nào.";
        listContainer.innerHTML = `<div class="glass-panel p-8 text-center text-gray-500 italic border border-dashed border-gray-700 rounded-xl">${emptyMsg}</div>`;
        return;
    }

    listContainer.innerHTML = posts.map(post => {
        const isOwner = currentUser && currentUser.uid === post.authorId;
        const canDelete = isStaff || isOwner;

        let statusBadge = '';
        if (filterMode === 'mine') {
            statusBadge = post.status === 'approved'
                ? `<span class="bg-green-500/20 text-green-400 border border-green-500/50 text-[10px] px-2 py-0.5 rounded uppercase font-bold inline-flex items-center gap-1">✓ Đã duyệt</span>`
                : `<span class="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Đang chờ</span>`;
        }

        return `
        <div class="glass-panel p-6 rounded-xl forum-post hover:bg-white/5 transition relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition"></div>
            <div class="flex items-start space-x-4">
                <img src="${post.avatar || `https://mc-heads.net/avatar/${post.author}`}" class="w-12 h-12 rounded-lg border border-purple-500/30 shadow-sm bg-gray-900 object-cover">
                <div class="flex-1 w-full min-w-0">
                    <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                            <h4 class="font-bold title-font text-white truncate max-w-[150px] sm:max-w-xs">${post.author}</h4>
                            <span class="text-[10px] bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-gray-400">${post.authorRole || 'Member'}</span>
                            ${statusBadge}
                        </div>
                        <span class="text-xs text-purple-300/70 font-mono">${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold title-font mb-2 text-cyan-200 break-words">${post.title}</h3>
                    <div class="text-purple-100/80 text-sm mb-4 whitespace-pre-line bg-black/20 p-3 rounded-lg border border-white/5 overflow-hidden break-words">${post.content}</div>
                    <div class="flex items-center justify-between border-t border-gray-700/50 pt-3 mt-2">
                        <button onclick="window.toggleComments('${post.id}')" class="text-xs sm:text-sm text-gray-400 hover:text-cyan-400 transition flex items-center gap-2">
                            <span>💬</span> Bình luận
                        </button>
                        <div class="flex gap-2">
                            ${filterMode === 'pending' && isStaff ? `<button onclick="window.approvePost('${post.id}')" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg shadow-green-900/20 inline-flex items-center gap-1">✓ DUYỆT NGAY</button>` : ''}
                            ${canDelete ? `<button onclick="window.deletePost('forum_posts', '${post.id}')" class="text-red-500 hover:text-red-300 text-xs font-bold border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded transition inline-flex items-center gap-1">Xóa</button>` : ''}
                        </div>
                    </div>
                    <div id="comments-section-${post.id}" class="hidden mt-4 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-purple-500/20">
                        <div id="comments-list-${post.id}" class="space-y-3 mb-3 max-h-60 overflow-y-auto custom-scrollbar p-1"></div>
                        ${currentUser ? `
                        <div class="flex gap-2 relative">
                            <input type="text" id="comment-input-${post.id}" class="cyber-input w-full px-4 py-2 rounded-full text-sm pr-10" placeholder="Viết bình luận..." onkeydown="if(event.key==='Enter') window.sendComment('${post.id}')">
                            <button onclick="window.sendComment('${post.id}')" class="absolute right-1 top-1 bg-cyan-600 hover:bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition">➤</button>
                        </div>` : '<p class="text-xs text-gray-500 italic bg-black/30 p-2 rounded text-center">Đăng nhập để tham gia thảo luận.</p>'}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function renderComments(postId) {
    const container = document.getElementById(`comments-list-${postId}`);
    if (!container) return;
    container.innerHTML = '<div class="text-xs text-gray-500">Đang tải...</div>';

    try {
        const comments = await fetchComments(postId);
        const isStaff = ['admin', 'dev', 'staff', 'mod'].includes(currentRole);

        if (comments.length === 0) {
            container.innerHTML = '<div class="text-xs text-gray-600 italic">Chưa có bình luận nào.</div>';
            return;
        }

        container.innerHTML = comments.map(c => {
            const isOwner = currentUser && currentUser.uid === c.uid;
            const canDel = isStaff || isOwner;
            return `
            <div class="flex gap-3">
                <img src="${c.avatar}" class="w-6 h-6 rounded-full border border-gray-600">
                <div class="bg-gray-800/50 rounded-lg px-3 py-2 w-full border border-gray-700">
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="text-xs font-bold text-cyan-400">${c.username}</span>
                        <div class="flex gap-2 items-center">
                            <span class="text-[10px] text-gray-500">${c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            ${canDel ? `<button onclick="window.deleteCommentAction('${postId}', '${c.id}')" class="text-red-500 hover:text-white text-[10px]">✕</button>` : ''}
                        </div>
                    </div>
                    <p class="text-sm text-gray-300">${c.content}</p>
                </div>
            </div>`;
        }).join('');
    } catch (e) { console.error(e); }
}

// ==========================================
// 6. GIVEAWAY (QUÀ TẶNG TOÀN HỆ THỐNG)
// ==========================================
async function renderGiveaways() {
    const container = document.getElementById('giveaways-list');
    if (!container) return;

    if (['admin', 'dev', 'staff', 'mod'].includes(currentRole)) {
        document.getElementById('admin-giveaway-controls')?.classList.remove('hidden');
    } else {
        document.getElementById('admin-giveaway-controls')?.classList.add('hidden');
    }

    try {
        const giveaways = await fetchActiveGiveaways();
        if (giveaways.length === 0) {
            container.innerHTML = '<div class="glass-panel p-8 text-center text-gray-500 italic rounded-xl border border-dashed border-gray-700">Hiện tại chưa có sự kiện Giveaway nào diễn ra. Quý khách vui lòng quay lại sau!</div>';
            return;
        }

        container.innerHTML = giveaways.map(gw => {
            const hasJoined = currentUser && gw.participants && gw.participants.includes(currentUser.uid);
            const isClosed = gw.status === 'closed';
            const endDate = new Date(gw.endTime);
            const endTimeStr = isNaN(endDate.getTime()) ? gw.endTime : endDate.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

            let actionBtn = '';
            if (isClosed) {
                actionBtn = `
                    <div class="text-center bg-yellow-500/10 border border-yellow-500/30 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <p class="text-[10px] text-yellow-200 uppercase font-bold mb-1 tracking-widest">👑 NGƯỜI TRÚNG GIẢI 👑</p>
                        <p class="text-xl font-black text-yellow-400">${gw.winnerName || 'Không có ai'}</p>
                    </div>`;
            } else if (!currentUser) {
                actionBtn = `<button onclick="document.getElementById('auth-modal').classList.add('active')" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold transition w-full md:w-auto">ĐĂNG NHẬP ĐỂ THAM GIA</button>`;
            } else if (hasJoined) {
                actionBtn = `<button disabled class="bg-green-600/50 text-green-300 border border-green-500/50 px-6 py-2.5 rounded-lg font-bold cursor-not-allowed w-full md:w-auto inline-flex items-center justify-center gap-1">✓ ĐÃ BÁO DANH</button>`;
            } else {
                actionBtn = `<button onclick="window.joinGiveawayAction('${gw.id}')" class="bg-gradient-to-r from-pink-600 to-purple-500 hover:from-pink-500 hover:to-purple-400 text-white px-8 py-2.5 rounded-lg font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition transform hover:scale-105 w-full md:w-auto">🎉 THAM GIA NGAY</button>`;
            }

            let adminBtn = '';
            if (currentRole === 'admin') {
                if (!isClosed) {
                    adminBtn = `<button onclick="window.endGiveawayAction('${gw.id}')" class="mt-4 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition w-full shadow-lg shadow-yellow-900/30">🏆 CHỐT SỰ KIỆN &amp; QUAY SỐ</button>`;
                } else {
                    adminBtn = `<button onclick="window.deleteGiveawayAction('${gw.id}')" class="mt-4 bg-red-600/50 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition w-full inline-flex items-center justify-center gap-1">XÓA SỰ KIỆN NÀY</button>`;
                }
            }

            const statusBadge = isClosed
                ? `<span class="bg-gray-900/80 text-gray-400 border border-gray-500/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">🔒 ĐÃ KẾT THÚC</span>`
                : `<span class="bg-pink-900/50 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block animate-pulse">🔥 ĐANG DIỄN RA</span>`;

            return `
            <div class="glass-panel p-6 sm:p-8 rounded-2xl border ${isClosed ? 'border-gray-600/30 opacity-80' : 'border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]'} relative overflow-hidden group">
                ${!isClosed ? '<div class="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition duration-700 pointer-events-none"></div>' : ''}
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div class="text-center md:text-left w-full md:w-auto flex-1">
                        ${statusBadge}
                        <h3 class="text-2xl sm:text-3xl font-black ${isClosed ? 'text-gray-300' : 'text-white'} mb-2 title-font">${gw.title}</h3>
                        <p class="text-lg text-yellow-400 font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
                            <span class="text-2xl">🎁</span> ${gw.prize}
                        </p>
                        <div class="text-sm text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 font-mono">
                            <span class="bg-black/40 px-2 py-1 rounded border border-white/5">Hạn chót: ${endTimeStr}</span>
                            <span class="bg-black/40 px-2 py-1 rounded border border-white/5">👥 Đã đăng ký: <span class="text-cyan-400 font-bold">${gw.participants ? gw.participants.length : 0}</span> người</span>
                        </div>
                    </div>
                    <div class="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 flex flex-col items-end">
                        <div class="w-full">${actionBtn}</div>
                        <div class="w-full">${adminBtn}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error("LỖI TẢI GIVEAWAY:", error);
        container.innerHTML = '<div class="text-red-500 p-4 text-center glass-panel border border-red-500/30 rounded-xl">Lỗi kết nối máy chủ dữ liệu.</div>';
    }
}

window.joinGiveawayAction = async (id) => {
    try {
        showCustomModal("ĐANG XỬ LÝ", "Hệ thống đang kiểm tra điều kiện tài khoản...", "info");
        await joinGiveaway(id);
        showCustomModal("🎉 ĐĂNG KÝ THÀNH CÔNG", "Bạn đã ghi danh thành công vào sự kiện!\nKết quả sẽ được công bố khi Admin chốt giải. Chúc bạn may mắn!", "info");
        renderGiveaways();
    } catch (err) {
        if (err.message === "NOT_VERIFIED") {
            showCustomModal("TỪ CHỐI THAM GIA", "Tài khoản của bạn chưa được liên kết với ID Discord!\n\nCách khắc phục:\n1. Mở Hồ Sơ Cá Nhân (Avatar góc phải).\n2. Nhập ID Discord của bạn.\n3. Bấm [NHẬN MÃ] và kiểm tra tin nhắn Discord để xác minh.", "danger");
        } else if (err.message === "ALREADY_JOINED") {
            showCustomModal("THÔNG BÁO", "Bạn đã có tên trong danh sách tham gia sự kiện này rồi!", "info");
        } else {
            showCustomModal("LỖI KẾT NỐI", getFirebaseErrorMessage(err), "danger");
        }
    }
};

window.endGiveawayAction = (id) => {
    showCustomModal(
        "XÁC NHẬN CHỐT GIẢI",
        "Hệ thống sẽ tổng hợp danh sách và chọn NGẪU NHIÊN 1 NGƯỜI trúng thưởng.\nBạn có chắc chắn muốn kết thúc sự kiện này ngay bây giờ?",
        "confirm",
        async () => {
            try {
                showCustomModal("ĐANG QUAY SỐ", "Đang tổng hợp danh sách và chọn người may mắn...", "info");
                const result = await endGiveaway(id);
                showCustomModal("🎉 ĐÃ TÌM THẤY NGƯỜI TRÚNG GIẢI", `Sự kiện đã kết thúc!\nNgười may mắn nhất là: ${result.winnerName} 🏆`, "info");
                renderGiveaways();

                const isIdValid = result.winnerDiscordId && /^\d+$/.test(result.winnerDiscordId);
                const tagWinner = isIdValid ? `<@${result.winnerDiscordId}>` : `**${result.winnerName}**`;
                const discordMessage = result.winnerName === "Không có ai tham gia"
                    ? `😔 Rất tiếc, sự kiện **${result.title}** đã kết thúc nhưng không có ai tham gia!`
                    : `🎉 **KẾT QUẢ SỰ KIỆN: ${result.title.toUpperCase()}** 🎉\nXin chúc mừng ${tagWinner} đã là người may mắn nhất! Vui lòng liên hệ Admin để nhận thưởng nhé!`;

                await sendDiscordWebhook(discordMessage, [{
                    title: "🏆 CHI TIẾT GIẢI THƯỞNG",
                    description: `🎁 **Phần thưởng:** ${result.prize}\n👤 **Người trúng:** ${result.winnerName}`,
                    color: 15469315,
                    footer: { text: "CornMC Event System" },
                    timestamp: new Date().toISOString()
                }]);
            } catch (e) {
                showCustomModal("LỖI", e.message, "danger");
            }
        }
    );
};

window.deleteGiveawayAction = (id) => {
    showCustomModal("XÓA SỰ KIỆN", "Bạn chắc chắn muốn xóa sự kiện Giveaway này?", "danger", async () => {
        try {
            await deleteDocument('giveaways', id);
            renderGiveaways();
            showCustomModal("THÀNH CÔNG", "Đã xóa sự kiện.", "info");
        } catch (e) {
            showCustomModal("LỖI", e.message, "danger");
        }
    });
};

// ==========================================
// 7. ĐỘI NGŨ BAN QUẢN TRỊ (STAFF)
// ==========================================
async function renderStaff() {
    const container = document.getElementById('staff-container');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-12">
            <div class="loader-ring w-12 h-12 mx-auto mb-4"></div>
            <p class="text-cyan-400 font-bold neon-text animate-pulse">Đang tải danh sách đội ngũ...</p>
        </div>`;

    try {
        const staffList = await fetchStaffMembers();
        if (!staffList || staffList.length === 0) {
            container.innerHTML = `<div class="glass-panel p-6 text-center text-gray-400 italic rounded-xl border border-dashed border-gray-700">Chưa có thông tin Ban Quản Trị.</div>`;
            return;
        }

        const rolePriority = { admin: 1, dev: 2, mod: 3, staff: 4, media: 5, helper: 6 };
        staffList.sort((a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99));

        const roleConfig = {
            admin: { name: 'ADMIN', icon: '👑', color: 'text-red-500', border: 'border-red-600', bg: 'bg-red-500/20' },
            mod: { name: 'MODERATOR', icon: '🛡️', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
            dev: {
                name: 'Developer',
                icon: `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
                color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
            },
            staff: {
                name: 'Staff',
                icon: `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`,
                color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            },
            media: {
                name: 'Media',
                icon: `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`,
                color: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
            },
            helper: {
                name: 'Helper',
                icon: `<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
                color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
            }
        };

        const html = staffList.map(staff => {
            const avatar = staff.photoURL || `https://mc-heads.net/avatar/${staff.username || 'Steve'}`;
            const conf = roleConfig[staff.role] || { name: (staff.role || 'STAFF').toUpperCase(), icon: '👤', color: 'text-gray-400', border: 'border-gray-500/50', bg: 'bg-gray-500/10' };

            let socialsHtml = '';
            if (staff.discordLink || staff.websiteLink) {
                if (staff.discordLink) {
                    const isId = /^\d+$/.test(staff.discordLink);
                    const link = isId ? `https://discordapp.com/users/${staff.discordLink}` : staff.discordLink;
                    socialsHtml += `
                    <a href="${link}" target="_blank" class="px-3 py-1.5 rounded bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-[#5865F2] hover:text-white border border-[#5865F2]/30 transition text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        Discord
                    </a>`;
                }
                if (staff.websiteLink) {
                    const linkLower = staff.websiteLink.toLowerCase();
                    let pName = "Website";
                    let pColor = "text-cyan-400 border-cyan-500/30 bg-cyan-500/20 hover:bg-cyan-500/40";
                    if (linkLower.includes('facebook.com') || linkLower.includes('fb.com')) { pName = "Facebook"; pColor = "text-blue-400 border-blue-500/30 bg-blue-500/20 hover:bg-blue-500/40"; }
                    else if (linkLower.includes('youtube.com') || linkLower.includes('youtu.be')) { pName = "YouTube"; pColor = "text-red-400 border-red-500/30 bg-red-500/20 hover:bg-red-500/40"; }
                    else if (linkLower.includes('tiktok.com')) { pName = "TikTok"; pColor = "text-pink-400 border-pink-500/30 bg-pink-500/20 hover:bg-pink-500/40"; }

                    socialsHtml += `
                    <a href="${staff.websiteLink}" target="_blank" class="px-3 py-1.5 rounded border ${pColor} hover:text-white transition text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        ${pName}
                    </a>`;
                }
            } else {
                socialsHtml = `<span class="text-gray-600 text-[10px] italic mt-1">Chưa liên kết MXH</span>`;
            }

            return `
            <div class="glass-panel p-6 rounded-2xl flex flex-col items-center border-t-4 ${conf.border} ${conf.bg} hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                <div class="relative">
                    <img src="${avatar}" alt="${staff.username}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mb-4 border-2 ${conf.border} shadow-lg object-cover bg-gray-900 transition-all">
                    <span class="absolute -bottom-2 -right-2 text-lg drop-shadow-md bg-black/70 rounded-full w-8 h-8 flex items-center justify-center">${conf.icon}</span>
                </div>
                <h4 class="text-xl sm:text-2xl font-black text-white title-font drop-shadow-md text-center line-clamp-1 w-full">${staff.username || 'Ẩn danh'}</h4>
                <span class="inline-block px-4 py-1 mt-2 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase border ${conf.border} ${conf.color} bg-black/40">
                    ${conf.name}
                </span>
                <div class="mt-5 pt-4 w-full flex justify-center gap-2 border-t border-white/5">
                    ${socialsHtml}
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">${html}</div>`;
    } catch (error) {
        console.error("Lỗi khi renderStaff:", error);
        container.innerHTML = `<div class="text-red-500 text-center glass-panel p-6 border border-red-500/30 rounded-xl">Có lỗi xảy ra khi tải danh sách BQT.</div>`;
    }
}

// ==========================================
// 8. TRẠNG THÁI NETWORK & PARTICLES & NAVIGATION
// ==========================================
async function updateNetworkStats() {
    try {
        const res = await fetch('https://api.mcsrvstat.us/3/play.cornmc.vn');
        const data = await res.json();

        const networkOnlineEl = document.getElementById('network-online');
        const survivalStatusEl = document.getElementById('card-survival-status');
        const smpStatusEl = document.getElementById('card-smp-status');

        if (data.online) {
            const onlineCount = data.players ? data.players.online : 0;
            const maxCount = data.players ? data.players.max : 200;
            if (networkOnlineEl) networkOnlineEl.innerText = `${onlineCount} ĐANG CHƠI`;
            if (survivalStatusEl) survivalStatusEl.innerText = `Online (${onlineCount}/${maxCount})`;
            if (smpStatusEl) smpStatusEl.innerText = `Online`;
        } else {
            if (networkOnlineEl) networkOnlineEl.innerText = "BẢO TRÌ";
            if (survivalStatusEl) survivalStatusEl.innerText = "Đang kết nối...";
            if (smpStatusEl) smpStatusEl.innerText = "Đang kết nối...";
        }
    } catch (e) {
        console.warn("Lỗi thống kê máy chủ:", e);
        const networkOnlineEl = document.getElementById('network-online');
        if (networkOnlineEl) networkOnlineEl.innerText = "SẴN SÀNG";
    }
}

const initParticles = () => {
    const canvas = document.getElementById('particle-network');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = Math.random() > 0.5 ? '#8b5cf6' : '#22d3ee';
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color; ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    for (let i = 0; i < Math.floor((canvas.width * canvas.height) / 20000); i++) particlesArray.push(new Particle());

    function animate() {
        if (!document.body.classList.contains('lite-mode')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(); particlesArray[i].draw();
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath(); ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 - dist / 1000})`;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
};

function switchHubSection(target) {
    const section = document.getElementById(`section-${target}`);
    if (!section) return;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.nav-link[data-nav="${target}"]`).forEach(l => l.classList.add('active'));

    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    section.classList.add('active');

    if (target === 'news') renderNews();
    if (target === 'forum') renderForum('approved');
    if (target === 'giveaway') renderGiveaways();
    if (target === 'staff') renderStaff();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 9. KHỞI ĐỘNG HỆ THỐNG CORNHUB
// ==========================================
window.addEventListener('load', () => {
    initParticles();
    setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 600);

    // Đóng modal khi click nút X hoặc nền tối
    document.querySelectorAll('.modal').forEach(m => {
        m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
        m.querySelectorAll('.close-modal').forEach(b => b.onclick = () => m.classList.remove('active'));
    });

    // Copy IP
    const copyIpBtn = document.getElementById('copy-ip-btn');
    if (copyIpBtn) copyIpBtn.onclick = window.copyServerIP;

    setupAuthForms();
    setupProfileAndDiscordVerify();

    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const desktopLinks = document.getElementById('nav-links');

    if (mobileBtn && mobileMenu && desktopLinks) {
        const links = desktopLinks.querySelectorAll('a');
        let mobileHtml = '';
        links.forEach(link => {
            const target = link.getAttribute('data-nav');
            const text = link.innerText;
            const href = link.getAttribute('href');
            const targetAttr = link.getAttribute('target') === '_blank' ? 'target="_blank"' : '';
            if (target) {
                mobileHtml += `<a href="#${target}" class="nav-link block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-bold title-font transition mb-1" data-nav="${target}">${text}</a>`;
            } else {
                mobileHtml += `<a href="${href}" ${targetAttr} class="nav-link block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-bold title-font transition mb-1">${text}</a>`;
            }
        });
        mobileMenu.innerHTML = mobileHtml;
        mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // SPA Tab Navigation
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-nav');
            if (!target) return;
            e.preventDefault();
            history.replaceState(null, '', target === 'home' ? '/' : `#${target}`);
            switchHubSection(target);
        });
    });

    // Forum Post Creation
    document.getElementById('create-post-trigger')?.addEventListener('click', () => {
        document.getElementById('post-modal')?.classList.add('active');
    });

    document.getElementById('forum-post-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('forum-title').value;
        const content = document.getElementById('forum-content').value;
        try {
            const status = ['admin', 'dev', 'staff', 'mod'].includes(currentRole) ? 'approved' : 'pending';
            await createPost('forum_posts', { title, content, status, authorRole: currentRole });
            showCustomModal(status === 'approved' ? "ĐĂNG BÀI THÀNH CÔNG" : "ĐÃ GỬI DUYỆT", status === 'approved' ? "Bài viết đã được đăng!" : "Bài viết đang chờ admin duyệt.", "info");
            document.getElementById('post-modal')?.classList.remove('active');
            e.target.reset();
            renderForum(status === 'approved' ? 'approved' : 'pending');
        } catch (err) { showCustomModal("LỖI ĐĂNG BÀI", err.message, "danger"); }
    });

    // Giveaway Creation (Admin)
    document.getElementById('create-giveaway-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('gw-title').value;
        const prize = document.getElementById('gw-prize').value;
        const endtime = document.getElementById('gw-endtime').value;
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerText = "ĐANG TẠO...";
        btn.disabled = true;

        try {
            await createGiveaway(title, prize, endtime);
            showCustomModal("THÀNH CÔNG", "Đã khởi tạo sự kiện Giveaway mới!", "info");
            document.getElementById('create-giveaway-modal')?.classList.remove('active');
            renderGiveaways();
            e.target.reset();
        } catch (err) {
            showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
        } finally {
            btn.innerText = "PHÁT ĐỘNG SỰ KIỆN 🚀";
            btn.disabled = false;
        }
    });

    // Support direct hash navigation (e.g. /#giveaway, /#forum, /#news, /#staff)
    const initialHash = window.location.hash.replace('#', '');
    if (['giveaway', 'news', 'forum', 'staff'].includes(initialHash)) {
        switchHubSection(initialHash);
    }

    // Load initial data
    updateNetworkStats();
    setInterval(updateNetworkStats, 60000);
    subscribeToAuth(handleAuthUI);
});
