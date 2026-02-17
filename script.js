// ==========================================
// 1. الإعدادات والربط بـ GitHub
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. إدارة الدخول والصلاحيات
// ==========================================
function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('userRole').value;
    if (user.trim() !== "") {
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', role);
        window.location.href = "dashboard.html";
    } else {
        alert("يرجى إدخال اسم المستخدم");
    }
}

function checkAccess() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');
    if (!user) { window.location.href = "index.html"; return; }
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.innerText = "أهلاً، " + user;
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.style.display = (role === 'admin') ? 'block' : 'none';
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ==========================================
// 3. محرك البحث (قراءة البيانات)
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
                    allItems = allItems.concat(Array.isArray(data) ? data : [data]);
                }
            }
            const filtered = allItems.filter(item => item.name.toLowerCase().includes(query));
            if (filtered.length === 0) {
                resultsDiv.innerHTML = `<div style="padding:10px; color:red;">لا توجد نتائج مطابقة.</div>`;
                return;
            }
            filtered.forEach(item => {
                resultsDiv.innerHTML += `
                    <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px;">
                        <div><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</div>
                        <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}&file=${item.category}.json'" 
                                style="background:#e67e22; color:white; padding:8px; border:none; border-radius:5px; cursor:pointer;">طلب صرف</button>
                    </div>`;
            });
        } catch (e) { console.error(e); }
    }
}

// ==========================================
// 4. دالة الحفظ الحقيقي في GitHub (API)
// ==========================================
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const sha = fileJson.sha;

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "تحديث المخزون آلياً", content: content, sha: sha })
        });

        if (response.ok) {
            alert("تم تحديث المستودع بنجاح! ✅");
            return true;
        }
    } catch (e) { alert("خطأ في الاتصال بـ GitHub"); return false; }
}

// ==========================================
// 5. وظيفة إضافة صنف جديد (add-item.html)
// ==========================================
async function addItem() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const fileName = `${category}.json`;

    if (!name || !qty) { alert("يرجى ملء البيانات"); return; }

    const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
    let data = await res.json();
    if (!Array.isArray(data)) data = [data];

    data.push({ id: Date.now().toString(), name: name, quantity: qty, unit: unit, category: category });

    await saveToGitHub(fileName, data);
    location.href = "dashboard.html";
}
