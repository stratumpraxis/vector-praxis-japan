let jobs=[];

const $=s=>document.querySelector(s);
const state={quick:new Set()};
const ranks={A2:0,B1:1,B2:2,C1:3,C2:4};
const category=$('#category');
let searchTrackTimer=null;

function track(event,properties={}){
  try{window.posthog?.capture?.(event,{product:'global-work-radar',...properties},{send_instantly:true})}catch{}
}

function searchProperties(trigger='search_button'){
  const data=filtered();
  return {
    trigger,
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
  const link=`<a class="official-apply" href="${escapeHtml(j.url)}" target="_blank" rel="noopener noreferrer" data-job-id="${escapeHtml(j.id||'')}" data-source="${escapeHtml(j.source||'')}">公式求人を見る ↗</a>`;
  return `<article class="job-card"><div><div class="job-top">${j.japan?'<span class="pill good">JAPAN ELIGIBLE</span>':''}${j.remote==='remote'?'<span class="pill">REMOTE</span>':''}${j.japanese?'<span class="pill">JAPANESE</span>':''}<span class="pill">${escapeHtml(j.category||'Other')}</span></div><h3>${escapeHtml(j.title)}</h3><div class="employer">${escapeHtml(j.employer)} · ${escapeHtml(j.location||'Location not specified')}</div><div class="job-meta"><div><span>English</span> ${escapeHtml(j.english||'要確認')}</div><div><span>Currency</span> ${escapeHtml(j.currency||'—')}</div><div><span>Status</span> ${escapeHtml(j.status||'VERIFIED ACTIVE')}</div></div></div><div><div class="pay">${payText(j)}</div><span class="verified">${escapeHtml(j.verified||'Verified')}</span>${link}</div></article>`;
}

function filtered(){
  const q=$('#keyword').value.trim().toLowerCase();
  const cat=category.value;
  const min=Number($('#minPay').value);
  const eng=$('#english').value;
  const onlyJapan=$('#onlyJapan').checked||state.quick.has('japan');
  const onlyRemote=$('#onlyRemote').checked||state.quick.has('remote');
  return jobs.filter(j=>{
    if(q&&!`${j.title} ${j.employer} ${j.category} ${j.location}`.toLowerCase().includes(q))return false;
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
  const data=filtered();
  $('#jobsList').innerHTML=data.map(card).join('');
  $('#resultCount').textContent=data.length;
  $('#emptyState').hidden=data.length>0;
}

function metrics(){
  const active=jobs.filter(j=>(j.status||'').includes('ACTIVE')).length;
  const jp=jobs.filter(j=>j.japan).length;
  const remote=jobs.filter(j=>j.remote==='remote').length;
  const hourly=jobs.filter(j=>j.currency==='USD'&&j.period==='hour'&&j.payMin).map(j=>j.payMin);
  $('#metricJobs').textContent=active;
  $('#metricJapan').textContent=jp;
  $('#metricRemote').textContent=remote;
  $('#metricPay').textContent=hourly.length?`$${(hourly.reduce((a,b)=>a+b,0)/hourly.length).toFixed(0)}`:'—';
}

function setupRevenuePartner(){
  const config=window.GWR_REVENUE;
  const section=$('#revenuePartner');
  const link=$('#revenuePartnerLink');
  const disclosure=$('#revenueDisclosure');
  if(!section||!link||!config?.enabled||!config.affiliateUrl)return;
  try{
    const url=new URL(config.affiliateUrl);
    if(!['https:'].includes(url.protocol))return;
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
    track('gwr_revenue_click',{partner:config.partner,campaign:config.campaign});
  });
}

['keyword','category','minPay','english','onlyJapan','onlyRemote'].forEach(id=>$('#'+id).addEventListener('input',()=>{
  render();
  trackSearch('filter_change');
}));
$('#searchButton').addEventListener('click',()=>{
  render();
  clearTimeout(searchTrackTimer);
  track('gwr_search',searchProperties('search_button'));
  document.querySelector('#jobs').scrollIntoView({behavior:'smooth'});
});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  const f=btn.dataset.filter;
  state.quick.has(f)?state.quick.delete(f):state.quick.add(f);
  btn.classList.toggle('active');
  render();
  trackSearch('quick_filter');
}));
$('#resetFilters').addEventListener('click',()=>{
  $('#keyword').value='';category.value='all';$('#minPay').value='0';$('#english').value='all';$('#onlyJapan').checked=false;$('#onlyRemote').checked=false;state.quick.clear();document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));render();trackSearch('reset_filters');
});
$('#jobsList').addEventListener('click',event=>{
  const link=event.target.closest('.official-apply');
  if(!link)return;
  track('gwr_official_apply_click',{
    job_id:link.dataset.jobId||null,
    source:link.dataset.source||null,
    destination_host:(()=>{try{return new URL(link.href).host}catch{return null}})()
  });
});

async function init(){
  try{
    const res=await fetch('./data/verified-jobs.json',{cache:'no-store'});
    if(!res.ok)throw new Error(`verified jobs fetch failed: ${res.status}`);
    const payload=await res.json();
    jobs=Array.isArray(payload.records)?payload.records:[];
    track('gwr_jobs_loaded',{job_count:jobs.length,generated_at:payload.generated_at||null});
  }catch(error){
    console.error(error);
    jobs=[];
    track('gwr_jobs_load_failed',{message:String(error?.message||error)});
  }
  rebuildCategories();
  metrics();
  render();
  setupRevenuePartner();
}

init();
