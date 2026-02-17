// ==========================================
// 1. نظام الدخول والصلاحيات
// ==========================================
function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('userRole').value;

    if (user.trim() !== "") {
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', role);
        window.location.href = "dashboard.html";
    } else {
        alert("يرجى إدخال اسم المستخدم");
    }
}

function checkAccess() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.innerText = "مرحباً، " + user;

    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = (role === 'admin') ? 'block' : 'none';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ==========================================
// 2. نظام إضافة الأصناف (add-item.html)
// ==========================================
function updateUnits() {
    const category = document.getElementById('category').value;
    const unitSelect = document.getElementById('unit');
    const serialDiv = document.getElementById('serial_div');
    
    let options = "";
    if (category === "chemicals") {
        options = '<option value="مل">مل</option><option value="ل">ل</option><option value="جم">جم</option><option value="كجم">كجم</option>';
        if(serialDiv) serialDiv.style.display = 'none';
    } else if (category === "consumables") {
        options = '<option value="حبة">حبة</option><option value="كرتون">كرتون</option><option value="علبة">علبة</option><option value="صندوق">صندوق</option>';
        if(serialDiv) serialDiv.style.display = 'none';
    } else if (category === "devices") {
        options = '<option value="جهاز">جهاز</option>';
        if(serialDiv) serialDiv.style.display = 'block';
    }
    unitSelect.innerHTML = options;
}

function calculateTotal() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const qty = parseFloat(document.getElementById('quantity').value) || 0;
    const totalDisplay = document.getElementById('total_display');
    if (totalDisplay) {
        totalDisplay.innerText = "الإجمالي: " + (price * qty) + " ريال";
    }
}

// ==========================================
// 3. نظام البحث السريع (index.html)
// ==========================================
const mockItems = [
    { name: "Ethanol", dept: "chemicals", stock: 50 },
    { name: "أنابيب اختبار", dept: "consumables", stock: 100 },
    { name: "Centrifuge", dept: "devices", stock: 5 }
];

function quickSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        const filtered = mockItems.filter(item => item.name.toLowerCase().includes(query));
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card" style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                    <span>${item.name}</span>
                    <button onclick="location.href='disbursement.html?item=${item.name}&stock=${item.stock}'" style="width:auto; padding:5px; background:#e67e22;">طلب صرف</button>
                </div>`;
        });
    }
}

// ==========================================
// 4. نظام الصرف (disbursement.html) - الكود الذي سألت عنه
// ==========================================
function processDisbursement(status) {
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;
    const available = parseInt(document.getElementById('availableQty').innerText);

    if (status === 'rejected') {
        alert("تم رفض الطلب وحفظه في سجل المرفوضات.");
        window.location.href = "index.html";
        return;
    }

    if (!requester || !qty) {
        alert("يرجى إكمال بيانات الطالب والكمية.");
        return;
    }

    if (parseInt(qty) > available) {
        alert("عذراً، الكمية المطلوبة أكبر من المتوفر في الرصيد!");
        return;
    }

    // هنا سيتم الربط مع GitHub API لاحقاً لتعديل ملفات الـ JSON حقيقياً
    const newBalance = available - parseInt(qty);
    alert(`تمت الموافقة!\nالمستلم: ${requester}\nالكمية المتبقية في المستودع: ${newBalance}`);
    window.location.href = "dashboard.html";
}
