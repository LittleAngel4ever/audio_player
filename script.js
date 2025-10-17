const songs = [
  {title: "Шёлк", src: "songs/shelk.mp3", cover: "covers_of_songs/shelc.jpg", lyricsFile: "texts/shelc.txt"},
  {title: "Настоящая", src: "songs/Настоящая.mp3", cover: "covers_of_songs/nastoyashay.jpg", lyricsFile: "texts/nastoyashay.txt"},
  {title: "Стерва", src: "songs/Стерва.mp3", cover: "covers_of_songs/sterva.jpg", lyricsFile: "texts/sterva.txt"},
  {title: "Венера-Юпитер", src: "songs/Венера-Юпитер.mp3", cover: "covers_of_songs/venera-upiter.jpg", lyricsFile: "texts/venera-upiter.txt"}
]

let curSongs = 0
let audios = null

function renSongsList() {
  const list = document.getElementById("music-items")
  list.innerHTML = ""
  songs.forEach((track, index) => {
    const li = document.createElement("li")
    li.innerHTML = `<img src="${track.cover}" alt="${track.title}" class="cover-thumb" /><span class="title-text">${track.title}</span>`
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
  audios.play()
  document.getElementById("download-link").href = track.src
  const playIcon = document.getElementById("play-symbol")
  playIcon.src = "assets/pause.png"
  playIcon.alt = "Pause"
  fetch(track.lyricsFile)
    .then(response => response.ok ? response.text() : Promise.reject())
    .then(text => {
      document.getElementById("song-text").textContent = text
    })
    .catch(() => {
      document.getElementById("song-text").textContent = "Song text not found."
    })
  setProgress()
  renSongsList()
}

function togglePlay() {
  if (!audios) audios = document.getElementById("audio-player")
  const icon = document.getElementById("play-symbol")
  if (audios.paused) {
    audios.play()
    icon.src = "assets/pause.png"
    icon.alt = "Pause"
  } else {
    audios.pause()
    icon.src = "assets/play.png"
    icon.alt = "Play"
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

function showText() {
  const lyrics = document.getElementById("song-text")
  const isHidden = lyrics.style.display === "none" || lyrics.style.display === ""
  lyrics.style.display = isHidden ? "block" : "none"
}

function returnToList() {
  document.getElementById("player-box").style.display = "none"
  document.getElementById("music-list").style.display = "block"
  renSongsList()
}

function setProgress() {
  audios = document.getElementById("audio-player")
  audios.ontimeupdate = () => {
    const progress = document.getElementById("seek-bar")
    if (audios.duration) {
      progress.value = (audios.currentTime / audios.duration) * 100
      document.getElementById("time-current").textContent = formatTime(audios.currentTime)
      document.getElementById("time-total").textContent = formatTime(audios.duration)
    }
  }
  const progressBar = document.getElementById("seek-bar")
  progressBar.oninput = e => {
    if (audios.duration) {
      audios.currentTime = (e.target.value / 100) * audios.duration
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

window.onload = () => {
  renSongsList()
  audios = document.getElementById("audio-player")
  const volumeBar = document.getElementById("sound-bar")
  if (volumeBar) {
    audios.volume = (volumeBar.value || 80) / 100
    volumeBar.oninput = e => {
      audios.volume = e.target.value / 100
    }
  }
  const ct = document.getElementById("time-current")
  const tt = document.getElementById("time-total")
  if (ct) ct.textContent = "0:00"
  if (tt) tt.textContent = "0:00"
}
