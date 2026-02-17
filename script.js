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
// 2. نظام البحث الحقيقي من ملفات JSON
// ==========================================
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        try {
            // جلب البيانات من الملفات الثلاثة التي رفعتها
            const files = ['chemicals.json', 'consumables.json', 'devices.json'];
            let allItems = [];

            for (const file of files) {
                const response = await fetch(file);
                if (response.ok) {
                    const data = await response.json();
                    // التأكد من التعامل مع البيانات سواء كانت كائن واحد أو مصفوفة
                    if (Array.isArray(data)) {
                        allItems = allItems.concat(data);
                    } else {
                        allItems.push(data);
                    }
                }
            }

            // تصفية النتائج بناءً على الاسم
            const filtered = allItems.filter(item => 
                item.name && item.name.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                resultsDiv.innerHTML = "<p style='padding:10px;'>لا توجد نتائج مطابقة.</p>";
                return;
            }

            filtered.forEach(item => {
                resultsDiv.innerHTML += `
                    <div class="item-card" style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        <span><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</span>
                        <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                                style="width:auto; padding:5px 10px; background:#e67e22; border:none; color:white; border-radius:5px; cursor:pointer;">
                            طلب صرف
                        </button>
                    </div>`;
            });
        } catch (error) {
            console.error("خطأ في جلب البيانات:", error);
            resultsDiv.innerHTML = "<p style='color:red;'>حدث خطأ أثناء البحث.</p>";
        }
    }
}

// ==========================================
// 3. نظام تقديم طلبات الصرف
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

    alert(`شكراً لك يا ${requester}.\nتم إرسال طلب صرف لـ (${qty}) من (${itemName}) بنجاح للمراجعة.`);
    window.location.href = "index.html";
}

// ==========================================
// 4. وظائف الإدارة
// ==========================================
function approveRequest(requestId) {
    if (confirm("هل أنت متأكد من الموافقة؟")) {
        alert("تم اعتماد الطلب.");
        location.reload();
    }
}
