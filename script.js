// ==========================================
// 1. إعدادات الربط بـ GitHub API
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. نظام الدخول والتحقق
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
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    if (document.getElementById('welcomeMsg')) {
        document.getElementById('welcomeMsg').innerText = "أهلاً، " + user;
    }
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = (localStorage.getItem('userRole') === 'admin') ? 'block' : 'none';
    }
}

// ==========================================
// 3. محرك البحث (يظهر النتائج كما في صورتك)
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
                    allItems = allItems.concat(Array.isArray(data) ? data : [data]);
                }
            }
            const filtered = allItems.filter(item => item.name && item.name.toLowerCase().includes(query));
            
            if (filtered.length === 0) {
                resultsDiv.innerHTML = `<div style="padding:10px; color:red;">لا توجد نتائج.</div>`;
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
// 4. دالة الحفظ العالمية في GitHub (API)
// ==========================================
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        if (!getFile.ok) return false;
        const fileJson = await getFile.json();
        const sha = fileJson.sha;

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Update via WebApp", content: content, sha: sha })
        });

        return response.ok;
    } catch (e) {
        console.error("Save Error:", e);
        return false;
    }
}

// ==========================================
// 5. وظيفة إرسال طلب الصرف (المسؤولة عن الزر الأزرق)
// ==========================================
async function sendRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;

    if (!requester || !qty || qty <= 0) {
        alert("يرجى إكمال بيانات الاسم والكمية.");
        return;
    }

    const fileName = 'requests.json';
    try {
        // محاولة جلب ملف الطلبات
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        
        // إذا لم يجد الملف (هذا سبب الخطأ في صورتك)
        if (!res.ok) {
            alert("خطأ: تأكد من وجود ملف requests.json في المستودع بـ GitHub.");
            return;
        }

        let requests = await res.json();
        if (!Array.isArray(requests)) requests = [];

        // إضافة الطلب الجديد
        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        // محاولة الحفظ في GitHub
        const success = await saveToGitHub(fileName, requests);
        if (success) {
            alert("تم إرسال الطلب بنجاح! ✅");
            window.location.href = "index.html";
        } else {
            alert("فشل في تحديث الملف. تأكد من صلاحيات الـ Token.");
        }
    } catch (e) {
        alert("حدث خطأ في الاتصال بالمستودع.");
    }
}

// ==========================================
// 6. إضافة صنف جديد (للمسؤول)
// ==========================================
async function addItem() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const fileName = `${category}.json`;

    if (!name || isNaN(qty)) { alert("أكمل الحقول."); return; }

    try {
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        let data = await res.json();
        data.push({ id: Date.now().toString(), name, quantity: qty, unit, category });
        if (await saveToGitHub(fileName, data)) {
            alert("تمت الإضافة! ✅");
            location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الإضافة."); }
}
