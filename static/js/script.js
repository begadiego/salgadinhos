document.addEventListener('DOMContentLoaded', function() {
    // Cart data
    let cart = [];
    let totalPrice = 0;
    let selectedOption = null;
    const regularPrice = 0.57; // Regular price per unit for fried snacks
    const eventPrice = 0.50;   // Price for "fry at event" option
    const fryServiceFee = 150; // Additional fee for frying service
    
    // DOM elements
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
    const optionFields = document.querySelectorAll('.option-fields');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productSections = document.querySelectorAll('.products-section');
    
    // Initialize cart display
    updateCartDisplay();
    
    // Add event listeners for category buttons
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and sections
            categoryButtons.forEach(b => b.classList.remove('active'));
            productSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to the clicked button and corresponding section
            this.classList.add('active');
            const category = this.dataset.category;
            document.getElementById(`${category}-products-section`).classList.add('active');
        });
    });
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            const productCard = this.closest('.product-card');
            const minQuantity = parseInt(productCard.dataset.minQuantity);
            let value = parseInt(input.value) || 0;
            
            if (this.classList.contains('decrease')) {
                // Don't go below min quantity
                if (value > minQuantity) {
                    input.value = value - 1;
                } else if (value > 0 && value <= minQuantity) {
                    input.value = 0;
                }
            } else if (this.classList.contains('increase')) {
                // If zero, start from min quantity
                if (value === 0) {
                    input.value = minQuantity;
                } else {
                    input.value = value + 1;
                }
            }
        });
    });
    
    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = parseInt(productCard.dataset.id);
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = parseFloat(productCard.dataset.price);
            const productType = productCard.dataset.type;
            const minQuantity = parseInt(productCard.dataset.minQuantity);
            const quantityInput = productCard.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value);
            
            if (quantity > 0 && (productType !== 'fried' || quantity >= minQuantity)) {
                addToCart(productId, productName, productPrice, quantity, productType);
                // Reset quantity input - for fried products reset to min, for baked to 0
                quantityInput.value = (productType === 'fried') ? minQuantity : 0;
            } else if (productType === 'fried' && quantity < minQuantity) {
                alert(`Quantidade mínima para ${productName} é de ${minQuantity} unidades.`);
            }
        });
    });
    
    // Add event listeners for delivery options
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Hide all option fields
            optionFields.forEach(field => {
                field.classList.remove('active');
            });
            
            // Show selected option fields
            const selectedFields = document.getElementById(`${this.value}-fields`);
            if (selectedFields) {
                selectedFields.classList.add('active');
            }
            
            selectedOption = this.value;
            
            // Update cart if "fry-at-event" option is selected or deselected
            if (selectedOption === 'fry-at-event') {
                updateCartPrices(eventPrice);
            } else {
                updateCartPrices(regularPrice);
            }
        });
    });
    
    // Send order button event listener
    sendOrderBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Please add items to your cart before placing an order.');
            return;
        }
        
        if (!selectedOption) {
            alert('Please select a delivery option.');
            return;
        }
        
        // Validate required fields based on selected option
        const selectedFields = document.getElementById(`${selectedOption}-fields`);
        const requiredFields = selectedFields.querySelectorAll('[required]');
        let allFieldsValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                allFieldsValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        if (!allFieldsValid) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Generate WhatsApp message
        sendWhatsAppMessage();
    });
    
    // Functions
    function addToCart(id, name, price, quantity, type) {
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === id);
        
        // Determine the price based on product type and delivery option
        let finalPrice = price;
        if (type === 'fried' && selectedOption === 'fry-at-event') {
            finalPrice = eventPrice;
        }
        
        if (existingItemIndex !== -1) {
            // Update existing item
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                id: id,
                name: name,
                price: finalPrice,
                quantity: quantity,
                type: type
            });
        }
        
        updateCartDisplay();
    }
    
    function updateCartPrices(pricePerUnit) {
        cart.forEach(item => {
            // Only update prices for fried items
            if (item.type === 'fried') {
                item.price = pricePerUnit;
            }
        });
        
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsElement.innerHTML = '';
            cartTotalElement.textContent = 'R$ 0.00';
        } else {
            emptyCartMessage.style.display = 'none';
            
            // Clear current cart items
            cartItemsElement.innerHTML = '';
            
            // Calculate total price
            totalPrice = 0;
            
            // Add each item to the cart display
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div>${item.name} (${item.quantity}x)</div>
                    <div>R$ ${itemTotal.toFixed(2)}</div>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">×</button>
                `;
                cartItemsElement.appendChild(cartItemElement);
            });
            
            // Add service fee if "fry at event" is selected
            if (selectedOption === 'fry-at-event') {
                totalPrice += fryServiceFee;
                
                const serviceFeeElement = document.createElement('div');
                serviceFeeElement.className = 'cart-item';
                serviceFeeElement.innerHTML = `
                    <div>Serviço de Fritura</div>
                    <div>R$ ${fryServiceFee.toFixed(2)}</div>
                `;
                cartItemsElement.appendChild(serviceFeeElement);
            }
            
            // Update total price display
            cartTotalElement.textContent = `R$ ${totalPrice.toFixed(2)}`;
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    removeCartItem(index);
                });
            });
        }
    }
    
    function removeCartItem(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
    
    function sendWhatsAppMessage() {
        // Get customer name
        let customerName = "";
        if (document.getElementById('customer-name')) {
            customerName = document.getElementById('customer-name').value;
        }
        
        // Format cart items
        let itemsText = "";
        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            itemsText += `${item.name} x${item.quantity} - R$ ${itemTotal}\n`;
        });
        
        // Add service fee if applicable
        if (selectedOption === 'fry-at-event') {
            itemsText += `Serviço de Fritura - R$ ${fryServiceFee.toFixed(2)}\n`;
        }
        
        // Format order details based on delivery option
        let orderDetails = "";
        
        if (selectedOption === 'pickup') {
            const pickupDate = document.getElementById('pickup-date').value;
            const pickupTime = document.getElementById('pickup-time').value;
            orderDetails += `\nRetirada no Local\nData: ${pickupDate}\nHorário: ${pickupTime}`;
        } 
        else if (selectedOption === 'delivery') {
            const deliveryDate = document.getElementById('delivery-date').value;
            const deliveryTime = document.getElementById('delivery-time').value;
            const deliveryAddress = document.getElementById('delivery-address').value;
            orderDetails += `\nEntrega\nData: ${deliveryDate}\nHorário: ${deliveryTime}\nEndereço: ${deliveryAddress}`;
        } 
        else if (selectedOption === 'fry-at-event') {
            const eventDate = document.getElementById('event-date').value;
            const eventTime = document.getElementById('event-time').value;
            const eventAddress = document.getElementById('event-address').value;
            orderDetails += `\nFritar no Evento\nData: ${eventDate}\nHorário: ${eventTime}\nEndereço: ${eventAddress}\n\nObs: Necessário 7L de óleo para realizar a fritura, gás disponível no local da fritura.`;
        }
        
        // Construct the complete message
        const message = `*NOVO PEDIDO*\nNome: ${customerName}\n\n*ITENS:*\n${itemsText}\n*TOTAL: R$ ${totalPrice.toFixed(2)}*\n${orderDetails}`;
        
        // Encode the message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');
    }
});
