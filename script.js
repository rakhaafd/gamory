let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
let games = [];

const homeSection = document.getElementById('homeSection');
const productsGrid = document.getElementById('productsGrid');
const fetchError = document.getElementById('fetchError');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const loginSection = document.getElementById('loginSection');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');
const cartLink = document.getElementById('cartLink');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');
const closeCart = document.getElementById('closeCart');
const checkoutModal = document.getElementById('checkoutModal');
const modalClose = document.getElementById('modalClose');
const modalStatus = document.getElementById('modalStatus');
const stepCheckout = document.getElementById('stepCheckout');
const stepPayment = document.getElementById('stepPayment');
const stepComplete = document.getElementById('stepComplete');
const stepShipping = document.getElementById('stepShipping');
const gameModal = document.getElementById('gameModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalLabels = document.getElementById('modalLabels');
const modalContent = document.getElementById('modalContent');
const homeLink = document.getElementById('homeLink');
const aboutLink = document.getElementById('aboutLink');
const gamesLink = document.getElementById('gamesLink');
const testimonyLink = document.getElementById('testimonyLink');
const contactLink = document.getElementById('contactLink');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
const contactSubmit = document.getElementById('contactSubmit');
const contactStatus = document.getElementById('contactStatus');

// SweetAlert2 configuration
const swalConfig = {
    customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button'
    },
    background: '#313244', // --surface0
    color: '#cdd6f4', // --text
    confirmButtonColor: '#eba0ac', // --maroon
    confirmButtonText: 'OK',
    iconColor: '#a6e3a1' // --green
};

const style = document.createElement('style');
style.innerHTML = `
    .swal-popup {
        font-family: 'Quicksand', sans-serif;
        border-radius: 10px;
    }
    .swal-title {
        color: #f9e2af; /* --yellow */
        font-size: 1.5rem;
    }
    .swal-confirm-button {
        background-color: #eba0ac !important; /* --maroon */
        color: #cdd6f4 !important; /* --text */
        border-radius: 5px !important;
        padding: 0.5rem 1rem !important;
        transition: background-color 0.3s !important;
    }
    .swal-confirm-button:hover {
        background-color: #7f849c !important; /* --overlay1 */
    }
`;
document.head.appendChild(style);

async function fetchGames() {
    try {
        const response = await fetch('public/data/games.json');
        if (!response.ok) {
            throw new Error('Failed to fetch games data');
        }
        games = await response.json();
        renderProducts();
    } catch (error) {
        fetchError.textContent = 'Error loading games: ' + error.message;
        fetchError.style.display = 'block';
        console.error('Fetch error:', error);
    }
}

async function fetchTestimonials() {
    try {
        const response = await fetch('public/data/testimonials.json');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const testimonials = await response.json();
        renderTestimonials(testimonials);
    } catch (error) {
        console.error('Testimonial fetch error:', error);
    }
}

function renderTestimonials(testimonials) {
    const testimonialGrid = document.getElementById('testimonialGrid');
    testimonialGrid.innerHTML = '';
    testimonials.forEach(testimonial => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        const stars = Array(5).fill().map((_, i) => 
            `<i class="fa${i < testimonial.rating ? 's' : 'r'} fa-star${i < testimonial.rating ? '' : ' empty'}"></i>`
        ).join('');
        card.innerHTML = `
            <div class="stars-container">${stars}</div>
            <p>"${testimonial.comment}"</p>
            <h4>- ${testimonial.name}</h4>
        `;
        testimonialGrid.appendChild(card);
    });
}

async function init() {
    updateLoginState();
    await fetchGames();
    await fetchTestimonials();
    renderCart();
}

function updateLoginState() {
    if (isLoggedIn) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        checkoutBtn.style.display = 'block';
    } else {
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
        checkoutBtn.style.display = 'none';
    }
}

function renderProducts() {
    productsGrid.innerHTML = '';
    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover">
            <div class="card-content">
                <h3>${game.name}</h3>
                <div class="labels">
                    ${game.labels.map(label => `<span>${label}</span>`).join('')}
                </div>
                <p>${game.description}</p>
                <div class="buttons">
                    <button ${isLoggedIn ? '' : 'disabled'} onclick="addToCart(${game.id})">
                        Add to Cart ($${game.price.toFixed(2)})
                    </button>
                    <button onclick="openModal(${index})">View Details</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

async function addToCart(gameId) {
    const game = games.find(g => g.id === gameId);
    const cartItem = cart.find(item => item.id === gameId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...game, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    await Swal.fire({
        ...swalConfig,
        icon: 'success',
        title: 'Item added to cart!',
        showConfirmButton: true
    });
    cartSidebar.classList.add('active');
}

function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</span>
            <div>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

function updateQuantity(gameId, change) {
    const cartItem = cart.find(item => item.id === gameId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== gameId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
}

function openModal(index) {
    if (games.length > 0) {
        modalImage.src = games[index].image;
        modalTitle.textContent = games[index].name;
        modalPrice.textContent = `Price: $${games[index].price.toFixed(2)}`;
        modalLabels.innerHTML = '';
        games[index].labels.forEach(label => {
            const labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            modalLabels.appendChild(labelSpan);
        });
        modalContent.textContent = games[index].description;
        gameModal.classList.add('active');
    }
}

function closeModal() {
    gameModal.classList.remove('active');
}

gameModal.addEventListener('click', (event) => {
    if (event.target === gameModal) {
        closeModal();
    }
});

function processCheckout(callback) {
    setTimeout(() => {
        callback(null, 'Checkout initiated at ' + new Date().toLocaleTimeString());
    }, 1500);
}

function processPayment(callback) {
    setTimeout(() => {
        callback(null, 'Payment processed at ' + new Date().toLocaleTimeString());
    }, 2000);
}

function completePayment(callback) {
    setTimeout(() => {
        callback(null, 'Payment completed at ' + new Date().toLocaleTimeString());
    }, 1500);
}

function prepareShipping(callback) {
    setTimeout(() => {
        callback(null, 'Shipping prepared at ' + new Date().toLocaleTimeString());
    }, 1000);
}

async function handleCheckout() {
    if (!isLoggedIn || cart.length === 0) {
        loginStatus.className = 'status-message error-message fade-in';
        loginStatus.textContent = 'Cart is empty or not logged in';
        return;
    }

    try {
        checkoutModal.classList.add('active');
        stepCheckout.classList.remove('completed', 'active');
        stepPayment.classList.remove('completed', 'active');
        stepComplete.classList.remove('completed', 'active');
        stepShipping.classList.remove('completed', 'active');
        modalStatus.textContent = '';
        modalClose.style.display = 'none';

        stepCheckout.classList.add('active');
        await new Promise((resolve, reject) => {
            processCheckout((err, result) => {
                if (err) reject(err);
                stepCheckout.querySelector('span:first-child').textContent = result;
                stepCheckout.classList.remove('active');
                stepCheckout.classList.add('completed');
                resolve();
            });
        });

        stepPayment.classList.add('active');
        await new Promise((resolve, reject) => {
            processPayment((err, result) => {
                if (err) reject(err);
                stepPayment.querySelector('span:first-child').textContent = result;
                stepPayment.classList.remove('active');
                stepPayment.classList.add('completed');
                resolve();
            });
        });

        stepComplete.classList.add('active');
        await new Promise((resolve, reject) => {
            completePayment((err, result) => {
                if (err) reject(err);
                stepComplete.querySelector('span:first-child').textContent = result;
                stepComplete.classList.remove('active');
                stepComplete.classList.add('completed');
                resolve();
            });
        });

        stepShipping.classList.add('active');
        await new Promise((resolve, reject) => {
            prepareShipping((err, result) => {
                if (err) reject(err);
                stepShipping.querySelector('span:first-child').textContent = result;
                stepShipping.classList.remove('active');
                stepShipping.classList.add('completed');
                resolve();
            });
        });

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        cartSidebar.classList.remove('active');
        checkoutModal.classList.remove('active');
        await Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Purchase completed successfully!',
            showConfirmButton: true
        });
    } catch (error) {
        modalStatus.className = 'status-message error-message';
        modalStatus.textContent = 'Error during checkout';
        modalClose.style.display = 'block';
    }
}

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginStatus.className = 'status-message fade-in';
    if (username && password) {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        loginStatus.textContent = 'Login successful!';
        updateLoginState();
        renderProducts();
        loginSection.style.display = 'none';
        homeSection.style.display = 'block';
    } else {
        loginStatus.className = 'status-message error-message fade-in';
        loginStatus.textContent = 'Please enter username and password';
    }
});

if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoggedIn = false;
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        updateLoginState();
        renderProducts();
        loginStatus.className = 'status-message fade-in';
        loginStatus.textContent = 'Logged out successfully';
    });
}

cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    cartSidebar.classList.toggle('active');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'flex';
    homeSection.style.display = 'none';
});

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.about').scrollIntoView({ behavior: 'smooth' });
});

gamesLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('featuredGames').scrollIntoView({ behavior: 'smooth' });
});

testimonyLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.testimonials').scrollIntoView({ behavior: 'smooth' });
});

contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contactSection').scrollIntoView({ behavior: 'smooth' });
});

checkoutBtn.addEventListener('click', handleCheckout);

modalClose.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburgerBtn.classList.toggle('active');
    hamburgerBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

contactSubmit.addEventListener('click', () => {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    contactStatus.className = 'status-message fade-in';
    if (name && email && message) {
        contactStatus.textContent = 'Message sent successfully! We’ll get back to you soon. 🎮';
        contactStatus.classList.remove('error-message');
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
    } else {
        contactStatus.className = 'status-message error-message fade-in';
        contactStatus.textContent = 'Please fill in all fields!';
    }
});

init();