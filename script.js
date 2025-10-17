const songs = [
  {title: "Шёлк", src: "songs/shelk.mp3", cover: "covers_of_songs/shelc.jpg", lyricsFile: "texts/shelc.txt"},
  {title: "Настоящая", src: "songs/nastoyashaya.mp3", cover: "covers_of_songs/nastoyashay.jpg", lyricsFile: "texts/nastoyashay.txt"},
  {title: "Стерва", src: "songs/sterva.mp3", cover: "covers_of_songs/sterva.jpg", lyricsFile: "texts/sterva.txt"},
  {title: "Венера-Юпитер", src: "songs/venera-upiter.mp3", cover: "covers_of_songs/venera-upiter.jpg", lyricsFile: "texts/venera-upiter.txt"}
]

let curSongs = 0
let audios = null

function renSongsList() {
  const list = document.getElementById("music-items")
  if (!list) return
  list.innerHTML = ""
  songs.forEach((track, index) => {
    const li = document.createElement("li")
    li.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" class="cover-thumb" />
      <span class="title-text">${track.title}</span>
    `
    li.onclick = () => loadingSongs(index)
    if (index === curSongs) li.classList.add("active-item")
    list.appendChild(li)
  })
}

function loadingSongs(ind) {
  curSongs = ind
  const track = songs[ind]
  document.getElementById("music-list").style.display = "none"
  document.getElementById("player-box").style.display = "block"
  document.getElementById("song-title").textContent = track.title
  document.getElementById("song-artist").textContent = "Ваня Дмитриенко"
  document.getElementById("album-cover").src = track.cover
  audios = document.getElementById("audio-player")
  audios.src = track.src
  audios.load()

  document.getElementById("download-link").href = track.src

  const playIcon = document.getElementById("play-symbol")
  playIcon.src = "assets/play.png"
  playIcon.alt = "Play"
  fetch(track.lyricsFile)
    .then(response => response.ok ? response.text() : Promise.reject())
    .then(text => {const lyricsBox = document.getElementById("song-text")
      if (lyricsBox) {lyricsBox.textContent = text}})
    .catch(() => {document.getElementById("song-text").textContent = "Song text not found."})
  setProgress()
  renSongsList()
  fetch(track.lyricsFile)
    .then(response => response.ok ? response.text() : Promise.reject())
    .then(text => {
      const lyricsBox = document.getElementById("song-text")
      if (lyricsBox) lyricsBox.textContent = text
    })
    .catch(() => {
      const lyricsBox = document.getElementById("song-text")
      if (lyricsBox) lyricsBox.textContent = "Song text not found."
    })
  setProgress()
  renSongsList()
}

function togglePlay() {
  if (!audios) audios = document.getElementById("audio-player")
  if (!audios) return
  const icon = document.getElementById("play-symbol")
  if (audios.paused) {
    audios.play().then(() => {
      if (icon) {
        icon.src = "assets/pause.png"
        icon.alt = "Pause"
      }
    }).catch(() => {
      // Если браузер блокирует автозапуск — ничего не делаем
    })
  } else {
    audios.pause()
    if (icon) {
      icon.src = "assets/play.png"
      icon.alt = "Play"
    }
  }
}

function prevSong() {
  curSongs = (curSongs - 1 + songs.length) % songs.length
  loadingSongs(curSongs)
}

function nextSong() {
  curSongs = (curSongs + 1) % songs.length
  loadingSongs(curSongs)
}

function returnToList() {
  const playerBox = document.getElementById("player-box")
  const listWrap = document.getElementById("music-list")
  if (playerBox) playerBox.style.display = "none"
  if (listWrap) listWrap.style.display = "block"
  renSongsList()
}

function setProgress() {
  audios = document.getElementById("audio-player")
  if (!audios) return

  audios.ontimeupdate = () => {
    const progress = document.getElementById("seek-bar")
    const curTimeEl = document.getElementById("time-current")
    const totalTimeEl = document.getElementById("time-total")
    if (audios.duration && progress) {
      progress.value = (audios.currentTime / audios.duration) * 100
      if (curTimeEl) curTimeEl.textContent = formatTime(audios.currentTime)
      if (totalTimeEl) totalTimeEl.textContent = formatTime(audios.duration)
    }
  }

  const progressBar = document.getElementById("seek-bar")
  if (progressBar) {
    progressBar.oninput = e => {
      if (audios.duration) {
        audios.currentTime = (e.target.value / 100) * audios.duration
      }
    }
  }

  audios.onended = () => {
    nextSong()
  }
}

function formatTime(seconds) {
  const minutes = Math.floor((seconds || 0) / 60)
  const secs = Math.floor((seconds || 0) % 60)
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
}

function toggleLyricsPanel() {
  const panel = document.getElementById("lyrics-panel")
  if (!panel) return
  panel.classList.toggle("active")
}

window.onload = () => {
  renSongsList()

  audios = document.getElementById("audio-player")
  const volumeBar = document.getElementById("sound-bar")
  if (audios && volumeBar) {
    audios.volume = (volumeBar.value || 80) / 100
    volumeBar.oninput = e => {
      audios.volume = e.target.value / 100
    }
  }

  const ct = document.getElementById("time-current")
  const tt = document.getElementById("time-total")
  if (ct) ct.textContent = "0:00"
  if (tt) tt.textContent = "0:00"

  // Скрываем панель текста при старте
  const panel = document.getElementById("lyrics-panel")
  if (panel) panel.classList.remove("active")
}
