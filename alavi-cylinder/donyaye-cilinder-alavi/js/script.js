/* global XLSX */
/* exported sendMessage, openModal, closeModal, sendOrder, openAbout, closeAbout */

let products = [];

// بارگذاری اکسل
fetch('data/products.xlsx')
  .then(r => r.arrayBuffer())
  .then(ab => {
    const wb = XLSX.read(ab, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    products = XLSX.utils.sheet_to_json(ws, { header: 1 });
  });

// بارگذاری متن درباره‌ما
fetch('data/about.txt')
  .then(r => r.text())
  .then(t => { document.getElementById('about-content').textContent = t; });

// افزودن پیام به چت
function appendChat(role, html) {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = role;
  if (window.DOMPurify) {
    div.innerHTML = window.DOMPurify.sanitize(html, { ADD_ATTR: ['onclick'] });
  } else {
    div.insertAdjacentHTML('beforeend', html);
  }
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// ارسال پیام کاربر
function sendMessage() {
  const inp = document.getElementById('chat-input');
  const q = inp.value.trim().toLowerCase();
  if (!q) return;
  appendChat('user', `<b>شما:</b> ${inp.value}`);
  inp.value = '';
  const found = products.filter(r => r[0] && r[0].toString().toLowerCase().includes(q));
  if (found.length) {
    found.forEach(r => {
      const [name, desc, price, img] = r;
      appendChat('bot', `
        <div class="flex items-start gap-3">
          ${img ? `<img src="${img}" class="w-16 h-16 object-cover rounded">` : ''}
          <div>
            <b>${name}</b><br>${desc}<br>
            <span class="text-purple-600 font-bold">${price}</span>
            <button onclick="openModal('${name}', '${desc}', '${price}', '${img || ''}')" class="text-xs underline ml-2">سفارش</button>
          </div>
        </div>
      `);
    });
  } else {
    appendChat('bot', 'محصولی یافت نشد. لطفاً با شماره‌های زیر تماس بگیرید:\n۰۹۳۷۰۷۶۹۱۹۱ یا ۰۹۹۲۱۳۵۲۰۸۸');
  }
}

// باز کردن مودال محصول
function openModal(name, desc, price, img) {
  document.getElementById('modal-content').innerHTML = `
    ${img ? `<img src="${img}" class="w-full rounded mb-2">` : ''}
    <h3 class="text-lg font-bold mb-1">${name}</h3>
    <p class="text-sm text-gray-700 mb-1">${desc}</p>
    <p class="text-purple-600 font-bold">${price}</p>
  `;
  document.getElementById('product-modal').classList.remove('hidden');
}

// بستن مودال محصول
function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

// ارسال سفارش
function sendOrder(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const platform = document.getElementById('platform').value;
  const text = `سفارش جدید
نام: ${fd.get('name')}
تلفن: ${fd.get('phone')}
شهر: ${fd.get('city')}
نام محصول: ${fd.get('product')}`;
  switch (platform) {
    case 'wa':
      ['989370769191', '989921352088'].forEach(n => window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`, '_blank'));
      break;
    case 'tg':
      window.open(`https://t.me/SilinderAlaviBot?start=${encodeURIComponent(text)}`, '_blank');
      break;
    case 'rub':
      window.open(`rubika://sendmessage?text=${encodeURIComponent(text)}&phone=989370769191`, '_blank');
      break;
  }
}

// باز و بستن مودال درباره ما
function openAbout() {
  document.getElementById('about-modal').classList.remove('hidden');
}
function closeAbout() {
  document.getElementById('about-modal').classList.add('hidden');
}
