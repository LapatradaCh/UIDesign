// =========================================================
//  reset-otp.js - ฟังก์ชันการทำงานและจัดการ Flow การ Reset OTP
// =========================================================

(function() {
    // ข้อมูลสถานะและประวัติการ Reset OTP ของเจ้าหน้าที่แต่ละคน
    window.staffOtpData = {
        1: { status: 'verified', ref: 'TK8812', lastSent: '10 มี.ค. 2024 09:30', history: [
            { time: '10 มี.ค. 2024 09:30', action: 'ยืนยันรหัสสำเร็จ', operator: 'เจ้าหน้าที่', status: 'verified' }
        ]},
        2: { status: 'verified', ref: 'TK5521', lastSent: '12 มี.ค. 2024 14:15', history: [
            { time: '12 มี.ค. 2024 14:15', action: 'ยืนยันรหัสสำเร็จ', operator: 'เจ้าหน้าที่', status: 'verified' }
        ]},
        3: { status: 'verified', ref: 'TK3390', lastSent: '15 มี.ค. 2024 11:00', history: [
            { time: '15 มี.ค. 2024 11:00', action: 'ยืนยันรหัสสำเร็จ', operator: 'เจ้าหน้าที่', status: 'verified' }
        ]},
        4: { status: 'pending', ref: '-', lastSent: '-', history: [] },
        6: { status: 'pending', ref: '-', lastSent: '-', history: [] },
        7: { status: 'verified', ref: 'TK4128', lastSent: '18 มี.ค. 2024 08:45', history: [
            { time: '18 มี.ค. 2024 08:45', action: 'ยืนยันรหัสสำเร็จ', operator: 'เจ้าหน้าที่', status: 'verified' }
        ]},
        8: { status: 'verified', ref: 'TK9901', lastSent: '20 มี.ค. 2024 16:20', history: [
            { time: '20 มี.ค. 2024 16:20', action: 'ยืนยันรหัสสำเร็จ', operator: 'เจ้าหน้าที่', status: 'verified' }
        ]}
    };

    let currentOtpStaffId = null;
    let currentOtpStep = 1; // 1: ยืนยันข้อมูล & สาเหตุ, 2: ส่งรหัสแล้ว & ตรวจสอบ
    let activeOtpCode = '';
    let activeRefCode = '';
    let otpCountdownSeconds = 60;
    let otpTimerInterval = null;
    let selectedReason = 'sms_not_received';

    // รายการสาเหตุ
    const reasonLabels = {
        'sms_not_received': '📱 เจ้าหน้าที่ไม่ได้รับ SMS',
        'change_phone': '🔄 เปลี่ยนเบอร์โทรศัพท์ / เครื่องใหม่',
        'locked_account': '🔒 ปลดล็อกรหัสผ่าน (กรอกผิดเกิน)',
        'security_cycle': '🛡️ รีเซ็ตความปลอดภัยตามรอบ'
    };

    // ================= เปิด Modal Reset OTP =================
    window.openResetOtpModal = function(staffId) {
        currentOtpStaffId = staffId;
        const staff = (typeof staffList !== 'undefined') ? staffList.find(s => s.id === staffId) : null;
        if (!staff) {
            alert('ไม่พบข้อมูลเจ้าหน้าที่');
            return;
        }

        // รีเซ็ตสถานะ
        currentOtpStep = 1;
        selectedReason = 'sms_not_received';
        if (otpTimerInterval) clearInterval(otpTimerInterval);

        // ใส่ข้อมูลเจ้าหน้าที่
        const nameEl = document.getElementById('resetOtpStaffName');
        const phoneEl = document.getElementById('resetOtpStaffPhone');
        const roleEl = document.getElementById('resetOtpStaffRole');
        const phoneInput = document.getElementById('resetOtpPhoneInput');
        const statusBadge = document.getElementById('resetOtpCurrentStatusBadge');

        if (nameEl) nameEl.textContent = staff.name;
        if (phoneEl) phoneEl.textContent = staff.phone;
        if (phoneInput) phoneInput.value = staff.phone;
        if (roleEl) {
            roleEl.textContent = staff.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่';
            roleEl.className = staff.role === 'admin' 
                ? 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200'
                : 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200';
        }

        const isAuth = staff.isAuthen !== false;
        if (statusBadge) {
            statusBadge.innerHTML = isAuth 
                ? '<span class="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full text-xs"><span class="material-icons text-sm" aria-hidden="true">verified</span> ยืนยันตัวตนแล้ว</span>'
                : '<span class="inline-flex items-center gap-1 text-amber-900 font-bold bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full text-xs"><span class="material-icons text-sm" aria-hidden="true">schedule</span> รอการยืนยัน OTP</span>';
        }

        renderOtpStepView();
        renderOtpHistory(staffId);

        const modal = document.getElementById('resetOtpModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                const sendBtn = document.getElementById('btnConfirmSendOtp');
                if (sendBtn) sendBtn.focus();
            }, 60);
        }
    };

    // ================= ปิด Modal Reset OTP =================
    window.closeResetOtpModal = function() {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        const modal = document.getElementById('resetOtpModal');
        if (modal) modal.style.display = 'none';
        currentOtpStaffId = null;
    };

    // ================= เลือกสาเหตุ =================
    window.selectOtpReason = function(reason) {
        selectedReason = reason;
        document.querySelectorAll('.reset-otp-reason-pill').forEach(btn => {
            const isMatch = btn.getAttribute('data-reason') === reason;
            if (isMatch) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // ================= แสดงขั้นตอนหน้าจอใน Modal =================
    function renderOtpStepView() {
        const step1 = document.getElementById('otpStep1Container');
        const step2 = document.getElementById('otpStep2Container');

        if (currentOtpStep === 1) {
            if (step1) step1.style.display = 'block';
            if (step2) step2.style.display = 'none';
        } else {
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';
        }
    }

    // ================= ส่งรหัส OTP (จำลองการทำงาน) =================
    window.handleSendOtpNow = function() {
        const phoneInput = document.getElementById('resetOtpPhoneInput');
        const targetPhone = phoneInput ? phoneInput.value.trim() : '';

        if (!targetPhone) {
            alert('กรุณาระบุหมายเลขโทรศัพท์ปลายทาง');
            return;
        }

        // อัปเดตเบอร์ในข้อมูลหากมีการแก้ไข
        const staff = (typeof staffList !== 'undefined') ? staffList.find(s => s.id === currentOtpStaffId) : null;
        if (staff && staff.phone !== targetPhone) {
            staff.phone = targetPhone;
            if (typeof render === 'function') render();
        }

        // สุ่มรหัส 6 หลักและ REF
        activeOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const randRef = 'TK' + Math.floor(1000 + Math.random() * 9000).toString();
        activeRefCode = randRef;

        // บันทึกลงใน History
        if (!window.staffOtpData[currentOtpStaffId]) {
            window.staffOtpData[currentOtpStaffId] = { status: 'pending', history: [] };
        }
        const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้';
        window.staffOtpData[currentOtpStaffId].history.unshift({
            time: nowStr,
            action: 'ส่ง OTP ใหม่ (' + (reasonLabels[selectedReason] || selectedReason) + ')',
            operator: 'ผู้ดูแลระบบ',
            status: 'sent',
            ref: activeRefCode
        });
        window.staffOtpData[currentOtpStaffId].ref = activeRefCode;
        window.staffOtpData[currentOtpStaffId].lastSent = nowStr;

        // สลับไป Step 2
        currentOtpStep = 2;
        renderOtpStepView();

        // ใส่ข้อมูลใน Step 2
        const targetPhoneDisp = document.getElementById('otpSentTargetPhone');
        const refDisp = document.getElementById('otpSentRefCode');
        const demoCodeDisp = document.getElementById('otpSentDemoCode');

        if (targetPhoneDisp) targetPhoneDisp.textContent = targetPhone;
        if (refDisp) refDisp.textContent = activeRefCode;
        if (demoCodeDisp) demoCodeDisp.textContent = activeOtpCode;

        // ล้างช่องกรอกตัวเลข
        for (let i = 0; i < 6; i++) {
            const digitInput = document.getElementById('otpDigit' + i);
            if (digitInput) digitInput.value = '';
        }

        // เริ่มนับถอยหลัง 60 วินาที
        startOtpCountdown();

        // แสดงแจ้งเตือน SMS จำลอง
        showSimulatedSmsToast(targetPhone, activeOtpCode, activeRefCode);

        // อัปเดตประวัติ
        renderOtpHistory(currentOtpStaffId);
    };

    // ================= ตัวนับเวลาถอยหลัง =================
    function startOtpCountdown() {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        otpCountdownSeconds = 60;
        updateTimerBadge();

        const resendBtn = document.getElementById('btnResendOtp');
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.classList.add('opacity-50', 'cursor-not-allowed');
            resendBtn.classList.remove('hover:bg-slate-100');
        }

        otpTimerInterval = setInterval(() => {
            otpCountdownSeconds--;
            updateTimerBadge();

            if (otpCountdownSeconds <= 0) {
                clearInterval(otpTimerInterval);
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    resendBtn.classList.add('hover:bg-slate-100');
                }
            }
        }, 1000);
    }

    function updateTimerBadge() {
        const badge = document.getElementById('otpTimerBadgeText');
        if (badge) {
            const mm = Math.floor(otpCountdownSeconds / 60).toString().padStart(2, '0');
            const ss = (otpCountdownSeconds % 60).toString().padStart(2, '0');
            badge.textContent = `ขอรหัสใหม่ได้ใน ${mm}:${ss}`;
        }
    }

    // ================= ขอรหัสใหม่อีกครั้ง =================
    window.handleResendOtp = function() {
        if (otpCountdownSeconds > 0) return;
        window.handleSendOtpNow();
    };

    // ================= ฟังก์ชันจัดการกล่องกรอก OTP 6 หลัก =================
    window.handleOtpDigitInput = function(el, index, event) {
        const val = el.value;
        if (val.length > 1) {
            el.value = val.slice(-1);
        }

        // ย้ายไปช่องถัดไปถ้ามีการกรอกตัวเลข
        if (el.value.length === 1 && index < 5) {
            const nextEl = document.getElementById('otpDigit' + (index + 1));
            if (nextEl) nextEl.focus();
        }

        // ตรวจสอบว่ากรอกครบ 6 ตัวหรือยัง
        checkAndAutoVerifyOtp();
    };

    window.handleOtpDigitKeydown = function(el, index, e) {
        if (e.key === 'Backspace' && !el.value && index > 0) {
            const prevEl = document.getElementById('otpDigit' + (index - 1));
            if (prevEl) {
                prevEl.focus();
                prevEl.value = '';
            }
        }
    };

    // Auto-fill รหัสเพื่อทดสอบอย่างรวดเร็ว
    window.handleQuickFillOtp = function() {
        if (!activeOtpCode) return;
        for (let i = 0; i < 6; i++) {
            const digitEl = document.getElementById('otpDigit' + i);
            if (digitEl) digitEl.value = activeOtpCode.charAt(i);
        }
        checkAndAutoVerifyOtp();
    };

    // ตรวจสอบความถูกต้องของ OTP
    function checkAndAutoVerifyOtp() {
        let enteredCode = '';
        for (let i = 0; i < 6; i++) {
            const digitEl = document.getElementById('otpDigit' + i);
            if (digitEl) enteredCode += digitEl.value;
        }

        const msgEl = document.getElementById('otpVerifyResultMsg');
        if (enteredCode.length === 6) {
            if (enteredCode === activeOtpCode) {
                if (msgEl) {
                    msgEl.innerHTML = '<span class="text-emerald-800 font-bold flex items-center justify-center gap-1"><span class="material-icons text-base">check_circle</span> ยืนยันรหัสถูกต้อง! กำลังอัปเดตสถานะ...</span>';
                }

                // อัปเดตสถานะเจ้าหน้าที่เป็น ยืนยันตัวตนแล้ว (isAuthen = true)
                setTimeout(() => {
                    const staff = (typeof staffList !== 'undefined') ? staffList.find(s => s.id === currentOtpStaffId) : null;
                    if (staff) {
                        staff.isAuthen = true;
                        if (!window.staffOtpData[currentOtpStaffId]) window.staffOtpData[currentOtpStaffId] = { history: [] };
                        window.staffOtpData[currentOtpStaffId].status = 'verified';
                        
                        const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้';
                        window.staffOtpData[currentOtpStaffId].history.unshift({
                            time: nowStr,
                            action: 'ยืนยันรหัส OTP สำเร็จ',
                            operator: 'เจ้าหน้าที่',
                            status: 'verified',
                            ref: activeRefCode
                        });

                        if (typeof render === 'function') render();
                        alert('🎉 ยืนยันรหัส OTP สำเร็จ!\nเจ้าหน้าที่ ' + staff.name + ' ได้รับการยืนยันตัวตนเรียบร้อยแล้ว');
                        window.closeResetOtpModal();
                    }
                }, 700);

            } else {
                if (msgEl) {
                    msgEl.innerHTML = '<span class="text-rose-800 font-bold flex items-center justify-center gap-1"><span class="material-icons text-base">error</span> รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง</span>';
                }
            }
        } else {
            if (msgEl) msgEl.innerHTML = '';
        }
    }

    // ================= แสดงประวัติการทำรายการ =================
    function renderOtpHistory(staffId) {
        const histContainer = document.getElementById('otpHistoryList');
        if (!histContainer) return;

        const data = window.staffOtpData[staffId];
        if (!data || !data.history || data.history.length === 0) {
            histContainer.innerHTML = '<div class="text-center py-3 text-slate-600 text-xs font-semibold">ยังไม่มีประวัติการรีเซ็ต OTP</div>';
            return;
        }

        let html = '';
        data.history.forEach(item => {
            const isVerified = item.status === 'verified';
            const badgeClass = isVerified ? 'otp-badge-active' : 'otp-badge-pending';
            const icon = isVerified ? 'verified' : 'send';
            
            html += `
            <div class="otp-history-item">
                <div class="flex items-center gap-2">
                    <span class="material-icons text-sm ${isVerified ? 'text-emerald-800' : 'text-slate-600'}">${icon}</span>
                    <div>
                        <div class="font-bold text-slate-800">${item.action}</div>
                        <div class="text-[11px] text-slate-600 font-mono">${item.time} โดย ${item.operator}</div>
                    </div>
                </div>
                ${item.ref ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700">${item.ref}</span>` : ''}
            </div>`;
        });

        histContainer.innerHTML = html;
    }

    // ================= ป็อปอัป SMS จำลองด้านบนจอ =================
    function showSimulatedSmsToast(phone, code, ref) {
        let toast = document.getElementById('simulatedSmsToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'simulatedSmsToast';
            toast.className = 'otp-simulated-toast';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <span class="material-icons text-xl">sms</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-emerald-300">ข้อความ SMS (จำลอง)</span>
                    <span class="text-[10px] text-slate-300">ตอนนี้</span>
                </div>
                <div class="text-xs font-bold text-white mt-0.5">
                    รหัส OTP ของคุณคือ: <span class="text-amber-300 font-mono text-sm tracking-wider font-extrabold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50">${code}</span>
                </div>
                <div class="text-[11px] text-slate-300 mt-1">
                    (Ref: ${ref}) ถึงเบอร์ ${phone} • มีอายุ 5 นาที ห้ามแจ้งผู้อื่น
                </div>
            </div>
            <button type="button" aria-label="ปิดการแจ้งเตือน SMS" onclick="document.getElementById('simulatedSmsToast').style.display='none'" class="text-slate-300 hover:text-white cursor-pointer p-1">
                <span class="material-icons text-sm">close</span>
            </button>
        `;
        toast.style.display = 'flex';

        // ปิดอัตโนมัติใน 9 วินาที
        setTimeout(() => {
            if (toast && toast.style.display !== 'none') {
                toast.style.display = 'none';
            }
        }, 9000);
    }

    // จัดการปิดเมื่อคลิก Backdrop หรือกดปุ่ม Escape
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('resetOtpModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) window.closeResetOtpModal();
            });
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('resetOtpModal');
            if (modal && modal.style.display === 'flex') {
                window.closeResetOtpModal();
            }
        }
    });

})();
