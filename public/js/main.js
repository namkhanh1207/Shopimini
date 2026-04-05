const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // Nếu ở trang index
    if (document.getElementById('product-list')) {
        setupFilters();
        // Ban đầu load tất cả
        fetchProducts('');
    }
});

async function fetchProducts(game = '') {
    try {
        const url = game ? `/api/products?game=${game}` : '/api/products';
        const res = await fetch(url);
        const data = await res.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        if(data.products.length === 0) {
            productList.innerHTML = '<div class="col-12 text-center py-5">Không có vật phẩm nào</div>';
            return;
        }

        data.products.forEach((p, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 mb-4 fade-in-up';
            col.style.animationDelay = `${index * 0.1}s`;
            
            col.innerHTML = `
                <div class="card product-card h-100">
                    <img src="${p.image}" class="card-img-top" alt="${p.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${p.name}</h5>
                        <div class="mb-2">
                            <span class="badge badge-game">${p.game || 'Chung'}</span>
                            <span class="badge badge-rarity">${p.rarity || 'Thường'}</span>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${p.description}</p>
                        <div class="product-price">${formatCurrency(p.price)}</div>
                        <button class="btn btn-primary-custom mt-auto w-100" onclick="addToCart(${p.id}, this)">Thêm Vào Giỏ</button>
                    </div>
                </div>
            `;
            productList.appendChild(col);
        });
    } catch(err) {
        console.error(err);
    }
}

function setupFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active
            filters.forEach(f => f.classList.remove('active'));
            // Add active
            e.target.classList.add('active');
            
            const gameKey = e.target.getAttribute('data-game');
            if (gameKey) {
                showGameInfo(gameKey);
            } else {
                fetchProducts('');
            }
        });
    });
}

async function showGameInfo(gameKey) {
    try {
        const res = await fetch(`/api/game-info/${gameKey}`);
        if(res.ok) {
            const data = await res.json();
            document.getElementById('gameModalTitle').innerText = data.game_name;
            document.getElementById('gameModalDesc').innerText = data.description;
            
            const iframe = document.getElementById('gameModalVideo');
            if(data.video_url) {
                iframe.src = data.video_url;
                iframe.style.display = 'block';
            } else {
                iframe.src = '';
                iframe.style.display = 'none';
            }
            
            let modalEl = document.getElementById('gameInfoModal');
            let modal = bootstrap.Modal.getInstance(modalEl);
            if (!modal) {
                modal = new bootstrap.Modal(modalEl);
            }
            modal.show();
            
            // Lắng nghe sự kiện close
            const onHidden = () => {
                iframe.src = '';
                fetchProducts(gameKey);
                modalEl.removeEventListener('hidden.bs.modal', onHidden);
            };
            modalEl.addEventListener('hidden.bs.modal', onHidden);
        } else {
            fetchProducts(gameKey);
        }
    } catch(err) {
        console.error(err);
        fetchProducts(gameKey);
    }
}

async function addToCart(productId, btnElement) {
    try {
        const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        const data = await res.json();
        if (data.success) {
            updateCartBadge(data.cart);
            const originalText = btnElement.innerText;
            btnElement.innerText = '✓ Đã Thêm';
            btnElement.style.backgroundColor = 'var(--neon-cyan)';
            btnElement.style.color = 'var(--bg-dark)';
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.backgroundColor = 'transparent';
                btnElement.style.color = 'var(--text-light)';
            }, 1500);
        } else {
            alert(data.error || 'Lỗi thêm vào giỏ');
        }
    } catch(err) {
        console.error(err);
    }
}

async function updateCartBadge(cartData = null) {
    if (!cartData) {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            cartData = data.cart;
        } catch(err) {
            return;
        }
    }
    const badge = document.getElementById('cart-badge');
    if (badge && cartData) {
        const total = cartData.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = total;
    }
}
