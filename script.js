// الإعدادات العالمية للربط بـ GitHub API
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. إدارة الدخول
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
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.style.display = (localStorage.getItem('userRole') === 'admin') ? 'block' : 'none';
}

// 2. محرك البحث (يظهر النتائج كما في الصورة)
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
        if (filtered.length === 0) { resultsDiv.innerHTML = "لا توجد نتائج مطابقة."; return; }
        
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    <div><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</div>
                    <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                            style="background:#e67e22; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">طلب صرف</button>
                </div>`;
        });
    } catch (e) { console.error("Search Error:", e); }
}

// 3. دالة الحفظ العالمية (API)
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
    } catch (e) { console.error("Save Error:", e); return false; }
}

// 4. وظيفة إرسال طلب الصرف (لحل مشكلة زر الإرسال)
async function sendRequest() {
    const itemName = new URLSearchParams(window.location.search).get('item');
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;
    const lab = document.getElementById('labNumber')?.value || "N/A";

    if (!requester || !qty || qty <= 0) { alert("يرجى إكمال بيانات الطلب."); return; }

    const fileName = 'requests.json';
    try {
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        let requests = await res.json();
        if (!Array.isArray(requests)) requests = [];

        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            lab: lab,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        const success = await saveToGitHub(fileName, requests);
        if (success) {
            alert("تم إرسال الطلب بنجاح! سيتم مراجعته من قبل المسؤول.");
            window.location.href = "index.html";
        } else {
            alert("فشل في إرسال الطلب. تأكد من إعدادات GitHub.");
        }
    } catch (e) { alert("خطأ في الاتصال بالخادم."); }
}
