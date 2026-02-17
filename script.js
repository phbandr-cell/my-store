const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// --- 1. نظام الدخول والخروج ---
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const role = document.getElementById('userRole').value;
    if (!user) { alert("يرجى إدخال اسم المستخدم"); return; }
    if (role === "admin" && pass !== "12345") { alert("كلمة المرور غير صحيحة"); return; }
    localStorage.setItem('currentUser', user);
    localStorage.setItem('userRole', role);
    window.location.href = "dashboard.html";
}

function logout() { localStorage.clear(); window.location.href = "index.html"; }
function checkAccess() { if (!localStorage.getItem('currentUser')) window.location.href = "index.html"; }

// --- 2. إرسال طلب الصرف ---
async function sendRequest() {
    const itemName = document.getElementById('itemNameDisplay').innerText;
    const currentStock = parseInt(document.getElementById('itemStockDisplay').innerText);
    const requester = document.getElementById('requesterName').value;
    const qty = parseInt(document.getElementById('requestQty').value);

    if (!requester || !qty || qty <= 0) { alert("يرجى إكمال البيانات بشكل صحيح"); return; }
    if (qty > currentStock) { alert("الكمية المطلوبة أكبر من المتوفر!"); return; }

    try {
        const res = await fetch(`requests.json?t=${Date.now()}`);
        let requests = res.ok ? await res.json() : [];
        
        requests.push({
            id: Date.now(),
            itemName,
            requester,
            quantity: qty,
            status: "بانتظار الموافقة",
            date: new Date().toLocaleString('ar-SA')
        });

        if (await saveToGitHub('requests.json', requests)) {
            alert("✅ تم إرسال طلب الصرف للمسؤول بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("حدث خطأ في الاتصال بالخادم"); }
}

// --- 3. عرض الأقسام والوحدات ---
function loadUnits() {
    const unitSelect = document.getElementById('unit');
    if (unitSelect) {
        const units = ["مل", "لتر", "جرام", "كجم", "علبة", "جهاز", "قطعة"];
        unitSelect.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
}

async function showCategory(category) {
    const results = document.getElementById('searchResults');
    results.innerHTML = "جاري التحميل...";
    try {
        const res = await fetch(`${category}.json?t=${Date.now()}`);
        const data = await res.json();
        results.innerHTML = data.map(i => `
            <div style="border-bottom:1px solid #eee; padding:10px; display:flex; justify-content:space-between;">
                <span>${i.name} (${i.quantity} ${i.unit})</span>
                <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}'">طلب صرف</button>
            </div>
        `).join('');
    } catch (e) { results.innerHTML = "لا توجد أصناف."; }
}

// --- 4. محرك الحفظ في GitHub API ---
async function saveToGitHub(file, data) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
    const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
    const fileJson = await getFile.json();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const res = await fetch(url, {
        method: "PUT",
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "update", content, sha: fileJson.sha })
    });
    return res.ok;
}
