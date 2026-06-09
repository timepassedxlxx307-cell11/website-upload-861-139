
function initMoviePlayer(videoSource) {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-player-button]");
  if (!video || !button || !videoSource) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSource;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = videoSource;
  }

  function playVideo() {
    attachSource();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
