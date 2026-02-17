// الإعدادات العالمية للربط بـ GitHub
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 1. نظام الدخول
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
    const role = localStorage.getItem('userRole');
    if (!user) { window.location.href = "index.html"; return; }
    if (document.getElementById('welcomeMsg')) document.getElementById('welcomeMsg').innerText = "أهلاً، " + user;
    if (document.getElementById('adminLink')) document.getElementById('adminLink').style.display = (role === 'admin') ? 'block' : 'none';
}

// 2. محرك البحث الذكي (يقرأ من الملفات المرفوعة)
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
        if (filtered.length === 0) { resultsDiv.innerHTML = "لا توجد نتائج."; return; }
        
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-top:5px; border-radius:8px;">
                    <div><strong>${item.name}</strong> (المتوفر: ${item.quantity} ${item.unit})</div>
                    <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                            style="background:#e67e22; color:white; padding:8px; border:none; border-radius:5px; cursor:pointer;">طلب صرف</button>
                </div>`;
        });
    } catch (e) { console.error("Search Error:", e); }
}

// 3. دالة الحفظ العالمية (ترفع البيانات إلى GitHub)
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "تحديث البيانات", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) { console.error("Save Error:", e); return false; }
}

// 4. وظائف الإضافة وحساب التكاليف
function updateUnits() {
    const category = document.getElementById('category').value;
    const unitSelect = document.getElementById('unit');
    let options = "";
    if (category === "chemicals") options = '<option value="ل">لتر</option><option value="مل">مل</option><option value="كجم">كجم</option>';
    else if (category === "consumables") options = '<option value="حبة">حبة</option><option value="علبة">علبة</option><option value="كرتون">كرتون</option>';
    else if (category === "devices") options = '<option value="جهاز">جهاز</option>';
    unitSelect.innerHTML = options;
}

function calculateTotal() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const qty = parseFloat(document.getElementById('quantity').value) || 0;
    const totalDisplay = document.getElementById('total_display');
    if (totalDisplay) totalDisplay.innerText = "الإجمالي: " + (price * qty) + " ريال";
}

async function addItem() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    if (!category || !name || isNaN(qty)) { alert("أكمل البيانات"); return; }

    const fileName = `${category}.json`;
    const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    data.push({ id: Date.now().toString(), name: name, quantity: qty, unit: unit, category: category });

    if (await saveToGitHub(fileName, data)) {
        alert("تمت الإضافة بنجاح! ✅");
        location.href = "dashboard.html";
    }
}
