interface Window {
    reservedDates?: string[];
    reservedTimesByDate?: { [date: string]: string[] };
}

const submitBtn = document.querySelector('.submit-btn') as HTMLButtonElement;

// 予約作成の非同期処理
const createReservation = async () => {
    // SP版とPC版の両方のhidden input要素を取得
    let selectedDate: HTMLInputElement | null = null;
    let selectedTime: HTMLInputElement | null = null;
    const csrfToken = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement).value;

    if(window.innerWidth < 768){
        selectedDate = document.getElementById('selected-date-input') as HTMLInputElement | null;
        selectedTime = document.getElementById('selected-time-input') as HTMLInputElement | null;
    }else{
        selectedDate = document.getElementById('selected-date-input-pc') as HTMLInputElement | null;
        selectedTime = document.getElementById('selected-time-input-pc') as HTMLInputElement | null;
    }

    const dateValue = selectedDate?.value;
    const timeValue = selectedTime?.value;
    return await fetch('/reserve/api/reservation/create/',{
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
} 


// 予約表示を更新
const updateDisplay = (dateStr: string, timeStr: string): void => {
    if (!window.reservedDates) window.reservedDates = [];
    if (!window.reservedDates.includes(dateStr)) window.reservedDates.push(dateStr);
    if (!window.reservedTimesByDate) window.reservedTimesByDate = {};
    if (!window.reservedTimesByDate[dateStr]) window.reservedTimesByDate[dateStr] = [];
    if (!window.reservedTimesByDate[dateStr].includes(timeStr)) window.reservedTimesByDate[dateStr].push(timeStr);
    document.querySelector(`.calendar-day[data-date="${dateStr}"]`)?.classList.add('reserved-date');
    const selectedDay = document.querySelector('.calendar-day.selected') as HTMLElement | null;
    if (selectedDay) {
        const y = selectedDay.getAttribute('data-year'), m = selectedDay.getAttribute('data-month'), d = selectedDay.getAttribute('data-day');
        if (`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` === dateStr) {
            document.querySelectorAll('.time-btn').forEach((btn: Element) => {
                if (btn.getAttribute('data-time') === timeStr && !btn.querySelector('.reserved-badge')) {
                    (btn as HTMLButtonElement).disabled = true;
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
const MyAsync = async (actionName: string, task: () => Promise<Response>, dateStr?: string, timeStr?: string) => {
    console.log(`${actionName}を開始します...`);
    try{
        console.log("-------------------------------- 成功です --------------------------------");
        const response = await task();

        if (response.ok) {
            console.log("-------------------------------- 成功です --------------------------------");
            if (actionName === '予約作成' && dateStr && timeStr) updateDisplay(dateStr, timeStr);
            alert(`${actionName}に成功しました！`);
        } else {
            console.log("-------------------------------- サーバーエラーです --------------------------------");
        }
        
    }catch(error){
        console.error(error);
        console.log("-------------------------------- 失敗です --------------------------------");
    }
}

// 予約登録のボタンクリックで非同期処理を実行
submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const date = (window.innerWidth < 768 ? 
        document.getElementById('selected-date-input') : 
        document.getElementById('selected-date-input-pc')) as HTMLInputElement;
    const time = (window.innerWidth < 768 ? 
        document.getElementById('selected-time-input') : 
        document.getElementById('selected-time-input-pc')) as HTMLInputElement;
    await MyAsync('予約作成', createReservation, date?.value, time?.value);
});