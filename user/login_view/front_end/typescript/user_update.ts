/**
 * ユーザー情報変更ページ：表示モード ⇔ 編集モードの切替
 * 完了メッセージは reserve の messagePopUp と同様のポップアップで表示
 */

let messageTimer: number;

function messagePopUp(text: string, color?: string): void {
    const massageBox = document.querySelector('.massage-box') as HTMLElement | null;
    const massageText = document.querySelector('.massage-text');
    if (massageBox && massageText) {
        massageText.textContent = text;
        // massageBox.style.display = "block";
        massageBox.style.zIndex = "10";
        massageBox.classList.add('active');
        if (color) {
            massageBox.classList.add(color);
        }

        messageTimer = window.setTimeout(() => {
            massageBox.classList.remove('active');
            window.setTimeout(() => {
                if (color) {
                    massageBox.classList.remove(color);
                    massageBox.style.zIndex = "-10";
                    // massageBox.style.display = "none";

                }
            }, 1000);
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const viewSection = document.getElementById('user-info-view') as HTMLElement | null;
    const editSection = document.getElementById('user-info-edit') as HTMLElement | null;
    const btnEdit = document.getElementById('btn-edit');
    const btnCancel = document.getElementById('btn-cancel');

    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            if (viewSection) viewSection.style.display = 'none';
            if (editSection) editSection.style.display = 'block';
        });
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            if (editSection) editSection.style.display = 'none';
            if (viewSection) viewSection.style.display = 'block';
        });
    }

    // リダイレクト後の完了メッセージを messagePopUp で表示
    const flash = (window as Window & { USER_UPDATE_FLASH?: { text: string; color?: string } }).USER_UPDATE_FLASH;
    if (flash?.text) {
        messagePopUp(flash.text, flash.color);
    }
});
