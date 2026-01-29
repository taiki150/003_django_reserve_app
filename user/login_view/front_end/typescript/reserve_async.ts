interface Window {
    reservedDates?: string[];
    reservedTimesByDate?: { [date: string]: string[] };
    editingReservation?: { date: string, time: string } | null;

    // detail.html 絞り込みカレンダーで使用(jQuery)
    selectedStartDate?: string;
    selectedEndDate?: string;
}

interface ReserveSearchData {
    startDate: string;
    endDate: string;
    times: string[];
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

// 予約更新の非同期処理
const updateReservation = async (oldDate: string, oldTime: string, newDate: string, newTime: string) => {
    const csrfToken = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement)?.value;
    
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
    
    const response = await fetch('/reserve/api/reservation/update/',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(requestBody),
    });
    
    return response;
} 

// 予約削除の非同期処理
const deleteReservation = async (date: string, time: string) => {
    const csrfToken = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement)?.value;
    
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
    
    const response = await fetch('/reserve/api/reservation/delete/',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(requestBody),
    });
    
    return response;
} 

// 検索機能の非同期処理
const searchReservation = async (target: HTMLElement) => {
    const csrfToken = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement)?.value;

    // 時間の絞り込みした際の処理
    if(target.classList.contains('label')){
        const targetLabel = target as HTMLLabelElement;
        const targetForm = document.getElementById(targetLabel.htmlFor) as HTMLInputElement;
        
        // 時間の絞り込みを選択した際の処理
        if(!targetForm.checked){
            times.push(target.innerText);
            
            // 時間の選択を解除した際の処理
        }else{
            times = times.filter(time => time !== target.innerText);  
        }

    // カレンダーで日付範囲をした際の処理
    }else if(target.classList.contains('applyBtn')){
        startTime = window.selectedStartDate;
        endTime = window.selectedEndDate;
        if(startTime === undefined || endTime === undefined){
            return; // クリックイベントの中断
        }
    }

    const requestBody = {
        start_date: startTime,
        end_date: endTime,
        times: times
    };
    
    const response = await fetch('/reserve/api/reservation/search/',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    console.log(result);

    updateDisplaySearch(result)

    return response;

    
};

/*
 *
 * 表示の更新に関する関数定義
 * 
 * ▽▽▽　▽▽▽　▽▽▽　▽▽▽ */


// 予約表示を更新（新規作成用）
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

// 予約表示を更新（削除用：予約を表示から削除）
const updateDisplayForDelete = (dateStr: string, timeStr: string): void => {
    // 予約済みデータから削除
    if (window.reservedTimesByDate && window.reservedTimesByDate[dateStr]) {
        const index = window.reservedTimesByDate[dateStr].indexOf(timeStr);
        if (index > -1) {
            window.reservedTimesByDate[dateStr].splice(index, 1);
        }
        // その日付に予約がなくなった場合、日付リストからも削除
        if (window.reservedTimesByDate[dateStr].length === 0) {
            delete window.reservedTimesByDate[dateStr];
            const dateIndex = window.reservedDates?.indexOf(dateStr);
            if (dateIndex !== undefined && dateIndex > -1) {
                window.reservedDates?.splice(dateIndex, 1);
            }
            document.querySelector(`.calendar-day[data-date="${dateStr}"]`)?.classList.remove('reserved-date');
        }
    }
    
    // 時間ボタンから予約済みバッジを削除
    document.querySelectorAll('.time-btn').forEach((btn: Element) => {
        if (btn.getAttribute('data-time') === timeStr) {
            const badge = btn.querySelector('.reserved-badge');
            if (badge) badge.remove();
            (btn as HTMLButtonElement).disabled = false;
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
const updateDisplayForEdit = (oldDateStr: string, oldTimeStr: string, newDateStr: string, newTimeStr: string): void => {
    // 古い予約を表示から削除
    if (window.reservedTimesByDate && window.reservedTimesByDate[oldDateStr]) {
        const index = window.reservedTimesByDate[oldDateStr].indexOf(oldTimeStr);
        if (index > -1) {
            window.reservedTimesByDate[oldDateStr].splice(index, 1);
        }
        // その日付に予約がなくなった場合、日付リストからも削除
        if (window.reservedTimesByDate[oldDateStr].length === 0) {
            delete window.reservedTimesByDate[oldDateStr];
            const dateIndex = window.reservedDates?.indexOf(oldDateStr);
            if (dateIndex !== undefined && dateIndex > -1) {
                window.reservedDates?.splice(dateIndex, 1);
            }
            document.querySelector(`.calendar-day[data-date="${oldDateStr}"]`)?.classList.remove('reserved-date');
        }
    }
    
    // 古い予約の時間ボタンから予約済みバッジと編集マークを削除
    document.querySelectorAll('.time-btn').forEach((btn: Element) => {
        if (btn.getAttribute('data-time') === oldTimeStr) {
            const badge = btn.querySelector('.reserved-badge');
            if (badge) badge.remove();
            btn.classList.remove('reserved-time', 'editing-time', 'selected');
            (btn as HTMLButtonElement).disabled = false;
        }
    });
    
    // 同じ日付内で時間を変更した場合、時間ボタンの状態を更新
    if (oldDateStr === newDateStr && (window as any).updateTimeButtons) {
        const selectedDay = document.querySelector('.calendar-day.selected') as HTMLElement | null;
        if (selectedDay) {
            const year = parseInt(selectedDay.getAttribute('data-year') || '0');
            const month = parseInt(selectedDay.getAttribute('data-month') || '0');
            const day = parseInt(selectedDay.getAttribute('data-day') || '0');
            (window as any).updateTimeButtons({ year: year, month: month, day: day });
        }
    }
    
    // 新しい予約を表示に追加
    updateDisplayForNewReservation(newDateStr, newTimeStr, oldDateStr);
};

// 予約表示を更新（編集用：新しい予約を追加、日付が変わった場合は日付も選択）
const updateDisplayForNewReservation = (newDateStr: string, newTimeStr: string, oldDateStr?: string): void => {
    // 予約済みデータを更新
    if (!window.reservedDates) window.reservedDates = [];
    if (!window.reservedDates.includes(newDateStr)) window.reservedDates.push(newDateStr);
    if (!window.reservedTimesByDate) window.reservedTimesByDate = {};
    if (!window.reservedTimesByDate[newDateStr]) window.reservedTimesByDate[newDateStr] = [];
    if (!window.reservedTimesByDate[newDateStr].includes(newTimeStr)) window.reservedTimesByDate[newDateStr].push(newTimeStr);
    
    // カレンダーの日付に予約済みマークを追加
    document.querySelector(`.calendar-day[data-date="${newDateStr}"]`)?.classList.add('reserved-date');
    
    // 日付が変わった場合、新しい日付を選択状態にする
    const selectedDay = document.querySelector('.calendar-day.selected') as HTMLElement | null;
    const currentSelectedDate = selectedDay ? 
        `${selectedDay.getAttribute('data-year')}-${String(selectedDay.getAttribute('data-month')).padStart(2, '0')}-${String(selectedDay.getAttribute('data-day')).padStart(2, '0')}` : 
        null;
    
    if (oldDateStr && newDateStr !== oldDateStr) {
        // 日付が変わった場合：新しい日付を選択状態にする
        const newDayElement = document.querySelector(`.calendar-day[data-date="${newDateStr}"]`) as HTMLElement;
        if (newDayElement) {
            document.querySelectorAll('.calendar-day.selected').forEach((el: Element) => el.classList.remove('selected'));
            newDayElement.classList.add('selected');
            const [year, month, day] = newDateStr.split('-').map(Number);
            // 時間パネルを表示（showTimeSelectionPanelが利用可能な場合）
            if ((window as any).showTimeSelectionPanel) {
                (window as any).showTimeSelectionPanel({ year: year, month: month, day: day });
            }
        }
    } else {
        // 同じ日付内で時間を変更した場合、時間ボタンの状態を更新
        if ((window as any).updateTimeButtons) {
            const selectedDay = document.querySelector('.calendar-day.selected') as HTMLElement | null;
            if (selectedDay) {
                const year = parseInt(selectedDay.getAttribute('data-year') || '0');
                const month = parseInt(selectedDay.getAttribute('data-month') || '0');
                const day = parseInt(selectedDay.getAttribute('data-day') || '0');
                (window as any).updateTimeButtons({ year: year, month: month, day: day });
            }
        }
    }
    
    // 新しい予約の時間ボタンに予約済みバッジを追加（updateTimeButtonsで更新された後でも確実に追加）
    setTimeout(() => {
        document.querySelectorAll('.time-btn').forEach((btn: Element) => {
            const timeStr = btn.getAttribute('data-time');
            if (timeStr === newTimeStr) {
                // 既存のバッジを削除してから追加（重複を防ぐ）
                const existingBadge = btn.querySelector('.reserved-badge');
                if (existingBadge) existingBadge.remove();
                
                (btn as HTMLButtonElement).disabled = true;
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



// 検索結果の表示処理処理【非同期処理】
const updateDisplaySearch = (result: ReserveSearchData) => {
    const startDate: string = result.startDate;
    const endDate: string = result.endDate;
    const times: string[] = result.times;

    if(startDate && endDate){
        const listBoxes = document.querySelectorAll<HTMLDivElement>('.list-box-container');

        listBoxes.forEach((box) => {
            // 各Boxのdata-date属性の値を取得
            const boxDate = box.dataset.date;
            
            if(boxDate){
                // boxDateが検索した日付の期間内であればtrue
                const inDate = boxDate >= startDate && boxDate <= endDate

                if(inDate){
                    box.style.display = 'block';
                    
                }else{
                    box.style.display = 'none';
                }
            }

        });
        
    }

    if(times.length != 0){
        const timeListBoxes = document.querySelectorAll<HTMLDivElement>('.time-box');
        timeListBoxes.forEach((box) => {
            box.style.display = 'block';  // または元の表示状態に戻す
        });
        let count = 0;

        timeListBoxes.forEach((box) => {
            const timeText = box.dataset.time;

            if(timeText){
                if(times.includes(timeText)){
                    box.style.display = "block";
                }else{
                    box.style.display = "none";
                }
            }
        });
        
    }
    
    
}



/************************
 * 非同期処理の型
 ************************/
const MyAsync = async (actionName: string, task: () => Promise<Response>, dateStr?: string, timeStr?: string) => {
    try{
        const response = await task();
        
        // レスポンスのJSONを一度だけ取得
        let responseData: any = {};
        try {
            responseData = await response.json();
        } catch (e) {
            // JSON解析に失敗した場合は空オブジェクトを使用
            responseData = {};
        }

        if (response.ok) {
            if (actionName === '予約作成' && dateStr && timeStr) {
                updateDisplay(dateStr, timeStr);
            } else if (actionName === '予約更新') {
                // 予約更新の場合はレスポンスから古い日付・時間と新しい日付・時間を取得
                if (responseData.old_date && responseData.old_time && responseData.new_date && responseData.new_time) {
                    updateDisplayForEdit(
                        responseData.old_date,
                        responseData.old_time,
                        responseData.new_date,
                        responseData.new_time
                    );
                    // window.editingReservationを新しい値に更新
                    window.editingReservation = {
                        date: responseData.new_date,
                        time: responseData.new_time
                    };
                }
            } else if (actionName === '予約削除') {
                // 予約削除の場合はレスポンスから日付・時間を取得
                if (responseData.date && responseData.time) {
                    updateDisplayForDelete(responseData.date, responseData.time);
                }
            }
            alert(`${actionName}に成功しました！`);
        } else {
            alert(`${actionName}に失敗しました: ${responseData.error || 'サーバーエラーが発生しました'}`);
        }
        
    }catch(error){
        alert(`${actionName}に失敗しました: ${error instanceof Error ? error.message : '予期しないエラーが発生しました'}`);
    }
}

// 予約登録のボタンクリックで非同期処理を実行（イベント委譲を使用）
// PC版・スマホ版どちらのボタンがクリックされても同じ処理を実行
let times: string[] = [];
let startTime: string | undefined = undefined;
let endTime: string | undefined = undefined;
let searchData: {
    start_date?: string;
    end_date?: string;
    times: string[];
} = {
    start_date: undefined,
    end_date: undefined,
    times: []
};

document.addEventListener('click', async (e) => {
    const target = e.target as HTMLLabelElement | HTMLButtonElement;
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
                const formatDate = (dateStr: string): string => {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    return `${month}月${day}日`;
                };
                
                // 時間を表示形式に変換（HH:MM → H時）
                const formatTime = (timeStr: string): string => {
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
            
            await MyAsync('予約更新', () => updateReservation(oldDate, oldTime, dateValue, timeValue));
            // 編集モードをリセット（カレンダーは開いたまま）
            // 編集が完了した後もカレンダーを開いたままにするため、ここではリセットしない
            // カレンダーを閉じる時にリセットされる
        } else {
            // 新規作成モード：予約を作成
            await MyAsync('予約作成', () => createReservation(dateValue, timeValue), dateValue, timeValue);
        }
    }else if(target.classList.contains('label') || target.classList.contains('applyBtn')){

        searchReservation(target);
        
    }
});

// グローバルに公開
(window as any).deleteReservation = deleteReservation;
(window as any).MyAsync = MyAsync;

// グローバルに公開
(window as any).deleteReservation = deleteReservation;
(window as any).MyAsync = MyAsync;