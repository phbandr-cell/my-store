const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// عرض الأصناف عند الضغط على الأقسام
async function showCategory(category) {
    const results = document.getElementById('searchResults');
    results.innerHTML = "جاري تحميل البيانات...";
    try {
        const res = await fetch(`${category}.json?t=${Date.now()}`);
        const data = await res.json();
        results.innerHTML = `<h3>📦 أصناف ${category}:</h3>` + data.map(i => `
            <div class="item-card">
                <span><b>${i.name}</b> (${i.quantity} ${i.unit})</span>
                <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}'" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">طلب صرف</button>
            </div>
        `).join('');
    } catch (e) { results.innerHTML = "لا توجد بيانات حالياً في هذا القسم."; }
}

// إضافة صنف جديد لـ GitHub
async function addItem() {
    const cat = document.getElementById('category').value;
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;
    const unit = document.getElementById('unit').value;

    if (!name || !qty) { alert("أكمل كافة الحقول"); return; }

    try {
        const res = await fetch(`${cat}.json?t=${Date.now()}`);
        let data = res.ok ? await res.json() : [];
        data.push({ name, quantity: qty, unit, id: Date.now() });

        if (await saveToGitHub(`${cat}.json`, data)) {
            alert("✅ تم الحفظ بنجاح في قسم " + cat);
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الاتصال بالمخزن"); }
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
