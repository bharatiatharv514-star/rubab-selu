// Global State
let products = JSON.parse(localStorage.getItem('rubabSeluProductsV2')) || [
    {
        id: 1,
        name: "Premium Oxford Shirt",
        category: "Shirts",
        price: 2499,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        sizes: { S: true, M: true, L: true, XL: false }
    },
    {
        id: 2,
        name: "Cotton Blend T-Shirt",
        category: "T-Shirts",
        price: 1299,
        image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        sizes: { S: true, M: true, L: true, XL: true }
    },
    {
        id: 3,
        name: "Slim Fit Chinos",
        category: "Pants",
        price: 3499,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        sizes: { S: false, M: true, L: true, XL: true }
    },
    {
        id: 4,
        name: "Leather Bomber Jacket",
        category: "Jackets",
        price: 8999,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        sizes: { S: true, M: true, L: false, XL: true }
    }
];

let cart = JSON.parse(localStorage.getItem('rubabSeluCart')) || [];
let currentSlideIndex = 0;

// DOM Elements
const elements = {
    productsGrid: document.getElementById('productsGrid'),
    cartCount: document.getElementById('cartCount'),
    modalCartCount: document.getElementById('modalCartCount'),
    cartModal: document.getElementById('cartModal'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    adminPanel: document.getElementById('adminPanel'),
    adminToggle: document.getElementById('adminToggle'),
    productForm: document.getElementById('productForm'),
    productsList: document.getElementById('productsList')
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    hidePreloader();
    renderProducts();
    setupEventListeners();
    startSlider();
    updateCartDisplay();
    renderAdminProducts();
});

// Preloader
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1500);
}

// Slider
function startSlider() {
    setInterval(() => {
        nextSlide();
    }, 5000);
}

function showSlide(index) {
    document.querySelectorAll('.slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    currentSlideIndex = index;
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % 3;
    showSlide(currentSlideIndex);
}

window.currentSlide = showSlide;

// Render Products
function renderProducts(filteredProducts = products) {
    elements.productsGrid.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        elements.productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image" 
             onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3>${product.name}</h3>
            <div class="product-price">₹${product.price.toLocaleString()}</div>
            <div class="sizes-display">
                ${Object.entries(product.sizes).map(([size, available]) => 
                    available ? 
                    `<span class="size-badge size-available">${size}</span>` :
                    `<span class="size-badge size-unavailable">${size}</span>`
                ).join('')}
            </div>
            <button class="btn-primary add-to-cart" data-id="${product.id}">
                <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
    
    // Cart
    document.querySelector('.cart-icon').addEventListener('click', () => {
        elements.cartModal.classList.add('active');
    });
    
    // Close modal
    document.querySelector('.close').addEventListener('click', closeCartModal);
    window.addEventListener('click', (e) => {
        if (e.target === elements.cartModal) closeCartModal();
    });
    
    // Admin
    elements.adminToggle.addEventListener('click', toggleAdminPanel);
    document.getElementById('closeAdmin').addEventListener('click', toggleAdminPanel);
    
    // Product form
    elements.productForm.addEventListener('submit', handleProductForm);
    
    // Filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('sizeFilter').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Cart actions
    document.getElementById('clearCart').addEventListener('click', clearCart);
    
    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAdminTab(e.target.dataset.tab));
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function toggleMobileMenu() {
    document.querySelector('.nav-menu').classList.toggle('active');
    document.querySelector('.hamburger').classList.toggle('active');
}

function toggleAdminPanel() {
    elements.adminPanel.classList.toggle('active');
    document.body.style.overflow = elements.adminPanel.classList.contains('active') ? 'hidden' : '';
}

function closeCartModal() {
    elements.cartModal.classList.remove('active');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('rubabSeluCart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Visual feedback
    const btn = event.target.closest('.add-to-cart');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 1500);
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems;
    elements.modalCartCount.textContent = totalItems;
    
    renderCartItems();
}

function renderCartItems() {
    if (cart.length === 0) {
        elements.cartItems.innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280;">Your cart is empty</p>';
        elements.cartTotal.textContent = '0';
        return;
    }
    
    elements.cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString()} x ${item.quantity}</p>
            </div>
            <div style="margin-left:auto;">
                <button onclick="updateCartQuantity(${item.id}, -1)" style="background:none;border:none;color:#ef4444;font-size:1.2rem;">−</button>
                <span style="margin:0 10px;font-weight:600;">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)" style="background:none;border:none;color:#3b82f6;font-size:1.2rem;">+</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.cartTotal.textContent = total.toLocaleString();
}

window.updateCartQuantity = function(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== id);
        }
        localStorage.setItem('rubabSeluCart', JSON.stringify(cart));
        updateCartDisplay();
    }
};

function clearCart() {
    cart = [];
    localStorage.setItem('rubabSeluCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const size = document.getElementById('sizeFilter').value;
    
    let filtered = products.filter(product => {
        // Category filter
        if (category && product.category !== category) return false;
        
        // Price filter
        if (priceRange) {
            const [min, max] = priceRange.split(/[-+]/).map(Number);
            if (priceRange.includes('+')) {
                return product.price >= min;
            }
            return product.price >= min && product.price <= max;
        }
        
        // Size filter
        if (size && !product.sizes[size]) return false;
        
        return true;
    });
    
    renderProducts(filtered);
}

function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sizeFilter').value = '';
    renderProducts();
}

// Admin Functions
function handleProductForm(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editId').value;
    const productData = {
        id: editId ? parseInt(editId) : Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        sizes: {
            S: document.getElementById('sizeS').checked,
            M: document.getElementById('sizeM').checked,
            L: document.getElementById('sizeL').checked,
            XL: document.getElementById('sizeXL').checked
        }
    };
    
    if (editId) {
        const index = products.findIndex(p => p.id == editId);
        products[index] = productData;
    } else {
        products.push(productData);
    }
    
    localStorage.setItem('rubabSeluProductsV2', JSON.stringify(products));
    renderProducts();
    renderAdminProducts();
    elements.productForm.reset();
    document.getElementById('editId').value = '';
    
    alert('✅ Product saved successfully!');
}

function renderAdminProducts() {
    elements.productsList.innerHTML = products.map(product => `
        <div class="product-admin-item">
            <div>
                <div class="product-admin-name">${product.name}</div>
                <div style="color:#6b7280;font-size:0.9rem;">
                    ${product.category} • ₹${product.price}
                </div>
            </div>
            <div class="product-admin-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('editId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image;
        document.getElementById('sizeS').checked = product.sizes.S;
        document.getElementById('sizeM').checked = product.sizes.M;
        document.getElementById('sizeL').checked = product.sizes.L;
        document.getElementById('sizeXL').checked = product.sizes.XL;
        switchAdminTab('add');
    }
};

window.deleteProduct = function(id) {
    if (confirm('Delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('rubabSeluProductsV2', JSON.stringify(products));
        renderProducts();
        renderAdminProducts();
    }
};

function switchAdminTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

// Add to cart event delegation
document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart')) {
        const productId = parseInt(e.target.closest('.add-to-cart').dataset.id);
        addToCart(productId);
    }
});

// Filter on scroll to shop
const shopObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const filtersSection = document.getElementById('filters');
            filtersSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}, { threshold: 0.1 });

shopObserver.observe(document.getElementById('shop'));