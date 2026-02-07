/******************************************************************************************
 * 
 * typescriptを初めて実装しているため、コードが冗長になっている可能性があります。
 * 型定義もほとんど強制的に定義するように書いています。
 * 
******************************************************************************************/

type ReservedDatesArray = string[];
type ReservedTimesByDate = { [date: string]: string[] };

// Windowインターフェースを拡張するための型定義（型チェックのみ、実行時には影響しない）
interface Window {
    reservedDates?: ReservedDatesArray;
    reservedTimesByDate?: ReservedTimesByDate;
    editingReservation?: { date: string, time: string } | null;
    messagePopUp?: (text: string, color?: string) => void;
}

// 日付を表示形式に変換する関数（YYYY-MM-DD → YYYY年MM月DD日）
function formatDateForDisplay(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${year}年${month}月${day}日`;
}

document.addEventListener('DOMContentLoaded', function() {
    const reservedDates: ReservedDatesArray = window.reservedDates || [];
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentYear: number = today.getFullYear();
    const currentMonth:number = today.getMonth();
    
    // HTMLテンプレートで生成された日付要素に対して処理を追加
    const calendarDays: NodeListOf<HTMLElement> = document.querySelectorAll('#calendar-days .calendar-day[data-date]');

    // 各日付の要素に対して処理を追加（1〜31日）
    calendarDays.forEach((dayEl: HTMLElement) => {
        const day: number = parseInt(dayEl.getAttribute('data-date')!);
        
        // 完全な日付情報を設定
        const dayDate: Date = new Date(currentYear, currentMonth, day);
        dayDate.setHours(0, 0, 0, 0);
        
        // 2025-12-31のような形式に変換（todayの日付）
        const dateStr = `${String(currentYear)}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // 今日の日付の判定（日付と時間が一致しているか判定）
        if (dayDate.getTime() === today.getTime()) dayEl.classList.add('today');
        // 予約済みの判定
        if (reservedDates.includes(dateStr)) dayEl.classList.add('reserved-date');
        // 過去の日付の判定（todayより前の日付）
        if (dayDate < today) dayEl.classList.add('past-date');
        if (dayDate < today) dayEl.classList.remove('reserved-date');
        
        // データ属性を追加
        dayEl.setAttribute('data-year', String(currentYear));
        dayEl.setAttribute('data-month', String(currentMonth + 1));
        dayEl.setAttribute('data-day', String(day));
        dayEl.setAttribute('data-date', dateStr);
        
        // 各日付クリック時の処理
        dayEl.addEventListener('click', function(this: Element) {
            // 過去の日付の場合は非アクティブ
            if (this.classList.contains('past-date')) return;

            // 選択している日付の解除
            document.querySelectorAll('.calendar-day.selected').forEach((el: Element) => 
                el.classList.remove('selected'));

            // 選択中の日付の追加
            this.classList.add('selected');

            // 時間パネルの表示関数を実行
            showTimeSelectionPanel({
                year: parseInt(this.getAttribute('data-year')!),
                month: parseInt(this.getAttribute('data-month')!),
                day: parseInt(this.getAttribute('data-day')!)
            });
        });
    });
    
    // 時間パネルの表示関数
    function showTimeSelectionPanel(date: {year: number, month: number, day: number}) {
        const dateString: string = `${date.year}年${date.month}月${date.day}日`;
        const formSection: HTMLElement | null = document.getElementById('reserve-form-section')
        updateTimeButtons(date);
        
        // PC版の場合
        if (window.innerWidth >= 769) { 
            // reserve-detail-panel内のselected-date-display-pcを更新（reserve.html用）
            const reserveDetailPanel = document.getElementById('reserve-detail-panel');
            if(reserveDetailPanel){
                const selectedDatePc = reserveDetailPanel.querySelector('#selected-date-display-pc') as HTMLElement | null;
                if(selectedDatePc){
                    selectedDatePc.textContent = dateString;
                }
                // 予約フォームの非表示
                const formSectionPc = reserveDetailPanel.querySelector('#reserve-form-section-pc') as HTMLElement | null;
                if(formSectionPc){
                    formSectionPc.style.display = "none";
                }
            }

        // SP版の場合
        } else {
            const panel: HTMLElement | null = document.getElementById('time-selection-panel');
            const overlay: HTMLElement | null = document.getElementById('modal-overlay');
            // 日付の挿入
            const selectedDate: HTMLElement | null = document.getElementById('selected-date-display');
            if(selectedDate){
                selectedDate.textContent = dateString;
            }

            // 背景暗く・時間パネルの表示・スクロール禁止・予約フォームの非表示(条件：各要素がnull出ない場合)
            if(overlay) overlay.classList.add('active');
            if(panel) panel.classList.add('active');
            if(formSection) formSection.style.display = "none";
            
            document.body.style.overflow = 'hidden';
        }
    }
    
    // 時間ボタンの有効/無効を更新
    function updateTimeButtons(selectedDate: {year: number, month: number, day: number}) {
        const timeButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.time-btn');
        const selectedDateObj: Date = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
        // 今日の時刻のリセット
        selectedDateObj.setHours(0, 0, 0, 0);
        
        // 日付文字列を生成（YYYY-MM-DD形式）
        const dateStr: string = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        
        // 選択された日付の予約済み時間を取得
        let reservedTimes: string[] = window.reservedTimesByDate?.[dateStr] || [];
        
        // 編集モードの場合、編集対象の予約の時間を除外（編集可能にするため）
        if (window.editingReservation && window.editingReservation.date === dateStr) {
            reservedTimes = reservedTimes.filter(time => time !== window.editingReservation!.time);
        }
        
        // 今日の判定
        const isToday: boolean = selectedDateObj.getTime() === today.getTime();
        
        // 現在時刻の取得
        const now: Date = new Date();
        const currentHour: number = now.getHours();
        const currentMinute: number = now.getMinutes();
        
        timeButtons.forEach((btn) => {
            // 選択をリセット
            btn.classList.remove('selected');
            
            const timeStr: string | null = btn.getAttribute('data-time');
            if (!timeStr) return; // timeStrがnullの場合はスキップ
            
            const isReserved: boolean = reservedTimes.includes(timeStr);
            
            // 既存の「※予約済」spanを削除 / コンパイルエラー出たらElementをChildNodeに変更(remove関数が定義されてないから)
            const existingReservedSpan: Element | null = btn.querySelector('.reserved-badge');
            if (existingReservedSpan) existingReservedSpan.remove();
            
            // 予約済みの場合は無効化と「※予約済」を表示
            if (isReserved) {
                btn.classList.add('reserved-time');
                btn.disabled = true;

                // 「※予約済」のspanを追加
                const reservedSpan = document.createElement('span');
                reservedSpan.className = 'reserved-badge';
                reservedSpan.textContent = '予約済';
                btn.appendChild(reservedSpan);
                // 予約済みの場合は処理をここで終了する
                return;
            }

            btn.classList.remove('reserved-time');
            
            // 今日の場合、過去の時間を無効化
            if (isToday) {
                const [hour, minute] = timeStr.split(':').map(Number);
                if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                    btn.classList.add('past-time');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('past-time');
                    btn.disabled = false;
                }
            } else {
                btn.classList.remove('past-time');
                btn.disabled = false;
            }
        });
    }
    
    // モーダルを閉じる
    function closeModal() {
        const timePanel: HTMLElement | null = document.getElementById('time-selection-panel');
        if (timePanel) timePanel.classList.remove('active');
        const overlay: HTMLElement | null = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.remove('active');
        document.querySelectorAll('.calendar-day.selected').forEach((el: Element) => el.classList.remove('selected'));
        document.querySelectorAll<HTMLButtonElement>('.time-btn').forEach((btn) => {
            btn.classList.remove('selected', 'past-time', 'reserved-time');
            btn.disabled = false;
            // 「※予約済」のspanを削除
            const reservedSpan = btn.querySelector('.reserved-badge');
            if (reservedSpan) {
                reservedSpan.remove();
            }
        });
        const reserve_form_section: HTMLElement | null = document.getElementById('reserve-form-section');
        if(reserve_form_section) reserve_form_section.style.display = "none";
        document.body.style.overflow = '';
    }
    const close_time_panel: HTMLElement | null = document.getElementById('close-time-panel');
    const modal_overlay :HTMLElement | null = document.getElementById('modal-overlay')

    if(close_time_panel) close_time_panel.addEventListener('click', closeModal);
    if(modal_overlay){
        modal_overlay.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    } 
    document.addEventListener('keydown', function(e) {
        const time_selection_panel: HTMLElement | null = document.getElementById('time-selection-panel');
        if(time_selection_panel){
            if (e.key === 'Escape' && time_selection_panel.classList.contains('active')) {
                closeModal();
            }
        }
    });
    
    // 時間ボタンのクリックイベント
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function(this: HTMLButtonElement) {
            // バリデーション処理
            const days = Array.from(document.querySelectorAll('.calendar-day'));
            const hasSelection = days.some(el => el.classList.contains('selected'));
            const text = '日付を選択してください。';
            const color = 'red';
            
            if (!hasSelection) {
                messagePopUp(text, color);
                return;
            }

            if (this.classList.contains('past-time') || this.disabled) return;
            // 編集対象の時間ボタンのマークを解除
            document.querySelectorAll('.time-btn.editing-time').forEach((b: Element) => {
                b.classList.remove('editing-time');
                (b as HTMLButtonElement).disabled = false;
            });
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            const selectedTime = this.getAttribute('data-time');
            
            if (!selectedTime) return;
            
            // PC版の処理（reserve.html用）
            if (window.innerWidth >= 769) {
                // reserve-detail-panel内の要素を取得（reserve.html用）
                const reserveDetailPanel = document.getElementById('reserve-detail-panel');
                if (!reserveDetailPanel) return;
                
                // reserve-detail-panel内のselected-date-display-pcを取得
                const dateDisplayPc = reserveDetailPanel.querySelector('#selected-date-display-pc') as HTMLElement | null;
                
                if (dateDisplayPc && dateDisplayPc.textContent !== '日付を選択してください') {
                    console.log("現在の日付表示:", dateDisplayPc.textContent);
                    const match = dateDisplayPc.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        const [year, month, day] = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')];
                        const dateString = `${year}-${month}-${day}`;
                        
                        // reserve-detail-panel内の要素を取得
                        const formSection = reserveDetailPanel.querySelector('#reserve-form-section-pc') as HTMLElement | null;
                        const selectedDateInput = reserveDetailPanel.querySelector('#selected-date-input-pc') as HTMLInputElement | null;
                        const selectedTimeInput = reserveDetailPanel.querySelector('#selected-time-input-pc') as HTMLInputElement | null;
                        const formDateDisplay = reserveDetailPanel.querySelector('#form-date-display-pc') as HTMLElement | null;
                        const formTimeDisplay = reserveDetailPanel.querySelector('#form-time-display-pc') as HTMLElement | null;
                        
                        if(selectedDateInput) selectedDateInput.value = dateString;
                        if(selectedTimeInput) selectedTimeInput.value = selectedTime;
                        
                        // 編集モードの場合は変更前と変更後を表示
                        if ((window as any).editingReservation && formDateDisplay && formTimeDisplay) {
                            const oldDateDisplay = formatDateForDisplay((window as any).editingReservation.date);
                            const oldTimeDisplay = (window as any).editingReservation.time;
                            formDateDisplay.textContent = `${oldDateDisplay} → ${dateDisplayPc.textContent}`;
                            formTimeDisplay.textContent = `${oldTimeDisplay} → ${selectedTime}`;
                        } else {
                            if(formDateDisplay) formDateDisplay.textContent = dateDisplayPc.textContent;
                            if(formTimeDisplay) formTimeDisplay.textContent = selectedTime;
                        }
                        if(formSection) {
                            formSection.style.display = 'block';
                        } else {
                            console.error('reserve-form-section-pc not found in reserve-detail-panel');
                        }
                    }
                }
            } else {
                // SP版の処理
                const dateDisplay = document.getElementById('selected-date-display');
                if (dateDisplay && dateDisplay.textContent !== '日付を選択してください') {
                    const match = dateDisplay.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        const [year, month, day] = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')];
                        const dateString = `${year}-${month}-${day}`;
                        const formSection = document.getElementById('reserve-form-section');
                        const selectedDateInput = document.getElementById('selected-date-input') as HTMLInputElement | null;
                        const selectedTimeInput = document.getElementById('selected-time-input') as HTMLInputElement | null;
                        const formDateDisplay: HTMLElement | null = document.getElementById('form-date-display');
                        const formTimeDisplay: HTMLElement | null = document.getElementById('form-time-display');
                        
                        if(selectedDateInput) selectedDateInput.value = dateString;
                        if(selectedTimeInput) selectedTimeInput.value = selectedTime;
                        
                        // 編集モードの場合は変更前と変更後を表示
                        if ((window as any).editingReservation && formDateDisplay && formTimeDisplay) {
                            const oldDateDisplay = formatDateForDisplay((window as any).editingReservation.date);
                            const oldTimeDisplay = (window as any).editingReservation.time;
                            formDateDisplay.textContent = `${oldDateDisplay} → ${dateDisplay.textContent}`;
                            formTimeDisplay.textContent = `${oldTimeDisplay} → ${selectedTime}`;
                        } else {
                            if(formDateDisplay) formDateDisplay.textContent = dateDisplay.textContent;
                            if(formTimeDisplay) formTimeDisplay.textContent = selectedTime;
                        }
                        if(formSection) formSection.style.display = 'block';
                    }
                }
            }
        });
    });
    
    // キャンセルボタン
    document.getElementById('cancel-reserve')?.addEventListener('click', closeModal);
    

    let messageTimer: number;
    function messagePopUp(text:string, color?:string){
        const massageBox = document.querySelector('.massage-box');
        const massageText = document.querySelector('.massage-text');
        if(massageBox && massageText){
            massageText.textContent = text
            massageBox.classList.add('active');
            if(color){
                massageBox.classList.add(color);
            }

            messageTimer = setTimeout(() => {
                massageBox.classList.remove('active');
                setTimeout (() => {
                    if(color){
                        massageBox.classList.remove(color);
                    }
                }, 1000)
            }, 2000);
        } 
    }

    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 769) {
            const panel: HTMLElement | null = document.getElementById('time-selection-panel');
            const overlay: HTMLElement | null = document.getElementById('modal-overlay');
            if (panel && overlay) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    window.messagePopUp = messagePopUp;
});
