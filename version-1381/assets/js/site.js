document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  if (filterInput) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      items.forEach(function (item) {
        var source = (item.getAttribute('data-title') || '').toLowerCase();
        item.style.display = !keyword || source.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && typeof SEARCH_INDEX !== 'undefined') {
    var searchInput = document.querySelector('[data-search-input]');
    var status = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }

    var escapeHtml = function (value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    var renderCard = function (movie) {
      return '<article class="movie-card group">' +
        '<a class="card-link" href="' + escapeHtml(movie.url) + '">' +
        '<span class="thumb">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
        '<span class="play-badge">▶</span>' +
        '</span>' +
        '<span class="card-body">' +
        '<strong class="card-title">' + escapeHtml(movie.title) + '</strong>' +
        '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>' +
        '<span class="card-footer"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.views) + '</span></span>' +
        '</span>' +
        '</a>' +
        '</article>';
    };

    if (!query) {
      searchResults.innerHTML = SEARCH_INDEX.slice(0, 12).map(renderCard).join('');
    } else {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var matches = SEARCH_INDEX.filter(function (movie) {
        var source = [
          movie.title,
          movie.category,
          movie.genre,
          movie.region,
          movie.type,
          movie.oneLine,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return terms.every(function (term) {
          return source.indexOf(term) !== -1;
        });
      });
      searchResults.innerHTML = matches.map(renderCard).join('');
      if (status) {
        status.textContent = matches.length ? '为你找到相关影片' : '未找到相关影片';
      }
    }
  }
});
