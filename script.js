// الإعدادات - تأكد من الضغط على Allow Secret في GitHub
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "phbandr-cell"; 
const REPO_NAME = "my-store";

// دالة حفظ البيانات العالمية (API)
async function saveToGitHub(fileName, updatedData) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    try {
        const getFile = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const fileJson = await getFile.json();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "تحديث مخزني", content: content, sha: fileJson.sha })
        });
        return response.ok;
    } catch (e) { return false; }
}

// دالة إرسال الطلب (تأكد أن الاسم sendRequest)
async function sendRequest() {
    const itemName = document.getElementById('targetItem').innerText;
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;

    if (!requester || !qty || qty <= 0) {
        alert("يرجى إكمال البيانات");
        return;
    }

    try {
        const res = await fetch(`requests.json?t=${new Date().getTime()}`);
        let requests = await res.json();
        
        requests.push({
            id: Date.now(),
            itemName: itemName,
            requester: requester,
            quantity: qty,
            status: "pending",
            date: new Date().toLocaleString('ar-SA')
        });

        const success = await saveToGitHub('requests.json', requests);
        if (success) {
            alert("تم إرسال الطلب بنجاح! ✅");
            window.location.href = "index.html";
        }
    } catch (e) { alert("تأكد من وجود ملف requests.json في GitHub"); }
}

// دالة البحث (تعرض النتائج كما في صورتك)
async function quickSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv || query === "") return;

    const files = ['chemicals.json', 'consumables.json', 'devices.json'];
    let allItems = [];
    for (const file of files) {
        try {
            const res = await fetch(`${file}?t=${new Date().getTime()}`);
            const data = await res.json();
            allItems = allItems.concat(data);
        } catch(e) {}
    }

    const filtered = allItems.filter(i => i.name.toLowerCase().includes(query));
    resultsDiv.innerHTML = "";
    filtered.forEach(item => {
        resultsDiv.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #ddd;">
                <span>${item.name} (المتوفر: ${item.quantity})</span>
                <button onclick="location.href='disbursement.html?item=${encodeURIComponent(item.name)}&stock=${item.quantity}'" 
                        style="background:#e67e22; color:white; border:none; padding:5px 10px; border-radius:4px;">طلب صرف</button>
            </div>`;
    });
}
