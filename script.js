const searchSongQuery = "best hindi songs"; // default search query
const searchInput = document.getElementById("searchInput");
const songList = document.getElementById("songList");
const masterPlay = document.getElementById("masterPlay");
const myProgressBar = document.getElementById("myProgressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const currentSongName = document.getElementById("currentSongName");
const playingGif = document.getElementById("playingGif");
const loadingOverlay = document.getElementById("loadingOverlay");

// New UI elements
const volumeSlider = document.getElementById("volumeSlider");
const volumeBtn = document.getElementById("volumeBtn");
const viewToggleBtns = document.querySelectorAll(".view-btn");
const songItemContainer = document.getElementById("songList");

let audio = new Audio();
let currentSongIndex = 0;
let songs = []; // dynamic list
let isShuffled = false;
let isRepeating = false;
let isMuted = false;
let previousVolume = 1;

// Local fallback songs
const localSongs = [
    { name: "Legions - Mortals", artist: "Mortals", filePath: "songs/1.mp3", coverPath: "covers/1.jpg" },
    { name: "Trap Cartel - Huma-Huma", artist: "Trap Cartel", filePath: "songs/2.mp3", coverPath: "covers/2.jpg" },
    { name: "They MAD - Alan Walker", artist: "Alan Walker", filePath: "songs/3.mp3", coverPath: "covers/3.jpg" },
    { name: "Rich THE Kid - Alan Walker", artist: "Alan Walker", filePath: "songs/4.mp3", coverPath: "covers/4.jpg" },
    { name: "Alone - Marshmello", artist: "Marshmello", filePath: "songs/5.mp3", coverPath: "covers/5.jpg" },
    { name: "Safety Dance - Marshmello", artist: "Marshmello", filePath: "songs/6.mp3", coverPath: "covers/6.jpg" },
    { name: "Back It Up - OneRepublic", artist: "OneRepublic", filePath: "songs/7.mp3", coverPath: "covers/7.jpg" },
    { name: "BeAware - OneRepublic", artist: "OneRepublic", filePath: "songs/8.mp3", coverPath: "covers/8.jpg" },
    { name: "Beast - OneRepublic", artist: "OneRepublic", filePath: "songs/9.mp3", coverPath: "covers/9.jpg" },
    { name: "Tryhard - OneRepublic", artist: "OneRepublic", filePath: "songs/10.mp3", coverPath: "covers/10.jpg" },
];

// Utility Functions
function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function showLoading() {
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    loadingOverlay.classList.remove('show');
}

function showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--border-color);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Reset Play Button to Default Play Icon Into Every songItem
function resetSongItemIcons() {
    document.querySelectorAll(".songPlay").forEach(icon => {
        icon.classList.remove("fa-pause-circle");
        icon.classList.add("fa-play-circle");
    });
}

// Enhanced song rendering with improved UI
function renderSongs(songArray) {
    if (songArray.length === 0) {
        songList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3 style="opacity: 0.7; margin-bottom: 0.5rem;">No songs found</h3>
                <p style="opacity: 0.5;">Try searching for something else</p>
            </div>
        `;
        return;
    }

    songList.innerHTML = "";
    songArray.forEach((song, index) => {
        const displayName = song.name.length > 35 ? song.name.substring(0, 35) + "..." : song.name;
        const songItem = document.createElement("div");
        songItem.className = "songItem fade-in";
        songItem.dataset.index = index;
        songItem.style.animationDelay = `${index * 0.1}s`;
        
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
            <div class="song-info">
                <div class="song-name">${displayName}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <i class="fas fa-play-circle songPlay" data-index="${index}"></i>
        `;
        songList.appendChild(songItem);
    });

    // Enhanced click handlers
    document.querySelectorAll(".songItem").forEach(item => {
        item.addEventListener("click", (e) => {
            if (e.target.closest('.songPlay')) return; // Don't trigger when clicking play button
            playSongByIndex(parseInt(item.dataset.index));
        });
    });

    // Play button handlers
    document.querySelectorAll(".songPlay").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            playSongByIndex(parseInt(btn.dataset.index));
        });
    });

    hideLoading();
}

// Enhanced play function with better visual feedback
function playSongByIndex(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    audio.src = song.filePath;
    
    // Update UI immediately
    resetSongItemIcons();
    updateCurrentSongUI(song);
    
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        showNotification('Error playing this song', 'error');
    });

    // Update play icon for the current song
    const activeIcon = document.querySelector(`.songPlay[data-index="${index}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
    }

    // Highlight current song
    document.querySelectorAll('.songItem').forEach(item => {
        item.classList.remove('active');
    });
    
    const currentSongItem = document.querySelector(`.songItem[data-index="${index}"]`);
    if (currentSongItem) {
        currentSongItem.classList.add('active');
    }

    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-play-circle");
    masterPlayIcon.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;
}

function updateCurrentSongUI(song) {
    currentSongName.innerText = song.name;
    
    // Show song artist when song is playing
    const currentArtist = document.getElementById("currentArtist");
    const likeBtn = document.getElementById("likeSong");
    if (currentArtist) {
        currentArtist.style.display = "block";
    }
    if (likeBtn) {
        likeBtn.style.display = "block";
    }
    
    const songArtwork = document.querySelector('.song-artwork img');
    if (songArtwork) {
        songArtwork.src = song.coverPath;
        songArtwork.onerror = () => {
            songArtwork.src = 'https://via.placeholder.com/50x50/6366f1/ffffff?text=🎵';
        };
    }
}

// Enhanced master play/pause with better state management
masterPlay.addEventListener("click", () => {
    if (songs.length === 0) {
        showNotification('No songs available', 'warning');
        return;
    }
    
    if (!audio.src) {
        playSongByIndex(currentSongIndex);
        return;
    }

    const masterPlayIcon = masterPlay.querySelector('i');
    
    if (audio.paused || audio.currentTime <= 0) {
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
            showNotification('Error playing audio', 'error');
        });
    } else {
        audio.pause();
    }
});

// Enhanced audio event listeners
audio.addEventListener("pause", () => {
    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-pause-circle");
    masterPlayIcon.classList.add("fa-play-circle");
    playingGif.style.opacity = 0;

    const activeIcon = document.querySelector(`.songPlay[data-index="${currentSongIndex}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-pause-circle");
        activeIcon.classList.add("fa-play-circle");
    }
});

audio.addEventListener("play", () => {
    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-play-circle");
    masterPlayIcon.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;

    resetSongItemIcons();
    const activeIcon = document.querySelector(`.songPlay[data-index="${currentSongIndex}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
    }
});

// Enhanced progress bar with smooth updates
audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        myProgressBar.value = progress;

        // Update gradient background
        myProgressBar.style.background = `linear-gradient(
            to right,
            var(--primary-color) 0%,
            var(--primary-color) ${progress}%,
            transparent ${progress}%,
            transparent 100%
        )`;

        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        totalTimeDisplay.textContent = formatTime(audio.duration);
    }
});


myProgressBar.addEventListener("input", () => {
    if (!isNaN(audio.duration)) {
        audio.currentTime = (myProgressBar.value * audio.duration) / 100;
    }
});

// Volume control
volumeSlider.addEventListener("input", (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    updateVolumeIcon(volume);
});

volumeBtn.addEventListener("click", () => {
    if (isMuted) {
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        isMuted = false;
    } else {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        isMuted = true;
    }
    updateVolumeIcon(audio.volume);
});

function updateVolumeIcon(volume) {
    const volumeIcon = volumeBtn.querySelector('i');
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// View toggle functionality
viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Update button states
        viewToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update container class
        songItemContainer.className = `songItemContainer ${view}-view`;
        
        // Re-render songs with new layout
        renderSongs(songs);
    });
});

// Shuffle functionality
document.getElementById("shuffle").addEventListener("click", (e) => {
    isShuffled = !isShuffled;
    e.target.classList.toggle('active', isShuffled);
    
    if (isShuffled) {
        showNotification('Shuffle enabled', 'info');
    } else {
        showNotification('Shuffle disabled', 'info');
    }
});

// Repeat functionality
document.getElementById("repeat").addEventListener("click", (e) => {
    isRepeating = !isRepeating;
    e.target.classList.toggle('active', isRepeating);
    
    if (isRepeating) {
        showNotification('Repeat enabled', 'info');
    } else {
        showNotification('Repeat disabled', 'info');
    }
});

// Enhanced search with debouncing
let searchTimeout;
searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length === 0) {
        songs = localSongs;
        renderSongs(songs);
        return;
    }
    
    if (query.length > 2) {
        showLoading();
        searchTimeout = setTimeout(() => {
            searchSongsOnline(query);
        }, 500);
    }
});

// Enhanced API search with multiple pages for more songs
async function searchSongsOnline(query) {
    try {
        showLoading();
        let allSongs = [];
        const maxPages = 10; // Fetch 10 pages for more variety
        const limit = 40; // API limit per page
        
        // First, get the first page to check total available
        const firstRes = await fetch(
            `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`
        );
        
        if (!firstRes.ok) {
            throw new Error(`HTTP error! status: ${firstRes.status}`);
        }
        
        const firstData = await firstRes.json();
        
        if (!firstData.data.results || firstData.data.results.length === 0) {
            throw new Error("No songs found");
        }
        
        // Add first page results
        let firstPageSongs = firstData.data.results.map(song => ({
            name: song.name || 'Unknown Song',
            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
            filePath: song.downloadUrl?.length ?
                song.downloadUrl[song.downloadUrl.length - 1].url :
                "",
            coverPath: song.image?.length ?
                song.image[song.image.length - 1].url :
                "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
        }));
        
        // Filter valid songs from first page
        firstPageSongs = firstPageSongs.filter(song => song.filePath);
        allSongs = allSongs.concat(firstPageSongs);
        
        // Calculate how many more pages we can fetch
        const totalSongs = firstData.data.total || 1800;
        const totalPages = Math.min(Math.ceil(totalSongs / limit), maxPages);
        
        // Create promises for remaining pages (2 to totalPages)
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
            const promise = fetch(
                `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
            ).then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    if (data.data.results && data.data.results.length > 0) {
                        return data.data.results.map(song => ({
                            name: song.name || 'Unknown Song',
                            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
                            filePath: song.downloadUrl?.length ?
                                song.downloadUrl[song.downloadUrl.length - 1].url :
                                "",
                            coverPath: song.image?.length ?
                                song.image[song.image.length - 1].url :
                                "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
                        })).filter(song => song.filePath);
                    }
                }
                return [];
            }).catch(() => []);
            
            pagePromises.push(promise);
        }
        
        // Wait for all additional pages
        const additionalResults = await Promise.all(pagePromises);
        
        // Combine all results
        additionalResults.forEach(pageResults => {
            if (pageResults && pageResults.length > 0) {
                allSongs = allSongs.concat(pageResults);
            }
        });
        
        if (allSongs.length === 0) {
            throw new Error("No playable songs found");
        }
        
        // Remove duplicates based on song name AND artist
        const uniqueSongs = allSongs.filter((song, index, self) => 
            index === self.findIndex(s => 
                s.name.toLowerCase() === song.name.toLowerCase() && 
                s.artist.toLowerCase() === song.artist.toLowerCase()
            )
        );
        
        // Shuffle results for variety
        // const shuffledSongs = uniqueSongs.sort(() => Math.random() - 0.5);
        const shuffledSongs = allSongs.sort(() => Math.random() - 0.5);
        
        
        // Limit to 300 songs max for better performance
        songs = shuffledSongs.slice(0, 300);
        
        renderSongs(songs);
        showNotification(`Loaded ${songs.length} unique songs from ${totalPages} pages!`, 'success');

    } catch (err) {
        console.warn("API failed, using fallback songs.", err);
        songs = localSongs;
        renderSongs(songs);
        showNotification('Using offline songs', 'warning');
        hideLoading();
    }
}

// Enhanced navigation with shuffle support
function getNextIndex() {
    if (isShuffled) {
        return Math.floor(Math.random() * songs.length);
    }
    return (currentSongIndex + 1) % songs.length;
}

function getPreviousIndex() {
    if (isShuffled) {
        return Math.floor(Math.random() * songs.length);
    }
    return (currentSongIndex - 1 + songs.length) % songs.length;
}

// Previous button
document.getElementById("previous").addEventListener("click", () => {
    if (songs.length === 0) return;
    currentSongIndex = getPreviousIndex();
    playSongByIndex(currentSongIndex);
});

// Next button
document.getElementById("next").addEventListener("click", () => {
    if (songs.length === 0) return;
    currentSongIndex = getNextIndex();
    playSongByIndex(currentSongIndex);
});

// Enhanced auto-play with repeat functionality
audio.addEventListener("ended", () => {
    if (songs.length === 0) return;
    
    if (isRepeating) {
        playSongByIndex(currentSongIndex);
    } else {
        currentSongIndex = getNextIndex();
        playSongByIndex(currentSongIndex);
    }
});

// Enhanced keyboard controls
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
    }

    switch(e.code) {
        case "Space":
            e.preventDefault();
            if (!audio.src || audio.src.trim() === "") {
                if (songs.length > 0) {
                    playSongByIndex(currentSongIndex);
                }
            } else if (audio.paused || audio.currentTime <= 0) {
                audio.play();
            } else {
                audio.pause();
            }
            break;

        case "ArrowUp":
            e.preventDefault();
            audio.volume = Math.min(1, audio.volume + 0.05);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon(audio.volume);
            break;

        case "ArrowDown":
            e.preventDefault();
            audio.volume = Math.max(0, audio.volume - 0.05);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon(audio.volume);
            break;

        case "ArrowRight":
            e.preventDefault();
            if (songs.length === 0) return;
            currentSongIndex = getNextIndex();
            playSongByIndex(currentSongIndex);
            break;

        case "ArrowLeft":
            e.preventDefault();
            if (songs.length === 0) return;
            currentSongIndex = getPreviousIndex();
            playSongByIndex(currentSongIndex);
            break;

        case "KeyS":
            e.preventDefault();
            document.getElementById("shuffle").click();
            break;

        case "KeyR":
            e.preventDefault();
            document.getElementById("repeat").click();
            break;
    }
});

// Enhanced download functionality
document.getElementById("downloadSong").addEventListener("click", () => {
    if (!songs[currentSongIndex] || !songs[currentSongIndex].filePath) {
        showNotification('No song selected for download', 'warning');
        return;
    }

    const fileUrl = songs[currentSongIndex].filePath;
    const fileName = songs[currentSongIndex].name.replace(/[^a-z0-9]/gi, "_") + ".mp3";

    // Show status section
    const statusBox = document.getElementById("downloadStatus");
    const statusText = document.getElementById("statusText");
    const progressBar = document.getElementById("downloadProgress");
    const progressText = document.getElementById("progressText");
    
    statusBox.style.display = "block";
    statusText.textContent = "Starting download...";
    progressBar.value = 0;
    progressText.textContent = "0%";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", fileUrl, true);
    xhr.responseType = "blob";

    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            progressBar.value = percent;
            progressText.textContent = `${percent.toFixed(1)}%`;
            statusText.textContent = "Downloading...";
            
            // Update download size
            const downloadSize = document.getElementById("downloadSize");
            if (downloadSize) {
                const totalMB = (event.total / (1024 * 1024)).toFixed(1);
                downloadSize.textContent = `${totalMB} MB`;
            }
        } else {
            statusText.textContent = "Downloading...";
            progressText.textContent = "...";
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            statusText.textContent = "Download completed!";
            progressBar.value = 100;
            progressText.textContent = "100%";

            const blob = xhr.response;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Download completed successfully!', 'success');

            setTimeout(() => {
                statusBox.style.display = "none";
            }, 2000);

        } else {
            statusText.textContent = "Download failed!";
            progressText.textContent = "Error";
            showNotification('Download failed. Please try again.', 'error');
        }
    };

    xhr.onerror = function () {
        statusText.textContent = "Download failed!";
        progressText.textContent = "Error";
        showNotification('Network error during download', 'error');
    };

    xhr.send();
});

// Initialize app
(function init() {
    showLoading();
    searchSongsOnline(searchSongQuery);
    
    // Set initial volume
    audio.volume = 1;
    volumeSlider.value = 100;
    
    // Add some CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            grid-column: 1 / -1;
        }
        .songItem.active {
            background: var(--bg-card-hover) !important;
            border-color: var(--primary-color) !important;
            box-shadow: var(--shadow-glow) !important;
        }
    `;
    document.head.appendChild(style);
})();