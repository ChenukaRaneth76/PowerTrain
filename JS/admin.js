// Simple notification function
function showNotification(message, type = "success") {
  console.log(`[${type.toUpperCase()}] ${message}`);

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    background: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"
    };
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

// Check if admin is logged in
const auth = JSON.parse(localStorage.getItem("auth") || "{}");
if (!auth.role || auth.role !== "admin") {
  window.location.href = "index.html";
}

// Global functions for HTML onclick handlers
window.editProduct = async function (type, id) {
  try {
    const response = await fetch(
      `backend/admin/products.php?action=get&type=${type}&id=${id}`
    );
    const data = await response.json();

    if (data.status === "success") {
      openProductModal(type, data.product);
    } else {
      showNotification("Error loading product: " + data.message, "error");
    }
  } catch (error) {
    console.error("Edit product error:", error);
    showNotification("Error loading product", "error");
  }
};

window.deleteProduct = async function (type, id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(
      `backend/admin/products.php?action=delete&type=${type}&id=${id}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loadProducts(type);
      showNotification("Product deleted successfully!", "success");
    } else {
      showNotification("Error deleting product: " + data.message, "error");
    }
  } catch (error) {
    console.error("Delete product error:", error);
    showNotification("Error deleting product", "error");
  }
};

// DOM Elements - with null checks
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("pageTitle");
const logoutBtn = document.getElementById("logoutBtn");

// Product Modal Elements - with null checks
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

// Check if essential elements exist
if (!productModal || !productForm) {
  console.error(
    "Essential admin elements missing. Check if admin.html is loaded correctly."
  );
}

// Training Modal Elements
const trainingModal = document.getElementById("trainingModal");
const trainingForm = document.getElementById("trainingForm");
const addTrainingBtn = document.getElementById("addTrainingBtn");

// Order Modal Elements
const orderModal = document.getElementById("orderModal");

// Mobile menu toggle
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// Navigation
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.dataset.section;

    // Update active states
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Show section
    sections.forEach((s) => s.classList.remove("active"));
    document.getElementById(section).classList.add("active");

    // Update page title
    pageTitle.textContent = link.querySelector("span").textContent;

    // Load section data
    loadSectionData(section);

    // Close mobile menu
    sidebar.classList.remove("active");
  });
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("auth");
  window.location.href = "index.html";
});

// Modal handlers
function openModal(modal) {
  modal.classList.add("active");
}

function closeModal(modal) {
  modal.classList.remove("active");
}

// Close modal on background click
[productModal, trainingModal, orderModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal(modal));
  }
});

// Add Product Buttons - Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const addClothingBtn = document.getElementById("addClothingBtn");
  const addEquipmentBtn = document.getElementById("addEquipmentBtn");

  if (addClothingBtn) {
    addClothingBtn.addEventListener("click", () => {
      console.log("Add clothing clicked");
      openProductModal("clothing");
    });
  }

  if (addEquipmentBtn) {
    addEquipmentBtn.addEventListener("click", () => {
      console.log("Add equipment clicked");
      openProductModal("equipment");
    });
  }
});

// Show/hide form fields based on product type
document.addEventListener("DOMContentLoaded", function () {
  const productType = document.getElementById("productType");
  if (productType) {
    productType.addEventListener("change", function () {
      const type = this.value;
      const materialGroup = document.getElementById("materialGroup");
      const sizeGroup = document.getElementById("sizeGroup");
      const colorGroup = document.getElementById("colorGroup");
      const sizeStockGroup = document.getElementById("sizeStockGroup");

      if (type === "clothing") {
        if (materialGroup) materialGroup.style.display = "none";
        if (sizeGroup) sizeGroup.style.display = "block";
        if (colorGroup) colorGroup.style.display = "block";
        if (sizeStockGroup) sizeStockGroup.style.display = "block";
      } else {
        if (materialGroup) materialGroup.style.display = "block";
        if (sizeGroup) sizeGroup.style.display = "none";
        if (colorGroup) colorGroup.style.display = "none";
        if (sizeStockGroup) sizeStockGroup.style.display = "none";
      }
    });
  }
});

// Initialize image upload previews
document.addEventListener("DOMContentLoaded", function () {
  for (let i = 1; i <= 6; i++) {
    const input = document.getElementById(`productImage${i}`);
    if (input) {
      input.addEventListener("change", function (e) {
        handleImagePreview(e, i);
      });
    }
  }
});

// Handle image preview
function handleImagePreview(event, imageNumber) {
  const file = event.target.files[0];
  const preview = document.getElementById(`preview${imageNumber}`);
  const img = preview.querySelector("img");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

// Remove image
function removeImage(imageNumber) {
  const input = document.getElementById(`productImage${imageNumber}`);
  const preview = document.getElementById(`preview${imageNumber}`);

  input.value = "";
  preview.style.display = "none";
}

function openProductModal(type, productData = null) {
  const modalTitle = document.getElementById("modalTitle");
  const productType = document.getElementById("productType");
  const categorySelect = document.getElementById("productCategory");
  const materialGroup = document.getElementById("materialGroup");
  const sizeGroup = document.getElementById("sizeGroup");
  const colorGroup = document.getElementById("colorGroup");
  const sizeStockGroup = document.getElementById("sizeStockGroup");

  // Check if required elements exist
  if (!modalTitle || !productType || !categorySelect) {
    console.error("Required modal elements not found");
    return;
  }

  productType.value = type;

  // Reset form
  productForm.reset();

  // Reset all image previews
  for (let i = 1; i <= 6; i++) {
    const preview = document.getElementById(`preview${i}`);
    if (preview) {
      preview.style.display = "none";
    }
  }

  // Set categories based on type
  if (type === "clothing") {
    modalTitle.textContent = productData
      ? "Edit Clothing Product"
      : "Add Clothing Product";
    categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <option value="tshirt">T-Shirt</option>
            <option value="shorts">Shorts</option>
            <option value="hoodie">Hoodie</option>
            <option value="joggers">Joggers</option>
            <option value="tank">Tank Top</option>
        `;
    if (materialGroup) materialGroup.style.display = "none";
    if (sizeGroup) sizeGroup.style.display = "block";
    if (colorGroup) colorGroup.style.display = "block";
    if (sizeStockGroup) sizeStockGroup.style.display = "block";
  } else {
    modalTitle.textContent = productData
      ? "Edit Equipment Product"
      : "Add Equipment Product";
    categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <option value="weights">Weights</option>
            <option value="resistance">Resistance Bands</option>
            <option value="mat">Exercise Mats</option>
            <option value="gym equipments">Gym Equipments</option>
            <option value="Parallettes">Parallettes</option>
            <option value="pull-up bar">Pull-Up Bars</option>
            <option value="dip-bars">Dip-Bars</option>
            <option value="dip belt">Dip Belt</option>
            <option value="protective gear">Protective Gear</option>
        `;
    if (materialGroup) materialGroup.style.display = "block";
    if (sizeGroup) sizeGroup.style.display = "none";
    if (colorGroup) colorGroup.style.display = "none";
    if (sizeStockGroup) sizeStockGroup.style.display = "none";
  }

  // Fill form if editing
  if (productData) {
    document.getElementById("productId").value = productData.id;
    document.getElementById("productName").value = productData.name;
    document.getElementById("productCategory").value = productData.category;
    document.getElementById("productPrice").value = productData.price;
    document.getElementById("productDescription").value =
      productData.description || "";
    document.getElementById("productStatus").value =
      productData.status || "normal";

    if (type === "equipment") {
      document.getElementById("productStock").value = productData.stock;
      if (productData.material) {
        document.getElementById("productMaterial").value = productData.material;
      }
    } else if (type === "clothing") {
      if (productData.sizes) {
        document.getElementById("productSizes").value = productData.sizes;
      }
      if (productData.colors) {
        document.getElementById("productColors").value = productData.colors;
      }

      // Load size-based stock if available
      if (productData.size_stock) {
        const sizes = ["S", "M", "L", "XL", "XXL"];
        sizes.forEach((size) => {
          const stockInput = document.getElementById(`stock${size}`);
          if (stockInput && productData.size_stock[size]) {
            stockInput.value = productData.size_stock[size];
          }
        });
      }
    }

    // Load existing images if available
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((imageUrl, index) => {
        if (index < 6 && imageUrl) {
          const preview = document.getElementById(`preview${index + 1}`);
          const img = preview.querySelector("img");
          if (img) {
            img.src = imageUrl;
            preview.style.display = "block";
          }
        }
      });
    }
  }

  openModal(productModal);
}

// Product Form Submit
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  console.log('=== FORM SUBMISSION STARTED ===');
  console.log('Form data:', {
    type: document.getElementById('productType').value,
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value
  });

  // Upload multiple images
  const imagePaths = {};
  let hasMainImage = false;

  for (let i = 1; i <= 6; i++) {
    const imageInput = document.getElementById(`productImage${i}`);
    const imageFile = imageInput ? imageInput.files[0] : null;

    if (imageFile) {
      if (i === 1) hasMainImage = true;

      console.log(`Uploading image ${i}:`, {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        sizeInMB: (imageFile.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      showNotification(`Uploading image ${i}... (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)`, "info");

      const uploadFormData = new FormData();
      uploadFormData.append("image", imageFile);
      
      // Log FormData contents
      console.log('FormData contents:', Array.from(uploadFormData.entries()));

      try {
        const uploadResponse = await fetch("backend/admin/upload_image.php", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`HTTP error! status: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log(`Upload result for image ${i}:`, uploadResult);

        if (uploadResult.status === "success") {
          imagePaths[`image${i}`] = uploadResult.path;
          showNotification(`Image ${i} uploaded successfully!`, "success");
        } else {
          console.error(`Upload failed for image ${i}:`, uploadResult);
          const errorMsg = uploadResult.message + 
            (uploadResult.current_limit ? ` (Server limit: ${uploadResult.current_limit})` : '');
          showNotification(
            `Error uploading image ${i}: ` + errorMsg,
            "error"
          );
          return;
        }
      } catch (error) {
        console.error("Upload error for image " + i + ":", error);
        showNotification(
          `Network error uploading image ${i}: ` + error.message + ". Check console for details.",
          "error"
        );
        return;
      }
    } else {
      console.log(`No file selected for image ${i}`);
    }
  }
  
  console.log('All images uploaded. Paths:', imagePaths);

  // Check if main image is provided for new products
  if (!hasMainImage && !document.getElementById("productId").value) {
    showNotification(
      "Please select at least the main image for the product",
      "error"
    );
    return;
  }

  const formData = {
    id: document.getElementById("productId").value,
    type: document.getElementById("productType").value,
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    price: document.getElementById("productPrice").value,
    description: document.getElementById("productDescription").value,
    status: document.getElementById("productStatus").value,
    ...imagePaths, // Spread the image paths
  };

  if (formData.type === "equipment") {
    formData.material = document.getElementById("productMaterial").value;
    formData.stock = document.getElementById("productStock").value;
  } else {
    // For clothing, handle sizes, colors, and size-based stock
    formData.sizes = document.getElementById("productSizes").value;
    formData.colors = document.getElementById("productColors").value;

    // Collect size-based stock
    const sizeStock = {};
    const sizes = ["S", "M", "L", "XL", "XXL"];
    sizes.forEach((size) => {
      const stockInput = document.getElementById(`stock${size}`);
      if (stockInput && stockInput.value) {
        sizeStock[size] = parseInt(stockInput.value);
      }
    });
    formData.sizeStock = sizeStock;
  }

  try {
    const endpoint = formData.id ? "update" : "create";
    const response = await fetch(
      `backend/admin/products.php?action=${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      closeModal(productModal);
      loadSectionData(formData.type);
      showNotification("Product saved successfully!", "success");
    } else {
      showNotification("Error saving product: " + result.message, "error");
    }
  } catch (error) {
    showNotification("Error saving product", "error");
  }
});

// Training Session
addTrainingBtn.addEventListener("click", () => {
  openTrainingModal();
});

function openTrainingModal(sessionData = null) {
  const modalTitle = document.getElementById("trainingModalTitle");
  trainingForm.reset();

  if (sessionData) {
    modalTitle.textContent = "Edit Training Session";
    document.getElementById("trainingId").value = sessionData.id;
    document.getElementById("trainingName").value = sessionData.name;
    document.getElementById("trainingTrainer").value = sessionData.trainer;
    document.getElementById("trainingDuration").value = sessionData.duration;
    document.getElementById("trainingDate").value = sessionData.date;
    document.getElementById("trainingTime").value = sessionData.time;
    document.getElementById("trainingCapacity").value = sessionData.capacity;
    document.getElementById("trainingPrice").value = sessionData.price;
    document.getElementById("trainingDescription").value =
      sessionData.description || "";
  } else {
    modalTitle.textContent = "Add Training Session";
  }

  openModal(trainingModal);
}

// Training Form Submit
trainingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    id: document.getElementById("trainingId").value,
    name: document.getElementById("trainingName").value,
    trainer: document.getElementById("trainingTrainer").value,
    duration: document.getElementById("trainingDuration").value,
    date: document.getElementById("trainingDate").value,
    time: document.getElementById("trainingTime").value,
    capacity: document.getElementById("trainingCapacity").value,
    price: document.getElementById("trainingPrice").value,
    description: document.getElementById("trainingDescription").value,
  };

  try {
    const endpoint = formData.id ? "update" : "create";
    const response = await fetch(
      `backend/admin/training.php?action=${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      closeModal(trainingModal);
      loadSectionData("training");
      showNotification("Training session saved successfully!", "success");
    } else {
      showNotification("Error saving session: " + result.message, "error");
    }
  } catch (error) {
    showNotification("Error saving session", "error");
  }
});

// Load section data
async function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      loadDashboard();
      break;
    case "clothing":
      loadProducts("clothing");
      break;
    case "equipment":
      loadProducts("equipment");
      break;
    case "training":
      loadTrainingSessions();
      break;
    case "users":
      loadUsers();
      break;
    case "orders":
      loadOrders();
      break;
    case "settings":
      // Settings section - no data to load
      console.log('Settings section loaded');
      break;
  }
}

// Load Dashboard
async function loadDashboard() {
  try {
    const response = await fetch("backend/admin/dashboard.php");
    const data = await response.json();

    if (data.status === "success") {
      // Update statistics
      document.getElementById("totalOrders").textContent =
        data.stats.orders || 0;
      document.getElementById("totalUsers").textContent = data.stats.users || 0;
      document.getElementById("totalProducts").textContent =
        data.stats.products || 0;
      document.getElementById("totalRevenue").textContent =
        "Rs." + (data.stats.revenue || "0.00");

      // Update notification badge with pending orders count
      updateNotificationBadge(data.stats.pending_orders || 0);

      // Load recent orders
      const recentOrdersDiv = document.getElementById("recentOrders");
      if (data.recentOrders && data.recentOrders.length > 0) {
        recentOrdersDiv.innerHTML = data.recentOrders
          .slice(0, 5)
          .map(
            (order) => `
                    <div class="order-item">
                        <div class="order-info">
                            <strong>Order #${order.id}</strong>
                            <span class="order-customer">${
                              order.username || order.user_email || "Guest"
                            }</span>
                            <span class="order-items">${
                              order.items_count || 0
                            } item(s)</span>
                        </div>
                        <div class="order-details">
                            <span class="order-total">$${parseFloat(
                              order.total_amount || 0
                            ).toFixed(2)}</span>
                            <span class="status-badge status-${order.status}">${
              order.status
            }</span>
                        </div>
                    </div>
                `
          )
          .join("");
      } else {
        recentOrdersDiv.innerHTML =
          '<p class="empty-state">No recent orders</p>';
      }

      // Load top products
      const topProductsDiv = document.getElementById("topProducts");
      if (data.topProducts && data.topProducts.length > 0) {
        topProductsDiv.innerHTML = data.topProducts
          .map(
            (product) => `
                    <div class="product-item">
                        <div class="product-info">
                            <strong>${product.product_name}</strong>
                            <span class="product-type">${
                              product.product_type
                            }</span>
                        </div>
                        <div class="product-stats">
                            <span class="product-orders">${
                              product.order_count
                            } orders</span>
                            <span class="product-sales">$${parseFloat(
                              product.total_sales || 0
                            ).toFixed(2)}</span>
                        </div>
                    </div>
                `
          )
          .join("");
      } else {
        topProductsDiv.innerHTML =
          '<p class="empty-state">No products data</p>';
      }

      // Store notifications for notification panel
      window.dashboardNotifications = data.notifications || [];
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// Update notification badge
function updateNotificationBadge(count) {
  const badge = document.querySelector(".notification-badge");
  const ordersNavBadge = document.querySelector(
    '.nav-link[data-section="orders"] .badge'
  );

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  if (ordersNavBadge) {
    ordersNavBadge.textContent = count;
    ordersNavBadge.style.display = count > 0 ? "inline-block" : "none";
  }
}

// Show notifications panel
function showNotificationsPanel() {
  const notifications = window.dashboardNotifications || [];

  if (notifications.length === 0) {
    alert("No new notifications");
    return;
  }

  let notifHTML =
    '<div style="background: #fff; padding: 20px; border-radius: 10px; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">';
  notifHTML +=
    '<h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Notifications</h3>';

  notifications.forEach((notif) => {
    const icon = notif.type === "order" ? "fa-shopping-bag" : "fa-user";
    const color = notif.type === "order" ? "#667eea" : "#f093fb";
    notifHTML += `
      <div style="padding: 12px; background: #f9f9f9; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px;">
        <i class="fas ${icon}" style="font-size: 20px; color: ${color};"></i>
        <div style="flex: 1;">
          <p style="margin: 0; font-size: 14px; font-weight: 500;">${notif.message}</p>
          <span style="font-size: 12px; color: #666;">${notif.time}</span>
        </div>
      </div>
    `;
  });

  notifHTML += "</div>";

  // You can implement a better modal here
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = notifHTML;
  tempDiv.style.cssText =
    "position: fixed; top: 80px; right: 20px; z-index: 10000;";
  document.body.appendChild(tempDiv);

  setTimeout(() => {
    tempDiv.remove();
  }, 5000);
}

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
  if (document.getElementById("dashboard").classList.contains("active")) {
    loadDashboard();
    console.log("Dashboard auto-refreshed");
  }
}, 30000);

// Load Products
async function loadProducts(type) {
  const tbody = document.getElementById(type + "TableBody");
  tbody.innerHTML =
    '<tr><td colspan="8" class="empty-state">Loading...</td></tr>';

  try {
    const response = await fetch(
      `backend/admin/products.php?action=list&type=${type}`
    );
    const data = await response.json();

    if (data.status === "success" && data.products.length > 0) {
      tbody.innerHTML = data.products
        .map(
          (product) => `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${
                      product.image || "IMG/placeholder.png"
                    }" class="table-image" alt="${product.name}"></td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.category}</td>
                    <td>Rs.${product.price}</td>
                    <td>${product.stock}</td>
                    <td>${
                      type === "equipment"
                        ? product.material || "N/A"
                        : `<span class="status-badge ${product.status}">${product.status}</span>`
                    }</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editProduct('${type}', ${
            product.id
          })">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteProduct('${type}', ${
            product.id
          })">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No ${type} products found</td></tr>`;
    }
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading products</td></tr>`;
  }
}

// Edit Product
window.editProduct = async function (type, id) {
  try {
    const response = await fetch(
      `backend/admin/products.php?action=get&type=${type}&id=${id}`
    );
    const data = await response.json();

    if (data.status === "success") {
      openProductModal(type, data.product);
    }
  } catch (error) {
    showNotification("Error loading product", "error");
  }
};

// Delete Product
window.deleteProduct = async function (type, id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(
      `backend/admin/products.php?action=delete&type=${type}&id=${id}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loadProducts(type);
      showNotification("Product deleted successfully!", "success");
    }
  } catch (error) {
    showNotification("Error deleting product", "error");
  }
};

// Load Training Sessions
async function loadTrainingSessions() {
  const tbody = document.getElementById("trainingTableBody");
  tbody.innerHTML =
    '<tr><td colspan="9" class="empty-state">Loading...</td></tr>';

  try {
    const response = await fetch("backend/admin/training.php?action=list");
    const data = await response.json();

    if (data.status === "success" && data.sessions.length > 0) {
      tbody.innerHTML = data.sessions
        .map(
          (session) => `
                <tr>
                    <td>${session.id}</td>
                    <td><strong>${session.name}</strong></td>
                    <td>${session.trainer}</td>
                    <td>${session.date}</td>
                    <td>${session.time}</td>
                    <td>${session.duration} min</td>
                    <td>${session.capacity}</td>
                    <td>${session.enrolled || 0}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editTraining(${
                              session.id
                            })">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteTraining(${
                              session.id
                            })">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
    } else {
      tbody.innerHTML =
        '<tr><td colspan="9" class="empty-state">No training sessions found</td></tr>';
    }
  } catch (error) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="empty-state">Error loading sessions</td></tr>';
  }
}

// Edit Training
window.editTraining = async function (id) {
  try {
    const response = await fetch(
      `backend/admin/training.php?action=get&id=${id}`
    );
    const data = await response.json();

    if (data.status === "success") {
      openTrainingModal(data.session);
    }
  } catch (error) {
    showNotification("Error loading session", "error");
  }
};

// Delete Training
window.deleteTraining = async function (id) {
  if (!confirm("Are you sure you want to delete this training session?"))
    return;

  try {
    const response = await fetch(
      `backend/admin/training.php?action=delete&id=${id}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loadTrainingSessions();
      showNotification("Training session deleted successfully!", "success");
    }
  } catch (error) {
    showNotification("Error deleting session", "error");
  }
};

// Load Users
async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML =
    '<tr><td colspan="8" class="empty-state">Loading...</td></tr>';

  try {
    const response = await fetch("backend/admin/users.php?action=list");
    const data = await response.json();

    if (data.status === "success" && data.users.length > 0) {
      tbody.innerHTML = data.users
        .map((user) => {
          const createdDate = new Date(user.created_at);
          const formattedDate = createdDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return `
                <tr>
                    <td>${user.id}</td>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.email}</td>
                    <td>${formattedDate}</td>
                    <td><span class="badge-count">${
                      user.orders || 0
                    }</span></td>
                    <td><span class="badge-money">Rs.${parseFloat(
                      user.total_spent || 0
                    ).toFixed(2)}</span></td>
                    <td><span class="status-badge status-active">Active</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" onclick="viewUser(${
                              user.id
                            })" title="View User">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteUser(${
                              user.id
                            })" title="Delete User">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
    } else {
      tbody.innerHTML =
        '<tr><td colspan="8" class="empty-state">No users found</td></tr>';
    }
  } catch (error) {
    console.error("Error loading users:", error);
    tbody.innerHTML =
      '<tr><td colspan="8" class="empty-state">Error loading users</td></tr>';
  }
}

// View User
window.viewUser = function (id) {
  showNotification("User profile view - Feature coming soon!", "info");
};

// Delete User
window.deleteUser = async function (id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const response = await fetch(
      `backend/admin/users.php?action=delete&id=${id}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loadUsers();
      showNotification("User deleted successfully!", "success");
    }
  } catch (error) {
    showNotification("Error deleting user", "error");
  }
};

// Load Orders
async function loadOrders() {
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML =
    '<tr><td colspan="7" class="empty-state">Loading...</td></tr>';

  try {
    const response = await fetch("backend/orders.php?action=list");
    const data = await response.json();

    if (data.status === "success" && data.orders.length > 0) {
      tbody.innerHTML = data.orders
        .map(
          (order) => `
                <tr>
                    <td><strong>${order.order_number}</strong></td>
                    <td>
                        <div><strong>${order.customer_name}</strong></div>
                        <small>${order.customer_email}</small><br>
                        <small>${order.customer_phone}</small>
                    </td>
                    <td><small>View items</small></td>
                    <td><strong>Rs.${parseFloat(order.total_amount).toFixed(
                      2
                    )}</strong></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        <select class="status-select" onchange="quickUpdateStatus(${
                          order.id
                        }, this.value)" style="padding: 5px; border-radius: 5px;">
                            <option value="pending" ${
                              order.status === "pending" ? "selected" : ""
                            }>Pending</option>
                            <option value="confirmed" ${
                              order.status === "confirmed" ? "selected" : ""
                            }>Confirmed</option>
                            <option value="processing" ${
                              order.status === "processing" ? "selected" : ""
                            }>Processing</option>
                            <option value="shipped" ${
                              order.status === "shipped" ? "selected" : ""
                            }>Shipped</option>
                            <option value="delivered" ${
                              order.status === "delivered" ? "selected" : ""
                            }>Delivered</option>
                            <option value="cancelled" ${
                              order.status === "cancelled" ? "selected" : ""
                            }>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" onclick="viewOrder(${
                              order.id
                            })" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              order.payment_slip_image
                                ? `
                                <a href="${order.payment_slip_image}" target="_blank" class="action-btn" title="View Payment Slip" style="display: inline-block;">
                                    <i class="fas fa-receipt"></i>
                                </a>
                            `
                                : ""
                            }
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
    } else {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-state">No orders found</td></tr>';
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-state">Error loading orders</td></tr>';
  }
}

// View Order
window.viewOrder = async function (id) {
  try {
    const response = await fetch(`backend/orders.php?action=get&id=${id}`);
    const data = await response.json();

    if (data.status === "success") {
      const order = data.order;
      const items = order.items || [];

      document.getElementById("orderDetails").innerHTML = `
                <div class="order-details">
                    <h4>Order #${order.order_number || order.id}</h4>
                    <p><strong>Customer:</strong> ${order.customer_name}</p>
                    <p><strong>Email:</strong> ${order.customer_email}</p>
                    <p><strong>Phone:</strong> ${order.customer_phone}</p>
                    <p><strong>Address:</strong> ${order.customer_address}</p>
                    <p><strong>Postal Code:</strong> ${order.postal_code}</p>
                    <p><strong>Date:</strong> ${new Date(
                      order.created_at
                    ).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${
                      order.status
                    }">${order.status}</span></p>
                    <h5 style="margin-top: 20px;">Products Purchased:</h5>
                    ${
                      items.length > 0
                        ? `
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background: #f3f4f6; text-align: left;">
                                <th style="padding: 10px; border: 1px solid #e5e7eb;">Product</th>
                                <th style="padding: 10px; border: 1px solid #e5e7eb;">Type</th>
                                <th style="padding: 10px; border: 1px solid #e5e7eb;">Qty</th>
                                <th style="padding: 10px; border: 1px solid #e5e7eb;">Price</th>
                                <th style="padding: 10px; border: 1px solid #e5e7eb;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items
                              .map(
                                (item) => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">
                                        ${item.product_name}
                                        ${
                                          item.size
                                            ? `<br><small>Size: ${item.size}</small>`
                                            : ""
                                        }
                                        ${
                                          item.color
                                            ? `<br><small>Color: ${item.color}</small>`
                                            : ""
                                        }
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${
                                      item.product_type
                                    }</td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${
                                      item.quantity
                                    }</td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Rs.${parseFloat(
                                      item.product_price
                                    ).toFixed(2)}</td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Rs.${parseFloat(
                                      item.subtotal
                                    ).toFixed(2)}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                    `
                        : "<p>No items found</p>"
                    }
                    <p style="margin-top: 20px; font-size: 1.2rem;"><strong>Total:</strong> Rs.${parseFloat(
                      order.total_amount
                    ).toFixed(2)}</p>
                    ${
                      order.payment_slip_image
                        ? `
                    <div style="margin-top: 20px;">
                        <h5>Payment Slip:</h5>
                        <img src="${order.payment_slip_image}" alt="Payment Slip" style="max-width: 100%; max-height: 400px; border-radius: 8px; margin-top: 10px;">
                    </div>
                    `
                        : ""
                    }
                </div>
            `;
      openModal(orderModal);
    } else {
      showNotification(data.message || "Error loading order", "error");
    }
  } catch (error) {
    console.error("Error loading order:", error);
    showNotification("Error loading order details", "error");
  }
};

// Quick Update Status from Dropdown
window.quickUpdateStatus = async function (orderId, newStatus) {
  try {
    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("status", newStatus);
    formData.append("notes", `Status changed to ${newStatus} by admin`);

    const response = await fetch("backend/orders.php?action=update_status", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.status === "success") {
      showNotification(
        `Order status updated to ${newStatus.toUpperCase()}!`,
        "success"
      );
      // Don't reload, just update the visual (already updated by dropdown)
    } else {
      showNotification("Error updating order status", "error");
      loadOrders(); // Reload to reset dropdown
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Error updating order status", "error");
    loadOrders(); // Reload to reset dropdown
  }
};

// Update Order Status
window.updateOrderStatus = async function (id) {
  const status = prompt(
    "Enter new status (pending/processing/shipped/delivered/cancelled):"
  );
  if (!status) return;

  try {
    // Use FormData to match backend/orders.php format
    const formData = new FormData();
    formData.append("order_id", id);
    formData.append("status", status);
    formData.append("notes", `Status changed to ${status}`);

    const response = await fetch("backend/orders.php?action=update_status", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.status === "success") {
      loadOrders();
      showNotification("Order status updated!", "success");
    }
  } catch (error) {
    showNotification("Error updating order status", "error");
  }
};

// Notification System
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "error"
            ? "#ef4444"
            : "#3b82f6"
        };
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// View all links in dashboard
document.querySelectorAll(".view-all").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    const navLink = document.querySelector(`[data-section="${section}"]`);
    if (navLink) navLink.click();
  });
});

// Notification bell click handler
const notificationBtn = document.querySelector(".notification-btn");
if (notificationBtn) {
  notificationBtn.addEventListener("click", () => {
    showNotificationsPanel();
  });
}

// Initialize
loadDashboard();

// ==========================================
// PASSWORD CHANGE FUNCTIONALITY
// ==========================================

// Initialize admin on first load
fetch('backend/admin/settings.php?action=initialize_admin')
  .then(res => res.json())
  .then(data => {
    console.log('Admin initialization:', data.message);
  })
  .catch(err => console.error('Initialization error:', err));

// Password change form handler
const changePasswordForm = document.getElementById('changePasswordForm');
const cancelPasswordChange = document.getElementById('cancelPasswordChange');

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long!', 'error');
      return;
    }
    
    try {
      const response = await fetch('backend/admin/settings.php?action=change_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification(data.message, 'success');
        changePasswordForm.reset();
        
        // Optional: Log out user after password change for security
        setTimeout(() => {
          showNotification('Please login with your new password', 'info');
          localStorage.removeItem('auth');
          window.location.href = 'index.html';
        }, 2000);
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showNotification('Error changing password. Please try again.', 'error');
    }
  });
}

if (cancelPasswordChange) {
  cancelPasswordChange.addEventListener('click', () => {
    changePasswordForm.reset();
    showNotification('Password change cancelled', 'info');
  });
}
