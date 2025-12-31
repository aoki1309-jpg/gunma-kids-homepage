// main.js
// js/main.js
const API_BASE = 'https://api.kodomonotabi.net';
const TRIP_DETAIL_BASE = 'https://reservation-frontend-xxxx.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupTripsPage();
});

const setupMobileMenu = () => {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const willOpen = !menu.classList.contains('open');
    menu.classList.toggle('open', willOpen);
    btn.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
};

const setupTripsPage = () => {
  const tripsPage = document.querySelector('[data-trips-page]');
  if (!tripsPage) return;

  const tabs = Array.from(document.querySelectorAll('.trip-tab'));
  const listEl = document.getElementById('trips-list');
  const statusEl = document.getElementById('trips-status');

  if (!tabs.length || !listEl || !statusEl) return;

  const getYear = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('year') || '2026';
  };

  const getSeasonKey = (season) => `${season}_${getYear()}`;

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

      card.innerHTML = `\n        <div class=\"trip-card-header\">\n          <span class=\"trip-badge ${badgeClassMap[season] || ''}\">${seasonLabels[season] || ''}</span>\n          <p class=\"trip-date\">${dateLabel}</p>\n        </div>\n        <h2 class=\"trip-title\">${title}</h2>\n        <dl class=\"trip-meta\">\n          <div>\n            <dt>料金</dt>\n            <dd>${priceLabel}</dd>\n          </div>\n          <div>\n            <dt>最少催行人数</dt>\n            <dd>${minParticipants}</dd>\n          </div>\n          <div>\n            <dt>食事</dt>\n            <dd>${meals}</dd>\n          </div>\n        </dl>\n        <a class=\"trip-detail-link\" href=\"${detailUrl}\">詳しく見る</a>\n      `;\n      listEl.appendChild(card);
    });
  };

  const fetchTrips = async (seasonKey, season) => {
    setStatus('読み込み中...');
    listEl.innerHTML = '';

    try {
      const response = await fetch(`${API_BASE}/public/trips?season_key=${encodeURIComponent(seasonKey)}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.published || [];
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
};
