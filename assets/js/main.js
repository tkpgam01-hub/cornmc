// ==========================================
// CORNSURVIVAL - CỤM SINH TỒN RIÊNG BIỆT
// Chỉ chứa các chức năng riêng của cụm Survival:
// Thống kê trực tiếp, Bảng Xếp Hạng, Hướng Dẫn & Luật Lệ, Giao diện cụm
// (Các luồng chung như Đăng nhập, Hồ sơ, Quà tặng, Tin tức, Diễn đàn, Đội ngũ đã chuyển ra CornHub)
// ==========================================
import { showCustomModal } from './core.js';

window.showCustomModal = showCustomModal;

// ==========================================
// 1. TIỆN ÍCH CỤM SURVIVAL
// ==========================================
window.copyServerIP = () => {
    navigator.clipboard.writeText("cornmc.vn").then(() => {
        showCustomModal("SERVER IP", "Đã copy IP thành công:\ncornmc.vn\nPC: mc.cornmc.vn\nPE: pe.cornmc.vn port 19132", "info");
    });
};

window.openDiscord = () => {
    window.open("https://dsc.gg/cornmc", "_blank");
};

// Tự động trỏ link CornHub đúng khi chạy trên subdomain survival.cornmc.vn
function resolveHubLinks() {
    const isSubdomain = window.location.hostname === 'survival.cornmc.vn';
    const hubUrl = isSubdomain ? 'https://cornmc.vn/' : '/';
    document.querySelectorAll('[data-hub-link]').forEach(a => {
        a.setAttribute('href', hubUrl);
    });
}

// ==========================================
// 2. RENDER PLAYER GUIDES (LỆNH & LUẬT SURVIVAL)
// ==========================================
async function renderGuides() {
    const container = document.getElementById('guide-container');
    if (!container) return;

    const commandsData = [
        {
            title: "🌍 Di Chuyển & Dịch Chuyển",
            commands: [
                { cmd: "/spawn", desc: "Dịch chuyển về điểm spawn", color: "yellow" },
                { cmd: "/home <tên>", desc: "Dịch chuyển về nhà", color: "yellow" },
                { cmd: "/sethome <tên>", desc: "Đặt vị trí nhà", color: "yellow" },
                { cmd: "/delhome <tên>", desc: "Xóa nhà", color: "red" },
                { cmd: "/warp <tên>", desc: "Dịch chuyển đến warp", color: "yellow" },
                { cmd: "/rtp", desc: "Dịch chuyển ngẫu nhiên", color: "yellow" },
                { cmd: "/back", desc: "Quay về chỗ chết hoặc vị trí cũ", color: "yellow" }
            ]
        },
        {
            title: "👥 Tương Tác Người Chơi",
            commands: [
                { cmd: "/tpa <tên>", desc: "Gửi yêu cầu dịch chuyển", color: "green" },
                { cmd: "/tpaccept", desc: "Chấp nhận yêu cầu", color: "green" },
                { cmd: "/tpdeny", desc: "Từ chối yêu cầu", color: "red" },
                { cmd: "/msg, /w, /tell <tên>", desc: "Nhắn tin riêng", color: "blue" },
                { cmd: "/pay <tên> <tiền>", desc: "Chuyển tiền cho người khác", color: "purple" }
            ]
        },
        {
            title: "💰 Kinh Tế & Mua Bán",
            videoLink: "https://www.tiktok.com/@menng1337/video/7654218713142480135?is_from_webapp=1&sender_device=pc",
            commands: [
                { cmd: "/balance, /bal", desc: "Xem số tiền bạn có", color: "yellow" },
                { cmd: "/ah", desc: "Mở chợ đấu giá cộng đồng", color: "orange" },
                { cmd: "/ah sell <giá>", desc: "Bán vật phẩm đang cầm", color: "orange" },
                { cmd: "/shop", desc: "Mở cửa hàng hệ thống", color: "blue" },
                { cmd: "/sellgui", desc: "Mở Menu bán đồ nhanh", color: "blue" },
                { cmd: "/sellall <tên>", desc: "Bán tất cả 1 loại đồ", color: "blue" },
                { cmd: "/rank", desc: "Xem menu mua Rank", color: "cyan" }
            ]
        },
        {
            title: "🛡️ Bảo Vệ Đất (Claim)",
            videoLink: "https://www.tiktok.com/@menng1337/video/7664576569746230549?is_from_webapp=1&sender_device=pc",
            commands: [
                { cmd: "/claim", desc: "Tạo vùng bảo vệ (Cần Golden Shovel)", color: "yellow" },
                { cmd: "/claimshop", desc: "Mua thêm Claimblocks", color: "yellow" },
                { cmd: "/unclaim", desc: "Bỏ vùng đất đang đứng", color: "red" },
                { cmd: "/trust <tên>", desc: "Cho phép người khác xây dựng", color: "green" },
                { cmd: "/untrust <tên>", desc: "Thu hồi quyền xây dựng", color: "red" },
                { cmd: "/trustlist", desc: "Xem danh sách người có quyền", color: "cyan" },
                { cmd: "/claimslist", desc: "Xem các vùng bạn đang sở hữu", color: "cyan" }
            ]
        },
        {
            title: "⚙️ Tiện Ích & Biểu Cảm",
            colSpan: true,
            commands: [
                { cmd: "/pv <số>", desc: "Mở kho chứa đồ ảo", color: "purple" },
                { cmd: "/repair", desc: "Sửa vật phẩm đang cầm", color: "purple" },
                { cmd: "/diemdanh", desc: "Nhận thưởng điểm danh hằng ngày", color: "purple" },
                { cmd: "[i]", desc: "Gõ trong chat để show đồ đang cầm", color: "white" },
                { cmd: "[inv]", desc: "Hiển thị toàn bộ kho đồ lên chat", color: "white" },
                { cmd: "/sit", desc: "Ngồi xuống tại chỗ", color: "pink" },
                { cmd: "/lay", desc: "Nằm xuống mặt đất", color: "pink" },
                { cmd: "/crawl", desc: "Bò trườn", color: "pink" },
                { cmd: "/spin", desc: "Xoay vòng vòng", color: "pink" }
            ]
        },
        {
            title: "💼 Hệ Thống Nghề Nghiệp (Jobs)",
            videoLink: "https://www.tiktok.com/@menng1337/video/7644891622445960466?is_from_webapp=1&sender_device=pc",
            commands: [
                { cmd: "/jobs join <Tên>", desc: "Tham gia nghề (VD: /jobs join Miner)", color: "green" },
                { cmd: "/jobs leave <Tên>", desc: "Rời khỏi nghề hiện tại", color: "red" },
                { cmd: "/jobs browse", desc: "Xem danh sách và lương từng nghề", color: "cyan" },
                { cmd: "/jobs stats", desc: "Xem cấp độ nghề của bản thân", color: "yellow" }
            ],
            showJobsList: true
        },
        {
            title: "📊 Hệ Thống Thông Tin & Chat",
            commands: [
                { cmd: "/bangthongtin", desc: "Bật/Tắt bảng thông tin bên phải màn hình", color: "cyan" },
                { cmd: "/chatgame toggle", desc: "Ẩn hoặc hiện các thông báo Minigame", color: "green" },
                { cmd: "/chattoggle", desc: "Tắt hoàn toàn chat từ người chơi khác", color: "red" }
            ]
        }
    ];

    const jobsCategories = [
        {
            title: "⚗️ Nhóm Chế Tạo & Phép Thuật",
            color: "purple",
            jobs: [
                { en: "Alchemist", vi: "Nhà Giả Kim" },
                { en: "Enchanter", vi: "Người Phù Phép" },
                { en: "Crafter", vi: "Thợ Chế Tạo" },
                { en: "Smelter", vi: "Thợ Luyện Kim" }
            ]
        },
        {
            title: "⚒️ Nhóm Xây Dựng & Khai Thác",
            color: "cyan",
            jobs: [
                { en: "Builder", vi: "Thợ Xây Dựng" },
                { en: "Blacksmith", vi: "Thợ Rèn" },
                { en: "Miner", vi: "Thợ Mỏ" },
                { en: "Demolitionist", vi: "Chuyên Gia Phá Dỡ" },
                { en: "Lumberjack", vi: "Tiều Phu" }
            ]
        },
        {
            title: "🌾 Nhóm Nông Nghiệp & Chăn Nuôi",
            color: "green",
            jobs: [
                { en: "Farmer", vi: "Nông Dân" },
                { en: "Breeder", vi: "Người Chăn Nuôi" },
                { en: "Shepherd", vi: "Người Chăn Cừu" }
            ]
        },
        {
            title: "🏹 Nhóm Sinh Tồn & Khám Phá",
            color: "red",
            jobs: [
                { en: "Hunter", vi: "Thợ Săn" },
                { en: "Fisherman", vi: "Ngư Dân" },
                { en: "Explorer", vi: "Nhà Thám Hiểm" },
                { en: "Tamer", vi: "Người Thuần Hóa" }
            ]
        },
        {
            title: "🎨 Nhóm Thủ Công & Khác",
            color: "orange",
            jobs: [
                { en: "Dyer", vi: "Thợ Nhuộm" },
                { en: "Brusher", vi: "Người Cọ Rửa" },
                { en: "Griller", vi: "Người Nướng" },
                { en: "Gourmet", vi: "Người Sành Ăn" },
                { en: "Trader", vi: "Thương Nhân" }
            ]
        }
    ];

    const rulesData = [
        {
            title: "🚫 1. Hack/Cheat & Lợi Dụng Lỗi",
            rules: [
                "Được dùng Autoclick cơ bản (spam đánh theo delay) & Freecam (chỉ để xây dựng/quan sát). Cấm dùng macro ngoài game (AutoHotKey, Razer...) để lách luật.",
                "Cấm tuyệt đối mọi loại Hack/Cheat, X-ray, KillAura, Aimbot, Ghost Client hoặc mod ẩn (stealth mode).",
                "Cấm dùng Litematica khi chưa báo Admin. Cấm mọi hành vi dupe item/block.",
                "Cấm trục lợi từ bug game/plugin. Phát hiện lỗi phải báo BQT ngay, giấu giếm sẽ bị Ban vĩnh viễn."
            ]
        },
        {
            title: "⚔️ 2. Gameplay & PvP",
            rules: [
                "PvP ngoài safezone chỉ hợp lệ khi 2 bên tự nguyện. Không kill người trong safezone, spawn.",
                "Cấm phá hoại (Griefing) công trình người khác bằng lava, nước, TNT, hoặc spam entity/hopper gây lag.",
                "Cấm ăn cắp đồ, cấm lợi dụng quyền trust/nhờ mượn đồ để chiếm đoạt (Xử lý theo log).",
                "Cấm trap/bait người chơi để giết lấy đồ (bao gồm AFK trap).",
                "Cấm dùng nhiều tài khoản (clone/alt) để lấy kit, vote, event."
            ]
        },
        {
            title: "🏡 3. Xây Dựng Farm & Base",
            rules: [
                "Xây dựng tự do, nhưng CẤM xây lag machine, redstone clock làm giảm TPS server.",
                "Nếu farm gây lag (Staff đo bằng TPS/Spark), phải tắt ngay khi được nhắc nhở. Cố tình tái phạm sẽ bị xóa farm không báo trước.",
                "Cấm xây công trình phản cảm, 18+, phân biệt chủng tộc hoặc liên quan đến chính trị.",
                "Server không đảm bảo đền bù/restore mọi trường hợp; chỉ xem xét khi có log rõ ràng."
            ]
        },
        {
            title: "🛡️ 4. Hành Xử Với BQT (Staff/Admin)",
            rules: [
                "Tôn trọng người chơi và BQT. Không xúc phạm, cãi vã hay gây rối.",
                "Không năn nỉ xin quyền OP, Fly, Creative, xin items hoặc hối lộ BQT.",
                "Cấm chụp/cắt ghép log, ảnh giả để bôi nhọ Staff.",
                "Nghi ngờ Staff lạm quyền? Hãy khiếu nại lên Owner kèm bằng chứng (ảnh, log, video)."
            ]
        },
        {
            title: "💸 5. Giao Dịch & Mua Bán",
            rules: [
                "Chỉ giao dịch bằng tiền tệ/vật phẩm IN-GAME. Cấm giao dịch bằng tiền thật (VNĐ/Tiền ảo). Vi phạm Ban vĩnh viễn.",
                "Cấm giao dịch liên server, qua trung gian ngoài hệ thống, hoặc lập chợ đen.",
                "Cấm trade giftcode/thẻ cào giữa người chơi."
            ]
        },
        {
            title: "🔐 6. Quyền Riêng Tư & Bảo Mật",
            rules: [
                "Không chia sẻ tài khoản. Tự chịu trách nhiệm nếu người dùng chung acc vi phạm luật.",
                "Bị hack hoặc quên mật khẩu: Báo ngay cho Admin kèm thông tin chứng minh để khôi phục.",
                "Cấm chia sẻ/đe dọa công khai thông tin cá nhân của người khác (Doxxing).",
                "Cấm phát tán hình ảnh, tin nhắn riêng tư khi chưa được cho phép."
            ]
        },
        {
            title: "💬 7. Kênh Chat & Discord",
            rules: [
                "Không spam tin nhắn, spam lệnh, tag BQT vô cớ. Mở Ticket xong phải đóng.",
                "Không chửi bới, phân biệt vùng miền, tôn giáo, chính trị, gửi nội dung 18+.",
                "Cấm nhắc tên/IP server khác. Cấm gửi link ngoài, link rút gọn, file chứa mã độc.",
                "Cấm lách filter chat (VD: h@ck). Cấm spam đổi tên, spam emoji, spam join/leave voice.",
                "Phải vào Discord/Box để cập nhật thông báo. Không giải quyết nếu bạn bỏ lỡ thông báo server."
            ]
        },
        {
            title: "🎭 8. Mạo Danh & Quảng Cáo",
            rules: [
                "Cấm giả mạo BQT hoặc người chơi khác để lừa đảo.",
                "Cấm quảng cáo server ngoài, hack/cheat hoặc dịch vụ cày thuê.",
                "Cấm lôi kéo người chơi sang group khác hoặc DM nhắn tin rác qua Discord."
            ]
        },
        {
            title: "🏆 9. Event & Đua Top",
            rules: [
                "Mỗi người CHỈ dùng 1 tài khoản chính tham gia event.",
                "Cấm dùng acc clone để buff, giữ đồ, farm phụ, chuyển tài nguyên... tính là vi phạm.",
                "Cấm lợi dụng bug/hack hoặc thuê người cày top. Vi phạm tước quyền và phạt nặng."
            ]
        },
        {
            title: "⚖️ 10. Hệ Thống Hình Phạt",
            rules: [
                "Mức độ: Cảnh cáo/Mute/Jail ➔ Ban 1/3/7/45 ngày ➔ Ban Vĩnh Viễn.",
                "Phạt song song (MC & Discord). Lách luật bằng alt bị phạt Gấp Đôi.",
                "Lần đầu: Ban Acc (Được tạo acc mới chơi lại nhưng cấm nhận quà tân thủ/event).",
                "Tạo acc mới để tiếp tục phá/hack: BAN IP VÀ HARDWARE toàn bộ tài khoản.",
                "Staff có quyền xử lý các hành vi phá hoại chưa có trong luật. Chơi là mặc định đồng ý luật, không chấp nhận lý do 'Chưa đọc luật'!"
            ]
        }
    ];

    const colorMap = {
        yellow: "text-yellow-400 border-yellow-500/30",
        red: "text-red-400 border-red-500/30",
        green: "text-green-400 border-green-500/30",
        blue: "text-blue-400 border-blue-500/30",
        purple: "text-purple-400 border-purple-500/30",
        orange: "text-orange-400 border-orange-500/30",
        cyan: "text-cyan-400 border-cyan-500/30",
        pink: "text-pink-400 border-pink-500/30",
        white: "text-white border-gray-500/30"
    };

    const commandsHtml = `
        <div class="space-y-4">
            <h3 class="text-3xl font-black title-font text-cyan-400 mb-6 border-b border-cyan-500/30 pb-3">📚 LỆNH CƠ BẢN</h3>
            ${commandsData.map(group => `
                <div class="glass-panel rounded-2xl border border-purple-500/30 overflow-hidden mb-3">
                    <div class="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition group"
                        onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.toggle-icon').classList.toggle('rotate-180');">
                        <div class="flex items-center gap-3">
                            <h4 class="font-bold text-white title-font group-hover:text-cyan-300 transition-colors">${group.title}</h4>
                            ${group.videoLink ? `<a href="${group.videoLink}" target="_blank" onclick="event.stopPropagation()" class="text-[10px] sm:text-xs bg-[#ff0050]/20 text-white hover:bg-[#ff0050]/40 px-2 py-1 rounded-full border border-[#ff0050]/30 transition-all font-bold flex items-center gap-1 hover:scale-105"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg> Hướng Dẫn</a>` : ''}
                        </div>
                        <span class="toggle-icon text-cyan-400 font-bold transition-transform duration-300 text-xs">▼</span>
                    </div>
                    <div class="hidden p-4 border-t border-white/5 bg-black/40 space-y-4">
                        <div class="space-y-2">
                            ${group.commands.map(cmd => `
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-1">
                                    <code class="${colorMap[cmd.color] || 'text-white'} bg-black/50 px-2 py-0.5 rounded font-mono text-xs border border-white/5">${cmd.cmd}</code>
                                    <span class="text-gray-400 text-[11px]">${cmd.desc}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${group.showJobsList ? `
                            <div class="mt-4 pt-4 border-t border-white/10">
                                <p class="text-[10px] text-orange-300 mb-3 italic">Bảng tra cứu tên nghề (Sử dụng cho lệnh /jobs join):</p>
                                <div class="grid grid-cols-1 gap-4">
                                    ${jobsCategories.map(cat => `
                                        <div class="bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div class="text-[11px] font-bold text-cyan-400 mb-2 uppercase tracking-wider">${cat.title}</div>
                                            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                                ${cat.jobs.map(j => `
                                                    <div class="flex items-center justify-between text-[10px]">
                                                        <span class="text-white font-mono font-bold">${j.en}</span>
                                                        <span class="text-gray-500">→ ${j.vi}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const rulesHtml = `
        <div class="space-y-4 mt-12 lg:mt-0">
            <h3 class="text-3xl font-black title-font text-red-400 mb-6 flex items-center gap-3 border-b border-red-500/30 pb-3">
                <span class="text-4xl">⚖️</span> LUẬT MÁY CHỦ
            </h3>
            ${rulesData.map(group => `
                <div class="glass-panel rounded-2xl border border-red-500/30 overflow-hidden shadow-[0_0_15px_rgba(248,113,113,0.1)]">
                    <div class="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition select-none group"
                         onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.toggle-icon').classList.toggle('rotate-180');">
                        <h4 class="text-xl font-bold text-red-100 title-font group-hover:text-red-300 transition-colors">${group.title}</h4>
                        <span class="toggle-icon text-red-400 font-bold transition-transform duration-300">▼</span>
                    </div>
                    <div class="hidden p-5 border-t border-red-500/10 bg-red-950/20 space-y-3">
                        ${group.rules.map(rule => `
                            <div class="flex items-start gap-3">
                                <span class="text-red-500 mt-0.5 text-lg">▪</span>
                                <span class="text-gray-200 text-sm leading-relaxed">${rule}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            ${commandsHtml}
            ${rulesHtml}
        </div>
    `;
    container.className = "";
}

// ==========================================
// 3. BẢNG XẾP HẠNG SURVIVAL
// ==========================================
async function renderRanking() {
    const container = document.getElementById('ranking-container');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-12"><div class="loader-ring w-12 h-12 mx-auto mb-4"></div><p class="text-cyan-400 font-bold neon-text animate-pulse">Đang tải dữ liệu từ máy chủ...</p></div>';

    const CURRENT_ID = "zhkb4z0xBQ9EJ41t";
    const BASE_ID = "7RJjR4Vf2xm9W1KP";

    try {
        const [resCurrent, resBase] = await Promise.all([
            fetch(`https://bytebin.ajg0702.us/${CURRENT_ID}`),
            fetch(`https://bytebin.ajg0702.us/${BASE_ID}`)
        ]);

        const dataCurrent = await resCurrent.json();
        const data = await resBase.json();

        const moneyBoard = (data["vault_eco_balance"] || []).sort((a, b) => (b.value || 0) - (a.value || 0));
        const currentOnlineRaw = dataCurrent["statistic_time_played"] || [];
        const baseOnlineRaw = data["statistic_time_played"] || [];

        const onlineBoard = currentOnlineRaw.map(player => {
            const basePlayer = baseOnlineRaw.find(b => b.namecache === player.namecache);
            const baseTime = basePlayer ? parseFloat(basePlayer.value || 0) : 0;
            return { ...player, value: Math.abs(baseTime) };
        }).sort((a, b) => b.value - a.value);

        const pointBoard = (data["playerpoints_points"] || []).sort((a, b) => (b.value || 0) - (a.value || 0));
        const killBoard = (data["statistic_player_kills"] || []).sort((a, b) => (b.value || 0) - (a.value || 0));

        const donateData = [
            { namecache: "Glenn1", value: 2700000 },
            { namecache: "PE_Dellcotenok", value: 2225000 },
            { namecache: "PE_PopOcean46064", value: 900000 },
            { namecache: "Timmythanh007", value: 860000 + 500000 },
            { namecache: "luan198348", value: 820000 + 800000 + 100000 },
            { namecache: "Ghast", value: 500000 + 2000000 },
            { namecache: "ShaMein", value: 450000 },
            { namecache: "NgiPam_06", value: 431000 },
            { namecache: "Trungvippro", value: 420000 },
            { namecache: "LaShan", value: 200000 },
            { namecache: "PE_Mine8889672", value: 200000 },
            { namecache: "CharlesTwoK", value: 170000 },
            { namecache: "Sunnn06", value: 150000 + 50000 + 180000 + 330000 + 100000 + 725000 + 200000 + 50000 + 100000 + 230000 + 200000 },
            { namecache: "111s", value: 100000 },
            { namecache: "Haiyen01", value: 100000 + 500000 },
            { namecache: "68_Hazy", value: 100000 },
            { namecache: "Hazon1409", value: 85000 },
            { namecache: "Yuna_Gaming", value: 70000 },
            { namecache: "ScuHq", value: 50000 },
            { namecache: "PE_Huyvippto6584", value: 50000 },
            { namecache: "Kazuto207", value: 49000 },
            { namecache: "Setroit", value: 30000 },
            { namecache: "LuvHuna", value: 30000 + 20000 },
            { namecache: "lehiepmc", value: 20000 },
            { namecache: "sangvu", value: 15000 },
            { namecache: "linhcute2006", value: 1168000 + 1050000 + 25000 + 2100000 + 1000000 },
            { namecache: "DraWind000", value: 250000 + 300000 + 900000 },
            { namecache: "huy_holow", value: 230000 + 50000 + 50000 + 30000 + 10000 + 300000 },
            { namecache: "ConCuToBu", value: 500000 },
            { namecache: "imtrhie", value: 115000 + 36000 },
            { namecache: "SenPai_Cuong", value: 420000 },
            { namecache: "saoky", value: 20000 },
            { namecache: "BkunZ", value: 10000 },
            { namecache: "Synxbao", value: 100000 },
            { namecache: "Kezuu", value: 100000 },
            { namecache: "NguoiTai0Dinh", value: 60000 },
            { namecache: "GiaHani", value: 70000 },
            { namecache: "zr0m", value: 200000 },
            { namecache: "KING_NTV", value: 4000000 + 2500000 },
            { namecache: "Rickynguyen", value: 450000 },
            { namecache: "tetinhxuan", value: 500000 },
            { namecache: "nhan", value: 350000 },
            { namecache: "Linhyumy24", value: 200000 + 50000 + 100000 + 60000 },
            { namecache: "bill199204", value: 100000 + 50000 },
            { namecache: "toan909", value: 100000 },
            { namecache: "imnotlgb", value: 70000 },
            { namecache: "swipey166", value: 50000 },
            { namecache: "Hiro2003", value: 20000 },
            { namecache: "ChanhOI", value: 2000000 + 650000 + 165000 + 50000 + 625000 + 595000 },
            { namecache: "WolfMC", value: 40000 },
            { namecache: "Chooty_427", value: 450000 + 150000 },
            { namecache: "LSArt203", value: 170000 + 20000 + 20000 },
            { namecache: "BomYeuEm", value: 20000 + 20000 },
            { namecache: "PE_Hhnoo1", value: 200000 },
            { namecache: "Zevss_Gamer", value: 300000 },
            { namecache: "zeen1207", value: 20000 },
            { namecache: "RUKY_MC", value: 20000 },
            { namecache: "huynhtri", value: 10000 },
            { namecache: "Sanganhzaki", value: 10000 + 10000 },
            { namecache: "Demon0ra", value: 60000 + 10000 },
            { namecache: "jonnyzip", value: 20000 },
            { namecache: "LuciCuc", value: 50000 },
            { namecache: "Minhvuongz", value: 20000 },
            { namecache: "NiruMi_XL", value: 25000 },
            { namecache: "samsungdang", value: 100000 + 480000 + 500000 },
            { namecache: "MinzKhee", value: 200000 + 70000 },
            { namecache: "PE_Linh_chan3931", value: 240000 },
            { namecache: "VanhDuck08 ", value: 55000 + 95000 + 10000 + 500000 + 50000 + 200000 + 100000 },
            { namecache: "K_PurpleReaper ", value: 100000 },
            { namecache: "SeanGeekPlayz ", value: 200000 + 350000 },
            { namecache: "Lynhnek ", value: 300000 + 10000 },
            { namecache: "KarotTW ", value: 20000 },
            { namecache: "ZyraGen145 ", value: 200000 },
            { namecache: "PETERMANE ", value: 20000 },
            { namecache: "Duckman66", value: 60000 + 90000 + 100000 + 30000 },
            { namecache: "Derlackvn", value: 20000 },
            { namecache: "BachVjpPro1202", value: 50000 },
            { namecache: "_Xiaomir", value: 80000 },
            { namecache: "Zuri_Nguyen", value: 10000 },
            { namecache: "MintChoco_25", value: 10000 },
            { namecache: "IIts_HieuGa", value: 5080000 + 500000 },
            { namecache: "pongb", value: 50000 },
            { namecache: "PE_keniaia", value: 650000 },
            { namecache: "lam1308", value: 50000 },
            { namecache: "AnhKiet", value: 50000 },
            { namecache: "Pugcuti0510", value: 550000 },
            { namecache: "PawzSeeTinh_10", value: 465000 },
            { namecache: "Bon_MC", value: 50000 },
            { namecache: "hyujeunesse", value: 600000 },
            { namecache: "Bexune", value: 90000 },
            { namecache: "_Xiaomir", value: 130000 },
            { namecache: "RykerKervin", value: 50000 },
            { namecache: "NabatiXOreo", value: 530000 },
            { namecache: "SEGAYMANHBAO", value: 500000 },
            { namecache: "xun", value: 1550000 + 2000000 + 1200000 + 750000 },
            { namecache: "NgocHieu0512", value: 640000 },
            { namecache: "HenrryMC", value: 300000 },
            { namecache: "TuanHai", value: 300000 },
            { namecache: "TP_Magus", value: 280000 },
            { namecache: "TheBaoBedwar", value: 200000 },
            { namecache: "katzew", value: 160000 },
            { namecache: "Nghichtulongan", value: 90000 },
            { namecache: "MatToChep", value: 70000 },
            { namecache: "Nothing2204", value: 70000 },
            { namecache: "Moonless", value: 60000 },
            { namecache: "kizocata", value: 30000 },
            { namecache: "NoragamiBuonNgu", value: 30000 },
            { namecache: "vudat11", value: 30000 },
            { namecache: "vanh", value: 20000 },
            { namecache: "BachDGame", value: 10000 }
        ];

        const donateBoard = donateData.sort((a, b) => b.value - a.value);

        let html = `
        <div class="flex overflow-x-auto custom-scrollbar justify-start md:justify-center gap-3 mb-8 pb-2 w-full [&>button]:shrink-0 [&>button]:whitespace-nowrap">
            <button onclick="window.switchRankTab('money')" id="tab-btn-money" class="px-5 py-2.5 rounded-xl font-bold text-sm transition bg-white/5 text-gray-400 border border-gray-700 hover:bg-white/10">ĐẠI GIA</button>
            <button onclick="window.switchRankTab('donate')" id="tab-btn-donate" class="px-5 py-2.5 rounded-xl font-bold text-sm transition bg-white/5 text-gray-400 border border-gray-700 hover:bg-white/10">TOP TỔNG</button>
            <button onclick="window.switchRankTab('online')" id="tab-btn-online" class="px-5 py-2.5 rounded-xl font-bold text-sm transition bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">CHĂM CHỈ</button>
            <button onclick="window.switchRankTab('kill')" id="tab-btn-kill" class="px-5 py-2.5 rounded-xl font-bold text-sm transition bg-white/5 text-gray-400 border border-gray-700 hover:bg-white/10">SÁT THỦ</button>
        </div>
        <div class="relative w-full max-w-2xl mx-auto">`;

        const renderBoard = (tabId, title, boardData, prefix, suffix, colorClass, borderGlow, isHidden, limit = 10, formatType = 'none') => {
            let boardHtml = `<div id="board-${tabId}" class="rank-board ${isHidden ? 'hidden' : ''} glass-intense p-4 sm:p-6 rounded-2xl border ${borderGlow} shadow-[0_0_30px_rgba(0,0,0,0.2)] relative overflow-hidden group transition-all duration-300">`;
            boardHtml += `<div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>`;
            boardHtml += `<h3 class="text-2xl font-black title-font text-center mb-6 ${colorClass} drop-shadow-md relative z-10">${title}</h3>`;
            boardHtml += `<div class="space-y-3 relative z-10">`;

            if (boardData.length === 0) {
                boardHtml += `<div class="text-center py-8 text-gray-500 italic text-sm">Chưa có dữ liệu</div>`;
            } else {
                const topList = boardData.slice(0, limit);
                topList.forEach((player, index) => {
                    const numVal = parseFloat(player.value || 0);
                    let val = "";
                    let displaySuffix = suffix;

                    if (formatType === 'time') {
                        const totalSeconds = Math.floor(numVal);
                        const w = Math.floor(totalSeconds / 604800);
                        const d = Math.floor((totalSeconds % 604800) / 86400);
                        const h = Math.floor((totalSeconds % 86400) / 3600);
                        const timeParts = [];
                        if (w > 0) timeParts.push(w + 'w');
                        if (d > 0) timeParts.push(d + 'd');
                        if (h > 0) timeParts.push(h + 'h');
                        if (timeParts.length === 0) {
                            const m = Math.floor(totalSeconds / 60);
                            val = m > 0 ? m + 'm' : totalSeconds + 's';
                        } else {
                            val = timeParts.slice(0, 2).join(' ');
                        }
                        displaySuffix = "";
                    } else if (formatType === 'short') {
                        if (numVal >= 1000000000) val = (numVal / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
                        else if (numVal >= 1000000) val = (numVal / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                        else if (numVal >= 1000) val = (numVal / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        else val = numVal.toLocaleString('vi-VN');
                    } else {
                        val = numVal.toLocaleString('vi-VN');
                    }

                    const playerName = player.namecache || "Ẩn danh";
                    let medal = `#${index + 1}`;
                    let medalClass = "text-gray-400 text-base font-bold";
                    let rowBorder = "border-white/10";

                    if (index === 0) { medal = '🥇'; medalClass = "text-3xl drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"; rowBorder = "border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-transparent"; }
                    else if (index === 1) { medal = '🥈'; medalClass = "text-2xl drop-shadow-[0_0_8px_rgba(148,163,184,0.8)]"; rowBorder = "border-gray-300/50 bg-gradient-to-r from-gray-400/20 to-transparent"; }
                    else if (index === 2) { medal = '🥉'; medalClass = "text-2xl drop-shadow-[0_0_8px_rgba(180,83,9,0.8)]"; rowBorder = "border-orange-400/50 bg-gradient-to-r from-orange-600/20 to-transparent"; }

                    boardHtml += `
                    <div class="glass-panel p-3 rounded-xl flex items-center justify-between border-l-4 ${rowBorder} hover:bg-white/10 hover:scale-[1.02] transition-all cursor-default">
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div class="w-10 text-center ${medalClass} title-font">${medal}</div>
                            <div class="relative">
                                <img src="https://mc-heads.net/avatar/${playerName}" class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-white/20 bg-gray-900 object-cover shadow-md">
                                ${index === 0 ? '<div class="absolute -top-3 -right-2 text-lg">👑</div>' : ''}
                            </div>
                            <span class="font-bold text-white text-base sm:text-xl tracking-wide">${playerName}</span>
                        </div>
                        <div class="text-right">
                            <span class="${colorClass} font-black text-lg sm:text-2xl drop-shadow-sm">${prefix}${val}${displaySuffix}</span>
                        </div>
                    </div>`;
                });
            }
            boardHtml += `</div></div>`;
            return boardHtml;
        };

        html += renderBoard("donate", "BẢNG VÀNG DONATE TỔNG", donateBoard, "", " VNĐ", "text-pink-400", "border-pink-500/20", true, 9999, 'short');
        html += renderBoard("money", "TOP ĐẠI GIA", moneyBoard, "$", "", "text-green-400", "border-green-500/20", true, 20, 'short');
        html += renderBoard("online", "TOP CHĂM CHỈ", onlineBoard, "", "", "text-cyan-400", "border-cyan-500/20", false, 20, 'time');
        html += renderBoard("point", "TOP ĐẠI GIA XU", pointBoard, "", " Xu", "text-yellow-400", "border-yellow-500/20", true, 20, 'short');
        html += renderBoard("kill", "TOP SÁT THỦ", killBoard, "", " Kill", "text-red-400", "border-red-500/20", true, 20, 'short');
        html += '</div>';

        container.classList.remove('max-w-7xl');
        container.classList.add('max-w-4xl');
        container.innerHTML = html;
    } catch (error) {
        console.error("Lỗi tải Ranking:", error);
        container.innerHTML = '<div class="text-red-500 text-center glass-panel p-6 border border-red-500/30 rounded-xl">Lỗi kết nối đến dữ liệu máy chủ. Vui lòng thử lại sau!</div>';
    }
}

window.switchRankTab = (tabName) => {
    document.querySelectorAll('.rank-board').forEach(el => el.classList.add('hidden'));
    const activeBoard = document.getElementById(`board-${tabName}`);
    if (activeBoard) activeBoard.classList.remove('hidden');

    ['donate', 'money', 'online', 'point', 'kill'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        if (btn) btn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-white/5 text-gray-400 border border-gray-700 hover:bg-white/10';
    });

    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) {
        if (tabName === 'money') activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-green-600/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]';
        else if (tabName === 'donate') activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-pink-600/20 text-pink-400 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]';
        else if (tabName === 'online') activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
        else if (tabName === 'point') activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
        else if (tabName === 'kill') activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm transition bg-red-600/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(248,113,113,0.3)]';
    }
};

// ==========================================
// 4. TRẠNG THÁI SERVER SURVIVAL
// ==========================================
async function updateServerStatus() {
    const apiUrl = `https://api.mcsrvstat.us/2/103.161.119.18:19931`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const statOnlineEl = document.getElementById('stat-online');
        const navOnlineEl = document.getElementById('nav-online');
        const statVersionEl = document.getElementById('stat-peak');
        const statusDot = document.querySelector('.status-dot');

        if (data.online === true) {
            const currentPlayers = data.players?.online || 0;
            if (statOnlineEl) statOnlineEl.innerText = currentPlayers;
            if (navOnlineEl) navOnlineEl.innerHTML = `<span class="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">${currentPlayers}</span>`;
            if (statusDot) {
                statusDot.style.background = '#4ade80';
                statusDot.style.boxShadow = '0 0 10px #4ade80';
            }
            if (statVersionEl && data.version) {
                const cleanVersion = data.version.match(/\d+\.\d+(\.\d+)?/);
                statVersionEl.innerText = cleanVersion ? cleanVersion[0] : data.version;
            }
        } else {
            if (statOnlineEl) statOnlineEl.innerText = "OFF";
            if (navOnlineEl) navOnlineEl.innerHTML = `<span class="text-red-400">OFFLINE</span>`;
            if (statusDot) {
                statusDot.style.background = '#f87171';
                statusDot.style.boxShadow = '0 0 10px #f87171';
            }
        }
    } catch (error) {
        console.error("Lỗi kết nối API Server:", error);
    }
}

// ==========================================
// 5. PARTICLES & LITE MODE
// ==========================================
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

const savedLiteMode = localStorage.getItem('liteMode');
if (savedLiteMode === null || savedLiteMode === 'on') {
    document.body.classList.add('lite-mode');
    if (savedLiteMode === null) localStorage.setItem('liteMode', 'on');
} else {
    document.body.classList.remove('lite-mode');
}

// ==========================================
// 6. KHỞI ĐỘNG TRANG SURVIVAL
// ==========================================
window.addEventListener('load', () => {
    resolveHubLinks();
    initParticles();
    setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 600);

    document.querySelectorAll('.modal').forEach(m => {
        m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
        m.querySelectorAll('.close-modal').forEach(b => b.onclick = () => m.classList.remove('active'));
    });

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

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-nav');
            if (!target) return;
            e.preventDefault();

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll(`.nav-link[data-nav="${target}"]`).forEach(l => l.classList.add('active'));

            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${target}`)?.classList.add('active');

            if (target === 'guide') renderGuides();
            if (target === 'ranking') renderRanking();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const copyBtn = document.getElementById('copy-ip-btn');
    if (copyBtn) copyBtn.onclick = window.copyServerIP;
    const discordBtn = document.getElementById('discord-btn');
    if (discordBtn) discordBtn.onclick = window.openDiscord;

    renderGuides();
    renderRanking();
    updateServerStatus();
});
