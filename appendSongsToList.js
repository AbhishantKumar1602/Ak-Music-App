// Appends new songs to the existing song list in the UI, preserving current items
window.appendSongsToList = function appendSongsToList(newSongs) {
    const songList = document.getElementById("songList") || document.getElementById("genreSongList");
    if (!songList) return;
    const startIndex = songList.children.length;
    newSongs.forEach((song, i) => {
        const index = startIndex + i;
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
}

