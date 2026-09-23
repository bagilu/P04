(function () {
  const config = window.APP_CONFIG || {};
  const $ = id => document.getElementById(id);

  const accountFormSection = $('accountFormSection');
  const currentAccountSection = $('currentAccountSection');
  const accountInput = $('accountInput');
  const nicknameInput = $('nicknameInput');
  const currentAccountText = $('currentAccountText');
  const currentNicknameText = $('currentNicknameText');
  const welcomeText = $('welcomeText');
  const pendingTargetHint = $('pendingTargetHint');
  const responseSection = $('responseSection');
  const targetSection = $('targetSection');
  const targetNameText = $('targetNameText');
  const targetAccountText = $('targetAccountText');
  const homeActions = $('homeActions');
  const indexMessage = $('indexMessage');
  const totalSmileCount = $('totalSmileCount');
  const smilerRankingList = $('smilerRankingList');
  const responderRankingList = $('responderRankingList');
  const mySmileRecordsBody = $('mySmileRecordsBody');
  const myResponseRecordsBody = $('myResponseRecordsBody');

  let mySmilePage = 1;
  let myResponsePage = 1;

  const params = new URLSearchParams(location.search);
  const targetAccount = normalizeAccount(params.get('to'));
  const targetNickname = normalizeNickname(params.get('name'));

  function normalizeAccount(v){ return String(v || '').trim().toLowerCase(); }
  function normalizeNickname(v){ return String(v || '').trim(); }
  function validAccount(v){ return /^[a-zA-Z0-9._%+-]+$/.test(normalizeAccount(v)); }
  function validNickname(v){ const n=normalizeNickname(v); return n.length>0 && n.length <= (config.NICKNAME_MAX_LENGTH || 20); }
  function accountToEmail(v){ return `${normalizeAccount(v)}${config.EMAIL_DOMAIN || '@gms.tcu.edu.tw'}`; }
  function myAccount(){ return normalizeAccount(localStorage.getItem(config.STORAGE_KEY_ACCOUNT || 'p04_smile_account')); }
  function myNickname(){ return normalizeNickname(localStorage.getItem(config.STORAGE_KEY_NICKNAME || 'p04_smile_nickname')); }
  function saveProfile(a,n){ localStorage.setItem(config.STORAGE_KEY_ACCOUNT || 'p04_smile_account',a); localStorage.setItem(config.STORAGE_KEY_NICKNAME || 'p04_smile_nickname',n); }
  function setMessage(text,type=''){ indexMessage.textContent=text; indexMessage.className='status-message'+(type?` ${type}`:''); }
  function escapeHtml(v){ return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }

  function functionUrl(key){ return config.FUNCTIONS?.[key]; }
  async function invoke(key, body={}){
    const url=functionUrl(key);
    if(!url || url.includes('YOUR-PROJECT')) return {data:null,error:{message:'config.js 尚未設定完整的 Edge Function URL。'}};
    try{
      const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':config.SUPABASE_ANON_KEY,'Authorization':`Bearer ${config.SUPABASE_ANON_KEY}`},body:JSON.stringify(body)});
      const data=await r.json().catch(()=>null);
      if(!r.ok) return {data,error:{message:data?.message||`HTTP ${r.status}`}};
      return {data,error:null};
    }catch(e){ return {data:null,error:{message:e?.message||'連線失敗'}}; }
  }

  function hasTarget(){ return validAccount(targetAccount); }
  function hasProfile(){ return validAccount(myAccount()) && validNickname(myNickname()); }

  function refreshFlow(){
    const profileReady=hasProfile();

    accountFormSection.classList.toggle('hidden', profileReady);
    currentAccountSection.classList.toggle('hidden', !profileReady);

    if(profileReady){
      currentNicknameText.textContent=myNickname();
      currentAccountText.textContent=accountToEmail(myAccount());
    }

    if(hasTarget()){
      targetSection.classList.remove('hidden');
      targetNameText.textContent=targetNickname || '一位校園夥伴';
      targetAccountText.textContent=accountToEmail(targetAccount);
      homeActions.classList.add('hidden');

      if(!profileReady){
        responseSection.classList.add('hidden');
        welcomeText.textContent='你已經掃到對方的微笑碼。先設定自己的資料，完成後會直接回到這次回應，不需要再掃一次。';
        pendingTargetHint.textContent='設定完成後，會直接繼續這次回應。';
      }else if(myAccount()===targetAccount){
        responseSection.classList.add('hidden');
        setMessage('這是你自己的微笑碼。請把它給別人掃描；你不能記錄自己。','warn');
      }else{
        responseSection.classList.remove('hidden');
        welcomeText.textContent='掃描完成。選擇剛剛感受到的善意，就能完成這次記錄。';
      }
    }else{
      targetSection.classList.add('hidden');
      responseSection.classList.add('hidden');
      homeActions.classList.remove('hidden');
      welcomeText.textContent=profileReady
        ? '想記錄一個善意，就掃描對方的「微笑碼」；想讓別人記錄你，就打開「我的微笑碼」。'
        : '第一次使用只要設定一次資料。之後掃到誰的「微笑碼」，就直接回應誰。';
    }
  }

  $('saveAccountBtn')?.addEventListener('click',()=>{
    const a=normalizeAccount(accountInput.value), n=normalizeNickname(nicknameInput.value);
    if(!validAccount(a)){ setMessage('請輸入正確的校園帳號，只填 @ 前面的部分。','error'); return; }
    if(!validNickname(n)){ setMessage(`請輸入 1–${config.NICKNAME_MAX_LENGTH||20} 字的暱稱。`,'error'); return; }
    saveProfile(a,n);
    setMessage(hasTarget()?'設定完成，可以直接完成這次回應。':'資料已儲存。','success');
    refreshFlow();
    loadMyRecords();
  });

  $('editAccountBtn')?.addEventListener('click',()=>{
    accountInput.value=myAccount(); nicknameInput.value=myNickname();
    localStorage.removeItem(config.STORAGE_KEY_ACCOUNT || 'p04_smile_account');
    localStorage.removeItem(config.STORAGE_KEY_NICKNAME || 'p04_smile_nickname');
    refreshFlow(); accountInput.focus();
  });

  $('scanBtn')?.addEventListener('click',()=> location.href='scan.html');
  $('myQrBtn')?.addEventListener('click',()=> location.href='myqrcode.html');

  document.querySelectorAll('.response-button').forEach(btn=>btn.addEventListener('click',async()=>{
    if(!hasTarget() || !hasProfile()) return;
    document.querySelectorAll('.response-button').forEach(b=>b.disabled=true);
    setMessage('正在把這個善意記錄下來…','warn');
    const {data,error}=await invoke('SUBMIT_SMILE_EVENT',{
      smiler_account:targetAccount,
      smiler_nickname:targetNickname || undefined,
      responder_account:myAccount(),
      responder_nickname:myNickname(),
      smile_type:Number(btn.dataset.type)
    });
    if(error || !data?.success){
      const code=data?.code;
      setMessage(code==='DUPLICATE_TODAY'?'今天已經記錄過這位夥伴了。':code==='SELF_NOT_ALLOWED'?'不能記錄自己。':data?.message||error?.message||'送出失敗。','error');
      document.querySelectorAll('.response-button').forEach(b=>b.disabled=false);
      return;
    }
    setMessage('完成！謝謝你讓一個善意被看見。','success');
    setTimeout(()=> location.href=config.SITE_URL || 'https://bagilu.github.io/P04/', 1300);
  }));

  function renderRanking(el,rows){
    if(!el)return;
    if(!rows?.length){el.innerHTML='<li class="leaderboard-placeholder">目前尚無資料</li>';return;}
    el.innerHTML=rows.map((r,i)=>`<li><span class="rank-order">${i+1}</span><span class="rank-name">${escapeHtml(r.nickname||r.account)}</span><span class="rank-count">${r.count} 次</span></li>`).join('');
  }

  async function loadStats(){
    const {data,error}=await invoke('GET_HOME_STATS',{});
    if(error||!data?.success){ totalSmileCount.textContent='--'; renderRanking(smilerRankingList,[]); renderRanking(responderRankingList,[]); return; }
    totalSmileCount.textContent=data.totalSmileCount??0;
    renderRanking(smilerRankingList,data.smilerRanking||[]);
    renderRanking(responderRankingList,data.responderRanking||[]);
  }

  function fmt(v){ const d=new Date(v); return Number.isNaN(d.getTime())?String(v||''):d.toLocaleString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  async function queryRecords(mode,page){
    if(!hasProfile()) return {success:false,message:'設定自己的資料後，就能看到個人紀錄。'};
    const {data,error}=await invoke('GET_MY_RECORDS',{account:myAccount(),mode,page});
    return error?{success:false,message:error.message}:data;
  }
  function renderRecords(el,data,mode){
    if(!el)return;
    if(!data?.success){el.innerHTML=`<div class="record-empty">${escapeHtml(data?.message||'讀取失敗')}</div>`;return;}
    const rows=data.rows||[];
    const body=rows.map(r=>{
      const other=mode==='smiler'?(r.responder_nickname||r.responder_account):(r.smiler_nickname||r.smiler_account);
      const text=mode==='smiler'?`對方記錄了你帶給他的${r.smile_type_label||'善意'}`:`你記錄了對方帶給你的${r.smile_type_label||'善意'}`;
      return `<tr><td>${escapeHtml(fmt(r.created_at))}</td><td>${escapeHtml(other||'某位夥伴')}</td><td><span class="record-pill">${escapeHtml(r.smile_type_label||'善意')}</span>${escapeHtml(text)}</td></tr>`;
    }).join('');
    el.innerHTML=`${rows.length?`<table class="record-table"><thead><tr><th>時間</th><th>對象</th><th>內容</th></tr></thead><tbody>${body}</tbody></table>`:'<div class="record-empty">目前尚無資料。</div>'}
      <div class="record-pagination"><button data-record-mode="${mode}" data-dir="-1" ${data.page<=1?'disabled':''}>上一頁</button><span>第 ${data.page||1} / ${data.total_pages||1} 頁，共 ${data.total||0} 筆</span><button data-record-mode="${mode}" data-dir="1" ${data.page>=data.total_pages?'disabled':''}>下一頁</button></div>`;
  }
  async function loadMyRecords(){
    renderRecords(mySmileRecordsBody,await queryRecords('smiler',mySmilePage),'smiler');
    renderRecords(myResponseRecordsBody,await queryRecords('responder',myResponsePage),'responder');
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button[data-record-mode]'); if(!b)return;
    const mode=b.dataset.recordMode,dir=Number(b.dataset.dir);
    if(mode==='smiler'){mySmilePage=Math.max(1,mySmilePage+dir);renderRecords(mySmileRecordsBody,await queryRecords(mode,mySmilePage),mode);}
    else{myResponsePage=Math.max(1,myResponsePage+dir);renderRecords(myResponseRecordsBody,await queryRecords(mode,myResponsePage),mode);}
  });

  refreshFlow();
  loadStats();
  loadMyRecords();
})();
