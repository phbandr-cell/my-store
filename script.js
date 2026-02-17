// وظيفة لحساب السعر الإجمالي تلقائياً
function calculateTotal() {
    const price = document.getElementById('price').value;
    const qty = document.getElementById('quantity').value;
    const totalField = document.getElementById('total_display');

    if (price && qty) {
        const total = price * qty;
        totalField.innerText = "الإجمالي: " + total + " ريال";
    }
}

// وظيفة لتغيير الوحدات حسب القسم
function updateUnits() {
    const category = document.getElementById('category').value;
    const unitSelect = document.getElementById('unit');
    
    let options = "";
    if (category === "chemicals") {
        options = '<option>جم</option><option>كجم</option><option>مل</option><option>ل</option>';
    } else if (category === "consumables") {
        options = '<option>حبة</option><option>كرتون</option><option>علبة</option><option>صندوق</option>';
    } else if (category === "devices") {
        options = '<option>جهاز</option>';
    }
    unitSelect.innerHTML = options;
}
