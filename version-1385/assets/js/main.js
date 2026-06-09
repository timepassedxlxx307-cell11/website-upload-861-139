(function() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartHero() {
        if (timer) {
            clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = setInterval(function() {
                setHero(current + 1);
            }, 6200);
        }
    }

    if (prev) {
        prev.addEventListener('click', function() {
            setHero(current - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            setHero(current + 1);
            restartHero();
        });
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            setHero(index);
            restartHero();
        });
    });

    restartHero();

    var filterInput = document.querySelector('.page-filter-input');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.page-filter-select'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .list-card'));
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);

    if (filterInput) {
        var query = params.get('q') || '';
        filterInput.value = query;
    }

    selects.forEach(function(select) {
        var value = params.get(select.name || select.getAttribute('data-filter')) || '';
        if (value) {
            select.value = value;
        }
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var keyword = filterInput ? normalize(filterInput.value) : '';
        var visible = 0;

        cards.forEach(function(card) {
            var matched = true;
            var search = normalize(card.getAttribute('data-search'));

            if (keyword && search.indexOf(keyword) === -1) {
                matched = false;
            }

            selects.forEach(function(select) {
                var key = select.getAttribute('data-filter');
                var value = normalize(select.value);
                var cardValue = normalize(card.getAttribute('data-' + key));

                if (value && cardValue !== value) {
                    matched = false;
                }
            });

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (filterInput || selects.length) {
        if (filterInput) {
            filterInput.addEventListener('input', applyFilters);
        }

        selects.forEach(function(select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }
})();
