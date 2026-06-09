(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        slider.addEventListener('mouseenter', function () {
            clearInterval(timer);
        });
        slider.addEventListener('mouseleave', play);
        play();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
            var section = panel.closest('section') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
            var empty = section.querySelector('[data-empty-result]');
            function apply(value) {
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    var hidden = value !== '全部' && text.indexOf(value.toLowerCase()) === -1;
                    card.classList.toggle('is-filtered-out', hidden);
                    if (!hidden && !card.classList.contains('is-search-hidden')) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                    apply(button.getAttribute('data-filter') || '全部');
                });
            });
        });
    }

    function initSearch() {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input], .nav-search input[name="q"]'));
        inputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
        });
        var grid = document.querySelector('[data-search-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-result]');
        function applySearch(value) {
            var words = value.toLowerCase().split(/\s+/).filter(Boolean);
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var hidden = words.length && words.some(function (word) {
                    return text.indexOf(word) === -1;
                });
                card.classList.toggle('is-search-hidden', hidden);
                if (!hidden && !card.classList.contains('is-filtered-out')) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        applySearch(query);
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                applySearch(input.value.trim());
            });
        });
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        var button = document.querySelector('[data-play-trigger]');
        if (!video) {
            return;
        }
        var source = video.querySelector('source');
        var url = source ? source.getAttribute('src') : '';
        var attached = false;
        function attach() {
            if (attached || !url) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearch();
        initPlayer();
    });
})();
