const searchSongQuery = "trending hindi songs";
const searchInput = document.getElementById("searchInput");
const songList = document.getElementById("songList");
const masterPlay = document.getElementById("masterPlay");
const myProgressBar = document.getElementById("myProgressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const currentSongName = document.getElementById("currentSongName");
const playingGif = document.getElementById("playingGif");


let audio = new Audio();
let currentSongIndex = 0;
let songs = []; // dynamic list


// Local fallback songs
const localSongs = [
  {
    name: "Warriyo - Mortals",
    filePath: "songs/1.mp3",
    coverPath: "covers/1.jpg"
  },
  {
    name: "Cielo - Huma-Huma",
    filePath: "songs/2.mp3",
    coverPath: "covers/2.jpg"
  },
];


// Format time in mm:ss
function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}


// Load songs to Home Page
function renderSongs(songArray) {
  songList.innerHTML = "";
  songArray.forEach((song, index) => {
    const displayName = song.name.length > 30 ? song.name.substring(0, 30) + "..." : song.name;
    const songItem = document.createElement("div");
    songItem.className = "songItem";
    songItem.dataset.index = index; // store index on parent
    songItem.innerHTML = `
      <img src="${song.coverPath}" alt="cover" />
      <span>${displayName}</span>
      <i class="fas fa-play-circle songPlay"></i>
    `;
    songList.appendChild(songItem);
  });

  // Add click listeners on songItem
  document.querySelectorAll(".songItem").forEach(item => {
    item.addEventListener("click", (e) => {
        playSongByIndex(parseInt(item.dataset.index));
    });
  });
}


// Play a song
function playSongByIndex(index) {
  currentSongIndex = index;
  const song = songs[index];
  audio.src = song.filePath;
  audio.play();
  masterPlay.classList.remove("fa-play-circle");
  masterPlay.classList.add("fa-pause-circle");
  playingGif.style.opacity = 1;
  currentSongName.innerText = song.name;
}


// Toggle master play/pause
masterPlay.addEventListener("click", () => {
  if (songs.length === 0) return;
  // If no song set yet, start from currentSongIndex
  if (!audio.src) {
    playSongByIndex(currentSongIndex);
    return;
  }

  if (audio.paused || audio.currentTime <= 0) {
    audio.play();
    masterPlay.classList.remove("fa-play-circle");
    masterPlay.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;
  } else {
    audio.pause();
    masterPlay.classList.remove("fa-pause-circle");
    masterPlay.classList.add("fa-play-circle");
    playingGif.style.opacity = 0;
  }
});


// Update progress bar
audio.addEventListener("timeupdate", () => {
  if (!isNaN(audio.duration)) {
    const progress = (audio.currentTime / audio.duration) * 100;
    myProgressBar.value = progress;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    totalTimeDisplay.textContent = formatTime(audio.duration);
  }
});


myProgressBar.addEventListener("input", () => {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (myProgressBar.value * audio.duration) / 100;
  }
});


// Fetch songs from JioSaavn API with randomness & larger pool
async function searchSongsOnline(query) {
  try {
    const limit = 100; // bigger pool
    const res = await fetch(
      `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&pages=9&limit=${limit}`
    );
    const data = await res.json();

    if (!data.data.results || data.data.results.length === 0) {
      throw new Error("No songs found");
    }
    // Map API results
    let fetchedSongs = data.data.results.map(song => ({
      name: song.name,
      filePath: song.downloadUrl?.length
        ? song.downloadUrl[song.downloadUrl.length - 1].url // Highest quality
        : "",
      coverPath: song.image?.length
        ? song.image[song.image.length - 1].url
        : "covers/default.jpg",
    }));
    // Shuffle results to randomize
    fetchedSongs = fetchedSongs.sort(() => Math.random() - 0.5);

    // Slice first 100 songs for UI
    songs = fetchedSongs.slice(0, 100);

    renderSongs(songs);

  } catch (err) {
    console.warn("API failed, using fallback songs.", err);
    songs = localSongs;
    renderSongs(songs);
  }
}


// Search input listener
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    searchSongsOnline(query);
  } else {
    songs = localSongs;
    renderSongs(songs);
  }
});


// Previous button
document.getElementById("previous").addEventListener("click", () => {
  if (songs.length === 0) return;
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSongByIndex(currentSongIndex);
});


// Next button
document.getElementById("next").addEventListener("click", () => {
  if (songs.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % songs.length; 
  playSongByIndex(currentSongIndex);
});


audio.addEventListener("ended", () => {
  if (songs.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSongByIndex(currentSongIndex);
});

// Init app with trending songs
(function init() {
  searchSongsOnline(searchSongQuery);
})();