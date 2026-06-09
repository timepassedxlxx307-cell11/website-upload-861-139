(function () {
    const menuButton = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.hidden = !mobileNav.hidden;
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')));
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    function renderSearchResults(container, query, limit) {
        const data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];
        const keyword = query.trim().toLowerCase();

        if (!container || keyword.length < 1) {
            if (container) {
                container.hidden = true;
                container.innerHTML = '';
            }
            return;
        }

        const results = data.filter(function (item) {
            return item.text.toLowerCase().includes(keyword);
        }).slice(0, limit);

        if (!results.length) {
            container.innerHTML = '<div class="empty-result">未找到相关影片</div>';
            container.hidden = false;
            return;
        }

        container.innerHTML = results.map(function (item) {
            return '<a href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title + '"><span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span></a>';
        }).join('');
        container.hidden = false;
    }

    const topSearch = document.getElementById('topSearch');
    const searchPanel = document.getElementById('searchPanel');

    if (topSearch && searchPanel) {
        topSearch.addEventListener('input', function () {
            renderSearchResults(searchPanel, topSearch.value, 8);
        });
        document.addEventListener('click', function (event) {
            if (!searchPanel.contains(event.target) && event.target !== topSearch) {
                searchPanel.hidden = true;
            }
        });
    }

    const homeSearch = document.getElementById('homeSearch');
    const homeSearchResults = document.getElementById('homeSearchResults');

    if (homeSearch && homeSearchResults) {
        homeSearch.addEventListener('input', function () {
            renderSearchResults(homeSearchResults, homeSearch.value, 12);
        });
    }

    const filterInput = document.querySelector('.page-filter-input');
    const filterSelect = document.querySelector('.page-filter-select');
    const filterCards = Array.from(document.querySelectorAll('.filterable-grid .movie-card'));

    function applyPageFilter() {
        const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        const year = filterSelect ? filterSelect.value : '';

        filterCards.forEach(function (card) {
            const text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || ''
            ].join(' ').toLowerCase();
            const matchText = !keyword || text.includes(keyword);
            const matchYear = !year || text.includes(year);
            card.hidden = !(matchText && matchYear);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyPageFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', applyPageFilter);
    }
})();
