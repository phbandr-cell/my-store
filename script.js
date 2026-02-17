// ==========================================
// 1. إعدادات الربط بـ GitHub API
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. نظام الدخول والتحقق (محدث للباسورد)
// ==========================================
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password')?.value; // الحقل الجديد من صورتك
    const role = document.getElementById('userRole').value;

    if (user.trim() === "") {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    // شرط دخول المسؤول (Admin)
    if (role === "admin") {
        if (pass === "12345") { // كلمة المرور الافتراضية
            localStorage.setItem('currentUser', user);
            localStorage.setItem('userRole', 'admin');
            window.location.href = "dashboard.html";
        } else {
            alert("كلمة المرور للمسؤول غير صحيحة!");
        }
    } else {
        // دخول المستخدم العادي
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', 'user');
        window.location.href = "dashboard.html";
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
// 3. محرك البحث (يعمل مع الملفات الحقيقية)
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
                    allItems = allItems.concat(data);
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
                        <div><strong>${item.name}</strong> (المتوفر: ${item.quantity})</div>
                        <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                                style="background:#3498db; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">طلب صرف</button>
                    </div>`;
            });
        } catch (e) { console.error(e); }
    }
}

// ==========================================
// 4. دالة الحفظ العالمية في GitHub (API)
// ==========================================
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Update via App", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) { return false; }
}

// ==========================================
// 5. وظيفة إرسال طلب الصرف (الزر الأزرق)
// ==========================================
async function sendRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;

    if (!requester || !qty || qty <= 0) {
        alert("يرجى إكمال البيانات.");
        return;
    }

    try {
        const res = await fetch(`requests.json?t=${new Date().getTime()}`);
        let requests = await res.json();
        
        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        if (await saveToGitHub('requests.json', requests)) {
            alert("تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المسؤول.");
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الاتصال بالمستودع."); }
}
