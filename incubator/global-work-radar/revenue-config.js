window.GWR_REVENUE = Object.freeze({
  enabled: false,
  partner: 'Deel',
  affiliateUrl: '',
  disclosure: 'このリンク経由で申込みが成立した場合、Global Work Radarが紹介料を受け取ることがあります。',
  campaign: 'gwr_deel_2026_09'
});

(function setupRevenuePump() {
  const qa = new URLSearchParams(window.location.search).get('gwr_qa') === '1';

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function selectNextAction(metrics = {}) {
    const verifiedRevenue = toNumber(metrics.verifiedRevenue);
    const revenueClicks = toNumber(metrics.revenueClicks);
    const officialApplyClicks = toNumber(metrics.officialApplyClicks);
    const jobCardViews = toNumber(metrics.jobCardViews);
    const jobsSectionViews = toNumber(metrics.jobsSectionViews);
    const searches = toNumber(metrics.searches);
    const visits = toNumber(metrics.visits);
    const partnerEnabled = metrics.partnerEnabled === true;

    if (verifiedRevenue > 0) {
      return Object.freeze({ state: 'WINNER_AMPLIFICATION', priority: 100 });
    }
    if (revenueClicks > 0) {
      return Object.freeze({ state: 'MONETIZATION_VERIFY', priority: 95 });
    }
    if (officialApplyClicks > 0 && !partnerEnabled) {
      return Object.freeze({ state: 'MONETIZATION_GATE', priority: 90 });
    }
    if (jobCardViews > 0 && officialApplyClicks === 0) {
      return Object.freeze({ state: 'CARD_TO_APPLY', priority: 86 });
    }
    if (jobsSectionViews > 0 && jobCardViews === 0) {
      return Object.freeze({ state: 'SECTION_TO_CARD', priority: 83 });
    }
    if (visits > 0 && jobsSectionViews === 0) {
      return Object.freeze({ state: 'VISIT_TO_JOBS', priority: 80 });
    }
    if (searches > 0 && officialApplyClicks === 0) {
      return Object.freeze({ state: 'SEARCH_TO_APPLY', priority: 78 });
    }
    return Object.freeze({ state: 'QUALIFIED_ACQUISITION', priority: 70 });
  }

  window.GWR_REVENUE_PUMP = Object.freeze({
    selectNextAction,
    priorityOrder: Object.freeze([
      'WINNER_AMPLIFICATION',
      'MONETIZATION_VERIFY',
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
          capture('gwr_job_card_view', {
            job_id: jobId,
            job_source: jobSource,
            position
          });
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
      '#searchButton,[data-filter],.official-apply,#marketSignalLink,#eligibilityGapLink,#revenuePartnerLink,#resetFilters,#loadMore'
    );
    if (!target) return;
    markMeaningfulAction();
  }, true);

  document.addEventListener('input', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('#keyword,#category,#minPay,#english,#onlyJapan,#onlyRemote')) return;
    markMeaningfulAction();
  }, true);

  observeOnce('#marketSignal', 'gwr_market_signal_view');
  observeOnce('#jobs', 'gwr_jobs_section_view');
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
