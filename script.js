const tracks = [
  { id:'t1', title:'Midnight Drive', artist:'Skyline', src:'media/midnight-drive.mp3', cover:'media/covers/cover1.jpg', album:'City Lights' },
  { id:'t2', title:'Ocean Breeze', artist:'Marina', src:'media/ocean-breeze.mp3', cover:'media/covers/cover2.jpg', album:'Seaside' },
  { id:'t3', title:'Neon Pulse', artist:'Electra', src:'media/neon-pulse.mp3', cover:'media/covers/cover3.jpg', album:'Synthwave' },
  { id:'t4', title:'Golden Hour', artist:'Aurora', src:'media/golden-hour.mp3', cover:'media/covers/cover4.jpg', album:'Moments' }
];

const state = {index: 0, playing: false, shuffle: false, repeat: 'off'};

const audio = document.getElementById('audio');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const statusEl = document.getElementById('status');

const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');

const seek = document.getElementById('seek');
const current = document.getElementById('current');
const duration = document.getElementById('duration');
const volume = document.getElementById('volume');

const queueSel = document.getElementById('queue');
const searchInput = document.getElementById('search');
const albumsGrid = document.getElementById('albums');
const libraryBox = document.getElementById('library');

function formatTime(second){
  if (!isFinite(second)) return '0:00';
  const m = Math.floor(second/60);
  const s = Math.floor(second%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function renderQueue(list = tracks){
  queueSel.innerHTML = '';
  list.forEach((t,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.title} — ${t.artist}`;
    queueSel.appendChild(opt);
  });
  queueSel.value = state.index;
}

function renderAlbums(){
  const albums = [...new Set(tracks.map(t=>t.album))];
  albumsGrid.innerHTML = '';
  albums.forEach(album=>{
    const first = tracks.find(t=>t.album===album);
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <img src="${first.cover}" alt="${album}">
      <div class="title">${album}</div>
      <div class="artist">${first.artist}</div>
      <button class="btn" style="align-self:flex-start" data-album="${album}">▶️ Play</button>
    `;
    albumsGrid.appendChild(el);
    el.querySelector('button').addEventListener('click', ()=>{
      const idx = tracks.findIndex(t=>t.album===album);
      loadTrack(idx); play();
    });
  });
}

function renderLibrary(filter=''){
  libraryBox.innerHTML = '';
  const list = tracks
    .map((t,i)=>({t,i}))
    .filter(({t})=>{
      const q = filter.trim().toLowerCase();
      return !q || [t.title,t.artist,t.album].some(x=>x.toLowerCase().includes(q));
    });

  list.forEach(({t,i})=>{
    const row = document.createElement('div');
    row.style.display='flex';
    row.style.alignItems='center';
    row.style.gap='10px';
    row.style.padding='8px';
    row.style.borderRadius='8px';
    row.style.cursor='pointer';
    row.innerHTML = `
      <img src="${t.cover}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover">
      <div style="min-width:0">
        <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${t.title}</div>
        <div style="color:#aaa; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${t.artist} • ${t.album}</div>
      </div>
      <span class="pill">Play</span>
    `;
    row.addEventListener('click', ()=>{ loadTrack(i); play(); });
    libraryBox.appendChild(row);
  });
}

function loadTrack(idx){
  state.index = idx;
  const t = tracks[idx];
  audio.src = t.src;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  coverEl.src = t.cover;
  statusEl.textContent = state.playing ? 'Playing' : 'Paused';
  renderQueue();
}

function play(){
  audio.play().then(()=>{
    state.playing = true;
    btnPlay.textContent = '⏸️';
    statusEl.textContent = 'Playing';
  }).catch(err=>console.warn('Playback error:', err));
}

function pause(){
  audio.pause();
  state.playing = false;
  btnPlay.textContent = '▶️';
  statusEl.textContent = 'Paused';
}

function next(){
  if (state.shuffle){
    const candidates = tracks.map((_,i)=>i).filter(i=>i!==state.index);
    const r = candidates[Math.floor(Math.random()*candidates.length)];
    loadTrack(r); play(); return;
  }
  if (state.repeat==='one'){
    audio.currentTime = 0; play(); return;
  }
  const atEnd = state.index >= tracks.length-1;
  const nextIndex = atEnd ? 0 : state.index+1;
  if (atEnd && state.repeat==='off'){ pause(); audio.currentTime=0; return; }
  loadTrack(nextIndex); play();
}

function prev(){
  if (audio.currentTime > 3){ audio.currentTime = 0; return; }
  const atStart = state.index === 0;
  const prevIndex = atStart ? tracks.length-1 : state.index-1;
  loadTrack(prevIndex); play();
}

// События
btnPlay.addEventListener('click', ()=> state.playing ? pause() : play());
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

btnShuffle.addEventListener('click', ()=>{
  state.shuffle = !state.shuffle;
  btnShuffle.classList.toggle('active', state.shuffle);
});

btnRepeat.addEventListener('click', ()=>{
  state.repeat = state.repeat==='off' ? 'one' : state.repeat==='one' ? 'all' : 'off';
  btnRepeat.classList.toggle('active', state.repeat!=='off');
  btnRepeat.title = `Repeat: ${state.repeat}`;
});

seek.addEventListener('input', ()=>{
  const pct = parseFloat(seek.value)/100;
  if (isFinite(audio.duration)) audio.currentTime = pct * audio.duration;
});

volume.addEventListener('input', ()=>{ audio.volume = parseFloat(volume.value); });

audio.addEventListener('timeupdate', ()=>{
  const d = audio.duration || 0;
  const c = audio.currentTime || 0;
  current.textContent = formatTime(c);
  duration.textContent = formatTime(d);
  seek.value = d ? (c/d)*100 : 0;
});

audio.addEventListener('ended', next);

queueSel.addEventListener('change', (e)=>{
  const idx = parseInt(e.target.value,10);
  loadTrack(idx); play();
});

searchInput.addEventListener('input', (e)=>{ renderLibrary(e.target.value); });

// Клавиатурные шорткаты
document.addEventListener('keydown', (e)=>{
  if (e.target.matches('input, textarea')) return;
  if (e.code==='Space'){ e.preventDefault(); state.playing ? pause() : play(); }
  if (e.code==='ArrowRight'){ audio.currentTime = Math.min((audio.currentTime||0)+5, audio.duration||0); }
  if (e.code==='ArrowLeft'){ audio.currentTime = Math.max((audio.currentTime||0)-5, 0); }
  if (e.key.toLowerCase()==='m'){ audio.muted = !audio.muted; }
  if (e.key.toLowerCase()==='s'){ btnShuffle.click(); }
  if (e.key.toLowerCase()==='r'){ btnRepeat.click(); }
});

// Инициализация
renderQueue();
renderAlbums();
renderLibrary();
loadTrack(0);
