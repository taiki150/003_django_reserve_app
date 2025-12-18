var today: Date = new Date();
var year: number = today.getFullYear();
var month: number = today.getMonth();

// 今月の1日を取得 + 曜日の取得
var firstDate: Date = new Date(year, month, 1);
var firstDay: number = firstDate.getDay();
var header2: HTMLElement | null = document.getElementById('month-year');

var calendarDays: HTMLElement | null = document.getElementById('calendar-days');

// カレンダーの空白調整
for (let i: number = 0; i < firstDay; i++) {
    var emptyDiv: HTMLDivElement = document.createElement('div');
    
    emptyDiv.classList.add('calendar-day', 'empty-day', 'past-date'); 
    
    calendarDays?.appendChild(emptyDiv);
}

if (header2) {
    header2.textContent = `${year}年 ${month + 1}月`;
}