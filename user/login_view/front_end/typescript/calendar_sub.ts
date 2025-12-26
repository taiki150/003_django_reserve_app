const today: Date = new Date();
const year: number = today.getFullYear();
const date: number = today.getDate();
const month: number = today.getMonth();

// 今月の1日を取得 + 曜日の取得
const firstDate: Date = new Date(year, month, 1);
const firstDay: number = firstDate.getDay();
const header2: HTMLElement | null = document.getElementById('month-year');

const calendarDays: HTMLElement | null = document.getElementById('calendar-days');

// カレンダーの空白調整
for (let i: number = 0; i < firstDay; i++) {
    const emptyDiv: HTMLDivElement = document.createElement('div');
    emptyDiv.classList.add('calendar-day', 'empty-day', 'past-date'); 
    calendarDays?.appendChild(emptyDiv);
}
if (header2) {
    header2.textContent = `${year}年 ${month + 1}月`;
}

// detail.htmlで使用する関数



// idを元に一致するyy-mm-dd-を取得し、変数に格納(yyyymmdd形式)
// 以下のコードは不要のため削除（hidePastReservations関数で実装済み）
// const todayYMD: string = `${year}-${month + 1}-${date}`;
// 以下のコードは不要のため削除（hidePastReservations関数で実装済み）






// 個別のBoxをチェックして過去の予約を非表示にする関数
// Boxのidを引数として受け取り、そのBoxだけをチェック
function checkPastReservation(boxId: string): void {
    const box: HTMLElement | null = document.getElementById(boxId);
    if (!box) return;
    
    const dateStr: string | null = box.getAttribute('data-date');
    if (!dateStr) return;
    
    const todayForCheck: Date = new Date();
    todayForCheck.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定して日付のみで比較
    
    // data-dateから日付を取得（形式: "YYYY-MM-DD"）
    const [year, month, day] = dateStr.split('-').map(Number);
    const reservationDate: Date = new Date(year, month - 1, day);
    reservationDate.setHours(0, 0, 0, 0);
    
    // 今日より前の日付の場合、.past-dateクラスを追加して非表示にする
    if (reservationDate < todayForCheck) {
        box.classList.add('past-date');
    } else {
        // 今日以降の場合は.past-dateクラスを削除（表示する）
        box.classList.remove('past-date');
    }
}