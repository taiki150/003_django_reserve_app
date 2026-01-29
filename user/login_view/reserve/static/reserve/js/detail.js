"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// グローバル変数
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const currentYear = todayDate.getFullYear();
const currentMonth = todayDate.getMonth();
const currentDay = todayDate.getDate();
/***************************************
 * ▽▽▽ ユーティリティ関数 ▽▽▽
***************************************/
/**
 * 年、月、日をYYYY-MM-DD形式の文字列にフォーマットする
 * @param year - 年
 * @param month - 月（1-12）
 * @param day - 日
 * @returns YYYY-MM-DD形式の文字列
 */
function formatDateToDay(year, month, day) {
    return `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
/***************************************
 * ▽▽▽ タブ切り替えの処理 ▽▽▽
***************************************/
const today = formatDateToDay(currentYear, currentMonth + 1, currentDay);
// 過去1週間の開始日を計算（本日から7日前）
const oneWeekAgoDate = new Date(todayDate);
oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7);
const oneWeekAgo = formatDateToDay(oneWeekAgoDate.getFullYear(), oneWeekAgoDate.getMonth() + 1, oneWeekAgoDate.getDate());
/***************************************
 * ▽▽▽ 検索Boxの切り替え ▽▽▽
***************************************/
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.querySelector('.tab-search');
    const searchBox = document.querySelector('.search-box');
    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', function () {
            if (searchBtn.classList.contains('active')) {
                searchBtn.classList.remove('active');
                searchBox.classList.remove('active');
            }
            else {
                searchBtn.classList.add('active');
                searchBox.classList.add('active');
            }
        });
    }
    const resetBtn = document.getElementById('search-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            const selects = document.querySelectorAll('.date-range-container select');
            selects.forEach(select => {
                select.value = "";
            });
        });
    }
});
/**
 * 予約リストの表示/非表示を切り替える
 * @param tabType  'current'（現在の予約）または 'past'（過去の予約）
 */
function switchReservationTab(tabType) {
    const listBoxContainers = document.querySelectorAll('.list-box-container');
    listBoxContainers.forEach((box) => {
        const dateDate = box.getAttribute('data-date');
        if (!dateDate) {
            // data-date属性がない場合は非表示
            box.classList.remove('tab-visible');
            return;
        }
        // 日付を比較（YYYY-MM-DD形式なので文字列比較でOK）
        const isCurrentDate = dateDate >= today;
        // 過去の予約：本日より小さい かつ 1週間以内の予約を表示
        const isPastDateWithinWeek = dateDate < today && dateDate >= oneWeekAgo;
        if (tabType === 'current') {
            // 現在の予約タブ：本日以降の予約を表示
            if (isCurrentDate) {
                box.classList.add('tab-visible');
                // 現在の予約タブではpast-dateクラスを削除（表示のため）
                box.classList.remove('past-date');
                // 編集・削除ボタンを表示
                const editButtons = box.querySelectorAll('[id$="-edit-btn"]');
                const deleteButtons = box.querySelectorAll('[id$="-delete-btn"]');
                editButtons.forEach((btn) => btn.style.display = '');
                deleteButtons.forEach((btn) => btn.style.display = '');
            }
            else {
                box.classList.remove('tab-visible');
            }
        }
        else {
            // 過去の予約タブ：本日より小さい かつ 過去1週間以内の予約を表示
            if (isPastDateWithinWeek) {
                box.classList.add('tab-visible');
                // 過去の予約タブで表示する場合はpast-dateクラスを削除
                box.classList.remove('past-date');
                // 編集・削除ボタンを非表示
                const editButtons = box.querySelectorAll('[id$="-edit-btn"]');
                const deleteButtons = box.querySelectorAll('[id$="-delete-btn"]');
                editButtons.forEach((btn) => btn.style.display = 'none');
                deleteButtons.forEach((btn) => btn.style.display = 'none');
            }
            else {
                box.classList.remove('tab-visible');
                // 表示しない過去の予約にはpast-dateクラスを追加（非表示のため）
                if (dateDate < today) {
                    box.classList.add('past-date');
                }
            }
        }
    });
}
// 初期状態：現在の予約タブを表示
switchReservationTab('current');
// タブボタンのクリックイベント
document.querySelectorAll('.tab-button').forEach((btn) => {
    btn.addEventListener('click', () => {
        // カレンダーが開いている場合は閉じる
        const closeCalendarFn = window.closeCalendar;
        if (closeCalendarFn && typeof closeCalendarFn === 'function') {
            closeCalendarFn();
        }
        // タブボタンのactiveクラスを切り替え
        document.querySelectorAll('.tab-button').forEach((button) => {
            button.classList.remove('active');
        });
        btn.classList.add('active');
        // 選択されたタブに応じて予約リストを切り替え
        const tabType = btn.getAttribute('data-tab');
        if (tabType === 'current' || tabType === 'past') {
            switchReservationTab(tabType);
        }
    });
});
/***************************************
 * ▽▽▽ カレンダー表示に関する処理 ▽▽▽
***************************************/
// DOMContentLoadedで実行
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
    const calendarBox = document.querySelector('.calendar-wrapper');
    const calendarOverlay = document.querySelector('.calendar-overlay');
    const closeBtn = document.getElementById('calendar-close-btn');
    // 編集ボタン：PC版・SP版両方でカレンダーを表示
    document.querySelectorAll('[id$="-edit-btn"]').forEach(btn => {
        btn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            highlightParentBox(btn);
            // ボタンのidから予約識別子を取得
            const reservationId = getReservationIdFromButton(btn.id);
            if (!reservationId)
                return;
            // 予約識別子から日付と時間を抽出（例: "2025-12-14-10-00" → date: "2025-12-14", time: "10:00"）
            const parts = reservationId.split('-');
            const oldDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const oldTime = `${parts[3]}:${parts[4]}`;
            // 編集モードの状態をグローバルに設定（reserve_async.tsからアクセスできるように）
            window.editingReservation = {
                date: oldDate,
                time: oldTime
            };
            // ローカル変数にも保存（カレンダーを閉じる時の処理用）
            editingReservation = {
                date: oldDate,
                time: oldTime
            };
            // 以前に選択されていた予約のボタンを有効化
            if (currentSelectedReservation && currentSelectedReservation !== reservationId) {
                enableReservationButtons(currentSelectedReservation);
            }
            // 新しく選択された予約のボタンを無効化
            currentSelectedReservation = reservationId;
            disableReservationButtons(reservationId);
            try {
                // カレンダーを開き、編集対象の日付を初期選択状態にする
                openCalendar(oldDate, oldTime);
            }
            catch (error) {
                alert('編集処理でエラーが発生しました');
            }
        }));
    });
    // グローバルに公開
    window.showTimeSelectionPanel = showTimeSelectionPanel;
    window.updateTimeButtons = updateTimeButtons;
    // カレンダーを閉じる関数（グローバルに公開）
    function closeCalendar() {
        // カレンダーを閉じる際に、選択されている予約の編集ボタンのprocessing状態を解除
        if (currentSelectedReservation) {
            enableReservationButtons(currentSelectedReservation);
            currentSelectedReservation = null; // 選択状態をリセット
        }
        // 全ての時間ボタンの状態をリセット
        document.querySelectorAll('.time-btn').forEach((btn) => {
            btn.classList.remove('editing-time', 'selected', 'reserved-time', 'past-time');
            btn.disabled = false;
            const badge = btn.querySelector('.reserved-badge');
            if (badge)
                badge.remove();
        });
        // 編集モードをリセット
        editingReservation = null;
        if (window.editingReservation) {
            window.editingReservation = null;
        }
        // 選択されている日付を解除
        document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
        if (calendarBox) {
            // activeクラスを削除して幅を0に戻すアニメーションを開始
            calendarBox.classList.remove('active');
            // position: stickyを削除
            calendarBox.style.position = '';
            calendarBox.style.top = '';
            calendarBox.style.alignSelf = '';
            // PC版で予約詳細パネルを非表示
            if (window.innerWidth > 768) {
                const detailPanel = document.querySelector('.reserve-detail-panel-detail');
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
    // closeCalendar関数をグローバルに公開
    window.closeCalendar = closeCalendar;
    // カレンダーを開く関数
    function openCalendar(initialDate, initialTime) {
        if (calendarBox) {
            // カレンダーが既に開いているかチェック
            const isAlreadyOpen = calendarBox.classList.contains('active');
            // 閉じた後に設定されたスタイルをリセット
            calendarBox.style.opacity = '';
            // カレンダーが既に開いている場合は、初期化をスキップ（時間のリセットを防ぐ）
            if (!isAlreadyOpen) {
                // カレンダーの日付を初期化
                initCalendarDays(currentYear, currentMonth);
            }
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
                        // 初期日付が指定されていれば、その日付を選択状態にする
                        if (initialDate) {
                            const dateParts = initialDate.split('-');
                            const [year, month, day] = dateParts.map(Number);
                            // initCalendarDaysが完了してから日付を選択する（DOM更新を待つ）
                            setTimeout(() => {
                                // 日付要素が見つかるまで再試行する関数
                                const trySelectDate = (retries = 5) => {
                                    const dayElement = document.querySelector(`.calendar-day[data-date="${initialDate}"]`);
                                    if (dayElement) {
                                        // 既存の選択を解除
                                        document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
                                        // 該当日付を選択状態にする
                                        dayElement.classList.add('selected');
                                        // 時間パネルを表示（updateTimeButtonsが呼ばれる）
                                        showTimeSelectionPanel({ year: year, month: month, day: day });
                                        // 初期時間が指定されていれば、その時間を非アクティブ状態（編集対象）にする
                                        if (initialTime) {
                                            // updateTimeButtonsが実行された後に編集対象の時間を設定
                                            setTimeout(() => {
                                                const timeBtn = document.querySelector(`.time-btn[data-time="${initialTime}"]`);
                                                if (timeBtn) {
                                                    // 既存の選択を解除
                                                    document.querySelectorAll('.time-btn.selected').forEach((btn) => btn.classList.remove('selected'));
                                                    // 既存の編集対象マークを解除
                                                    document.querySelectorAll('.time-btn.editing-time').forEach((btn) => {
                                                        btn.classList.remove('editing-time');
                                                        btn.disabled = false;
                                                    });
                                                    // 該当時間を非アクティブ状態（編集対象）にする
                                                    timeBtn.classList.add('editing-time');
                                                    timeBtn.disabled = true;
                                                    // フォームに値を設定するため、hidden inputに直接値を設定
                                                    const selectedDateInput = document.querySelector('[name="selected_date"]');
                                                    const selectedTimeInput = document.querySelector('[name="selected_time"]');
                                                    if (selectedDateInput && selectedTimeInput) {
                                                        selectedDateInput.value = initialDate;
                                                        selectedTimeInput.value = initialTime;
                                                        // フォーム表示を更新（編集モード対応）
                                                        const formDateDisplay = document.querySelector('#form-date-display, #form-date-display-pc');
                                                        const formTimeDisplay = document.querySelector('#form-time-display, #form-time-display-pc');
                                                        if (window.editingReservation && formDateDisplay && formTimeDisplay) {
                                                            const oldDateDisplay = formatDateForDisplay(window.editingReservation.date);
                                                            const oldTimeDisplay = window.editingReservation.time;
                                                            const newDateDisplay = formatDateForDisplay(initialDate);
                                                            formDateDisplay.textContent = `${oldDateDisplay} → ${newDateDisplay}`;
                                                            formTimeDisplay.textContent = `${oldTimeDisplay} → ${initialTime}`;
                                                        }
                                                        else if (formDateDisplay && formTimeDisplay) {
                                                            const dateDisplay = document.querySelector('#selected-date-display, #selected-date-display-pc');
                                                            if (dateDisplay) {
                                                                formDateDisplay.textContent = dateDisplay.textContent;
                                                                formTimeDisplay.textContent = initialTime;
                                                            }
                                                        }
                                                    }
                                                }
                                            }, 300); // updateTimeButtonsの実行を待つ
                                        }
                                    }
                                    else if (retries > 0) {
                                        // 要素が見つからない場合は、少し待ってから再試行
                                        setTimeout(() => trySelectDate(retries - 1), 50);
                                    }
                                };
                                // 初回試行
                                trySelectDate();
                            }, 100); // initCalendarDaysの完了を待つ
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
                const detailPanel = document.querySelector('.reserve-detail-panel-detail');
                if (detailPanel) {
                    detailPanel.classList.remove('active');
                }
            }
            document.body.style.overflow = '';
        }
    }
    // 初回実行
    toggleCalendarDisplay();
    // バツボタンでカレンダーを閉じる
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCalendar();
            document.querySelectorAll('.list-box-container').forEach(display => {
                display.classList.remove('selected');
            });
        });
    }
    // 背景をクリックしたらカレンダーを閉じる
    if (calendarOverlay) {
        calendarOverlay.addEventListener('click', () => {
            closeCalendar();
        });
    }
    // 現在選択されている予約を追跡（日付-時間の形式、例: "2025-12-14-10-00"）
    let currentSelectedReservation = null;
    // 編集モードの状態管理（編集対象の元の予約情報）
    let editingReservation = null;
    // 削除ボタンのイベントリスナー（動的に生成されるボタンに対応）
    document.querySelectorAll('[id$="-delete-btn"]').forEach(btn => {
        btn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            highlightParentBox(btn);
            // ボタンのidから予約識別子を取得
            const reservationId = getReservationIdFromButton(btn.id);
            if (!reservationId) {
                return;
            }
            // 予約識別子から日付と時間を抽出（例: "2025-12-14-10-00" → date: "2025-12-14", time: "10:00"）
            const parts = reservationId.split('-');
            const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const time = `${parts[3]}:${parts[4]}`;
            // 確認ダイアログを表示
            const dateDisplay = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日');
            const timeDisplay = time.replace(/(\d{2}):(\d{2})/, '$1時');
            const confirmMessage = `${dateDisplay}${timeDisplay}の予約を削除してもよろしいですか？`;
            if (!confirm(confirmMessage)) {
                // キャンセルされた場合は、選択状態を解除
                document.querySelectorAll('.list-box-container').forEach((box) => {
                    box.classList.remove('selected');
                });
                return; // 処理を中断
            }
            // 以前に選択されていた予約の編集ボタンを有効化
            if (currentSelectedReservation && currentSelectedReservation !== reservationId) {
                enableReservationButtons(currentSelectedReservation);
            }
            // 新しく選択された予約の編集ボタンを無効化
            currentSelectedReservation = reservationId;
            disableReservationButtons(reservationId);
            try {
                // 削除処理を実行
                const deleteReservationFunc = window.deleteReservation;
                const MyAsyncFunc = window.MyAsync;
                if (!deleteReservationFunc || !MyAsyncFunc) {
                    alert('削除機能が利用できません。ページを再読み込みしてください。');
                    return;
                }
                yield MyAsyncFunc('予約削除', () => deleteReservationFunc(date, time));
                // 削除後、カレンダーが開いている場合は閉じる
                if (calendarBox && calendarBox.classList.contains('active')) {
                    closeCalendar();
                }
            }
            catch (error) {
                alert('削除処理でエラーが発生しました');
            }
        }));
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
            if (!selectedTime)
                return;
            // PC版の処理
            if (window.innerWidth >= 769) {
                // detail.html用の処理（reserve-form-section-detail-pcを対象）
                // reserve-detail-panel-detail内の要素を取得
                const reserveDetailPanelDetail = document.getElementById('reserve-detail-panel-detail');
                if (reserveDetailPanelDetail) {
                    const dateDisplayPc = reserveDetailPanelDetail.querySelector('#selected-date-display-pc');
                    if (dateDisplayPc && dateDisplayPc.textContent !== '日付を選択してください') {
                        const match = dateDisplayPc.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                        if (match) {
                            const [year, month, day] = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')];
                            const dateString = `${year}-${month}-${day}`;
                            const formSection = reserveDetailPanelDetail.querySelector('#reserve-form-section-detail-pc');
                            const selectedDateInput = reserveDetailPanelDetail.querySelector('#selected-date-input-pc');
                            const selectedTimeInput = reserveDetailPanelDetail.querySelector('#selected-time-input-pc');
                            const formDateDisplay = reserveDetailPanelDetail.querySelector('#form-date-display-pc');
                            const formTimeDisplay = reserveDetailPanelDetail.querySelector('#form-time-display-pc');
                            if (selectedDateInput)
                                selectedDateInput.value = dateString;
                            if (selectedTimeInput)
                                selectedTimeInput.value = selectedTime;
                            // 編集モードの場合は変更前と変更後を表示
                            if (window.editingReservation && formDateDisplay && formTimeDisplay) {
                                const oldDateDisplay = formatDateForDisplay(window.editingReservation.date);
                                const oldTimeDisplay = window.editingReservation.time;
                                formDateDisplay.textContent = `${oldDateDisplay} → ${dateDisplayPc.textContent}`;
                                formTimeDisplay.textContent = `${oldTimeDisplay} → ${selectedTime}`;
                            }
                            else {
                                if (formDateDisplay)
                                    formDateDisplay.textContent = dateDisplayPc.textContent;
                                if (formTimeDisplay)
                                    formTimeDisplay.textContent = selectedTime;
                            }
                            if (formSection) {
                                formSection.style.display = 'block';
                            }
                        }
                    }
                }
            }
            else {
                // SP版の処理
                const dateDisplay = document.getElementById('selected-date-display');
                if (dateDisplay && dateDisplay.textContent !== '日付を選択してください') {
                    const match = dateDisplay.textContent.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        const [year, month, day] = [match[1], String(match[2]).padStart(2, '0'), String(match[3]).padStart(2, '0')];
                        const dateString = `${year}-${month}-${day}`;
                        const formSection = document.getElementById('reserve-form-section');
                        const selectedDateInput = document.getElementById('selected-date-input');
                        const selectedTimeInput = document.getElementById('selected-time-input');
                        const formDateDisplay = document.getElementById('form-date-display');
                        const formTimeDisplay = document.getElementById('form-time-display');
                        if (selectedDateInput)
                            selectedDateInput.value = dateString;
                        if (selectedTimeInput)
                            selectedTimeInput.value = selectedTime;
                        // 編集モードの場合は変更前と変更後を表示
                        if (window.editingReservation && formDateDisplay && formTimeDisplay) {
                            const oldDateDisplay = formatDateForDisplay(window.editingReservation.date);
                            const oldTimeDisplay = window.editingReservation.time;
                            formDateDisplay.textContent = `${oldDateDisplay} → ${dateDisplay.textContent}`;
                            formTimeDisplay.textContent = `${oldTimeDisplay} → ${selectedTime}`;
                        }
                        else {
                            if (formDateDisplay)
                                formDateDisplay.textContent = dateDisplay.textContent;
                            if (formTimeDisplay)
                                formTimeDisplay.textContent = selectedTime;
                        }
                        if (formSection) {
                            formSection.style.display = 'block';
                        }
                    }
                }
            }
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
        const formSectionPc = document.getElementById('reserve-form-section-detail-pc');
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
});
/**************************************************
 *
 * ▽▽▽▽▽▽▽▽▽▽▽▽ サブ関数はここより下 ▽▽▽▽▽▽▽▽▽▽▽▽
 *
 **************************************************/
// 日付を表示形式に変換する関数（YYYY-MM-DD → YYYY年MM月DD日）
function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${year}年${month}月${day}日`;
}
// ボタンの無効化関数
function disableButton(button) {
    const htmlButton = button;
    htmlButton.disabled = true;
    htmlButton.classList.add('processing');
}
// ボタンの有効化関数
function enableButton(button) {
    const htmlButton = button;
    htmlButton.disabled = false;
    htmlButton.classList.remove('processing');
}
// 予約識別子の抽出関数
// （例: "2025-12-14-10-00-delete-btn" → "2025-12-14-10-00"）
function getReservationIdFromButton(buttonId) {
    const match = buttonId.match(/^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2})-/);
    return match ? match[1] : null;
}
// 特定の予約に対応する編集ボタンのみを無効化（削除ボタンは無効化しない）
function disableReservationButtons(reservationId) {
    const editBtn = document.getElementById(`${reservationId}-edit-btn`);
    if (editBtn)
        disableButton(editBtn);
}
// 特定の予約に対応する編集ボタンのみを有効化（削除ボタンは常に有効）
function enableReservationButtons(reservationId) {
    const editBtn = document.getElementById(`${reservationId}-edit-btn`);
    if (editBtn)
        enableButton(editBtn);
}
/**************************************************
 *
 * ▽▽▽▽▽▽▽▽▽▽▽▽ サブ関数はここより下 ▽▽▽▽▽▽▽▽▽▽▽▽
 *
 **************************************************/
// 1_カレンダーの日付を初期化
let calendarDaysInitialized = false;
function initCalendarDays(currentYear, currentMonth) {
    const reservedDates = window.reservedDates || [];
    const calendarDays = document.querySelectorAll('#calendar-days .calendar-day[data-date]');
    // イベント委譲を一度だけ設定
    if (!calendarDaysInitialized) {
        const calendarDaysContainer = document.getElementById('calendar-days');
        if (calendarDaysContainer) {
            calendarDaysContainer.addEventListener('click', (e) => {
                const target = e.target;
                const dayEl = target.closest('.calendar-day');
                if (!dayEl || dayEl.classList.contains('past-date'))
                    return;
                document.querySelectorAll('.calendar-day.selected').forEach((el) => el.classList.remove('selected'));
                dayEl.classList.add('selected');
                const dataYear = dayEl.getAttribute('data-year');
                const dataMonth = dayEl.getAttribute('data-month');
                const dataDay = dayEl.getAttribute('data-day');
                showTimeSelectionPanel({
                    year: parseInt(dataYear),
                    month: parseInt(dataMonth),
                    day: parseInt(dataDay)
                });
            });
            calendarDaysInitialized = true;
        }
    }
    // 全ての時間ボタンの状態をリセット
    document.querySelectorAll('.time-btn').forEach((btn) => {
        btn.classList.remove('selected', 'reserved-time', 'editing-time', 'past-time');
        btn.disabled = false;
        const badge = btn.querySelector('.reserved-badge');
        if (badge)
            badge.remove();
    });
    calendarDays.forEach((dayEl) => {
        var _a;
        // data-date属性から日付を取得（既にYYYY-MM-DD形式の場合はそのまま使用、数字のみの場合は日付として解釈）
        const dataDateAttr = dayEl.getAttribute('data-date');
        let day;
        let dateStr;
        if (dataDateAttr && dataDateAttr.includes('-')) {
            // 既にYYYY-MM-DD形式の場合
            const [year, month, dayNum] = dataDateAttr.split('-').map(Number);
            day = dayNum;
            dateStr = dataDateAttr;
        }
        else {
            // 数字のみの場合（1-31）
            day = parseInt(dataDateAttr || ((_a = dayEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '0');
            dateStr = formatDateToDay(currentYear, currentMonth + 1, day);
        }
        const dayDate = new Date(currentYear, currentMonth, day);
        dayDate.setHours(0, 0, 0, 0);
        // クラスのリセット
        dayEl.classList.remove('today', 'reserved-date', 'past-date', 'selected');
        if (dayDate.getTime() === todayDate.getTime())
            dayEl.classList.add('today');
        if (reservedDates.includes(dateStr))
            dayEl.classList.add('reserved-date');
        if (dayDate < todayDate) {
            dayEl.classList.add('past-date');
            dayEl.classList.remove('reserved-date');
        }
        dayEl.setAttribute('data-year', String(currentYear));
        dayEl.setAttribute('data-month', String(currentMonth + 1));
        dayEl.setAttribute('data-day', String(day));
        dayEl.setAttribute('data-date', dateStr);
    });
}
// 2_時間パネルの表示関数（グローバルに公開）
function showTimeSelectionPanel(date) {
    const dateString = `${date.year}年${date.month}月${date.day}日`;
    const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    // 編集対象の日付かどうかをチェック
    const isEditingDate = window.editingReservation && window.editingReservation.date === dateStr;
    // 日付が変更された場合、編集対象の時間ボタンのマークを解除
    if (!isEditingDate) {
        document.querySelectorAll('.time-btn.editing-time').forEach((btn) => {
            btn.classList.remove('editing-time');
            btn.disabled = false;
        });
    }
    updateTimeButtons(date);
    // 編集対象の日付の場合、編集対象の時間ボタンを非アクティブ状態にする
    if (isEditingDate && window.editingReservation) {
        setTimeout(() => {
            const timeBtn = document.querySelector(`.time-btn[data-time="${window.editingReservation.time}"]`);
            if (timeBtn) {
                // 既存の編集対象マークを解除
                document.querySelectorAll('.time-btn.editing-time').forEach((btn) => {
                    btn.classList.remove('editing-time');
                    btn.disabled = false;
                });
                // 該当時間を非アクティブ状態（編集対象）にする
                timeBtn.classList.add('editing-time');
                timeBtn.disabled = true;
                // フォームに値を設定
                const selectedDateInput = document.querySelector('[name="selected_date"]');
                const selectedTimeInput = document.querySelector('[name="selected_time"]');
                if (selectedDateInput && selectedTimeInput) {
                    selectedDateInput.value = dateStr;
                    selectedTimeInput.value = window.editingReservation.time;
                    // フォーム表示を更新（編集モード対応）
                    const formDateDisplay = document.querySelector('#form-date-display, #form-date-display-pc');
                    const formTimeDisplay = document.querySelector('#form-time-display, #form-time-display-pc');
                    if (formDateDisplay && formTimeDisplay) {
                        const oldDateDisplay = formatDateForDisplay(window.editingReservation.date);
                        const oldTimeDisplay = window.editingReservation.time;
                        formDateDisplay.textContent = `${oldDateDisplay} → ${dateString}`;
                        formTimeDisplay.textContent = `${oldTimeDisplay} → ${window.editingReservation.time}`;
                    }
                }
            }
        }, 100);
    }
    if (window.innerWidth >= 769) {
        // PC版で予約詳細パネルを表示
        const detailPanel = document.querySelector('.reserve-detail-panel-detail');
        if (detailPanel) {
            detailPanel.classList.add('active');
        }
        const selectedDatePc = document.getElementById('selected-date-display-pc');
        if (selectedDatePc)
            selectedDatePc.textContent = dateString;
        const formSectionPc = document.getElementById('reserve-form-section-detail-pc');
        if (formSectionPc)
            formSectionPc.style.display = "none";
    }
    else {
        // SP版の場合：日付をクリックしたら時間パネルを表示
        const panel = document.getElementById('time-selection-panel');
        const overlay = document.getElementById('modal-overlay');
        const selectedDate = document.getElementById('selected-date-display');
        const formSection = document.getElementById('reserve-form-section');
        // 日付の挿入
        if (selectedDate)
            selectedDate.textContent = dateString;
        // 背景暗く・時間パネルの表示・スクロール禁止・予約フォームの非表示
        if (overlay)
            overlay.classList.add('active');
        if (panel)
            panel.classList.add('active');
        if (formSection)
            formSection.style.display = "none";
        document.body.style.overflow = 'hidden';
    }
}
// 3_時間ボタンの有効/無効を更新（グローバルに公開）
function updateTimeButtons(selectedDate) {
    var _a;
    const timeButtons = document.querySelectorAll('.time-btn');
    const selectedDateObj = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
    selectedDateObj.setHours(0, 0, 0, 0);
    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
    let reservedTimes = ((_a = window.reservedTimesByDate) === null || _a === void 0 ? void 0 : _a[dateStr]) || [];
    // 編集モードの場合、編集対象の予約の時間を除外（編集可能にするため）
    if (window.editingReservation && window.editingReservation.date === dateStr) {
        reservedTimes = reservedTimes.filter(time => time !== window.editingReservation.time);
    }
    const isToday = selectedDateObj.getTime() === todayDate.getTime();
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
// 親Boxの選択状態を管理する関数
function highlightParentBox(button) {
    // すべてのBoxから選択状態を解除
    document.querySelectorAll('.list-box-container').forEach((box) => {
        box.classList.remove('selected');
    });
    // ボタンのidから日付部分を抽出（例: "2025-12-14-10-00-delete-btn" → "2025-12-14"）
    const buttonId = button.id;
    const dateMatch = buttonId.match(/^(\d{4}-\d{2}-\d{2})-/);
    if (dateMatch) {
        const dateIso = dateMatch[1];
        const parentBox = document.getElementById(`${dateIso}-box`);
        if (parentBox) {
            parentBox.classList.add('selected');
        }
    }
}
