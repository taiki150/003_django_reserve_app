var today = new Date();
var year = today.getFullYear();
var month = today.getMonth();
// 今月の1日を取得 + 曜日の取得
var firstDate = new Date(year, month, 1);
var firstDay = firstDate.getDay();
var header2 = document.getElementById('month-year');
var calendarDays = document.getElementById('calendar-days');
// カレンダーの空白調整
for (var i = 0; i < firstDay; i++) {
    var emptyDiv = document.createElement('div');
    emptyDiv.classList.add('calendar-day', 'empty-day', 'past-date');
    calendarDays === null || calendarDays === void 0 ? void 0 : calendarDays.appendChild(emptyDiv);
}
if (header2) {
    header2.textContent = "".concat(year, "\u5E74 ").concat(month + 1, "\u6708");
}
