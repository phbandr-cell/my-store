const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// عرض الأقسام والبحث
async function showCategory(category) {
    const results = document.getElementById('searchResults');
    results.innerHTML = "جاري التحميل...";
    try {
        const res = await fetch(`${category}.json?t=${Date.now()}`);
        const data = await res.json();
        results.innerHTML = `<h3>📦 أصناف ${category}:</h3>` + data.map(i => `
            <div class="item-card">
                <span><b>${i.name}</b> (${i.quantity} ${i.unit})</span>
                <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}'" style="background:#3498db; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">طلب صرف</button>
            </div>
        `).join('');
    } catch (e) { results.innerHTML = "القسم فارغ حالياً."; }
}

// إرسال طلب الصرف
async function sendRequest() {
    const item = document.getElementById('itemNameDisp').innerText;
    const stock = parseInt(document.getElementById('itemStockDisp').innerText);
    const requester = document.getElementById('requester').value;
    const qty = parseInt(document.getElementById('reqQty').value);

    if (!requester || !qty || qty <= 0) return alert("أكمل البيانات");
    if (qty > stock) return alert("الكمية المطلوبة غير متوفرة!");

    try {
        const res = await fetch(`requests.json?t=${Date.now()}`);
        let requests = res.ok ? await res.json() : [];
        requests.push({ item, requester, qty, status: "قيد الانتظار", date: new Date().toLocaleString('ar-SA') });

        if (await saveToGitHub('requests.json', requests)) {
            alert("✅ تم إرسال الطلب بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الاتصال"); }
}

// إضافة صنف جديد
async function addItem() {
    const cat = document.getElementById('category').value;
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;
    const unit = document.getElementById('unit').value;

    if (!name || !qty) return alert("أكمل البيانات");

    const res = await fetch(`${cat}.json?t=${Date.now()}`);
    let data = res.ok ? await res.json() : [];
    data.push({ name, quantity: qty, unit, id: Date.now() });

    if (await saveToGitHub(`${cat}.json`, data)) {
        alert("✅ تمت الإضافة!");
        window.location.href = "dashboard.html";
    }
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
