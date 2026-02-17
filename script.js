const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. نظام الدخول
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const role = document.getElementById('userRole').value;
    if (!user) return alert("أدخل اسم المستخدم");
    if (role === "admin" && pass !== "12345") return alert("الباسورد خطأ");
    localStorage.setItem('currentUser', user);
    localStorage.setItem('userRole', role);
    window.location.href = "dashboard.html";
}

// 2. إرسال الطلب مع حفظ القسم
async function sendRequest() {
    const item = document.getElementById('itemNameDisp').innerText;
    const stock = parseInt(document.getElementById('itemStockDisp').innerText);
    const requester = document.getElementById('requester').value;
    const qty = parseInt(document.getElementById('reqQty').value);
    const category = window.currentCategory; 

    if (!requester || !qty || qty <= 0) return alert("بيانات ناقصة");
    if (qty > stock) return alert("المخزون لا يكفي!");

    const res = await fetch(`requests.json?t=${Date.now()}`);
    let requests = res.ok ? await res.json() : [];
    requests.push({ item, requester, qty, category, status: "قيد الانتظار", date: new Date().toLocaleString('ar-SA') });

    if (await saveToGitHub('requests.json', requests)) {
        alert("✅ تم الإرسال للمسؤول");
        window.location.href = "dashboard.html";
    }
}

// 3. الموافقة وخصم الكمية من المخزون آلياً
async function approveAndDeduct(itemName, qty, reqIndex, category) {
    if (!confirm("هل تؤكد صرف الكمية وخصمها من المستودع؟")) return;

    // خصم من ملف القسم
    const catRes = await fetch(`${category}.json?t=${Date.now()}`);
    let inventory = await catRes.json();
    const idx = inventory.findIndex(i => i.name === itemName);
    if (idx !== -1) {
        inventory[idx].quantity = parseInt(inventory[idx].quantity) - qty;
        await saveToGitHub(`${category}.json`, inventory);
    }

    // تحديث حالة الطلب
    const reqRes = await fetch(`requests.json?t=${Date.now()}`);
    let requests = await reqRes.json();
    requests[reqIndex].status = "تم الصرف";
    await saveToGitHub('requests.json', requests);

    alert("✅ تم الخصم من المخزون بنجاح!");
    location.reload();
}

// عرض الأقسام في اللوحة
async function showCategory(category) {
    const res = await fetch(`${category}.json?t=${Date.now()}`);
    const data = await res.json();
    document.getElementById('searchResults').innerHTML = data.map(i => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
            <span>${i.name} (${i.quantity} ${i.unit})</span>
            <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}&cat=${category}'">طلب صرف</button>
        </div>
    `).join('');
}

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
