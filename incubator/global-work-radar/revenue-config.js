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
    if (searches > 0 && officialApplyClicks === 0) {
      return Object.freeze({ state: 'SEARCH_TO_APPLY', priority: 85 });
    }
    if (visits > 0 && searches === 0 && officialApplyClicks === 0) {
      return Object.freeze({ state: 'VISIT_TO_ACTION', priority: 80 });
    }
    return Object.freeze({ state: 'QUALIFIED_ACQUISITION', priority: 70 });
  }

  window.GWR_REVENUE_PUMP = Object.freeze({
    selectNextAction,
    priorityOrder: Object.freeze([
      'WINNER_AMPLIFICATION',
      'MONETIZATION_VERIFY',
      'MONETIZATION_GATE',
      'SEARCH_TO_APPLY',
      'VISIT_TO_ACTION',
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
      source: 'global-work-radar',
      gwr_qa: qa,
      referrer: document.referrer || '$direct'
    });
  }

  function markMeaningfulAction(action) {
    meaningfulAction = true;
    if (stallTimer) {
      window.clearTimeout(stallTimer);
      stallTimer = null;
    }
    return action;
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

  document.addEventListener('click', (event) => {
    const target = event.target.closest(
      '#searchButton,[data-filter],.official-apply,#marketSignalLink,#eligibilityGapLink,#revenueCtaLink'
    );
    if (!target) return;
    markMeaningfulAction(target.id || target.dataset.filter || target.className || 'click');
  }, true);

  document.addEventListener('input', (event) => {
    if (!event.target.closest('#q,#japanFit,#japaneseReq,#workStyle,#jobType,#payBand')) return;
    markMeaningfulAction('filter_input');
  }, true);

  observeOnce('#marketSignal', 'gwr_market_signal_view');
  observeOnce('#jobs', 'gwr_jobs_section_view');

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
