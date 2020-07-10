const imageSearch = document.getElementById('image_search').innerHTML;
const loadingGif = document.getElementById('loading_gif');
const products = document.getElementById('products');

async function getAllProducts() {
  const allImageUrls = await fetch('/api/1.0/products/imageSearch').then((res) => res.json());
  for (let i = 0; i < allImageUrls.length; i += 1) {
    const result = await imageSimilarity(imageSearch, allImageUrls[i].main_image);
    if (result.output.distance < 20) {
      const data = await fetch(`/api/1.0/products/details?number=${allImageUrls[i].number}`).then((res) => res.json());
      createProducts(data.data);
    }
  }
  loadingGif.style.display = 'none';
  if (!products.innerHTML) {
    const msg = document.getElementById('msg');
    msg.innerHTML = '我們無法找到符合此圖片的任何項目。';
  }
}

async function imageSimilarity(image1, image2) {
  return await deepai.callStandardApi('image-similarity', { image1, image2 });
}

function createProducts(data) {
  // Create <a class='prdocut'>
  const a = document.createElement('a');
  a.setAttribute('class', 'product');
  a.setAttribute('href', `/products/${data.number}`);
  // Create <img>, <div clsas='colors'>
  const img = document.createElement('img');
  img.setAttribute('src', data.main_image);
  a.appendChild(img);
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
