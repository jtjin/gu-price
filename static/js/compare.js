const product = {};
// Get Product Number from sessionStorage
async function getProductNumber() {
  let userCompare = sessionStorage.getItem('compare');
  if (userCompare) {
    userCompare = userCompare.split(',');
    for (let i = 0; i < userCompare.length; i += 1) {
      const result = await fetch(`/api/1.0/products/details?number=${userCompare[i]}`).then((res) => res.json());
      await showProduct(result);
      await drawDatePrice(result.data);
    }
  } else {
    document.getElementById('products').remove();
    document.getElementById('msg').innerHTML = '比較表空空的耶';
  }
}
// Render page
async function showProduct(result) {
  const productsUl = document.getElementById('products_ul');
  // create <li class='product'>
  const li = document.createElement('li');
  li.setAttribute('class', 'product');
  // create <div class='productInfo'>
  const div = document.createElement('div');
  div.setAttribute('class', 'productInfo');
  li.appendChild(div);
  // create <a>
  const aImg = document.createElement('a');
  aImg.setAttribute('href', `/products/${result.data.number}`);
  div.appendChild(aImg);
  // create <img>
  const img = document.createElement('img');
  img.setAttribute('src', result.data.main_image);
  aImg.appendChild(img);
  // create <div class='name'>
  const divName = document.createElement('div');
  divName.setAttribute('class', 'name');
  divName.innerHTML = result.data.name;
  div.appendChild(divName);
  // create <div class='price'>
  const divPrice = document.createElement('div');
  divPrice.setAttribute('class', 'price');
  div.appendChild(divPrice);
  // create <div class='high_low_price'>
  const highLowPrice = document.createElement('div');
  highLowPrice.setAttribute('class', 'high_low_price');
  divPrice.appendChild(highLowPrice);
  // create <div class='highest_price'>
  const highestPrice = document.createElement('div');
  highestPrice.setAttribute('class', 'highest_price');
  highestPrice.innerHTML = `${result.data.highest_price} 歷史高價`;
  highLowPrice.appendChild(highestPrice);
  // create <div class='lowest_price'>
  const lowestPrice = document.createElement('div');
  lowestPrice.setAttribute('class', 'lowest_price');
  lowestPrice.innerHTML = `${result.data.lowest_price} 歷史低價`;
  highLowPrice.appendChild(lowestPrice);
  // create <div class='current_price'>
  const currentPrice = document.createElement('div');
  currentPrice.setAttribute('class', 'current_price');
  currentPrice.innerHTML = `${result.data.current_price} </br> 現在售價`;
  divPrice.appendChild(currentPrice);
  // create <div class='priceCurve'>
  const divPriceCurve = document.createElement('div');
  divPriceCurve.setAttribute('class', 'priceCurve');
  divPriceCurve.setAttribute('id', result.data.number);
  div.appendChild(divPriceCurve);
  productsUl.appendChild(li);
}

async function drawDatePrice(data) {
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
    height: 180,
    width: 220,
    title: {
      text: '歷史價格折線圖',
      font: {
        family: 'Microsoft JhengHei',
        size: 14,
      },
    },
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };
  Plotly.newPlot(`${data.number}`, [datePrice], layout, { scrollZoom: true, displayModeBar: false });
}

document.getElementById('back').addEventListener('click', () => {
  history.back();
});

window.onload = getProductNumber();