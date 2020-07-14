/* Product */
const product = {};
async function getAllProducts() {
  const name = window.location.pathname.split('/');
  const result = await fetch(`/api/1.0/products/${name[1]}?type=${name[2]}&paging=0`).then((res) => res.json());
  document.title = `${result.data[0].type} | GU 比價 | GU 搜尋`;
  createProducts(result);
}
function createProducts(result) {
  const viewTitle = document.getElementById('view_title');
  viewTitle.innerHTML = result.data[0].type;
  const products = document.getElementById('products');
  for (let i = 0; i < result.data.length; i += 1) {
    // Create <a class='prdocut'>
    const a = document.createElement('a');
    a.setAttribute('class', 'product');
    a.setAttribute('href', `/products/${result.data[i].number}`);
    // Create <img>, <div clsas='colors'>
    const img = document.createElement('img');
    img.setAttribute('src', result.data[i].main_image);
    a.appendChild(img);
    // Create <div clsas='compare'> <img> <p>
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
  product.data = result.data;
  product.next_paging = result.next_paging;
}
// Scroll to bottom, show more products
window.addEventListener('scroll', async () => {
  // Height of scroll bar
  const scrollBarHeight = document.documentElement.scrollTop;
  // Height of whole page
  const pageHeight = document.documentElement.scrollHeight;
  // Height of browser view
  const viewHeight = document.documentElement.clientHeight;
  if (pageHeight - (scrollBarHeight + viewHeight) < 300 && product.next_paging && product.data) {
    const name = window.location.pathname.split('/');
    product.data = null; // Clear product.data
    const result = await fetch(`/api/1.0/products/${name[1]}?type=${name[2]}&paging=${product.next_paging}`).then((res) => res.json());
    createProducts(result);
  }
});

window.onload = getAllProducts();
