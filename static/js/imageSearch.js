const url = document.getElementById('image_url').getAttribute('src');
const object = document.getElementById('object').innerHTML;
const loadingGif = document.getElementById('loading_gif');

async function getAllProducts() {
  if (document.getElementById('msg').innerHTML) {
    // No file upload
    loadingGif.style.display = 'none';
    await Swal.fire({
      icon: 'warning',
      text: document.getElementById('msg').innerHTML,
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
    window.location.href = '/';
    return;
  }

  document.getElementById('image_url').style.display = 'inline-block';
  const uploadImage = { url, object };
  const similarProducts = await fetch('/api/1.0/imageSearch', {
    body: JSON.stringify(uploadImage),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  }).then((res) => res.json());

  if (similarProducts.error) {
    loadingGif.style.display = 'none';
    if (similarProducts.error.code == 5) {
      // no similar product
      await Swal.fire({
        icon: 'warning',
        title: '我們無法找到符合此圖片的任何項目。',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '確定',
      });
      window.location.href = '/';
      return;
    }
    // access URL problem
    await Swal.fire({
      icon: 'warning',
      text: '圖片上傳失敗，請再嘗試一次。',
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
    window.location.href = '/';
    return;
  }

  let count = 0;
  for (let i = 0; i < similarProducts.length; i += 1) {
    // get product detail with number
    const result = await fetch(`/api/1.0/products/details?number=${similarProducts[i].number}`).then((res) => res.json());
    if (result.data) {
      createProduct(result, similarProducts[i].imageUrl);
      count += 1;
    }
  }
  loadingGif.style.display = 'none';
  if (count === 0) {
    await Swal.fire({
      icon: 'warning',
      title: '我們無法找到符合此圖片的任何項目。',
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
    window.location.href = '/';
  }
}

function createProduct(result, imageUrl) {
  const products = document.getElementById('products');
  // Create <a class='product'>
  const a = document.createElement('a');
  a.setAttribute('class', 'product');
  a.setAttribute('href', `/products/${result.data.number}`);
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
  imgCompare.setAttribute('number', result.data.number);
  // check if item in userCompare
  let userCompare = sessionStorage.getItem('compare');
  if (userCompare == 'undefined' || userCompare == 'null' || userCompare == '' || !userCompare) {
    imgCompare.setAttribute('src', '/static/imgs/unchecked.png');
  } else {
    userCompare = userCompare.split(',');
    const duplicateCompare = userCompare.find((p) => p == result.data.number);
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
  divName.innerHTML = result.data.name;
  a.appendChild(divName);
  // Create <div clsas='number'>
  const divNumber = document.createElement('div');
  divNumber.setAttribute('class', 'number');
  divNumber.innerHTML = result.data.number;
  a.appendChild(divNumber);
  // Create <div clsas='price'>
  const divPrice = document.createElement('div');
  divPrice.setAttribute('class', 'price');
  divPrice.innerHTML = `$${result.data.highest_price} ⇢ $${result.data.current_price}`;
  if (result.data.current_price < result.data.highest_price) {
    divPrice.innerHTML += '<br><span style="color: red"><b>※特價商品</b></span>';
  }
  a.appendChild(divPrice);
  products.appendChild(a);
}

window.onload = getAllProducts();
