// الإعدادات العالمية للربط بـ GitHub API
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. إدارة الدخول والتحقق
function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('userRole').value;
    if (user.trim() !== "") {
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', role);
        window.location.href = "dashboard.html";
    } else { alert("يرجى إدخال اسم المستخدم"); }
}

function checkAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user) { window.location.href = "index.html"; return; }
    if (document.getElementById('welcomeMsg')) document.getElementById('welcomeMsg').innerText = "أهلاً، " + user;
}

// 2. محرك البحث (يظهر النتائج فوراً عند الكتابة)
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv || query.length === 0) { if(resultsDiv) resultsDiv.innerHTML = ""; return; }

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
        resultsDiv.innerHTML = "";
        
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px;">
                    <div><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</div>
                    <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                            style="background:#e67e22; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">طلب صرف</button>
                </div>`;
        });
    } catch (e) { console.error("Search Error:", e); }
}

// 3. الدالة المسؤولة عن "زر الإرسال" (إرسال الطلب لـ GitHub)
async function sendRequest() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get('item');
    const requester = document.getElementById('requesterName')?.value || "موظف مجهول";
    const qty = document.getElementById('requestQty')?.value || 0;

    if (!itemName || qty <= 0) {
        alert("يرجى إكمال بيانات الطلب وتحديد الكمية.");
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
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        // حفظ التحديث في GitHub
        const success = await saveToGitHub(fileName, requests);
        if (success) {
            alert("تم إرسال طلب الصرف بنجاح! سيراجعه المسؤول.");
            window.location.href = "index.html";
        }
    } catch (e) {
        alert("فشل في إرسال الطلب. تأكد من وجود ملف requests.json في GitHub.");
    }
}

// 4. دالة الحفظ العالمية (API)
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Update Data", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) { return false; }
}
