const searchSongQuery = "best hindi songs";
const searchInput = document.getElementById("searchInput");
const songList = document.getElementById("songList");
const masterPlay = document.getElementById("masterPlay");
const myProgressBar = document.getElementById("myProgressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const currentSongName = document.getElementById("currentSongName");
const playingGif = document.getElementById("playingGif");
const loadingOverlay = document.getElementById("loadingOverlay");
const likeBtn = document.getElementById("likeSong");
const volumeSlider = document.getElementById("volumeSlider");
const volumeBtn = document.getElementById("volumeBtn");
const viewToggleBtns = document.querySelectorAll(".view-btn");
const songItemContainer = document.getElementById("songList");


let audio = new Audio();
let currentSongIndex = 0;
let songs = []; // dynamic list
let lastSearchedSongs = []; // To store the result of the last search
let isShuffled = false;
let isRepeating = false;
let isMuted = false;
let isFavoritesViewActive = false;
let previousVolume = 1;

// Local songs
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
        const songNameHTML = song.name.length > 25 ? `<marquee direction="left" scrollamount="3">${song.name}</marquee>` : song.name;
        const songItem = document.createElement("div");
        songItem.className = "songItem fade-in";
        songItem.dataset.index = index;
        songItem.style.animationDelay = `${index * 0.1}s`;
        
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
            <div class="song-info">
                <div class="song-name">${songNameHTML}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <i class="fas fa-play-circle songPlay" data-index="${index}"></i>
        `;
        songList.appendChild(songItem);
    });

    addSongItemClickHandlers();

    hideLoading();
}

function addSongItemClickHandlers() {
    document.querySelectorAll(".songItem").forEach(item => {
        item.addEventListener("click", (e) => {
            if (e.target.closest('.songPlay')) return; // Don't trigger when clicking play button
            playSongByIndex(parseInt(item.dataset.index));
        });
    });

    document.querySelectorAll(".songPlay").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            playSongByIndex(parseInt(btn.dataset.index));
        });
    });
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
    // likeBtn = document.getElementById("likeSong");
    if (currentArtist) {
        currentArtist.style.display = "block";
    }

    // Update like button status for the current song
    if (likeBtn) {
        const icon = likeBtn.querySelector('i');
        likeBtn.classList.toggle('liked', !!song.isLiked);
        icon.classList.toggle('far', !song.isLiked);
        icon.classList.toggle('fas', !!song.isLiked);
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

/**
 * Saves the filePaths of liked songs to localStorage.
 */
function saveLikedSongs() {
    const likedSongPaths = songs
        .filter(song => song.isLiked)
        .map(song => song.filePath);
    localStorage.setItem('likedSongs', JSON.stringify(likedSongPaths));
}

/**
 * Loads the set of liked song filePaths from localStorage.
 * @returns {Set<string>} A set of filePaths for liked songs.
 */
function loadLikedSongs() {
    const likedSongPaths = JSON.parse(localStorage.getItem('likedSongs')) || [];
    return new Set(likedSongPaths);
}

likeBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    const song = songs[currentSongIndex];
    song.isLiked = !song.isLiked; // Toggle state
    updateCurrentSongUI(song); // Update the player UI
    saveLikedSongs(); // Persist the change
    showNotification(song.isLiked ? 'Added to favorites' : 'Removed from favorites', song.isLiked ? 'success' : 'info');

    // If we are in favorites view, refresh the list to show the change (add or remove)
    if (isFavoritesViewActive) {
        // Use a small delay to allow the user to see the heart icon change before the item disappears/appears
        setTimeout(() => {
            renderFavoriteSongs();
        }, 300);
    }
});



/**
 * Filters and displays only the songs marked as 'liked'.
 * To use this, you would add a button to your HTML, for example:
 * <button id="showFavoritesBtn"><i class="fas fa-heart"></i> Favorites</button>
 * Then you can uncomment and use the event listener below.
 */
function renderFavoriteSongs() {
    const favoriteSongsExist = songs.some(song => song.isLiked);

    if (!favoriteSongsExist) {
        songList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3 style="opacity: 0.7; margin-bottom: 0.5rem;">No favorite songs yet</h3>
                <p style="opacity: 0.5;">Click the heart icon on a song to add it here.</p>
            </div>
        `;
        return;
    }

    songList.innerHTML = ""; // Clear the current list
    let animationIndex = 0; // Separate index for animation delay

    // Iterate over the original 'songs' array to preserve the index
    songs.forEach((song, index) => {
        if (song.isLiked) {
            const displayName = song.name.length > 35 ? song.name.substring(0, 35) + "..." : song.name;
            const songItem = document.createElement("div");
            songItem.className = "songItem fade-in";
            songItem.dataset.index = index; // Use the original index
            songItem.style.animationDelay = `${animationIndex * 0.1}s`;

            songItem.innerHTML = `
                <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
                <div class="song-info">
                    <div class="song-name">${displayName}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <i class="fas fa-play-circle songPlay" data-index="${index}"></i>
            `;
            songList.appendChild(songItem);
            animationIndex++;
        }
    });

    // Re-add click handlers for the newly created items
    addSongItemClickHandlers();

    // If a song is currently playing and it's a favorite, update its UI
    if (!audio.paused) {
        const activeIcon = document.querySelector(`.songPlay[data-index="${currentSongIndex}"]`);
        if (activeIcon) {
            activeIcon.classList.remove("fa-play-circle");
            activeIcon.classList.add("fa-pause-circle");
        }
        const currentSongItem = document.querySelector(`.songItem[data-index="${currentSongIndex}"]`);
        if (currentSongItem) {
            currentSongItem.classList.add('active');
        }
    }
}

document.getElementById("showFavoritesBtn")?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const icon = btn.querySelector('i');
    isFavoritesViewActive = !isFavoritesViewActive; // Toggle state

    if (isFavoritesViewActive) {
        // Entering favorites view
        renderFavoriteSongs();
        showNotification("Showing favorite songs", 'info');
        btn.classList.add('active');
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        // Exiting favorites view, restore last list
        renderSongs(lastSearchedSongs);
        showNotification("Showing all songs", 'info');
        btn.classList.remove('active');
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
});

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
        // Revert to the last full list of songs
        searchSongsOnline("best hindi songs")
        renderSongs(songs);

        // Also reset the favorites button state if it was active
        if (isFavoritesViewActive) {
            isFavoritesViewActive = false;
            const favBtn = document.getElementById("showFavoritesBtn");
            if (favBtn) {
                favBtn.classList.remove('active');
                const icon = favBtn.querySelector('i');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
        return;
    }
    
    if (query.length > 2) {
        searchTimeout = setTimeout(() => {
            showLoading();
            searchSongsOnline(query);
        }, 2000);
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
        
        // Apply liked status from localStorage
        const likedSongsSet = loadLikedSongs();
        allSongs.forEach(song => {
            if (likedSongsSet.has(song.filePath)) {
                song.isLiked = true;
            }
        });

        if (allSongs.length === 0) {
            throw new Error("No playable songs found");
        }
        
        const shuffledSongs = allSongs.sort(() => Math.random() - 0.5);
        
        
        // Limit to 300 songs max for better performance
        songs = shuffledSongs.slice(0, 300);
        lastSearchedSongs = [...songs]; // Store a copy of the search results
        
        renderSongs(songs);

        // Reset favorites view if a new search is successful
        isFavoritesViewActive = false;
        const favBtn = document.getElementById("showFavoritesBtn");
        if (favBtn) {
            favBtn.classList.remove('active');
            const icon = favBtn.querySelector('i');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }

    } catch (err) {
        console.warn("API failed, using fallback songs.", err);
        songs = localSongs;
        lastSearchedSongs = [...localSongs];
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
    // Start with local songs to provide an immediate list while waiting for the API.

    // Load liked songs from storage and apply to local fallback list
    const likedSongsSet = loadLikedSongs();
    localSongs.forEach(song => {
        if (likedSongsSet.has(song.filePath)) {
            song.isLiked = true;
        }
    });

    songs = localSongs;
    lastSearchedSongs = [...localSongs];
    renderSongs(songs);

    // Then, fetch the initial list of songs from the API
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

        /* --- Loading Overlay Fix --- */
        #loadingOverlay {
            position: fixed;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(15, 15, 35, 0.9);
            backdrop-filter: blur(10px);
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1000 !important;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        #loadingOverlay.show {
            opacity: 1;
            visibility: visible;
        }
    `;
    document.head.appendChild(style);
})();