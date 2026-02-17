// بيانات تجريبية للبحث (سيتم ربطها بملفات الـ JSON لاحقاً)
const mockItems = [
    { name: "Ethanol", dept: "كيمياويات" },
    { name: "أنابيب اختبار", dept: "مستهلكات" },
    { name: "Centrifuge", dept: "أجهزة" }
];

function quickSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = "";

    if (query.length > 0) {
        const filtered = mockItems.filter(item => item.name.toLowerCase().includes(query));
        filtered.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="item-card">
                    <span>${item.name} (${item.dept})</span>
                    <button onclick="location.href='disbursement.html'" style="width: auto; padding: 5px 10px;">طلب صرف</button>
                </div>`;
        });
    }
}

function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('userRole').value;

    if (user) {
        // تخزين بيانات المستخدم في المتصفح مؤقتاً
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', role);
        
        // الانتقال للصفحة الرئيسية
        window.location.href = "dashboard.html";
    } else {
        alert("يرجى إدخال اسم المستخدم");
    }
}
