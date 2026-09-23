(function(){
  const cfg=window.APP_CONFIG||{};
  const status=document.getElementById('scanStatusMessage');
  let scanner=null, stopped=false;
  function setMsg(t,c=''){status.textContent=t;status.className='status-message'+(c?` ${c}`:'')}
  function normalize(v){return String(v||'').trim().toLowerCase()}
  function valid(v){return /^[a-zA-Z0-9._%+-]+$/.test(v)}
  function targetFrom(raw){
    const text=String(raw||'').trim();
    try{
      const u=new URL(text);
      const to=normalize(u.searchParams.get('to'));
      if(valid(to)) return {account:to,name:String(u.searchParams.get('name')||'').trim()};
    }catch{}
    const domain=cfg.EMAIL_DOMAIN||'@gms.tcu.edu.tw';
    if(text.toLowerCase().endsWith(domain.toLowerCase())){
      const a=normalize(text.slice(0,-domain.length));
      if(valid(a))return {account:a,name:''};
    }
    if(valid(normalize(text)))return {account:normalize(text),name:''};
    return null;
  }
  async function go(raw){
    const t=targetFrom(raw);
    if(!t){setMsg('這不是有效的 P04 微笑碼，請重新對準。','error');return;}
    if(stopped)return; stopped=true;
    try{await scanner.stop()}catch{}
    const base=(cfg.SITE_URL||'https://bagilu.github.io/P04/').replace(/\/?$/,'/');
    const url=`${base}?to=${encodeURIComponent(t.account)}${t.name?`&name=${encodeURIComponent(t.name)}`:''}`;
    setMsg('掃描成功，正在進入回應畫面…','success');
    location.href=url;
  }
  async function start(){
    if(typeof Html5Qrcode==='undefined'){setMsg('掃描元件載入失敗，請重新整理。','error');return;}
    scanner=new Html5Qrcode('reader');
    try{
      await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:230,height:230}},go,()=>{});
      setMsg('請將對方的微笑碼放進掃描框。','warn');
    }catch(e){setMsg('無法開啟相機。請確認已允許相機權限，並使用 HTTPS。','error');}
  }
  start();
})();
