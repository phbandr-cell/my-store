// ==========================================
// 1. الإعدادات (تأكد من صحة التوكن)
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. دالة الدخول المصححة
// ==========================================
function login() {
    console.log("محاولة تسجيل الدخول..."); // سيظهر في الـ Console عند الضغط

    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const roleField = document.getElementById('userRole');

    if (!userField || !passField || !roleField) {
        alert("خطأ: تعذر العثور على حقول الإدخال. تأكد من وجود id صحيح في index.html");
        return;
    }

    const username = userField.value.trim();
    const password = passField.value;
    const role = roleField.value;

    if (username === "") {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    if (role === "admin") {
        if (password === "12345") {
            localStorage.setItem('currentUser', username);
            localStorage.setItem('userRole', 'admin');
            alert("مرحباً بك أيها المسؤول!");
            window.location.href = "dashboard.html";
        } else {
            alert("كلمة المرور 12345 غير صحيحة للمسؤول");
        }
    } else {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userRole', 'user');
        window.location.href = "dashboard.html";
    }
}

// ==========================================
// 3. دوال إضافية للنظام
// ==========================================
function checkAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user && !window.location.href.includes('index.html')) {
        window.location.href = "index.html";
    }
}

async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

        await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "تحديث", content: content, sha: fileJson.sha })
        });
        return true;
    } catch (e) { return false; }
}
