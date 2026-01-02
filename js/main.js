const API_BASE = 'https://reservation-system-qz6n.onrender.com';
const TRIP_DETAIL_BASE = 'https://reservation-frontend-ywwf.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupAboutTravelLinks();
  setupTripsPage();
});

function getYearParam(defaultYear = '2026') {
  const params = new URLSearchParams(window.location.search);
  return params.get('year') || defaultYear;
}

function setupMobileMenu() {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const willOpen = !menu.classList.contains('open');
    menu.classList.toggle('open', willOpen);
    btn.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
    menu.style.display = willOpen ? 'block' : '';
    menu.setAttribute('aria-hidden', String(!willOpen));
  });
}

function setupAboutTravelLinks() {
  const seasonLinks = Array.from(document.querySelectorAll('[data-season-link]'));
  if (!seasonLinks.length) return;

  const year = getYearParam();
  const seasons = Array.from(new Set(seasonLinks.map((link) => link.dataset.seasonLink)));

  const updateLink = (link, trip) => {
    if (trip && trip.product_key) {
      link.href = `${TRIP_DETAIL_BASE}/trip/${trip.product_key}`;
      link.textContent = '詳細を見る';
      link.classList.remove('btn-link-disabled');
      link.setAttribute('aria-disabled', 'false');
    } else {
      link.href = '#';
      link.classList.add('btn-link-disabled');
      link.setAttribute('aria-disabled', 'true');
    }
  };

  const fetchSeason = async (season) => {
    try {
      const response = await fetch(`${API_BASE}/public/trips?season_key=${encodeURIComponent(`${season}_${year}`)}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      const publishedList = data && typeof data === 'object' ? data.published : undefined;
      const list = Array.isArray(data) ? data : publishedList || [];
      return list.find((trip) => trip.product_key);
    } catch (error) {
      return null;
    }
  };

  seasons.forEach((season) => {
    fetchSeason(season).then((trip) => {
      seasonLinks
        .filter((link) => link.dataset.seasonLink === season)
        .forEach((link) => updateLink(link, trip));
    });
  });
}

function setupTripsPage() {
  const tripsPage = document.querySelector('[data-trips-page]');
  if (!tripsPage) return;

  const tabs = Array.from(document.querySelectorAll('.trip-tab'));
  const listEl = document.getElementById('trips-list');
  const statusEl = document.getElementById('trips-status');

  if (!tabs.length || !listEl || !statusEl) return;

  const getSeasonKey = (season) => `${season}_${getYearParam()}`;

  const setStatus = (message = '') => {
    statusEl.textContent = message;
  };

  const setActiveTab = (season) => {
    tabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.season === season);
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return '未定';
    const numeric = Number(price);
    if (Number.isNaN(numeric)) return price;
    return `¥${numeric.toLocaleString('ja-JP')}`;
  };

  const buildDateLabel = (trip) => {
    if (trip.date_from && trip.date_to) {
      return `${trip.date_from} 〜 ${trip.date_to}`;
    }
    const days = trip.days ? `${trip.days}日` : '';
    const nights = trip.nights ? `${trip.nights}泊` : '';
    return days || nights || '日程調整中';
  };

  const renderTrips = (list, season) => {
    listEl.innerHTML = '';

    if (!list.length) {
      setStatus('現在公開中の募集はありません。');
      return;
    }

    setStatus('');

    const seasonLabels = {
      spring: '春',
      summer: '夏',
      annual: '通年',
    };

    const badgeClassMap = {
      spring: 'trip-badge--spring',
      summer: 'trip-badge--summer',
      annual: 'trip-badge--annual',
    };

    list.forEach((trip) => {
      const card = document.createElement('article');
      card.className = 'trip-card';

      const title = trip.title || '旅の詳細';
      const dateLabel = buildDateLabel(trip);
      const priceLabel = formatPrice(trip.price_per_person);
      const minParticipants = trip.min_participants ? `${trip.min_participants}名` : '未定';
      const meals = trip.meals_summary || '未定';
      const detailUrl = trip.product_key
        ? `${TRIP_DETAIL_BASE}/trip/${trip.product_key}`
        : '#';

      card.innerHTML = `
        <div class="trip-card-header">
          <span class="trip-badge ${badgeClassMap[season] || ''}">${seasonLabels[season] || ''}</span>
          <p class="trip-date">${dateLabel}</p>
        </div>
        <h2 class="trip-title">${title}</h2>
        <dl class="trip-meta">
          <div>
            <dt>料金</dt>
            <dd>${priceLabel}</dd>
          </div>
          <div>
            <dt>最少催行人数</dt>
            <dd>${minParticipants}</dd>
          </div>
          <div>
            <dt>食事</dt>
            <dd>${meals}</dd>
          </div>
        </dl>
        <a class="trip-detail-link" href="${detailUrl}">詳しく見る</a>
      `;
      listEl.appendChild(card);
    });
  };

  const fetchTrips = async (seasonKey, season) => {
    setStatus('読み込み中...');
    listEl.innerHTML = '';

    try {
      const response = await fetch(`${API_BASE}/public/trips?season_key=${encodeURIComponent(seasonKey)}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      const publishedList = data && typeof data === 'object' ? data.published : undefined;
      const list = Array.isArray(data) ? data : publishedList || [];
      renderTrips(list, season);
    } catch (error) {
      setStatus('読み込みに失敗しました。時間をおいて再度お試しください。');
    }
  };

  const loadSeason = (season) => {
    setActiveTab(season);
    fetchTrips(getSeasonKey(season), season);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      loadSeason(tab.dataset.season);
    });
  });

  loadSeason('spring');
}
