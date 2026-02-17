// 1. إدارة تسجيل الدخول والتحقق من الصلاحيات
function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('userRole').value;

    if (user.trim() !== "") {
        // تخزين بيانات المستخدم في ذاكرة المتصفح
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', role);
        
        // التوجه للصفحة الرئيسية
        window.location.href = "dashboard.html";
    } else {
        alert("يرجى إدخال اسم المستخدم أولاً");
    }
}

function checkAccess() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    // إذا حاول شخص دخول الصفحة بدون تسجيل دخول يرجعه لصفحة البداية
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // عرض رسالة الترحيب باسم المستخدم
    const welcomeElement = document.getElementById('welcomeMsg');
    if (welcomeElement) welcomeElement.innerText = "مرحباً، " + user;

    // إظهار زر الإدارة فقط للأدمن
    const adminBtn = document.getElementById('adminLink');
    if (adminBtn) {
        adminBtn.style.display = (role === 'admin') ? 'block' : 'none';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// 2. منطق صفحة الإضافة (add-item.html)
function updateUnits() {
    const category = document.getElementById('category').value;
    const unitSelect = document.getElementById('unit');
    const serialDiv = document.getElementById('serial_div');
    
    let options = "";
    
    if (category === "chemicals") {
        options = '<option value="مل">مل</option><option value="ل">لتر</option><option value="جم">جم</option><option value="كجم">كجم</option>';
        if(serialDiv) serialDiv.style.display = 'none';
    } else if (category === "consumables") {
        options = '<option value="حبة">حبة</option><option value="كرتون">كرتون</option><option value="علبة">علبة</option><option value="صندوق">صندوق</option>';
        if(serialDiv) serialDiv.style.display = 'none';
    } else if (category === "devices") {
        options = '<option value="جهاز">جهاز</option>';
        if(serialDiv) serialDiv.style.display = 'block'; // إظهار السيريال للأجهزة
    }
    
    unitSelect.innerHTML = options;
}

function calculateTotal() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const qty = parseFloat(document.getElementById('quantity').value) || 0;
    const totalDisplay = document.getElementById('total_display');

    const total = price * qty;
    
    if (totalDisplay) {
        totalDisplay.innerText = "الإجمالي: " + total + " ريال";
    }
}

// 3. منطق البحث السريع (index.html)
// بيانات تجريبية (سيتم استبدالها لاحقاً بربط حقيقي مع ملفات JSON)
const mockItems = [
    { name: "Ethanol", dept: "كيمياويات" },
    { name: "أنابيب اختبار", dept: "مستهلكات" },
    { name: "Centrifuge", dept: "أجهزة" }
];

function quickSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if(!resultsDiv) return;

    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        const filtered = mockItems.filter(item => item.name.toLowerCase().includes(query));
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <span>${item.name} (${item.dept})</span>
                    <button onclick="location.href='disbursement.html'" style="width: auto; margin: 0; background: #e67e22; padding: 5px 10px;">طلب صرف</button>
                </div>`;
        });
    }
}
