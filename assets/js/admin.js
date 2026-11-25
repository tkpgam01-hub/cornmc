import { 
    subscribeToAuth, loginGoogle, logout,
    fetchNews, fetchGuides, fetchForumPosts, createPost, 
    fetchAllUsers, deleteUserAndData, updateUserProfile, editDocument, 
    deleteDocument, fetchComments, addComment, deleteComment, showCustomModal, getFirebaseErrorMessage
} from './core.js';

import { uploadImage } from './core.js';
let currentTab = 'dashboard';

// 1. KIỂM TRA QUYỀN ADMIN KHI VÀO TRANG
subscribeToAuth((user, role) => {
    if (!user || !['admin', 'dev'].includes(role)) {
        showCustomModal("TỪ CHỐI", "⛔ BẠN KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY!", "danger", () => {
            window.location.href = '/'; // Đá về trang chủ
        });
    } else {
        // Load dữ liệu lần đầu
        loadDashboard();
    }
});

document.getElementById('logout-btn').onclick = async () => {
    await logout();
    window.location.href = '/';
};

// 2. CHUYỂN TAB
window.switchTab = (tabName) => {
    // Ẩn tất cả tab
    document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
    // Hiện tab được chọn
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Highlight sidebar
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    // Load dữ liệu tương ứng
    if(tabName === 'dashboard') loadDashboard();
    if(tabName === 'users') loadUsers();
    if(tabName === 'news') loadPosts('news');
    if(tabName === 'guides') loadPosts('guides');
    if(tabName === 'forum') loadPendingForum();
    if(tabName === 'punishments') loadPunishments('bans');
};

// 3. LOAD DASHBOARD (THỐNG KÊ)
async function loadDashboard() {
    const users = await fetchAllUsers();
    const pending = await fetchForumPosts('pending');
    const news = await fetchNews();
    const guides = await fetchGuides();

    document.getElementById('stat-users').innerText = users.length;
    document.getElementById('stat-pending').innerText = pending.length;
    document.getElementById('stat-news').innerText = news.length;
    document.getElementById('stat-guides').innerText = guides.length;

    // Badge thông báo bài chờ duyệt
    const badge = document.getElementById('pending-badge');
    if(pending.length > 0) {
        badge.innerText = pending.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// HIỂN THỊ VÀ UPLOAD ẢNH KHI CHỌN FILE
document.getElementById('edit-image-file')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgPreview = document.getElementById('edit-image-preview');
    const urlInput = document.getElementById('edit-image');
    const statusText = document.getElementById('upload-status');

    // Hiện ảnh preview ngay lập tức trên máy
    imgPreview.src = URL.createObjectURL(file);
    imgPreview.classList.remove('hidden');
    
    // Hiện thông báo đang tải
    statusText.classList.remove('hidden');
    statusText.innerText = '⏳ Đang tải ảnh lên hệ thống...';
    statusText.className = "text-xs mt-2 text-yellow-400 font-bold block animate-pulse";

    try {
        // Upload lên Firebase Storage
        const imageUrl = await uploadImage(file);
        
        // Gắn link Firebase trả về vào thẻ input ẩn để hàm Submit mang đi lưu
        urlInput.value = imageUrl;
        
        statusText.innerText = 'Đã tải ảnh xong! Sẵn sàng lưu.';
        statusText.className = "text-xs mt-2 text-green-400 font-bold block";
    } catch (error) {
        console.error(error);
        statusText.innerText = '❌ Lỗi tải ảnh! Vui lòng thử lại.';
        statusText.className = "text-xs mt-2 text-red-500 font-bold block";
        urlInput.value = ''; // Xóa URL cũ nếu lỗi
    }
});

// 4. QUẢN LÝ USER (LỌC THEO ROLE, HẠ ROLE NHANH, BAN/UNBAN & BẢO VỆ ADMIN)
let allUsersCache = [];
let selectedRoleFilter = 'all';

const ROLE_FILTER_CONFIG = [
    { key: 'all', label: 'Tất cả', color: 'border-gray-500/40 text-gray-200' },
    { key: 'staff_all', label: '🛡️ BQT', color: 'border-cyan-500/40 text-cyan-300' },
    { key: 'admin', label: '👑 Admin', color: 'border-red-500/40 text-red-400' },
    { key: 'dev', label: '💻 Dev', color: 'border-yellow-500/40 text-yellow-400' },
    { key: 'mod', label: '⚔️ Mod', color: 'border-emerald-500/40 text-emerald-400' },
    { key: 'staff', label: '🛡️ Staff', color: 'border-purple-500/40 text-purple-400' },
    { key: 'media', label: '🎬 Media', color: 'border-pink-500/40 text-pink-400' },
    { key: 'helper', label: '🤝 Helper', color: 'border-green-500/40 text-green-400' },
    { key: 'vip', label: '⭐ VIP', color: 'border-amber-500/40 text-amber-300' },
    { key: 'member', label: '👤 Member', color: 'border-gray-600/40 text-gray-400' }
];

function renderRoleFilterPills() {
    const pillsContainer = document.getElementById('role-filter-pills');
    if (!pillsContainer) return;

    const counts = { all: allUsersCache.length, staff_all: 0 };
    allUsersCache.forEach(u => {
        const r = u.role || 'member';
        counts[r] = (counts[r] || 0) + 1;
        if (['admin', 'dev', 'mod', 'staff', 'media', 'helper'].includes(r)) {
            counts.staff_all += 1;
        }
    });

    pillsContainer.innerHTML = ROLE_FILTER_CONFIG.map(item => {
        const count = counts[item.key] || 0;
        const isActive = selectedRoleFilter === item.key;
        const activeClass = isActive
            ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
            : `bg-black/40 hover:bg-white/10 ${item.color}`;
        return `
            <button onclick="window.setRoleFilter('${item.key}')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${activeClass}">
                <span>${item.label}</span>
                <span class="px-1.5 py-0.5 rounded bg-black/40 text-[10px]">${count}</span>
            </button>
        `;
    }).join('');
}

window.setRoleFilter = (roleKey) => {
    selectedRoleFilter = roleKey;
    const selectEl = document.getElementById('filter-role');
    if (selectEl) selectEl.value = roleKey;
    renderRoleFilterPills();
    renderUsersTable();
};

function renderUsersTable() {
    const list = document.getElementById('user-list');
    if (!list) return;

    const searchVal = (document.getElementById('search-user')?.value || '').toLowerCase().trim();

    const filtered = allUsersCache.filter(u => {
        const role = u.role || 'member';
        const matchRole =
            selectedRoleFilter === 'all' ? true :
            selectedRoleFilter === 'staff_all' ? ['admin', 'dev', 'mod', 'staff', 'media', 'helper'].includes(role) :
            role === selectedRoleFilter;

        if (!matchRole) return false;
        if (!searchVal) return true;
        const haystack = `${(u.username || '').toLowerCase()} ${(u.email || '').toLowerCase()} ${role.toLowerCase()}`;
        return haystack.includes(searchVal);
    });

    const totalEl = document.getElementById('total-users-count');
    const filteredEl = document.getElementById('filtered-users-count');
    if (totalEl) totalEl.innerText = allUsersCache.length;
    if (filteredEl) filteredEl.innerText = filtered.length;

    if (filtered.length === 0) {
        list.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 italic">Không tìm thấy thành viên nào phù hợp bộ lọc.</td></tr>';
        return;
    }

    list.innerHTML = filtered.map(u => {
        const isBanned = u.isBanned === true;
        const banClass = isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500';
        const banText = isBanned ? 'Đã BAN' : 'Hoạt động';
        const currentUserRole = u.role || 'member';
        const isAdmin = currentUserRole === 'admin';

        // Cột Chọn Role
        let roleDisplay = '';
        if (isAdmin) {
            roleDisplay = `<span class="bg-red-900/50 text-red-400 font-bold px-3 py-1.5 rounded text-xs border border-red-500/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]">👑 ADMIN</span>`;
        } else {
            const roles = ['member', 'vip', 'media', 'helper', 'staff', 'mod', 'dev'];
            roleDisplay = `
                <select onchange="window.updateUserRole('${u.id}', this.value)" class="bg-black border border-gray-700 text-xs rounded px-2 py-1 text-white hover:border-cyan-500 transition outline-none">
                    ${roles.map(r => `<option value="${r}" ${currentUserRole === r ? 'selected' : ''}>${r.toUpperCase()}</option>`).join('')}
                </select>
            `;
        }

        // Cột Hành động: Hạ nhanh về Member + Ban/Unban
        let actionButton = '';
        if (isAdmin) {
            actionButton = `<span class="text-[10px] text-gray-600 italic font-bold">VÔ HIỆU HÓA</span>`;
        } else {
            const safeName = (u.username || 'User').replace(/'/g, "\\'");
            const demoteBtn = currentUserRole !== 'member'
                ? `<button onclick="window.demoteToMember('${u.id}', '${safeName}', '${currentUserRole}')"
                        class="text-xs font-bold px-2.5 py-1 rounded border border-orange-500/60 text-orange-400 hover:bg-orange-500/20 transition"
                        title="Hạ quyền về Member">
                        ⬇️ Hạ Role
                   </button>`
                : '';

            actionButton = `
                <div class="flex items-center justify-end gap-2">
                    ${demoteBtn}
                    <button onclick="window.toggleBanUser('${u.id}', ${isBanned})"
                        class="text-xs font-bold px-3 py-1 rounded border ${isBanned ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-red-500 text-red-500 hover:bg-red-500/10'} transition">
                        ${isBanned ? 'MỞ KHÓA' : 'BAN'}
                    </button>
                </div>
            `;
        }

        // Cột Liên Kết (Discord & MXH)
        let socialsHtml = '';
        if (u.discordLink || u.websiteLink) {
            let links = [];
            if (u.discordLink) {
                const isId = /^\d+$/.test(u.discordLink);
                const link = isId ? `https://discordapp.com/users/${u.discordLink}` : u.discordLink;
                links.push(`<a href="${link}" target="_blank" class="px-2 py-1 rounded bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-[#5865F2] hover:text-white border border-[#5865F2]/30 transition text-[10px] font-bold flex items-center gap-1 w-max" title="${u.discordLink}">💬 Discord</a>`);
            }
            if (u.websiteLink) {
                let link = u.websiteLink.toLowerCase();
                let pName = "Website";
                let pColor = "text-cyan-400 border-cyan-500/30 bg-cyan-500/20 hover:bg-cyan-500/40";
                if (link.includes("facebook.com") || link.includes("fb.com")) { pName = "Facebook"; pColor = "text-blue-400 border-blue-500/30 bg-blue-600/20 hover:bg-blue-600/40"; }
                else if (link.includes("youtube.com") || link.includes("youtu.be")) { pName = "YouTube"; pColor = "text-red-400 border-red-500/30 bg-red-600/20 hover:bg-red-600/40"; }
                else if (link.includes("tiktok.com")) { pName = "TikTok"; pColor = "text-gray-300 border-gray-500/30 bg-gray-600/20 hover:bg-gray-600/40"; }
                links.push(`<a href="${u.websiteLink}" target="_blank" class="px-2 py-1 rounded ${pColor} hover:text-white transition text-[10px] font-bold flex items-center gap-1 w-max" title="${u.websiteLink}">🌐 ${pName}</a>`);
            }
            socialsHtml = `<div class="flex flex-col gap-1.5">${links.join('')}</div>`;
        } else {
            socialsHtml = `<span class="text-gray-600 text-[10px] italic">Trống</span>`;
        }

        return `
        <tr class="hover:bg-white/5 transition border-b border-white/5 user-row">
            <td class="p-4 flex items-center gap-3">
                <img src="${u.photoURL || `https://mc-heads.net/avatar/${u.username}`}" class="w-8 h-8 rounded border border-gray-700 object-cover bg-black">
                <span class="font-bold text-white">${u.username}</span>
            </td>
            <td class="p-4 text-gray-400 text-xs">${u.email}</td>
            <td class="p-4">${socialsHtml}</td>
            <td class="p-4">${roleDisplay}</td>
            <td class="p-4"><span class="text-xs px-2 py-1 rounded font-bold ${banClass}">${banText}</span></td>
            <td class="p-4 text-right">${actionButton}</td>
        </tr>`;
    }).join('');
}

async function loadUsers() {
    const list = document.getElementById('user-list');
    list.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Đang tải...</td></tr>';

    allUsersCache = await fetchAllUsers();
    renderRoleFilterPills();
    renderUsersTable();

    const searchInput = document.getElementById('search-user');
    if (searchInput && !searchInput.hasAttribute('data-search-bound')) {
        searchInput.setAttribute('data-search-bound', 'true');
        searchInput.addEventListener('input', () => renderUsersTable());
    }

    const roleSelect = document.getElementById('filter-role');
    if (roleSelect && !roleSelect.hasAttribute('data-filter-bound')) {
        roleSelect.setAttribute('data-filter-bound', 'true');
        roleSelect.addEventListener('change', (e) => {
            window.setRoleFilter(e.target.value);
        });
    }
}

window.updateUserRole = async (uid, newRole) => {
    if (confirm(`Đổi quyền user này thành ${newRole.toUpperCase()}?`)) {
        try {
            await editDocument('users', uid, { role: newRole });
            const target = allUsersCache.find(u => u.id === uid);
            if (target) target.role = newRole;
            renderRoleFilterPills();
            renderUsersTable();
            showCustomModal("THÀNH CÔNG", `Đã cập nhật quyền thành ${newRole.toUpperCase()}!`, "info");
        } catch (err) {
            showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
            renderUsersTable();
        }
    } else {
        // Hoàn tác hiển thị dropdown nếu bấm Hủy
        renderUsersTable();
    }
};

window.demoteToMember = async (uid, username, oldRole) => {
    if (confirm(`Bạn có chắc muốn HẠ QUYỀN [${username}] từ ${oldRole.toUpperCase()} xuống MEMBER?`)) {
        try {
            await editDocument('users', uid, { role: 'member' });
            const target = allUsersCache.find(u => u.id === uid);
            if (target) target.role = 'member';
            renderRoleFilterPills();
            renderUsersTable();
            showCustomModal("THÀNH CÔNG", `Đã hạ quyền ${username} xuống MEMBER!`, "info");
        } catch (err) {
            showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
        }
    }
};

window.toggleBanUser = async (uid, currentStatus) => {
    const action = currentStatus ? "MỞ KHÓA" : "BAN VĨNH VIỄN";
    if (confirm(`Bạn có chắc muốn ${action} người dùng này?`)) {
        await editDocument('users', uid, { isBanned: !currentStatus });
        loadUsers();
    }
};

// 5. QUẢN LÝ BÀI VIẾT (TIN TỨC / HƯỚNG DẪN)
async function loadPosts(collectionName) {
    const container = document.getElementById(`${collectionName}-list`);
    container.innerHTML = '<div class="text-center text-gray-500">Đang tải...</div>';
    
    let items = [];
    if(collectionName === 'news') items = await fetchNews();
    else items = await fetchGuides();

    container.innerHTML = items.map(item => `
        <div class="admin-card p-4 rounded-lg flex justify-between items-center">
            <div>
                <h4 class="font-bold text-lg text-white">${item.title}</h4>
                <p class="text-xs text-gray-500">ID: ${item.id} • ${new Date(item.createdAt?.seconds*1000).toLocaleDateString()}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="window.prepareEdit('${collectionName}', '${item.id}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500">Sửa</button>
                <button onclick="window.deleteItem('${collectionName}', '${item.id}')" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500">Xóa</button>
            </div>
        </div>
    `).join('');
}

// 6. FORM EDITOR
window.openEditor = (collectionName) => {
    // Reset toàn bộ form gọn gàng
    document.getElementById('editor-form').reset();
    document.getElementById('edit-id').value = ''; 
    document.getElementById('edit-collection').value = collectionName;
    document.getElementById('edit-image').value = '';
    document.getElementById('edit-image-file').value = '';
    document.getElementById('edit-image-preview').classList.add('hidden');
    document.getElementById('edit-image-preview').src = '';
    document.getElementById('upload-status').classList.add('hidden'); 
    
    let title = '';
    if (collectionName === 'news') title = 'THÊM TIN TỨC';
    else if (collectionName === 'guides') title = 'THÊM HƯỚNG DẪN';
    else if (collectionName === 'forum_posts') title = 'THÊM BÀI VIẾT DIỄN ĐÀN'; 
    
    document.getElementById('editor-title').innerText = title;
    
    // Ẩn/Hiện ô danh mục (chỉ news cần)
    const catInput = document.getElementById('edit-cat').parentElement;
    if(collectionName === 'news') catInput.classList.remove('hidden');
    else catInput.classList.add('hidden');

    document.getElementById('editor-modal').classList.remove('hidden');
};

window.closeEditor = () => document.getElementById('editor-modal').classList.add('hidden');

window.prepareEdit = async (collectionName, id) => {
    // Tìm bài viết trong list hiện tại (đã load) để đỡ fetch lại
    // Hoặc fetch lại single doc nếu cần. Ở đây ta dùng trick lấy text từ UI hoặc load lại list array toàn cục (để đơn giản ta sẽ không fetch lại mà giả sử loadPosts đã chạy).
    // Tốt nhất là fetch lại list để tìm object.
    
    let items = collectionName === 'news' ? await fetchNews() : await fetchGuides();
    const item = items.find(i => i.id === id);

    if(item) {
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-collection').value = collectionName;
        document.getElementById('edit-title').value = item.title;
        document.getElementById('edit-content').value = item.content;
        document.getElementById('edit-image-file').value = ''; 
        document.getElementById('upload-status').classList.add('hidden');
        document.getElementById('edit-cat').value = item.category || '';

        const imgInput = document.getElementById('edit-image');
        const imgPreview = document.getElementById('edit-image-preview');
        
        imgInput.value = item.imageUrl || ''; // Lấy link ảnh từ database
        if (item.imageUrl) {
            imgPreview.src = item.imageUrl;
            imgPreview.classList.remove('hidden');
        } else {
            imgPreview.classList.add('hidden');
        }
        
        document.getElementById('editor-title').innerText = `SỬA ${collectionName.toUpperCase()}`;
        document.getElementById('editor-modal').classList.remove('hidden');
    }
};

document.getElementById('editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const collectionName = document.getElementById('edit-collection').value;
    const data = {
        title: document.getElementById('edit-title').value,
        content: document.getElementById('edit-content').value,
        category: document.getElementById('edit-cat').value,
        imageUrl: document.getElementById('edit-image').value.trim()
    };

    try {
        if(id) {
            // Sửa
            await editDocument(collectionName, id, data);
            showCustomModal("THÀNH CÔNG", "Đã cập nhật bài viết!", "info");
        } else {
            // Thêm mới
            await createPost(collectionName, data);
            showCustomModal("THÀNH CÔNG", "Đã thêm bài viết mới!", "info");
        }
        closeEditor();
        loadPosts(collectionName); // Refresh list
    } catch(err) {
        showCustomModal("LỖI", getFirebaseErrorMessage(err), "danger");
    }
});

window.deleteItem = async (col, id) => {
    if(confirm("Xóa vĩnh viễn bài viết này?")) {
        await deleteDocument(col, id);
        loadPosts(col);
    }
};

// 7. DUYỆT BÀI DIỄN ĐÀN
async function loadPendingForum() {
    const list = document.getElementById('forum-pending-list');
    list.innerHTML = '<div class="text-gray-500">Đang tải bài chờ duyệt...</div>';
    
    const posts = await fetchForumPosts('pending');
    
    if(posts.length === 0) {
        list.innerHTML = '<div class="p-8 text-center bg-white/5 rounded-xl flex items-center justify-center gap-2"><svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg> Không có bài viết nào chờ duyệt!</div>';
        return;
    }

    list.innerHTML = posts.map(p => `
        <div class="admin-card p-6 rounded-xl border-l-4 border-yellow-500">
            <h4 class="font-bold text-xl text-yellow-400 mb-2">${p.title}</h4>
            <div class="bg-black/30 p-3 rounded mb-3 text-sm text-gray-300 whitespace-pre-line">${p.content}</div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Tác giả: ${p.author} • ${new Date(p.createdAt?.seconds*1000).toLocaleString()}</span>
                <div class="flex gap-3">
                    <button onclick="window.approveForumPost('${p.id}')" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-sm inline-flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg> DUYỆT</button>
                    <button onclick="window.deleteItem('forum_posts', '${p.id}')" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-sm inline-flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> XÓA</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 8. HỆ THỐNG XỬ PHẠT (LITEBANS API)
// ==========================================

// Biến lưu trạng thái tab đang chọn
window.currentPunishType = 'bans'; 

// URL dẫn tới file API PHP của bạn (Sửa lại nếu file api-band.php nằm ở thư mục khác/domain khác)
const LITEBANS_API_URL = 'https://ban.menmaume.id.vn/inc/api-band.php';

window.loadPunishments = async (type) => {
    window.currentPunishType = type;
    const cacheKey = `punish_data_${type}`;
    const list = document.getElementById('punishments-list');

    // 1. HIỂN THỊ DỮ LIỆU CŨ TỪ CACHE (Nếu có) để người dùng không phải chờ
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        renderPunishments(JSON.parse(cachedData), type);
    } else {
        list.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-cyan-400">⏳ Đang tải lần đầu...</td></tr>';
    }

    // 2. GỌI API NGẦM ĐỂ CẬP NHẬT
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Tự hủy nếu API treo > 8s

        const response = await fetch(`${LITEBANS_API_URL}?type=${type}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const result = await response.json();

        if (result.status === 'success') {
            // Lưu dữ liệu mới vào cache
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
            // Render lại với dữ liệu mới nhất
            renderPunishments(result.data, type);
        }
    } catch (error) {
        console.error("API Error (dùng data cũ):", error);
        // Nếu API lỗi, vẫn giữ nguyên data cũ từ cache, không làm gì cả
    }
};

// Hàm render tách riêng để dùng lại cho cả Cache và API mới
function renderPunishments(data, type) {
    const list = document.getElementById('punishments-list');
    if (!data || data.length === 0) {
        list.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Không có dữ liệu.</td></tr>`;
        return;
    }
    
    list.innerHTML = data.map(p => {
        // ... (Giữ nguyên logic render <tr> như cũ của bạn) ...
        // Tôi lược bỏ để bạn dễ copy, bạn giữ nguyên code render cũ nhé!
    }).join('');
}

window.approveForumPost = async (id) => {
    if(confirm("Duyệt bài viết này lên trang chủ?")) {
        await editDocument('forum_posts', id, { status: 'approved' });
        loadPendingForum(); // Refresh list
        loadDashboard(); // Refresh badge
    }
};