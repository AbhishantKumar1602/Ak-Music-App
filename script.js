const searchSongQuery = "Best songs"; // default search query
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
    { name: "Legions - Mortals", filePath: "songs/1.mp3", coverPath: "covers/1.jpg" },
    { name: "Trap Cartel - Huma-Huma", filePath: "songs/2.mp3", coverPath: "covers/2.jpg" },
    { name: "They MAD - Alan Walker", filePath: "songs/3.mp3", coverPath: "covers/3.jpg" },
    { name: "Rich THE Kid - Alan Walker", filePath: "songs/4.mp3", coverPath: "covers/4.jpg" },
    { name: "Alone - Marshmello", filePath: "songs/5.mp3", coverPath: "covers/5.jpg" },
    { name: "Safety Dance - Marshmello", filePath: "songs/6.mp3", coverPath: "covers/6.jpg" },
    { name: "Back It Up - OneRepublic", filePath: "songs/7.mp3", coverPath: "covers/7.jpg" },
    { name: "BeAware - OneRepublic", filePath: "songs/8.mp3", coverPath: "covers/8.jpg" },
    { name: "Beast - OneRepublic", filePath: "songs/9.mp3", coverPath: "covers/9.jpg" },
    { name: "Tryhard - OneRepublic", filePath: "songs/10.mp3", coverPath: "covers/10.jpg" },
]; 



// Format time in mm:ss
function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}



// Reset Play Button to Default Play Icon Into Every songItem
function resetSongItemIcons() {
    document.querySelectorAll(".songPlay").forEach(icon => {
        icon.classList.remove("fa-pause-circle");
        icon.classList.add("fa-play-circle");
    });
}



// Load songs to Home Page
function renderSongs(songArray) {
    songList.innerHTML = "";
    songArray.forEach((song, index) => {
        const displayName = song.name.length > 30 ? song.name.substring(0, 30) + "..." : song.name;
        const songItem = document.createElement("div");
        songItem.className = "songItem";
        songItem.dataset.index = index;
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="cover" />
            <span>${displayName}</span>
            <i class="fas fa-play-circle songPlay" data-index="${index}"></i>
        `;
        songList.appendChild(songItem);
    });

    // Play button in song list
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

    resetSongItemIcons();

    // Update play icon for the current song
    const activeIcon = document.querySelector(`.songPlay[data-index="${index}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
    }

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



audio.addEventListener("pause", () => {
    masterPlay.classList.remove("fa-pause-circle");
    masterPlay.classList.add("fa-play-circle");
    playingGif.style.opacity = 0;

    // Reset current song's icon to play
    const activeIcon = document.querySelector(`.songPlay[data-index="${currentSongIndex}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-pause-circle");
        activeIcon.classList.add("fa-play-circle");
    }
});

audio.addEventListener("play", () => {
    masterPlay.classList.remove("fa-play-circle");
    masterPlay.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;

    // Highlight current song's icon as pause
    resetSongItemIcons();
    const activeIcon = document.querySelector(`.songPlay[data-index="${currentSongIndex}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
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



// Fetch songs from JioSaavn API
async function searchSongsOnline(query) {
    try {
        const limit = 100;  // But API Only Return 40 Songs in Output
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
            filePath: song.downloadUrl?.length ?
                song.downloadUrl[song.downloadUrl.length - 1].url // Highest quality
                :
                "",
            coverPath: song.image?.length ?
                song.image[song.image.length - 1].url :
                "covers/default.jpg",
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

// auto play next song when current ends
audio.addEventListener("ended", () => {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSongByIndex(currentSongIndex);
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
    // Ignore New keyboard shortcuts when Song searching
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
    }

    if (e.code === "Space") {
        e.preventDefault(); // Like scrolling
        if (!audio.src || audio.src.trim() === "") { // No song is playing or loaded
            if (songs.length > 0) { // Means if song Exist Then Play first song by 0 index
                playSongByIndex(currentSongIndex);
            }
        } else if (audio.paused || audio.currentTime <= 0) {
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
    }

    // Arrow Up → Increase Volume
    if (e.code === "ArrowUp") {
        e.preventDefault();
        audio.volume = Math.min(1, audio.volume + 0.05); // Increase by 5%
    }

    // Arrow Down → Decrease Volume
    if (e.code === "ArrowDown") {
        e.preventDefault();
        audio.volume = Math.max(0, audio.volume - 0.05); // Decrease by 5%
    }

    // Arrow Right → Next song
    if (e.code === "ArrowRight") {
        e.preventDefault();
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSongByIndex(currentSongIndex);
    }

    // Arrow Left → Previous song
    if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSongByIndex(currentSongIndex);
    }
});



// First Initialization For Load Songs
(function init() {
    searchSongsOnline(searchSongQuery);
})();
