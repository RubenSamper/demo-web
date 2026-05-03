const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselIndicators = document.getElementById('carouselIndicators');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartBackdrop = document.getElementById('cartBackdrop');
const openCartBtn = document.getElementById('openCartBtn');
const openCartSidebarBtn = document.getElementById('openCartSidebarBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const footerYear = document.getElementById('footerYear');
const footerYearContact = document.getElementById('footerYearContact');
const toastNotif = document.getElementById('toastNotif');
const productDetailImage = document.getElementById('productDetailImage');
const productDetailName = document.getElementById('productDetailName');
const productDetailDescription = document.getElementById('productDetailDescription');
const productDetailPrice = document.getElementById('productDetailPrice');
const productDetailExtra = document.getElementById('productDetailExtra');
const addToCartDetailBtn = document.getElementById('addToCartDetailBtn');

let cart = [];
let products = [];
let toastTimeout = null;
let currentProductId = null;
let carouselIndex = 0;

const defaultProducts = [
  {
    id: 1,
    name: 'Pack Día de la madre',
    description: 'Manzana, plátano y lechuga para tu compra diaria.',
    price: 130,
    image: 'assets/img/product1.svg'
  },
  {
    id: 2,
    name: 'Cesta Bebida Premium',
    description: 'Selección de refrescos y zumos con descuento especial.',
    price: 9.90,
    image: 'assets/img/product2.svg'
  },
  {
    id: 3,
    name: 'Combo Ahorro Cocina',
    description: 'Aceite, arroz y conservas para tus recetas rápidas.',
    price: 18.75,
    image: 'assets/img/product3.svg'
  }
];

function loadCartStorage() {
  const saved = localStorage.getItem('cashBorosaCart');
  if (!saved) {
    cart = [];
    updateCartCount();
    renderCart();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      cart = parsed.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description,
      }));
    }
  } catch (error) {
    console.warn('Carrito localStorage inválido, se resetea.', error);
    cart = [];
  }

  updateCartCount();
  renderCart();
}

function saveCartStorage() {
  localStorage.setItem('cashBorosaCart', JSON.stringify(cart));
}

function handleScrollButton() {
  if (!scrollTopBtn) return;
  if (window.scrollY > 320) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}


function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
}

function showToast(message) {
  if (!toastNotif) return;
  toastNotif.textContent = message;
  toastNotif.classList.add('show');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toastNotif.classList.remove('show');
  }, 2500);
}

function updateCartCount() {
  if (!cartCount) return;
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
    if (cartTotal) cartTotal.textContent = formatPrice(0);
    return;
  }

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <strong>${item.name}</strong>
      <span>Cantidad: ${item.quantity}</span>
      <span>Precio unitario: ${formatPrice(item.price)}</span>
      <span>Subtotal: ${formatPrice(item.price * item.quantity)}</span>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  if (cartTotal) cartTotal.textContent = formatPrice(calculateTotal());
}

function openCart() {
  if (!cartModal) return;
  cartModal.classList.add('open');
  cartModal.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  if (!cartModal) return;
  cartModal.classList.remove('open');
  cartModal.setAttribute('aria-hidden', 'true');
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  renderCart();
  saveCartStorage();
  showToast(`Añadido: ${product.name}`);
  openCart();
}

function clearCart() {
  cart = [];
  updateCartCount();
  renderCart();
  saveCartStorage();
  showToast('Carrito vacío');
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="product-content">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price-row">
        <span class="price">${formatPrice(product.price)}</span>
      </div>
      <div class="product-actions">
        <a href="product.html?id=${product.id}" class="btn btn-secondary">Ver producto</a>
        <button class="btn btn-primary add-cart-btn" data-id="${product.id}">Añadir al carrito</button>
      </div>
    </div>
  `;
  return card;
}

function initCarousel() {
  if (!carouselTrack) return;

  carouselTrack.innerHTML = '';
  carouselIndicators.innerHTML = '';

  products.forEach((product, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const card = createProductCard(product);
    slide.appendChild(card);
    carouselTrack.appendChild(slide);

    const indicator = document.createElement('button');
    indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToSlide(index));
    carouselIndicators.appendChild(indicator);
  });

  document.querySelectorAll('.add-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.dataset.id, 10);
      addToCart(id);
    });
  });

  updateCarousel();
}

function updateCarousel() {
  if (!carouselTrack) return;

  const slideWidth = carouselTrack.querySelector('.carousel-slide')?.offsetWidth || 0;
  const gap = 24;
  const offset = carouselIndex * (slideWidth + gap);
  carouselTrack.style.transform = `translateX(-${offset}px)`;

  document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index === carouselIndex);
  });
}

function goToSlide(index) {
  const totalSlides = carouselTrack?.querySelectorAll('.carousel-slide').length || 0;
  carouselIndex = Math.max(0, Math.min(index, totalSlides - 1));
  updateCarousel();
}

function nextSlide() {
  const totalSlides = carouselTrack?.querySelectorAll('.carousel-slide').length || 0;
  carouselIndex = (carouselIndex + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  const totalSlides = carouselTrack?.querySelectorAll('.carousel-slide').length || 0;
  carouselIndex = (carouselIndex - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function loadProducts() {
  fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Respuesta no válida al cargar products.json');
      }
      return response.json();
    })
    .then(data => {
      products = Array.isArray(data) && data.length > 0 ? data : defaultProducts;
      initCarousel();
    })
    .catch(error => {
      products = defaultProducts;
      initCarousel();
      if (carouselTrack && products.length === 0) {
        carouselTrack.innerHTML = '<p class="error-message">No se pudieron cargar los productos.</p>';
      }
      console.warn('Usando datos locales por error en la carga:', error);
    });
}


function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  if (Number.isNaN(id)) {
    if (productDetailName) productDetailName.textContent = 'Producto no encontrado';
    if (productDetailDescription) productDetailDescription.textContent = 'No se encontró un ID de producto válido en la URL.';
    return;
  }

  fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Respuesta no válida al cargar products.json');
      }
      return response.json();
    })
    .then(data => {
      products = Array.isArray(data) && data.length > 0 ? data : defaultProducts;
      const product = products.find(item => item.id === id);
      if (!product) {
        if (productDetailName) productDetailName.textContent = 'Producto no encontrado';
        if (productDetailDescription) productDetailDescription.textContent = 'Intenta con otro producto o vuelve al catálogo.';
        return;
      }

      currentProductId = product.id;
      if (productDetailImage) {
        productDetailImage.src = product.image;
        productDetailImage.alt = product.name;
      }
      if (productDetailName) productDetailName.textContent = product.name;
      if (productDetailDescription) productDetailDescription.textContent = product.description;
      if (productDetailPrice) productDetailPrice.textContent = formatPrice(product.price);
      if (productDetailExtra) productDetailExtra.textContent = product.extra || 'Compra ahora y disfrútalo en tu hogar con la mejor calidad.';
      if (addToCartDetailBtn) {
        addToCartDetailBtn.addEventListener('click', () => addToCart(product.id));
      }
    })
    .catch(error => {
      console.warn('Error cargando producto, usando datos locales:', error);
      products = defaultProducts;
      const product = products.find(item => item.id === id);
      if (!product) {
        if (productDetailName) productDetailName.textContent = 'Producto no encontrado';
        if (productDetailDescription) productDetailDescription.textContent = 'Intenta con otro producto o vuelve al catálogo.';
        return;
      }
      currentProductId = product.id;
      if (productDetailImage) {
        productDetailImage.src = product.image;
        productDetailImage.alt = product.name;
      }
      if (productDetailName) productDetailName.textContent = product.name;
      if (productDetailDescription) productDetailDescription.textContent = product.description;
      if (productDetailPrice) productDetailPrice.textContent = formatPrice(product.price);
      if (productDetailExtra) productDetailExtra.textContent = product.extra || 'Compra ahora y disfrútalo en tu hogar con la mejor calidad.';
      if (addToCartDetailBtn) {
        addToCartDetailBtn.addEventListener('click', () => addToCart(product.id));
      }
    });
}

function initForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
    contactForm.reset();
  });
}

function setFooterYear() {
  const year = new Date().getFullYear();
  if (footerYear) footerYear.textContent = year;
  if (footerYearContact) footerYearContact.textContent = year;
}

function handleKeyboardShortcut(event) {
  if (event.ctrlKey && event.code === 'Space') {
    event.preventDefault();
    if (products.length > 0) {
      window.location.href = `product.html?id=${products[0].id}`;
    }
  }
}

function toggleMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.toggle('active');
  }
  if (hamburgerBtn) {
    hamburgerBtn.classList.toggle('open');
  }
}

function closeMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.remove('active');
  }
  if (hamburgerBtn) {
    hamburgerBtn.classList.remove('open');
  }
}

function handleClickOutside(event) {
  if (!mobileMenu || !hamburgerBtn) return;

  const isMenuOpen = mobileMenu.classList.contains('active');
  const isClickOnMenu = mobileMenu.contains(event.target);
  const isClickOnButton = hamburgerBtn.contains(event.target);

  if (isMenuOpen && !isClickOnMenu && !isClickOnButton) {
    closeMobileMenu();
  }
}

openCartBtn?.addEventListener('click', openCart);
openCartSidebarBtn?.addEventListener('click', openCart);
closeCartBtn?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);
clearCartBtn?.addEventListener('click', clearCart);
carouselPrev?.addEventListener('click', prevSlide);
carouselNext?.addEventListener('click', nextSlide);
hamburgerBtn?.addEventListener('click', toggleMobileMenu);
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

document.addEventListener('click', handleClickOutside);

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && cartModal?.classList.contains('open')) {
    closeCart();
  }
  handleKeyboardShortcut(event);
});

window.addEventListener('scroll', handleScrollButton);

window.addEventListener('resize', updateCarousel);

window.addEventListener('DOMContentLoaded', () => {
  loadCartStorage();
  setFooterYear();
  loadProducts();
  loadProductDetail();
  initForm();
  handleScrollButton();
});
