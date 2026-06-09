(function () {
    function startPlayer(button) {
        var card = button.closest('.player-card');
        var video = card ? card.querySelector('[data-video-element]') : null;
        var source = button.getAttribute('data-video-src');

        if (!video || !source) {
            return;
        }

        button.classList.add('is-loading');
        button.querySelector('strong').textContent = '正在加载';

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
            button.classList.remove('is-loading');
            button.classList.add('is-playing');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.__hlsInstance) {
                video.__hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            video.__hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                hls.destroy();
                button.classList.remove('is-loading');
                button.querySelector('strong').textContent = '重新播放';
            });
            return;
        }

        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video-src]')).forEach(function (button) {
        button.addEventListener('click', function () {
            startPlayer(button);
        });
    });
})();
