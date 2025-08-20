
(function(){
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

function validateNotEmpty(value, fieldName) {
  if (!value || String(value).trim() === '') {
    return { ok: false, message: fieldName + ' is required.' };
  }
  return { ok: true, message: '' };
}
function validatePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  const valid = digits.length === 10 && /^0[1-9]\d{8}$/.test(digits);
  return { ok: valid, message: valid ? '' : 'Phone must be 10 digits and start with 0 (e.g., 0637087784).' };
}
function calculateItemTotal(qty, price) {
  const q = Number(qty) || 0;
  const p = Number(price) || 0;
  return +(q * p).toFixed(2);
}
function computeOrderSummary(items, fulfilment, discountCode) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal += calculateItemTotal(items[i].qty, items[i].price);
  }
  let discount = 0;
  if (discountCode && subtotal >= 500 && discountCode.trim().toUpperCase() === 'BUILD5') {
    discount = +(subtotal * 0.05).toFixed(2);
  }
  let deliveryFee = 0;
  if (fulfilment === 'Delivery' && subtotal - discount < 1500) {
    deliveryFee = 80;
  }
  const vat = +(((subtotal - discount + deliveryFee) * 0.15)).toFixed(2);
  const total = +((subtotal - discount + deliveryFee + vat)).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), discount, deliveryFee, vat, total };
}
function renderSummary(summaryObj) {
  const el = document.getElementById('summaryOutput');
  if (!el) return;
  el.innerHTML = [
    `Subtotal: R${summaryObj.subtotal.toFixed(2)}`,
    `Discount: -R${summaryObj.discount.toFixed(2)}`,
    `Delivery: R${summaryObj.deliveryFee.toFixed(2)}`,
    `VAT (15%): R${summaryObj.vat.toFixed(2)}`,
    `<strong>Total: R${summaryObj.total.toFixed(2)}</strong>`
  ].join('<br/>');
}
function handleOrderRecalc() {
  const items = [];
  const map = [
    { chk: 'pHammer', qty: 'qHammer' },
    { chk: 'pDrill',  qty: 'qDrill'  },
    { chk: 'pPaint',  qty: 'qPaint'  },
    { chk: 'pLadder', qty: 'qLadder' },
  ];
  map.forEach(row => {
    const chk = document.getElementById(row.chk);
    const qtyEl = document.getElementById(row.qty);
    if (chk && qtyEl && chk.checked) {
      const price = Number(chk.dataset.price || 0);
      const qty = Number(qtyEl.value || 0);
      if (qty > 0) {
        items.push({ name: chk.value, qty, price });
      }
    }
  });
  const fulfilment = document.querySelector('input[name="fulfil"]:checked')?.value || 'Delivery';
  const discountCode = document.getElementById('discountCode')?.value || '';
  const summary = computeOrderSummary(items, fulfilment, discountCode);
  renderSummary(summary);
  return summary;
}
function handleOrderSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const vName = validateNotEmpty(name, 'Full Name');
  if (!vName.ok) { alert(vName.message); return; }
  const vPhone = validatePhone(phone);
  if (!vPhone.ok) { alert(vPhone.message); return; }
  const summary = handleOrderRecalc();
  if (summary.total <= 0) {
    alert('Please select at least one product with quantity before submitting.');
    return;
  }
  alert('Order submitted! Total payable: R' + summary.total.toFixed(2));
}
function initOrderPage() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(inp => {
    inp.addEventListener('change', handleOrderRecalc);
    if (inp.type === 'number' || inp.type === 'text') {
      inp.addEventListener('input', handleOrderRecalc);
    }
  });
  form.addEventListener('submit', handleOrderSubmit);
  handleOrderRecalc();
}
function initContactPage() {
  const cForm = document.getElementById('contactForm');
  if (!cForm) return;
  cForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('cName').value;
    const msg = document.getElementById('cMsg').value;
    const v1 = validateNotEmpty(name, 'Your Name');
    const v2 = validateNotEmpty(msg, 'Message');
    if (!v1.ok) return alert(v1.message);
    if (!v2.ok) return alert(v2.message);
    alert('Thanks, ' + name + '! Your message has been sent.');
  });
}
document.addEventListener('DOMContentLoaded', function(){
  initOrderPage();
  initContactPage();
});
