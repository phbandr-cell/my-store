// ==========================================
// 1. الإعدادات والربط
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// ==========================================
// 2. دالة الدخول (إصلاح مشكلة الزر)
// ==========================================
function login() {
    console.log("تم الضغط على زر الدخول"); // للتأكد من استجابة الزر في Console

    const userVal = document.getElementById('username').value;
    const passVal = document.getElementById('password').value;
    const roleVal = document.getElementById('userRole').value;

    if (userVal.trim() === "") {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    // فحص الصلاحيات
    if (roleVal === "admin") {
        if (passVal === "12345") { 
            localStorage.setItem('currentUser', userVal);
            localStorage.setItem('userRole', 'admin');
            console.log("دخول ناجح كأدمن");
            window.location.href = "dashboard.html";
        } else {
            alert("كلمة المرور للمسؤول غير صحيحة!");
        }
    } else {
        // دخول الموظف العادي
        localStorage.setItem('currentUser', userVal);
        localStorage.setItem('userRole', 'user');
        console.log("دخول ناجح كموظف");
        window.location.href = "dashboard.html";
    }
}

// ==========================================
// 3. حماية الصفحات (توضع في dashboard و admin_requests)
// ==========================================
function checkAccess() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    if (document.getElementById('welcomeMsg')) {
        document.getElementById('welcomeMsg').innerText = "أهلاً، " + user;
    }
}

// ==========================================
// 4. دالة الحفظ في GitHub (API)
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
    } catch (e) { return false; }
}
