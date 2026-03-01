/**
 * 管理者用予約管理画面：予約日・予約時間のインライン編集
 */

function getCookie(name: string): string | null {
    let v: string | null = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach((c: string) => {
            c = c.trim();
            if (c.substring(0, name.length + 1) === name + '=') {
                v = decodeURIComponent(c.substring(name.length + 1));
            }
        });
    }
    return v;
}

const ALLOWED_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];

function formatTimeForDisplay(timeStr: string): string {
    return timeStr.replace(':', '：');
}

/** 時間を10〜14時の枠に正規化（分数は00に） */
function normalizeTimeToSlot(timeStr: string): string {
    const [h, m] = timeStr.split(':').map(Number);
    const hour = Math.min(14, Math.max(10, isNaN(h) ? 10 : h));
    return `${hour.toString().padStart(2, '0')}:00`;
}

function initReserveEdit(): void {
    const container = document.querySelector('[data-reserve-update-url]') as HTMLElement | null;
    if (!container) return;

    const apiUrl = container.dataset.reserveUpdateUrl;
    const sendTestReminderUrl = container.dataset.sendTestReminderUrl;
    if (!apiUrl) return;

    // ---- 日付編集 ----
    document.querySelectorAll<HTMLElement>('.btn-date-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell') as HTMLElement | null;
            if (!cell) return;
            const form = cell.querySelector('.date-edit-form') as HTMLElement | null;
            const view = cell.querySelector('.date-view') as HTMLElement | null;
            const input = cell.querySelector('.date-input') as HTMLInputElement | null;
            if (!form || !view || !input) return;
            input.value = btn.dataset.date || '';
            view.style.display = 'none';
            form.style.display = 'inline-block';
        });
    });

    document.querySelectorAll<HTMLElement>('.btn-date-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell') as HTMLElement | null;
            if (!cell) return;
            const view = cell.querySelector('.date-view') as HTMLElement | null;
            const form = cell.querySelector('.date-edit-form') as HTMLElement | null;
            if (view) view.style.display = '';
            if (form) form.style.display = 'none';
        });
    });

    document.querySelectorAll<HTMLElement>('.btn-date-save').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.date-cell') as HTMLElement | null;
            if (!cell) return;
            const form = cell.querySelector('.date-edit-form') as HTMLElement | null;
            const view = cell.querySelector('.date-view') as HTMLElement | null;
            const editBtn = view?.querySelector('.btn-date-edit') as HTMLElement | null;
            const input = cell.querySelector('.date-input') as HTMLInputElement | null;
            if (!form || !view || !editBtn || !input) return;

            const newDate = input.value;
            const reservationId = editBtn.dataset.reservationId;
            if (!reservationId) return;

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
                .then((data: { success: boolean; new_date?: string; error?: string }) => {
                    if (data.success && data.new_date) {
                        editBtn.textContent = data.new_date;
                        editBtn.dataset.date = data.new_date;
                        view.style.display = '';
                        form.style.display = 'none';
                    } else {
                        alert(data.error || '更新に失敗しました');
                    }
                })
                .catch(() => {
                    alert('通信エラーが発生しました');
                });
        });
    });

    // ---- 時間編集 ----
    document.querySelectorAll<HTMLElement>('.btn-time-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell') as HTMLElement | null;
            if (!cell) return;
            const form = cell.querySelector('.time-edit-form') as HTMLElement | null;
            const view = cell.querySelector('.time-view') as HTMLElement | null;
            const input = cell.querySelector('.time-input') as HTMLSelectElement | null;
            if (!form || !view || !input) return;
            input.value = normalizeTimeToSlot(btn.dataset.time || '10:00');
            view.style.display = 'none';
            form.style.display = 'inline-block';
        });
    });

    document.querySelectorAll<HTMLElement>('.btn-time-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell') as HTMLElement | null;
            if (!cell) return;
            const view = cell.querySelector('.time-view') as HTMLElement | null;
            const form = cell.querySelector('.time-edit-form') as HTMLElement | null;
            if (view) view.style.display = '';
            if (form) form.style.display = 'none';
        });
    });

    document.querySelectorAll<HTMLElement>('.btn-time-save').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cell = btn.closest('.time-cell') as HTMLElement | null;
            if (!cell) return;
            const form = cell.querySelector('.time-edit-form') as HTMLElement | null;
            const view = cell.querySelector('.time-view') as HTMLElement | null;
            const editBtn = view?.querySelector('.btn-time-edit') as HTMLElement | null;
            const input = cell.querySelector('.time-input') as HTMLSelectElement | null;
            if (!form || !view || !editBtn || !input) return;

            const newTime = input.value;
            const reservationId = editBtn.dataset.reservationId;
            if (!reservationId) return;

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
                .then((data: { success: boolean; new_time?: string; error?: string }) => {
                    if (data.success && data.new_time) {
                        editBtn.textContent = formatTimeForDisplay(data.new_time);
                        editBtn.dataset.time = data.new_time;
                        view.style.display = '';
                        form.style.display = 'none';
                    } else {
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
        document.querySelectorAll<HTMLButtonElement>('.btn-send-test-reminder').forEach((btn) => {
            btn.addEventListener('click', () => {
                const reservationId = btn.dataset.reservationId;
                if (!reservationId) return;
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
                    .then((data: { success: boolean; message?: string; error?: string }) => {
                        if (data.success) {
                            alert(data.message || 'テストメールを送信しました');
                        } else {
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
