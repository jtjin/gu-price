let all_type = document.getElementById('all_type').innerHTML;
all_type = all_type.split(',');

async function getAllProducts() {
  const name = window.location.pathname.substr(1);
  switch (name) {
    case 'men':
      document.title = '男裝 | GU 比價 | GU 搜尋';
      break;
    case 'women':
      document.title = '女裝 | GU 比價 | GU 搜尋';
      break;
    case 'kids':
      document.title = '童裝 | GU 比價 | GU 搜尋';
      break;
  }
  for (let i = 0; i < all_type.length; i += 1) {
    const result = await fetch(`/api/1.0/products/${name}?type=${all_type[i]}&paging=0`).then((res) => res.json());
    createProducts(all_type[i], result);
  }
}

function createProducts(type, result) {
  const view = document.getElementById('view');
  // Create <div class='view_box'>
  const view_box = document.createElement('div');
  view_box.setAttribute('class', 'view_box');
  // Create <h2>、<a> inside view_box
  const h2 = document.createElement('h2');
  h2.innerHTML = result.data[0].type;
  view_box.appendChild(h2);
  if (result.next_paging) {
    const a = document.createElement('a');
    a.setAttribute('href', `/${result.data[0].category}/${type}`);
    a.innerHTML = '查看更多';
    view_box.appendChild(a);
  }
  // Create <div class='products'>
  const products = document.createElement('div');
  products.setAttribute('class', 'products');
  view.appendChild(view_box);
  view.appendChild(products);
  for (let i = 0; i < result.data.length; i += 1) {
    // Create <a class='prdocut'>
    const a = document.createElement('a');
    a.setAttribute('class', 'product');
    a.setAttribute('href', `/products/${result.data[i].number}`);
    // Create <img>, <div clsas='colors'>
    const img = document.createElement('img');
    img.setAttribute('src', result.data[i].main_image);
    a.appendChild(img);
    // Create <div clsas='name'>
    const div_name = document.createElement('div');
    div_name.setAttribute('class', 'name');
    div_name.innerHTML = result.data[i].name;
    a.appendChild(div_name);
    // Create <div clsas='number'>
    const div_number = document.createElement('div');
    div_number.setAttribute('class', 'number');
    div_number.innerHTML = result.data[i].number;
    a.appendChild(div_number);
    // Create <div clsas='price'>
    const div_price = document.createElement('div');
    div_price.setAttribute('class', 'price');
    div_price.innerHTML = `$${result.data[i].highest_price} ⇢ $${result.data[i].current_price}`;
    a.appendChild(div_price);
    products.appendChild(a);
  }
}

window.onload = getAllProducts();
