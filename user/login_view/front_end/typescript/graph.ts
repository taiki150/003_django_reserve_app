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

/*************** ▽▽▽ navの表示/非表示切り替え ▽▽▽ *****************/
const navToggleBtn = document.querySelector('.nav_head button') as HTMLButtonElement;
const periodBtn = document.querySelectorAll('.period_btn');

if (navToggleBtn) {
    navToggleBtn.addEventListener('click', () => {
        navToggleBtn.classList.toggle('close');
        periodBtn.forEach((btn) => {
            btn.classList.toggle('close');
        });
    });
}
/*************** △△△ navの表示/非表示切り替え △△△ *****************/

/*************** ▽▽▽ 予約集中ヒートマップ ▽▽▽ *****************/

/**********************************************
 *  非同期処理
 *  ▽▽▽ グラフデータ取得ここから ▽▽▽
 */

const getGraphData = async () => {
    const response = await fetch('/reserve/api/reservation/getData/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    console.log('reserve_data:', data);
    return data;
};

getGraphData();

/*
 *  △△△ グラフデータ取得ここまで △△△
 **********************************************/
 

declare const Chart: new (ctx: HTMLCanvasElement, config: object) => { destroy?: () => void };

const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];

function createMockData(): { x: number; y: number; v: number }[] {
    const data: { x: number; y: number; v: number }[] = [];
    for (let d = 0; d < 7; d++) {
        for (let t = 0; t < 5; t++) {
            data.push({ x: d, y: t, v: Math.floor(Math.random() * 21) });
        }
    }
    return data;
}

function initHeatmap(): void {
    const heatmapCtx = document.getElementById('heatmapChart') as HTMLCanvasElement | null;
    if (!heatmapCtx) return;

    const heatmapData = createMockData();
    const maxVal = 20;

    new Chart(heatmapCtx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: '予約件数',
                data: heatmapData,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.8)',
                backgroundColor: (ctx: { raw?: { v?: number }; chart?: { chartArea?: { width?: number; height?: number } } }) => {
                    const v = ctx.raw?.v ?? 0;
                    const alpha = 0.15 + (v / maxVal) * 0.85;
                    return `rgba(30, 170, 162, ${alpha})`;
                },
                width: ({ chart }: { chart: { chartArea?: { width?: number } } }) =>
                    ((chart.chartArea?.width ?? 300) / 7) - 1,
                height: ({ chart }: { chart: { chartArea?: { height?: number } } }) =>
                    ((chart.chartArea?.height ?? 200) / 5) - 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.2,
            layout: {
                padding: { left: 0, right: 0, top: 0, bottom: 0 },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (items: { raw?: { x?: number; y?: number } }[]) => {
                            const r = items[0]?.raw;
                            if (r == null) return '';
                            return `${DAYS[r.x ?? 0]} ${TIMES[r.y ?? 0]}`;
                        },
                        label: (ctx: { raw?: { v?: number } }) => {
                            const v = ctx.raw?.v ?? 0;
                            return `予約件数: ${v}件`;
                        },
                    },
                },
                legend: { display: false },
            },
            scales: {
                x: {
                    min: -0.5,
                    max: 6.5,
                    display: true,
                    offset: false,
                    grid: { offset: false },
                    ticks: {
                        stepSize: 1,
                        callback: (_: unknown, i: number) => DAYS[i] ?? '',
                    },
                },
                y: {
                    min: -0.5,
                    max: 4.5,
                    reverse: false,
                    display: true,
                    offset: false,
                    grid: { offset: false },
                    ticks: {
                        stepSize: 1,
                        callback: (_: unknown, i: number) => TIMES[i] ?? '',
                    },
                },
            },
        },
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeatmap);
    } else {
        initHeatmap();
    }
}

/*************** △△△ 予約集中ヒートマップ △△△ *****************/
