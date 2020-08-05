let fetchData = {};

async function getAllProducts() {
  const category = window.location.pathname.split('/')[1];
  const type = window.location.pathname.split('/')[2];
  const results = await fetch(`/api/1.0/products/${category}?type=${type}&paging=0`).then((res) => res.json());
  document.title = `${results.data[0].chinese_type} | GU 比價 | GU 搜尋`;
  createProduct(results);
}

function createProduct(results) {
  document.getElementById('view_title').innerHTML = results.data[0].chinese_type;
  const products = document.getElementById('products');
  for (let i = 0; i < results.data.length; i += 1) {
    // Create <a class='product'>
    const a = document.createElement('a');
    a.setAttribute('class', 'product');
    a.setAttribute('href', `/products/${results.data[i].number}`);
    // Create <img>, <div clsas='colors'>
    const img = document.createElement('img');
    img.setAttribute('src', results.data[i].main_image);
    a.appendChild(img);
    // Create <div clsas='compare'> <img> <p>
    const divCompare = document.createElement('div');
    const imgCompare = document.createElement('img');
    const pCompare = document.createElement('p');
    divCompare.setAttribute('class', 'compare');
    divCompare.setAttribute('onclick', 'updateCompare()');
    imgCompare.setAttribute('number', results.data[i].number);
    // Check user's compare
    let userCompare = sessionStorage.getItem('compare');
    if (userCompare == 'undefined' || userCompare == 'null' || userCompare == '' || !userCompare) {
      imgCompare.setAttribute('src', '/static/imgs/unchecked.png');
    } else {
      userCompare = userCompare.split(',');
      const duplicateCompare = userCompare.find((p) => p == results.data[i].number);
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
    divName.innerHTML = results.data[i].name;
    a.appendChild(divName);
    // Create <div clsas='number'>
    const divNumber = document.createElement('div');
    divNumber.setAttribute('class', 'number');
    divNumber.innerHTML = results.data[i].number;
    a.appendChild(divNumber);
    // Create <div clsas='price'>
    const divPrice = document.createElement('div');
    divPrice.setAttribute('class', 'price');
    divPrice.innerHTML = `$${results.data[i].highest_price} ⇢ $${results.data[i].current_price}`;
    if (results.data[i].current_price < results.data[i].highest_price) {
      divPrice.innerHTML += '<br><span style="color: red"><b>※特價商品</b></span>';
    }
    a.appendChild(divPrice);
    products.appendChild(a);
  }
  fetchData = results;
}

// Scroll to bottom, show more products
window.addEventListener('scroll', async () => {
  const scrollBarHeight = document.documentElement.scrollTop;
  const pageHeight = document.documentElement.scrollHeight;
  const viewHeight = document.documentElement.clientHeight;
  if (pageHeight - (scrollBarHeight + viewHeight) < 300 && fetchData.next_paging && fetchData.data) {
    const category = window.location.pathname.split('/')[1];
    const type = window.location.pathname.split('/')[2];
    fetchData.data = null;
    const results = await fetch(`/api/1.0/products/${category}?type=${type}&paging=${fetchData.next_paging}`).then((res) => res.json());
    createProduct(results);
  }
});

window.onload = getAllProducts();
