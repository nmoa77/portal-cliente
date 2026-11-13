'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {facebookCarouselParams,isFacebookReelPublished,validateFacebookReelUploadUrl,validateMediaSet}
  =require('../backend/duit-social-meta-helpers');

test('Facebook carrossel usa parâmetros indexed por fotografia',()=>{
 const out=facebookCarouselParams(['111','222'],'Teste DUIT');
 assert.equal(out.message,'Teste DUIT');
 assert.equal(out['attached_media[0]'],'{"media_fbid":"111"}');
 assert.equal(out['attached_media[1]'],'{"media_fbid":"222"}');
 assert.equal(Object.keys(out).length,3);
});
test('Facebook rejeita um carrossel sem 2 fotografias',()=>{
 assert.throws(()=>facebookCarouselParams(['111']));
 assert.throws(()=>facebookCarouselParams(['111','abc']));
});
test('Confirmar Facebook Reel apenas quando há status publicado',()=>{
 assert.equal(isFacebookReelPublished({video_status:'processing'}),false);
 assert.equal(isFacebookReelPublished({video_status:'ready'}),false);
 assert.equal(isFacebookReelPublished({publishing_phase:{status:'complete'}}),true);
 assert.equal(isFacebookReelPublished({video_status:'published'}),true);
});
test('Upload Meta apenas para rupload.facebook.com com HTTPS',()=>{
 assert.equal(validateFacebookReelUploadUrl('https://rupload.facebook.com/video-upload/v26.0/123','123'),
  'https://rupload.facebook.com/video-upload/v26.0/123');
 assert.throws(()=>validateFacebookReelUploadUrl('https://rupload.facebook.com.evil.test/a','123'));
 assert.throws(()=>validateFacebookReelUploadUrl('http://rupload.facebook.com/a','123'));
 assert.throws(()=>validateFacebookReelUploadUrl('https://evil.test/a','123'));
 assert.throws(()=>validateFacebookReelUploadUrl('https://rupload.facebook.com/a','bad'));
});

test('Só agenda carrosséis completos com posições consecutivas',()=>{
 assert.equal(validateMediaSet('carousel',[
  {position:0,mime:'image/jpeg'},{position:1,mime:'image/jpeg'}]),true);
 assert.equal(validateMediaSet('carousel',[
  {position:0,mime:'image/jpeg'},{position:2,mime:'image/jpeg'}]),false);
 assert.equal(validateMediaSet('carousel',[{position:0,mime:'image/jpeg'}]),false);
 assert.equal(validateMediaSet('carousel',[
  {position:0,mime:'image/jpeg'},{position:1,mime:'image/png'}]),false);
});
test('Reels aceitam apenas um MP4 e posts apenas um JPEG',()=>{
 assert.equal(validateMediaSet('reel',[{position:0,mime:'video/mp4'}]),true);
 assert.equal(validateMediaSet('reel',[{position:0,mime:'image/jpeg'}]),false);
 assert.equal(validateMediaSet('post',[{position:0,mime:'image/jpeg'}]),true);
 assert.equal(validateMediaSet('post',[{position:0,mime:'image/jpeg'},{position:1,mime:'image/jpeg'}]),false);
});
