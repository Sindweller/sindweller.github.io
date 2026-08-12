/* ========================================
   GAME STATE
======================================== */
/* ========================================
   GAME STATE - State Machine
======================================== */
const State = {
  // Game phase machine: 'title' | 'prologue' | 'route_select' | 'route' | 'minigame' | 'battle' | 'ending'
  gamePhase:'title',

  // Core
  scene:'title',
  player:'新兵',
  route:null,
  history:[],
  autoMode:false,
  skipMode:false,
  typing:false,
  currentText:'',
  textIndex:0,
  typeTimer:null,

  // NPC Affinity (existing)
  haidi:0, duorou:0, ligong:0, shalaxi:0, ss:0,
  // Non-datable NPC affinity/counters (from 剧情.md)
  tp:0,   // TP - 30K中年人 (不可攻略但有好感计数)

  // Player Attributes (from 世界观.md + 剧情.md)
  intellect:0,    // 计谋 - from battle/strategy choices
  aesthetic:0,    // 审美 - from painting/art choices
  luck:0,         // 运气 - from random/fate choices
  paintSkill:0,   // 涂装技术 - 剧情.md 中 P1-18 选项3 的属性

  // Time & Energy System (from 世界观.md)
  day:1,
  week:1,
  energy:5,
  maxEnergy:5,

  // Buff/Flag system (from 剧情.md)
  dailyDiceMod:0,      // 每日首次骰子 ±1 (P0-1选项3「迷路了」触发)

  // God Blessings (from 世界观.md)
  diceGodWorshiped:false,   // 骰神 - 每日朝拜获得计谋(CP)
  worshipedToday:false,     // 今日是否已朝拜（每日重置）
  khorneBlessed:false,      // 恐虐 - 冲锋12获得
  hornedRatBlessed:false,   // 大角鼠 - 士气2获得
  slaneeshCount:0,          // 色孽计数 - 3个NPC喜爱触发
  tzeentchCount:0,          // 巧高奇计数 - 3次离经叛道选择触发

  // Model System (from 世界观.md)
  modelColor:null,    // 'red' | 'blue' | 'green'
  modelQuality:0,     // 模型品质 0-100

  // Special flags
  morningLuckBonus:false,  // P0-1 迷路了 buff
  randomEncountered:{zhou:false, huyou:false, tan:false, yao:false, alex:false},
  randomReturnTo:null,

  // === Chapter 2 additions ===
  chapterTwoStarted:false,
  money:0,                   // 资金
  addiction:0,               // 锤瘾
  dayOfWeek:1,               // 1=周一 … 7=周日
  chargeCount:0,             // 累计"冲锋结果12"次数 → 恐虐
  moraleCount:0,             // 累计"士气结果2"次数 → 大角鼠
  heresyCount:0,             // 累计"离经叛道发言"次数 → 大角鼠
  dailyReroll:0,             // 骰神朝拜后获得，每日可重投
  npcMetToday:{haidi:false, duorou:false, ligong:false, shalaxi:false},
  ateToday:false,
  battleToday:false,
  eventToday:false,
  storeRaceEnrolled:false,
  storeRaceRank:null,
  storeRaceScore:0,
  storeRacePlayed:false,
  slaneeshBlessed:false,     // 色孽赐福
  tzeentchBlessed:false,     // 巧高奇赐福（预留）
  cutsceneShown:{khorne:false, hornedrat:false, slaneesh:false, tzeentch:false}
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

  // Apply scene-level flags (e.g. chapterOneDone at p1_19)
  if(sc.flags){
    for(const [key, val] of Object.entries(sc.flags)){
      State[key] = val;
    }
  }

  // Apply scene-level state effects (Chapter 2)
  applySceneEffects(sc);

  // onEnter callback: run before any text/choices render
  if(sc.onEnter && typeof window[sc.onEnter] === 'function'){
    try{ window[sc.onEnter](); }catch(e){ console.error(e); }
  }

  // Resolve dynamic text / choices for this render
  const scText = sc.textFn ? sc.textFn(State) : (sc.text || '');
  let scChoices = sc.choicesFn ? sc.choicesFn(State) : sc.choices;
  if(Array.isArray(scChoices)){
    scChoices = scChoices.filter(c => !c.enabledIf || c.enabledIf(State));
  }

  // Random encounter check at choice points
  // 触发条件：第一章已完成 + 未选路线 + 不在小剧场返回途中 + 非第二章日常循环内
  if(scChoices && State.chapterOneDone && State.route === null && !State.randomReturnTo && !id.startsWith('p2_')){
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

  // Choices: 如果场景同时有 text，先显示 text，等用户点击后再显示 choices（在 advance() 里处理）
  // 如果场景只有 choices 没有 text，则直接显示选项
  if(scChoices && !scText){
    __pendingChoices = scChoices;
    showChoices(scChoices);
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

  // QTE (涂装读条)
  if(sc.qte){
    setTimeout(()=>{
      openPaintQTE();
    }, 800);
  }

  // Name input prompt (P1-2) — do NOT auto-popup; wait for user click in advance()

  // Cache resolved choices for advance()
  __pendingChoices = scChoices || null;

  // Typewriter
  setTimeout(()=>{
    let txt = (scText || '').replace(/{name}/g, State.player);
    // Support state placeholders like {money}, {week}, {day}, {addiction}, {dayName}
    txt = txt.replace(/\{money\}/g, State.money)
             .replace(/\{week\}/g, State.week)
             .replace(/\{day\}/g, State.day)
             .replace(/\{addiction\}/g, State.addiction)
             .replace(/\{dayName\}/g, weekdayName(State.dayOfWeek))
             .replace(/\{energy\}/g, State.energy)
             .replace(/\{maxEnergy\}/g, State.maxEnergy);
    typewriter(txt, ()=>{
      if(State.autoMode){
        setTimeout(advance, 1500);
      }
    });
  }, 300);
}

/* Chapter 2: scene effects & helpers ------------------------------- */
let __pendingChoices = null;

function applySceneEffects(sc){
  if(typeof sc.money === 'number' && sc.money !== 0){
    State.money += sc.money;
    showMoneyPopup(sc.money);
    updateHUD();
  }
  if(typeof sc.addiction === 'number' && sc.addiction !== 0){
    State.addiction += sc.addiction;
    showAttributePopup('addiction', sc.addiction);
  }
  if(typeof sc.energyDelta === 'number' && sc.energyDelta !== 0){
    State.energy = Math.max(0, Math.min(State.maxEnergy, State.energy + sc.energyDelta));
    showAttributePopup('energy', sc.energyDelta);
    updateHUD();
  }
  if(sc.affinity){
    for(const [k,v] of Object.entries(sc.affinity)){
      State[k] += v; showAffinityPopup(k, v);
    }
    updateHUD();
  }
  if(sc.attributes){
    for(const [k,v] of Object.entries(sc.attributes)){
      State[k] += v; showAttributePopup(k, v);
    }
    updateHUD();
  }
}

function weekdayName(d){
  return ['','周一','周二','周三','周四','周五','周六','周日'][d] || '';
}

function showMoneyPopup(val){
  const el = $('affinity-popup');
  const sign = val>0?'+':'';
  el.innerHTML = '💰 资金 ' + sign + val;
  el.style.color = val>0 ? '#e0c078' : '#c88';
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 1200);
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

  // Apply random affinity (P0-1 choice 1: random NPC +1)
  if(choice.randomAffinity){
    const keys = Object.keys(choice.randomAffinity);
    const pool = [];
    for(const k of keys){
      for(let i=0; i<choice.randomAffinity[k]; i++) pool.push(k);
    }
    if(pool.length > 0){
      const pick = pool[Math.floor(Math.random() * pool.length)];
      State[pick] += 1;
      showAffinityPopup(pick, 1);
    }
    updateHUD();
  }

  // Apply attribute changes
  if(choice.attributes){
    for(const [key, val] of Object.entries(choice.attributes)){
      State[key] += val;
      showAttributePopup(key, val);
    }
    updateHUD();
  }

  // Apply flags (set to specific value, e.g. dailyDiceMod)
  if(choice.flags){
    for(const [key, val] of Object.entries(choice.flags)){
      State[key] = val;
      showAttributePopup(key, val);
    }
    updateHUD();
  }

  // Chapter 2: choice-level money/addiction/energy/counters
  if(typeof choice.money === 'number' && choice.money !== 0){
    State.money += choice.money; showMoneyPopup(choice.money); updateHUD();
  }
  if(typeof choice.addiction === 'number' && choice.addiction !== 0){
    State.addiction += choice.addiction; showAttributePopup('addiction', choice.addiction);
  }
  if(typeof choice.energyDelta === 'number' && choice.energyDelta !== 0){
    State.energy = Math.max(0, Math.min(State.maxEnergy, State.energy + choice.energyDelta));
    showAttributePopup('energy', choice.energyDelta);
    updateHUD();
  }
  if(choice.mark){ // mark daily-once flags like npcMetToday.haidi
    for(const [k,v] of Object.entries(choice.mark)){
      if(k.indexOf('.')>=0){
        const [a,b]=k.split('.'); if(State[a]) State[a][b]=v;
      } else {
        State[k]=v;
      }
    }
  }
  if(choice.counter){ // increment story counters (chargeCount / moraleCount / heresyCount)
    for(const [k,v] of Object.entries(choice.counter)){
      State[k] = (State[k]||0) + v;
    }
  }

  // Set model color
  if(choice.modelColor){
    State.modelColor = choice.modelColor;
  }

  // Set route
  if(choice.route){
    State.route = choice.route;
    State.gamePhase = 'route';
  }

  // Action dispatch (openWorship / openShop / endDay / storeRace / signup)
  if(choice.action){
    handleAction(choice.action, choice);
    return;
  }

  // Random encounter return
  if(choice.autoReturn && State.randomReturnTo){
    const returnTo = State.randomReturnTo;
    State.randomReturnTo = null;
    setTimeout(()=>renderScene(returnTo), 400);
    return;
  }

  // Compute dynamic next
  let nextId = choice.next;
  if(!nextId && choice.nextFn){ nextId = choice.nextFn(State); }
  if(nextId){
    setTimeout(()=>renderScene(nextId), 400);
  }
}

/* Chapter 2: choice actions ------------------------------- */
function handleAction(action, choice){
  const nextId = choice.next || (choice.nextFn ? choice.nextFn(State) : null);
  switch(action){
    case 'openWorship':
      openWorshipModal();
      if(nextId) setTimeout(()=>renderScene(nextId), 300);
      break;
    case 'openShop':
      $('shop-overlay').classList.add('show');
      if(nextId) setTimeout(()=>renderScene(nextId), 300);
      break;
    case 'signupRace':
      if(State.money >= 200 && !State.storeRaceEnrolled){
        State.money -= 200; State.storeRaceEnrolled = true;
        showMoneyPopup(-200); updateHUD();
      }
      if(nextId) setTimeout(()=>renderScene(nextId), 300);
      break;
    case 'nextDay':
      // Called from P2-9-5 结算
      endDay();
      const target = getNextDaySceneId();
      setTimeout(()=>renderScene(target), 400);
      break;
    case 'storeRace':
      runStoreRace();
      break;
    default:
      // Fallback: 如果 action 是全局函数名，直接调用
      if(typeof window[action] === 'function'){
        try{ window[action](); }catch(e){ console.error(e); }
        return;
      }
      if(nextId) setTimeout(()=>renderScene(nextId), 400);
  }
}

/* Chapter 2: day/week logic ------------------------------- */
function endDay(){
  State.addiction += 1;
  showAttributePopup('addiction', 1);
  // Blessings check (only trigger cutscene once each)
  const blessings = [];
  if(!State.cutsceneShown.khorne && !State.khorneBlessed && State.chargeCount >= 3) blessings.push('khorne');
  if(!State.cutsceneShown.hornedrat && !State.hornedRatBlessed && (State.moraleCount >= 3 || State.heresyCount >= 3)) blessings.push('hornedrat');
  if(!State.cutsceneShown.slaneesh && !State.slaneeshBlessed){
    const npcs = [State.haidi>=3, State.duorou>=3, State.ligong>=3, State.shalaxi>=3].filter(Boolean).length;
    if(npcs >= 3) blessings.push('slaneesh');
  }
  State.__pendingCutscene = blessings.length > 0 ? blessings[0] : null;
  // Time advance
  State.day += 1;
  State.dayOfWeek += 1;
  if(State.dayOfWeek > 7){
    State.dayOfWeek = 1;
    State.week += 1;
  }
  // Reset per-day flags & energy
  State.worshipedToday = false;
  State.dailyReroll = 0;
  State.npcMetToday = {haidi:false, duorou:false, ligong:false, shalaxi:false};
  State.ateToday = false;
  State.battleToday = false;
  State.eventToday = false;
  State.maxEnergy = (State.dayOfWeek === 7 ? 3 : 2);
  State.energy = State.maxEnergy;
  updateHUD();
}

function getNextDaySceneId(){
  // Cutscene has highest priority
  if(State.__pendingCutscene){
    const c = State.__pendingCutscene;
    State.__pendingCutscene = null;
    if(c === 'khorne') return 'p2_cs_khorne';
    if(c === 'hornedrat') return 'p2_cs_hornedrat';
    if(c === 'slaneesh') return 'p2_cs_slaneesh';
  }
  // 第4周 · 周日：店赛日
  if(State.week >= 4 && State.dayOfWeek === 7){
    return State.storeRaceEnrolled ? 'p2_9_12' : 'p2_9_15';
  }
  // 第4周 · 周六：明天店赛
  if(State.week >= 4 && State.dayOfWeek === 6){
    return 'p2_9_11';
  }
  // 第4周 · 工作日：加班提示
  if(State.week >= 4 && State.dayOfWeek <= 5){
    return 'p2_9_10';
  }
  // 前3周 · 周六周日
  if(State.dayOfWeek >= 6){
    return 'p2_9_9';
  }
  // 前3周 · 工作日
  return 'p2_9_6';
}

/* Chapter 2: store race ------------------------------- */
// 简单 QTE 版店赛：3 轮瑞士轮，玩家亲自掷骰，可用 CP 重投一颗骰子
const Race = {
  round:0,               // 0=未开始, 1..3=当前轮次, 4=已结束
  myDice:[0,0],          // 玩家 2d6
  oppDice:[0,0],         // 对手 2d6
  myBonus:0,             // 属性加成
  oppBonus:0,            // 对手随机加成
  myLocked:[false,false],// 骰子是否已确认（不能再重投）
  total:0,               // 累计有效分差
  rolled:false,          // 本轮玩家已掷
  oppRolled:false,       // 本轮对手已掷
  opponents:['李工','海底','多肉']
};

function openStoreRaceModal(){
  Race.round = 1;
  Race.total = 0;
  Race.rolled = false;
  Race.oppRolled = false;
  Race.myDice = [0,0];
  Race.oppDice = [0,0];
  Race.myLocked = [false,false];
  Race.myBonus = Math.min(6, Math.floor(State.intellect/2) + Math.floor(State.luck/3) + Math.floor(State.paintSkill/3));
  Race.oppBonus = 0;
  $('race-log').innerHTML = '';
  $('race-modal').classList.add('show');
  updateRaceUI();
}

function updateRaceUI(){
  $('race-round').textContent = '第 ' + Math.min(3, Race.round) + ' / 3 轮';
  $('race-opp-name').textContent = Race.opponents[(Race.round-1)%Race.opponents.length];
  const my1=$('race-die-my1'), my2=$('race-die-my2');
  const op1=$('race-die-op1'), op2=$('race-die-op2');
  my1.textContent = Race.myDice[0]||'?';
  my2.textContent = Race.myDice[1]||'?';
  op1.textContent = Race.oppDice[0]||'?';
  op2.textContent = Race.oppDice[1]||'?';
  my1.classList.toggle('locked', Race.myLocked[0]);
  my2.classList.toggle('locked', Race.myLocked[1]);
  $('race-my-bonus').textContent = '加成 +' + Race.myBonus;
  $('race-opp-bonus').innerHTML = Race.oppBonus>0 ? ('加成 +' + Race.oppBonus) : '&nbsp;';
  const mySum = Race.rolled ? (Race.myDice[0]+Race.myDice[1]+Race.myBonus) : '-';
  const opSum = Race.oppRolled ? (Race.oppDice[0]+Race.oppDice[1]+Race.oppBonus) : '-';
  $('race-my-sum').textContent = mySum;
  $('race-opp-sum').textContent = opSum;
  const roundDiff = (Race.rolled && Race.oppRolled) ? clamp20((mySum-opSum)*2) : 0;
  $('race-diff-val').textContent = roundDiff;
  $('race-total-val').textContent = Race.total;
  // Buttons
  const rollBtn = $('race-roll-btn');
  const rerollBtn = $('race-reroll-btn');
  const nextBtn = $('race-next-btn');
  const finishBtn = $('race-finish-btn');
  if(Race.round > 3){
    rollBtn.style.display = 'none'; rerollBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    finishBtn.style.display = '';
    return;
  }
  if(!Race.rolled){
    rollBtn.style.display = ''; rollBtn.disabled = false;
    rerollBtn.style.display = ''; rerollBtn.disabled = true;
    nextBtn.style.display = 'none'; finishBtn.style.display = 'none';
  } else {
    rollBtn.style.display = 'none';
    rerollBtn.style.display = ''; rerollBtn.disabled = (State.intellect<=0) || (Race.myLocked[0]&&Race.myLocked[1]);
    nextBtn.style.display = ''; nextBtn.disabled = false;
    finishBtn.style.display = 'none';
  }
}

function clamp20(n){ return Math.max(-20, Math.min(20, n)); }

function raceRoll(){
  if(Race.rolled) return;
  // Animate
  $('race-die-my1').classList.add('rolling');
  $('race-die-my2').classList.add('rolling');
  $('race-die-op1').classList.add('rolling');
  $('race-die-op2').classList.add('rolling');
  let ticks = 0;
  const interval = setInterval(()=>{
    Race.myDice = [rollD6(), rollD6()];
    Race.oppDice = [rollD6(), rollD6()];
    updateRaceUI();
    ticks++;
    if(ticks >= 8){
      clearInterval(interval);
      $('race-die-my1').classList.remove('rolling');
      $('race-die-my2').classList.remove('rolling');
      $('race-die-op1').classList.remove('rolling');
      $('race-die-op2').classList.remove('rolling');
      // final rolls
      Race.myDice = [rollD6(), rollD6()];
      Race.oppDice = [rollD6(), rollD6()];
      Race.oppBonus = Math.floor(Math.random()*5);
      Race.rolled = true;
      Race.oppRolled = true;
      // Count story flags: 冲锋结果12 / 士气结果2
      const myTotal = Race.myDice[0]+Race.myDice[1];
      if(myTotal === 12){ State.chargeCount += 1; showAttributePopup('冲锋12', 1); }
      if(myTotal === 2){ State.moraleCount += 1; showAttributePopup('士气2', 1); }
      logRace('第 ' + Race.round + ' 轮：你 ' + Race.myDice.join('+') + '(+' + Race.myBonus + ') vs 对手 ' + Race.oppDice.join('+') + (Race.oppBonus?'(+'+Race.oppBonus+')':''));
      updateRaceUI();
    }
  }, 60);
}

function rollD6(){ return Math.floor(Math.random()*6)+1; }

function raceReroll(){
  if(!Race.rolled) return;
  if(State.intellect <= 0) return;
  // 选一颗未锁定且分数较低的骰子重投
  let pick = -1;
  if(!Race.myLocked[0] && !Race.myLocked[1]){
    pick = (Race.myDice[0] <= Race.myDice[1]) ? 0 : 1;
  } else if(!Race.myLocked[0]){
    pick = 0;
  } else if(!Race.myLocked[1]){
    pick = 1;
  }
  if(pick < 0) return;
  State.intellect -= 1;
  showAttributePopup('intellect', -1);
  updateHUD();
  const die = $('race-die-my'+(pick+1));
  die.classList.add('rolling');
  let ticks = 0;
  const interval = setInterval(()=>{
    Race.myDice[pick] = rollD6();
    updateRaceUI();
    ticks++;
    if(ticks >= 6){
      clearInterval(interval);
      die.classList.remove('rolling');
      Race.myDice[pick] = rollD6();
      Race.myLocked[pick] = true;
      logRace('CP 重投第' + (pick+1) + '颗骰子 → ' + Race.myDice[pick]);
      updateRaceUI();
    }
  }, 60);
}

function raceNext(){
  if(!Race.rolled) return;
  // Settle this round
  const mySum = Race.myDice[0]+Race.myDice[1]+Race.myBonus;
  const opSum = Race.oppDice[0]+Race.oppDice[1]+Race.oppBonus;
  const diff = clamp20((mySum - opSum) * 2);
  Race.total += diff;
  logRace(diff>=0 ? ('  → 本轮胜 +'+diff) : ('  → 本轮负 '+diff), diff>=0?'log-win':'log-lose');
  Race.round += 1;
  Race.rolled = false;
  Race.oppRolled = false;
  Race.myDice = [0,0];
  Race.oppDice = [0,0];
  Race.myLocked = [false,false];
  updateRaceUI();
}

function raceFinish(){
  $('race-modal').classList.remove('show');
  // Compute rank
  State.storeRaceScore = Race.total;
  State.storeRacePlayed = true;
  if(Race.total >= 20) State.storeRaceRank = 1;
  else if(Race.total >= 0) State.storeRaceRank = 2;
  else State.storeRaceRank = 3 + Math.floor(Math.random()*3);
  const nextId = State.storeRaceRank === 1 ? 'p2_9_13' : 'p2_9_14';
  setTimeout(()=>renderScene(nextId), 300);
}

function logRace(msg, cls){
  const el = $('race-log');
  const line = document.createElement('div');
  line.className = 'log-line' + (cls?' '+cls:'');
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

// 由 handleAction('storeRace') 调用：改为打开 QTE 界面而非直接结算
function runStoreRace(){
  openStoreRaceModal();
}

function showAttributePopup(attr, val){
  const el = $('affinity-popup'); // reuse same popup element
  const labels = {intellect:'计谋(CP)', aesthetic:'审美', luck:'运气', paintSkill:'涂装技术', dailyDiceMod:'每日骰运', tp:'TP好感', addiction:'锤瘾', energy:'体力'};
  const sign = val>0?'+':'';
  el.innerHTML = '⚜️ ' + (labels[attr] || attr) + ' ' + sign + val;
  el.style.color = val>0 ? '#c5a059' : '#666';
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 1200);
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
  // Affinity bars
  $('bar-haidi').style.width = Math.min(100, State.haidi*10) + '%';
  $('bar-duorou').style.width = Math.min(100, State.duorou*10) + '%';
  $('bar-ligong').style.width = Math.min(100, State.ligong*10) + '%';
  $('bar-shalaxi').style.width = Math.min(100, State.shalaxi*10) + '%';
  $('bar-ss').style.width = Math.min(100, State.ss*10) + '%';
  // Attribute bars
  $('bar-aesthetic').style.width = Math.min(100, State.aesthetic*8) + '%';
  $('bar-luck').style.width = Math.min(100, State.luck*8) + '%';
  const paintBar = $('bar-paintSkill');
  if(paintBar) paintBar.style.width = Math.min(100, State.paintSkill*8) + '%';
  // Time & Energy
  const el = $('hud-time');
  if(el){
    let extra = '';
    if(State.dailyDiceMod !== 0) extra = ' 🎲' + (State.dailyDiceMod>0?'+':'') + State.dailyDiceMod;
    if(State.dailyReroll > 0) extra += ' ♻️';
    let dow = State.chapterTwoStarted ? (' ' + weekdayName(State.dayOfWeek)) : '';
    el.textContent = '第' + State.week + '周' + dow + ' | ' + '❤️'.repeat(State.energy) + '🖤'.repeat(Math.max(0, State.maxEnergy - State.energy)) + extra;
  }
  // CP == 计谋
  const cpEl = $('hud-cp');
  if(cpEl){
    let ch2 = '';
    if(State.chapterTwoStarted){
      ch2 = ' | 💰¥' + State.money + ' | 🔨锤瘾' + State.addiction;
      const flags = [];
      if(State.khorneBlessed) flags.push('🔴恐虐');
      if(State.hornedRatBlessed) flags.push('🟢大角鼠');
      if(State.slaneeshBlessed) flags.push('🟣色孽');
      if(State.tzeentchBlessed) flags.push('🔵巧高奇');
      if(flags.length) ch2 += ' ' + flags.join(' ');
    }
    cpEl.textContent = '🎲 CP(计谋): ' + State.intellect + ch2;
  }
}

// Get next scene id
function getNextSceneId(id){
  const sc = Scenes[id];
  if(!sc) return null;
  if(sc.choices || sc.choicesFn) return null; // wait for choice
  if(sc.type) return null; // ending
  if(sc.endingCheck) return null; // ending trigger - handled by advance()
  // If scene has explicit next, use it
  if(sc.next) return sc.next;
  if(sc.nextFn) return sc.nextFn(State);
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

  // Name input trigger: click on a scene with `nameInput` after typewriter is done
  const curScNI = Scenes[currentSceneId];
  if(curScNI && curScNI.nameInput && !State.hasNamed){
    $('name-input-screen').classList.remove('hidden');
    $('player-name-input').focus();
    $('player-name-input').select();
    return;
  }

  // Show choices after user reads text (for scenes with both text and choices)
  if(curScNI && (curScNI.choices || curScNI.choicesFn)){
    const chs = __pendingChoices || (curScNI.choicesFn ? curScNI.choicesFn(State) : curScNI.choices);
    const filtered = chs ? chs.filter(c => !c.enabledIf || c.enabledIf(State)) : chs;
    showChoices(filtered);
    return;
  }

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
    scene: State.randomReturnTo || currentSceneId,
    player: State.player,
    haidi: State.haidi,
    duorou: State.duorou,
    ligong: State.ligong,
    shalaxi: State.shalaxi,
    ss: State.ss,
    tp: State.tp,
    route: State.route,
    intellect: State.intellect,
    aesthetic: State.aesthetic,
    luck: State.luck,
    paintSkill: State.paintSkill,
    dailyDiceMod: State.dailyDiceMod,
    day: State.day,
    week: State.week,
    energy: State.energy,
    maxEnergy: State.maxEnergy,
    diceGodWorshiped: State.diceGodWorshiped,
    worshipedToday: State.worshipedToday,
    khorneBlessed: State.khorneBlessed,
    hornedRatBlessed: State.hornedRatBlessed,
    slaneeshCount: State.slaneeshCount,
    tzeentchCount: State.tzeentchCount,
    modelColor: State.modelColor,
    modelQuality: State.modelQuality,
    morningLuckBonus: State.morningLuckBonus,
    randomEncountered: State.randomEncountered,
    // Chapter 2
    chapterTwoStarted: State.chapterTwoStarted,
    money: State.money,
    addiction: State.addiction,
    dayOfWeek: State.dayOfWeek,
    chargeCount: State.chargeCount,
    moraleCount: State.moraleCount,
    heresyCount: State.heresyCount,
    dailyReroll: State.dailyReroll,
    npcMetToday: State.npcMetToday,
    ateToday: State.ateToday,
    battleToday: State.battleToday,
    eventToday: State.eventToday,
    storeRaceEnrolled: State.storeRaceEnrolled,
    storeRaceRank: State.storeRaceRank,
    storeRaceScore: State.storeRaceScore,
    storeRacePlayed: State.storeRacePlayed,
    slaneeshBlessed: State.slaneeshBlessed,
    tzeentchBlessed: State.tzeentchBlessed,
    cutsceneShown: State.cutsceneShown,
    chapterOneDone: State.chapterOneDone
  };
  localStorage.setItem('warhammer_save', JSON.stringify(data));
}

function loadGame(){
  const raw = localStorage.getItem('warhammer_save');
  if(!raw) return null;
  return JSON.parse(raw);
}

function startNewGame(){
  State.gamePhase = 'prologue';
  State.hasNamed = false;
  State.chapterOneDone = false;
  State.haidi = 0;
  State.duorou = 0;
  State.ligong = 0;
  State.shalaxi = 0;
  State.ss = 0;
  State.tp = 0;
  State.intellect = 0;
  State.aesthetic = 0;
  State.luck = 0;
  State.paintSkill = 0;
  State.dailyDiceMod = 0;
  State.day = 1;
  State.week = 1;
  State.energy = 5;
  State.maxEnergy = 5;
  State.diceGodWorshiped = false;
  State.worshipedToday = false;
  State.khorneBlessed = false;
  State.hornedRatBlessed = false;
  State.slaneeshCount = 0;
  State.tzeentchCount = 0;
  State.modelColor = null;
  State.modelQuality = 0;
  State.morningLuckBonus = false;
  State.route = null;
  State.randomEncountered = {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  resetChapterTwoState();
  $('hud').classList.add('show');
  updateHUD();
  $('title-screen').classList.add('hidden');
  renderScene('p0_1');
}

function resetChapterTwoState(){
  State.chapterTwoStarted = false;
  State.money = 0;
  State.addiction = 0;
  State.dayOfWeek = 1;
  State.chargeCount = 0;
  State.moraleCount = 0;
  State.heresyCount = 0;
  State.dailyReroll = 0;
  State.npcMetToday = {haidi:false, duorou:false, ligong:false, shalaxi:false};
  State.ateToday = false;
  State.battleToday = false;
  State.eventToday = false;
  State.storeRaceEnrolled = false;
  State.storeRaceRank = null;
  State.storeRaceScore = 0;
  State.storeRacePlayed = false;
  State.slaneeshBlessed = false;
  State.tzeentchBlessed = false;
  State.cutsceneShown = {khorne:false, hornedrat:false, slaneesh:false, tzeentch:false};
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
  State.tp = data.tp || 0;
  State.intellect = data.intellect || 0;
  State.aesthetic = data.aesthetic || 0;
  State.luck = data.luck || 0;
  State.paintSkill = data.paintSkill || 0;
  State.dailyDiceMod = data.dailyDiceMod || 0;
  State.day = data.day || 1;
  State.week = data.week || 1;
  State.energy = data.energy || 5;
  State.maxEnergy = data.maxEnergy || 5;
  State.diceGodWorshiped = data.diceGodWorshiped || false;
  State.worshipedToday = data.worshipedToday || false;
  State.khorneBlessed = data.khorneBlessed || false;
  State.hornedRatBlessed = data.hornedRatBlessed || false;
  State.slaneeshCount = data.slaneeshCount || 0;
  State.tzeentchCount = data.tzeentchCount || 0;
  State.modelColor = data.modelColor || null;
  State.modelQuality = data.modelQuality || 0;
  State.morningLuckBonus = data.morningLuckBonus || false;
  State.route = data.route || null;
  State.randomEncountered = data.randomEncountered || {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  State.chapterOneDone = !!data.chapterOneDone;
  // Chapter 2
  State.chapterTwoStarted = !!data.chapterTwoStarted;
  State.money = data.money || 0;
  State.addiction = data.addiction || 0;
  State.dayOfWeek = data.dayOfWeek || 1;
  State.chargeCount = data.chargeCount || 0;
  State.moraleCount = data.moraleCount || 0;
  State.heresyCount = data.heresyCount || 0;
  State.dailyReroll = data.dailyReroll || 0;
  State.npcMetToday = data.npcMetToday || {haidi:false, duorou:false, ligong:false, shalaxi:false};
  State.ateToday = !!data.ateToday;
  State.battleToday = !!data.battleToday;
  State.eventToday = !!data.eventToday;
  State.storeRaceEnrolled = !!data.storeRaceEnrolled;
  State.storeRaceRank = data.storeRaceRank || null;
  State.storeRaceScore = data.storeRaceScore || 0;
  State.storeRacePlayed = !!data.storeRacePlayed;
  State.slaneeshBlessed = !!data.slaneeshBlessed;
  State.tzeentchBlessed = !!data.tzeentchBlessed;
  State.cutsceneShown = data.cutsceneShown || {khorne:false, hornedrat:false, slaneesh:false, tzeentch:false};
  $('hud').classList.add('show');
  updateHUD();
  $('title-screen').classList.add('hidden');
  $('name-input-screen').classList.add('hidden');
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
  // Modal overlays block advance
  if($('race-modal').classList.contains('show')) return;
  if($('worship-modal').classList.contains('show')) return;
  if($('shop-overlay').classList.contains('show')) return;
  if($('qte-modal').classList.contains('show')) return;
  if($('qrcode-modal').classList.contains('show')) return;
  if($('yao-image-modal').classList.contains('show')) return;
  if($('ligong-image-modal').classList.contains('show')) return;
  advance();
});

$('btn-start').addEventListener('click', ()=>{
  $('title-screen').classList.add('hidden');
  // 名字先用默认，P1-2 场景会触发取名弹窗
  State.player = '新兵';
  startNewGame();
});

$('btn-confirm-name').addEventListener('click', ()=>{
  const name = $('player-name-input').value.trim() || '新兵';
  State.player = name;
  State.hasNamed = true;
  $('name-input-screen').classList.add('hidden');
  // 取完名后推进到下一个场景
  const next = getNextSceneId(currentSceneId);
  if(next){
    renderScene(next);
  } else {
    renderScene(currentSceneId);
  }
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
  State.gamePhase = 'title';
  State.hasNamed = false;
  State.chapterOneDone = false;
  State.haidi = 0;
  State.duorou = 0;
  State.ligong = 0;
  State.shalaxi = 0;
  State.ss = 0;
  State.tp = 0;
  State.intellect = 0;
  State.aesthetic = 0;
  State.luck = 0;
  State.paintSkill = 0;
  State.dailyDiceMod = 0;
  State.day = 1;
  State.week = 1;
  State.energy = 5;
  State.maxEnergy = 5;
  State.diceGodWorshiped = false;
  State.worshipedToday = false;
  State.khorneBlessed = false;
  State.hornedRatBlessed = false;
  State.slaneeshCount = 0;
  State.tzeentchCount = 0;
  State.modelColor = null;
  State.modelQuality = 0;
  State.morningLuckBonus = false;
  State.route = null;
  State.randomEncountered = {zhou:false, huyou:false, tan:false, yao:false, alex:false};
  State.randomReturnTo = null;
  resetChapterTwoState();
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

/* ======== WORSHIP (Dice God) ======== */
function openWorshipModal(){
  const doBtn = $('worship-do-btn');
  const status = $('worship-status');
  const idol = $('worship-idol');
  idol.classList.remove('blessed');
  if(State.worshipedToday){
    status.textContent = '今日已朝拜 (+1 CP)';
    status.classList.add('done');
    doBtn.disabled = true;
  } else {
    status.textContent = '今日尚未朝拜';
    status.classList.remove('done');
    doBtn.disabled = false;
  }
  $('worship-modal').classList.add('show');
}

$('btn-worship').addEventListener('click', (e)=>{
  e.stopPropagation();
  openWorshipModal();
});

$('worship-do-btn').addEventListener('click', ()=>{
  if(State.worshipedToday) return;
  State.worshipedToday = true;
  State.diceGodWorshiped = true;
  State.intellect += 1;
  updateHUD();
  $('worship-idol').classList.add('blessed');
  $('worship-status').textContent = '朝拜成功！ 计谋+1 (可作CP重投)';
  $('worship-status').classList.add('done');
  $('worship-do-btn').disabled = true;
  showAttributePopup('intellect', 1);
});

$('worship-close-btn').addEventListener('click', ()=>{
  $('worship-modal').classList.remove('show');
});

$('worship-modal').addEventListener('click', (e)=>{
  if(e.target === $('worship-modal')){
    $('worship-modal').classList.remove('show');
  }
});

/* ======== STORE RACE (瑞士轮) ======== */
$('race-roll-btn').addEventListener('click', (e)=>{ e.stopPropagation(); raceRoll(); });
$('race-reroll-btn').addEventListener('click', (e)=>{ e.stopPropagation(); raceReroll(); });
$('race-next-btn').addEventListener('click', (e)=>{ e.stopPropagation(); raceNext(); });
$('race-finish-btn').addEventListener('click', (e)=>{ e.stopPropagation(); raceFinish(); });

/* Advance day helper: reset per-day flags */
function advanceDay(){
  State.day += 1;
  State.worshipedToday = false;
  State.energy = State.maxEnergy;
  updateHUD();
}

/* Chapter 2 onEnter: start the daily-loop system */
function startChapter2(){
  if(State.chapterTwoStarted) return;
  State.chapterTwoStarted = true;
  // 从第一章第一天之后，直接进入第一周·周一（早晨闹钟）
  State.week = 1;
  State.day = 1;
  State.dayOfWeek = 1;
  State.maxEnergy = 2;
  State.energy = 2;
  State.addiction = 1; // P2-1 "锤瘾"解锁 +1
  showAttributePopup('addiction', 1);
  updateHUD();
}

/* Chapter 2 onEnter: 拜骰神 —— scene P2-9-2 */
function worshipDiceGod(){
  if(State.worshipedToday) return;
  State.worshipedToday = true;
  State.diceGodWorshiped = true;
  State.dailyReroll = 1;
  State.intellect += 1;
  showAttributePopup('intellect', 1);
  updateHUD();
}

/* Chapter 2 onEnter: 聚餐 P2-9-4 */
function runDinner(){
  const pool = ['haidi','duorou','ligong','shalaxi'];
  // Pick 2 random npcs
  const p1 = pool.splice(Math.floor(Math.random()*pool.length),1)[0];
  const p2 = pool.splice(Math.floor(Math.random()*pool.length),1)[0];
  State[p1] += 1; showAffinityPopup(p1, 1);
  State[p2] += 1; showAffinityPopup(p2, 1);
  State.energy = Math.min(State.maxEnergy, State.energy + 1);
  showAttributePopup('energy', 1);
  const cost = 20 + Math.floor(Math.random()*31);
  State.money = Math.max(0, State.money - cost);
  showMoneyPopup(-cost);
  State.ateToday = true;
  updateHUD();
}

/* Chapter 2 onEnter: 随机对战 P2-9-battle */
function runRandomBattle(){
  // 冲锋掷 2d6，士气掷 d6
  const charge = (Math.floor(Math.random()*6)+1) + (Math.floor(Math.random()*6)+1);
  const morale = Math.floor(Math.random()*6)+1;
  if(charge === 12){ State.chargeCount += 1; showAttributePopup('冲锋12', 1); }
  if(morale === 2 || morale === 1){ State.moraleCount += 1; showAttributePopup('士气崩', 1); }
  const win = Math.random() < 0.5 + Math.min(0.3, State.intellect*0.03);
  if(win){
    State.intellect += 1; showAttributePopup('intellect', 1);
  } else {
    State.paintSkill += 1; showAttributePopup('paintSkill', 1);
  }
  State.battleToday = true;
  updateHUD();
}

/* Chapter 2 onEnter: 每日随机事件 */
function runDailyEvent(){
  // 从已有小剧场池中挑选一个（如果未触发过），或者简单地给一点资源
  const roll = Math.random();
  if(roll < 0.4){
    const gain = 20 + Math.floor(Math.random()*30);
    State.money += gain; showMoneyPopup(gain);
  } else if(roll < 0.7){
    State.aesthetic += 1; showAttributePopup('aesthetic', 1);
  } else {
    State.luck += 1; showAttributePopup('luck', 1);
  }
  State.eventToday = true;
  updateHUD();
}

/* 升魔过场：接受赐福 */
function markKhorne(){
  State.khorneBlessed = true;
  State.cutsceneShown.khorne = true;
  updateHUD();
  const next = getNextDaySceneId();
  setTimeout(()=>renderScene(next), 400);
}
function markHornedRat(){
  State.hornedRatBlessed = true;
  State.cutsceneShown.hornedrat = true;
  updateHUD();
  const next = getNextDaySceneId();
  setTimeout(()=>renderScene(next), 400);
}
function markSlaneesh(){
  State.slaneeshBlessed = true;
  State.cutsceneShown.slaneesh = true;
  updateHUD();
  const next = getNextDaySceneId();
  setTimeout(()=>renderScene(next), 400);
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

/* ======== PAINT QTE (涂装读条) ======== */
const Paint = {
  stage: 0,                 // 0=未开始, 1..3=当前阶段
  stages: [
    { name:'剪水口', targetW:32, speed:1.6 },
    { name:'喷底漆', targetW:26, speed:2.1 },
    { name:'点眼睛', targetW:18, speed:2.7 }
  ],
  targetLeft: 0,
  indicatorPos: 0,
  direction: 1,
  animId: null,
  results: [null,null,null],
  clicked: false
};

function openPaintQTE(){
  Paint.stage = 1;
  Paint.results = [null,null,null];
  $('qte-modal').classList.add('show');
  startPaintStage();
}

function startPaintStage(){
  const st = Paint.stages[Paint.stage-1];
  // 目标区随机（留出边距，避免贴边）
  Paint.targetLeft = 5 + Math.random() * (95 - st.targetW - 5);
  Paint.indicatorPos = 0;
  Paint.direction = 1;
  Paint.clicked = false;

  $('paint-stage-label').textContent = '第 ' + Paint.stage + ' / 3 · ' + st.name;
  const targetEl = $('paint-target');
  targetEl.style.left = Paint.targetLeft + '%';
  targetEl.style.width = st.targetW + '%';
  $('paint-action-btn').textContent = '点击停下';
  $('paint-action-btn').disabled = false;
  const msg = $('paint-hitmsg');
  msg.textContent = '\u00a0';
  msg.classList.remove('miss');
  updatePaintResults();
  runPaintAnim();
}

function runPaintAnim(){
  if(Paint.animId) cancelAnimationFrame(Paint.animId);
  const st = Paint.stages[Paint.stage-1];
  function tick(){
    if(Paint.clicked) return;
    Paint.indicatorPos += Paint.direction * st.speed;
    if(Paint.indicatorPos >= 100){ Paint.indicatorPos = 100; Paint.direction = -1; }
    if(Paint.indicatorPos <= 0){ Paint.indicatorPos = 0; Paint.direction = 1; }
    $('paint-indicator').style.left = Paint.indicatorPos + '%';
    Paint.animId = requestAnimationFrame(tick);
  }
  Paint.animId = requestAnimationFrame(tick);
}

function paintActionClick(){
  if(Paint.stage < 1 || Paint.stage > 3) return;
  if(!Paint.clicked){
    // Stop the indicator
    Paint.clicked = true;
    if(Paint.animId) cancelAnimationFrame(Paint.animId);
    const st = Paint.stages[Paint.stage-1];
    const hit = Paint.indicatorPos >= Paint.targetLeft &&
                Paint.indicatorPos <= Paint.targetLeft + st.targetW;
    Paint.results[Paint.stage-1] = hit ? 'hit' : 'miss';
    updatePaintResults();
    const msg = $('paint-hitmsg');
    if(hit){
      msg.textContent = '✓ 完美！';
      msg.classList.remove('miss');
    } else {
      msg.textContent = '✗ 手抖了';
      msg.classList.add('miss');
    }
    $('paint-action-btn').textContent = (Paint.stage >= 3) ? '查看结果' : '下一阶段 ▶';
    return;
  }
  // Advance
  if(Paint.stage >= 3){
    paintFinish();
  } else {
    Paint.stage += 1;
    startPaintStage();
  }
}

function updatePaintResults(){
  const ids = ['paint-r1','paint-r2','paint-r3'];
  for(let i=0;i<3;i++){
    const el = $(ids[i]);
    if(!el) continue;
    el.classList.remove('hit','miss');
    if(Paint.results[i]==='hit') el.classList.add('hit');
    else if(Paint.results[i]==='miss') el.classList.add('miss');
  }
}

function paintFinish(){
  if(Paint.animId) cancelAnimationFrame(Paint.animId);
  const hits = Paint.results.filter(r=>r==='hit').length;
  applyPaintRewards(hits);
  $('qte-modal').classList.remove('show');
  Paint.stage = 0;
}

function paintSkip(){
  // 跳过：给桌涂默认奖励
  if(Paint.animId) cancelAnimationFrame(Paint.animId);
  if(Paint.stage !== 0){
    applyPaintRewards(1); // 视作 1 命中：桌涂
  }
  $('qte-modal').classList.remove('show');
  Paint.stage = 0;
}

function applyPaintRewards(hits){
  if(hits >= 3){
    State.paintSkill += 2; showAttributePopup('paintSkill', 2);
    State.aesthetic += 1;  showAttributePopup('aesthetic', 1);
    State.duorou += 2;     showAffinityPopup('duorou', 2);
    State.modelQuality = 90;
  } else if(hits === 2){
    State.paintSkill += 1; showAttributePopup('paintSkill', 1);
    State.duorou += 1;     showAffinityPopup('duorou', 1);
    State.modelQuality = 65;
  } else if(hits === 1){
    State.paintSkill += 1; showAttributePopup('paintSkill', 1);
    State.modelQuality = 40;
  } else {
    State.modelQuality = 20;
  }
  updateHUD();
}

$('paint-action-btn').addEventListener('click', (e)=>{ e.stopPropagation(); paintActionClick(); });
$('qte-close-btn').addEventListener('click', (e)=>{ e.stopPropagation(); paintSkip(); });
// 屏蔽点击 modal 背景关闭（避免误触失去 QTE 奖励）
$('qte-modal').addEventListener('click', (e)=>{ e.stopPropagation(); });

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
  if(id && Scenes[id] && !Scenes[id].type && !Scenes[id].choices && !Scenes[id].choicesFn){
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
