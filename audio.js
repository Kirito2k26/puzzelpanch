// Kenney Interface Sounds (CC0): https://kenney.nl/assets/interface-sounds
(function(){'use strict';
const files={'button':'assets/sounds/click_002.ogg','move':'assets/sounds/switch_002.ogg','merge':'assets/sounds/confirmation_002.ogg','flip':'assets/sounds/open_002.ogg','match':'assets/sounds/confirmation_003.ogg','mismatch':'assets/sounds/error_001.ogg','number':'assets/sounds/tick_001.ogg','markX':'assets/sounds/select_002.ogg','markO':'assets/sounds/select_005.ogg','win':'assets/sounds/confirmation_004.ogg','lose':'assets/sounds/error_004.ogg','draw':'assets/sounds/bong_001.ogg'};
const pool={};
window.PPAudio={muted:PPStorage.get('muted',false),
 play(effect='button'){
  if(this.muted)return;
  if(typeof effect==='number')effect=effect>=800?'win':effect>=600?'markO':effect>=520?'flip':effect>=440?'number':'move';
  const path=files[effect]||files.button;
  try{let audio=pool[effect];if(!audio){audio=new Audio(path);audio.preload='auto';audio.volume=.38;pool[effect]=audio}if(!audio.paused){audio.pause();audio.currentTime=0}const p=audio.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}
 },
 toggle(){this.muted=!this.muted;PPStorage.set('muted',this.muted);if(this.muted)Object.values(pool).forEach(a=>{a.pause();a.currentTime=0});return this.muted}
};
})();
