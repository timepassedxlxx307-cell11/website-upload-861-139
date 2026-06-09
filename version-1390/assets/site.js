function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function createElement(name, className, text) {
  var element = document.createElement(name);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function initMenu() {
  var header = document.querySelector(".site-header");
  var button = document.querySelector(".menu-toggle");
  if (!header || !button) {
    return;
  }
  button.addEventListener("click", function () {
    header.classList.toggle("menu-open");
  });
}

function initHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
  var prev = root.querySelector(".hero-prev");
  var next = root.querySelector(".hero-next");
  var index = 0;
  var timer = null;
  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === index);
    });
  }
  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }
  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  }
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }
  dots.forEach(function (dot, current) {
    dot.addEventListener("click", function () {
      show(current);
      restart();
    });
  });
  show(0);
  start();
}

function initCardFilter() {
  var input = document.querySelector("[data-card-filter]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector("[data-empty-state]");
  if (!input || !cards.length) {
    return;
  }
  function apply() {
    var keyword = normalizeText(input.value);
    var year = yearSelect ? yearSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalizeText([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags")
      ].join(" "));
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }
  input.addEventListener("input", apply);
  if (yearSelect) {
    yearSelect.addEventListener("change", apply);
  }
  if (typeSelect) {
    typeSelect.addEventListener("change", apply);
  }
  apply();
}

function makeSearchCard(item) {
  var article = createElement("article", "movie-card movie-card-medium");
  var link = createElement("a", "movie-link");
  link.href = item.url;
  var poster = createElement("div", "poster-wrap");
  var img = document.createElement("img");
  img.src = item.cover;
  img.alt = item.title;
  img.loading = "lazy";
  var shade = createElement("div", "poster-shade");
  var label = createElement("span", "corner-label", item.category);
  var meta = createElement("div", "poster-meta");
  [item.year, item.region, item.type].forEach(function (value) {
    meta.appendChild(createElement("span", "", value));
  });
  poster.appendChild(img);
  poster.appendChild(shade);
  poster.appendChild(label);
  poster.appendChild(meta);
  var info = createElement("div", "movie-info");
  info.appendChild(createElement("h3", "", item.title));
  info.appendChild(createElement("p", "", item.oneLine));
  var tags = createElement("div", "tag-row");
  item.tags.slice(0, 3).forEach(function (tag) {
    tags.appendChild(createElement("span", "", tag));
  });
  info.appendChild(tags);
  link.appendChild(poster);
  link.appendChild(info);
  article.appendChild(link);
  return article;
}

function initSearchPage() {
  var root = document.querySelector("[data-search-page]");
  if (!root || typeof MovieSearchIndex === "undefined") {
    return;
  }
  var form = root.querySelector("[data-search-form]");
  var input = root.querySelector("[data-search-input]");
  var category = root.querySelector("[data-search-category]");
  var results = root.querySelector("[data-search-results]");
  var empty = root.querySelector("[data-search-empty]");
  var params = new URLSearchParams(window.location.search);
  if (input) {
    input.value = params.get("q") || "";
  }
  if (category) {
    category.value = params.get("category") || "";
  }
  function render() {
    var keyword = normalizeText(input ? input.value : "");
    var selectedCategory = category ? category.value : "";
    results.textContent = "";
    var matched = MovieSearchIndex.filter(function (item) {
      var text = normalizeText([
        item.title,
        item.oneLine,
        item.summary,
        item.genre,
        item.tags.join(" "),
        item.year,
        item.region,
        item.type,
        item.category
      ].join(" "));
      return (!keyword || text.indexOf(keyword) !== -1) && (!selectedCategory || item.category === selectedCategory);
    }).slice(0, 180);
    matched.forEach(function (item) {
      results.appendChild(makeSearchCard(item));
    });
    if (empty) {
      empty.style.display = matched.length ? "none" : "block";
    }
  }
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = new URLSearchParams();
      if (input && input.value.trim()) {
        query.set("q", input.value.trim());
      }
      if (category && category.value) {
        query.set("category", category.value);
      }
      var url = window.location.pathname + (query.toString() ? "?" + query.toString() : "");
      window.history.replaceState(null, "", url);
      render();
    });
  }
  if (input) {
    input.addEventListener("input", render);
  }
  if (category) {
    category.addEventListener("change", render);
  }
  render();
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
  players.forEach(function (card) {
    var video = card.querySelector("video");
    var button = card.querySelector(".play-cover");
    var message = card.querySelector(".player-message");
    var payloadNode = card.querySelector(".stream-payload");
    if (!video || !button || !payloadNode) {
      return;
    }
    var payload = {};
    var hls = null;
    try {
      payload = JSON.parse(payloadNode.textContent || "{}");
    } catch (error) {
      payload = {};
    }
    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }
    function attach() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (!payload.url) {
        showMessage("视频加载失败，请稍后重试");
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = payload.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(payload.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showMessage("视频加载失败，请稍后重试");
            }
          }
        });
      } else {
        showMessage("视频加载失败，请稍后重试");
      }
    }
    function play() {
      attach();
      showMessage("");
      card.classList.add("is-playing");
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          card.classList.remove("is-playing");
          showMessage("点击播放按钮开始观看");
        });
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      card.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove("is-playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(function () {
  initMenu();
  initHero();
  initCardFilter();
  initSearchPage();
  initPlayers();
});
