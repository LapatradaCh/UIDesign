// ================= Variables สำหรับ Design 7 =================
let d7Tab = 'staff';
let selectedD7StaffId = null;
let selectedD7PendingId = null;
let isD7EditMode = false;
let d7TempRole = null; 
let d7TempResp = null; 

// ================= Custom CSS สำหรับ Scrollbar (WCAG 2.2) =================
if (!document.getElementById('d7CustomStyle')) {
    const style = document.createElement('style');
    style.id = 'd7CustomStyle';
    style.innerHTML = `
        /* เลื่อนแนวตั้ง */
        .d7-scroll-y::-webkit-scrollbar { width: 5px; }
        .d7-scroll-y::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .d7-scroll-y::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
        .d7-scroll-y { scrollbar-width: thin; scrollbar-color: #94a3b8 #f1f5f9; }
        
        /* เลื่อนแนวนอน */
        .d7-scroll-x::-webkit-scrollbar { height: 4px; }
        .d7-scroll-x::-webkit-scrollbar-track { background: transparent; }
        .d7-scroll-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .d7-scroll-x { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
    `;
    document.head.appendChild(style);
}

// ================= ฟังก์ชันสลับ Tab =================
window.setD7Tab = function(tab) {
    d7Tab = tab;
    isD7EditMode = false; 
    const tabs = ['staff', 'admin', 'user', 'pending'];
    const idMap = { 'staff': 'd7TabStaff', 'admin': 'd7TabAdmin', 'user': 'd7TabUser', 'pending': 'd7TabPending' };
    
    tabs.forEach(t => {
        const el = document.getElementById(idMap[t]);
        if(el) {
            if (t === tab) {
                el.classList.add('bg-white', 'text-slate-900', 'border', 'border-slate-300');
                el.classList.remove('text-slate-700', 'hover:text-slate-900', 'border-transparent');
                el.setAttribute('aria-selected', 'true');
            } else {
                el.classList.remove('bg-white', 'text-slate-900', 'border-slate-300');
                el.classList.add('text-slate-700', 'hover:text-slate-900', 'border-transparent');
                el.setAttribute('aria-selected', 'false');
            }
        }
    });
    if (typeof render === 'function') render(); 
};

window.handleD7TabKeydown = function(e, currentTab) {
    const tabs = ['staff', 'admin', 'user', 'pending'];
    const idx = tabs.indexOf(currentTab);
    let newIdx = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        newIdx = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        newIdx = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
        newIdx = 0;
    } else if (e.key === 'End') {
        newIdx = tabs.length - 1;
    } else {
        return;
    }
    e.preventDefault();
    const nextTab = tabs[newIdx];
    window.setD7Tab(nextTab);
    const idMap = { 'staff': 'd7TabStaff', 'admin': 'd7TabAdmin', 'user': 'd7TabUser', 'pending': 'd7TabPending' };
    const el = document.getElementById(idMap[nextTab]);
    if (el) el.focus();
};

// ================= ★ ฟังก์ชันเข้าสู่โหมดแก้ไข (Single Edit) ★ =================
window.enterD7Edit = function() {
    const s = staffList.find(x => x.id === selectedD7StaffId);
    if(s) {
        d7TempRole = s.role;
        d7TempResp = [...(s.resp || [])];
    }
    isD7EditMode = true;
    render();
};

window.cancelD7Edit = function() {
    isD7EditMode = false;
    d7TempRole = null; 
    d7TempResp = null; 
    render();
};

window.saveD7Edit = function() {
    const s = staffList.find(x => x.id === selectedD7StaffId);
    if (s) {
        s.role = d7TempRole; 
        s.resp = [...d7TempResp];
        alert('✅ บันทึกข้อมูลสำเร็จ');
    } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    isD7EditMode = false;
    d7TempRole = null;
    d7TempResp = null;
    render();
};

window.d7ToggleRole = function() {
    d7TempRole = d7TempRole === 'admin' ? 'staff' : 'admin';
    render(); 
};

// ================= ฟังก์ชัน Scroll สำหรับ iPhone / iOS =================
window.d7ScrollToDetail = function() {
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            const el = document.getElementById('d7DetailPanel');
            if(el) {
                const rect = el.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // ชดเชยระยะ Header เพื่อป้องกัน Focus Not Obscured (WCAG 2.4.11)
                const y = rect.top + scrollTop - 24; 
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 150);
    }
};

// ================= ฟังก์ชันสร้างโครงร่าง HTML =================
function initDesign7Skeleton() {
    const container = document.getElementById('design7Container');
    if (!container) return;

    if (container.innerHTML.trim() === '') {
        let skelHtml = '<div class="bg-white p-3 sm:p-5 md:p-8 rounded-2xl border border-slate-200">';
        
        skelHtml += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 md:pb-6 border-b border-slate-200">';
        skelHtml += '<div class="min-w-0 flex-1"><span class="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-1">Clean & Flat Design</span><h1 class="text-lg sm:text-xl md:text-2xl font-black text-slate-900 truncate">จัดการเจ้าหน้าที่ในหน่วยงาน</h1></div>';
        skelHtml += '<button aria-label="เปิด QR Code เชิญเจ้าหน้าที่" onclick="openModal(\'qrModal\')" class="self-start sm:self-auto shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 md:px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 cursor-pointer min-h-[32px] min-w-[32px]"><span class="material-icons text-sm sm:text-base" aria-hidden="true">qr_code</span> <span>QR Code เชิญ</span></button>';
        skelHtml += '</div>';

        skelHtml += '<div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mt-4 md:mt-6">';
        skelHtml += '<div role="tablist" aria-label="ตัวกรองบทบาทเจ้าหน้าที่" class="flex bg-slate-100 p-1.5 rounded-full w-full md:w-auto overflow-x-auto hide-scrollbar flex-nowrap border border-slate-200">';
        skelHtml += '<button role="tab" aria-selected="true" aria-controls="d7ListPanel" onkeydown="handleD7TabKeydown(event, \'staff\')" onclick="setD7Tab(\'staff\')" id="d7TabStaff" class="cursor-pointer flex-1 md:flex-none whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all bg-white text-slate-900 border border-slate-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 min-h-[32px]">ทั้งหมด</button>';
        skelHtml += '<button role="tab" aria-selected="false" aria-controls="d7ListPanel" onkeydown="handleD7TabKeydown(event, \'admin\')" onclick="setD7Tab(\'admin\')" id="d7TabAdmin" class="cursor-pointer flex-1 md:flex-none whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all text-slate-700 border border-transparent hover:text-slate-900 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 min-h-[32px]">ผู้ดูแลระบบ</button>';
        skelHtml += '<button role="tab" aria-selected="false" aria-controls="d7ListPanel" onkeydown="handleD7TabKeydown(event, \'user\')" onclick="setD7Tab(\'user\')" id="d7TabUser" class="cursor-pointer flex-1 md:flex-none whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all text-slate-700 border border-transparent hover:text-slate-900 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 min-h-[32px]">เจ้าหน้าที่</button>';
        skelHtml += '<button role="tab" aria-selected="false" aria-controls="d7ListPanel" onkeydown="handleD7TabKeydown(event, \'pending\')" onclick="setD7Tab(\'pending\')" id="d7TabPending" class="cursor-pointer flex-1 md:flex-none whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all text-slate-700 border border-transparent hover:text-slate-900 flex justify-center items-center gap-1 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 min-h-[32px]">รออนุมัติ <span id="d7PendingCount" class="bg-amber-700 text-white px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">0</span></button>';
        skelHtml += '</div>';
        skelHtml += '<div class="relative w-full md:w-64 shrink-0"><span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[18px]" aria-hidden="true">search</span><input type="text" aria-label="ค้นหารายชื่อเจ้าหน้าที่" placeholder="ค้นหารายชื่อ..." oninput="handleSearch(this.value)" class="w-full bg-white border border-slate-300 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-colors text-slate-900 placeholder-slate-600 min-h-[32px]"></div>';
        skelHtml += '</div>';

        skelHtml += '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6">';
        // เพิ่ม scroll-pt-2 และ scroll-pt-4 ป้องกัน Focus Not Obscured (WCAG 2.4.11)
        skelHtml += '<div class="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 h-[350px] lg:h-[550px] overflow-y-auto hide-scrollbar space-y-2 scroll-pt-2" id="d7ListPanel" role="tabpanel" aria-label="รายชื่อเจ้าหน้าที่"></div>';
        skelHtml += '<div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col h-auto min-h-[350px] lg:h-[550px] overflow-y-auto hide-scrollbar scroll-pt-4" id="d7DetailPanel" role="region" aria-live="polite" aria-label="รายละเอียดเจ้าหน้าที่"></div>';
        skelHtml += '</div></div>';
        
        container.innerHTML = skelHtml;
    }
}

// ================= ฟังก์ชัน Render ข้อมูล =================
window.renderDesign7 = function(filtered, pendingFiltered, pendingList, staffList) {
    initDesign7Skeleton();

    const listEl = document.getElementById('d7ListPanel');
    const detailEl = document.getElementById('d7DetailPanel');
    const pendBadge = document.getElementById('d7PendingCount');
    
    let currentScroll = 0;
    if (listEl) currentScroll = listEl.scrollTop;
    
    if(pendBadge) pendBadge.innerText = pendingList.length;

    // ----------- กรณีเลือกรอพิจารณา -----------
    if(d7Tab === 'pending') {
        if (pendingFiltered.length > 0) {
            const found = pendingFiltered.find(p => p.id === selectedD7PendingId);
            if (!found) selectedD7PendingId = pendingFiltered[0].id;
        } else {
            selectedD7PendingId = null;
        }

        let listHtml = '';
        pendingFiltered.forEach(p => {
            const isSel = selectedD7PendingId === p.id;
            const bgClass = isSel ? 'bg-[#151b2b] text-white border-[#151b2b]' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900';
            const iconBgClass = isSel ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900';
            const selTextClass = isSel ? 'text-slate-300' : 'text-slate-600';
            const badgeBgClass = isSel ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-300';

            listHtml += '<button type="button" aria-pressed="' + isSel + '" onclick="selectedD7PendingId=' + p.id + '; isD7EditMode=false; render(); d7ScrollToDetail();" class="w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 sm:gap-3 min-h-[44px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ' + bgClass + '">';
            listHtml += '    <div class="min-w-0 flex-1">';
            listHtml += '        <p class="font-bold text-xs sm:text-sm truncate">' + p.name + '</p>';
            listHtml += '        <p class="text-xs ' + selTextClass + ' font-mono mt-0.5 truncate">' + p.requestDate + '</p>';
            listHtml += '    </div>';
            listHtml += '    <span class="shrink-0 text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-full font-bold ' + badgeBgClass + '">คำขอใหม่</span>';
            listHtml += '</button>';
        });
        
        if (listEl) {
            listEl.innerHTML = listHtml || '<div class="flex flex-col items-center justify-center h-full text-slate-600 gap-2"><span class="material-icons text-3xl sm:text-4xl" aria-hidden="true">inbox</span><p class="text-xs sm:text-sm font-bold">ไม่มีคำขออนุมัติ</p></div>';
            listEl.scrollTop = currentScroll;
        }

        const p = pendingList.find(x => x.id === selectedD7PendingId);
        if(p && detailEl) {
            let reqRoleBadge = p.requestRole === 'admin' 
                ? '<span class="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-xs sm:text-sm font-bold shrink-0 min-w-max flex-none" style="white-space: nowrap;">ผู้ดูแลระบบ</span>'
                : '<span class="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold shrink-0 min-w-max flex-none" style="white-space: nowrap;">เจ้าหน้าที่</span>';

            let detailHtml = '<div class="flex flex-col min-h-full relative">';
            detailHtml += '<div class="flex flex-col min-w-0 pb-4 sm:pb-6 shrink-0">';
            detailHtml += '<div class="min-w-0 flex-1 pt-1"><h2 class="text-base sm:text-lg font-black text-slate-900 truncate">' + p.name + '</h2><p class="text-xs sm:text-sm text-slate-600 font-mono mb-1.5">' + p.phone + '</p><span class="inline-block bg-amber-50 text-amber-800 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold border border-amber-300 shrink-0 flex-none min-w-max" style="white-space: nowrap;">คำขอเข้าร่วมหน่วยงาน</span></div></div>';
            detailHtml += '<div class="w-full h-px bg-slate-200 mb-4 sm:mb-6 shrink-0"></div>';
            detailHtml += '<div class="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mb-auto shrink-0">';
            detailHtml += '<div class="flex justify-between items-center mb-3 sm:mb-4"><span class="text-xs sm:text-sm font-bold text-slate-600">บทบาทที่ต้องการ</span>' + reqRoleBadge + '</div>';
            detailHtml += '<div class="flex justify-between items-center border-t border-slate-200 pt-3 sm:pt-4"><span class="text-xs sm:text-sm font-bold text-slate-600">วันที่ส่งคำขอ</span><span class="text-xs sm:text-sm font-bold text-slate-900">' + p.requestDate + '</span></div></div>';
            
            detailHtml += '<div class="flex flex-col sm:flex-row gap-2 pt-4 sm:pt-6 shrink-0"><button type="button" aria-label="ดูข้อมูลผู้ขอ" onclick="showPendingInfo(\'' + p.name + '\', \'' + p.phone + '\')" class="cursor-pointer w-full sm:flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center transition-colors min-h-[32px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"><span class="material-icons text-sm sm:text-base mr-1.5" aria-hidden="true">info</span> <span style="white-space: nowrap;">ข้อมูล</span></button>';
            detailHtml += '<div class="flex gap-2 w-full sm:w-auto sm:flex-[2]"><button type="button" aria-label="ปฏิเสธคำขอ" onclick="handleReject(' + p.id + ')" class="cursor-pointer flex-[1] bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center transition-colors min-h-[32px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"><span style="white-space: nowrap;">ปฏิเสธ</span></button>';
            detailHtml += '<button type="button" aria-label="อนุมัติคำขอ" onclick="handleApprove(' + p.id + ')" class="cursor-pointer flex-[1.5] bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center transition-colors min-h-[32px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><span style="white-space: nowrap;">อนุมัติ</span></button></div></div></div>';
            
            detailEl.innerHTML = detailHtml;
        } else if(detailEl) { detailEl.innerHTML = ''; }

    } else {
        // ----------- กรณีแสดงรายชื่อปกติ -----------
        const d7Staffs = filtered.filter(s => {
            if(d7Tab === 'staff') return true;
            if(d7Tab === 'admin') return s.role === 'admin';
            if(d7Tab === 'user') return s.role === 'staff';
            return true;
        });

        if (d7Staffs.length > 0) {
            const found = d7Staffs.find(s => s.id === selectedD7StaffId);
            if (!found) selectedD7StaffId = d7Staffs[0].id;
        } else {
            selectedD7StaffId = null;
        }
        
        let listHtml = '';
        d7Staffs.forEach(s => {
            const isSel = selectedD7StaffId === s.id;
            
            const bgClass = isSel ? 'bg-[#151b2b] text-white border-[#151b2b]' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900';
            const iconBgClass = isSel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800';
            const selTextClass = isSel ? 'text-slate-300' : 'text-slate-600';
            const badgeClass = isSel ? 'bg-white/20 text-white' : (s.role === 'admin' ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-slate-100 text-slate-800 border-slate-300');
            const roleName = s.role === 'admin' ? 'ผู้ดูแล' : 'เจ้าหน้าที่';
            const authenIconClass = isSel ? 'text-emerald-400' : 'text-emerald-700';
            const isAuthen = s.isAuthen !== false;
            const authenIcon = isAuthen
                ? '<span class="material-icons ' + authenIconClass + ' text-[15px] sm:text-[17px] inline-flex items-center ml-1 align-middle shrink-0" title="ผ่านการยืนยันตัวตนแล้ว" aria-label="ผ่านการยืนยันตัวตนแล้ว" role="img">verified</span>'
                : '';
            listHtml += '<button type="button" aria-pressed="' + isSel + '" onclick="selectedD7StaffId=' + s.id + '; isD7EditMode=false; render(); d7ScrollToDetail();" class="w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 sm:gap-3 min-h-[44px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ' + bgClass + '">';
            listHtml += '    <div class="min-w-0 flex-1">';
            listHtml += '        <p class="font-bold text-xs sm:text-sm truncate flex items-center">' + s.name + authenIcon + '</p>';
            listHtml += '        <p class="text-xs ' + selTextClass + ' font-mono mt-0.5 truncate">' + s.phone + '</p>';
            listHtml += '    </div>';
            listHtml += '    <span class="shrink-0 text-xs sm:text-sm px-3 py-1 rounded-full font-bold border ' + badgeClass + '">' + roleName + '</span>';
            listHtml += '</button>';
        });
        
        if(listEl) {
            listEl.innerHTML = listHtml || '<div class="flex flex-col items-center justify-center h-full text-slate-600 gap-2"><span class="material-icons text-3xl sm:text-4xl" aria-hidden="true">search_off</span><p class="text-xs sm:text-sm font-bold">ไม่พบข้อมูล</p></div>';
            listEl.scrollTop = currentScroll;
        }

        const s = staffList.find(x => x.id === selectedD7StaffId);
        if(s && detailEl) {
            const profileBgClass = 'bg-[#c6f6d5] text-[#065f46]';
            
            const displayRole = isD7EditMode ? d7TempRole : s.role;
            const displayResp = isD7EditMode ? (d7TempResp || []) : (s.resp || []);
            
            let roleBadgeClass = displayRole === 'admin' ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-slate-100 text-slate-800 border-slate-300';
            let roleNameDetail = displayRole === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่';
            let roleToggleBtnText = displayRole === 'admin' ? 'ปรับเป็นเจ้าหน้าที่' : 'ปรับเป็น Admin';

            let respHtml = '';
            let respCountText = '';
            if (displayResp && displayResp.length > 0) {
                // Semantic List แบบสมบูรณ์
                let chipsHtml = displayResp.map(r => '<li role="listitem" class="inline-flex"><span class="inline-flex items-center h-6 sm:h-7 px-3 bg-white border border-slate-300 text-slate-800 rounded-full text-xs sm:text-sm font-bold shadow-sm max-w-[140px] sm:max-w-[180px] shrink-0"><span class="truncate w-full text-left" title="'+r+'">' + r + '</span></span></li>').join('');
                
                respHtml = '<div tabindex="0" role="region" aria-label="รายการหมวดหมู่ความรับผิดชอบ เลื่อนดูได้" class="w-full mt-1.5 overflow-y-auto max-h-[95px] sm:max-h-[115px] pr-2 d7-scroll-y focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 rounded-xl">';
                respHtml += '<ul role="list" class="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-1 m-0 p-0 list-none">';
                respHtml += chipsHtml;
                respHtml += '</ul></div>';
                
                respCountText = ' (' + displayResp.length + ' หมวด)';
            } else {
                respHtml = '<span class="inline-flex items-center h-7 sm:h-8 px-3.5 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 mt-1.5"><span class="material-icons text-sm sm:text-base mr-1.5 text-slate-500" aria-hidden="true">block</span> ไม่เลือกประเภทที่รับผิดชอบ</span>';
                respCountText = ' (0 หมวด)';
            }

            let isAuthen = s.isAuthen !== false;
            let statusCardsHtml = '';

            statusCardsHtml += '<div class="w-full p-2.5 sm:p-3 bg-blue-50 border border-blue-300 rounded-2xl flex flex-col gap-1 sm:gap-1.5"><span class="material-icons text-blue-800 text-sm sm:text-base" aria-hidden="true">login</span><div><div class="text-sm sm:text-base font-bold text-blue-900 mb-0.5">เข้าครั้งแรก</div><div class="text-xs sm:text-sm font-medium text-blue-950 truncate">' + (isAuthen ? '10 มี.ค. 2024' : '-') + '</div></div></div>';
            statusCardsHtml += '<div class="w-full p-2.5 sm:p-3 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col gap-1 sm:gap-1.5"><span class="material-icons text-amber-800 text-sm sm:text-base" aria-hidden="true">history</span><div><div class="text-sm sm:text-base font-bold text-amber-900 mb-0.5">ใช้งานล่าสุด</div><div class="text-xs sm:text-sm font-medium text-amber-950 truncate">' + (isAuthen ? 'วันนี้ 08:15' : '-') + '</div></div></div>';

            let roleToggleBtnHtml = isD7EditMode 
                ? '<button type="button" onclick="d7ToggleRole()" aria-label="สลับบทบาทสิทธิ์การใช้งาน" class="cursor-pointer shrink-0 flex-none min-w-max inline-flex items-center justify-center gap-1 px-3 h-6 sm:h-7 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-full text-xs sm:text-sm font-bold transition-colors shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 whitespace-nowrap" style="white-space: nowrap;"><span class="material-icons text-sm sm:text-base flex-none" aria-hidden="true">swap_horiz</span> <span class="whitespace-nowrap flex-none" style="white-space: nowrap;">' + roleToggleBtnText + '</span></button>' 
                : '';

            let respEditBtnHtml = isD7EditMode 
                ? '<button type="button" onclick="openResponsibilitiesModal(' + s.id + ')" aria-label="แก้ไขข้อมูลด้านความรับผิดชอบ" class="cursor-pointer shrink-0 flex-none min-w-max px-3 py-1 sm:px-3.5 sm:py-1.5 inline-flex items-center justify-center gap-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold transition-colors shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 whitespace-nowrap min-h-[32px] rounded-full"><span class="material-icons text-sm sm:text-base" aria-hidden="true">edit</span> เลือกหมวดหมู่</button>' 
                : '';

            let mainEditBtnHtml = isD7EditMode 
                ? '<div class="absolute top-0 right-0 flex items-center gap-1.5 sm:gap-2 z-20 bg-white/95 backdrop-blur-sm pl-2 pb-1 rounded-bl-xl">' +
                  '<button type="button" aria-label="ยกเลิกการแก้ไข" onclick="cancelD7Edit()" class="cursor-pointer flex-none shrink-0 min-w-max inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3.5 h-8 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-full transition-colors text-xs sm:text-sm font-bold shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 whitespace-nowrap"><span class="material-icons text-sm sm:text-base" aria-hidden="true">close</span> <span class="hidden sm:inline whitespace-nowrap flex-none">ยกเลิก</span></button>' +
                  '<button type="button" aria-label="บันทึกการแก้ไข" onclick="saveD7Edit()" class="cursor-pointer flex-none shrink-0 min-w-max inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3.5 h-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full transition-colors shadow-sm text-xs sm:text-sm font-bold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap"><span class="material-icons text-sm sm:text-base" aria-hidden="true">save</span> <span class="hidden sm:inline whitespace-nowrap flex-none">บันทึก</span></button>' +
                  '</div>'
                : '<button type="button" aria-label="เปิดโหมดแก้ไขข้อมูล" onclick="enterD7Edit()" class="absolute top-0 right-0 cursor-pointer flex-none shrink-0 min-w-max px-3.5 h-8 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-full text-slate-800 text-xs sm:text-sm font-bold transition-colors shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 whitespace-nowrap z-20" title="เปิดโหมดแก้ไข"><span class="material-icons text-sm sm:text-base" aria-hidden="true">edit</span> แก้ไขข้อมูล</button>';

            let deleteBtnHtml = isD7EditMode 
                ? '<div class="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-200 flex justify-end shrink-0"><button type="button" aria-label="ลบเจ้าหน้าที่ออกจากหน่วยงาน" onclick="handleRemoveStaff(' + s.id + ')" class="cursor-pointer flex-none shrink-0 min-w-max inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 text-slate-500 hover:text-rose-700 bg-transparent hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-full text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 whitespace-nowrap min-h-[44px]" style="white-space: nowrap;"><span class="material-icons text-base flex-none" aria-hidden="true">person_remove</span> <span class="whitespace-nowrap flex-none" style="white-space: nowrap;">ลบออกจากหน่วยงาน</span></button></div>' 
                : '';

            let detailHtml = '<div class="flex flex-col min-h-full">';
            
            detailHtml += '<div class="relative w-full pb-4 sm:pb-6 shrink-0" id="d7ProfileContainer">';
            detailHtml += mainEditBtnHtml;
            
            detailHtml += '<div class="flex flex-col min-w-0 flex-1">';
            
            const detailAuthenIcon = (s.isAuthen !== false)
                ? '<span class="material-icons text-emerald-700 text-lg sm:text-xl inline-flex items-center ml-1.5 align-middle shrink-0" title="ผ่านการยืนยันตัวตนแล้ว" aria-label="ผ่านการยืนยันตัวตนแล้ว" role="img">verified</span>'
                : '';

            detailHtml += '<div class="min-w-0 pt-0.5 sm:pt-1 flex-1 w-full">';
            detailHtml += '<div class="pr-[80px] sm:pr-[130px] w-full">';
            detailHtml += '<h2 class="text-base sm:text-lg font-black text-slate-900 truncate flex items-center">' + s.name + detailAuthenIcon + '</h2>';
            detailHtml += '<p class="text-xs sm:text-sm text-slate-600 font-mono mb-1.5 truncate">' + s.phone + '</p>';
            detailHtml += '</div>';
            
            // ให้เลื่อนสลับสิทธิ์แนวนอนได้
            detailHtml += '<div class="w-full overflow-x-auto hide-scrollbar pb-1 mt-0.5 d7-scroll-x" tabindex="0" aria-label="สถานะบทบาท เลื่อนซ้ายขวาได้">';
            detailHtml += '<div class="flex flex-nowrap items-center gap-1.5 sm:gap-2 w-max pr-2">';
            detailHtml += '<span class="shrink-0 flex-none min-w-max inline-flex items-center justify-center h-6 sm:h-7 border ' + roleBadgeClass + ' px-2.5 sm:px-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap" style="white-space: nowrap;">' + roleNameDetail + '</span>';
            detailHtml += roleToggleBtnHtml;
            detailHtml += '</div></div></div></div>';

            detailHtml += '<div class="w-full h-px bg-slate-200 mb-4 sm:mb-6 shrink-0"></div>';

            detailHtml += '<div class="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mb-4 sm:mb-6 flex flex-col w-full shrink-0">';
            detailHtml += '<div class="flex justify-between items-center w-full border-b border-slate-200 pb-2.5 sm:pb-3 mb-1.5 sm:mb-2">';
            detailHtml += '<p class="text-xs sm:text-sm font-bold text-slate-800 m-0">ด้านความรับผิดชอบ<span class="text-slate-600 font-normal">' + respCountText + '</span></p>';
            detailHtml += '<div class="shrink-0 flex-none">' + respEditBtnHtml + '</div>';
            detailHtml += '</div>';
            detailHtml += '<div class="w-full">' + respHtml + '</div>';
            detailHtml += '</div>';

            let otpBadgeText = isAuthen ? 'ยืนยันตัวตนแล้ว' : 'รอการยืนยัน OTP';
            let otpBadgeColor = isAuthen 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-900 border-amber-300';
            let otpIcon = isAuthen ? 'verified_user' : 'phonelink_lock';

            let otpCardHtml = '<div class="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4 shrink-0">' +
                '<div class="flex items-center gap-3 min-w-0">' +
                '    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">' +
                '        <span class="material-icons text-xl" aria-hidden="true">' + otpIcon + '</span>' +
                '    </div>' +
                '    <div class="min-w-0">' +
                '        <div class="flex items-center gap-2 flex-wrap">' +
                '            <span class="text-xs sm:text-sm font-black text-slate-900">รหัสยืนยัน OTP</span>' +
                '            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold border ' + otpBadgeColor + '">' + otpBadgeText + '</span>' +
                '        </div>' +
                '        <p class="text-[11px] sm:text-xs text-slate-600 truncate mt-0.5">จัดการรหัสเข้าใช้งาน และส่ง SMS ยืนยันตัวตนใหม่</p>' +
                '    </div>' +
                '</div>' +
                '<button type="button" aria-label="รีเซ็ตรหัส OTP เจ้าหน้าที่" onclick="openResetOtpModal(' + s.id + ')" class="cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 w-full sm:w-auto min-h-[36px]">' +
                '    <span class="material-icons text-base" aria-hidden="true">lock_reset</span>' +
                '    <span>รีเซ็ต OTP</span>' +
                '</button>' +
                '</div>';

            detailHtml += otpCardHtml;

            detailHtml += '<div class="grid grid-cols-2 gap-2.5 sm:gap-4 w-full mb-auto pb-1 shrink-0" role="region" aria-label="สถานะการเข้าใช้งาน">';
            detailHtml += statusCardsHtml;
            detailHtml += '</div>';

            detailHtml += deleteBtnHtml;

            detailHtml += '</div>';
            
            detailEl.innerHTML = detailHtml;
        } else if(detailEl) { detailEl.innerHTML = ''; }
    }
};
