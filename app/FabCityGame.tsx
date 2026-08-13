"use client";

import { CSSProperties, PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type ResourceState = {
  credits: number;
  energy: number;
  water: number;
  contamination: number;
  yield: number;
};

type Stage = {
  name: string;
  english: string;
  symbol: string;
  x: number;
  y: number;
  color: string;
  energy: number;
  water: number;
  credits: number;
  contamination: number;
  loss: number;
  short: string;
  detail: string;
  check: string;
};

type FabEvent = {
  title: string;
  icon: string;
  description: string;
  safe: string;
  risky: string;
  safeCost: number;
  safeLoss: number;
  riskyLoss: number;
  contamination: number;
};

const INITIAL_RESOURCES: ResourceState = {
  credits: 920,
  energy: 100,
  water: 100,
  contamination: 4,
  yield: 99.4,
};

const STAGES: Stage[] = [
  {
    name: "矽原料・單晶",
    english: "CRYSTAL PULL",
    symbol: "Si",
    x: 55,
    y: 62,
    color: "#ffb84d",
    energy: 6,
    water: 2,
    credits: 34,
    contamination: 0.4,
    loss: 0.05,
    short: "把超高純度多晶矽熔融，以種晶拉出原子排列一致的單晶矽柱。",
    detail:
      "天然矽礦先經冶煉與化學純化成電子級多晶矽。常見 CZ 法把多晶矽熔融，讓種晶旋轉並緩慢拉升，長成單晶矽錠；微量硼或磷可在此調整電阻率。",
    check: "不是把沙子直接壓成晶片；先要得到極高純度、晶格一致的單晶材料。",
  },
  {
    name: "晶圓成形",
    english: "WAFER PREP",
    symbol: "◉",
    x: 275,
    y: 42,
    color: "#93d8ff",
    energy: 4,
    water: 8,
    credits: 30,
    contamination: 0.3,
    loss: 0.06,
    short: "將矽錠切片、整邊、研磨、蝕洗與鏡面拋光，得到超平坦晶圓。",
    detail:
      "線鋸把矽錠切成薄片，再經倒角、研磨、化學蝕洗、拋光與清洗。晶圓此時只是乾淨、超平坦的基板，尚未形成完整電路。",
    check: "晶圓不是一顆晶片；一片晶圓上會同時製造許多相同的裸晶。",
  },
  {
    name: "氧化・薄膜",
    english: "OXIDE FILM",
    symbol: "O₂",
    x: 500,
    y: 72,
    color: "#7fe0c3",
    energy: 7,
    water: 4,
    credits: 42,
    contamination: 0.5,
    loss: 0.07,
    short: "在矽表面生長氧化層，或加入絕緣、半導體與導電薄膜。",
    detail:
      "熱氧化會消耗一部分表面矽並長出二氧化矽；沉積則把外來材料加到表面。這些薄膜可作為絕緣層、硬遮罩、閘極或後續結構材料。",
    check: "氧化與沉積都能形成薄膜，但材料來源與機制不同，不能完全畫上等號。",
  },
  {
    name: "光刻",
    english: "LITHOGRAPHY",
    symbol: "UV",
    x: 735,
    y: 48,
    color: "#ffeb6b",
    energy: 8,
    water: 4,
    credits: 54,
    contamination: 0.8,
    loss: 0.1,
    short: "塗佈光阻，透過光罩投影圖案，再顯影成暫時的保護模板。",
    detail:
      "晶圓先旋塗光阻並烘烤；DUV 或 EUV 光刻系統把光罩圖案縮小投影到光阻，曝光後顯影。留下的光阻圖案指示下一步要加工的位置。",
    check: "光刻主要是在光阻上成像；真正移除或改變下層材料通常由蝕刻、植入等步驟完成。",
  },
  {
    name: "蝕刻",
    english: "ETCH",
    symbol: "▽",
    x: 800,
    y: 205,
    color: "#ff8f70",
    energy: 7,
    water: 5,
    credits: 46,
    contamination: 0.8,
    loss: 0.12,
    short: "依照光阻或硬遮罩開口，選擇性移除下方材料，刻出線、孔與溝槽。",
    detail:
      "乾式蝕刻常以電漿中的活性物種與離子塑形，濕式蝕刻則以化學液體溶解除去材料。製程要兼顧方向性、選擇比與對下層的損傷。",
    check: "蝕刻不是任意雕刻；遮罩、化學反應與電漿條件共同決定哪裡被移除。",
  },
  {
    name: "摻雜・離子植入",
    english: "ION IMPLANT",
    symbol: "B⁺",
    x: 575,
    y: 230,
    color: "#d9a4ff",
    energy: 7,
    water: 2,
    credits: 45,
    contamination: 0.6,
    loss: 0.1,
    short: "把精確劑量的離子送入矽中，調整局部導電特性，再以退火修復晶格。",
    detail:
      "硼、磷或砷等摻雜原子可改變載子濃度。離子植入用電場加速離子並控制劑量與深度；後續退火讓摻雜原子電性活化並修復植入造成的晶格損傷。",
    check: "摻雜不是鋪一條金屬線，而是精確改變半導體區域的電性。",
  },
  {
    name: "精密沉積",
    english: "DEPOSITION",
    symbol: "ALD",
    x: 340,
    y: 208,
    color: "#62d7df",
    energy: 8,
    water: 3,
    credits: 52,
    contamination: 0.6,
    loss: 0.08,
    short: "以 CVD、PVD、ALD 或磊晶等方法，加入受控厚度與成分的新材料。",
    detail:
      "不同沉積技術用化學反應、物理濺鍍或逐層表面反應形成薄膜。材料可為介電質、金屬或半導體；越複雜的三維結構越重視均勻性與覆蓋能力。",
    check: "沉積是加材料；蝕刻是去材料，兩者配合才形成精細結構。",
  },
  {
    name: "CMP 平坦化",
    english: "PLANARIZE",
    symbol: "CMP",
    x: 92,
    y: 245,
    color: "#79c7ff",
    energy: 5,
    water: 9,
    credits: 43,
    contamination: 0.4,
    loss: 0.09,
    short: "用化學漿料與旋轉墊精準拋光，為下一層建立平坦基準面。",
    detail:
      "化學機械平坦化同時利用化學作用與磨料移除凸起或多餘材料。均勻度與終點控制很重要，過度拋光也可能傷到關鍵結構。",
    check: "CMP 不只是把晶圓擦亮；它會有選擇地移除材料並控制全片平坦度。",
  },
  {
    name: "金屬互連",
    english: "INTERCONNECT",
    symbol: "Cu",
    x: 55,
    y: 410,
    color: "#f2a65a",
    energy: 8,
    water: 6,
    credits: 58,
    contamination: 0.7,
    loss: 0.12,
    short: "在介電層中形成導線、接點與通孔，把數十億個元件接成電路。",
    detail:
      "先在絕緣材料中做出溝槽與通孔，再加入阻障／襯裡與銅、鎢、鈷等導體，最後常以 CMP 去除表面多餘金屬。互連同時承擔訊號、時脈與電源配送。",
    check: "電晶體只是元件；沒有精密的多層互連，它們無法組成可運作的晶片。",
  },
  {
    name: "多層製程",
    english: "LAYER LOOP ×3",
    symbol: "×3",
    x: 280,
    y: 382,
    color: "#80e694",
    energy: 5,
    water: 5,
    credits: 38,
    contamination: 0.5,
    loss: 0.08,
    short: "重複沉積、光刻、蝕刻、植入與平坦化，逐層堆出元件和布線。",
    detail:
      "真實晶片不是跑一次直線流程：前段形成元件，中段建立接點，後段堆疊互連；清洗、量測與檢查穿插其中。先進晶片可能需要數十至上百個對準的圖案層與數千個步驟。",
    check: "遊戲用 3 輪代表大量重複；這是教學壓縮，不等於工廠只做三層。",
  },
  {
    name: "晶圓測試",
    english: "WAFER SORT",
    symbol: "✓?",
    x: 515,
    y: 420,
    color: "#a7e46c",
    energy: 4,
    water: 1,
    credits: 35,
    contamination: 0.2,
    loss: 0.04,
    short: "探針逐顆接觸晶圓上的裸晶，做電性與功能測試並建立良率地圖。",
    detail:
      "探針台與自動測試設備會檢查開短路、參數和邏輯功能，標記不合格裸晶並收集性能資料。測到的良率也會回饋前段製程改善。",
    check: "晶圓測試能篩除明顯失效品，但完整可靠度與系統條件仍需後段測試。",
  },
  {
    name: "切割",
    english: "SINGULATION",
    symbol: "✣",
    x: 760,
    y: 382,
    color: "#ffca7a",
    energy: 3,
    water: 5,
    credits: 28,
    contamination: 0.4,
    loss: 0.06,
    short: "沿切割道把整片晶圓分成獨立裸晶，挑出測試合格的晶粒。",
    detail:
      "晶圓先貼附保護膠帶，再用鑽石刀片、雷射或其他方法沿切割道分離。切屑、機械應力與邊緣破損都必須控制。",
    check: "被切開的小方片叫裸晶（die）；完成封裝與測試後才成為可交付的晶片產品。",
  },
  {
    name: "封裝",
    english: "PACKAGING",
    symbol: "▣",
    x: 720,
    y: 522,
    color: "#ff9db1",
    energy: 5,
    water: 2,
    credits: 52,
    contamination: 0.3,
    loss: 0.08,
    short: "固定裸晶、建立外部電氣連接，並提供機械保護與散熱路徑。",
    detail:
      "裸晶可透過打線、凸塊或覆晶連到導線架／基板，再封膠、加蓋或組成多晶粒封裝。封裝同時處理 I/O、供電、散熱與環境保護。",
    check: "封裝不只是外殼；它是晶片連到系統、取得電力並排出熱量的工程介面。",
  },
  {
    name: "最終測試",
    english: "FINAL TEST",
    symbol: "OK",
    x: 465,
    y: 520,
    color: "#65e6b3",
    energy: 4,
    water: 1,
    credits: 38,
    contamination: 0.1,
    loss: 0.03,
    short: "在封裝後驗證功能、性能、功耗與溫度條件，分級後才準備出貨。",
    detail:
      "自動測試設備在指定電壓與溫度下檢查功能、時序、功耗和 I/O。產品可能依性能分級；依需求還會加入燒機、可靠度或系統級測試。",
    check: "通過晶圓測試不代表結束；封裝也可能引入問題，必須再做最終測試。",
  },
];

const EVENTS: FabEvent[] = [
  {
    title: "微粒超標",
    icon: "✦",
    description: "空氣中的微粒可能讓細線斷路或短路。要停線清潔，還是冒險繼續？",
    safe: "停線清潔",
    risky: "繼續這批",
    safeCost: 44,
    safeLoss: 0.1,
    riskyLoss: 1.8,
    contamination: 8,
  },
  {
    title: "圖案對位偏移",
    icon: "⌖",
    description: "本層圖案與前一層的對準出現漂移，可能讓接點錯位。",
    safe: "重新校正",
    risky: "放寬規格",
    safeCost: 58,
    safeLoss: 0.15,
    riskyLoss: 2.4,
    contamination: 3,
  },
  {
    title: "膜厚不均",
    icon: "≋",
    description: "邊緣與中心的膜厚差變大，後續圖案焦距與電性都會受影響。",
    safe: "重調配方",
    risky: "直接過站",
    safeCost: 48,
    safeLoss: 0.12,
    riskyLoss: 2.0,
    contamination: 4,
  },
  {
    title: "CMP 終點漂移",
    icon: "≈",
    description: "拋光速率改變，繼續下去可能磨穿下方關鍵結構。",
    safe: "換墊量測",
    risky: "照表拋光",
    safeCost: 52,
    safeLoss: 0.08,
    riskyLoss: 2.2,
    contamination: 5,
  },
];

const SOURCE_LINKS = [
  ["SUMCO｜單晶與晶圓製造", "https://www.sumcosi.com/english/products/process/"],
  ["ASML｜光刻原理", "https://www.asml.com/en/technology/lithography-principles"],
  ["Applied Materials｜CMP", "https://www.appliedmaterials.com/in/en/semiconductor/products/processes/cmp.html"],
  ["Intel｜封裝流程", "https://newsroom.intel.com/tech101/how-silicon-die-become-chip-packages"],
  ["Intel Foundry｜晶圓與最終測試", "https://www.intel.com/content/www/us/en/foundry/packaging.html"],
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function FabCityGame() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(0);
  const [layerCycle, setLayerCycle] = useState(0);
  const [selected, setSelected] = useState(0);
  const [resources, setResources] = useState<ResourceState>(INITIAL_RESOURCES);
  const [position, setPosition] = useState({ x: 24, y: 118 });
  const [settledPosition, setSettledPosition] = useState({ x: 24, y: 118 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [event, setEvent] = useState<{ data: FabEvent; stage: number } | null>(null);
  const [message, setMessage] = useState("第一批晶圓已進廠。點擊發光建築，或把晶圓拖過去。 ");
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [completeDismissed, setCompleteDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const selectedStage = STAGES[selected];
  const batchComplete = completed >= STAGES.length;
  const progress = Math.round((completed / STAGES.length) * 100);
  const grade = resources.yield >= 96 ? "A" : resources.yield >= 91 ? "B" : resources.yield >= 85 ? "C" : "D";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fab-city-save-v1");
      if (raw) {
        const save = JSON.parse(raw);
        setCompleted(clamp(Number(save.completed) || 0, 0, STAGES.length));
        setLayerCycle(clamp(Number(save.layerCycle) || 0, 0, 2));
        if (save.resources) setResources(save.resources);
        if (save.position) {
          setPosition(save.position);
          setSettledPosition(save.position);
        }
        setMessage("已載入這台裝置上的晶圓批次進度。");
      }
    } catch {
      setMessage("儲存資料無法讀取，已開啟新的晶圓批次。");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      "fab-city-save-v1",
      JSON.stringify({ completed, layerCycle, resources, position: settledPosition }),
    );
  }, [completed, layerCycle, resources, settledPosition, loaded]);

  const nextLabel = useMemo(() => {
    if (batchComplete) return "本批完成";
    if (completed === 9) return `多層循環 ${layerCycle + 1} / 3`;
    return `下一站 ${String(completed + 1).padStart(2, "0")} · ${STAGES[completed].name}`;
  }, [batchComplete, completed, layerCycle]);

  const finishProcess = (stageIndex: number, eventLoss = 0) => {
    const stage = STAGES[stageIndex];
    setResources((current) => ({
      ...current,
      contamination: clamp(current.contamination + stage.contamination, 0, 100),
      yield: clamp(
        current.yield - stage.loss - current.contamination * 0.012 - eventLoss,
        0,
        100,
      ),
    }));

    if (stageIndex === 9 && layerCycle < 2) {
      const nextCycle = layerCycle + 1;
      setLayerCycle(nextCycle);
      setMessage(`第 ${nextCycle} 層循環完成。真實晶片會重複更多次，請再執行下一層。`);
      return;
    }

    setCompleted(stageIndex + 1);
    setSelected(Math.min(stageIndex + 1, STAGES.length - 1));
    if (stageIndex === STAGES.length - 1) {
      setCompleteDismissed(false);
      setMessage("批次完成！你把單晶矽變成了通過最終測試的晶片。 ");
    } else {
      setMessage(`${stage.name}完成，已解鎖「${STAGES[stageIndex + 1].name}」。`);
    }
  };

  const beginProcess = (stageIndex: number) => {
    setSelected(stageIndex);
    if (processing || event) return;
    if (stageIndex < completed) {
      setMessage(`「${STAGES[stageIndex].name}」已完成；右側可以複習它的作用。`);
      return;
    }
    if (stageIndex > completed || batchComplete) {
      setMessage(batchComplete ? "本批已完成，可以查看知識庫或重新開一批。" : "製程順序不對：先完成發光的下一站。 ");
      return;
    }

    const stage = STAGES[stageIndex];
    if (
      resources.energy < stage.energy ||
      resources.water < stage.water ||
      resources.credits < stage.credits
    ) {
      setMessage("資源不足。使用上方補給按鈕，再重新啟動這一站。 ");
      return;
    }

    const target = { x: stage.x + 62, y: stage.y + 82 };
    setPosition(target);
    setSettledPosition(target);
    setProcessing(true);
    setMessage(`${stage.name}運轉中… 控制溫度、時間、材料與潔淨度。`);
    setResources((current) => ({
      ...current,
      energy: current.energy - stage.energy,
      water: current.water - stage.water,
      credits: current.credits - stage.credits,
    }));

    window.setTimeout(() => {
      const eventChance = stageIndex > 1 ? 0.3 : 0.12;
      if (Math.random() < eventChance) {
        const data = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setEvent({ data, stage: stageIndex });
        setMessage("製程警報：請決定如何處理這次偏差。 ");
      } else {
        finishProcess(stageIndex);
      }
      setProcessing(false);
    }, 900);
  };

  const resolveEvent = (safe: boolean) => {
    if (!event) return;
    const activeEvent = event;
    setResources((current) => ({
      ...current,
      credits: safe ? Math.max(0, current.credits - activeEvent.data.safeCost) : current.credits,
      contamination: safe
        ? Math.max(0, current.contamination - 2)
        : clamp(current.contamination + activeEvent.data.contamination, 0, 100),
    }));
    setEvent(null);
    finishProcess(activeEvent.stage, safe ? activeEvent.data.safeLoss : activeEvent.data.riskyLoss);
  };

  const replenish = (kind: "energy" | "water" | "clean") => {
    if (resources.credits < 45) {
      setMessage("製程點數不足，完成更多站點後再安排補給。 ");
      return;
    }
    setResources((current) => {
      if (kind === "energy") return { ...current, credits: current.credits - 45, energy: Math.min(100, current.energy + 28) };
      if (kind === "water") return { ...current, credits: current.credits - 45, water: Math.min(100, current.water + 30) };
      return { ...current, credits: current.credits - 60, contamination: Math.max(0, current.contamination - 10) };
    });
    setMessage(kind === "clean" ? "無塵室完成深度清潔，污染風險下降。" : "公用系統補給完成。 ");
  };

  const resetGame = () => {
    setCompleted(0);
    setLayerCycle(0);
    setSelected(0);
    setResources(INITIAL_RESOURCES);
    setPosition({ x: 24, y: 118 });
    setSettledPosition({ x: 24, y: 118 });
    setEvent(null);
    setProcessing(false);
    setCompleteDismissed(false);
    setMessage("新批次已進廠。從矽原料與單晶開始。 ");
    localStorage.removeItem("fab-city-save-v1");
  };

  const onWaferPointerDown = (pointerEvent: PointerEvent<HTMLButtonElement>) => {
    if (processing || event || batchComplete) return;
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    setDragging(true);
  };

  const onWaferPointerMove = (pointerEvent: PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !mapRef.current) return;
    const bounds = mapRef.current.getBoundingClientRect();
    setPosition({
      x: clamp(pointerEvent.clientX - bounds.left - 22, 6, 990),
      y: clamp(pointerEvent.clientY - bounds.top - 22, 6, 596),
    });
  };

  const onWaferPointerUp = (pointerEvent: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    setDragging(false);
    const targetStage = STAGES[completed];
    if (!targetStage) return;
    const target = { x: targetStage.x + 62, y: targetStage.y + 82 };
    const distance = Math.hypot(position.x - target.x, position.y - target.y);
    if (distance < 105) beginProcess(completed);
    else {
      setPosition(settledPosition);
      setMessage("晶圓必須送到目前發光的製程站。也可以直接點擊建築。 ");
    }
  };

  const riskClass = resources.contamination < 12 ? "good" : resources.contamination < 28 ? "warn" : "danger";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-chip" aria-hidden="true">FC</span>
          <div>
            <p className="eyebrow">LOW-POLY SEMICONDUCTOR SIM</p>
            <h1>晶圓城 <span>FAB CITY</span></h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="knowledge-button" onClick={() => setKnowledgeOpen(true)}>製程知識庫 <span>14</span></button>
        </div>
      </header>

      <section className="resource-bar" aria-label="工廠資源">
        <div className="resource-card credits"><span>製程點數</span><strong>{Math.round(resources.credits)}</strong><small>CR</small></div>
        <div className="resource-card"><span>能源</span><strong>{Math.round(resources.energy)}</strong><small>%</small></div>
        <div className="resource-card"><span>超純水</span><strong>{Math.round(resources.water)}</strong><small>%</small></div>
        <div className={`resource-card ${riskClass}`}><span>污染指數</span><strong>{resources.contamination.toFixed(1)}</strong><small>越低越好</small></div>
        <div className="yield-card">
          <div><span>預估良率</span><strong>{resources.yield.toFixed(1)}%</strong></div>
          <div className="meter"><i style={{ width: `${resources.yield}%` }} /></div>
        </div>
        <div className="supply-actions">
          <button onClick={() => replenish("energy")}>+ 能源</button>
          <button onClick={() => replenish("water")}>+ 超純水</button>
          <button onClick={() => replenish("clean")}>深度清潔</button>
        </div>
      </section>

      <div className="game-layout">
        <section className="city-card" aria-label="晶圓城互動地圖">
          <div className="city-toolbar">
            <div>
              <span className="live-dot" />
              <strong>{nextLabel}</strong>
            </div>
            <div className="progress-label"><span>{completed}/{STAGES.length} 站</span><b>{progress}%</b></div>
          </div>

          <div className="map-scroll">
            <div className="fab-world" ref={mapRef}>
              <div className="terrain mountain-one" />
              <div className="terrain mountain-two" />
              <div className="water-plant"><i /><span>UPW</span></div>
              <div className="power-plant"><i /><i /><span>PWR</span></div>
              <div className="conveyor road-a" />
              <div className="conveyor road-b" />
              <div className="conveyor road-c" />

              {STAGES.map((stage, index) => {
                const status = index < completed ? "done" : index === completed && !batchComplete ? "active" : "locked";
                const isLayerActive = index === 9 && status === "active";
                const style = {
                  left: stage.x,
                  top: stage.y,
                  "--accent": stage.color,
                } as CSSProperties;
                return (
                  <button
                    type="button"
                    className={`station ${status} ${selected === index ? "selected" : ""}`}
                    style={style}
                    key={stage.name}
                    onClick={() => beginProcess(index)}
                    aria-label={`${index + 1}. ${stage.name}，${status === "done" ? "已完成" : status === "active" ? "可進行" : "尚未解鎖"}`}
                  >
                    <span className="station-tile" />
                    <span className="factory-shadow" />
                    <span className="factory-block"><i>{stage.symbol}</i><b /><em /></span>
                    <span className="station-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="station-name">{stage.name}</span>
                    {status === "done" && <span className="done-mark">✓</span>}
                    {isLayerActive && <span className="cycle-mark">{layerCycle}/3</span>}
                  </button>
                );
              })}

              <button
                type="button"
                className={`wafer-token ${dragging ? "dragging" : ""} ${processing ? "processing" : ""}`}
                style={{ left: position.x, top: position.y }}
                onPointerDown={onWaferPointerDown}
                onPointerMove={onWaferPointerMove}
                onPointerUp={onWaferPointerUp}
                aria-label="可拖曳晶圓批次"
              >
                <span>WAFER</span>
              </button>

              <div className="map-hint"><b>拖曳晶圓</b><span>或點擊發光建築開始製程</span></div>
              {processing && <div className="processing-pill"><i /> 製程運轉中</div>}
            </div>
          </div>

          <div className="message-strip" role="status"><span>FAB LOG</span><p>{message}</p></div>
        </section>

        <aside className="info-panel" aria-label="製程站說明">
          <div className="panel-kicker"><span>STATION {String(selected + 1).padStart(2, "0")}</span><b>{selected < completed ? "已完成" : selected === completed && !batchComplete ? "等待進站" : "製程檔案"}</b></div>
          <div className="panel-icon" style={{ "--accent": selectedStage.color } as CSSProperties}>{selectedStage.symbol}</div>
          <p className="panel-english">{selectedStage.english}</p>
          <h2>{selectedStage.name}</h2>
          <p className="panel-summary">{selectedStage.short}</p>
          <div className="fact-box"><span>技術重點</span><p>{selectedStage.detail}</p></div>
          <div className="truth-box"><span>別搞混</span><p>{selectedStage.check}</p></div>
          <div className="cost-row">
            <span>本次消耗</span>
            <b>⚡ {selectedStage.energy}</b>
            <b>水 {selectedStage.water}</b>
            <b>{selectedStage.credits} CR</b>
          </div>
          {selected === completed && !batchComplete && (
            <button className="process-button" onClick={() => beginProcess(selected)} disabled={processing || !!event}>
              {processing ? "運轉中…" : selected === 9 ? `執行第 ${layerCycle + 1} 層循環` : "送入這一站"}
            </button>
          )}
          <button className="panel-link" onClick={() => setKnowledgeOpen(true)}>打開完整知識庫 →</button>
        </aside>
      </div>

      <section className="flow-strip" aria-labelledby="flow-title">
        <div className="flow-heading"><p className="eyebrow">THE WHOLE JOURNEY</p><h2 id="flow-title">從一根矽柱，到一顆可用晶片</h2></div>
        <div className="flow-list">
          {STAGES.map((stage, index) => (
            <button key={stage.name} className={index < completed ? "done" : index === completed ? "active" : ""} onClick={() => { setSelected(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span>{String(index + 1).padStart(2, "0")}</span><b>{stage.name}</b>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <div><b>晶圓城 FAB CITY</b><span>一個把複雜製程壓縮成可玩流程的互動教材。</span></div>
        <button onClick={() => setKnowledgeOpen(true)}>知識來源與自我審核</button>
      </footer>

      {event && (
        <div className="modal-backdrop" role="presentation">
          <section className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-title">
            <span className="alarm">PROCESS ALERT</span>
            <div className="event-icon">{event.data.icon}</div>
            <h2 id="event-title">{event.data.title}</h2>
            <p>{event.data.description}</p>
            <div className="event-choices">
              <button className="safe-choice" onClick={() => resolveEvent(true)}>
                <span>保守處置</span><strong>{event.data.safe}</strong><small>−{event.data.safeCost} CR · 良率影響較小</small>
              </button>
              <button className="risk-choice" onClick={() => resolveEvent(false)}>
                <span>冒險趕工</span><strong>{event.data.risky}</strong><small>免費 · 可能損失 {event.data.riskyLoss.toFixed(1)}% 良率</small>
              </button>
            </div>
          </section>
        </div>
      )}

      {batchComplete && !event && !completeDismissed && (
        <div className="complete-banner" role="dialog" aria-label="批次完成">
          <div className="grade"><span>良率評級</span><strong>{grade}</strong></div>
          <div><p>LOT #FC-001 · 製造完成</p><h2>{resources.yield.toFixed(1)}% 良率，晶片準備出貨。</h2><span>你完成了 14 站；真實晶圓廠會把中段迴圈重複數十至上百次。</span></div>
          <button onClick={resetGame}>再開一批</button>
          <button className="close-banner" onClick={() => setCompleteDismissed(true)} aria-label="收起完成訊息">×</button>
        </div>
      )}

      {knowledgeOpen && (
        <div className="knowledge-overlay" role="dialog" aria-modal="true" aria-labelledby="knowledge-title">
          <div className="knowledge-shell">
            <header>
              <div><p className="eyebrow">VERIFIED KNOWLEDGE BASE</p><h2 id="knowledge-title">半導體製造，14 站看懂</h2><span>簡潔版 · 已依一手技術資料交叉檢查</span></div>
              <button onClick={() => setKnowledgeOpen(false)} aria-label="關閉知識庫">×</button>
            </header>
            <div className="knowledge-intro">
              <b>先記住一件事</b>
              <p>晶片不是被「印」一次就完成。工廠反覆加材料、用光定義圖案、選擇性移除或改變材料，再量測與清洗；最後才測試、切開並封裝。</p>
            </div>
            <div className="knowledge-grid">
              {STAGES.map((stage, index) => (
                <article key={stage.name} style={{ "--accent": stage.color } as CSSProperties}>
                  <div><span>{String(index + 1).padStart(2, "0")}</span><i>{stage.symbol}</i></div>
                  <h3>{stage.name}</h3>
                  <p>{stage.detail}</p>
                  <small><b>校正：</b>{stage.check}</small>
                </article>
              ))}
            </div>
            <section className="audit-section">
              <div><p className="eyebrow">SELF-AUDIT</p><h2>我們回頭抓了 6 個常見錯誤</h2></div>
              <ol>
                <li><b>「沙子直接變晶片」</b><span>修正：矽礦先被精煉與化學純化成電子級多晶矽，再長成單晶。</span></li>
                <li><b>「光刻機把線路刻進矽」</b><span>修正：光刻先在光阻成像；下層材料多由蝕刻、植入等站加工。</span></li>
                <li><b>「氧化就是沉積」</b><span>修正：熱氧化消耗表面矽長膜；沉積把新的外來材料加到表面。</span></li>
                <li><b>「流程只跑一遍」</b><span>修正：前段元件與後段互連需要大量重複，清洗、量測和檢查也穿插其間。</span></li>
                <li><b>「晶圓測試等於最終測試」</b><span>修正：晶圓測試先篩裸晶；封裝後仍要再驗證功能、性能與功耗。</span></li>
                <li><b>「良率是單一機台決定」</b><span>修正：良率是材料、設計、所有製程與缺陷密度共同作用的結果；遊戲只做教學化估算。</span></li>
              </ol>
            </section>
            <section className="sources-section">
              <div><p className="eyebrow">PRIMARY SOURCES</p><h2>核對依據</h2></div>
              <div>{SOURCE_LINKS.map(([label, url]) => <a href={url} target="_blank" rel="noreferrer" key={url}>{label}<span>↗</span></a>)}</div>
            </section>
            <button className="close-knowledge" onClick={() => setKnowledgeOpen(false)}>回到晶圓城</button>
          </div>
        </div>
      )}
    </main>
  );
}
