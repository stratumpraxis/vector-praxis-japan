let jobs=[];

const $=s=>document.querySelector(s);
const state={quick:new Set(['japan']),visibleLimit:30,intent:'general'};
const ranks={A2:0,B1:1,B2:2,C1:3,C2:4};
const category=$('#category');
let searchTrackTimer=null;
const POSTHOG_KEY='phc_oTYapRSNXDtn8aY7wMNHfCDexRTkfb2H44MDVXwoUMSN';
const POSTHOG_CAPTURE='https://us.i.posthog.com/capture/';

const INTENTS=Object.freeze({
  general:{label:'General opportunity',terms:[]},
  ai:{label:'AI work',terms:['ai','人工知能','llm','agent','annotation','data labeling','prompt','machine learning']},
  remote:{label:'Global remote',terms:['remote','リモート','海外','worldwide','global']},
  side:{label:'Side work',terms:['副業','side','part-time','part time','contract','freelance']},
  fast:{label:'Fast income',terms:['短期','単発','すぐ','urgent','quick','bounty','task']},
  highpay:{label:'High pay',terms:['高単価','高収入','high pay','senior','lead','principal']},
  beginner:{label:'Beginner',terms:['未経験','初心者','entry','junior','no experience']}
});

function gwrDistinctId(){
  try{
    const sdkId=window.posthog?.get_distinct_id?.();
    if(sdkId)return sdkId;
    const key='gwr_distinct_id';
    let id=localStorage.getItem(key);
    if(!id){id=crypto.randomUUID?.()||`gwr-${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(key,id)}
    return id;
  }catch{return `gwr-${Date.now()}-${Math.random().toString(36).slice(2)}`}
}

function track(event,properties={}){
  const payload={
    api_key:POSTHOG_KEY,
    event,
    properties:{
      distinct_id:gwrDistinctId(),
      product:'global-work-radar',
      '$current_url':location.href,
      '$host':location.host,
      '$pathname':location.pathname,
      '$referrer':document.referrer||'$direct',
      ...(new URLSearchParams(location.search).get('gwr_qa')==='1'?{gwr_qa:true,gwr_qa_source:'github_actions_live'}:{}),
      ...properties
    }
  };
  try{
    fetch(POSTHOG_CAPTURE,{
      method:'POST',mode:'cors',keepalive:true,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    }).catch(()=>{});
  }catch{}
}

function trackVisitQuality(){
  const now=Date.now();
  let previous=0;
  try{previous=Number(localStorage.getItem('gwr_last_visit')||0);localStorage.setItem('gwr_last_visit',String(now))}catch{}
  track('gwr_visit',{intent:state.intent});
  if(previous&&now-previous>21600000&&now-previous<2592000000){
    track('gwr_return_visit',{hours_since_previous:Math.round((now-previous)/3600000),intent:state.intent});
  }
}

function parseTimestamp(value){
  if(!value)return 0;
  const ts=Date.parse(value);
  return Number.isFinite(ts)?ts:0;
}

function verifiedTimestamp(j){
  return parseTimestamp(j.lastVerifiedAt)||parseTimestamp(j.verified);
}

function ageDays(j){
  const ts=verifiedTimestamp(j);
  return ts?Math.max(0,(Date.now()-ts)/86400000):999;
}

function freshnessText(j){
  const ts=verifiedTimestamp(j);
  if(!ts)return '確認時刻 要確認';
  const diff=Math.max(0,Date.now()-ts);
  const hour=3600000;
  const day=24*hour;
  if(diff<hour)return '最終確認 1時間以内';
  if(diff<day)return `最終確認 ${Math.floor(diff/hour)}時間前`;
  if(diff<7*day)return `最終確認 ${Math.floor(diff/day)}日前`;
  return `最終確認 ${new Date(ts).toLocaleDateString('ja-JP')}`;
}

function latestCheckText(){
  const latest=Math.max(0,...jobs.map(verifiedTimestamp));
  if(!latest)return '—';
  const diff=Math.max(0,Date.now()-latest);
  const hour=3600000;
  const day=24*hour;
  if(diff<hour)return '<1h';
  if(diff<day)return `${Math.floor(diff/hour)}h`;
  return `${Math.floor(diff/day)}d`;
}

function validOfficialDestination(j){
  try{
    const u=new URL(j.url||'');
    return u.protocol==='https:'&&Boolean(u.hostname)&&!['localhost','127.0.0.1'].includes(u.hostname);
  }catch{return false}
}

function jobText(j){
  return `${j.title||''} ${j.employer||''} ${j.category||''} ${j.location||''} ${j.description||''}`.toLowerCase();
}

function inferIntent(){
  const p=new URLSearchParams(location.search);
  const explicit=(p.get('intent')||'').toLowerCase();
  if(INTENTS[explicit])return explicit;
  const q=($('#keyword')?.value||p.get('q')||'').trim().toLowerCase();
  const scores={general:1,ai:0,remote:0,side:0,fast:0,highpay:0,beginner:0};
  Object.entries(INTENTS).forEach(([name,def])=>{
    if(name==='general')return;
    def.terms.forEach(term=>{if(q.includes(term))scores[name]+=3});
  });
  if(state.quick.has('remote'))scores.remote+=3;
  if(state.quick.has('japanese'))scores.remote+=1;
  if(Number($('#minPay')?.value||0)>=30)scores.highpay+=3;
  const cat=category?.value||'all';
  if(/ai|data|machine|software|engineer/i.test(cat))scores.ai+=2;
  return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
}

function intentMatchScore(j,intent=state.intent){
  const text=jobText(j);
  let score=0;
  if(intent==='ai'&&/(\bai\b|artificial intelligence|llm|agent|machine learning|annotation|data label|prompt)/i.test(text))score+=2400;
  if(intent==='remote'&&j.remote==='remote')score+=2200;
  if(intent==='side'&&/(contract|freelance|part[- ]?time|temporary|project|hourly)/i.test(text))score+=1900;
  if(intent==='fast'&&/(bounty|task|temporary|contract|project|hourly|immediate|urgent)/i.test(text))score+=1800;
  if(intent==='highpay')score+=Math.min(2600,Number(j.payMin||0)*45);
  if(intent==='beginner'&&/(entry|junior|associate|trainee|no experience|beginner)/i.test(text))score+=2100;
  return score;
}

function actionabilityScore(j,intent=state.intent){
  let score=0;
  const official=validOfficialDestination(j);
  const active=(j.status||'').includes('ACTIVE');
  const age=ageDays(j);
  if(j.japan)score+=100000;
  if(official)score+=15000;else score-=30000;
  if(active)score+=7000;else score-=12000;
  if(j.remote==='remote')score+=600;
  if(j.japanese)score+=180;
  if(j.payMin)score+=Math.min(900,Number(j.payMin)*15);
  if(age<=1)score+=5000;
  else if(age<=7)score+=3500;
  else if(age<=14)score+=1800;
  else if(age<=30)score+=400;
  else if(age>45)score-=8000;
  score+=intentMatchScore(j,intent);
  return score;
}

function sortActionable(data){
  state.intent=inferIntent();
  return [...data].sort((a,b)=>
    actionabilityScore(b,state.intent)-actionabilityScore(a,state.intent)||
    verifiedTimestamp(b)-verifiedTimestamp(a)||
    Number(b.payMin||0)-Number(a.payMin||0)
  );
}

function searchProperties(trigger='search_button'){
  state.intent=inferIntent();
  const data=filtered();
  return {
    trigger,
    intent:state.intent,
    keyword:$('#keyword').value.trim()||null,
    category:category.value,
    min_pay:Number($('#minPay').value)||0,
    english:$('#english').value,
    japan_only:$('#onlyJapan').checked||state.quick.has('japan'),
    remote_only:$('#onlyRemote').checked||state.quick.has('remote'),
    result_count:data.length
  };
}

function trackSearch(trigger='filter_change'){
  clearTimeout(searchTrackTimer);
  searchTrackTimer=setTimeout(()=>track('gwr_search',searchProperties(trigger)),350);
}

function rebuildCategories(){
  category.querySelectorAll('option:not([value="all"])').forEach(o=>o.remove());
  [...new Set(jobs.map(j=>j.category).filter(Boolean))].sort().forEach(v=>{
    const o=document.createElement('option');o.value=v;o.textContent=v;category.appendChild(o);
  });
}

function updateQuickUI(){
  document.querySelectorAll('[data-filter]').forEach(btn=>{
    const active=state.quick.has(btn.dataset.filter);
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
  });
}

function applyUrlState(){
  const p=new URLSearchParams(location.search);
  if(p.has('japan'))p.get('japan')==='0'?state.quick.delete('japan'):state.quick.add('japan');
  if(p.get('remote')==='1')state.quick.add('remote');
  if(p.get('japanese')==='1')state.quick.add('japanese');
  if(p.get('usd')==='1')state.quick.add('usd');
  if(p.get('q'))$('#keyword').value=p.get('q').slice(0,120);
  if(p.get('category')&&[...category.options].some(o=>o.value===p.get('category')))category.value=p.get('category');
  if(p.get('min_pay')&&[...$('#minPay').options].some(o=>o.value===p.get('min_pay')))$('#minPay').value=p.get('min_pay');
  if(p.get('english')&&[...$('#english').options].some(o=>o.value===p.get('english')))$('#english').value=p.get('english');
  state.intent=inferIntent();
}

function syncUrl(){
  state.intent=inferIntent();
  const p=new URLSearchParams(location.search);
  const setOrDelete=(key,value,defaultValue='')=>value&&value!==defaultValue?p.set(key,value):p.delete(key);
  setOrDelete('q',$('#keyword').value.trim());
  setOrDelete('category',category.value,'all');
  setOrDelete('min_pay',$('#minPay').value,'0');
  setOrDelete('english',$('#english').value,'all');
  p.set('japan',($('#onlyJapan').checked||state.quick.has('japan'))?'1':'0');
  state.quick.has('remote')||$('#onlyRemote').checked?p.set('remote','1'):p.delete('remote');
  state.quick.has('japanese')?p.set('japanese','1'):p.delete('japanese');
  state.quick.has('usd')?p.set('usd','1'):p.delete('usd');
  state.intent!=='general'?p.set('intent',state.intent):p.delete('intent');
  const query=p.toString();
  history.replaceState(null,'',`${location.pathname}${query?`?${query}`:''}${location.hash}`);
}

function payText(j){
  if(!j.payMin)return '報酬要確認';
  const symbol=j.currency==='USD'?'$':'';
  const max=j.payMax&&j.payMax!==j.payMin?`–${symbol}${j.payMax}`:'';
  return `${symbol}${j.payMin}${max}/${j.period==='hour'?'hr':j.period||''}`;
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function card(j){
  const official=validOfficialDestination(j);
  const cta=j.japan?'Japan eligible確認済み → 公式求人':'公式求人で条件を確認';
  const link=official
    ?`<a class="official-apply" href="${escapeHtml(j.url)}" target="_blank" rel="noopener noreferrer" data-job-id="${escapeHtml(j.id||'')}" data-source="${escapeHtml(j.source||'')}" data-score="${actionabilityScore(j,state.intent)}">${cta} ↗</a>`
    :'<span class="verified">Official destination 要確認</span>';
  const source=j.source?`Source: ${escapeHtml(j.source)}`:'Official source';
  return `<article class="job-card" data-intent="${escapeHtml(state.intent)}"><div><div class="job-top">${j.japan?'<span class="pill good">JAPAN ELIGIBLE</span>':''}${j.remote==='remote'?'<span class="pill">REMOTE</span>':''}${j.japanese?'<span class="pill">JAPANESE</span>':''}<span class="pill">${escapeHtml(j.category||'Other')}</span></div><h3>${escapeHtml(j.title)}</h3><div class="employer">${escapeHtml(j.employer)} · ${escapeHtml(j.location||'Location not specified')}</div><div class="job-meta"><div><span>English</span> ${escapeHtml(j.english||'要確認')}</div><div><span>Currency</span> ${escapeHtml(j.currency||'—')}</div><div><span>Status</span> ${escapeHtml(j.status||'VERIFIED ACTIVE')}</div></div></div><div class="job-action"><div class="pay">${payText(j)}</div><span class="freshness">${escapeHtml(freshnessText(j))}</span><span class="verified">${source}</span>${link}</div></article>`;
}

function filtered(){
  const q=$('#keyword').value.trim().toLowerCase();
  const cat=category.value;
  const min=Number($('#minPay').value);
  const eng=$('#english').value;
  const onlyJapan=$('#onlyJapan').checked||state.quick.has('japan');
  const onlyRemote=$('#onlyRemote').checked||state.quick.has('remote');
  return jobs.filter(j=>{
    if(q&&!jobText(j).includes(q))return false;
    if(cat!=='all'&&j.category!==cat)return false;
    if(min&&(!j.payMin||j.payMin<min))return false;
    if(eng!=='all'&&(!j.english||(ranks[j.english]??-1)<ranks[eng]))return false;
    if(onlyJapan&&!j.japan)return false;
    if(onlyRemote&&j.remote!=='remote')return false;
    if(state.quick.has('japanese')&&!j.japanese)return false;
    if(state.quick.has('usd')&&j.currency!=='USD')return false;
    return true;
  });
}

function render(){
  const data=sortActionable(filtered());
  const visible=data.slice(0,state.visibleLimit);
  $('#jobsList').innerHTML=visible.map(card).join('');
  $('#resultCount').textContent=data.length;
  $('#emptyState').hidden=data.length>0;
  const loadMore=$('#loadMore');
  loadMore.hidden=data.length<=visible.length;
  if(!loadMore.hidden)loadMore.textContent=`さらに${Math.min(30,data.length-visible.length)}件を見る（残り${data.length-visible.length}件）`;
}

function metrics(){
  const active=jobs.filter(j=>(j.status||'').includes('ACTIVE')).length;
  const jp=jobs.filter(j=>j.japan).length;
  const remote=jobs.filter(j=>j.remote==='remote').length;
  $('#metricJobs').textContent=active;
  $('#metricJapan').textContent=jp;
  $('#metricRemote').textContent=remote;
  $('#metricFresh').textContent=latestCheckText();
}

function marketSignal(){
  const section=$('#marketSignal');
  const title=$('#marketSignalTitle');
  const body=$('#marketSignalBody');
  const meta=$('#marketSignalMeta');
  const link=$('#marketSignalLink');
  if(!section||!title||!body||!meta||!link)return;
  const candidates=sortActionable(jobs.filter(j=>j.japan&&validOfficialDestination(j)&&(j.status||'').includes('ACTIVE')));
  if(!candidates.length){section.hidden=true;return;}
  const top=candidates[0];
  title.textContent=`直近確認：${top.employer}「${top.title}」`;
  const pay=top.payMin?`・${payText(top)}`:'';
  body.textContent=`Japan eligible${top.remote==='remote'?'・Remote':''}${top.japanese?'・Japanese':''}${pay}。応募可否・公式応募先・確認鮮度・現在Intentを優先して表示しています。`;
  meta.textContent=`${freshnessText(top)} · ${top.source?`Source ${top.source}`:'official-source route'} · Intent ${INTENTS[state.intent]?.label||state.intent}`;
  link.href=top.url;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.textContent='この求人を公式で確認する ↗';
  link.dataset.jobId=top.id||'';
  link.dataset.source=top.source||'';
  link.dataset.score=String(actionabilityScore(top,state.intent));
  section.hidden=false;
}

function eligibilityGap(){
  const section=$('#eligibilityGap');
  const title=$('#eligibilityGapTitle');
  const body=$('#eligibilityGapBody');
  const meta=$('#eligibilityGapMeta');
  if(!section||!title||!body||!meta)return;
  const remote=jobs.filter(j=>j.remote==='remote');
  const japanRemote=remote.filter(j=>j.japan);
  const remoteHourly=remote.filter(j=>j.currency==='USD'&&j.period==='hour'&&Number(j.payMin)>0);
  const japanHourly=remoteHourly.filter(j=>j.japan);
  const unconfirmedHourly=remoteHourly.filter(j=>!j.japan);
  if(!remote.length||!japanRemote.length){section.hidden=true;return;}
  const japanTop=japanHourly.sort((a,b)=>Number(b.payMin)-Number(a.payMin))[0];
  const unconfirmedTop=unconfirmedHourly.sort((a,b)=>Number(b.payMin)-Number(a.payMin))[0];
  const remoteWithoutJapan=Math.max(0,remote.length-japanRemote.length);
  title.textContent=`Remote ${remote.length}件のうち、Japan eligible確認済みは ${japanRemote.length}件`;
  if(unconfirmedTop&&japanTop&&Number(unconfirmedTop.payMin)>Number(japanTop.payMin)){
    const gap=Number(unconfirmedTop.payMin)-Number(japanTop.payMin);
    body.textContent=`「Remote」だけでは日本から応募できるとは限りません。Japan eligible未確認のRemote時給案件には最高 $${unconfirmedTop.payMin}/hr のSignalがありますが、確認済みJapan eligible側の最高は $${japanTop.payMin}/hr。見かけの高単価と実際に応募できる高単価を分けて測ります。`;
    meta.textContent=`Japan eligible未確認Remote ${remoteWithoutJapan}件 · observed pay gap $${gap}/hr · GWR verified dataset only`;
  }else{
    body.textContent='「Remote」表記だけで日本から応募できると判断せず、勤務地・応募地域・公式ソースを分けて確認します。GWRはRemoteとJapan eligibleを別のSignalとして扱います。';
    meta.textContent=`Japan eligible未確認Remote ${remoteWithoutJapan}件 · GWR verified dataset only`;
  }
  section.hidden=false;
}

function setupRevenuePartner(){
  const config=window.GWR_REVENUE;
  const section=$('#revenuePartner');
  const link=$('#revenuePartnerLink');
  const disclosure=$('#revenueDisclosure');
  if(!section||!link||!config?.enabled||!config.affiliateUrl)return;
  try{
    const url=new URL(config.affiliateUrl);
    if(url.protocol!=='https:')return;
    link.href=url.toString();
  }catch{return;}
  disclosure.textContent=config.disclosure||'';
  section.hidden=false;
  link.addEventListener('click',()=>{
    const event={event:'gwr_revenue_click',partner:config.partner,campaign:config.campaign,ts:new Date().toISOString()};
    try{
      const prior=JSON.parse(localStorage.getItem('gwr_revenue_clicks')||'[]');
      prior.push(event);
      localStorage.setItem('gwr_revenue_clicks',JSON.stringify(prior.slice(-50)));
    }catch{}
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(event);
    track('gwr_revenue_click',{partner:config.partner,campaign:config.campaign,intent:state.intent});
  });
}

function refreshFromControl(trigger){
  state.visibleLimit=30;
  state.intent=inferIntent();
  render();
  marketSignal();
  syncUrl();
  trackSearch(trigger);
}

['keyword','category','minPay','english','onlyJapan','onlyRemote'].forEach(id=>$('#'+id).addEventListener('input',()=>refreshFromControl('filter_change')));

$('#searchButton').addEventListener('click',()=>{
  state.visibleLimit=30;
  state.intent=inferIntent();
  render();
  marketSignal();
  syncUrl();
  clearTimeout(searchTrackTimer);
  track('gwr_search',searchProperties('search_button'));
  document.querySelector('#jobs').scrollIntoView({behavior:'smooth'});
});

document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  const f=btn.dataset.filter;
  state.quick.has(f)?state.quick.delete(f):state.quick.add(f);
  updateQuickUI();
  refreshFromControl('quick_filter');
}));

$('#resetFilters').addEventListener('click',()=>{
  $('#keyword').value='';category.value='all';$('#minPay').value='0';$('#english').value='all';$('#onlyJapan').checked=false;$('#onlyRemote').checked=false;
  state.quick=new Set(['japan']);
  state.intent='general';
  state.visibleLimit=30;
  updateQuickUI();
  render();
  marketSignal();
  syncUrl();
  trackSearch('reset_filters');
});

$('#loadMore').addEventListener('click',()=>{
  state.visibleLimit+=30;
  render();
});

function trackOfficialApply(link,trigger='job_card'){
  const props={
    trigger,
    intent:state.intent,
    job_id:link.dataset.jobId||null,
    source:link.dataset.source||null,
    actionability_score:Number(link.dataset.score)||null,
    destination_host:(()=>{try{return new URL(link.href).host}catch{return null}})()
  };
  track('gwr_outbound_click',props);
  track('gwr_official_apply_click',props);
}

$('#jobsList').addEventListener('click',event=>{
  const link=event.target.closest('.official-apply');
  if(!link)return;
  trackOfficialApply(link,'job_card');
});

$('#marketSignalLink')?.addEventListener('click',event=>{
  const link=event.currentTarget;
  if(!link?.href||link.getAttribute('href')==='#jobs')return;
  trackOfficialApply(link,'market_signal');
});

$('#eligibilityGapLink')?.addEventListener('click',event=>{
  event.preventDefault();
  state.quick.add('japan');
  state.quick.add('remote');
  state.intent='remote';
  state.visibleLimit=30;
  updateQuickUI();
  render();
  marketSignal();
  syncUrl();
  clearTimeout(searchTrackTimer);
  track('gwr_search',searchProperties('eligibility_gap'));
  document.querySelector('#jobs').scrollIntoView({behavior:'smooth'});
});

async function init(){
  try{
    const res=await fetch('./data/verified-jobs.json',{cache:'no-store'});
    if(!res.ok)throw new Error(`verified jobs fetch failed: ${res.status}`);
    const payload=await res.json();
    jobs=Array.isArray(payload.records)?payload.records:[];
    track('gwr_jobs_loaded',{
      job_count:jobs.length,
      generated_at:payload.generated_at||null,
      official_destination_count:jobs.filter(validOfficialDestination).length,
      fresh_7d_count:jobs.filter(j=>ageDays(j)<=7).length
    });
  }catch(error){
    console.error(error);
    jobs=[];
    track('gwr_jobs_load_failed',{message:String(error?.message||error)});
  }
  rebuildCategories();
  applyUrlState();
  updateQuickUI();
  metrics();
  render();
  marketSignal();
  eligibilityGap();
  setupRevenuePartner();
  trackVisitQuality();
  track('gwr_intent_resolved',{intent:state.intent,result_count:filtered().length});
}

init();