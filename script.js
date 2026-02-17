const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. الدخول والخروج
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const role = document.getElementById('userRole').value;

    if (!user) { alert("يرجى إدخال اسم المستخدم"); return; }

    if (role === "admin") {
        if (pass === "12345") {
            localStorage.setItem('currentUser', user);
            localStorage.setItem('userRole', 'admin');
            window.location.href = "dashboard.html";
        } else { alert("كلمة المرور 12345 غير صحيحة"); }
    } else {
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', 'user');
        window.location.href = "dashboard.html";
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function checkAccess() {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = "index.html";
    }
}

// 2. إدارة الوحدات والأصناف
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
            <div class="item-card">
                <span>${i.name} (${i.quantity} ${i.unit})</span>
                <button onclick="location.href='disbursement.html?item=${i.name}&stock=${i.quantity}'">طلب صرف</button>
            </div>
        `).join('');
    } catch (e) { results.innerHTML = "لا توجد أصناف."; }
}

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
        alert("تمت الإضافة!");
        window.location.href = "dashboard.html";
    }
}

// 3. محرك الحفظ في GitHub
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
