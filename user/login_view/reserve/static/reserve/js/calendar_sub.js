"use strict";
// IIFEでスコープを分離してtodayForCalendarの重複宣言を防ぐ
(function () {
    const todayForCalendar = new Date();
    const year = todayForCalendar.getFullYear();
    const date = todayForCalendar.getDate();
    const month = todayForCalendar.getMonth();
    // 今月の1日を取得 + 曜日の取得
    const firstDate = new Date(year, month, 1);
    const firstDay = firstDate.getDay();
    const header2 = document.getElementById('month-year');
    const calendarDays = document.getElementById('calendar-days');
    // カレンダーの空白調整
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty-day', 'past-date');
        calendarDays === null || calendarDays === void 0 ? void 0 : calendarDays.appendChild(emptyDiv);
    }
    if (header2) {
        header2.textContent = `${year}年 ${month + 1}月`;
    }
})();
// detail.htmlで使用する関数
// idを元に一致するyy-mm-dd-を取得し、変数に格納(yyyymmdd形式)
// 以下のコードは不要のため削除（hidePastReservations関数で実装済み）
// const todayYMD: string = `${year}-${month + 1}-${date}`;
// 以下のコードは不要のため削除（hidePastReservations関数で実装済み）
// 個別のBoxをチェックして過去の予約を非表示にする関数
// Boxのidを引数として受け取り、そのBoxだけをチェック
function checkPastReservation(boxId) {
    const box = document.getElementById(boxId);
    if (!box)
        return;
    const dateStr = box.getAttribute('data-date');
    if (!dateStr)
        return;
    const todayForCheck = new Date();
    todayForCheck.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定して日付のみで比較
    // data-dateから日付を取得（形式: "YYYY-MM-DD"）
    const [year, month, day] = dateStr.split('-').map(Number);
    const reservationDate = new Date(year, month - 1, day);
    reservationDate.setHours(0, 0, 0, 0);
    // 今日より前の日付の場合、.past-dateクラスを追加して非表示にする
    if (reservationDate < todayForCheck) {
        box.classList.add('past-date');
    }
    else {
        // 今日以降の場合は.past-dateクラスを削除（表示する）
        box.classList.remove('past-date');
    }
}
