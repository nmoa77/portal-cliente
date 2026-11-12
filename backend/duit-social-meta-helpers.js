'use strict';
// Regras puras e testáveis do publicador Meta.
function facebookCarouselParams(photoIds,caption=''){
  if(!Array.isArray(photoIds)||photoIds.length<2||photoIds.length>10||
    photoIds.some(id=>typeof id!=='string'||!/^\d+$/.test(id)))
    throw new Error('IDs Facebook de carrossel inválidos');
  const params={message:String(caption)};
  photoIds.forEach((id,i)=>{
    params['attached_media['+i+']']=JSON.stringify({media_fbid:id});
  });
  return params;
}
function isFacebookReelPublished(status){
  if(!status||typeof status!=='object')return false;
  const phase=String(status.publishing_phase?.status||'').toLowerCase();
  const video=String(status.video_status||'').toLowerCase();
  return phase==='complete'||phase==='completed'||video==='published';
}
function validateFacebookReelUploadUrl(url,videoId){
  if(!/^\d+$/.test(String(videoId)))throw Error('Identificador de Reel inválido');
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||parsed.hostname!=='rupload.facebook.com')
    throw Error('Host de upload não autorizado');
  return parsed.href;
}
module.exports={facebookCarouselParams,isFacebookReelPublished,validateFacebookReelUploadUrl};
