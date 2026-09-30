/* DUIT — Meta Pixel com Consent Mode */
(function(){
  const PIXEL_ID='977484327979431';
  let loaded=false;
  let pageViewed=false;

  function loadPixel(){
    if(loaded) return;
    loaded=true;
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

    fbq('consent','revoke');
    fbq('init',PIXEL_ID);
  }

  function grant(){
    loadPixel();
    fbq('consent','grant');
  }

  function pageView(){
    grant();
    if(pageViewed) return;
    pageViewed=true;
    fbq('track','PageView');
  }

  function setConsent(value){
    loadPixel();
    if(value==='all'){
      pageView();
    }else{
      fbq('consent','revoke');
    }
  }

  function track(event,params){
    if(localStorage.getItem('duitCookieConsent')!=='all') return;
    grant();
    fbq('track',event,params||{});
  }

  function trackCustom(event,params){
    if(localStorage.getItem('duitCookieConsent')!=='all') return;
    grant();
    fbq('trackCustom',event,params||{});
  }

  window.duitMetaPixel={
    id:PIXEL_ID,
    setConsent,
    track,
    trackCustom,
    pageView
  };

  loadPixel();
  if(localStorage.getItem('duitCookieConsent')==='all') pageView();
})();