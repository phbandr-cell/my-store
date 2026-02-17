// ==========================================
// 1. إعدادات الربط بـ GitHub API
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. إدارة الدخول والصلاحيات
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
    if (document.getElementById('welcomeMsg')) {
        document.getElementById('welcomeMsg').innerText = "أهلاً، " + user;
    }
    // إخفاء أو إظهار رابط الإدارة بناءً على الصلاحية
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
// 3. محرك البحث (جلب البيانات من الملفات الحقيقية)
// ==========================================
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        try {
            const files = ['chemicals.json', 'consumables.json', 'devices.json'];
            let allItems = [];
            for (const file of files) {
                const res = await fetch(`${file}?t=${new Date().getTime()}`);
                if (res.ok) {
                    const data = await res.json();
                    const itemsWithCat = (Array.isArray(data) ? data : [data]).map(item => ({...item, categoryFile: file}));
                    allItems = allItems.concat(itemsWithCat);
                }
            }
            const filtered = allItems.filter(item => item.name && item.name.toLowerCase().includes(query));
            
            if (filtered.length === 0) {
                resultsDiv.innerHTML = `<div style="padding:10px; color:red;">لا توجد نتائج مطابقة.</div>`;
                return;
            }

            filtered.forEach(item => {
                resultsDiv.innerHTML += `
                    <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <div><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</div>
                        <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                                style="background:#e67e22; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">طلب صرف</button>
                    </div>`;
            });
        } catch (e) {
            console.error("Search Error:", e);
        }
    }
}

// ==========================================
// 4. نظام الحفظ في GitHub (API)
// ==========================================
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const sha = fileJson.sha;

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Update ${fileName} via Web App`,
                content: content,
                sha: sha
            })
        });

        return response.ok;
    } catch (e) {
        console.error("GitHub Save Error:", e);
        return false;
    }
}

// ==========================================
// 5. وظيفة إرسال طلب الصرف (لحل مشكلة زر الإرسال)
// ==========================================
async function sendRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;
    const lab = document.getElementById('labNumber')?.value || "غير محدد";

    if (!requester || !qty || qty <= 0) {
        alert("يرجى ملء الاسم والكمية المطلوبة.");
        return;
    }

    const fileName = 'requests.json';
    try {
        // جلب الطلبات الحالية
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        let requests = await res.json();
        if (!Array.isArray(requests)) requests = [];

        // إضافة الطلب الجديد
        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            lab: lab,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        // حفظ في GitHub
        const success = await saveToGitHub(fileName, requests);
        if (success) {
            alert("تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المسؤول.");
            window.location.href = "dashboard.html";
        } else {
            alert("حدث خطأ أثناء الاتصال بـ GitHub.");
        }
    } catch (e) {
        alert("خطأ: تأكد من وجود ملف requests.json في المستودع.");
    }
}

// ==========================================
// 6. وظيفة إضافة صنف جديد (للمسؤول)
// ==========================================
async function addItem() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const fileName = `${category}.json`;

    if (!category || !name || isNaN(qty)) {
        alert("يرجى ملء كافة الحقول المطلوبة.");
        return;
    }

    try {
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];

        data.push({
            id: Date.now().toString(),
            name: name,
            quantity: qty,
            unit: unit,
            category: category
        });

        const success = await saveToGitHub(fileName, data);
        if (success) {
            alert("تمت إضافة الصنف الجديد بنجاح! ✅");
            location.href = "dashboard.html";
        }
    } catch (e) {
        alert("حدث خطأ أثناء محاولة الإضافة.");
    }
}

// ==========================================
// 7. وظائف مساعدة (الوحدات والحسابات)
// ==========================================
function updateUnits() {
    const category = document.getElementById('category').value;
    const unitSelect = document.getElementById('unit');
    let options = "";
    if (category === "chemicals") {
        options = '<option value="ل">لتر</option><option value="مل">مل</option><option value="كجم">كجم</option>';
    } else if (category === "consumables") {
        options = '<option value="حبة">حبة</option><option value="علبة">علبة</option><option value="كرتون">كرتون</option>';
    } else if (category === "devices") {
        options = '<option value="جهاز">جهاز</option>';
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
