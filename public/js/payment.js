
console.log('hello')
//const keyValue = JSON.parse(localStorage.getItem('cartProducts'))

function calculateTotalCost(cartProducts) {
  let totalCost = 0;

  cartProducts?.products?.forEach((product) => {
    totalCost += product.price * product.quantity;
  });

  return totalCost;
}
// Verify the amount

document.addEventListener('DOMContentLoaded', () => {
    let stripe, elements, cardElement;
  
    // Fetch the Stripe publishable key and initialize Stripe Elements
    fetch('http://localhost:3000/get-stripe-key')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        stripe = Stripe(data.publishableKey);
        elements = stripe.elements();
  
        // Create an instance of the card Element and mount it
        cardElement = elements.create('card');
        const cardContainer = document.getElementById('card-element');
        cardContainer.innerHTML = ''; // Ensure the container is empty
        cardElement.mount(cardContainer);
      })
      .catch(error => console.error('Error fetching Stripe key:', error));
  
    // Toggle card input visibility based on selected payment type
    document.querySelectorAll('input[name="payment_type"]').forEach(radio => {
      radio.addEventListener('change', (event) => {
        const cardContainer = document.getElementById('card-container');
        cardContainer.style.display = event.target.value === 'Credit-card' ? 'block' : 'none';
      });
    });
  
    // Handle form submission
    document.getElementById('proceed_checkout').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // If payment type is Credit Card, handle Stripe payment
      if (document.getElementById('CreditCard').checked) {
        const { paymentIntent, error } = await createPaymentIntent();
        console.log(paymentIntent)
        if (error) {
          console.error('Error creating Payment Intent:', error);
          return;
        }
  
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: document.querySelector('input[name="firstname"]').value,
            },
          },
        });
        console.log(confirmError)
  
        if (confirmError) {
          document.getElementById('card-errors').textContent = confirmError.message;
        } else {
          // Handle success: proceed with order submission
          alert('Payment successful!');
          event.target.submit();  // Submit form normally if payment succeeded
        }
      } else {
        // For non-credit card payments, submit the form directly
        event.target.submit();
      }
    });
  });
  const getProductId = async (productIds) => {
    // Build the URL with the product IDs
    const url = '/products/details?ids=' + productIds.join();
    console.log('Request URL:', url);  // Log the URL being called
    
    // Fetch data from the API
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    // Log the full response object
    console.log('Response:', response);
    
    // Try to parse the response as JSON
    try {
        const jsonData = await response.json();
        console.log('Response Data:', jsonData);  // Log the parsed JSON data
        return jsonData;  // Return the parsed data
    } catch (error) {
        console.error('Error parsing response as JSON:', error);
        throw new Error('Failed to parse response as JSON');
    }
}


  async function createPaymentIntent() {
    try {
      let totalValue = 0;
  
      // Fetch product details based on cart product IDs
      const data = await getProductId(b); // Assume `b` contains the array of product IDs
      console.log(data)
      // Calculate the total value
      for (const element of data) {
        const matchingProduct = cartProducts.products.find(item => item.id === element.id);
        if (matchingProduct && +element.quantity >= 1) {
          totalValue += ariphmetica(+element.price, matchingProduct.quantity);
        }
      }
  
      console.log("Total Value:", totalValue);
  
      // Send the dynamically calculated amount to the backend
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: +totalValue * 100 }), // Stripe expects amount in cents
        credentials: 'include', // Include cookies if needed
      });
  
      if (!response.ok) {
        throw new Error('Request failed');
      }
  
      const data1 = await response.json();
      console.log('PaymentIntent Client Secret:', data1.clientSecret);
  
      return data1.clientSecret; // Return the client secret if needed
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  
  
 
  
  
  
  