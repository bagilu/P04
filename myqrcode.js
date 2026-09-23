(function(){
  const cfg=window.APP_CONFIG||{};
  const account=String(localStorage.getItem(cfg.STORAGE_KEY_ACCOUNT||'p04_smile_account')||'').trim().toLowerCase();
  const nickname=String(localStorage.getItem(cfg.STORAGE_KEY_NICKNAME||'p04_smile_nickname')||'').trim();
  const box=document.getElementById('myQrCodeBox'), msg=document.getElementById('myQrMessage');
  const panel=document.getElementById('liveNoticePanel'), notice=document.getElementById('liveNoticeText');
  let lastCheckedAt=new Date().toISOString();

  function valid(v){return /^[a-zA-Z0-9._%+-]+$/.test(v)}
  function setMsg(t,c=''){msg.textContent=t;msg.className='status-message'+(c?` ${c}`:'')}
  async function invoke(body){
    const url=cfg.FUNCTIONS?.GET_RECENT_NOTICE;
    if(!url)return null;
    try{
      const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.SUPABASE_ANON_KEY,'Authorization':`Bearer ${cfg.SUPABASE_ANON_KEY}`},body:JSON.stringify(body)});
      return await r.json();
    }catch{return null}
  }

  if(!valid(account)||!nickname){
    setMsg('請先回首頁設定自己的校園帳號與暱稱。','error');
    return;
  }

  document.getElementById('myNicknameDisplay').textContent=nickname;
  document.getElementById('myAccountDisplay').textContent=`${account}${cfg.EMAIL_DOMAIN||'@gms.tcu.edu.tw'}`;

  const base=(cfg.SITE_URL||'https://bagilu.github.io/P04/').replace(/\/?$/,'/');
  const smileUrl=`${base}?to=${encodeURIComponent(account)}&name=${encodeURIComponent(nickname)}`;
  document.getElementById('smileCodeUrl').textContent=smileUrl;

  new QRCode(box,{text:smileUrl,width:210,height:210,correctLevel:QRCode.CorrectLevel.M});
  setMsg('這就是你唯一的「微笑碼」。對方掃描後會直接進入回應流程。','success');

  async function poll(){
    const data=await invoke({smiler_account:account,after_created_at:lastCheckedAt,limit:3});
    const now=new Date().toISOString();
    if(!data?.success)return;
    if(data.rows?.length){
      const row=data.rows[0];
      const who=row.responder_nickname||row.responder_account||'某位校園夥伴';
      notice.textContent=`${who} 剛剛記錄了你帶給他的「${row.smile_type_label||'善意'}」。`;
      panel.classList.remove('hidden');
      lastCheckedAt=row.created_at||now;
      setTimeout(()=>panel.classList.add('hidden'),cfg.NOTIFICATION_DISPLAY_MS||8000);
    }
  }
  setInterval(poll,cfg.NOTIFICATION_POLL_MS||3000);
})();
