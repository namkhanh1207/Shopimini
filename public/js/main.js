// Cập nhật số lượng giỏ hàng trên Navbar
async function updateCartBadge() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();
    let totalItems = 0;
    if (data.cart) {
      data.cart.forEach(item => { totalItems += item.quantity; });
    }
    const badge = document.getElementById('cart-badge');
    if (badge) badge.innerText = totalItems;
  } catch (err) {
    console.error(err);
  }
}

// Thêm vào giỏ
async function addToCart(productId) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    const data = await res.json();
    if (data.success) {
      alert('Đã thêm sản phẩm vào giỏ hàng!');
      updateCartBadge();
    }
  } catch(err) {
    console.error(err);
  }
}

// Format tiền tệ VNĐ
function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Chạy khởi tạo ngay khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
