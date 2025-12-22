// DOMContentLoadedで実行
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
    const calendarBox = document.querySelector('.calendar-wrapper');
    const calendarOverlay = document.querySelector('.calendar-overlay');
    const closeBtn = document.getElementById('calendar-close-btn');
    const reservedDates = window.reservedDates || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    // カレンダーの日付を初期化
    function initCalendarDays() {
        const calendarDays = document.querySelectorAll('#calendar-days .calendar-day[data-date]');
        calendarDays.forEach((dayEl) => {
            const day = parseInt(dayEl.getAttribute('data-date'));
            const dayDate = new Date(currentYear, currentMonth, day);
            dayDate.setHours(0, 0, 0, 0);
            const dateStr = `${String(currentYear)}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (dayDate.getTime() === today.getTime())
                dayEl.classList.add('today');
            if (reservedDates.includes(dateStr))
                dayEl.classList.add('reserved-date');
            if (dayDate < today) {
                dayEl.classList.add('past-date');
                dayEl.classList.remove('reserved-date');
            }
            dayEl.setAttribute('data-year', String(currentYear));
            dayEl.setAttribute('data-month', String(currentMonth + 1));
            dayEl.setAttribute('data-day', String(day));
            dayEl.setAttribute('data-date', dateStr);
            dayEl.addEventListener('click', function () {
                if (this.classList.contains('past-date'))
                    return;
                document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
                this.classList.add('selected');
                showTimeSelectionPanel({
                    year: parseInt(this.getAttribute('data-year')),
                    month: parseInt(this.getAttribute('data-month')),
                    day: parseInt(this.getAttribute('data-day'))
                });
            });
        });
    }
    // 時間パネルの表示関数
    function showTimeSelectionPanel(date) {
        const dateString = `${date.year}年${date.month}月${date.day}日`;
        updateTimeButtons(date);
        if (window.innerWidth >= 769) {
            // PC版で予約詳細パネルを表示
            const detailPanel = document.querySelector('.reserve-detail-panel');
            if (detailPanel) {
                detailPanel.classList.add('active');
            }
            const selectedDatePc = document.getElementById('selected-date-display-pc');
            if (selectedDatePc)
                selectedDatePc.textContent = dateString;
            const formSectionPc = document.getElementById('reserve-form-section-pc');
            if (formSectionPc)
                formSectionPc.style.display = "none";
        }
        else {
            const panel = document.getElementById('time-selection-panel');
            const overlay = document.getElementById('modal-overlay');
            const selectedDate = document.getElementById('selected-date-display');
            if (selectedDate)
                selectedDate.textContent = dateString;
            if (overlay)
                overlay.classList.add('active');
            if (panel)
                panel.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    // 時間ボタンの有効/無効を更新
    function updateTimeButtons(selectedDate) {
        var _a;
        const timeButtons = document.querySelectorAll('.time-btn');
        const selectedDateObj = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
        selectedDateObj.setHours(0, 0, 0, 0);
        const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        const reservedTimes = ((_a = window.reservedTimesByDate) === null || _a === void 0 ? void 0 : _a[dateStr]) || [];
        const isToday = selectedDateObj.getTime() === today.getTime();
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        timeButtons.forEach((btn) => {
            btn.classList.remove('selected');
            const timeStr = btn.getAttribute('data-time');
            if (!timeStr)
                return;
            const isReserved = reservedTimes.includes(timeStr);
            const existingReservedSpan = btn.querySelector('.reserved-badge');
            if (existingReservedSpan)
                existingReservedSpan.remove();
            if (isReserved) {
                btn.classList.add('reserved-time');
                btn.disabled = true;
                const reservedSpan = document.createElement('span');
                reservedSpan.className = 'reserved-badge';
                reservedSpan.textContent = '予約済';
                btn.appendChild(reservedSpan);
                return;
            }
            btn.classList.remove('reserved-time');
            if (isToday) {
                const [hour, minute] = timeStr.split(':').map(Number);
                if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                    btn.classList.add('past-time');
                    btn.disabled = true;
                }
                else {
                    btn.classList.remove('past-time');
                    btn.disabled = false;
                }
            }
            else {
                btn.classList.remove('past-time');
                btn.disabled = false;
            }
        });
    }
    // カレンダーを閉じる関数
    function closeCalendar() {
        if (calendarBox) {
            // activeクラスを削除して幅を0に戻すアニメーションを開始
            calendarBox.classList.remove('active');
            // position: stickyを削除
            calendarBox.style.position = '';
            calendarBox.style.top = '';
            calendarBox.style.alignSelf = '';
            // PC版で予約詳細パネルを非表示
            if (window.innerWidth > 768) {
                const detailPanel = document.querySelector('.reserve-detail-panel');
                if (detailPanel) {
                    detailPanel.classList.remove('active');
                }
            }
            // アニメーション完了後に完全に非表示にする
            setTimeout(() => {
                if (calendarBox && !calendarBox.classList.contains('active')) {
                    calendarBox.style.opacity = '0';
                    // SP版の場合はtransformを維持（中央配置のため）
                    if (window.innerWidth > 768) {
                        calendarBox.style.transform = '';
                    }
                }
            }, 750); // 0.75秒後に非表示
        }
        if (calendarOverlay) {
            calendarOverlay.classList.remove('active');
        }
        // 背景のスクロールを有効化
        document.body.style.overflow = '';
    }
    // カレンダーを開く関数
    function openCalendar() {
        if (calendarBox) {
            // 閉じた後に設定されたスタイルをリセット
            calendarBox.style.opacity = '';
            // カレンダーの日付を初期化
            initCalendarDays();
            // SP版のみオーバーレイを表示
            if (window.innerWidth <= 768 && calendarOverlay) {
                calendarOverlay.classList.add('active');
                // 背景のスクロールを無効化
                document.body.style.overflow = 'hidden';
                // SP版ではtransformをリセット（CSSで中央配置を適用）
                calendarBox.style.transform = '';
            }
            else {
                // PC版ではtransformをリセット
                calendarBox.style.transform = '';
                // PC版で予約詳細パネルは表示しない（日付をクリックした時に表示）
            }
            // 次のフレームでアニメーション開始（ブラウザの再描画を待つ）
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (calendarBox) {
                        calendarBox.classList.add('active');
                        // PC版の場合のみstickyを適用（SP版では適用しない）
                        if (window.innerWidth > 768) {
                            calendarBox.style.position = 'sticky';
                            calendarBox.style.top = '0';
                            calendarBox.style.alignSelf = 'flex-start';
                        }
                    }
                });
            });
        }
    }
    // 初期表示時のカレンダー表示制御
    function toggleCalendarDisplay() {
        if (calendarBox) {
            // 初期状態では非表示（PC版・SP版共通）
            calendarBox.classList.remove('active');
            calendarBox.style.position = ''; // position: stickyをリセット
            calendarBox.style.top = '';
            calendarBox.style.alignSelf = '';
            if (calendarOverlay) {
                calendarOverlay.classList.remove('active');
            }
            // PC版で予約詳細パネルを非表示
            if (window.innerWidth > 768) {
                const detailPanel = document.querySelector('.reserve-detail-panel');
                if (detailPanel) {
                    detailPanel.classList.remove('active');
                }
            }
            document.body.style.overflow = '';
        }
    }
    // 初回実行
    toggleCalendarDisplay();
    // リサイズ時にも実行
    window.addEventListener('resize', toggleCalendarDisplay);
    // バツボタンで閉じる
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCalendar();
        });
    }
    // オーバーレイ（背景）をクリックしたら閉じる
    if (calendarOverlay) {
        calendarOverlay.addEventListener('click', () => {
            closeCalendar();
        });
    }
    // 削除ボタンと編集ボタンのイベントリスナー（動的に生成されるボタンに対応）
    document.querySelectorAll('[id$="-delete-btn"]').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('削除ボタンがクリックされました:', btn.id);
        });
    });
    // モーダルを閉じる
    function closeModal() {
        const timePanel = document.getElementById('time-selection-panel');
        if (timePanel)
            timePanel.classList.remove('active');
        const overlay = document.getElementById('modal-overlay');
        if (overlay)
            overlay.classList.remove('active');
        document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
        document.querySelectorAll('.time-btn').forEach((btn) => {
            btn.classList.remove('selected', 'past-time', 'reserved-time');
            btn.disabled = false;
            const reservedSpan = btn.querySelector('.reserved-badge');
            if (reservedSpan)
                reservedSpan.remove();
        });
        const reserve_form_section = document.getElementById('reserve-form-section');
        if (reserve_form_section)
            reserve_form_section.style.display = "none";
        document.body.style.overflow = '';
    }
    // 時間ボタンのクリックイベント
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.classList.contains('past-time') || this.disabled)
                return;
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            const selectedTime = this.getAttribute('data-time');
            ['pc', ''].forEach(suffix => {
                const dateDisplay = document.getElementById(`selected-date-display${suffix ? '-' + suffix : ''}`);
                if (dateDisplay && dateDisplay.textContent !== '日付を選択してください') {
                    const match = dateDisplay.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        const [year, month, day] = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')];
                        const dateString = `${year}-${month}-${day}`;
                        const formSection = document.getElementById(`reserve-form-section${suffix ? '-' + suffix : ''}`);
                        const selectedDateInput = document.getElementById(`selected-date-input${suffix ? '-' + suffix : ''}`);
                        const selectedTimeInput = document.getElementById(`selected-time-input${suffix ? '-' + suffix : ''}`);
                        const formDateDisplay = document.getElementById(`form-date-display${suffix ? '-' + suffix : ''}`);
                        const formTimeDisplay = document.getElementById(`form-time-display${suffix ? '-' + suffix : ''}`);
                        if (selectedDateInput)
                            selectedDateInput.value = dateString;
                        if (selectedTimeInput && selectedTime)
                            selectedTimeInput.value = selectedTime;
                        if (formDateDisplay)
                            formDateDisplay.textContent = dateDisplay.textContent;
                        if (formTimeDisplay && selectedTime)
                            formTimeDisplay.textContent = selectedTime;
                        if (formSection)
                            formSection.style.display = 'block';
                    }
                }
            });
        });
    });
    // モーダル関連のイベントリスナー
    const close_time_panel = document.getElementById('close-time-panel');
    const modal_overlay = document.getElementById('modal-overlay');
    if (close_time_panel)
        close_time_panel.addEventListener('click', closeModal);
    if (modal_overlay) {
        modal_overlay.addEventListener('click', function (e) {
            if (e.target === this)
                closeModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        const time_selection_panel = document.getElementById('time-selection-panel');
        if (time_selection_panel) {
            if (e.key === 'Escape' && time_selection_panel.classList.contains('active')) {
                closeModal();
            }
        }
    });
    // キャンセルボタン
    (_a = document.getElementById('cancel-reserve')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closeModal);
    (_b = document.getElementById('cancel-reserve-pc')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        const formSectionPc = document.getElementById('reserve-form-section-pc');
        if (formSectionPc)
            formSectionPc.style.display = 'none';
        document.querySelectorAll('.time-btn').forEach((btn) => {
            btn.classList.remove('selected', 'past-time', 'reserved-time');
            btn.disabled = false;
            const reservedSpan = btn.querySelector('.reserved-badge');
            if (reservedSpan)
                reservedSpan.remove();
        });
        document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
    });
    // 編集ボタン：PC版・SP版両方でカレンダーを表示
    document.querySelectorAll('[id$="-edit-btn"]').forEach(btn => {
        btn.addEventListener('click', () => {
            openCalendar();
        });
    });
});
