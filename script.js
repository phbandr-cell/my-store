const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. إصلاح دالة الدخول
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

// 2. عرض الأصناف مع منع التكرار
async function showCategory(category) {
    const results = document.getElementById('searchResults');
    results.innerHTML = "جاري التحميل..."; // مسح النتائج السابقة لمنع التكرار
    try {
        const res = await fetch(`${category}.json?t=${Date.now()}`);
        const data = await res.json();
        
        // استخدام Set لضمان عدم عرض أصناف مكررة برمجياً
        let uniqueData = Array.from(new Set(data.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
        
        results.innerHTML = `<h3>📦 أصناف ${category}:</h3>` + uniqueData.map(i => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; background:white; margin:5px; border-radius:5px;">
                <span><b>${i.name}</b> (${i.quantity} ${i.unit || ''})</span>
                <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}&cat=${category}'" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">طلب صرف</button>
            </div>
        `).join('');
    } catch (e) { results.innerHTML = "القسم فارغ."; }
}

// 3. تفعيل إرسال الطلب
async function sendRequest() {
    const item = document.getElementById('itemNameDisp').innerText;
    const stock = parseInt(document.getElementById('itemStockDisp').innerText);
    const requester = document.getElementById('requester').value;
    const qty = parseInt(document.getElementById('reqQty').value);
    const category = new URLSearchParams(window.location.search).get('cat');

    if (!requester || !qty || qty <= 0) return alert("أكمل البيانات");
    if (qty > stock) return alert("المخزون لا يكفي!");

    try {
        const res = await fetch(`requests.json?t=${Date.now()}`);
        let requests = res.ok ? await res.json() : [];
        requests.push({ item, requester, qty, category, status: "قيد الانتظار", date: new Date().toLocaleString('ar-SA') });

        if (await saveToGitHub('requests.json', requests)) {
            alert("✅ تم إرسال الطلب بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الاتصال"); }
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
