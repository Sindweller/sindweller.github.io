/* ========================================
   GAME STATE
======================================== */
const State = {
  scene:'title',
  player:'新兵',
  haidi:0,
  duorou:0,
  ligong:0,
  shalaxi:0,
  route:null,
  history:[],
  autoMode:false,
  skipMode:false,
  typing:false,
  currentText:'',
  textIndex:0,
  typeTimer:null,
  ss:0,
  randomEncountered:{zhou:false, huyou:false, tan:false, yao:false, alex:false}
};

/* ========================================
   CHARACTERS
======================================== */
const Chars = {
  haidi:{name:'海底', port:portraitHaidi},
  duorou:{name:'多肉', port:portraitDuorou},
  zhou:{name:'周师傅', port:portraitZhou},
  ligong:{name:'李工', port:portraitLigong},
  shalaxi:{name:'青嶙', port:portraitShalaxi},
  ss:{name:'SS', port:portraitSS},
  huyou:{name:'忽悠', port:portraitHuyou},
  dz:{name:'DZ', port:portraitDZ},
  tan:{name:'谭老师', port:portraitTan},
  yao:{name:'药师傅', port:portraitYao},
  alex:{name:'Alex', port:portraitAlex},
  narration:{name:'', cls:'narration'}
};


/* ========================================
   GAME ENGINE
======================================== */
const $ = id => document.getElementById(id);
let currentSceneId = null;

function setBg(name){
  const layer = $('bg-layer');
  layer.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'bg-scene bg-'+name+' active';
  layer.appendChild(div);
}

function setChar(pos, charKey, expr){
  const el = $('char-'+pos);
  if(!charKey){
    el.classList.remove('active');
    setTimeout(()=>{ if(!el.classList.contains('active')) el.innerHTML=''; }, 500);
    return;
  }
  el.innerHTML = Chars[charKey].port(expr||'normal');
  requestAnimationFrame(()=>{
    el.classList.add('active');
  });
}

function setSpeaker(charKey){
  const el = $('speaker-name');
  if(charKey==='narration' || !charKey){
    el.textContent = '';
    el.className = 'narration';
    return;
  }
  el.textContent = Chars[charKey].name;
  el.className = charKey;
}

function showSceneLabel(label, sub){
  if(!label) return;
  const el = $('scene-label');
  el.innerHTML = label + (sub?'<small>'+sub+'</small>':'');
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2200);
}

function typewriter(text, cb){
  State.currentText = text;
  State.textIndex = 0;
  State.typing = true;
  $('dialogue-text').innerHTML = '';
  clearInterval(State.typeTimer);
  let i=0;
  State.typeTimer = setInterval(()=>{
    if(i < text.length){
      const ch = text[i];
      if(ch==='\n'){
        $('dialogue-text').innerHTML += '<br>';
      } else {
        $('dialogue-text').innerHTML += ch;
      }
      i++;
    } else {
      clearInterval(State.typeTimer);
      State.typing = false;
      $('dialogue-text').innerHTML += '<span class="cursor-blink">▼</span>';
      if(cb) cb();
    }
  }, 28);
}

function skipTypewriter(){
  if(State.typing){
    clearInterval(State.typeTimer);
    State.typing = false;
    $('dialogue-text').innerHTML = State.currentText.replace(/\n/g,'<br>') + '<span class="cursor-blink">▼</span>';
    return true;
  }
  return false;
}

function renderScene(id){
  const sc = Scenes[id];
  if(!sc) return;
  currentSceneId = id;

  // Random encounter check at choice points (only during prologue)
  if(sc.choices && State.route === null && !State.randomReturnTo){
    const reScene = grabRandomEncounter();
    if(reScene){
      State.randomReturnTo = id;
      $('fade-overlay').classList.add('show');
      setTimeout(()=>{
        renderScene(reScene);
        $('fade-overlay').classList.remove('show');
      }, 400);
      return;
    }
  }

  // Choices
  if(sc.choices){
    showChoices(sc.choices);
    return;
  }

  // Ending
  if(sc.type){
    showEnding(sc);
    return;
  }

  // Background
  if(sc.bg){
    setBg(sc.bg);
  }

  // Scene label
  if(sc.label || sc.labelSub){
    showSceneLabel(sc.label, sc.labelSub);
  }

  // Characters
  setChar('left', null);
  setChar('center', null);
  setChar('right', null);
  if(sc.char){
    const pos = sc.charPos || 'center';
    setChar(pos, sc.char, sc.expr);
  }
  if(sc.char2){
    setChar(sc.charPos2 || 'right', sc.char2, sc.expr2);
  }

  // Speaker
  setSpeaker(sc.speaker);

  // Dialogue
  $('dialogue-box').classList.add('show');

  // Yao image popup
  if(sc.showYaoImage){
    setTimeout(()=>{
      $('yao-image-modal').classList.add('show');
    }, 800);
  }

  // Typewriter
  setTimeout(()=>{
    let txt = (sc.text || '').replace(/{name}/g, State.player);
    typewriter(txt, ()=>{
      if(State.autoMode){
        setTimeout(advance, 1500);
      }
    });
  }, 300);
}

function showChoices(choices){
  $('dialogue-box').classList.remove('show');
  const layer = $('choices-layer');
  layer.innerHTML = '';
  choices.forEach((c, i)=>{
    const btn = document.createElement('div');
    btn.className = 'choice-btn';
    btn.innerHTML = c.text + (c.hint?'<br><span style="font-size:12px;color:var(--dim);margin-top:4px;display:block">'+c.hint+'</span>':'');
    btn.onclick = (e)=>{
      e.stopPropagation();
      makeChoice(c);
    };
    layer.appendChild(btn);
  });
  setTimeout(()=>layer.classList.add('show'), 200);
}

function makeChoice(choice){
  $('choices-layer').classList.remove('show');
  setTimeout(()=>$('choices-layer').innerHTML='', 300);

  // Apply affinity
  if(choice.affinity){
    for(const [key, val] of Object.entries(choice.affinity)){
      State[key] += val;
      showAffinityPopup(key, val);
    }
    updateHUD();
  }

  // Set route
  if(choice.route){
    State.route = choice.route;
  }

  // Random encounter return (no affinity, no route)
  if(choice.autoReturn && State.randomReturnTo){
    const returnTo = State.randomReturnTo;
    State.randomReturnTo = null;
    setTimeout(()=>renderScene(returnTo), 400);
    return;
  }

  // Go to next scene
  if(choice.next){
    setTimeout(()=>renderScene(choice.next), 400);
  }
}

function showAffinityPopup(char, val){
  const el = $('affinity-popup');
  const icons = {haidi:'💙',duorou:'🧡',ligong:'💜',shalaxi:'💜',ss:'🐟'};
  const colors = {haidi:'#8ab4d8',duorou:'#e8a888',ligong:'#b8a0d8',shalaxi:'#c080e0',ss:'#80b8a0'};
  const name = icons[char] || '💕';
  const sign = val>0?'+':'';
  el.innerHTML = name + ' ' + sign + val;
  el.style.color = val>0 ? (colors[char]||'#ccc') : '#666';
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 1200);
}

function updateHUD(){
  $('bar-haidi').style.width = Math.min(100, State.haidi*10) + '%';
  $('bar-duorou').style.width = Math.min(100, State.duorou*10) + '%';
  $('bar-ligong').style.width = Math.min(100, State.ligong*10) + '%';
  $('bar-shalaxi').style.width = Math.min(100, State.shalaxi*10) + '%';
  $('bar-ss').style.width = Math.min(100, State.ss*10) + '%';
}

// Get next scene id
function getNextSceneId(id){
  const sc = Scenes[id];
  if(!sc) return null;
  if(sc.choices) return null; // wait for choice
  if(sc.type) return null; // ending
  if(sc.endingCheck) return null; // ending trigger - handled by advance()
  // If scene has explicit next, use it
  if(sc.next) return sc.next;
  // Find next sequential scene, skip re_* and hz/z scenes
  const keys = Object.keys(Scenes);
  const idx = keys.indexOf(id);
  for(let i = idx + 1; i < keys.length; i++){
    const k = keys[i];
    if(!k.startsWith('re_') && !k.startsWith('hz') && !k.startsWith('z') && Scenes[k] && !Scenes[k].type){
      return k;
    }
  }
  return null;
}

// Advance dialogue
function advance(){
  if($('choices-layer').classList.contains('show')) return;
  if($('title-screen').classList.contains('hidden')===false) return;
  if($('name-input-screen').classList.contains('hidden')===false) return;
  if($('ending-screen').classList.contains('show')) return;
  if($('fade-overlay').classList.contains('show')) return;

  // Skip typewriter if typing
  if(skipTypewriter()) return;

  // Check for ending transitions
  const curSc = Scenes[currentSceneId];
  if(curSc && curSc.endingCheck){
    checkEnding(curSc.endingCheck);
    return;
  }

  // Random encounter: go to first-part scene (re_X1/re_X2 markers that have `next`)
  if(curSc && (curSc.zhou || curSc.huyou || curSc.tan || curSc.yao || curSc.alex) && !curSc.choices){
    const next = getNextSceneId(currentSceneId);
    if(next){
      $('fade-overlay').classList.add('show');
      setTimeout(()=>{
        renderScene(next);
        $('fade-overlay').classList.remove('show');
      }, 400);
      return;
    }
  }

  // Random encounter outro: return to original scene
  if(curSc && curSc.encounterOutro){
    const returnTo = takeEncounterReturn();
    $('fade-overlay').classList.add('show');
    setTimeout(()=>{
      renderScene(returnTo);
      $('fade-overlay').classList.remove('show');
    }, 400);
    return;
  }

  // Get next scene
  const next = getNextSceneId(currentSceneId);
  if(next){
    // Fade transition
    $('fade-overlay').classList.add('show');
    setTimeout(()=>{
      renderScene(next);
      $('fade-overlay').classList.remove('show');
    }, 400);
  }
}

// 小剧场是主线的子程序，返回地址只在内存里。丢失时兜底回路线选择——绝不能交给 getNextSceneId
// 顺延，因为 key 顺序下游是不可达的 z*/hz* 孤儿线，过滤后的第一个落点是 l1（李工线）。
function takeEncounterReturn(){
  const returnTo = State.randomReturnTo || 'c1_choice';
  State.randomReturnTo = null;
  return returnTo;
}

// Grab a random encounter scene during prologue (called at choice points)
function grabRandomEncounter(){
  // Only during prologue, before route selection
  if(State.route !== null) return null;
  // 15% chance
  if(Math.random() > 0.15) return null;

  // Pick an unencountered character
  const pool = [];
  if(!State.randomEncountered.zhou) pool.push('zhou');
  if(!State.randomEncountered.huyou) pool.push('huyou');
  if(!State.randomEncountered.tan) pool.push('tan');
  if(!State.randomEncountered.yao) pool.push('yao');
  if(!State.randomEncountered.alex) pool.push('alex');
  if(pool.length === 0) return null;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  const scenes = {
    zhou:['re_zhou1','re_zhou2'],
    huyou:['re_huyou1','re_huyou2'],
    tan:['re_tan1','re_tan2'],
    yao:['re_yao1','re_yao2'],
    alex:['re_alex1','re_alex2','re_alex3']
  };
  const ids = scenes[pick];
  const reId = ids[Math.floor(Math.random() * ids.length)];

  State.randomEncountered[pick] = true;
  return reId;
}

function checkEnding(route){
  $('fade-overlay').classList.add('show');
  setTimeout(()=>{
    let ending;
    if(route==='haidi'){
      if(State.haidi >= 5) ending = 'ending_haidi_good';
      else if(State.haidi >= 2) ending = 'ending_haidi_normal';
      else ending = 'ending_bad';
    } else if(route==='duorou'){
      if(State.duorou >= 5) ending = 'ending_duorou_good';
      else if(State.duorou >= 2) ending = 'ending_duorou_normal';
      else ending = 'ending_bad_duo';
    } else if(route==='ligong'){
      if(State.ligong >= 8) ending = 'ending_ligong_wtc';
      else if(State.ligong >= 5) ending = 'ending_ligong_good';
      else if(State.ligong >= 2) ending = 'ending_ligong_normal';
      else ending = 'ending_bad_quiet';
    } else if(route==='slaneesh'){
      if(State.shalaxi >= 2) ending = 'ending_slaneesh';
      else ending = 'ending_bad';
    } else if(route==='ss'){
      if(State.ss >= 3) ending = 'ending_ss_good';
      else if(State.ss >= 1) ending = 'ending_ss_normal';
      else ending = 'ending_bad';
    } else {
      ending = 'ending_bad';
    }
    renderScene(ending);
    $('fade-overlay').classList.remove('show');
  }, 600);
}

function showEnding(sc){
  $('dialogue-box').classList.remove('show');
  setChar('left', null);
  setChar('center', null);
  setChar('right', null);
  if(sc.bg) setBg(sc.bg);
  if(sc.label) showSceneLabel(sc.label, sc.labelSub);
  $('hud').classList.remove('show');

  $('ending-type').textContent = sc.type;
  $('ending-title').textContent = sc.title;
  $('ending-text').innerHTML = sc.text.replace(/\n/g,'<br>');

  // Ligong WTC image popup
  if(sc.showLigongImage){
    setTimeout(()=>{
      $('ligong-image-modal').classList.add('show');
    }, 800);
  }

  setTimeout(()=>{
    $('ending-screen').classList.add('show');
  }, 1500);
}

/* ========================================
   SAVE / LOAD
======================================== */
function saveGame(){
  const data = {
    // 身处小剧场时存主线返回点：返回地址不持久化，存了小剧场场景读档后就回不去主线
    scene: State.randomReturnTo || currentSceneId,
    player: State.player,
    haidi: State.haidi,
    duorou: State.duorou,
    ligong: State.ligong,
    shalaxi: State.shalaxi,
    ss: State.ss,
    route: State.route,
    randomEncountered: State.randomEncountered
  };
  localStorage.setItem('warhammer_save', JSON.stringify(data));
}

function loadGame(){
  const raw = localStorage.getItem('warhammer_save');
  if(!raw) return null;
  return JSON.parse(raw);
}

function startNewGame(){
  State.haidi = 0;
  State.duorou = 0;
  State.ligong = 0;
  State.shalaxi = 0;
  State.ss = 0;
  State.route = null;
  State.randomEncountered = {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  $('hud').classList.add('show');
  updateHUD();
  $('title-screen').classList.add('hidden');
  renderScene('p1');
}

function continueGame(){
  const data = loadGame();
  if(!data) return;
  State.player = data.player || '新兵';
  State.haidi = data.haidi || 0;
  State.duorou = data.duorou || 0;
  State.ligong = data.ligong || 0;
  State.shalaxi = data.shalaxi || 0;
  State.ss = data.ss || 0;
  State.route = data.route || null;
  State.randomEncountered = data.randomEncountered || {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  $('hud').classList.add('show');
  updateHUD();
  $('title-screen').classList.add('hidden');
  $('name-input-screen').classList.add('hidden');
  // 旧版存档可能停在小剧场内，返回地址已随页面关闭丢失
  renderScene(data.scene && data.scene.startsWith('re_') ? 'c1_choice' : data.scene);
}

/* ========================================
   EVENT HANDLERS
======================================== */
$('game').addEventListener('click', (e)=>{
  // Don't advance if clicking on buttons/choices
  if(e.target.closest('button') || e.target.closest('.choice-btn')) return;
  if($('choices-layer').classList.contains('show')) return;
  if($('ending-screen').classList.contains('show')) return;
  advance();
});

$('btn-start').addEventListener('click', ()=>{
  $('title-screen').classList.add('hidden');
  $('name-input-screen').classList.remove('hidden');
  $('player-name-input').focus();
});

$('btn-confirm-name').addEventListener('click', ()=>{
  const name = $('player-name-input').value.trim() || '新兵';
  State.player = name;
  $('name-input-screen').classList.add('hidden');
  startNewGame();
});

$('player-name-input').addEventListener('keydown', (e)=>{
  if(e.key==='Enter') $('btn-confirm-name').click();
});

$('btn-continue').addEventListener('click', continueGame);

$('btn-about').addEventListener('click', ()=>{
  alert('《达米拉多战锤俱乐部 - 战火与羁绊》\n\n一个关于战锤、友情与选择的文字冒险游戏。\n\n你将扮演一位新加入达米拉多战锤俱乐部的玩家，\n在与俱乐部成员的互动中做出选择，\n你的每一个决定都将影响最终的结局。\n\n可攻略角色：\n💙 海底 — 俱乐部负责人，冷静沉稳\n🧡 多肉 — 涂装高手，活泼开朗\n💜 李工 — 新玩家，社恐但真诚\n💜 青嶙 — 神秘常客，色孽的引诱\n🐟 SS — 比耶鱼，爱好血碗/小飞机/巢都，神秘莫测\n\n周师傅、忽悠、谭老师、药师傅、Alex 会作为随机事件出现在剧情中。\n\n点击屏幕推进剧情，选择影响好感度与结局。\n\n⚠ 色孽线包含黑暗主题内容。\n⚠ SS线好感度获取极难，需要耐心。');
});

$('btn-restart').addEventListener('click', ()=>{
  $('ending-screen').classList.remove('show');
  $('title-screen').classList.remove('hidden');
  $('dialogue-box').classList.remove('show');
  setChar('left', null);
  setChar('center', null);
  setChar('right', null);
  State.haidi = 0;
  State.duorou = 0;
  State.ligong = 0;
  State.shalaxi = 0;
  State.ss = 0;
  State.route = null;
  State.randomEncountered = {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  updateHUD();
  $('hud').classList.remove('show');
});

$('btn-save').addEventListener('click', (e)=>{
  e.stopPropagation();
  if(currentSceneId && Scenes[currentSceneId] && !Scenes[currentSceneId].type){
    saveGame();
    const btn = $('btn-save');
    const orig = btn.textContent;
    btn.textContent = '✓';
    setTimeout(()=>btn.textContent = orig, 1000);
  }
});

$('btn-auto').addEventListener('click', (e)=>{
  e.stopPropagation();
  State.autoMode = !State.autoMode;
  const btn = $('btn-auto');
  btn.style.color = State.autoMode ? 'var(--gold-l)' : '';
  btn.style.borderColor = State.autoMode ? 'var(--gold-d)' : '';
});

$('btn-skip').addEventListener('click', (e)=>{
  e.stopPropagation();
  skipToNextChoice();
});

$('btn-skip-branch').addEventListener('click', (e)=>{
  e.stopPropagation();
  skipToNextBranch();
});

// Skip instantly to the next choice/ending scene
function skipToNextChoice(){
  if($('choices-layer').classList.contains('show')) return;
  if($('title-screen').classList.contains('hidden')===false) return;
  if($('name-input-screen').classList.contains('hidden')===false) return;
  if($('ending-screen').classList.contains('show')) return;
  if($('fade-overlay').classList.contains('show')) return;

  // Skip current typewriter
  skipTypewriter();

  // Walk forward through scenes until we hit choices, endingCheck, or ending
  let curId = currentSceneId;
  let steps = 0;
  const maxSteps = 200; // safety limit

  while(steps < maxSteps){
    const sc = Scenes[curId];
    if(!sc) break;

    // Stop at choice scenes
    if(sc.choices) break;
    // Stop at ending triggers
    if(sc.endingCheck) break;
    // Stop at ending display
    if(sc.type) break;

    // 小剧场 outro 只能回主线，不能按 key 顺序顺延
    if(sc.encounterOutro){
      curId = takeEncounterReturn();
      steps++;
      continue;
    }

    // Get next scene
    let nextId = null;
    if(sc.next){
      nextId = sc.next;
    } else {
      const keys = Object.keys(Scenes);
      const idx = keys.indexOf(curId);
      if(idx >= 0 && idx < keys.length - 1){
        nextId = keys[idx+1];
      }
    }

    if(!nextId) break;
    curId = nextId;
    steps++;
  }

  if(steps > 0 && curId !== currentSceneId){
    $('fade-overlay').classList.add('show');
    setTimeout(()=>{
      renderScene(curId);
      $('fade-overlay').classList.remove('show');
    }, 300);
  }
}

// Skip to the next route-branching choice (scenes with route-setting choices)
function skipToNextBranch(){
  if($('choices-layer').classList.contains('show')) return;
  if($('title-screen').classList.contains('hidden')===false) return;
  if($('name-input-screen').classList.contains('hidden')===false) return;
  if($('ending-screen').classList.contains('show')) return;
  if($('fade-overlay').classList.contains('show')) return;

  skipTypewriter();

  let curId = currentSceneId;
  let steps = 0;
  const maxSteps = 200;

  while(steps < maxSteps){
    const sc = Scenes[curId];
    if(!sc) break;
    if(sc.endingCheck) break;
    if(sc.type) break;
    if(sc.choices && sc.choices.some(c => c.route)){
      break; // found a route-branching choice
    }
    // 小剧场 outro 只能回主线，不能按 key 顺序顺延
    if(sc.encounterOutro){
      curId = takeEncounterReturn();
      steps++;
      continue;
    }
    let nextId = null;
    if(sc.next){
      nextId = sc.next;
    } else {
      const keys = Object.keys(Scenes);
      const idx = keys.indexOf(curId);
      if(idx >= 0 && idx < keys.length - 1){
        nextId = keys[idx+1];
      }
    }
    if(!nextId) break;
    curId = nextId;
    steps++;
  }

  if(steps > 0 && curId !== currentSceneId){
    $('fade-overlay').classList.add('show');
    setTimeout(()=>{
      renderScene(curId);
      $('fade-overlay').classList.remove('show');
    }, 300);
  }
}

/* ======== YAO IMAGE MODAL ======== */
$('yao-image-close').addEventListener('click', ()=>{
  $('yao-image-modal').classList.remove('show');
});

/* ======== LIGONG IMAGE MODAL ======== */
$('ligong-image-close').addEventListener('click', ()=>{
  $('ligong-image-modal').classList.remove('show');
});

$('yao-image-modal').addEventListener('click', (e)=>{
  if(e.target === $('yao-image-modal')){
    $('yao-image-modal').classList.remove('show');
  }
});

/* ======== SHOP ======== */
$('btn-shop').addEventListener('click', (e)=>{
  e.stopPropagation();
  $('shop-overlay').classList.add('show');
});

$('shop-close').addEventListener('click', ()=>{
  $('shop-overlay').classList.remove('show');
});

$('shop-overlay').addEventListener('click', (e)=>{
  if(e.target === $('shop-overlay')){
    $('shop-overlay').classList.remove('show');
  }
});

document.querySelectorAll('.shop-item').forEach(el=>{
  el.addEventListener('click', ()=>{
    const product = el.getAttribute('data-product');
    showQRCode(product);
  });
});

$('qrcode-close').addEventListener('click', ()=>{
  $('qrcode-modal').classList.remove('show');
  $('shop-overlay').classList.remove('show');
});

$('qrcode-modal').addEventListener('click', (e)=>{
  if(e.target === $('qrcode-modal')){
    $('qrcode-modal').classList.remove('show');
    $('shop-overlay').classList.remove('show');
  }
});

function showQRCode(product){
  $('shop-overlay').classList.remove('show');
  const img = $('qrcode-img');
  img.style.display = 'block';
  img.src = './请微信找海底.png';
  $('qrcode-product').textContent = '已下单：' + product;
  setTimeout(()=>{
    $('qrcode-product').textContent = '已下单：' + product;
    $('qrcode-modal').classList.add('show');
  }, 300);
}

$('btn-menu').addEventListener('click', (e)=>{
  e.stopPropagation();
  if(confirm('返回标题画面？\n（进度会自动保存）')){
    saveGame();
    $('ending-screen').classList.remove('show');
    $('dialogue-box').classList.remove('show');
    $('choices-layer').classList.remove('show');
    $('choices-layer').innerHTML = '';
    setChar('left', null);
    setChar('center', null);
    setChar('right', null);
    $('hud').classList.remove('show');
    $('title-screen').classList.remove('hidden');
    setBg('exterior');
    if(loadGame()){
      $('btn-continue').style.display = '';
    }
  }
});

/* Auto-save on scene change */
const origRender = renderScene;
renderScene = function(id){
  origRender(id);
  if(id && Scenes[id] && !Scenes[id].type && !Scenes[id].choices){
    setTimeout(()=>{
      try{ saveGame(); }catch(e){}
    }, 500);
  }
};

/* ========================================
   INIT
======================================== */
setBg('exterior');
if(loadGame()){
  $('btn-continue').style.display = '';
}
