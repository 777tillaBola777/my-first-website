
const keyValue = JSON.parse(localStorage.getItem('cartProducts'))
const myIndex = keyValue?.quantity ?? ''
const noSign = document.getElementById('noSign')

const b = []

keyValue?.products.forEach((item, index) => {
    b.push(item.id)
})

const sendButton = document.getElementById("buttonSend")

if(keyValue){
    sendButton?.classList.remove("hidden")
}
    

const productCount = []

keyValue?.products.forEach((item, index) => {
    productCount[item.id] = item.quantity
})
console.log(productCount)

const getProductId = async (productIds) => {
    const response = await fetch('/products/details?ids=' + productIds.join(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    console.log(response)
    const jsonData = await response.json()
    console.log('/products/details?ids=' + jsonData)
    return jsonData
}


const ValueBoxx = document.getElementById('value_box')
const InputBoxx = document.getElementById('input_box')

// Function to create a select box or input field depending on the stored quantity
function makeSelectBox(item) {
    const container = document.createElement('div');
    container.classList.add('cart-item');

    // Retrieve stored quantity from localStorage or default to 1
    let storedQuantity;
    cartProducts?.products?.forEach((product) => {
        if (+product.id === +item.id) {
            storedQuantity = product.quantity || 1;
        }
    });

    const selectBox = document.createElement('select');
    selectBox.classList.add('cart-item-dropdown');
    selectBox.dataset.id = item.id;

    // Add options from 1 to 9
    for (let num = 1; num <= 9; num++) {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        if (storedQuantity === num) option.selected = true;
        selectBox.appendChild(option);
    }

    // Add "9+" option for custom input
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '9+';
    selectBox.appendChild(customOption);

    // Create the custom input field
    const paddingDiv = document.createElement('div');  // Create the padding div
const customInput = document.createElement('input');  // Create the input field
customInput.type = 'number';  // Set the input type to 'number'
customInput.dataset.id = item.id;  // Add the data-id attribute from the item
customInput.min = 10;  // Set the minimum value for the input
customInput.classList.add('input'); 

// Add class 'input' to the custom input
paddingDiv.classList.add('padding');  // Add class 'padding' to the div
paddingDiv.appendChild(customInput)
paddingDiv.appendChild(selectBox)
customInput.style.display = 'none';
  

    // Show input field if stored quantity > 9

    // Append select box and custom input
    

    // Render product details
    const img = document.createElement('img');
    const deleteButton = document.createElement('button');
    deleteButton.dataset.deleteId = item.id;
    deleteButton.innerText = 'X';
    img.setAttribute('src', item.image);
    img.classList = 'pro-style'

    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const li2 = document.createElement('li');
    const li3 = document.createElement('li');
    const li4 = document.createElement('li');
    const li5 = document.createElement('li');
    const li6 = document.createElement('li');
    li.classList = 'none-dot';
    ul.classList = 'border-pro';
    li2.classList = 'none-dot';
    li3.classList = 'none-dot';
    li4.classList = 'none-dot';
    li5.classList = 'none-dot';
    li6.classList = 'none-dot';
    deleteButton.classList = 'delete-product-button';

    li.append('name: ', item.name, ' ');
    li2.append('price: ', item.price, '$ ');
    li4.append('image: ', img, ' ');
    li5.appendChild(paddingDiv);
    li6.append(deleteButton);
    li3.append('description: ', item.description, ' ');
    
    ul.appendChild(li);
    ul.appendChild(li2);
    ul.appendChild(li4);
    ul.appendChild(li5);
    ul.appendChild(li3);
    ul.appendChild(li6);
    ValueBoxx?.appendChild(ul);

    // Delete product logic
    deleteButton.addEventListener('click', (e) => {
        const deleteProductId = e.target.dataset.deleteId;
        cartProducts?.products?.forEach((item, index) => {
            if (+item.id === +deleteProductId) {
                cartProducts?.products.splice(index, 1);
            }
        });
        getTotalValue();
        updateStorage();
        updateCart();
        location.reload()
        if (cartProducts?.quantity === 0) {
            localStorage.removeItem('cartProducts');
        }
    });

    if (storedQuantity > 9) {
        customInput.value = storedQuantity;
        customInput.style.display = 'inline-block';
        paddingDiv.appendChild(customInput)
        li5.append(paddingDiv);
        selectBox.style.display = 'none';
    }

    // Handle select box changes
    selectBox.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
            //li5.append(customInput);
            selectBox.style.display = 'none';
        } else {
            selectBox.style.display = 'inline-block';
            customInput.style.display = 'none';
            updateProductQuantity(e.target.value, item.id);
        }
    });

    // Handle custom input changes
    customInput.addEventListener('blur', (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        localStorage.setItem('true', true)
        
        if (newQuantity && newQuantity >= 10) {
            updateProductQuantity(newQuantity, item.id);
            selectBox.value = 'custom';
        } else {
            selectBox.style.display = 'inline-block';
            customInput.style.display = 'none';
            const options = selectBox.options;
            Array.from(options).forEach((option) => {
                if(+option.value === +newQuantity){
                    updateProductQuantity(newQuantity, item.id);
                    const selectedQuantity =  localStorage.getItem('true')
                    option.selected = selectedQuantity
                    console.log(option)
                }
            });
        }
    });

    //return container;
}

// Update product quantity in localStorage and refresh total
function updateProductQuantity(value, productId) {
    cartProducts.products.forEach((product) => {
        if (+product.id === +productId) {
            product.quantity = +value;
        }
    });
    getTotalValue();
        updateStorage();
        updateCart();
}


const div = document.createElement('div')
const secondItem = document.getElementById('item2')

function getCountProduct(id){
    let count = 0
    cartProducts?.products.forEach((item, index) => {
        if(+item.id === +id){
            count = item.quantity
        }
    })

    return count
}


function makeProduct(item){
    const img = document.createElement('img')
    img.setAttribute('src', item.image)
    img.classList = 'img-product'
    const ul = document.createElement('ul')
    const li = document.createElement('li')
    const li2 = document.createElement('li')
    const li4 = document.createElement('li')
    const li5 = document.createElement('li')
    const li6 = document.createElement('li')
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'totalPrice'
               //input.name = 'ids'
    input.value = item.price
    li.classList = 'none-dot'
    ul.classList = 'padding-left'
    li2.classList = 'none-dot'
    li4.classList = 'none-dot'
    li5.classList = 'none-dot'
    li6.classList = 'none-dot'
    li.append('name: ',item.name, ' ')
    li2.append('price: ',item.price + '$', ' ')
    li2.appendChild(input)
    li4.append('image: ',img, ' ')
    li5.append('count: ',getCountProduct(item.id))
    //li6.append( div)
    ul.appendChild(li)
    ul.appendChild(li2)
    ul.appendChild(li4)
    ul.appendChild(li5)
    ul.appendChild(li6)
    secondItem?.appendChild(ul)
    secondItem?.appendChild(div)
}

//order_details ni 

if(b.length){
    let ab = 0
        const a = getProductId(b)
        
        a.then((data) => {
            data.forEach((item,index) => {
               console.log(item)
                makeSelectBox(item)
                if(noSign !== null){
                    noSign.style.display = 'none'
                }
                makeProduct(item)
                //================================================\\
            })
        })  
} else {
    console.log('yo\'q')
}
