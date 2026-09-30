/* DUIT — Meta Pixel (carregado apenas após consentimento não essencial) */
(function(){
  const PIXEL_ID='977484327979431';
  let loaded=false;
  let pageViewed=false;

  function init(){
    if(loaded) return;
    loaded=true;
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init',PIXEL_ID);
    fbq('consent','grant');
  }

  function pageView(){
    init();
    if(pageViewed) return;
    pageViewed=true;
    fbq('track','PageView');
  }

  function setConsent(value){
    if(value==='all'){
      pageView();
    }else if(window.fbq){
      fbq('consent','revoke');
    }
  }

  function track(event,params){
    if(localStorage.getItem('duitCookieConsent')!=='all') return;
    init();
    fbq('track',event,params||{});
  }

  function trackCustom(event,params){
    if(localStorage.getItem('duitCookieConsent')!=='all') return;
    init();
    fbq('trackCustom',event,params||{});
  }

  window.duitMetaPixel={
    id:PIXEL_ID,
    setConsent,
    track,
    trackCustom,
    pageView
  };

  if(localStorage.getItem('duitCookieConsent')==='all') pageView();
})();