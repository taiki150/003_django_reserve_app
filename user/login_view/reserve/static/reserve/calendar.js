document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNames = [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
    ];

    function renderCalendar() {
        const monthYearElement = document.getElementById('month-year');
        const calendarDaysElement = document.getElementById('calendar-days');
        
        // 月と年を表示
        monthYearElement.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
        
        // カレンダーの日付をクリア
        calendarDaysElement.innerHTML = '';
        
        // 月の最初の日を取得
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // 前月の日付を表示（空白を埋める）
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthLastDay - i;
            calendarDaysElement.appendChild(dayElement);
        }
        
        // 今月の日付を表示
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // 今日の日付をハイライト
            if (day === today.getDate() && 
                currentMonth === today.getMonth() && 
                currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            dayElement.textContent = day;
            
            // クリックイベントを追加（予約機能用）
            dayElement.addEventListener('click', function() {
                // 前月・次月の日付はクリックできない
                if (this.classList.contains('other-month')) {
                    return;
                }
                
                // 既に選択されている日付の選択を解除
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                // クリックした日付を選択
                this.classList.add('selected');
                
                // 選択した日付を保存
                const selectedDate = {
                    year: currentYear,
                    month: currentMonth + 1,
                    day: day
                };
                
                // 時間選択パネルを表示
                showTimeSelectionPanel(selectedDate);
            });
            
            calendarDaysElement.appendChild(dayElement);
        }
        
        // 次月の日付を表示（空白を埋める）
        const totalCells = calendarDaysElement.children.length;
        const remainingCells = 42 - totalCells; // 6週間分のセル
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDaysElement.appendChild(dayElement);
        }
    }
    
    // 前月ボタン
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    // 次月ボタン
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // モーダルを閉じる関数
    function closeModal() {
        const panel = document.getElementById('time-selection-panel');
        const overlay = document.getElementById('modal-overlay');
        
        panel.classList.remove('active');
        overlay.classList.remove('active');
        
        // 日付の選択を解除
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 時間ボタンの選択を解除
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // フォームセクションを非表示
        document.getElementById('reserve-form-section').style.display = 'none';
        
        // ボディのスクロールを有効化
        document.body.style.overflow = '';
    }
    
    // 画面幅をチェックしてPC版かスマホ版かを判定
    function isDesktop() {
        return window.innerWidth >= 769;
    }
    
    // 時間選択パネルの表示（PC版とスマホ版で分岐）
    function showTimeSelectionPanel(date) {
        const dateString = `${date.year}年${date.month}月${date.day}日`;
        
        if (isDesktop()) {
            // PC版: 右側パネルを更新
            const dateDisplayPC = document.getElementById('selected-date-display-pc');
            const formSectionPC = document.getElementById('reserve-form-section-pc');
            const timeButtons = document.querySelectorAll('.time-btn');
            
            dateDisplayPC.textContent = dateString;
            formSectionPC.style.display = 'none';
            
            // 時間ボタンの選択を解除
            timeButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
        } else {
            // スマホ版: モーダルを表示
            const panel = document.getElementById('time-selection-panel');
            const overlay = document.getElementById('modal-overlay');
            const dateDisplay = document.getElementById('selected-date-display');
            const formSection = document.getElementById('reserve-form-section');
            const timeButtons = document.querySelectorAll('.time-btn');
            
            dateDisplay.textContent = dateString;
            
            overlay.classList.add('active');
            panel.classList.add('active');
            
            document.body.style.overflow = 'hidden';
            
            formSection.style.display = 'none';
            
            timeButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
        }
    }
    
    // 時間選択モーダルの閉じるボタン
    document.getElementById('close-time-panel').addEventListener('click', closeModal);
    
    // オーバーレイクリックでモーダルを閉じる
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const panel = document.getElementById('time-selection-panel');
            if (panel.classList.contains('active')) {
                closeModal();
            }
        }
    });
    
    // 時間ボタンのクリックイベント（PC版とスマホ版の両方に対応）
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 他の時間ボタンの選択を解除
            document.querySelectorAll('.time-btn').forEach(b => {
                b.classList.remove('selected');
            });
            
            // クリックした時間ボタンを選択
            this.classList.add('selected');
            
            const selectedTime = this.getAttribute('data-time');
            
            // PC版のフォームを更新
            const dateDisplayPC = document.getElementById('selected-date-display-pc');
            if (dateDisplayPC && dateDisplayPC.textContent !== '日付を選択してください') {
                const selectedDateInputPC = document.getElementById('selected-date-input-pc');
                const selectedTimeInputPC = document.getElementById('selected-time-input-pc');
                const formDateDisplayPC = document.getElementById('form-date-display-pc');
                const formTimeDisplayPC = document.getElementById('form-time-display-pc');
                const formSectionPC = document.getElementById('reserve-form-section-pc');
                
                const dateMatchPC = dateDisplayPC.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                if (dateMatchPC) {
                    const year = dateMatchPC[1];
                    const month = String(dateMatchPC[2]).padStart(2, '0');
                    const day = String(dateMatchPC[3]).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    
                    selectedDateInputPC.value = dateString;
                    selectedTimeInputPC.value = selectedTime;
                    formDateDisplayPC.textContent = dateDisplayPC.textContent;
                    formTimeDisplayPC.textContent = selectedTime;
                    
                    formSectionPC.style.display = 'block';
                }
            }
            
            // スマホ版のフォームを更新
            const dateDisplay = document.getElementById('selected-date-display');
            if (dateDisplay && dateDisplay.textContent !== '日付を選択してください') {
                const selectedDateInput = document.getElementById('selected-date-input');
                const selectedTimeInput = document.getElementById('selected-time-input');
                const formDateDisplay = document.getElementById('form-date-display');
                const formTimeDisplay = document.getElementById('form-time-display');
                const formSection = document.getElementById('reserve-form-section');
                
                const dateMatch = dateDisplay.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                if (dateMatch) {
                    const year = dateMatch[1];
                    const month = String(dateMatch[2]).padStart(2, '0');
                    const day = String(dateMatch[3]).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    
                    selectedDateInput.value = dateString;
                    selectedTimeInput.value = selectedTime;
                    formDateDisplay.textContent = dateDisplay.textContent;
                    formTimeDisplay.textContent = selectedTime;
                    
                    formSection.style.display = 'block';
                }
            }
        });
    });
    
    // キャンセルボタン（スマホ版）
    const cancelBtn = document.getElementById('cancel-reserve');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // キャンセルボタン（PC版）
    const cancelBtnPC = document.getElementById('cancel-reserve-pc');
    if (cancelBtnPC) {
        cancelBtnPC.addEventListener('click', function() {
            const formSection = document.getElementById('reserve-form-section-pc');
            const timeButtons = document.querySelectorAll('.time-btn');
            
            formSection.style.display = 'none';
            timeButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
            });
        });
    }
    
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', function() {
        // リサイズ時にモーダルを閉じる（スマホ→PCに変更された場合）
        if (isDesktop()) {
            const panel = document.getElementById('time-selection-panel');
            const overlay = document.getElementById('modal-overlay');
            if (panel && overlay) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // 初回レンダリング
    renderCalendar();
});
