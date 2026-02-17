const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// --- 1. نظام تسجيل الدخول (Login) ---
// هذا الجزء الذي كان مفقوداً في النسخة السابقة
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const role = document.getElementById('userRole').value;

    if (!user) {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    if (role === "admin") {
        if (pass === "12345") { // الباسورد المطلوب
            localStorage.setItem('currentUser', user);
            localStorage.setItem('userRole', 'admin');
            window.location.href = "dashboard.html";
        } else {
            alert("كلمة المرور 12345 غير صحيحة للأدمن");
        }
    } else {
        // دخول الموظف العادي لا يتطلب باسورد في هذا النظام
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', 'user');
        window.location.href = "dashboard.html";
    }
}

// --- 2. عرض الأقسام والبحث ---
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
    } catch (e) { 
        results.innerHTML = "القسم فارغ حالياً أو الملف غير موجود."; 
    }
}

// --- 3. إرسال طلب الصرف ---
async function sendRequest() {
    const item = document.getElementById('itemNameDisp').innerText;
    const stock = parseInt(document.getElementById('itemStockDisp').innerText);
    const requester = document.getElementById('requester').value;
    const qty = parseInt(document.getElementById('reqQty').value);

    if (!requester || !qty || qty <= 0) {
        alert("أكمل البيانات");
        return;
    }
    
    if (qty > stock) {
        alert("الكمية المطلوبة غير متوفرة!");
        return;
    }

    try {
        const res = await fetch(`requests.json?t=${Date.now()}`);
        let requests = res.ok ? await res.json() : [];
        requests.push({ 
            item, 
            requester, 
            qty, 
            status: "قيد الانتظار", 
            date: new Date().toLocaleString('ar-SA') 
        });

        if (await saveToGitHub('requests.json', requests)) {
            alert("✅ تم إرسال الطلب بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) { 
        alert("خطأ في الاتصال أثناء إرسال الطلب"); 
    }
}

// --- 4. إضافة صنف جديد ---
async function addItem() {
    const cat = document.getElementById('category').value;
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;
    const unit = document.getElementById('unit').value;

    if (!name || !qty) {
        alert("أكمل البيانات");
        return;
    }

    try {
        const res = await fetch(`${cat}.json?t=${Date.now()}`);
        let data = res.ok ? await res.json() : [];
        data.push({ name, quantity: qty, unit, id: Date.now() });

        if (await saveToGitHub(`${cat}.json`, data)) {
            alert("✅ تمت الإضافة بنجاح!");
            window.location.href = "dashboard.html";
        }
    } catch (e) {
        alert("خطأ في حفظ الصنف الجديد");
    }
}

// --- 5. محرك الحفظ في GitHub API ---
async function saveToGitHub(file, data) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        
        const res = await fetch(url, {
            method: "PUT",
            headers: { 
                "Authorization": `token ${GITHUB_TOKEN}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                message: "update data", 
                content, 
                sha: fileJson.sha 
            })
        });
        return res.ok;
    } catch (e) {
        console.error("GitHub Save Error:", e);
        return false;
    }
}
