// ==========================================
// 1. الإعدادات الأساسية
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. دالة الدخول (إصلاح شامل)
// ==========================================
function login() {
    // جلب العناصر من الصفحة بناءً على التصميم الجديد
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const roleField = document.getElementById('userRole');

    // التحقق من وجود الحقول لمنع توقف الكود
    if (!userField || !passField || !roleField) {
        console.error("خطأ: تعذر العثور على حقول الإدخال في الصفحة.");
        return;
    }

    const username = userField.value.trim();
    const password = passField.value;
    const role = roleField.value;

    // التأكد من إدخال اسم المستخدم
    if (username === "") {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    // منطق التحقق من كلمة المرور
    if (role === "admin") {
        if (password === "12345") {
            localStorage.setItem('currentUser', username);
            localStorage.setItem('userRole', 'admin');
            window.location.href = "dashboard.html";
        } else {
            alert("كلمة المرور للمسؤول غير صحيحة!");
        }
    } else {
        // دخول الموظف العادي لا يتطلب كلمة مرور معقدة في هذا النموذج
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userRole', 'user');
        window.location.href = "dashboard.html";
    }
}

// ==========================================
// 3. نظام حماية الصفحات
// ==========================================
function checkAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = "index.html";
    }
}

// ==========================================
// 4. دالة الحفظ العالمية (API)
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
            body: JSON.stringify({ message: "تحديث البيانات", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) {
        console.error("خطأ في الحفظ:", e);
        return false;
    }
}
