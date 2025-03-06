const cart = {};

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (!button.hasAttribute("onclick")) {
      const productId = button.getAttribute("data-product-id");
      const price = parseFloat(button.getAttribute("data-price"));
      const productElement = button.closest('.product');
      const productImage = productElement.querySelector('img').src;
      const productName = productId;
      
      showSweetAlert(productId, productName, productImage, price);
    }
  });
});

function showSweetAlert(productId, productName, productImage, price) {
  Swal.fire({
    title: productName,
    html: `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${productImage}" style="max-width: 150px; border-radius: 8px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="swal-quantity" style="display: block; text-align: left; margin-bottom: 5px;">จำนวน:</label>
        <input id="swal-quantity" type="number" class="swal2-input" value="1" min="1" max="10">
      </div>
      <div>
        <label for="swal-instructions" style="display: block; text-align: left; margin-bottom: 5px;">คำอธิบายของอาหาร (optional):</label>
        <textarea id="swal-instructions" class="swal2-textarea" placeholder="ไม่เอาผัก,เพิ่มซอส,อื่นๆ..."></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Add to Cart',
    confirmButtonColor: '#561C24',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: () => {
      const quantity = parseInt(document.getElementById('swal-quantity').value) || 1;
      const instructions = document.getElementById('swal-instructions').value;
      
      return { quantity, instructions };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { quantity, instructions } = result.value;
      
      // For spice level products
      if (isSpiceLevelProduct(productId)) {
        const productElement = document.querySelector(`[data-product-id="${productId}"]`).closest('.product');
        const selectedSpice = productElement.querySelector('input[name^="spice-"]:checked');
        const spiceLevel = selectedSpice ? selectedSpice.value : "No Spice";
        
        const fullProductName = `${productId} (${spiceLevel})`;
        
        addToCartWithQuantity(fullProductName, price, quantity, instructions);
      } else {
        addToCartWithQuantity(productId, price, quantity, instructions);
      }
    }
  });
}

function isSpiceLevelProduct(productId) {
  // Check if the product has spice options
  const productElement = document.querySelector(`[data-product-id="${productId}"]`).closest('.product');
  return productElement.querySelector('input[name^="spice-"]') !== null;
}

function addToCartWithQuantity(productId, price, quantity, instructions) {
  if (!cart[productId]) {
    cart[productId] = { 
      quantity: quantity, 
      price: price,
      description: instructions || ""
    };
  } else {
    cart[productId].quantity += quantity;
    if (instructions) {
      cart[productId].description = instructions;
    }
  }
  updateCartDisplay();
  
  // Show confirmation toast
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: 'Added to cart!',
    showConfirmButton: false,
    timer: 1500,
    toast: true
  });
}

function addToCartWithSpiceLevel(button) {
  const productId = button.getAttribute("data-product-id");
  const price = parseFloat(button.getAttribute("data-price"));
  const productElement = button.closest('.product');
  const productImage = productElement.querySelector('img').src;
  
  showSweetAlert(productId, productId, productImage, price);
}

function increaseQuantity(productId) {
  if (cart[productId]) {
    cart[productId].quantity++;
    updateCartDisplay();
  }
}

function decreaseQuantity(productId) {
  if (cart[productId]) {
    cart[productId].quantity--;
    if (cart[productId].quantity <= 0) {
      delete cart[productId];
    }
    updateCartDisplay();
  }
}

function updateDescription(productId) {
  if (cart[productId]) {
    Swal.fire({
      title: 'คำอธิบายของอาหาร',
      input: 'textarea',
      inputLabel: 'Update คำอธิบายของอาหาร:',
      inputValue: cart[productId].description || '',
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#561C24'
    }).then((result) => {
      if (result.isConfirmed) {
        cart[productId].description = result.value;
        updateCartDisplay();
      }
    });
  }
}

function updateCartDisplay() {
  const cartElement = document.getElementById("cart");
  cartElement.innerHTML = "";

  let totalPrice = 0;

  const table = document.createElement("table");
  table.classList.add("table", "table-striped");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = ["Product", "Quantity", "Price", "Total", "Actions"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (const productId in cart) {
    const item = cart[productId];
    const itemTotalPrice = item.quantity * item.price;
    totalPrice += itemTotalPrice;

    const tr = document.createElement("tr");

    const productNameCell = document.createElement("td");
    const productNameDiv = document.createElement("div");
    productNameDiv.textContent = productId;
    
    // Add description if exists
    if (item.description) {
      const descriptionDiv = document.createElement("div");
      descriptionDiv.className = "order-description";
      descriptionDiv.textContent = item.description;
      descriptionDiv.style.fontSize = "0.85em";
      descriptionDiv.style.fontStyle = "italic";
      descriptionDiv.style.color = "#666";
      descriptionDiv.style.marginTop = "4px";
      
      const editIcon = document.createElement("i");
      editIcon.className = "fas fa-pencil-alt";
      editIcon.style.marginLeft = "5px";
      editIcon.style.cursor = "pointer";
      editIcon.style.color = "#999";
      editIcon.title = "Edit instructions";
      editIcon.onclick = function(e) {
        e.stopPropagation();
        updateDescription(productId);
      };
      
      descriptionDiv.appendChild(editIcon);
      productNameDiv.appendChild(descriptionDiv);
    } else {
      // Add "Add description" link if no description
      const addDescLink = document.createElement("a");
      addDescLink.href = "#";
      addDescLink.textContent = "เพิ่มคําอธิบาย";
      addDescLink.style.fontSize = "0.85em";
      addDescLink.style.color = "#999";
      addDescLink.style.display = "block";
      addDescLink.style.marginTop = "4px";
      addDescLink.onclick = function(e) {
        e.preventDefault();
        updateDescription(productId);
      };
      productNameDiv.appendChild(addDescLink);
    }
    
    productNameCell.appendChild(productNameDiv);
    tr.appendChild(productNameCell);

    const quantityCell = document.createElement("td");
    const quantityControls = document.createElement("div");
    quantityControls.className = "quantity-controls";
    quantityControls.style.display = "flex";
    quantityControls.style.alignItems = "center";

    const decreaseBtn = document.createElement("button");
    decreaseBtn.className = "btn btn-sm";
    decreaseBtn.style.backgroundColor = "#f8f9fa";
    decreaseBtn.style.border = "1px solid #ddd";
    decreaseBtn.style.width = "25px";
    decreaseBtn.style.height = "25px";
    decreaseBtn.style.padding = "0";
    decreaseBtn.style.display = "flex";
    decreaseBtn.style.alignItems = "center";
    decreaseBtn.style.justifyContent = "center";
    decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
    decreaseBtn.onclick = function() { decreaseQuantity(productId); };
    
    const quantityText = document.createElement("span");
    quantityText.textContent = item.quantity;
    quantityText.style.margin = "0 8px";
    
    const increaseBtn = document.createElement("button");
    increaseBtn.className = "btn btn-sm";
    increaseBtn.style.backgroundColor = "#f8f9fa";
    increaseBtn.style.border = "1px solid #ddd";
    increaseBtn.style.width = "25px";
    increaseBtn.style.height = "25px";
    increaseBtn.style.padding = "0";
    increaseBtn.style.display = "flex";
    increaseBtn.style.alignItems = "center";
    increaseBtn.style.justifyContent = "center";
    increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
    increaseBtn.onclick = function() { increaseQuantity(productId); };
    
    quantityControls.appendChild(decreaseBtn);
    quantityControls.appendChild(quantityText);
    quantityControls.appendChild(increaseBtn);
    
    quantityCell.appendChild(quantityControls);
    tr.appendChild(quantityCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = `$${item.price}`;
    tr.appendChild(priceCell);

    const totalCell = document.createElement("td");
    totalCell.textContent = `$${itemTotalPrice}`;
    tr.appendChild(totalCell);

    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.classList.add("btn", "btn-danger", "delete-product");
    deleteButton.setAttribute("data-product-id", productId);
    deleteButton.addEventListener("click", () => {
      delete cart[productId];
      updateCartDisplay();
    });
    actionsCell.appendChild(deleteButton);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  cartElement.appendChild(table);

  if (Object.keys(cart).length === 0) {
    cartElement.innerHTML = "<p>ยังไม่มีสินค้าในตะกร้า.</p>";
  } else {
    const totalPriceElement = document.createElement("p");
    totalPriceElement.textContent = `Total Price: $${totalPrice}`;
    cartElement.appendChild(totalPriceElement);
  }
}

document.getElementById("printCart").addEventListener("click", () => {
  printReceipt("Thank you!", generateCartReceipt());
});

function printReceipt(title, content) {
  const printWindow = window.open("1", "_blank");
  printWindow.document.write(
    `<html><head><title>${title}</title></head><body>${content}</body></html>`
  );
  printWindow.document.close();
  printWindow.print();
}

function generateCartReceipt() {
  let receiptContent = `
      <style>
        @page {
          size: 100mm 100mm;
        }
        body {
          width: 100mm;
          height: 100mm;
          margin: 0;
          padding: 1px;
          font-family: Arial, sans-serif;
        }
        h2 {
          text-align: center;
          margin-bottom: 10px;
          color: #561C24;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 5px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .order-description {
          font-size: 0.85em;
          font-style: italic;
          color: #666;
          margin-top: 3px;
        }
        @font-face {
          font-family: 'MN Tonkatsu';
          src: url('assets/font/MeawnumDemo.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'MN Tonkatsu';
          src: url('assets/font/MeawnumDemo.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'MN Tonkatsu';
          src: url('assets/font/MeawnumDemo.ttf') format('truetype');
          font-weight: normal;
          font-style: italic;
          font-display: swap;
        }

        * {
          font-family: 'MN Tonkatsu', 'Poppins', sans-serif;
        }

        .thai-text {
          font-family: 'MN Tonkatsu', sans-serif;
        }
      </style>
      <p style="text-align: center; font-size: 18px; font-weight: bold; color: #561C24;">KATSUYA</p>
      <h2>Order Receipt</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

  let totalPrice = 0;

  for (const productId in cart) {
    const item = cart[productId];
    const itemTotalPrice = item.quantity * item.price;

    receiptContent += `
        <tr>
          <td>
            ${productId}
            ${item.description ? `<div class="order-description">${item.description}</div>` : ''}
          </td>
          <td>${item.quantity}</td>
          <td>$${item.price}</td>
          <td>$${itemTotalPrice}</td>
        </tr>`;

    totalPrice += itemTotalPrice;
  }

  receiptContent += `
        </tbody>
      </table>
      <p>Total Price: $${totalPrice}</p>
      <p style="text-align: center; margin-top: 20px;">Thank you for your order!</p>
      `;

  return receiptContent;
}