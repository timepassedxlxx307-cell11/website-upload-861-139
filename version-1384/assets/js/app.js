(function () {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (toggle && panel && header) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            header.classList.toggle('is-open', panel.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dotsBox = hero.querySelector('[data-hero-dots]');
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            if (dotsBox) {
                Array.prototype.slice.call(dotsBox.children).forEach(function (dot, idx) {
                    dot.classList.toggle('is-active', idx === current);
                });
            }
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setHero(current + 1);
            }, 5800);
        }

        if (dotsBox) {
            slides.forEach(function (_, idx) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (idx + 1) + '屏');
                dot.addEventListener('click', function () {
                    setHero(idx);
                    restart();
                });
                dotsBox.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setHero(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setHero(current + 1);
                restart();
            });
        }

        setHero(0);
        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (filterBar) {
        var scope = filterBar.parentElement;
        var grid = scope ? scope.querySelector('[data-filter-grid]') : null;
        if (!grid) {
            return;
        }
        var keywordInput = filterBar.querySelector('[data-filter-keyword]');
        var typeSelect = filterBar.querySelector('[data-filter-type]');
        var yearSelect = filterBar.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okType = !type || (card.dataset.type || '').indexOf(type) !== -1;
                var okYear = !year || card.dataset.year === year;
                var visible = okKeyword && okType && okYear;
                card.classList.toggle('is-hidden-by-filter', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            var empty = grid.querySelector('.empty-state');
            if (!visibleCount) {
                if (!empty) {
                    empty = document.createElement('div');
                    empty.className = 'empty-state';
                    empty.textContent = '没有找到匹配的影片';
                    grid.appendChild(empty);
                }
            } else if (empty) {
                empty.remove();
            }
        }

        [keywordInput, typeSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', applyFilter);
                node.addEventListener('change', applyFilter);
            }
        });
    });
})();
