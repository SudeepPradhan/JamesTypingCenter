const textarea = document.getElementById('input');
const wpmEl = document.getElementById('wpm');
const timeEl = document.getElementById('time');
const wordsEl = document.getElementById('words');
const stopBtn = document.getElementById('stop');
const resetBtn = document.getElementById('reset');
const loadSampleBtn = document.getElementById('loadSample');
const copyLinkBtn = document.getElementById('copyLink');

let startTime = null;
let timerId = null;
let running = false;
let sampleRef = '';
let prevValue = '';
// baseline average typing speed (words per minute) for a typical adult
const BASELINE_WPM = 40;

function countWords(text){
  text = text.trim();
  if(!text) return 0;
  return text.split(/\s+/).length;
}

function update(){
  if(!startTime) return;
  const now = Date.now();
  const elapsedSec = (now - startTime) / 1000;
  const words = countWords(textarea.value);
  const wpm = elapsedSec > 0 ? Math.round(words / (elapsedSec/60)) : 0;
  wpmEl.textContent = wpm;
  timeEl.textContent = elapsedSec.toFixed(1);
  wordsEl.textContent = words;
  // update live accuracy when typing against a sample (word-level)
  const accEl = document.getElementById('accuracy');
  if(accEl){
    const acc = computeWordAccuracy();
    if(acc === null) accEl.textContent = 'N/A';
    else accEl.textContent = `${acc.correct}/${acc.total} (${acc.percent.toFixed(1)}%)`;
  }
}


textarea.addEventListener('input', ()=>{
  if(!running){
    startTime = Date.now();
    running = true;
    timerId = setInterval(update, 200);
  }
  const cur = textarea.value || '';
  // Per-character highlighting
  if(sampleRef && sampleDisplayEl){
    const spans = sampleDisplayEl.querySelectorAll('span.sample-char');
    for(let i = 0; i < sampleRef.length; i++){
      spans[i]?.classList.remove('flash-red');
    }
    // Only flash the incorrect character
    if(cur.length > prevValue.length){
      for(let i = prevValue.length; i < cur.length; i++){
        const typedChar = cur[i];
        const refChar = sampleRef[i] || '';
        if(typedChar !== refChar && spans[i]){
          spans[i].classList.add('flash-red');
          setTimeout(()=>{
            spans[i]?.classList.remove('flash-red');
          }, 500);
          break;
        }
      }
    }
  }
  update();
  prevValue = cur;
});

stopBtn.addEventListener('click', ()=>{
  if(running){
    clearInterval(timerId);
    update();
    running = false;
    const wpm = showStatsModal();
    // celebrate with confetti when above baseline and >20 WPM
    if(typeof wpm === 'number'){
      // Super celebration: 21+ WPM above baseline -> love + party + mind-blown emojis
      if(wpm >= BASELINE_WPM + 21) triggerSuperCelebration();
      // strong above-average: 11-20 WPM above baseline -> party emojis
      else if(wpm >= (BASELINE_WPM + 11) && wpm <= (BASELINE_WPM + 20)) triggerParty();
      // slightly above average: 1-10 WPM above baseline -> full-smile emojis
      else if(wpm >= (BASELINE_WPM + 1) && wpm <= (BASELINE_WPM + 10)) triggerFullSmiles();
      // if the user is within 9 WPM under baseline up to baseline (baseline-9 .. baseline) -> half-smile emojis
      else if(wpm >= (BASELINE_WPM - 9) && wpm <= BASELINE_WPM) triggerHalfSmiles();
      // if the user is 10-19 WPM under the baseline (baseline-19 .. baseline-10) -> frowning emojis
      else if(wpm >= (BASELINE_WPM - 19) && wpm <= (BASELINE_WPM - 10)) triggerFrowns();
      // otherwise (very low or below baseline) -> crying emojis
      else if(wpm <= 20 || wpm < BASELINE_WPM) triggerEmojis();
    }
  } else {
    update();
    showStatsModal();
  }
});

resetBtn.addEventListener('click', ()=>{
  clearInterval(timerId);
  startTime = null;
  running = false;
  textarea.value = '';
  wpmEl.textContent = '0';
  timeEl.textContent = '0.0';
  wordsEl.textContent = '0';
  textarea.focus();
});

// Sample paragraphs and selection
const samples = [
  'The quick brown fox jumps over the lazy dog. This sample paragraph is provided so anyone with the link can start typing immediately and measure their words per minute.',
  'Typing practice helps improve muscle memory and speed. Regular practice with short paragraphs builds confidence and reduces mistakes.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
  'Modern software development often mixes teamwork, automation, and iterative improvements to ship quality products frequently.'
];

const sampleTextEl = document.getElementById('sampleText');
const sampleDisplayEl = document.getElementById('sampleDisplay');

function renderSampleSpans() {
  if (!sampleDisplayEl) return;
  sampleDisplayEl.innerHTML = '';
  for (let i = 0; i < sampleRef.length; i++) {
    const span = document.createElement('span');
    span.textContent = sampleRef[i];
    span.className = 'sample-char';
    span.dataset.index = i;
    sampleDisplayEl.appendChild(span);
  }
}
const sampleSelect = document.getElementById('sampleSelect');
const refreshSampleBtn = document.getElementById('refreshSample');


function setSample(idx){
  const i = Math.max(0, Math.min(samples.length-1, Number(idx)||0));
  sampleRef = samples[i];
  if(sampleTextEl) sampleTextEl.textContent = sampleRef;
  if(sampleSelect) sampleSelect.value = String(i);
  renderSampleSpans();
}


function loadSample(auto=false){
  // load currently selected sample as the reference; clear textarea so user types against it
  if(!sampleRef) setSample(sampleSelect ? sampleSelect.value : 0);
  textarea.value = '';
  textarea.focus();
  renderSampleSpans();
}

if(sampleSelect){
  sampleSelect.addEventListener('change', (e)=> setSample(e.target.value));
}
if(refreshSampleBtn){
  refreshSampleBtn.addEventListener('click', ()=>{
    // pick random sample different from current
    const currentIdx = Number(sampleSelect ? sampleSelect.value : 0) || 0;
    let next = currentIdx;
    if(samples.length > 1){
      while(next === currentIdx) next = Math.floor(Math.random()*samples.length);
    }
    setSample(next);
  });
}

if(loadSampleBtn){
  loadSampleBtn.addEventListener('click', ()=> loadSample(false));
}

// Word-level accuracy calculation (compares words at same positions)
function normalizeWord(w){
  return w.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '').toLowerCase();
}

function computeWordAccuracy(){
  if(!sampleRef) return null;
  const typed = (textarea.value || '').trim();
  const sampleWords = sampleRef.split(/\s+/).filter(Boolean).map(normalizeWord);
  const typedWords = typed.length ? typed.split(/\s+/).filter(Boolean).map(normalizeWord) : [];
  const totalTyped = typedWords.length;
  if(totalTyped === 0) return {correct: 0, total: 0, percent: 0};
  let correct = 0;
  for(let i = 0; i < typedWords.length; i++){
    if(i < sampleWords.length && typedWords[i] === sampleWords[i]) correct++;
  }
  const percent = (correct / totalTyped) * 100;
  return {correct, total: totalTyped, percent};
}

function showStatsModal(){
  const modal = document.getElementById('statsModal');
  if(!modal) return;
  const modalWpm = document.getElementById('modalWpm');
  const modalAccuracy = document.getElementById('modalAccuracy');
  const modalTime = document.getElementById('modalTime');
  const modalWords = document.getElementById('modalWords');

  const words = countWords(textarea.value);
  const nowSec = startTime ? (Date.now() - startTime)/1000 : 0;
  const wpm = startTime ? Math.round(words / (nowSec/60 || 1)) : 0;

  modalWpm.textContent = wpm;
  const acc = computeWordAccuracy();
  modalAccuracy.textContent = acc === null ? 'N/A' : `${acc.correct}/${acc.total} (${acc.percent.toFixed(1)}%)`;
  // show baseline and comparison
  const modalAverage = document.getElementById('modalAverage');
  const modalCompared = document.getElementById('modalCompared');
  if(modalAverage) modalAverage.textContent = BASELINE_WPM + ' WPM';
  if(modalCompared) {
    const diff = wpm - BASELINE_WPM;
    const sign = diff > 0 ? '+' : '';
    modalCompared.textContent = sign + diff + ' WPM';
  }
  modalTime.textContent = nowSec.toFixed(1) + 's';
  modalWords.textContent = words;

  // show encouragement or 'Maybe Next Time' when below average or <= 20 WPM
  const modalMessage = document.getElementById('modalMessage');
  if(modalMessage){
    if(wpm >= BASELINE_WPM + 21){
      modalMessage.textContent = "WHO LET THIS GUY COOK!?!?";
    } else if(wpm >= (BASELINE_WPM + 11) && wpm <= (BASELINE_WPM + 20)){
      modalMessage.textContent = `Unbelievable, You're Amazing`;
    } else if(wpm >= (BASELINE_WPM + 1) && wpm <= (BASELINE_WPM + 10)){
      modalMessage.textContent = 'Above Average!';
    } else if(wpm >= (BASELINE_WPM - 9) && wpm <= BASELINE_WPM){
      modalMessage.textContent = 'Great Now, Better!';
    } else if(wpm >= (BASELINE_WPM - 19) && wpm <= (BASELINE_WPM - 10)){
      const diff = Math.max(0, BASELINE_WPM - wpm);
      modalMessage.textContent = `Dang, Try Again? — ${diff} WPM below average`;
    } else if(wpm <= 20 || wpm < BASELINE_WPM){
      const diff = Math.max(0, BASELINE_WPM - wpm);
      modalMessage.textContent = `Maybe Next Time — ${diff} WPM below average`;
    } else {
      modalMessage.textContent = '';
    }
  }

  modal.setAttribute('aria-hidden','false');
  return wpm;
}

// Modal close handlers
const closeStats = document.getElementById('closeStats');
const closeBtn = document.getElementById('closeBtn');
if(closeStats){
  closeStats.addEventListener('click', ()=>{
    const m = document.getElementById('statsModal'); if(m) m.setAttribute('aria-hidden','true');
  });
}
if(closeBtn){
  closeBtn.addEventListener('click', ()=>{
    const m = document.getElementById('statsModal'); if(m) m.setAttribute('aria-hidden','true');
  });
}

// Confetti generator
function triggerConfetti(count = 80){
  const colors = ['#ff5252','#ffb86b','#ffd166','#8bd3b1','#6fc3ff','#c27cff'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const w = Math.floor(Math.random()*10) + 6;
    const h = Math.floor(Math.random()*12) + 8;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    // place at a random horizontal position
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    // slow fall: 6 - 10 seconds
    const duration = 6 + Math.random()*4; // 6 - 10s
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    el.style.transform = `rotate(${Math.random()*360}deg)`;
    body.appendChild(el);
    pieces.push(el);
  }
  // Remove pieces after animation
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 6000);
}

// Emoji rain for low performance
function triggerEmojis(count = 40){
  const emojis = ['😭','😢'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(18 + Math.random()*30); // 18-48px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  // cleanup after animations finish
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 11000);
}

// Frowning emoji rain for mid-low performance (10-19 WPM)
function triggerFrowns(count = 40){
  const emojis = ['😞','☹️'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(18 + Math.random()*28); // 18-46px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 11000);
}

// Half-smile emoji rain for near-baseline performance (baseline-9 .. baseline)
function triggerHalfSmiles(count = 40){
  const emojis = ['🙂','😌'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(18 + Math.random()*28); // 18-46px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 11000);
}

// Full-smile emoji rain for slightly above-baseline performance (baseline+1 .. baseline+10)
function triggerFullSmiles(count = 40){
  const emojis = ['😀','😄','😃'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(18 + Math.random()*28); // 18-46px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 11000);
}

// Party emoji rain for strong performance (baseline+11 .. baseline+20)
function triggerParty(count = 60){
  const emojis = ['🎉','🥳','🎊'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(20 + Math.random()*36); // 20-56px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 11000);
}

// Super celebration: mix of love, party and mind-blown emojis for 21+ above baseline
function triggerSuperCelebration(count = 120){
  const emojis = ['❤️','😍','🥰','🎉','🥳','🎊','🤯','🤩'];
  const body = document.body;
  const pieces = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'emoji-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = Math.floor(22 + Math.random()*40); // 22-62px
    el.style.fontSize = size + 'px';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10vh';
    const duration = 6 + Math.random()*4; // 6 - 10s slow fall
    const delay = Math.random()*0.2;
    el.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
    body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(()=>{
    for(const p of pieces) p.remove();
  }, 12000);
}

// No longer needed: Error flash overlay for wrong keystrokes
function triggerErrorFlash(){}

if(copyLinkBtn){
  copyLinkBtn.addEventListener('click', async ()=>{
    try{
      const url = new URL(window.location.href);
      url.searchParams.set('sample', '1');
      // include selected sample index if available
      const idx = sampleSelect ? sampleSelect.value : '';
      if(idx !== '') url.searchParams.set('idx', String(idx));
      await navigator.clipboard.writeText(url.toString());
      const old = copyLinkBtn.textContent;
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(()=> copyLinkBtn.textContent = old, 1500);
    }catch(e){
      alert('Could not copy link.');
    }
  });
}

// Auto-load sample when URL contains ?sample=1
try{
  const params = new URLSearchParams(window.location.search);
  if(params.get('sample') === '1'){
    const idx = params.get('idx');
    if(idx !== null) setSample(Number(idx));
    else setSample(0);
    loadSample(true);
  }
}catch(e){/* ignore */}

