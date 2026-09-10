window.GWR_REVENUE = Object.freeze({
  enabled: false,
  partner: 'Deel',
  affiliateUrl: '',
  disclosure: 'このリンク経由で申込みが成立した場合、Global Work Radarが紹介料を受け取ることがあります。',
  campaign: 'gwr_deel_2026_09'
});

window.GWR_INTELLIGENCE_SIGNAL = Object.freeze({
  id: 'japanese-speaker-demand-2026-09-07',
  theme: 'Japanese Speaker Demand',
  asOf: '2026-09-07T11:02:40.422Z',
  periodStart: '2026-09-03T02:49:09.780Z',
  startJapaneseJobs: 672,
  endJapaneseJobs: 702,
  japaneseGrowthPct: 4.46,
  activeGrowthPct: 0.50,
  remoteGrowthPct: 1.47,
  japanEligibleGrowthPct: 2.04,
  source: 'Workable market snapshots',
  scope: 'GWR-observed Workable market only',
  score: 92,
  route: 'PAID_CONTRACT_CANDIDATE'
});

(function setupCommercialStyles() {
  if (document.querySelector('#gwrCommercialStyles')) return;
  const style = document.createElement('style');
  style.id = 'gwrCommercialStyles';
  style.textContent = `
    #laborIntelligenceSignal.gwr-intelligence-offer {
      max-width: calc(var(--max) - 104px);
      margin: 10px auto 30px;
      grid-template-columns: minmax(0,1fr) 285px;
      gap: 32px;
      border-color: #50614c;
      background:
        radial-gradient(circle at 85% 25%, rgba(244,201,107,.13), transparent 28%),
        radial-gradient(circle at 10% 85%, rgba(104,226,194,.09), transparent 30%),
        linear-gradient(135deg,#102133,#0a1927);
    }
    #laborIntelligenceSignal.gwr-intelligence-offer:before {
      content: 'GWR PRO';
      position: absolute;
      right: 22px;
      top: 18px;
      color: rgba(244,201,107,.18);
      font: 800 42px/1 Inter, sans-serif;
      letter-spacing: -.06em;
      pointer-events: none;
    }
    .gwr-commercial-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 13px;
      padding: 6px 8px;
      border: 1px solid #655c38;
      border-radius: 7px;
      background: rgba(89,71,30,.18);
      color: #e8c56e;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .14em;
    }
    .gwr-commercial-badge:before { content: '◆'; font-size: 6px; }
    #laborIntelligenceSignal .gwr-intelligence-copy h2 {
      max-width: 780px;
      font-size: clamp(25px,3vw,40px);
      margin-top: 7px;
    }
    #laborIntelligenceSignal .gwr-intelligence-copy p strong { color: #f1d48c; }
    .gwr-offer-points {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 15px 0 4px;
    }
    .gwr-offer-points span {
      padding: 6px 8px;
      border: 1px solid #30475a;
      border-radius: 7px;
      background: rgba(8,22,35,.65);
      color: #91a9bf;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: .04em;
    }
    .gwr-intelligence-action {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 18px;
      border: 1px solid #4d5139;
      border-radius: 16px;
      background: linear-gradient(160deg,rgba(30,36,36,.94),rgba(13,26,36,.96));
      box-shadow: 0 16px 40px rgba(0,0,0,.18);
    }
    .gwr-intelligence-action > strong {
      color: #e5c872;
      font-size: 8px;
      letter-spacing: .14em;
    }
    .gwr-intelligence-action > span {
      margin: 8px 0 15px;
      color: #a9b9c7;
      font-size: 11px;
      line-height: 1.55;
    }
    .gwr-intelligence-action .partner-cta {
      min-width: 0;
      width: 100%;
      border-color: #8d7435;
      background: linear-gradient(135deg,#705727,#9a7935);
    }
    .gwr-intelligence-action > small {
      margin-top: 9px;
      text-align: center;
      color: #687b8c;
      font-size: 8px;
    }
    @media(max-width:820px) {
      #laborIntelligenceSignal.gwr-intelligence-offer {
        max-width: calc(100% - 40px);
        grid-template-columns: 1fr;
      }
      #laborIntelligenceSignal .gwr-intelligence-action { grid-column: 1; }
    }
    @media(max-width:430px) {
      #laborIntelligenceSignal.gwr-intelligence-offer {
        max-width: calc(100% - 28px);
        padding: 20px;
      }
      #laborIntelligenceSignal.gwr-intelligence-offer:before { font-size: 30px; }
    }
  `;
  document.head.appendChild(style);
}());

(function setupIntelligencePreview() {
  const signal = window.GWR_INTELLIGENCE_SIGNAL;
  const summary = document.querySelector('#marketSummary');
  if (!summary || document.querySelector('#laborIntelligenceSignal')) return;

  const section = document.createElement('section');
  section.id = 'laborIntelligenceSignal';
  section.className = 'partner-section gwr-intelligence-offer';
  section.setAttribute('aria-label', 'Global Work Radar paid labor intelligence signal');
  section.innerHTML = `
    <div class="gwr-intelligence-copy">
      <div class="gwr-commercial-badge">B2B PAID INTELLIGENCE</div>
      <span class="kicker">LABOR INTELLIGENCE · SCORE ${signal.score}/100</span>
      <h2>日本語人材需要を、採用・市場判断に使える継続Signalへ。</h2>
      <p>GWRが継続観測しているWorkable市場では、9月3日→9月7日に日本語関連求人が <strong>${signal.startJapaneseJobs} → ${signal.endJapaneseJobs}（+${signal.japaneseGrowthPct}%）</strong>。同期間の全求人は +${signal.activeGrowthPct}%、Remote求人は +${signal.remoteGrowthPct}%、Japan-eligible求人は +${signal.japanEligibleGrowthPct}% でした。</p>
      <div class="gwr-offer-points" aria-label="Paid intelligence scope examples">
        <span>TREND BRIEF</span><span>JAPAN ELIGIBILITY</span><span>LANGUAGE DEMAND</span><span>CUSTOM SEGMENT</span><span>FRESH SIGNALS</span>
      </div>
      <small class="partner-disclosure">GWR独自の時系列集計です。対象はGWRが観測したWorkable市場であり、世界求人市場全体を代表する統計ではありません。有料提供は用途・対象市場・頻度・集計範囲を確認後に個別スコープ／見積り。As of 2026-09-07.</small>
    </div>
    <div class="gwr-intelligence-action">
      <strong>FOR TEAMS / RESEARCH</strong>
      <span>継続データ、アラート、比較集計など、必要な範囲だけ相談できます。</span>
      <a id="intelligenceInterestLink" class="partner-cta" href="mailto:stratumpraxis@gmail.com?subject=GWR%20Paid%20Labor%20Intelligence%20Inquiry&body=Global%20Work%20Radar%20の有料Labor%20Intelligenceについて相談したいです。%0A%0A組織名:%0A用途:%0A見たい市場・職種:%0A希望頻度:%0Aその他:">有料版を相談する <span>↗</span></a>
      <small>Paid contract inquiry · scope first</small>
    </div>
  `;
  summary.insertAdjacentElement('afterend', section);

  const interest = section.querySelector('#intelligenceInterestLink');
  interest?.addEventListener('click', () => {
    const properties = {
      product: 'global-work-radar',
      signal_id: signal.id,
      theme: signal.theme,
      score: signal.score,
      route: signal.route,
      source: signal.source,
      scope: signal.scope,
      commercial_intent: true,
      revenue_route: 'paid_labor_intelligence_contract'
    };
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture('gwr_intelligence_interest_click', properties);
      window.posthog.capture('gwr_paid_intelligence_lead_click', properties);
    }
  });

  if (window.posthog && typeof window.posthog.capture === 'function' && 'IntersectionObserver' in window) {
    let sent = false;
    const observer = new IntersectionObserver((entries) => {
      if (sent || !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) return;
      sent = true;
      window.posthog.capture('gwr_intelligence_signal_view', {
        product: 'global-work-radar',
        signal_id: signal.id,
        theme: signal.theme,
        score: signal.score,
        route: signal.route,
        source: signal.source,
        scope: signal.scope,
        commercial_intent_available: true
      });
      observer.disconnect();
    }, { threshold: [0.35] });
    observer.observe(section);
  }
}());

(function setupRevenuePump() {
  const qa = new URLSearchParams(window.location.search).get('gwr_qa') === '1';

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function selectNextAction(metrics = {}) {
    const verifiedRevenue = toNumber(metrics.verifiedRevenue);
    const revenueClicks = toNumber(metrics.revenueClicks);
    const intelligenceLeadClicks = toNumber(metrics.intelligenceLeadClicks);
    const officialApplyClicks = toNumber(metrics.officialApplyClicks);
    const jobCardViews = toNumber(metrics.jobCardViews);
    const jobsSectionViews = toNumber(metrics.jobsSectionViews);
    const searches = toNumber(metrics.searches);
    const visits = toNumber(metrics.visits);
    const partnerEnabled = metrics.partnerEnabled === true;

    if (verifiedRevenue > 0) return Object.freeze({ state: 'WINNER_AMPLIFICATION', priority: 100 });
    if (revenueClicks > 0) return Object.freeze({ state: 'MONETIZATION_VERIFY', priority: 95 });
    if (intelligenceLeadClicks > 0) return Object.freeze({ state: 'PAID_INTELLIGENCE_VERIFY', priority: 93 });
    if (officialApplyClicks > 0 && !partnerEnabled) return Object.freeze({ state: 'MONETIZATION_GATE', priority: 90 });
    if (jobCardViews > 0 && officialApplyClicks === 0) return Object.freeze({ state: 'CARD_TO_APPLY', priority: 86 });
    if (jobsSectionViews > 0 && jobCardViews === 0) return Object.freeze({ state: 'SECTION_TO_CARD', priority: 83 });
    if (visits > 0 && jobsSectionViews === 0) return Object.freeze({ state: 'VISIT_TO_JOBS', priority: 80 });
    if (searches > 0 && officialApplyClicks === 0) return Object.freeze({ state: 'SEARCH_TO_APPLY', priority: 78 });
    return Object.freeze({ state: 'QUALIFIED_ACQUISITION', priority: 70 });
  }

  window.GWR_REVENUE_PUMP = Object.freeze({
    selectNextAction,
    priorityOrder: Object.freeze([
      'WINNER_AMPLIFICATION',
      'MONETIZATION_VERIFY',
      'PAID_INTELLIGENCE_VERIFY',
      'MONETIZATION_GATE',
      'CARD_TO_APPLY',
      'SECTION_TO_CARD',
      'VISIT_TO_JOBS',
      'SEARCH_TO_APPLY',
      'QUALIFIED_ACQUISITION'
    ])
  });

  if (!window.posthog || typeof window.posthog.capture !== 'function') return;

  let meaningfulAction = false;
  let stallTimer = null;
  const seen = new Set();

  function capture(event, properties = {}) {
    window.posthog.capture(event, {
      ...properties,
      product: 'global-work-radar',
      source: 'global-work-radar',
      gwr_qa: qa,
      referrer: document.referrer || '$direct'
    });
  }

  function markMeaningfulAction() {
    meaningfulAction = true;
    if (stallTimer) {
      window.clearTimeout(stallTimer);
      stallTimer = null;
    }
  }

  function observeOnce(selector, event) {
    const element = document.querySelector(selector);
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35 || seen.has(event)) continue;
        seen.add(event);
        capture(event, { selector });
        observer.disconnect();
        break;
      }
    }, { threshold: [0.35] });
    observer.observe(element);
  }

  function observeJobCards() {
    const jobsList = document.querySelector('#jobsList');
    if (!jobsList || !('IntersectionObserver' in window)) return;

    const cardObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
        const card = entry.target;
        const link = card.querySelector('.official-apply');
        const jobId = link?.dataset.jobId || null;
        const jobSource = link?.dataset.source || null;
        const position = card.parentElement ? [...card.parentElement.children].indexOf(card) + 1 : null;
        const key = `gwr_job_card_view:${jobId || jobSource || position}`;
        if (!seen.has(key)) {
          seen.add(key);
          capture('gwr_job_card_view', { job_id: jobId, job_source: jobSource, position });
        }
        cardObserver.unobserve(card);
      }
    }, { threshold: [0.5] });

    const bindCards = () => {
      jobsList.querySelectorAll('.job-card:not([data-gwr-observed])').forEach((card) => {
        card.dataset.gwrObserved = '1';
        cardObserver.observe(card);
      });
    };

    bindCards();
    new MutationObserver(bindCards).observe(jobsList, { childList: true });
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest(
      '#searchButton,[data-filter],.official-apply,#marketSignalLink,#eligibilityGapLink,#revenuePartnerLink,#intelligenceInterestLink,#resetFilters,#loadMore'
    );
    if (!target) return;
    markMeaningfulAction();
  }, true);

  document.addEventListener('input', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('#keyword,#category,#minPay,#english,#onlyJapan,#onlyRemote')) return;
    markMeaningfulAction();
  }, true);

  observeOnce('#laborIntelligenceSignal', 'gwr_intelligence_section_view');
  observeOnce('#marketSignal', 'gwr_market_signal_view');
  observeOnce('#jobs .section-head', 'gwr_jobs_section_view');
  observeJobCards();

  stallTimer = window.setTimeout(() => {
    if (meaningfulAction || document.visibilityState !== 'visible') return;
    capture('gwr_activation_stall', {
      stage: 'visit_to_action',
      wait_ms: 20000,
      visible_job_cards: document.querySelectorAll('.job-card').length,
      market_signal_ready: Boolean(document.querySelector('#marketSignalLink[href]'))
    });
  }, 20000);
}());
