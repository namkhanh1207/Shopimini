const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PLACEHOLDER_IMG =
  'https://placehold.co/440x330/2a4d42/f0e6d2/png?text=ShopiMini&font=montserrat';

const filterState = {
  game: '',
  rarity: 'All',
  attribute: 'All',
  search: '',
};

let searchDebounce;
window.shopProductCache = {};

function rarityClass(rarity) {
  const r = (rarity || '').toLowerCase();
  if (r === 'legendary') return 'rarity-legendary';
  if (r === 'epic') return 'rarity-epic';
  if (r === 'rare') return 'rarity-rare';
  return 'rarity-common';
}

function rarityLetter(rarity) {
  const map = { Legendary: 'L', Epic: 'E', Rare: 'R', Common: 'C' };
  return map[rarity] || (rarity && rarity.charAt(0).toUpperCase()) || 'C';
}

function gameLabel(key) {
  const labels = {
    lienquan: 'LQ',
    lienminh: 'LMHT',
    gunny: 'Gunny',
    soulknight: 'SK',
    pubg: 'PUBG',
    dragonmania: 'Rồng',
  };
  return labels[key] || key || '—';
}

function formatGamePrice(p) {
  if (p.currency_type === 'Gem' && p.game_price != null) {
    return `${Number(p.game_price).toLocaleString('vi-VN')} ngọc`;
  }
  if (p.currency_type === 'Gold' && p.game_price != null) {
    return `${Number(p.game_price).toLocaleString('vi-VN')} vàng`;
  }
  return '';
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  if (document.getElementById('product-list')) {
    setupShopNav();
    setupToolbarFilters();
    setupGridScroll();
    fetchProducts();
  }
});

function buildProductUrl() {
  const q = new URLSearchParams();
  if (filterState.game) q.set('game', filterState.game);
  if (filterState.rarity && filterState.rarity !== 'All') q.set('rarity', filterState.rarity);
  if (filterState.attribute && filterState.attribute !== 'All') q.set('attribute', filterState.attribute);
  const qs = q.toString();
  return qs ? `/api/products?${qs}` : '/api/products';
}

async function fetchProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
    const res = await fetch(buildProductUrl());
    const data = await res.json();
    let list = data.products || [];
    if (filterState.search.trim()) {
      const s = filterState.search.trim().toLowerCase();
      list = list.filter((p) => {
        const inName = p.name && p.name.toLowerCase().includes(s);
        const inDesc = p.description && p.description.toLowerCase().includes(s);
        const ex = p.extra;
        const inExtra =
          ex &&
          JSON.stringify(ex)
            .toLowerCase()
            .includes(s);
        return inName || inDesc || inExtra;
      });
    }
    renderProducts(list);
  } catch (err) {
    console.error(err);
    productList.innerHTML =
      '<div class="shop-empty shop-empty-wide">Không tải được danh sách. Thử lại sau.</div>';
  }
}

const elementIcon = {
  "Vũ khí": '🗡️', "Vật lý": '⚒️', "Tốc đánh": '⚡', "Phép thuật": '🔮',
  "Hỗ trợ": '💚', "Phòng thủ": '🛡️', "Kháng phép": '🧿', "Hút máu": '🩸',
  "Thiêu đốt": '🔥', "Tốc chạy": '👟', "Phản sát thương": '✨', "Mana": '💧',
  "Máu": '❤️', "Trợ thủ": '🕊️', "Đất": '⛰️', "Giải khống": '🔓',
  "Lá chắn": '💠', "Hồi phục": '🍎', "Tầm nhìn": '👁️',
  "Weapon": '🗡️', "Skin": '👕', "Dragon": '🐉', "Material": '📦',
  "Magic": '🔮', "Fire": '🔥', "Ice": '❄️', "Lifesteal": '🩸',
  "Fast": '⚡', "Ranged": '🎯', "Defense": '🛡️', "Light": '✨',
  "Physical": '⚒️', "Explosive": '💥'
};

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  window.shopProductCache = {};

  if (!products.length) {
    productList.innerHTML = '<div class="shop-empty shop-empty-wide">Không có vật phẩm phù hợp.</div>';
    return;
  }

  products.forEach((p) => {
    window.shopProductCache[p.id] = p;
  });

  products.forEach((p, index) => {
    const col = document.createElement('article');
    col.className = `shop-card ${rarityClass(p.rarity)} fade-in-up`;
    col.style.animationDelay = `${Math.min(index * 0.05, 0.55)}s`;

    const attrs = Array.isArray(p.attributes) ? p.attributes : [];
    // Top 3 elements as icon circles
    const elemHtml = attrs.slice(0, 3).map(a =>
      `<span class="shop-card-elem-icon" title="${escapeHtml(a)}">${elementIcon[a] || '✨'}</span>`
    ).join('');

    const imgSrc = p.image || PLACEHOLDER_IMG;
    const isLocked = p.requiredLevel != null && p.requiredLevel !== '' && Number(p.requiredLevel) > 9;

    const btnHtml = isLocked
      ? `<button type="button" class="shop-card-buy is-locked" disabled>
           Requires Lv ${escapeHtml(String(p.requiredLevel))}
         </button>`
      : `<button type="button" class="shop-card-buy" data-pid="${p.id}" onclick="addToCart(${p.id}, this)">
           ${Number(p.price).toLocaleString('vi-VN')}
           <img src="https://cdn-icons-png.flaticon.com/512/170/170994.png" class="coin-icon" alt="gold" />
         </button>`;

    col.innerHTML = `
      <button type="button" class="shop-card-info-btn" onclick="openItemDetail(${p.id})" aria-label="Chi tiết">i</button>
      <span class="shop-card-badge-rarity" title="${escapeHtml(p.rarity || 'Common')}">${rarityLetter(p.rarity || 'Common')}</span>
      <div class="shop-card-visual">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" />
      </div>
      <div class="shop-card-ribbon"><span>${escapeHtml(p.name)}</span></div>
      <div class="shop-card-bottom">
        <div class="shop-card-elements">${elemHtml}</div>
        ${btnHtml}
      </div>
    `;
    productList.appendChild(col);
  });
}


function setupGridScroll() {
  const wrap = document.querySelector('.shop-grid-wrap');
  const left = document.getElementById('grid-scroll-left');
  const right = document.getElementById('grid-scroll-right');
  if (!wrap || !left || !right) return;
  const step = 320;
  left.addEventListener('click', () => wrap.scrollBy({ left: -step, behavior: 'smooth' }));
  right.addEventListener('click', () => wrap.scrollBy({ left: step, behavior: 'smooth' }));
}

function setupShopNav() {
  document.querySelectorAll('.shop-nav-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('shop-nav-info')) return;
      document.querySelectorAll('.shop-nav-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterState.game = btn.getAttribute('data-game') || '';
      fetchProducts();
    });
  });

  document.querySelectorAll('.shop-nav-info').forEach((info) => {
    info.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = info.getAttribute('data-game');
      if (key) showGameInfo(key);
    });
  });
}

function setupToolbarFilters() {
  const rarityEl = document.getElementById('filter-rarity');
  const attrEl = document.getElementById('filter-attribute');
  const searchEl = document.getElementById('shop-search');

  if (rarityEl) {
    rarityEl.addEventListener('change', () => {
      filterState.rarity = rarityEl.value;
      fetchProducts();
    });
  }
  if (attrEl) {
    attrEl.addEventListener('change', () => {
      filterState.attribute = attrEl.value;
      fetchProducts();
    });
  }
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      filterState.search = searchEl.value;
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => fetchProducts(), 200);
    });
  }
}

function openItemDetail(id) {
  const p = window.shopProductCache[id];
  if (!p) return;

  document.getElementById('itemModalTitle').textContent = p.name;

  const img = escapeHtml(p.image || PLACEHOLDER_IMG);
  let html = `<div class="item-modal-head">
    <div class="item-modal-visual"><img src="${img}" alt="" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" /></div>
    <div>
      <span class="shop-tag item-modal-rarity">${escapeHtml(p.rarity || '')}</span>
      ${p.currency_type ? `<span class="shop-tag">${escapeHtml(p.currency_type)}</span>` : ''}
      ${formatGamePrice(p) ? `<p class="item-modal-gameprice">${escapeHtml(formatGamePrice(p))}</p>` : ''}
      <p class="item-modal-vnd">Thanh toán web: ${formatCurrency(p.price)}</p>
    </div>
  </div>`;

  const ex = p.extra;
  if (ex) {
    if (ex.stats && ex.stats.length) {
      html += '<h6 class="item-modal-h">Chỉ số</h6><ul class="item-modal-list">';
      ex.stats.forEach((t) => {
        html += `<li>${escapeHtml(t)}</li>`;
      });
      html += '</ul>';
    }
    if (ex.passives && ex.passives.length) {
      html += '<h6 class="item-modal-h">Nội tại</h6><ul class="item-modal-list item-modal-passives">';
      ex.passives.forEach((t) => {
        html += `<li>${escapeHtml(t)}</li>`;
      });
      html += '</ul>';
    }
    if (ex.activeSkill) {
      html += `<h6 class="item-modal-h">Kỹ năng chủ động</h6><p class="item-modal-passive">${escapeHtml(ex.activeSkill)}</p>`;
    }
    if (ex.unlockCondition) {
      html += `<p class="item-modal-unlock"><strong>Điều kiện:</strong> ${escapeHtml(ex.unlockCondition)}</p>`;
    }
  } else if (p.description) {
    html += `<p class="item-modal-desc">${escapeHtml(p.description)}</p>`;
  }

  html +=
    '<p class="item-modal-disclaimer">Đây là trang thương mại demo — số vàng/ngọc chỉ mang tính tham chiếu trang bị trong game.</p>';

  document.getElementById('itemModalBody').innerHTML = html;

  const modalEl = document.getElementById('itemDetailModal');
  let modal = bootstrap.Modal.getInstance(modalEl);
  if (!modal) modal = new bootstrap.Modal(modalEl);
  modal.show();
}

window.openItemDetail = openItemDetail;

async function showGameInfo(gameKey) {
  try {
    const res = await fetch(`/api/game-info/${gameKey}`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('gameModalTitle').innerText = data.game_name;
      document.getElementById('gameModalDesc').innerText = data.description;

      const iframe = document.getElementById('gameModalVideo');
      if (data.video_url) {
        iframe.src = data.video_url;
        iframe.style.display = 'block';
      } else {
        iframe.src = '';
        iframe.style.display = 'none';
      }

      const modalEl = document.getElementById('gameInfoModal');
      let modal = bootstrap.Modal.getInstance(modalEl);
      if (!modal) modal = new bootstrap.Modal(modalEl);
      modal.show();

      const onHidden = () => {
        iframe.src = '';
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
      };
      modalEl.addEventListener('hidden.bs.modal', onHidden);
    }
  } catch (err) {
    console.error(err);
  }
}

async function addToCart(productId, btnElement) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const data = await res.json();
    if (data.success) {
      updateCartBadge(data.cart);
      const original = btnElement.innerHTML;
      btnElement.classList.add('is-busy');
      btnElement.innerHTML = '✓ Đã thêm';
      setTimeout(() => {
        btnElement.innerHTML = original;
        btnElement.classList.remove('is-busy');
      }, 1400);
    } else {
      alert(data.error || 'Lỗi thêm vào giỏ');
    }
  } catch (err) {
    console.error(err);
  }
}

window.addToCart = addToCart;

async function updateCartBadge(cartData = null) {
  if (!cartData) {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      cartData = data.cart;
    } catch (err) {
      return;
    }
  }
  const total = cartData.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-badge, #cart-badge-top').forEach((el) => {
    if (el) el.textContent = total;
  });
}
