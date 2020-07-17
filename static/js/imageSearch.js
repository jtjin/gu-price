const url = document.getElementById('image_url').getAttribute('src');
const object = document.getElementById('object').innerHTML;
const loadingGif = document.getElementById('loading_gif');
const products = document.getElementById('products');

async function getAllProducts() {
  if (document.getElementById('msg').innerHTML) {
    // No file upload
    loadingGif.style.display = 'none';
    return;
  }

  const uploadImage = { url, object };
  const similarProducts = await fetch('/api/1.0/imageSearch', {
    body: JSON.stringify(uploadImage),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  }).then((res) => res.json());

  if (similarProducts.error) {
    console.log(similarProducts.error);
    loadingGif.style.display = 'none';
    const msg = document.getElementById('msg');
    if (similarProducts.error.code == 5) {
      // no similar product
      msg.innerHTML = '我們無法找到符合此圖片的任何項目。';
      return;
    }
    // access URL problem
    msg.innerHTML = '請再嘗試一次。';
    return;
  }

  for (let i = 0; i < similarProducts.length; i += 1) {
    // get product detail with number
    const data = await fetch(`/api/1.0/products/details?number=${similarProducts[i].number}`).then((res) => res.json());
    createProducts(data.data, similarProducts[i].imageUrl);
  }
  loadingGif.style.display = 'none';
}

function createProducts(data, imageUrl) {
  // Create <a class='prdocut'>
  const a = document.createElement('a');
  a.setAttribute('class', 'product');
  a.setAttribute('href', `/products/${data.number}`);
  // Create <img>, <div clsas='colors'>
  const img = document.createElement('img');
  img.setAttribute('src', imageUrl);
  a.appendChild(img);
  // Create <div clsas='compare'> <img> <p>
  const divCompare = document.createElement('div');
  const imgCompare = document.createElement('img');
  const pCompare = document.createElement('p');
  divCompare.setAttribute('class', 'compare');
  divCompare.setAttribute('onclick', 'updateCompare()');
  imgCompare.setAttribute('number', data.number);
  // check if item in userCompare
  let userCompare = sessionStorage.getItem('compare');
  if (userCompare == 'undefined' || userCompare == 'null' || userCompare == '' || !userCompare) {
    imgCompare.setAttribute('src', '/static/imgs/unchecked.png');
  } else {
    userCompare = userCompare.split(',');
    const duplicateCompare = userCompare.find((p) => p == data.number);
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
  divName.innerHTML = data.name;
  a.appendChild(divName);
  // Create <div clsas='number'>
  const divNumber = document.createElement('div');
  divNumber.setAttribute('class', 'number');
  divNumber.innerHTML = data.number;
  a.appendChild(divNumber);
  // Create <div clsas='price'>
  const divPrice = document.createElement('div');
  divPrice.setAttribute('class', 'price');
  divPrice.innerHTML = `$${data.highest_price} ⇢ $${data.current_price}`;
  a.appendChild(divPrice);
  products.appendChild(a);
}

window.onload = getAllProducts();
