// ==========================================
// 1. الإعدادات والتوكن
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. نظام الدخول والخروج
// ==========================================
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function checkAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user && !window.location.href.includes('index.html')) {
        window.location.href = "index.html";
    }
}

// ==========================================
// 3. عرض أصناف الأقسام في Dashboard
// ==========================================
async function showCategory(category) {
    const fileName = `${category}.json`;
    const container = document.getElementById('searchResults') || document.body; 
    
    try {
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        let html = `<h3>📦 الأصناف في قسم ${category}</h3><div class="grid">`;
        data.forEach(item => {
            html += `
                <div class="item-card" style="border:1px solid #ddd; padding:10px; margin:5px; border-radius:8px; background:#fff;">
                    <strong>${item.name}</strong><br>
                    الكمية: ${item.quantity} ${item.unit || ''}<br>
                    <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                            style="background:#3498db; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">طلب صرف</button>
                </div>`;
        });
        html += `</div>`;
        
        // إذا كنت تريد عرضها في منطقة محددة أو نافذة منبثقة
        const resultsArea = document.getElementById('categoryDisplay') || document.getElementById('searchResults');
        if (resultsArea) {
            resultsArea.innerHTML = html;
        } else {
            alert("سيتم عرض الأصناف في أسفل الصفحة");
            const div = document.createElement('div');
            div.id = "categoryDisplay";
            div.innerHTML = html;
            document.body.appendChild(div);
        }
    } catch (e) {
        alert("لا توجد بيانات لهذا القسم حالياً أو الملف غير موجود.");
    }
}

// ==========================================
// 4. نظام إضافة صنف جديد والوحدات
// ==========================================
function loadUnits() {
    const unitSelect = document.getElementById('unit');
    if (!unitSelect) return;
    const units = ["مل", "لتر", "جرام", "كجم", "علبة", "جهاز", "قطعة"];
    unitSelect.innerHTML = '<option value="">...اختر الوحدة</option>';
    units.forEach(u => {
        unitSelect.innerHTML += `<option value="${u}">${u}</option>`;
    });
}

async function addItem() {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const price = document.getElementById('price')?.value || "0";

    if (!category || !name || isNaN(qty) || !unit) {
        alert("يرجى إكمال كافة الحقول والوحدات");
        return;
    }

    try {
        const res = await fetch(`${category}.json?t=${new Date().getTime()}`);
        let data = res.ok ? await res.json() : [];
        
        data.push({ id: Date.now().toString(), name, quantity: qty, unit, price });
        
        if (await saveToGitHub(`${category}.json`, data)) {
            alert("تم حفظ الصنف في قسم " + category + " بنجاح! ✅");
            location.href = "dashboard.html";
        }
    } catch (e) { alert("خطأ في الاتصال بالمستودع."); }
}

// ==========================================
// 5. دالة الحفظ العالمية (GitHub API)
// ==========================================
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Update Data", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) { return false; }
}

// تشغيل الوحدات عند فتح صفحة الإضافة
if (window.location.href.includes('add-item.html')) {
    window.onload = loadUnits;
}
