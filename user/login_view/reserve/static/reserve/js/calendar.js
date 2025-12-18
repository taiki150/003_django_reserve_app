/******************************************************************************************
 *
 * typescriptを初めて実装しているため、コードが冗長になっている可能性があります。
 * 型定義もほとんど強制的に定義するように書いています。
 *
******************************************************************************************/
document.addEventListener('DOMContentLoaded', function () {
    var _a, _b;
    var reservedDates = window.reservedDates || [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth();
    // HTMLテンプレートで生成された日付要素に対して処理を追加
    var calendarDays = document.querySelectorAll('#calendar-days .calendar-day[data-date]');
    // 各日付の要素に対して処理を追加（1〜31日）
    calendarDays.forEach(function (dayEl) {
        var day = parseInt(dayEl.getAttribute('data-date'));
        // 完全な日付情報を設定
        var dayDate = new Date(currentYear, currentMonth, day);
        dayDate.setHours(0, 0, 0, 0);
        // 2025-12-31のような形式に変換（todayの日付）
        var dateStr = "".concat(String(currentYear), "-").concat(String(currentMonth + 1).padStart(2, '0'), "-").concat(String(day).padStart(2, '0'));
        // 今日の日付の判定（日付と時間が一致しているか判定）
        if (dayDate.getTime() === today.getTime())
            dayEl.classList.add('today');
        // 予約済みの判定
        if (reservedDates.includes(dateStr))
            dayEl.classList.add('reserved-date');
        // 過去の日付の判定（todayより前の日付）
        if (dayDate < today)
            dayEl.classList.add('past-date');
        if (dayDate < today)
            dayEl.classList.remove('reserved-date');
        // データ属性を追加
        dayEl.setAttribute('data-year', String(currentYear));
        dayEl.setAttribute('data-month', String(currentMonth + 1));
        dayEl.setAttribute('data-day', String(day));
        dayEl.setAttribute('data-date', dateStr);
        // 各日付クリック時の処理
        dayEl.addEventListener('click', function () {
            // 過去の日付の場合は非アクティブ
            if (this.classList.contains('past-date'))
                return;
            // 選択している日付の解除
            document.querySelectorAll('.calendar-day.selected').forEach(function (el) {
                return el.classList.remove('selected');
            });
            // 選択中の日付の追加
            this.classList.add('selected');
            // 時間パネルの表示関数を実行
            showTimeSelectionPanel({
                year: parseInt(this.getAttribute('data-year')),
                month: parseInt(this.getAttribute('data-month')),
                day: parseInt(this.getAttribute('data-day'))
            });
        });
    });
    // 時間パネルの表示関数
    function showTimeSelectionPanel(date) {
        var dateString = "".concat(date.year, "\u5E74").concat(date.month, "\u6708").concat(date.day, "\u65E5");
        var formSection = document.getElementById('reserve-form-section');
        updateTimeButtons(date);
        // PC版の場合
        if (window.innerWidth >= 769) {
            // 日付表示
            var selectedDatePc = document.getElementById('selected-date-display-pc');
            if (selectedDatePc) {
                selectedDatePc.textContent = dateString;
            }
            // 予約フォームの非表示
            var formSectionPc = document.getElementById('reserve-form-section-pc');
            if (formSectionPc) {
                formSectionPc.style.display = "none";
            }
            // SP版の場合
        }
        else {
            var panel = document.getElementById('time-selection-panel');
            var overlay = document.getElementById('modal-overlay');
            // 日付の挿入
            var selectedDate = document.getElementById('selected-date-display');
            if (selectedDate) {
                selectedDate.textContent = dateString;
            }
            // 背景暗く・時間パネルの表示・スクロール禁止・予約フォームの非表示(条件：各要素がnull出ない場合)
            if (overlay)
                overlay.classList.add('active');
            if (panel)
                panel.classList.add('active');
            if (formSection)
                formSection.style.display = "none";
            document.body.style.overflow = 'hidden';
        }
    }
    // 時間ボタンの有効/無効を更新
    function updateTimeButtons(selectedDate) {
        var _a;
        var timeButtons = document.querySelectorAll('.time-btn');
        var selectedDateObj = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
        // 今日の時刻のリセット
        selectedDateObj.setHours(0, 0, 0, 0);
        // 日付文字列を生成（YYYY-MM-DD形式）
        var dateStr = "".concat(selectedDate.year, "-").concat(String(selectedDate.month).padStart(2, '0'), "-").concat(String(selectedDate.day).padStart(2, '0'));
        // 選択された日付の予約済み時間を取得
        var reservedTimes = ((_a = window.reservedTimesByDate) === null || _a === void 0 ? void 0 : _a[dateStr]) || [];
        // 今日の判定
        var isToday = selectedDateObj.getTime() === today.getTime();
        // 現在時刻の取得
        var now = new Date();
        var currentHour = now.getHours();
        var currentMinute = now.getMinutes();
        timeButtons.forEach(function (btn) {
            // 選択をリセット
            btn.classList.remove('selected');
            var timeStr = btn.getAttribute('data-time');
            if (!timeStr)
                return; // timeStrがnullの場合はスキップ
            var isReserved = reservedTimes.includes(timeStr);
            // 既存の「※予約済」spanを削除 / コンパイルエラー出たらElementをChildNodeに変更(remove関数が定義されてないから)
            var existingReservedSpan = btn.querySelector('.reserved-badge');
            if (existingReservedSpan)
                existingReservedSpan.remove();
            // 予約済みの場合は無効化と「※予約済」を表示
            if (isReserved) {
                btn.classList.add('reserved-time');
                btn.disabled = true;
                // 「※予約済」のspanを追加
                var reservedSpan = document.createElement('span');
                reservedSpan.className = 'reserved-badge';
                reservedSpan.textContent = '予約済';
                btn.appendChild(reservedSpan);
                // 予約済みの場合は処理をここで終了する
                return;
            }
            btn.classList.remove('reserved-time');
            // 今日の場合、過去の時間を無効化
            if (isToday) {
                var _a = timeStr.split(':').map(Number), hour = _a[0], minute = _a[1];
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
    // モーダルを閉じる
    function closeModal() {
        var timePanel = document.getElementById('time-selection-panel');
        if (timePanel)
            timePanel.classList.remove('active');
        var overlay = document.getElementById('modal-overlay');
        if (overlay)
            overlay.classList.remove('active');
        document.querySelectorAll('.calendar-day.selected').forEach(function (el) { return el.classList.remove('selected'); });
        document.querySelectorAll('.time-btn').forEach(function (btn) {
            btn.classList.remove('selected', 'past-time', 'reserved-time');
            btn.disabled = false;
            // 「※予約済」のspanを削除
            var reservedSpan = btn.querySelector('.reserved-badge');
            if (reservedSpan) {
                reservedSpan.remove();
            }
        });
        var reserve_form_section = document.getElementById('reserve-form-section');
        if (reserve_form_section)
            reserve_form_section.style.display = "none";
        document.body.style.overflow = '';
    }
    var close_time_panel = document.getElementById('close-time-panel');
    var modal_overlay = document.getElementById('modal-overlay');
    if (close_time_panel)
        close_time_panel.addEventListener('click', closeModal);
    if (modal_overlay) {
        modal_overlay.addEventListener('click', function (e) {
            if (e.target === this)
                closeModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        var time_selection_panel = document.getElementById('time-selection-panel');
        if (time_selection_panel) {
            if (e.key === 'Escape' && time_selection_panel.classList.contains('active')) {
                closeModal();
            }
        }
    });
    // 時間ボタンのクリックイベント
    document.querySelectorAll('.time-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (this.classList.contains('past-time') || this.disabled)
                return;
            document.querySelectorAll('.time-btn').forEach(function (b) { return b.classList.remove('selected'); });
            this.classList.add('selected');
            var selectedTime = this.getAttribute('data-time');
            ['pc', ''].forEach(function (suffix) {
                var dateDisplay = document.getElementById("selected-date-display".concat(suffix ? '-' + suffix : ''));
                if (dateDisplay && dateDisplay.textContent !== '日付を選択してください') {
                    var match = dateDisplay.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        var _a = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')], year = _a[0], month = _a[1], day = _a[2];
                        var dateString = "".concat(year, "-").concat(month, "-").concat(day);
                        var formSection = document.getElementById("reserve-form-section".concat(suffix ? '-' + suffix : ''));
                        var selectedDateInput = document.getElementById("selected-date-input".concat(suffix ? '-' + suffix : ''));
                        var selectedTimeInput = document.getElementById("selected-time-input".concat(suffix ? '-' + suffix : ''));
                        var formDateDisplay = document.getElementById("form-date-display".concat(suffix ? '-' + suffix : ''));
                        var formTimeDisplay = document.getElementById("form-time-display".concat(suffix ? '-' + suffix : ''));
                        if (selectedDateInput)
                            selectedDateInput.value = dateString;
                        if (selectedTimeInput)
                            selectedTimeInput.value = selectedTime;
                        if (formDateDisplay)
                            formDateDisplay.textContent = dateDisplay.textContent;
                        if (formTimeDisplay)
                            formTimeDisplay.textContent = selectedTime;
                        if (formSection)
                            formSection.style.display = 'block';
                    }
                }
            });
        });
    });
    // キャンセルボタン
    (_a = document.getElementById('cancel-reserve')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closeModal);
    (_b = document.getElementById('cancel-reserve-pc')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        var formSectionPc = document.getElementById('reserve-form-section-pc');
        if (formSectionPc)
            formSectionPc.style.display = 'none';
        document.querySelectorAll('.time-btn').forEach(function (btn) {
            btn.classList.remove('selected', 'past-time', 'reserved-time');
            btn.disabled = false;
            // 「※予約済」のspanを削除
            var reservedSpan = btn.querySelector('.reserved-badge');
            if (reservedSpan)
                reservedSpan.remove();
        });
        document.querySelectorAll('.calendar-day.selected').forEach(function (el) { return el.classList.remove('selected'); });
    });
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 769) {
            var panel = document.getElementById('time-selection-panel');
            var overlay = document.getElementById('modal-overlay');
            if (panel && overlay) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});
