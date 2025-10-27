// Live Player Script

async function fetchNowPlaying() {
    const url = 'https://stream.no-soap.net/api/nowplaying/no_soap_radio';

    try {
        const response = await fetch(url);
        const data = await response.json();

        const nowPlayingElement = document.getElementById('now-playing');
        const playlistElement = document.getElementById('playlist');
        const coverArtElement = document.getElementById('cover-art');

        if (data && data.now_playing && data.now_playing.song.title) {
            nowPlayingElement.innerHTML = `NOW PLAYING:
                        <em>${data.now_playing.song.title}</em> 
                        by <strong>${data.now_playing.song.artist.toUpperCase()}</strong>
                    `;
            nowPlayingElement.style.display = 'block';

            // Display playlist name if available
            if (data.now_playing.playlist) {
                playlistElement.innerHTML = `LIVE: <strong>${data.now_playing.playlist}</strong>`;
                playlistElement.style.display = 'block';
            } else {
                playlistElement.style.display = 'none';
            }

            // Set cover art if available
            if (data.now_playing.song.art) {
                coverArtElement.src = data.now_playing.song.art;
                coverArtElement.style.display = 'block';
            } else {
                coverArtElement.style.display = 'none';
            }
        } else {
            nowPlayingElement.style.display = 'none';
            playlistElement.style.display = 'none';
            coverArtElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching now-playing data:', error);
        nowPlayingElement.style.display = 'none';
        playlistElement.style.display = 'none';
        coverArtElement.style.display = 'none';
    }
}

// Update every 30 seconds
fetchNowPlaying();
setInterval(fetchNowPlaying, 30000);

// Configuration
        const STATION_ID = 1; // Update this to your station ID
        const API_BASE = 'https://stream.no-soap.net/api/station/' + STATION_ID;

        // Format time to HH:MM (24-hour format)
        function formatTime24(date) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return hours + ':' + minutes;
        }

        // Get today's date range
        function getTodayRange() {
            const now = new Date();
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            
            return {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
                today: start.toDateString()
            };
        }

        // Render schedule
        function renderSchedule(data) {
            const container = document.getElementById('schedule');
            const range = getTodayRange();
            
            console.log('Raw API data:', data); // Debug log
            
            if (!data) {
                container.innerHTML = '<p>NO DATA RECEIVED</p>';
                return;
            }

            // Handle both array and single object responses
            let scheduleArray = Array.isArray(data) ? data : [data];
            
            console.log('Schedule array:', scheduleArray); // Debug log
            console.log('Today:', range.today); // Debug log

            // Filter programs for today only and sort by time
            const todayPrograms = scheduleArray
                .filter(item => {
                    const programDate = new Date(item.start_timestamp * 1000);
                    console.log('Program date:', programDate.toDateString(), 'Name:', item.name); // Debug log
                    return programDate.toDateString() === range.today;
                })
                .sort((a, b) => a.start_timestamp - b.start_timestamp);

            console.log('Today programs filtered:', todayPrograms.length); // Debug log

            if (todayPrograms.length === 0) {
                container.innerHTML = '<p>NO PROGRAMS SCHEDULED TODAY</p>';
                return;
            }

            let html = '';
            todayPrograms.forEach(item => {
                const startTime = new Date(item.start_timestamp * 1000);
                const timeStr = formatTime24(startTime);
                
                html += '<div class="schedule-item">';
                html += '<span class="schedule-time">' + timeStr + '</span>';
                html += '<span class="schedule-dots"></span>';
                html += '<span class="schedule-name">' + item.name + '</span>';
                html += '</div>';
            });

            container.innerHTML = html;
        }

        // Fetch schedule
        async function loadSchedule() {
            try {
                const range = getTodayRange();
                const url = `${API_BASE}/schedule?start=${range.start}&end=${range.end}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to load schedule');
                }
                
                const data = await response.json();
                renderSchedule(data);
            } catch (error) {
                console.error('Error loading schedule:', error);
                document.getElementById('schedule').innerHTML = 
                    '<p>ERROR LOADING SCHEDULE</p>';
            }
        }

        // Load schedule on page load
        loadSchedule();