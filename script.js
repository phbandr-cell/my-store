// 1. إعدادات المستودع - تأكد من الضغط على "Allow Secret" في GitHub
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// 2. دالة الحفظ العالمية
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        if (!getFile.ok) return false;
        
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

// 3. دالة إرسال الطلب (التي تظهر في صورك)
async function sendRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;

    if (!requester || !qty || qty <= 0) {
        alert("يرجى إكمال البيانات أولاً");
        return;
    }

    const fileName = 'requests.json';
    try {
        const res = await fetch(`${fileName}?t=${new Date().getTime()}`);
        
        // إذا فشل المتصفح في العثور على الملف
        if (!res.ok) {
            alert("خطأ: تأكد من وجود ملف requests.json في المستودع");
            return;
        }

        let requests = await res.json();
        if (!Array.isArray(requests)) requests = [];

        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        if (await saveToGitHub(fileName, requests)) {
            alert("تم إرسال طلبك بنجاح! ✅");
            window.location.href = "index.html";
        }
    } catch (e) {
        alert("حدث خطأ في الاتصال بالمستودع");
    }
}

// 4. محرك البحث (يعمل كما في الصورة السابقة)
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv || query === "") { if(resultsDiv) resultsDiv.innerHTML = ""; return; }

    const files = ['chemicals.json', 'consumables.json', 'devices.json'];
    let allItems = [];
    
    for (const file of files) {
        try {
            const res = await fetch(`${file}?t=${new Date().getTime()}`);
            if(res.ok) {
                const data = await res.json();
                allItems = allItems.concat(data);
            }
        } catch(e) {}
    }

    const filtered = allItems.filter(i => i.name.toLowerCase().includes(query));
    resultsDiv.innerHTML = "";
    filtered.forEach(item => {
        resultsDiv.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee; background:#fff; margin-bottom:5px; border-radius:5px;">
                <span>${item.name} (المتوفر: ${item.quantity})</span>
                <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                        style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;">طلب صرف</button>
            </div>`;
    });
}
