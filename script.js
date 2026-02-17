const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. نظام الدخول والخروج
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function checkAccess() {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = "index.html";
    }
}

// 2. تعبئة الوحدات تلقائياً
function loadUnits() {
    const unitSelect = document.getElementById('unit');
    if (unitSelect) {
        const units = ["مل", "لتر", "جرام", "كجم", "علبة", "جهاز", "قطعة"];
        unitSelect.innerHTML = '<option value="">...اختر الوحدة</option>';
        units.forEach(u => unitSelect.innerHTML += `<option value="${u}">${u}</option>`);
    }
}

// 3. عرض أصناف قسم محدد
async function showCategory(category) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = "جاري تحميل البيانات...";
    try {
        const res = await fetch(`${category}.json?t=${new Date().getTime()}`);
        const data = await res.json();
        renderItems(data, category);
    } catch (e) {
        resultsDiv.innerHTML = "القسم فارغ حالياً.";
    }
}

// 4. إضافة صنف جديد للمخزن
async function addItem() {
    const cat = document.getElementById('category').value;
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;
    const unit = document.getElementById('unit').value;

    if (!cat || !name || !qty || !unit) {
        alert("يرجى إكمال كافة الحقول");
        return;
    }

    try {
        const res = await fetch(`${cat}.json?t=${new Date().getTime()}`);
        let data = res.ok ? await res.json() : [];
        data.push({ name, quantity: qty, unit, id: Date.now() });

        if (await saveToGitHub(`${cat}.json`, data)) {
            alert("تمت الإضافة بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الحفظ"); }
}

// 5. محرك البحث السريع
async function quickSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (query === "") { resultsDiv.innerHTML = ""; return; }

    const files = ['chemicals.json', 'consumables.json', 'devices.json'];
    let allData = [];
    for (let f of files) {
        try {
            const res = await fetch(`${f}?t=${new Date().getTime()}`);
            if (res.ok) allData = allData.concat(await res.json());
        } catch(e) {}
    }
    const filtered = allData.filter(i => i.name.toLowerCase().includes(query));
    renderItems(filtered);
}

function renderItems(items) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = items.map(i => `
        <div class="item-card">
            <span>${i.name} (${i.quantity} ${i.unit})</span>
            <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}'">طلب صرف</button>
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
        headers: { "Authorization": `token ${GITHUB_TOKEN}` },
        body: JSON.stringify({ message: "update", content, sha: fileJson.sha })
    });
    return res.ok;
}
