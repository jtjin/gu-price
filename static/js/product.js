// Get Product Number from url
async function getProductNumber() {
  const number = window.location.pathname.substr(10);
  const result = await fetch(`/api/1.0/products/details?number=${number}`).then((res) => res.json());
  document.title = `${result.data.name} | GU 比價 | GU 搜尋`;
  showProduct(result);
}
// Render page
function showProduct(result) {
  // main_image
  const main_image = document.getElementById('main_image');
  main_image.setAttribute('src', result.data.main_image);
  // name
  const name = document.getElementById('name');
  name.innerHTML = result.data.name;
  // number
  const number = document.getElementById('number');
  number.innerHTML = `商品編號 ${result.data.number}`;
  // highest_price
  const highest_price = document.getElementById('highest_price');
  highest_price.innerHTML = `${result.data.highest_price} 歷史高價`;
  // lowest_price
  const lowest_price = document.getElementById('lowest_price');
  lowest_price.innerHTML = `${result.data.lowest_price} 歷史低價`;
  // current_price
  const current_price = document.getElementById('current_price');
  current_price.innerHTML = `${result.data.current_price} </br> 現在售價`;
  // price_curve
  drawDatePrice(result.data);
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
  const date_price = {
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
    height: 250,
    title: '歷史價格折線圖',
    margin: {
      l: 30,
      r: 20,
      b: 30,
      t: 30,
    },
  };
  Plotly.newPlot('date_price', [date_price], layout);
}
window.onload = getProductNumber();
