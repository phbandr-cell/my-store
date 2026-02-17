// ==========================================
// 1. نظام الدخول والتحقق من الصلاحيات
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

    // إظهار زر الإدارة فقط للأدمن
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
// 3. نظام البحث المباشر من ملفات JSON
// ==========================================
async function quickSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        try {
            // جلب البيانات من ملفاتك الثلاثة المرفوعة
            const responses = await Promise.all([
                fetch('chemicals.json'),
                fetch('consumables.json'),
                fetch('devices.json')
            ]);
            
            const data = await Promise.all(responses.map(res => res.json()));
            const allItems = data.flat(); // دمج المصفوفات
            
            const filtered = allItems.filter(item => item.name.toLowerCase().includes(query));
            
            filtered.forEach(item => {
                resultsDiv.innerHTML += `
                    <div class="item-card" style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        <span><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</span>
                        <button onclick="location.href='disbursement.html?item=${item.name}&stock=${item.quantity}'" 
                                style="width:auto; padding:5px 10px; background:#e67e22; border:none; color:white; border-radius:5px; cursor:pointer;">
                            طلب صرف
                        </button>
                    </div>`;
            });
        } catch (error) {
            console.error("خطأ في جلب البيانات:", error);
        }
    }
}

// ==========================================
// 4. نظام تقديم طلبات الصرف (disbursement.html)
// ==========================================
function submitRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;
    const available = parseInt(document.getElementById('availableQty').innerText);

    if (!requester || !qty || qty <= 0) {
        alert("يرجى ملء جميع الحقول وإدخال كمية صحيحة.");
        return;
    }

    // تنبيه في حال طلب كمية أكبر من المتاح
    if (parseInt(qty) > available) {
        alert("تنبيه: الكمية المطلوبة غير متوفرة بالكامل حالياً، ولكن سيتم إرسال طلبك للمراجعة.");
    }

    // محاكاة إرسال الطلب (سيتم ربطها بملف طلبات لاحقاً)
    alert(`شكراً لك يا ${requester}.\nتم إرسال طلب صرف لـ (${qty}) من (${itemName}) بنجاح.\nيرجى انتظار اعتماد الطلب من قبل الإدارة.`);
    
    window.location.href = "index.html";
}

// ==========================================
// 5. وظائف الإدارة (admin_requests.html)
// ==========================================
function approveRequest(requestId) {
    if (confirm("هل أنت متأكد من الموافقة على صرف هذه الكمية؟")) {
        // هنا سيتم الخصم الحقيقي من الملفات
        alert("تم اعتماد الطلب بنجاح وتحديث المخزون.");
        location.reload();
    }
}

function rejectRequest(requestId) {
    const reason = prompt("يرجى ذكر سبب الرفض:");
    if (reason) {
        alert("تم رفض الطلب.");
        location.reload();
    }
}
