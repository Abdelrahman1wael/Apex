/**
 * Apex Luxe E-Commerce - Main Application Logic & Store Controller
 */

class ApexLuxeStore {
  constructor() {
    this.products = [
      {
        id: 'p1',
        title: 'Apex Neural Headset Pro',
        category: 'audio',
        categoryLabel: 'Audio Tech',
        price: 499,
        rating: 4.9,
        icon: 'fa-headphones-simple',
        desc: 'Spatial audio headset with neural noise-cancellation and emissive cyan ring lighting.',
        tag: 'HOT RELEASE'
      },
      {
        id: 'p2',
        title: 'Holo-Lens Cyber Visor',
        category: 'wearable',
        categoryLabel: 'Wearables',
        price: 899,
        rating: 4.8,
        icon: 'fa-vr-cardboard',
        desc: 'Augmented reality smart glasses with retina HUD projection and ultra-light titanium frame.',
        tag: 'BESTSELLER'
      },
      {
        id: 'p3',
        title: 'Quantum Core Watch X',
        category: 'cyber',
        categoryLabel: 'Cyberware',
        price: 1250,
        rating: 5.0,
        icon: 'fa-clock',
        desc: 'Atomic timekeeping wrist terminal with holographic biometric sensor display.',
        tag: 'LIMITED'
      },
      {
        id: 'p4',
        title: 'Cyber Pulse Audio Sphere',
        category: 'audio',
        categoryLabel: 'Audio Tech',
        price: 299,
        rating: 4.7,
        icon: 'fa-compact-disc',
        desc: 'Levitating wireless Bluetooth speaker with reactive ambient light equalizer.',
        tag: 'FEATURED'
      },
      {
        id: 'p5',
        title: 'Exo-Grip Haptic Glove',
        category: 'wearable',
        categoryLabel: 'Wearables',
        price: 650,
        rating: 4.6,
        icon: 'fa-hand-back-fist',
        desc: 'Full tactile force-feedback haptic glove designed for virtual manipulation.',
        tag: 'PRO'
      },
      {
        id: 'p6',
        title: 'Aero-Drone Nano Matrix',
        category: 'quantum',
        categoryLabel: 'Quantum Devices',
        price: 1800,
        rating: 4.9,
        icon: 'fa-helicopter',
        desc: 'Autonomous micro-surveillance drone swarm with quantum encryption telemetry.',
        tag: 'NEW'
      },
      {
        id: 'p7',
        title: 'Bionic Cyber Arm Core',
        category: 'cyber',
        categoryLabel: 'Cyberware',
        price: 2400,
        rating: 5.0,
        icon: 'fa-robot',
        desc: 'High-torque carbon-fiber prosthetic implant core with instant sub-millisecond nerve link.',
        tag: 'ULTIMATE'
      },
      {
        id: 'p8',
        title: 'Quantum Storage Crystal 1TB',
        category: 'quantum',
        categoryLabel: 'Quantum Devices',
        price: 350,
        rating: 4.5,
        icon: 'fa-database',
        desc: 'Sub-atomic photonic optical data crystal supporting 10,000 year data retention.',
        tag: 'TECH CHOICE'
      }
    ];

    this.cart = [];
    this.currentCategory = 'all';
    this.maxPrice = 2500;
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.activeProductForModal = null;

    this.initElements();
    this.initEvents();
    this.renderProducts();
  }

  initElements() {
    this.productsGrid = document.getElementById('products-grid');
    this.resultsCount = document.getElementById('results-count');
    this.searchInput = document.getElementById('search-input');
    this.priceRange = document.getElementById('price-range');
    this.priceVal = document.getElementById('price-val');
    this.sortSelect = document.getElementById('sort-select');
    this.catPills = document.querySelectorAll('.cat-pill');

    // Cart Elements
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartOverlay = document.getElementById('cart-overlay');
    this.cartToggleBtn = document.getElementById('cart-toggle-btn');
    this.closeCartBtn = document.getElementById('close-cart-btn');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartCount = document.getElementById('cart-count');
    this.cartSubtotal = document.getElementById('cart-subtotal');
    this.cartTotal = document.getElementById('cart-total');
    this.checkoutBtn = document.getElementById('checkout-btn');

    // Modal Quick View Elements
    this.customizerModal = document.getElementById('customizer-modal');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.heroSpotlightBtn = document.getElementById('hero-spotlight-btn');
    this.modalProductTitle = document.getElementById('modal-product-title');
    this.modalProductName = document.getElementById('modal-product-name');
    this.modalProductDesc = document.getElementById('modal-product-desc');
    this.modalProductPrice = document.getElementById('modal-product-price');
    this.modalDisplayIcon = document.getElementById('modal-display-icon');
    this.modalAddCartBtn = document.getElementById('modal-add-cart-btn');
    this.colorDots = document.querySelectorAll('.color-dot');

    // Analytics Elements
    this.analyticsDrawer = document.getElementById('analytics-drawer');
    this.analyticsToggleBtn = document.getElementById('analytics-toggle-btn');
    this.closeAnalyticsBtn = document.getElementById('close-analytics-btn');
  }

  initEvents() {
    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderProducts();
      });
    }

    // Category Filter
    this.catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentCategory = pill.dataset.cat;
        this.renderProducts();
      });
    });

    // Price Filter
    if (this.priceRange) {
      this.priceRange.addEventListener('input', (e) => {
        this.maxPrice = parseFloat(e.target.value);
        if (this.priceVal) this.priceVal.innerText = this.maxPrice;
        this.renderProducts();
      });
    }

    // Sort
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    // Cart Drawer Toggle
    if (this.cartToggleBtn) {
      this.cartToggleBtn.addEventListener('click', () => this.toggleCart(true));
    }
    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.toggleCart(false));
    }
    if (this.cartOverlay) {
      this.cartOverlay.addEventListener('click', () => this.toggleCart(false));
    }

    // Checkout
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) return;
        this.showToast('🚀 Order placed successfully! Dispatching order.');
        this.cart = [];
        this.updateCartUI();
        this.toggleCart(false);
      });
    }

    // Analytics Toggle
    if (this.analyticsToggleBtn) {
      this.analyticsToggleBtn.addEventListener('click', () => {
        this.analyticsDrawer.classList.toggle('open');
        if (this.analyticsDrawer.classList.contains('open')) {
          this.analyticsDrawer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    if (this.closeAnalyticsBtn) {
      this.closeAnalyticsBtn.addEventListener('click', () => {
        this.analyticsDrawer.classList.remove('open');
      });
    }

    // Quick View Modal Events
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.toggleModal(false));
    }
    if (this.heroSpotlightBtn) {
      this.heroSpotlightBtn.addEventListener('click', () => {
        this.openQuickView(this.products[0]);
      });
    }

    // Color picker
    this.colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.dataset.color;
        if (this.modalDisplayIcon) {
          this.modalDisplayIcon.style.color = color;
          this.modalDisplayIcon.style.filter = `drop-shadow(0 0 20px ${color})`;
        }
      });
    });

    // Add to cart from modal
    if (this.modalAddCartBtn) {
      this.modalAddCartBtn.addEventListener('click', () => {
        if (this.activeProductForModal) {
          this.addToCart(this.activeProductForModal.id);
          this.toggleModal(false);
        }
      });
    }
  }

  /* Filter & Render Products */
  renderProducts() {
    if (!this.productsGrid) return;
    this.productsGrid.innerHTML = '';

    let filtered = this.products.filter(p => {
      const matchCat = this.currentCategory === 'all' || p.category === this.currentCategory;
      const matchPrice = p.price <= this.maxPrice;
      const matchSearch = p.title.toLowerCase().includes(this.searchQuery) || p.desc.toLowerCase().includes(this.searchQuery);
      return matchCat && matchPrice && matchSearch;
    });

    // Sorting
    if (this.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (this.resultsCount) {
      this.resultsCount.innerText = filtered.length;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card glass-card';

      card.innerHTML = `
        <div class="card-img-wrapper">
          <span class="badge-tag">${p.tag}</span>
          <i class="fa-solid ${p.icon}"></i>
        </div>
        <div>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.desc}</p>
        </div>
        <div>
          <div class="card-meta">
            <span class="card-price">$${p.price}</span>
            <span class="card-rating"><i class="fa-solid fa-star"></i> ${p.rating}</span>
          </div>
          <div class="card-actions">
            <button class="card-btn btn-3d" data-id="${p.id}"><i class="fa-solid fa-eye"></i> View</button>
            <button class="card-btn btn-add" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-3d').addEventListener('click', () => this.openQuickView(p));
      card.querySelector('.btn-add').addEventListener('click', () => this.addToCart(p.id));

      this.productsGrid.appendChild(card);
    });
  }

  /* Product Quick View Modal */
  openQuickView(product) {
    this.activeProductForModal = product;
    if (this.modalProductTitle) this.modalProductTitle.innerHTML = `<i class="fa-solid ${product.icon}"></i> ${product.title}`;
    if (this.modalProductName) this.modalProductName.innerText = product.title;
    if (this.modalProductDesc) this.modalProductDesc.innerText = product.desc;
    if (this.modalProductPrice) this.modalProductPrice.innerText = `$${product.price}`;
    if (this.modalDisplayIcon) this.modalDisplayIcon.className = `fa-solid ${product.icon} modal-display-icon`;

    this.toggleModal(true);
  }

  toggleModal(open) {
    if (!this.customizerModal) return;
    if (open) {
      this.customizerModal.classList.add('open');
    } else {
      this.customizerModal.classList.remove('open');
    }
  }

  /* Cart Logic */
  addToCart(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...prod, qty: 1 });
    }

    this.updateCartUI();
    this.showToast(`Added "${prod.title}" to your cart!`);
  }

  updateCartUI() {
    if (!this.cartItemsList) return;
    this.cartItemsList.innerHTML = '';

    let subtotal = 0;
    let totalItems = 0;

    this.cart.forEach(item => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <i class="fa-solid ${item.icon} cart-item-icon"></i>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price} x ${item.qty}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
        </div>
      `;

      div.querySelector('.dec-btn').addEventListener('click', () => this.changeQty(item.id, -1));
      div.querySelector('.inc-btn').addEventListener('click', () => this.changeQty(item.id, 1));

      this.cartItemsList.appendChild(div);
    });

    if (this.cartCount) this.cartCount.innerText = totalItems;
    if (this.cartSubtotal) this.cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    if (this.cartTotal) this.cartTotal.innerText = `$${subtotal.toFixed(2)}`;
    if (this.checkoutBtn) this.checkoutBtn.disabled = this.cart.length === 0;
  }

  changeQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(i => i.id !== productId);
    }
    this.updateCartUI();
  }

  toggleCart(open) {
    if (!this.cartDrawer || !this.cartOverlay) return;
    if (open) {
      this.cartDrawer.classList.add('open');
      this.cartOverlay.classList.add('open');
    } else {
      this.cartDrawer.classList.remove('open');
      this.cartOverlay.classList.remove('open');
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Instantiate Store App
document.addEventListener('DOMContentLoaded', () => {
  window.apexLuxeStore = new ApexLuxeStore();
});
