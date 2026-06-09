document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('[data-player-video]');
  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-button]'));
  var muteButton = document.querySelector('[data-player-mute]');
  var fullscreenButton = document.querySelector('[data-player-fullscreen]');

  if (!video || typeof currentStream !== 'string' || !currentStream) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = currentStream;
  } else if (window.Hls && window.Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(currentStream);
    hls.attachMedia(video);
  }

  var togglePlay = function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  playButtons.forEach(function (button) {
    button.addEventListener('click', togglePlay);
  });

  video.addEventListener('click', togglePlay);

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  video.addEventListener('play', function () {
    playButtons.forEach(function (button) {
      if (button.classList.contains('player-play')) {
        button.textContent = 'Ⅱ';
      }
    });
  });

  video.addEventListener('pause', function () {
    playButtons.forEach(function (button) {
      if (button.classList.contains('player-play')) {
        button.textContent = '▶';
      }
    });
  });
});
