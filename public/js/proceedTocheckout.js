const checkOutForm = document.getElementById('proceed_checkout')
//const keyValue = JSON.parse(localStorage.getItem('cartProducts'))
//const myIndex = keyValue?.quantity ?? ''
//const noSign = document.getElementById('noSign')

const cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || { products: [] };


keyValue?.products.forEach((item, index) => {
    b.push(item.id)
})


function ariphmetica(a, b){
    return a * b
}
//console.log('hello')

if(b.length){
  let totalValue = 0
    const a = getProductId(b)
    a.then((data) => {
        data.forEach(element => {
            cartProducts.products.forEach((item) => {
                if(element.id === +item.id && +item.quantity >= 1) {
                    totalValue += ariphmetica(+element.price, item.quantity)
                    console.log(totalValue)
                }
               // console.log(div)
                div.innerHTML = '<h4><b>The total cost is: ' + totalValue + '$</b></h4>'
            })
        });
    })
} else {
    console.log('yo\'q')
}


const valueContainer = document.getElementById('hidden')
const pickUp = document.getElementById('pickUp')
const deliveryRadio = document.getElementById('Delivery')
const inCash = document.getElementById('inCash')
const secondCash = localStorage.getItem('in-cash')
const CreditCard = document.getElementById('CreditCard')
const cardContainer = document.getElementById('card-container')

// Manage local storage for payment options
function addFacilities() {
  if (localStorage.getItem('firstRadio')) {
      valueContainer?.classList.remove('block');
      valueContainer?.classList.add('hidden');
      localStorage.removeItem('secondRadio');
  } else {
      valueContainer?.classList.add('block');
      valueContainer?.classList.remove('hidden');
  }
}

function addSecondFacilities() {
  if (localStorage.getItem('in-cash')) {
      localStorage.removeItem('credit-card');
  }
}

// Event listeners for payment selection
pickUp?.addEventListener('change', (e) => {
  localStorage.setItem('firstRadio', e.target.checked ? 'true' : '');
  addFacilities();
});

deliveryRadio?.addEventListener('change', (e) => {
  localStorage.setItem('secondRadio', e.target.checked ? 'true' : '');
  localStorage.removeItem('firstRadio');
  addFacilities();
});

inCash?.addEventListener('change', (e) => {
  localStorage.setItem('in-cash', e.target.checked ? 'true' : '');
  addSecondFacilities();
});

CreditCard?.addEventListener('change', (e) => {
  localStorage.setItem('credit-card', e.target.checked ? 'true' : '');
  localStorage.removeItem('in-cash');
  cardContainer.style.display = 'block';
  addSecondFacilities();
});

// Load stored selections
if (localStorage.getItem('firstRadio')) pickUp.checked = true;
if (localStorage.getItem('secondRadio')) deliveryRadio.checked = true;
if (localStorage.getItem('in-cash')) inCash.checked = true;
if (localStorage.getItem('credit-card')) CreditCard.checked = true;
addFacilities();
addSecondFacilities();
const submitedCart = document.getElementById('submitBtn')
// Clear cart after submission
submitedCart?.addEventListener('click', () => {
  localStorage.removeItem('cartProducts');
});

const getProductIds = async (productIds) => {
    if(productIds){
        const response = await fetch('/addUserDetails?id=' + productIds?.join(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        //console.log(response)
        const b = response
        return b
    } else {
        return 'hech narsa yo\'q'
    }
    
}



submitedCart?.addEventListener('click', () => {
    localStorage.removeItem('cartProducts')
    checkOutForm.submit()
})
checkOutForm?.addEventListener('submit', function(e) {
    e.preventDefault()
    const hiddenInput = document.getElementById('idInput')
    hiddenInput.value = (JSON.stringify(cartProducts))
    e.target.submit()
})

//console.log('checkoutForm', checkOutForm)
 // Verify the amount

 let stripe;

 async function createPaymentIntent(card, totalAmount) {
  try {
    console.log('Total Amount:', totalAmount);

    // Send POST request to create a payment intent
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: totalAmount }) // Ensure totalAmount is passed correctly
    });

    // Check if the response is not okay
    if (!response.ok) {
      const errorText = await response.text(); // Read the error message if available
      alert(`Error from server: ${errorText}`); // Log the error text
      throw new Error(`Failed to create payment intent: ${errorText}`);
    }

    // Assuming response contains clientSecret
    const { clientSecret } = await response.json();
    console.log('Client Secret:', clientSecret);

    // Confirm the payment using Stripe's confirmCardPayment method
    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });

    // Return payment result
    return {
      error: paymentResult?.error || null,
      paymentIntent: paymentResult?.paymentIntent || null,
    };
  } catch (error) {
    // Catch all errors and log them for debugging
    console.error(`Error in createPaymentIntent: ${error}` );
    alert(`Error in createPaymentIntent: ${error.message}`);

    // Return a fallback error
    return { error: error || new Error('An unknown error occurred'), paymentIntent: null };
  }
}





async function calculateTotalValue(cartProducts, b) {
  let totalValue = 0;

  try {
    const products = await getProductId(b);
     // Fetch product details from the backend
    for (const element of products) {
      const matchingProduct = cartProducts?.products?.find(item => {
        console.log(item.id, element.id); // Log item and element
        return +item.id === +element.id; // Return the matching condition
      });

      if (matchingProduct && +matchingProduct.quantity >= 1) {
        totalValue += ariphmetica(+element.price, matchingProduct.quantity);
      }
    }
    console.log(totalValue)
    return totalValue;
  } catch (error) {
    console.error('Error calculating total value:', error);
    throw error;
  }
}

(async function () {
  try {
    const totalValue = await calculateTotalValue(cartProducts, b);
    console.log('Total Value:', totalValue);
  } catch (error) {
    console.error('Error calculating total value:', error);
  }
})();

async function initializeStripe() {
  try {
      const response = await fetch('/get-stripe-key');
      const data = await response.json();

      stripe = Stripe(data.publishableKey);
      const elements = stripe.elements();
      const card = elements.create('card');
      card.mount('#card-element');

      card.on('change', (event) => {
          const displayError = document.getElementById('card-errors');
          displayError.textContent = event?.error ? event.error.message : '';
      });

      document.getElementById('proceed_checkout').addEventListener('submit', async (event) => {
          event.preventDefault(); // Prevent default form submission

          if (!validateForm()) return; // ✅ Check if form is valid before proceeding

          if (document.getElementById('CreditCard').checked) {
              try {
                  if (b && b.length) { // Ensure 'b' is defined and not empty
                      const totalValue = await calculateTotalValue(cartProducts, b); // Calculate total dynamically
                      console.log(totalValue);

                      const result = await createPaymentIntent(card, totalValue);
                      if (!result || typeof result !== 'object') {
                          throw new Error('Invalid response from createPaymentIntent');
                      }

                      const { error, paymentIntent } = result;

                      if (error) {
                          alert(`Error: ${error.message}`);
                          document.getElementById('card-errors').textContent = error.message;
                      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                          alert('Payment successful!');
                      } else {
                          alert('Unexpected response from payment processing.');
                      }
                  } else {
                      console.log('Cart is empty.');
                  }
              } catch (error) {
                  alert(`Payment not submitted: ${error.message || 'An unknown error occurred'}`);
                  console.error('Payment processing error:', error);
              }
          } else {
              document.getElementById('proceed_checkout').submit(); // Submit form for non-credit card payments
          }
      });

  } catch (error) {
      console.error('Error initializing Stripe:', error);
  }
}

// ✅ Function to validate form inputs before submission
function validateForm() {
  const requiredFields = ['firstname', 'lastname', 'phone_number', 'country', 'city', 'zip'];
  let isValid = true;

  requiredFields.forEach((field) => {
      const input = document.getElementById(field);
      if (!input || input.value.trim() === '') {
          isValid = false;
          input.classList.add('error'); // Add an error class (for styling)
          alert(`Please fill in the ${field} field.`);
      } else {
          input.classList.remove('error'); // Remove error class if fixed
      }
  });

  return isValid;
}

// Initialize Stripe on page load
initializeStripe();

