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
/*************** ▽▽▽ ロードアニメーション ▽▽▽ *****************/
const loadeBox = document.querySelector('.loade_view');
// ランダムな数値の生成
const getLoadingTime = () => {
    const min = 3;
    const max = 5;
    // 4〜7: number のいずれかを生成して 1000倍する
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
};
const startLoading = () => __awaiter(void 0, void 0, void 0, function* () {
    const delay = getLoadingTime();
    console.log(delay);
    yield new Promise(resolve => setTimeout(resolve, delay));
    loadeBox.style.opacity = "0";
    loadeBox.style.transform = "translateX(100vw)";
    setTimeout(() => {
        loadeBox.style.display = 'none';
    }, 5000);
});
if (loadeBox) {
    startLoading();
}
/*************** △△△ ロードアニメーション △△△ *****************/
/*************** ▽▽▽ navの表示/非表示切り替え ▽▽▽ *****************/
const navToggleBtn = document.querySelector('.nav_head button');
const periodBtn = document.querySelectorAll('.period_btn');
if (navToggleBtn) {
    navToggleBtn.addEventListener('click', () => {
        navToggleBtn.classList.toggle('close');
        periodBtn.forEach((btn) => {
            btn.classList.toggle('close');
        });
    });
}
// 非同期データ取得
const getGraphData = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('/reserve/api/reservation/getData/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const promiseData = yield response.json();
    return promiseData;
});
const promiseDataOpen = () => __awaiter(void 0, void 0, void 0, function* () {
    // Promiseデータの開封
    const openData = yield getGraphData();
    const allReserveData = openData.all_reserve_data;
    const userReserveData = openData.user_reserve_data;
    dataSort(userReserveData);
});
promiseDataOpen();
// 何曜日の何時に何件を配列として格納してreturnする関数
function dataSort(dataAaary) {
    let sortData = [];
    let dateCounter = 0;
    dataAaary.forEach(data => {
        let date = new Date(data.date).getDay();
    });
    return sortData;
}
const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];
function createMockData() {
    const data = [];
    for (let d = 0; d < 7; d++) {
        for (let t = 0; t < 5; t++) {
            data.push({ x: d, y: t, v: Math.floor(Math.random() * 21) });
        }
    }
    return data;
}
function initHeatmap() {
    const heatmapCtx = document.getElementById('heatmapChart');
    if (!heatmapCtx)
        return;
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
                    backgroundColor: (ctx) => {
                        var _a, _b;
                        const v = (_b = (_a = ctx.raw) === null || _a === void 0 ? void 0 : _a.v) !== null && _b !== void 0 ? _b : 0;
                        const alpha = 0.15 + (v / maxVal) * 0.85;
                        return `rgba(30, 170, 162, ${alpha})`;
                    },
                    width: ({ chart }) => { var _a, _b; return (((_b = (_a = chart.chartArea) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 300) / 7) - 1; },
                    height: ({ chart }) => { var _a, _b; return (((_b = (_a = chart.chartArea) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 200) / 5) - 1; },
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
                        title: (items) => {
                            var _a, _b, _c;
                            const r = (_a = items[0]) === null || _a === void 0 ? void 0 : _a.raw;
                            if (r == null)
                                return '';
                            return `${DAYS[(_b = r.x) !== null && _b !== void 0 ? _b : 0]} ${TIMES[(_c = r.y) !== null && _c !== void 0 ? _c : 0]}`;
                        },
                        label: (ctx) => {
                            var _a, _b;
                            const v = (_b = (_a = ctx.raw) === null || _a === void 0 ? void 0 : _a.v) !== null && _b !== void 0 ? _b : 0;
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
                        callback: (_, i) => { var _a; return (_a = DAYS[i]) !== null && _a !== void 0 ? _a : ''; },
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
                        callback: (_, i) => { var _a; return (_a = TIMES[i]) !== null && _a !== void 0 ? _a : ''; },
                    },
                },
            },
        },
    });
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeatmap);
    }
    else {
        initHeatmap();
    }
}
/*************** △△△ 予約集中ヒートマップ △△△ *****************/
