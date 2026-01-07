"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 予約作成の非同期処理
const createReservation = (dateValue, timeValue) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const csrfToken = (_a = document.querySelector('[name=csrfmiddlewaretoken]')) === null || _a === void 0 ? void 0 : _a.value;
    if (!csrfToken) {
        throw new Error('CSRFトークンが見つかりません');
    }
    if (!dateValue || !timeValue) {
        throw new Error('日付または時間が選択されていません');
    }
    return yield fetch('/reserve/api/reservation/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            selected_date: dateValue,
            selected_time: timeValue,
        }),
    });
});
// 予約更新の非同期処理
const updateReservation = (oldDate, oldTime, newDate, newTime) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const csrfToken = (_a = document.querySelector('[name=csrfmiddlewaretoken]')) === null || _a === void 0 ? void 0 : _a.value;
    if (!csrfToken) {
        throw new Error('CSRFトークンが見つかりません');
    }
    if (!oldDate || !oldTime || !newDate || !newTime) {
        throw new Error('日付または時間が選択されていません');
    }
    const requestBody = {
        old_date: oldDate,
        old_time: oldTime,
        new_date: newDate,
        new_time: newTime,
    };
    const response = yield fetch('/reserve/api/reservation/update/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(requestBody),
    });
    return response;
});
// 予約削除の非同期処理
const deleteReservation = (date, time) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const csrfToken = (_a = document.querySelector('[name=csrfmiddlewaretoken]')) === null || _a === void 0 ? void 0 : _a.value;
    if (!csrfToken) {
        throw new Error('CSRFトークンが見つかりません');
    }
    if (!date || !time) {
        throw new Error('日付または時間が選択されていません');
    }
    const requestBody = {
        date: date,
        time: time,
    };
    const response = yield fetch('/reserve/api/reservation/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(requestBody),
    });
    return response;
});
// 予約表示を更新（新規作成用）
const updateDisplay = (dateStr, timeStr) => {
    var _a;
    if (!window.reservedDates)
        window.reservedDates = [];
    if (!window.reservedDates.includes(dateStr))
        window.reservedDates.push(dateStr);
    if (!window.reservedTimesByDate)
        window.reservedTimesByDate = {};
    if (!window.reservedTimesByDate[dateStr])
        window.reservedTimesByDate[dateStr] = [];
    if (!window.reservedTimesByDate[dateStr].includes(timeStr))
        window.reservedTimesByDate[dateStr].push(timeStr);
    (_a = document.querySelector(`.calendar-day[data-date="${dateStr}"]`)) === null || _a === void 0 ? void 0 : _a.classList.add('reserved-date');
    const selectedDay = document.querySelector('.calendar-day.selected');
    if (selectedDay) {
        const y = selectedDay.getAttribute('data-year'), m = selectedDay.getAttribute('data-month'), d = selectedDay.getAttribute('data-day');
        if (`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` === dateStr) {
            document.querySelectorAll('.time-btn').forEach((btn) => {
                if (btn.getAttribute('data-time') === timeStr && !btn.querySelector('.reserved-badge')) {
                    btn.disabled = true;
                    btn.classList.add('reserved-time');
                    const span = document.createElement('span');
                    span.className = 'reserved-badge';
                    span.textContent = '予約済';
                    btn.appendChild(span);
                }
            });
        }
    }
};
// 予約表示を更新（削除用：予約を表示から削除）
const updateDisplayForDelete = (dateStr, timeStr) => {
    var _a, _b, _c;
    // 予約済みデータから削除
    if (window.reservedTimesByDate && window.reservedTimesByDate[dateStr]) {
        const index = window.reservedTimesByDate[dateStr].indexOf(timeStr);
        if (index > -1) {
            window.reservedTimesByDate[dateStr].splice(index, 1);
        }
        // その日付に予約がなくなった場合、日付リストからも削除
        if (window.reservedTimesByDate[dateStr].length === 0) {
            delete window.reservedTimesByDate[dateStr];
            const dateIndex = (_a = window.reservedDates) === null || _a === void 0 ? void 0 : _a.indexOf(dateStr);
            if (dateIndex !== undefined && dateIndex > -1) {
                (_b = window.reservedDates) === null || _b === void 0 ? void 0 : _b.splice(dateIndex, 1);
            }
            (_c = document.querySelector(`.calendar-day[data-date="${dateStr}"]`)) === null || _c === void 0 ? void 0 : _c.classList.remove('reserved-date');
        }
    }
    // 時間ボタンから予約済みバッジを削除
    document.querySelectorAll('.time-btn').forEach((btn) => {
        if (btn.getAttribute('data-time') === timeStr) {
            const badge = btn.querySelector('.reserved-badge');
            if (badge)
                badge.remove();
            btn.disabled = false;
            btn.classList.remove('reserved-time');
        }
    });
    // リストから該当項目を削除
    const timeId = timeStr.replace(':', '-'); // "10:00" → "10-00"
    const deleteBtnId = `${dateStr}-${timeId}-delete-btn`;
    const deleteBtn = document.querySelector(`[id="${deleteBtnId}"]`);
    if (deleteBtn) {
        const listItem = deleteBtn.closest('li');
        if (listItem) {
            const listBoxContainer = listItem.closest('.list-box-container');
            listItem.remove();
            // その日付の予約が全てなくなった場合、日付コンテナも削除
            if (listBoxContainer) {
                const remainingItems = listBoxContainer.querySelectorAll('li');
                if (remainingItems.length === 0) {
                    listBoxContainer.remove();
                }
            }
        }
    }
};
// 予約表示を更新（更新用：古い予約を削除し、新しい予約を追加）
const updateDisplayForEdit = (oldDateStr, oldTimeStr, newDateStr, newTimeStr) => {
    var _a, _b, _c;
    // 古い予約を表示から削除
    if (window.reservedTimesByDate && window.reservedTimesByDate[oldDateStr]) {
        const index = window.reservedTimesByDate[oldDateStr].indexOf(oldTimeStr);
        if (index > -1) {
            window.reservedTimesByDate[oldDateStr].splice(index, 1);
        }
        // その日付に予約がなくなった場合、日付リストからも削除
        if (window.reservedTimesByDate[oldDateStr].length === 0) {
            delete window.reservedTimesByDate[oldDateStr];
            const dateIndex = (_a = window.reservedDates) === null || _a === void 0 ? void 0 : _a.indexOf(oldDateStr);
            if (dateIndex !== undefined && dateIndex > -1) {
                (_b = window.reservedDates) === null || _b === void 0 ? void 0 : _b.splice(dateIndex, 1);
            }
            (_c = document.querySelector(`.calendar-day[data-date="${oldDateStr}"]`)) === null || _c === void 0 ? void 0 : _c.classList.remove('reserved-date');
        }
    }
    // 古い予約の時間ボタンから予約済みバッジと編集マークを削除
    document.querySelectorAll('.time-btn').forEach((btn) => {
        if (btn.getAttribute('data-time') === oldTimeStr) {
            const badge = btn.querySelector('.reserved-badge');
            if (badge)
                badge.remove();
            btn.classList.remove('reserved-time', 'editing-time', 'selected');
            btn.disabled = false;
        }
    });
    // 同じ日付内で時間を変更した場合、時間ボタンの状態を更新
    if (oldDateStr === newDateStr && window.updateTimeButtons) {
        const selectedDay = document.querySelector('.calendar-day.selected');
        if (selectedDay) {
            const year = parseInt(selectedDay.getAttribute('data-year') || '0');
            const month = parseInt(selectedDay.getAttribute('data-month') || '0');
            const day = parseInt(selectedDay.getAttribute('data-day') || '0');
            window.updateTimeButtons({ year: year, month: month, day: day });
        }
    }
    // 新しい予約を表示に追加
    updateDisplayForNewReservation(newDateStr, newTimeStr, oldDateStr);
};
// 予約表示を更新（編集用：新しい予約を追加、日付が変わった場合は日付も選択）
const updateDisplayForNewReservation = (newDateStr, newTimeStr, oldDateStr) => {
    var _a;
    // 予約済みデータを更新
    if (!window.reservedDates)
        window.reservedDates = [];
    if (!window.reservedDates.includes(newDateStr))
        window.reservedDates.push(newDateStr);
    if (!window.reservedTimesByDate)
        window.reservedTimesByDate = {};
    if (!window.reservedTimesByDate[newDateStr])
        window.reservedTimesByDate[newDateStr] = [];
    if (!window.reservedTimesByDate[newDateStr].includes(newTimeStr))
        window.reservedTimesByDate[newDateStr].push(newTimeStr);
    // カレンダーの日付に予約済みマークを追加
    (_a = document.querySelector(`.calendar-day[data-date="${newDateStr}"]`)) === null || _a === void 0 ? void 0 : _a.classList.add('reserved-date');
    // 日付が変わった場合、新しい日付を選択状態にする
    const selectedDay = document.querySelector('.calendar-day.selected');
    const currentSelectedDate = selectedDay ?
        `${selectedDay.getAttribute('data-year')}-${String(selectedDay.getAttribute('data-month')).padStart(2, '0')}-${String(selectedDay.getAttribute('data-day')).padStart(2, '0')}` :
        null;
    if (oldDateStr && newDateStr !== oldDateStr) {
        // 日付が変わった場合：新しい日付を選択状態にする
        const newDayElement = document.querySelector(`.calendar-day[data-date="${newDateStr}"]`);
        if (newDayElement) {
            document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
            newDayElement.classList.add('selected');
            const [year, month, day] = newDateStr.split('-').map(Number);
            // 時間パネルを表示（showTimeSelectionPanelが利用可能な場合）
            if (window.showTimeSelectionPanel) {
                window.showTimeSelectionPanel({ year: year, month: month, day: day });
            }
        }
    }
    else {
        // 同じ日付内で時間を変更した場合、時間ボタンの状態を更新
        if (window.updateTimeButtons) {
            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                const year = parseInt(selectedDay.getAttribute('data-year') || '0');
                const month = parseInt(selectedDay.getAttribute('data-month') || '0');
                const day = parseInt(selectedDay.getAttribute('data-day') || '0');
                window.updateTimeButtons({ year: year, month: month, day: day });
            }
        }
    }
    // 新しい予約の時間ボタンに予約済みバッジを追加（updateTimeButtonsで更新された後でも確実に追加）
    setTimeout(() => {
        document.querySelectorAll('.time-btn').forEach((btn) => {
            const timeStr = btn.getAttribute('data-time');
            if (timeStr === newTimeStr) {
                // 既存のバッジを削除してから追加（重複を防ぐ）
                const existingBadge = btn.querySelector('.reserved-badge');
                if (existingBadge)
                    existingBadge.remove();
                btn.disabled = true;
                btn.classList.add('reserved-time');
                btn.classList.remove('editing-time'); // 編集マークを削除
                const span = document.createElement('span');
                span.className = 'reserved-badge';
                span.textContent = '予約済';
                btn.appendChild(span);
            }
        });
    }, 100);
};
// 非同期処理の型定義
const MyAsync = (actionName, task, dateStr, timeStr) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield task();
        // レスポンスのJSONを一度だけ取得
        let responseData = {};
        try {
            responseData = yield response.json();
        }
        catch (e) {
            // JSON解析に失敗した場合は空オブジェクトを使用
            responseData = {};
        }
        if (response.ok) {
            if (actionName === '予約作成' && dateStr && timeStr) {
                updateDisplay(dateStr, timeStr);
            }
            else if (actionName === '予約更新') {
                // 予約更新の場合はレスポンスから古い日付・時間と新しい日付・時間を取得
                if (responseData.old_date && responseData.old_time && responseData.new_date && responseData.new_time) {
                    updateDisplayForEdit(responseData.old_date, responseData.old_time, responseData.new_date, responseData.new_time);
                    // window.editingReservationを新しい値に更新
                    window.editingReservation = {
                        date: responseData.new_date,
                        time: responseData.new_time
                    };
                }
            }
            else if (actionName === '予約削除') {
                // 予約削除の場合はレスポンスから日付・時間を取得
                if (responseData.date && responseData.time) {
                    updateDisplayForDelete(responseData.date, responseData.time);
                }
            }
            alert(`${actionName}に成功しました！`);
        }
        else {
            alert(`${actionName}に失敗しました: ${responseData.error || 'サーバーエラーが発生しました'}`);
        }
    }
    catch (error) {
        alert(`${actionName}に失敗しました: ${error instanceof Error ? error.message : '予期しないエラーが発生しました'}`);
    }
});
// 予約登録のボタンクリックで非同期処理を実行（イベント委譲を使用）
// PC版・スマホ版どちらのボタンがクリックされても同じ処理を実行
document.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
    const target = e.target;
    // .submit-btnがクリックされた場合のみ処理を実行
    if (target.classList.contains('submit-btn')) {
        e.preventDefault();
        e.stopPropagation();
        // クリックされたボタンが含まれるformを取得
        const form = target.closest('form');
        if (!form)
            return;
        // IDではなく名前（name属性）で探すと、そのフォーム専用の入力欄が確実に取れます
        // form内のhidden inputから日付と時間を取得
        // スマホ版: selected-date-input, selected-time-input
        // PC版: selected-date-input-pc, selected-time-input-pc
        const dateInput = form.querySelector('[name="selected_date"]');
        const timeInput = form.querySelector('[name="selected_time"]');
        if (!dateInput || !timeInput) {
            alert('日付または時間が選択されていません');
            return;
        }
        const dateValue = dateInput.value;
        const timeValue = timeInput.value;
        if (!dateValue || !timeValue) {
            alert('日付または時間が選択されていません');
            return;
        }
        // 編集モードかどうかをチェック
        if (window.editingReservation) {
            // 編集モード：予約を更新
            const oldDate = window.editingReservation.date;
            const oldTime = window.editingReservation.time;
            // 日付または時間が変更されているかチェック
            const isDateChanged = oldDate !== dateValue;
            const isTimeChanged = oldTime !== timeValue;
            // 変更がある場合のみ確認ダイアログを表示
            if (isDateChanged || isTimeChanged) {
                // 日付を表示形式に変換（YYYY-MM-DD → M月D日）
                const formatDate = (dateStr) => {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    return `${month}月${day}日`;
                };
                // 時間を表示形式に変換（HH:MM → H時）
                const formatTime = (timeStr) => {
                    const [hour] = timeStr.split(':').map(Number);
                    return `${hour}時`;
                };
                const oldDateDisplay = formatDate(oldDate);
                const oldTimeDisplay = formatTime(oldTime);
                const newDateDisplay = formatDate(dateValue);
                const newTimeDisplay = formatTime(timeValue);
                const confirmMessage = `${oldDateDisplay}${oldTimeDisplay}を${newDateDisplay}${newTimeDisplay}に変更してもよろしいですか？`;
                if (!confirm(confirmMessage)) {
                    return; // キャンセルされた場合は処理を中断
                }
            }
            yield MyAsync('予約更新', () => updateReservation(oldDate, oldTime, dateValue, timeValue));
            // 編集モードをリセット（カレンダーは開いたまま）
            // 編集が完了した後もカレンダーを開いたままにするため、ここではリセットしない
            // カレンダーを閉じる時にリセットされる
        }
        else {
            // 新規作成モード：予約を作成
            yield MyAsync('予約作成', () => createReservation(dateValue, timeValue), dateValue, timeValue);
        }
    }
}));
// グローバルに公開
window.deleteReservation = deleteReservation;
window.MyAsync = MyAsync;
// グローバルに公開
window.deleteReservation = deleteReservation;
window.MyAsync = MyAsync;
