/*************** ▽▽▽ ロードアニメーション ▽▽▽ *****************/
const loadeBox = document.querySelector('.loade_view') as HTMLDivElement;

// ランダムな数値の生成
const getLoadingTime = (): number => {
    const min = 3;
    const max = 5;
    // 4〜7: number のいずれかを生成して 1000倍する
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
};

const startLoading = async () => {
    const delay = getLoadingTime();
    console.log(delay);

    await new Promise(resolve => setTimeout(resolve, delay));
    loadeBox.style.opacity = "0";
    loadeBox.style.transform = "translateX(100vw)";
    setTimeout(() => {
        loadeBox.style.display = 'none';
    }, 5000)
}

if(loadeBox){
    startLoading();
}


/*************** △△△ ロードアニメーション △△△ *****************/

