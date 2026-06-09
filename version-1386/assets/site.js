
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      if (input && form.hasAttribute("data-render-search")) {
        input.value = getQuery("q");
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var controls = Array.prototype.slice.call(root.querySelectorAll("[data-hero-control]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      controls.forEach(function (control, controlIndex) {
        control.classList.toggle("is-active", controlIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    controls.forEach(function (control) {
      control.addEventListener("click", function () {
        show(Number(control.getAttribute("data-hero-control")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function update() {
      var formData = new FormData(form);
      var keyword = String(formData.get("keyword") || "").trim().toLowerCase();
      var year = String(formData.get("year") || "");
      var type = String(formData.get("type") || "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("reset", function () {
      window.setTimeout(update, 0);
    });
    update();
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"play-chip\">▶</span>",
      "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</p>",
      "<p class=\"movie-desc\">" + escapeHtml(movie.desc) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var query = getQuery("q").trim().toLowerCase();
    var data = window.MOVIE_SEARCH_DATA;
    var matched;

    if (!query) {
      matched = data.slice(0, 48);
      if (title) {
        title.textContent = "推荐影片";
      }
    } else {
      matched = data.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.desc, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = "搜索结果";
      }
    }

    if (!matched.length) {
      results.innerHTML = "<div class=\"empty-state is-visible\">没有找到匹配影片</div>";
      return;
    }

    results.innerHTML = matched.map(renderMovieCard).join("");
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
