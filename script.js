function processDisbursement(status) {
    const requester = document.getElementById('requesterName').value;
    const qty = document.getElementById('requestQty').value;
    const available = parseInt(document.getElementById('availableQty').innerText);

    if (status === 'rejected') {
        alert("تم رفض الطلب وحفظه في سجل المرفوضات.");
        window.location.href = "index.html";
        return;
    }

    if (!requester || !qty) {
        alert("يرجى إكمال بيانات الطالب والكمية.");
        return;
    }

    if (parseInt(qty) > available) {
        alert("عذراً، الكمية المطلوبة أكبر من المتوفر في الرصيد!");
        return;
    }

    // هنا ستتم عملية الخصم الحقيقية من ملفات الـ JSON لاحقاً
    const newBalance = available - parseInt(qty);
    alert(`تمت الموافقة!\nالمستلم: ${requester}\nالكمية المتبقية في المستودع: ${newBalance}`);
    
    // العودة للرئيسية
    window.location.href = "dashboard.html";
}
