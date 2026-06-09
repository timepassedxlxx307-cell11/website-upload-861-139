function initVideoPlayer(streamUrl) {
    const video = document.getElementById('videoPlayer');
    const overlay = document.getElementById('playOverlay');
    let hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        if (!video.src && !hlsInstance) {
            attachStream();
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    attachStream();

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
}
