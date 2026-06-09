(function () {
    var movies = window.MOVIES || [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var regionSelect = document.querySelector('[data-search-region]');
    var yearSelect = document.querySelector('[data-search-year]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function setInitialValues() {
        var query = params().get('q') || '';
        if (input) {
            input.value = query;
        }
    }

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="play-hover">立即观看</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<div class="card-meta"><a href="category/' + movie.category + '.html">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function render() {
        if (!results) {
            return;
        }
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var filtered = movies.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
            return (!keyword || text.indexOf(keyword) !== -1) &&
                (!type || movie.type.indexOf(type) !== -1) &&
                (!region || movie.region.indexOf(region) !== -1) &&
                (!year || movie.year === year);
        }).slice(0, 120);

        if (summary) {
            summary.textContent = filtered.length ? '已展示匹配度较高的影片结果。' : '没有找到匹配的影片。';
        }

        results.innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty-state">没有找到匹配的影片</div>';
    }

    setInitialValues();
    render();

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (node) {
        if (node) {
            node.addEventListener('input', render);
            node.addEventListener('change', render);
        }
    });
})();
