(function() {
    var script = document.currentScript;
    var stream = script ? script.getAttribute('data-stream') : '';
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.player-cover');
    var button = document.querySelector('.player-start');
    var ready = false;

    function prepare() {
        if (!video || !stream || ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function start() {
        if (!video) {
            return;
        }

        prepare();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    if (button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            start();
        });
    }

    if (video) {
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
    }
})();
