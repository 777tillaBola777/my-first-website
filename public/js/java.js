// Logging and DOM selection
console.log('hello');
const deleteProduct = document.getElementsByClassName('delete-button');
const deleteType = document.getElementsByClassName('delete-type-btn');
const deleteFieldBtn = document.getElementsByClassName("deleteBtn")
const deleteBrand = document.getElementsByClassName('delete-brand-btn');
const addProductCart = document.getElementsByClassName('add_product_to_cart');
const indicator = document.getElementById('indicator');
const amount = document.getElementById('quantity');
const add_product_field = document.getElementById('add_product_field');
const searchForm = document.getElementById("search_form");
const list = document.getElementById("list1");
const grid = document.getElementById("list2");
const Container = document.getElementById("container");
const productsContainer = document.getElementById("products-container");
const sortBy = document.getElementById("products_sort_by");
const sortsBy = document.getElementById("valuable");

// Cart management functions
function loadCartProducts() {
    return JSON.parse(localStorage.getItem("cartProducts")) ?? { quantity: 0, products: [] };
}

const cartProducts = loadCartProducts();
console.log(cartProducts);

function updateCart() {
    const quantity = cartProducts.quantity || 0;
    if (quantity) {
        amount.innerHTML = quantity;
        indicator.style.display = "block";
    }
}

function updateStorage() {
    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
}

function getTotalValue() {
    cartProducts.quantity = cartProducts.products.reduce((total, item) => total + +item.quantity, 0);
    updateStorage()
}

function addProductToCart(productId) {
    const existingProduct = cartProducts.products.find(item => +item.id === +productId);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cartProducts.products.push({ quantity: 1, id: productId });
    }
    getTotalValue();
    updateStorage();
    updateCart();
}

document.body.onload = updateCart;

Array.from(addProductCart).forEach((addBtn) => {
    addBtn.addEventListener('click', (e) => {
        addProductToCart(e.target.dataset.productid);
    });
});

// Delete item functions
async function removeItem(url) {
    const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    return response.json();
}

Array.from(deleteType).forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("Do you want to delete type?")) {
            const result = await removeItem(`/admin/types/${e.target.dataset.typeid}`);
            if (result.status === "OK") window.location.reload();
        }
    });
});

Array.from(deleteProduct).forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("Do you want to delete product?")) {
            const result = await removeItem(`/admin/products/${e.target.dataset.productid}`);
            if (result.status === "OK") window.location.reload();
        }
    });
});

Array.from(deleteBrand).forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("Do you want to delete brand?")) {
            const result = await removeItem(`/admin/brands/${e.target.dataset.brandid}`);
            if (result.status === "OK") window.location.reload();
        }
    });
});

// Add dynamic form fields
add_product_field?.addEventListener("click", (e) => {
    const parent = e.target.parentNode;
    const inputFieldId = document.createElement("input");
    const inputFieldName = document.createElement("input");
    const inputFieldValue = document.createElement("input");
    const br = document.createElement("br");
    const deleteButton = document.createElement("button");

    inputFieldId.name = "field_id";
    inputFieldId.type = "hidden";
    inputFieldName.name = "field_name";
    inputFieldValue.name = "field_value";
    
    deleteButton.innerText = "X";
    deleteButton.type = "button";
    deleteButton.addEventListener("click", (e) => {
      console.log("hello");
        inputFieldName.remove();
        inputFieldValue.remove();
        inputFieldId.remove();
        br.remove();
        e.target.remove();
        console.log("hello");
    });

    parent.append(br, inputFieldId, inputFieldName, inputFieldValue, deleteButton);
});



// Toggle between list and grid views
list?.addEventListener("click", () => {
    grid.style.background = "none";
    list.style.background = "red";
    localStorage.setItem("showAs", "list");
    Container.classList.add("container");
    productsContainer.classList.remove("products-container");
    productsContainer.classList.add("list-container");
});

grid?.addEventListener("click", () => {
    list.style.background = "none";
    grid.style.background = "red";
    localStorage.setItem("showAs", "grid");
    Container.classList.add("container");
    productsContainer.classList.remove("list-container");
    productsContainer.classList.add("products-container");
});

if (list) {
    const showAs = localStorage.getItem("showAs") || "list";
    if (showAs === "list") list.click();
    else grid.click();
}

const input = document.getElementById('searched_value');
const clearBtn = document.getElementById('clear-btn');
console.log(clearBtn)
// Show clear button only when there's input text
input?.addEventListener('input', () => {
  clearBtn.style.display = input.value ? 'inline' : 'none';
});
input?.addEventListener('blur', () => {
    clearBtn.style.display = input.value ? 'inline' : 'none';
  });

// Clear the input field when the clear button is clicked
clearBtn?.addEventListener('click', () => {
  input.value = '';
  clearBtn.style.display = 'none';
});

// Sort and search functionality
sortBy?.addEventListener("change", (e) => {
    const selectBox = e.target;
    const selectedValue = selectBox.options[selectBox.selectedIndex].value;

    sortsBy.value = selectedValue;
    searchForm.submit();
});

const removeAddress = async (addressId) => {
    const response = await fetch("/about-address/" + addressId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return response.json();
  };
  
  const deleteAddress = document.getElementsByClassName("delete_address")
  
  console.log(deleteAddress)
  
  for (btn of deleteAddress) {
    console.log(btn)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!confirm(`Do you want to delete address?`)) {
        return;
      }
  
      console.log(e.target.dataset.addressid);
      removeAddress(e.target.dataset.addressid).then((data) => {
        console.log(data)
        if (data.status === "OK") {
          console.log(data.status)
          window.location.reload();
        }
      });
    });
  }


const sendForm = document.getElementById("sendForm");
const selectBox = document.getElementById("selectBoxSend");

selectBox?.addEventListener("change", (e) => {
    sendForm.submit();
});

const checkBox = document.getElementsByClassName("checkBox");

let val = 0;

for(pushBtn of checkBox){
    pushBtn?.addEventListener('blur', (e) => {
        setTimeout(function(){
            sendForm.submit()
        }, 3000)
    })
}

const cleanButton = document.getElementById("cleanBut");
const mainCleanButton = document.getElementById("cleanButton");

const costInput1 = document.getElementById("price1");
const costInput2 = document.getElementById("price2");
console.log(checkBox);

cleanButton?.addEventListener('click', (e) => {
    selectBox.value = ""
    costInput1.value = "";
    costInput2.value = "";
    for (pushBtn of checkBox) {
      pushBtn.checked = false;
    }

    sendForm.submit();
})

mainCleanButton?.addEventListener('click', (e) => {
  selectBox.value = "";
  localStorage.removeItem("price1");
  localStorage.removeItem("price2");

  costInput1.value = "";
  costInput2.value = "";
  for (pushBtn of checkBox) {
    pushBtn.checked = false;
  }

  sendForm.submit();
})

let canSubmitFilter = true;

function costFilterFocusHandler() {
    canSubmitFilter = false
}

function costFilterBlurHandler() {
    canSubmitFilter = true

    setTimeout(() => {
        if(canSubmitFilter){
            sendForm.submit()
        }
    }, 1000)
}

costInput1?.addEventListener("focus", costFilterFocusHandler);
costInput2?.addEventListener("focus", costFilterFocusHandler);
costInput1?.addEventListener("blur", costFilterBlurHandler);
costInput2?.addEventListener("blur", costFilterBlurHandler);

const resetCostInput = document.getElementById("resetBtn");
const resetBrandInput = document.getElementById("resetBrandBtn");


resetCostInput?.addEventListener("click", (e) => {
  localStorage.removeItem("price1");
  localStorage.removeItem("price2");
  costInput1.value = "";
  costInput2.value = "";
  sendForm.submit();
});

resetBrandInput?.addEventListener("click", (e) => {
  for (pushBtn of checkBox) {
    pushBtn.checked = false;
  }
  sendForm.submit();
});

const makeBigger = document.getElementById("makeBigger");
const productDiv = document.getElementById("productDiv");
const filterDiv = document.getElementById("filterDiv");
const backBtn = document.getElementById("backBtn");

makeBigger?.addEventListener("click", (e) => {
  productDiv.classList.remove("product-div");
  productDiv.classList.add("filtre");
  filterDiv.classList.remove("filtre");
});
  
backBtn?.addEventListener("click", (e) => {
  productDiv.classList.remove("filtre");
  productDiv.classList.add("product-div");
  filterDiv.classList.add("filtre");
});

const addIndexBtn = document?.getElementById("addIndexBtn");

async function getProducts(number, address) {
    let newSelectBoxValue = selectBox?.value.split(" ")
    const modifiedValue = newSelectBoxValue.join("+");

    let fetchValue = address + "/details" + "?change_by_something=" + modifiedValue 
  + "&price1=" + costInput1.value + "&price2=" + costInput2.value + "&index_number=" + number;
  console.log(fetchValue)
  for (pushBtn of checkBox) {
    if (pushBtn.checked) { // Only append checked values
        fetchValue += "&brands=" + pushBtn.value;
    }
}
    
    const response = await fetch(fetchValue, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      
      const b = await response.json();
      return b;
}
  
const typePlace = document.getElementById("types");
const brandPlace = document.getElementById("brands");

const usedValue = document.getElementById("usedValue");

let used = -5

used += +usedValue?.value

if (used <= 0) {
    addIndexBtn.style.display = "none";
}

let number = 0
let allValue = 0

const parentDiv = document.getElementById('productDiv')

addIndexBtn?.addEventListener('click', async (e) => {
    number += 5

    const address = e.target.dataset.address

    const newFunction = await getProducts(number, address)

    allValue = +used - number;
    console.log(used, number);

  if (+used <= number) {
    e.target.style.display = "none";
    //console.log('yoq', allValue ,number)
  }

  newFunction.forEach(async (item, index) => {
    //typePlace.appendChild(typeDiv)
    //brandPlace.appendChild(brandDiv)
    const mainDiv = document.createElement("div");
    mainDiv.classList = "item";
    mainDiv.style = "position: relative;";
    const brandInput = document.createElement("input");
    brandInput.type = "hidden";
    brandInput.name = "brands";
    brandInput.value = item.brand_id;
    
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");
    const div4 = document.createElement("div");
    const div5 = document.createElement("div");
    const featured = document.createElement("div");
    featured.classList = "featured";
    const addButton = document.createElement("button");
addButton.classList = "add_productTo_cart";
addButton.setAttribute("width", "24");
addButton.setAttribute("height", "24");
addButton.type = "button";
addButton.dataset.productid = item.id;

addButton.addEventListener('click', (e) => {
  addProductToCart(e.target.dataset.productid)
})


    const img = document.createElement("img");
    const ahref = document.createElement("a");
    const ahrefimg = document.createElement("a");
    ahref.setAttribute("href", "/about-item/" + item.id);
    ahrefimg.setAttribute("href", "/about-item/" + item.id);
    ahref.classList = "a-href";
    ahref.append(item.name);
    img.classList = "pro-style";
    img.setAttribute("src", item.image);
    ahrefimg.append(img);
    div1.appendChild(ahref);
    div2.append(ahrefimg);
    div3.append(item.price);
    div4.append(item.description);
    
    mainDiv.appendChild(div1);
    mainDiv.appendChild(div2);
    mainDiv.appendChild(div3);
    mainDiv.appendChild(div4);
    mainDiv.appendChild(addButton)
    mainDiv.appendChild(brandInput);
    if (item?.featured?.length > 0) {
      featured.append(item?.featured);
      div5.append(featured);
      mainDiv.appendChild(div5);
    }
    parentDiv.appendChild(mainDiv);
  });
  e.target.value = number;
})



for (deleteFields of deleteFieldBtn) {
  //console.log(deleteField)
  deleteFields?.addEventListener("click", (e) => {
    e.preventDefault();
    const parentElement = e.target.parentNode;
    parentElement.remove();
    e.target.remove();

    /*if (!confirm('Do you want to delete field?')) {
            return
        }

        if(e.target.dataset.fieldid){
            console.log(e.target.dataset.fieldid)
            removeField(e.target.dataset.fieldid)
                .then((data) => {
                    if (data.status === 'OK') {
                        window.location.reload()
                    }
            })
        }*/
  });
}