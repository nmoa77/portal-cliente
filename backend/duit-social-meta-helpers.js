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
function validateMediaSet(kind,rows){
 if(!['post','carousel','reel'].includes(kind)||!Array.isArray(rows))return false;
 const required=kind==='carousel'?2:1;
 if(rows.length<required||(kind!=='carousel'&&rows.length!==1)||rows.length>10)return false;
 return rows.every((row,index)=>Number(row.position)===index &&
    row.mime===(kind==='reel'?'video/mp4':'image/jpeg'));
}
function validMetaPostId(value){
 return typeof value==='string' && /^\d{1,40}(?:_\d{1,40})?$/.test(value);
}
function canReconcile(jobStatus,networkStatus,action){
 return jobStatus==='review' && ['review','processing'].includes(networkStatus)
   && ['confirm_published','verified_not_published'].includes(action);
}
function canCancelSchedule(jobStatus,networkStatuses){
 return jobStatus==='scheduled' &&
   Array.isArray(networkStatuses) &&
   networkStatuses.length>0 &&
   networkStatuses.every(status=>status==='pending');
}
function isFutureSchedule(value,now=Date.now()){
 const timestamp=Date.parse(value);
 return Number.isFinite(timestamp)&&timestamp>now;
}
module.exports={facebookCarouselParams,isFacebookReelPublished,validateFacebookReelUploadUrl,validateMediaSet,validMetaPostId,canReconcile,canCancelSchedule,isFutureSchedule};
