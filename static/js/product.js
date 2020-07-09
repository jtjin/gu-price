let product = {};
// Get Product Number from url
async function getProductNumber() {
  const number = window.location.pathname.substr(10);
  const result = await fetch(`/api/1.0/products/details?number=${number}`).then((res) => res.json());
  document.title = `${result.data.name} | GU 比價 | GU 搜尋`;
  showProduct(result);
  product = result;
}
// Render page
function showProduct(result) {
  // main_image
  const mainImage = document.getElementById('main_image');
  mainImage.setAttribute('src', result.data.main_image);
  // name
  const name = document.getElementById('name');
  name.innerHTML = result.data.name;
  // number
  const number = document.getElementById('number');
  number.innerHTML = `商品編號 ${result.data.number}`;
  // track number
  const trackNumber = document.getElementById('track_number');
  trackNumber.value = result.data.number;
  // highest_price
  const highestPrice = document.getElementById('highest_price');
  highestPrice.innerHTML = `${result.data.highest_price} 歷史高價`;
  // lowest_price
  const lowestPrice = document.getElementById('lowest_price');
  lowestPrice.innerHTML = `${result.data.lowest_price} 歷史低價`;
  // current_price
  const currentPrice = document.getElementById('current_price');
  currentPrice.innerHTML = `${result.data.current_price} </br> 現在售價`;
  // price_curve
  drawDatePrice(result.data);
  // about
  const about = document.getElementById('about');
  about.innerHTML = result.data.about;
  // texture
  const texture = document.getElementById('texture');
  texture.innerHTML = result.data.texture;
  // website
  const website = document.getElementById('website');
  website.setAttribute('href', `https://www.gu-global.com/tw/store/goods/${result.data.number}`);
  // images
  for (let i = 0; i < result.data.images.length; i += 1) {
    const img = document.createElement('img');
    img.setAttribute('class', 'images');
    img.setAttribute('src', result.data.images[i]);
    document.getElementById('images_box').appendChild(img);
  }
}
function drawDatePrice(data) {
  const datePrice = {
    x: data.date,
    y: data.price,
    mode: 'lines + markers',
    type: 'scatter',
    fill: 'tozeroy',
  };
  const layout = {
    xaxis: {
      type: 'date',
    },
    height: 200,
    width: 350,
    title: {
      text: '歷史價格折線圖',
      font: {
        family: 'Microsoft JhengHei',
        size: 16,
      },
    },
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };
  Plotly.newPlot('date_price', [datePrice], layout, { scrollZoom: true, displayModeBar: false });
}
window.onload = getProductNumber();

function postData(url, data, cb) {
  return fetch(url, {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => res.json())
    .then((result) => cb(result))
    .catch((err) => console.log(err));
}

// Track
const trackBtn = document.getElementById('track_btn');
trackBtn.addEventListener('click', () => {
  event.preventDefault();
  const number = document.getElementById('track_number').value;
  const price = document.getElementById('track_price').value;
  if (!price) {
    alert('請輸入期望價格');
    return;
  }
  if (price < 0 || price > `${product.data.current_price}`) {
    alert(`價格必須介於 0 至 ${product.data.current_price}`);
    return;
  }
  const email = document.getElementById('track_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    alert('請輸入通知信箱');
    return;
  }
  if (email.search(emailRule) == -1) {
    alert('請輸入正確信箱格式');
    return;
  }
  const data = { number, price, email };
  fetch('/api/1.0/user/track', {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => res.json())
    .then(() => {
      alert('追蹤商品成功!');
      document.getElementById('track_price').value = '';
      document.getElementById('track_email').value = '';
    })
    .catch((err) => console.log(err));
});
