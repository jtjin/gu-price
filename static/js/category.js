let allType = document.getElementById('all_type').innerHTML;
allType = allType.split(',');

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
  for (let i = 0; i < allType.length; i += 1) {
    const result = await fetch(`/api/1.0/products/${name}?type=${allType[i]}&paging=0`).then((res) => res.json());
    createProducts(allType[i], result);
  }
}

function createProducts(type, result) {
  const view = document.getElementById('view');
  // Create <div class='view_box'>
  const viewBox = document.createElement('div');
  viewBox.setAttribute('class', 'view_box');
  // Create <h2>、<a> inside view_box
  const h2 = document.createElement('h2');
  h2.innerHTML = result.data[0].type;
  viewBox.appendChild(h2);
  if (result.next_paging) {
    const a = document.createElement('a');
    a.setAttribute('href', `/${result.data[0].category}/${type}`);
    a.innerHTML = '查看更多';
    viewBox.appendChild(a);
  }
  // Create <div class='products'>
  const products = document.createElement('div');
  products.setAttribute('class', 'products');
  view.appendChild(viewBox);
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
    // Create <div class='compare'> <img> <p>
    const divCompare = document.createElement('div');
    const imgCompare = document.createElement('img');
    const pCompare = document.createElement('p');
    divCompare.setAttribute('class', 'compare');
    divCompare.setAttribute('onclick', 'updateCompare()');
    imgCompare.setAttribute('number', result.data[i].number);
    // check if item in userCompare
    let userCompare = sessionStorage.getItem('compare');
    if (userCompare == 'undefined' || userCompare == 'null' || userCompare == '' || !userCompare) {
      imgCompare.setAttribute('src', '/static/imgs/unchecked.png');
    } else {
      userCompare = userCompare.split(',');
      const duplicateCompare = userCompare.find((p) => p == result.data[i].number);
      if (duplicateCompare) {
        imgCompare.setAttribute('src', '/static/imgs/checked.png');
      } else {
        imgCompare.setAttribute('src', '/static/imgs/unchecked.png');
      }
    }
    pCompare.innerHTML = '加入比較表';
    divCompare.appendChild(imgCompare);
    divCompare.appendChild(pCompare);
    a.appendChild(divCompare);
    // Create <div clsas='name'>
    const divName = document.createElement('div');
    divName.setAttribute('class', 'name');
    divName.innerHTML = result.data[i].name;
    a.appendChild(divName);
    // Create <div clsas='number'>
    const divNumber = document.createElement('div');
    divNumber.setAttribute('class', 'number');
    divNumber.innerHTML = result.data[i].number;
    a.appendChild(divNumber);
    // Create <div clsas='price'>
    const divPrice = document.createElement('div');
    divPrice.setAttribute('class', 'price');
    divPrice.innerHTML = `$${result.data[i].highest_price} ⇢ $${result.data[i].current_price}`;
    a.appendChild(divPrice);
    products.appendChild(a);
  }
}

window.onload = getAllProducts();
