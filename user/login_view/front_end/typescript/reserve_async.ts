interface Window {
    reservedDates?: string[];
    reservedTimesByDate?: { [date: string]: string[] };
}

// 予約作成の非同期処理
const createReservation = async (dateValue: string, timeValue: string) => {
    const csrfToken = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement)?.value;
    
    if (!csrfToken) {
        throw new Error('CSRFトークンが見つかりません');
    }
    
    if (!dateValue || !timeValue) {
        throw new Error('日付または時間が選択されていません');
    }
    
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
        const response = await task();

        if (response.ok) {
            console.log("-------------------------------- 成功です --------------------------------");
            if (actionName === '予約作成' && dateStr && timeStr) updateDisplay(dateStr, timeStr);
            alert(`${actionName}に成功しました！`);
        } else {
            // エラーレスポンスの詳細を取得
            const errorData = await response.json().catch(() => ({ error: 'エラーの詳細を取得できませんでした' }));
            console.error("-------------------------------- サーバーエラーです --------------------------------");
            console.error("ステータス:", response.status);
            console.error("エラー内容:", errorData);
            alert(`${actionName}に失敗しました: ${errorData.error || 'サーバーエラーが発生しました'}`);
        }
        
    }catch(error){
        console.error("-------------------------------- 失敗です --------------------------------");
        console.error(error);
        alert(`${actionName}に失敗しました: ${error instanceof Error ? error.message : '予期しないエラーが発生しました'}`);
    }
}

// 予約登録のボタンクリックで非同期処理を実行（イベント委譲を使用）
// PC版・スマホ版どちらのボタンがクリックされても同じ処理を実行
document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    // .submit-btnがクリックされた場合のみ処理を実行
    if (target.classList.contains('submit-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // クリックされたボタンが含まれるformを取得
        const form = target.closest('form') as HTMLFormElement;
        if (!form) return;

        // IDではなく名前（name属性）で探すと、そのフォーム専用の入力欄が確実に取れます

        
        // form内のhidden inputから日付と時間を取得
        // スマホ版: selected-date-input, selected-time-input
        // PC版: selected-date-input-pc, selected-time-input-pc
        const dateInput = form.querySelector('[name="selected_date"]') as HTMLInputElement;
        const timeInput = form.querySelector('[name="selected_time"]') as HTMLInputElement;
               
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
        
        // 日付と時間を引数として渡す
        await MyAsync('予約作成', () => createReservation(dateValue, timeValue), dateValue, timeValue);
    }
});