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
const submitBtn = document.querySelector('.submit-btn');
// 予約作成の非同期処理
const createReservation = () => __awaiter(void 0, void 0, void 0, function* () {
    // SP版とPC版の両方のhidden input要素を取得
    let selectedDate = null;
    let selectedTime = null;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    if (window.innerWidth < 768) {
        selectedDate = document.getElementById('selected-date-input');
        selectedTime = document.getElementById('selected-time-input');
    }
    else {
        selectedDate = document.getElementById('selected-date-input-pc');
        selectedTime = document.getElementById('selected-time-input-pc');
    }
    const dateValue = selectedDate === null || selectedDate === void 0 ? void 0 : selectedDate.value;
    const timeValue = selectedTime === null || selectedTime === void 0 ? void 0 : selectedTime.value;
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
// 予約表示を更新
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
// 非同期処理の型定義
const MyAsync = (actionName, task, dateStr, timeStr) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${actionName}を開始します...`);
    try {
        console.log("-------------------------------- 成功です --------------------------------");
        const response = yield task();
        if (response.ok) {
            console.log("-------------------------------- 成功です --------------------------------");
            if (actionName === '予約作成' && dateStr && timeStr)
                updateDisplay(dateStr, timeStr);
            alert(`${actionName}に成功しました！`);
        }
        else {
            console.log("-------------------------------- サーバーエラーです --------------------------------");
        }
    }
    catch (error) {
        console.error(error);
        console.log("-------------------------------- 失敗です --------------------------------");
    }
});
// 予約登録のボタンクリックで非同期処理を実行
submitBtn.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const date = (window.innerWidth < 768 ?
        document.getElementById('selected-date-input') :
        document.getElementById('selected-date-input-pc'));
    const time = (window.innerWidth < 768 ?
        document.getElementById('selected-time-input') :
        document.getElementById('selected-time-input-pc'));
    yield MyAsync('予約作成', createReservation, date === null || date === void 0 ? void 0 : date.value, time === null || time === void 0 ? void 0 : time.value);
}));
