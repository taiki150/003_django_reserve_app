"use strict";
/**
 * 管理者用予約管理画面：予約日・予約時間のインライン編集
 */
function getCookie(name) {
    let v = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach((c) => {
            c = c.trim();
            if (c.substring(0, name.length + 1) === name + '=') {
                v = decodeURIComponent(c.substring(name.length + 1));
            }
        });
    }
    return v;
}
const ALLOWED_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];
function formatTimeForDisplay(timeStr) {
    return timeStr.replace(':', '：');
}
/** 時間を10〜14時の枠に正規化（分数は00に） */
function normalizeTimeToSlot(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const hour = Math.min(14, Math.max(10, isNaN(h) ? 10 : h));
    return `${hour.toString().padStart(2, '0')}:00`;
}
function initReserveEdit() {
    const container = document.querySelector('[data-reserve-update-url]');
    if (!container)
        return;
    const apiUrl = container.dataset.reserveUpdateUrl;
    const sendTestReminderUrl = container.dataset.sendTestReminderUrl;
    if (!apiUrl)
        return;
    // ---- 日付編集 ----
    document.querySelectorAll('.btn-date-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell');
            if (!cell)
                return;
            const form = cell.querySelector('.date-edit-form');
            const view = cell.querySelector('.date-view');
            const input = cell.querySelector('.date-input');
            if (!form || !view || !input)
                return;
            input.value = btn.dataset.date || '';
            view.style.display = 'none';
            form.style.display = 'inline-block';
        });
    });
    document.querySelectorAll('.btn-date-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell');
            if (!cell)
                return;
            const view = cell.querySelector('.date-view');
            const form = cell.querySelector('.date-edit-form');
            if (view)
                view.style.display = '';
            if (form)
                form.style.display = 'none';
        });
    });
    document.querySelectorAll('.btn-date-save').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell');
            if (!cell)
                return;
            const form = cell.querySelector('.date-edit-form');
            const view = cell.querySelector('.date-view');
            const editBtn = view === null || view === void 0 ? void 0 : view.querySelector('.btn-date-edit');
            const input = cell.querySelector('.date-input');
            if (!form || !view || !editBtn || !input)
                return;
            const newDate = input.value;
            const reservationId = editBtn.dataset.reservationId;
            if (!reservationId)
                return;
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({
                    reservation_id: parseInt(reservationId, 10),
                    new_date: newDate,
                }),
            })
                .then((r) => r.json())
                .then((data) => {
                if (data.success && data.new_date) {
                    editBtn.textContent = data.new_date;
                    editBtn.dataset.date = data.new_date;
                    view.style.display = '';
                    form.style.display = 'none';
                }
                else {
                    alert(data.error || '更新に失敗しました');
                }
            })
                .catch(() => {
                alert('通信エラーが発生しました');
            });
        });
    });
    // ---- 時間編集 ----
    document.querySelectorAll('.btn-time-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell');
            if (!cell)
                return;
            const form = cell.querySelector('.time-edit-form');
            const view = cell.querySelector('.time-view');
            const input = cell.querySelector('.time-input');
            if (!form || !view || !input)
                return;
            input.value = normalizeTimeToSlot(btn.dataset.time || '10:00');
            view.style.display = 'none';
            form.style.display = 'inline-block';
        });
    });
    document.querySelectorAll('.btn-time-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell');
            if (!cell)
                return;
            const view = cell.querySelector('.time-view');
            const form = cell.querySelector('.time-edit-form');
            if (view)
                view.style.display = '';
            if (form)
                form.style.display = 'none';
        });
    });
    document.querySelectorAll('.btn-time-save').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell');
            if (!cell)
                return;
            const form = cell.querySelector('.time-edit-form');
            const view = cell.querySelector('.time-view');
            const editBtn = view === null || view === void 0 ? void 0 : view.querySelector('.btn-time-edit');
            const input = cell.querySelector('.time-input');
            if (!form || !view || !editBtn || !input)
                return;
            const newTime = input.value;
            const reservationId = editBtn.dataset.reservationId;
            if (!reservationId)
                return;
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({
                    reservation_id: parseInt(reservationId, 10),
                    new_time: newTime,
                }),
            })
                .then((r) => r.json())
                .then((data) => {
                if (data.success && data.new_time) {
                    editBtn.textContent = formatTimeForDisplay(data.new_time);
                    editBtn.dataset.time = data.new_time;
                    view.style.display = '';
                    form.style.display = 'none';
                }
                else {
                    alert(data.error || '更新に失敗しました');
                }
            })
                .catch(() => {
                alert('通信エラーが発生しました');
            });
        });
    });
    // ---- テストメール送信 ----
    if (sendTestReminderUrl) {
        document.querySelectorAll('.btn-send-test-reminder').forEach((btn) => {
            btn.addEventListener('click', () => {
                const reservationId = btn.dataset.reservationId;
                if (!reservationId)
                    return;
                btn.disabled = true;
                fetch(sendTestReminderUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') || '',
                    },
                    body: JSON.stringify({
                        reservation_id: parseInt(reservationId, 10),
                    }),
                })
                    .then((r) => r.json())
                    .then((data) => {
                    if (data.success) {
                        alert(data.message || 'テストメールを送信しました');
                    }
                    else {
                        alert(data.error || '送信に失敗しました');
                    }
                })
                    .catch(() => {
                    alert('通信エラーが発生しました');
                })
                    .then(() => {
                    btn.disabled = false;
                });
            });
        });
    }
}
document.addEventListener('DOMContentLoaded', initReserveEdit);
