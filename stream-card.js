(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports
      ? require("./potion-costs")
      : root.MaplePotionCosts,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MapleStreamCard = api;
})(typeof window === "undefined" ? globalThis : window, function (PotionCosts) {
  function metrics(state, now, required, totalExp) {
    const samples = (Array.isArray(state.samples) ? state.samples : [])
        .filter(
          (s) =>
            Number.isInteger(s.level) &&
            s.level >= 1 &&
            s.level <= 100 &&
            Number.isFinite(s.exp) &&
            s.exp >= 0 &&
            Number.isFinite(s.t) &&
            s.t <= now,
        )
        .sort((a, b) => a.t - b.t),
      latest = samples.at(-1),
      base = samples.find((s) => s.t >= now - 300000);
    const level = latest?.level ?? state.level,
      need = required(level),
      exp = latest?.exp || 0;
    const rate =
      base && latest && latest.t > base.t
        ? Math.max(
            0,
            (totalExp(latest) - totalExp(base)) /
              ((latest.t - base.t) / 3600000),
          )
        : 0;
    const remaining =
      need > 0 && rate > 0
        ? Math.max(0, ((need - exp) / rate) * 3600000)
        : null;
    const eta =
      level === 100
        ? "MAX LEVEL"
        : remaining === null
          ? "Waiting for EXP"
          : remaining < 60000
            ? "Under 1 min"
            : remaining < 3600000
              ? Math.round(remaining / 60000) + " min"
              : Math.floor(remaining / 3600000) +
                "h " +
                Math.floor((remaining % 3600000) / 60000) +
                "m";
    return {
      level:
        Number.isInteger(level) && level >= 1 && level <= 100
          ? String(level)
          : "—",
      rate: rate
        ? (base?.estimated || latest?.estimated ? "~" : "") +
          Math.round(rate).toLocaleString("en-US")
        : "—",
      percent: need ? Math.max(0, Math.min(100, (exp / need) * 100)) : 0,
      eta,
      status:
        !state.updatedAt || now - state.updatedAt > 20000
          ? "TRACKER OFFLINE"
          : state.running
            ? "TRACKING"
            : "PAUSED",
    };
  }
  function potionCostRates(state, now) {
    const costs = PotionCosts.metrics(state, now);
    return { hp: costs.hp, mp: costs.mp };
  }
  function mesoMetrics(state, now) {
    const samples = (Array.isArray(state.mesoSamples) ? state.mesoSamples : [])
        .filter((s) => Number.isSafeInteger(s.amount) && s.amount >= 0 && Number.isFinite(s.t) && s.t <= now)
        .sort((a, b) => a.t - b.t),
      latest = samples.at(-1),
      base = samples.find((s) => s.t >= now - 300000),
      elapsed = latest && base ? latest.t - base.t : 0,
      rate = elapsed >= 60000 ? ((latest.amount - base.amount) * 3600000) / elapsed : null;
    return {
      amount: latest && now - latest.t <= 120000 ? latest.amount.toLocaleString("en-US") : "—",
      rate: rate === null || !latest || now - latest.t > 120000
        ? "—"
        : (rate > 0 ? "+" : rate < 0 ? "−" : "") + Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Math.round(Math.abs(rate))),
      rateValue: rate === null || !latest || now - latest.t > 120000 ? null : rate,
    };
  }
  // Normalize adjacent readings to thirty seconds; gaps stay empty rather than implying steady gains.
  function graph(state, now, totalExp) {
    const samples = (state.samples || [])
        .filter(
          (s) =>
            Number.isFinite(s.t) &&
            s.t <= now &&
            Number.isInteger(s.level) &&
            s.level >= 1 &&
            s.level <= 100 &&
            Number.isFinite(s.exp) &&
            s.exp >= 0,
        )
        .sort((a, b) => a.t - b.t),
      points = [];
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1],
        b = samples[i],
        dt = b.t - a.t,
        gain = totalExp(b) - totalExp(a);
      if (b.t < now - 300000 || dt <= 0 || dt > 45000 || gain < 0) continue;
      points.push({
        t: b.t,
        value: (gain * 30000) / dt,
        estimated: !!(a.estimated || b.estimated),
      });
    }
    const peak = Math.max(1, ...points.map((p) => p.value)),
      step = 10 ** Math.floor(Math.log10(peak)),
      max = Math.ceil(peak / step) * step;
    let previous = null;
    const path = points
      .map((p) => {
        const x = Math.max(0, Math.min(300, (p.t - (now - 300000)) / 1000)),
          y = 68 - (p.value / max) * 62,
          move = !previous || p.t - previous.t > 45000;
        previous = p;
        return (move ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
    return { path, max, points, estimated: points.some((p) => p.estimated) };
  }
  function mount({
    document,
    window,
    storage,
    key,
    required,
    totalExp,
    now = Date.now,
  }) {
    document.title = "trackwhales · Stream card";
    document.body.classList.add("stream-card");
    document.querySelector(".app").innerHTML = `
      <section class="stream-panel" aria-label="trackwhales live stream card">
        <header><span class="stream-brand"><svg width="23" height="23" viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" d="M7 19c0-5 4-8 10-8 7 0 11 5 11 11 3 0 5-2 6-5 2 5 0 11-5 13-3 2-7 3-11 2C10 31 5 27 5 22c0-1 1-2 2-3Zm24 3c-1-5 1-9 6-10 0 5-1 8-6 10Z"/><circle cx="12" cy="19" r="1.5" fill="#181825"/></svg>trackwhales</span><span id="cardStatus">CONNECTING</span></header>
        <div class="stream-values">
          <div><span>Level</span><strong id="cardLevel">—</strong></div>
          <div><span>EXP / hour</span><strong id="cardRate">—</strong></div>
        </div>
        <div class="stream-progress"><i id="cardFill"></i></div>
        <footer><span id="cardPercent">0.00%</span><span id="cardEta">Waiting for EXP</span></footer>
        <div id="cardMapName" class="stream-map-name"></div>
        <div class="stream-metric-heading"><span>Run rates</span><span>Last 5 min</span></div>
        <div class="stream-metrics-line">
          <div><span>HP cost / hr</span><strong id="cardHpPotionCost" title="Estimated HP potion cost in mesos per hour over the trailing five minutes">—</strong></div>
          <div><span>MP cost / hr</span><strong id="cardMpPotionCost" title="Estimated MP potion cost in mesos per hour over the trailing five minutes">—</strong></div>
          <div><span>Mesos / hr</span><strong id="cardMesoRate" title="Meso balance change per hour over the trailing five minutes">—</strong></div>
        </div>
        <div class="stream-chart">
          <div class="stream-chart-label"><span>EXP / 30 sec</span><span id="cardGraphPeak">—</span></div>
          <svg class="stream-exp-svg" viewBox="0 0 342 92" role="img" aria-label="EXP gained per thirty seconds over the last five minutes">
            <defs><linearGradient id="streamExpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f5c2e7" stop-opacity=".22"/><stop offset="100%" stop-color="#f5c2e7" stop-opacity="0"/></linearGradient></defs><g fill="#a6adc8" font-size="8" font-family="Inter, Segoe UI, sans-serif" text-anchor="end">
              <text id="cardAxisTop" x="35" y="9">1</text><text id="cardAxisMid" x="35" y="40">0.5</text><text x="35" y="71">0</text>
            </g>
            <g transform="translate(42 0)">
              <path d="M0,6H300M0,37H300M0,68H300M0,6V68" stroke="#313244" stroke-opacity=".65" stroke-width="0.6" fill="none"/>
              <path id="cardGraphArea" fill="url(#streamExpFill)" stroke="none"/><path id="cardGraph" fill="none" stroke="#f5c2e7" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
              <circle id="cardGraphDot" r="2.6" fill="#f5c2e7" stroke="#181825" stroke-width="1.5" visibility="hidden"/>
            </g>
            <g fill="#7f849c" font-size="8"><text x="42" y="88">5 min ago</text><text x="342" y="88" text-anchor="end">Now</text></g>
          </svg>
          <span id="cardGraphHint">Waiting for readings</span>
        </div>
      </section>`;
    const q = (id) => document.querySelector(id);
    function render() {
      let state = {};
      try {
        state = JSON.parse(storage.getItem(key) || "{}") || {};
      } catch {}
      let potionState = {};
      try {
        potionState = JSON.parse(storage.getItem(PotionCosts.KEY) || "{}") || {};
      } catch {}
      const time = now(),
        potionCosts = potionCostRates(potionState, time),
        compact = (value) => value === null || value === undefined
          ? "—"
          : Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Math.round(value));
      q("#cardHpPotionCost").textContent = compact(potionCosts.hp);
      q("#cardMpPotionCost").textContent = compact(potionCosts.mp);
      q("#cardMesoRate").textContent = mesoMetrics(state, time).rate;
      const m = metrics(state, time, required, totalExp);
      q("#cardLevel").textContent = m.level;
      q("#cardRate").textContent = m.rate;
      q("#cardPercent").textContent = m.percent.toFixed(2) + "%";
      q("#cardFill").style.width = m.percent + "%";
      q("#cardEta").textContent =
        m.eta === "MAX LEVEL" ? m.eta : "Level up · " + m.eta;
      q("#cardStatus").textContent = m.status;
      q("#cardMapName").textContent = state.mapName
        ? "MAP · " + state.mapName
        : "MAP · SEARCHING FOR MAP";
      const g = graph(state, time, totalExp);
      q("#cardGraph").setAttribute("d", g.path);
      // Close each segment separately so missing readings stay visible as gaps.
      const segments = g.path.split(/(?=M)/).filter(Boolean);
      const area = segments.map(segment => {
        const pairs = [...segment.matchAll(/[ML]([\d.]+),([\d.]+)/g)];
        return pairs.length > 1 ? segment + "L" + pairs.at(-1)[1] + ",68L" + pairs[0][1] + ",68Z" : "";
      }).join(" ");
      q("#cardGraphArea").setAttribute("d", area);
      const coords = [...g.path.matchAll(/[ML]([\d.]+),([\d.]+)/g)];
      const dot = q("#cardGraphDot");
      dot.setAttribute("visibility", coords.length ? "visible" : "hidden");
      if(coords.length){dot.setAttribute("cx",coords.at(-1)[1]);dot.setAttribute("cy",coords.at(-1)[2]);}
      q(".stream-chart").classList.toggle("is-empty", !g.points.length);
      const axis = (n) =>
        Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(n);
      q("#cardAxisTop").textContent = axis(g.max);
      q("#cardAxisMid").textContent = axis(g.max / 2);
      q("#cardGraphPeak").textContent = g.points.length
        ? (g.estimated ? "~" : "") +
          axis(Math.max(...g.points.map(p => p.value))) +
          " peak"
        : "—";
      q("#cardGraphHint").textContent = g.points.length
        ? g.estimated
          ? "Estimated from percentage"
          : ""
        : "Waiting for EXP readings";
    }
    const onStorage = (event) => {
      if (
        event.key === key ||
        event.key === PotionCosts.KEY ||
        event.key === null
      )
        render();
    };
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(render, 5000);
    window.addEventListener(
      "pagehide",
      () => {
        window.clearInterval(timer);
        window.removeEventListener("storage", onStorage);
      },
      { once: true },
    );
    render();
  }
  return { metrics, mesoMetrics, potionCostRates, graph, mount };
});
