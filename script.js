// ==========================================
// 1. إدارة الدخول والصلاحيات
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
    if (!user) { window.location.href = "index.html"; return; }
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.innerText = "أهلاً، " + user;
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.style.display = (role === 'admin') ? 'block' : 'none';
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ==========================================
// 2. محرك البحث الذكي (إصلاح مشكلة عدم ظهور النتائج)
// ==========================================
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        try {
            // جلب البيانات من ملفاتك الحقيقية المرفوعة
            const files = ['chemicals.json', 'consumables.json', 'devices.json'];
            let allItems = [];

            for (const file of files) {
                try {
                    // إضافة تاش لإجبار المتصفح على جلب أحدث نسخة من GitHub
                    const response = await fetch(`${file}?t=${new Date().getTime()}`);
                    if (response.ok) {
                        const data = await response.json();
                        // التعامل مع البيانات سواء كانت مصفوفة أو كائن فردي
                        if (Array.isArray(data)) {
                            allItems = allItems.concat(data);
                        } else if (data && typeof data === 'object') {
                            allItems.push(data);
                        }
                    }
                } catch (e) {
                    console.error(`خطأ في قراءة ملف ${file}:`, e);
                }
            }

            // تصفية النتائج: نبحث في الاسم (عربي أو إنجليزي)
            const filtered = allItems.filter(item => 
                item.name && item.name.toString().toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                resultsDiv.innerHTML = `<div style="padding:15px; color:#c0392b;">لا توجد نتائج لـ "${query}" في المستودع حالياً.</div>`;
                return;
            }

            // بناء البطاقات للنتائج
            filtered.forEach(item => {
                resultsDiv.innerHTML += `
                    <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                        <div>
                            <strong style="color:#2c3e50; font-size:16px;">${item.name}</strong><br>
                            <span style="color:#27ae60; font-size:14px;">المتوفر: ${item.quantity} ${item.unit}</span>
                        </div>
                        <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                                style="width:auto; padding:8px 12px; background:#e67e22; border:none; color:white; border-radius:5px; cursor:pointer; font-weight:bold;">
                            طلب صرف
                        </button>
                    </div>`;
            });
        } catch (error) {
            console.error("خطأ عام في البحث:", error);
            resultsDiv.innerHTML = "<p style='color:red; padding:10px;'>حدث خطأ فني أثناء جلب البيانات.</p>";
        }
    }
}

// ==========================================
// 3. معالجة طلبات الصرف
// ==========================================
function submitRequest() {
    const itemName = document.getElementById('targetItem')?.innerText;
    const requester = document.getElementById('requesterName')?.value;
    const qty = document.getElementById('requestQty')?.value;

    if (!requester || !qty || qty <= 0) {
        alert("يرجى إكمال جميع البيانات المطلوبة.");
        return;
    }

    alert(`شكراً لك يا ${requester}.\nتم إرسال طلب صرف (${qty}) من (${itemName}) بنجاح.\nبانتظار موافقة الإدارة.`);
    window.location.href = "index.html";
}

// ==========================================
// 4. إدارة الأصناف (add-item.html)
// ==========================================
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
        if(serialDiv) serialDiv.style.display = 'block';
    }
    unitSelect.innerHTML = options;
}

function calculateTotal() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const qty = parseFloat(document.getElementById('quantity').value) || 0;
    const totalDisplay = document.getElementById('total_display');
    if (totalDisplay) totalDisplay.innerText = "الإجمالي: " + (price * qty) + " ريال";
}
