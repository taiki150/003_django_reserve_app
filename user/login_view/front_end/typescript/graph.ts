/*************** ▽▽▽ ロードアニメーション ▽▽▽ *****************/
const loadeBox = document.querySelector('.loade_view') as HTMLDivElement;

// ランダムな数値の生成
const getLoadingTime = (): number => {
    const min = 3;
    const max = 7;
    // 4〜7: number のいずれかを生成して 1000倍する
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
};

const startLoading = async () => {
    const delay = getLoadingTime();

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


/*************** ▽▽▽ トグルによるデータの切り替え ▽▽▽ *****************/
const toggleLabel = document.querySelector('.toggle_label') as HTMLLabelElement;
const toggleSpan = document.querySelector('.toggle_span') as HTMLSpanElement;
const toggleText = document.querySelectorAll('.toggle_p span');

document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if(target.classList.contains('toggle_button')){
        toggleSwitch();
        initHeatmap();
    }
});

function toggleSwitch() {

    toggleLabel.classList.toggle('active');
    toggleSpan.classList.toggle('active');
    toggleText.forEach((span) => {
        span.classList.toggle('active');
    });
}

/*************** △△△ トグルによるデータの切り替え △△△ *****************/


/*************** ▽▽▽ 予約集中ヒートマップ ▽▽▽ *****************/

/**********************************************
 *  非同期処理
 *  ▽▽▽ グラフデータ取得ここから ▽▽▽
 */

interface ReserveRecord {
    id: number;
    date: string;
    time: string;
}

interface GraphDataResponse {
    success: boolean;
    all_reserve_data: ReserveRecord[];
    user_reserve_data: ReserveRecord[];
}

// 非同期データ取得
const getGraphData = async (): Promise<GraphDataResponse> => {
    const response = await fetch('/reserve/api/reservation/getData/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const promiseData: GraphDataResponse = await response.json();
    return promiseData;
};

/** 個人=true / 全体=false で使用するデータを切り替え */
const promiseDataOpen = async (isUserOnly: boolean) => {
    const openData = await getGraphData();
    const targetData = isUserOnly ? openData.user_reserve_data : openData.all_reserve_data;
    return mapColorUpdate(targetData);
};

const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];

// グラフの縦・横の生成関数
function createMockData(): { x: number; y: number; v: number }[] {
    const data: { x: number; y: number; v: number }[] = [];
    for (let d = 0; d < 7; d++) {
        for (let t = 0; t < 5; t++) {
            data.push({ x: d, y: t, v: 0 });
        }
    }
    return data;
}

// 何曜日の何時に何件を配列として格納してreturnする関数
function mapColorUpdate(dataAaary: ReserveRecord[]) {
    const mockData = createMockData();
    dataAaary.forEach(data => {
        const time = TIMES.indexOf(data.time.slice(0, 5));
        const date = new Date(data.date).getDay();
        
        mockData.forEach((mock) => {
            if(mock.x === date && mock.y === time){
                mock.v ++;
            }
        });
    }); 

    return mockData;
}

/*
 *  △△△ グラフデータ取得ここまで △△△
 **********************************************/
declare const Chart: new (ctx: HTMLCanvasElement, config: object) => { destroy?: () => void };

let heatmapChartInstance: { destroy?: () => void } | null = null;

const initHeatmap = async () => {
    const heatmapCtx = document.getElementById('heatmapChart') as HTMLCanvasElement | null;
    if (!heatmapCtx) return;

    const isUserOnly = toggleText[0]?.classList.contains('active') ?? false;
    const heatmapData = await promiseDataOpen(isUserOnly);

    if (heatmapChartInstance) {
        heatmapChartInstance.destroy?.();
        heatmapChartInstance = null;
    }
    
    let maxVal = 0;

    heatmapData.forEach((data) => {
        if(maxVal < data.v){
            maxVal = data.v;
        }
    });
    
    heatmapChartInstance = new Chart(heatmapCtx, {
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
    const dlEl = document.querySelectorAll('.graph_map_box dl');
    let elCounter = 0;

    const colorValues = [1, 0.5, 0.1];
    const textValues = [`${maxVal}件〜`, `${maxVal / 2}件〜`, `〜0件`];
    // const textValues = ['10', '5', '0'];
    dlEl.forEach((el) => {
        const color = colorValues[elCounter] ?? 0;
        elCounter++;
        
        const dtEl = el.querySelector('dt');
        const ddEl = el.querySelector('dd');
        
        if(dtEl && ddEl){
            dtEl.style.backgroundColor = `rgba(30, 170, 162,${color})`;
            ddEl.textContent = textValues[elCounter-1] ?? 0;
        }
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
