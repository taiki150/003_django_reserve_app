"use strict";
/**
 * ユーザー情報変更ページ：表示モード ⇔ 編集モードの切替
 * 完了メッセージは reserve の messagePopUp と同様のポップアップで表示
 */
let messageTimer;
function messagePopUp(text, color) {
    const massageBox = document.querySelector('.massage-box');
    const massageText = document.querySelector('.massage-text');
    if (massageBox && massageText) {
        massageText.textContent = text;
        massageBox.classList.add('active');
        if (color) {
            massageBox.classList.add(color);
        }
        messageTimer = window.setTimeout(() => {
            massageBox.classList.remove('active');
            window.setTimeout(() => {
                if (color) {
                    massageBox.classList.remove(color);
                }
            }, 1000);
        }, 2000);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const viewSection = document.getElementById('user-info-view');
    const editSection = document.getElementById('user-info-edit');
    const btnEdit = document.getElementById('btn-edit');
    const btnCancel = document.getElementById('btn-cancel');
    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            if (viewSection)
                viewSection.style.display = 'none';
            if (editSection)
                editSection.style.display = 'block';
        });
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            if (editSection)
                editSection.style.display = 'none';
            if (viewSection)
                viewSection.style.display = 'block';
        });
    }
    // リダイレクト後の完了メッセージを messagePopUp で表示
    const flash = window.USER_UPDATE_FLASH;
    if (flash === null || flash === void 0 ? void 0 : flash.text) {
        messagePopUp(flash.text, flash.color);
    }
});
