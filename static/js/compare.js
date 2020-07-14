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
  // create <img>
  const img = document.createElement('img');
  img.setAttribute('src', result.data.main_image);
  div.appendChild(img);
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

// const favorite = document.getElementById('favorite');
// const favoriteIcon = document.getElementById('favoriteIcon');
// const favoriteText = document.getElementById('favoriteText');

// function checkFavorite(number) {
//   // check if item in userFavorite
//   const userFavorite = localStorage.getItem('favorite').split(',');
//   const duplicateFavorite = userFavorite.find((p) => p == number);
//   if (duplicateFavorite) {
//     favoriteIcon.src = '/static/imgs/fullStar.png';
//     favoriteText.innerHTML = '已收藏';
//     favoriteText.style.color = 'black';
//   }
// }
// favorite.addEventListener('click', async () => {
//   if (!localStorage.getItem('id')) {
//     alert('請先登入再收藏商品');
//     return;
//   }
//   if (favoriteText.innerHTML == '已收藏') {
//     alert('此商品已在您的商藏清單');
//   } else {
//     const userFavorite = localStorage.getItem('favorite');
//     if (userFavorite == 'undefined' || userFavorite == 'null' || !userFavorite) {
//       localStorage.setItem('favorite', product.data.number);
//     } else {
//       localStorage.setItem('favorite', `${userFavorite},${product.data.number}`);
//     }
//     // Post the updateFavorite to server
//     const updateFavorite = {
//       favorite: localStorage.getItem('favorite'),
//       id: localStorage.getItem('id'),
//     };
//     const result = await fetch('/api/1.0/favorite', {
//       body: JSON.stringify(updateFavorite),
//       headers: {
//         'content-type': 'application/json',
//       },
//       method: 'POST',
//     }).then((res) => res.json());

//     if (result.error) {
//       alert('收藏失敗');
//     } else {
//       favoriteIcon.src = '/static/imgs/fullStar.png';
//       favoriteText.innerHTML = '已收藏';
//       favoriteText.style.color = 'black';
//       alert('商品收藏成功');
//     }
//   }
// });

// function postData(url, data, cb) {
//   return fetch(url, {
//     body: JSON.stringify(data),
//     headers: {
//       'content-type': 'application/json',
//     },
//     method: 'POST',
//   })
//     .then((res) => res.json())
//     .then((result) => cb(result))
//     .catch((err) => console.log(err));
// }

// // Track
// const trackBtn = document.getElementById('track_btn');

// function getTrackEmail() {
//   if (localStorage.getItem('email')) {
//     document.getElementById('track_email').value = localStorage.getItem('email');
//   }
// }

// trackBtn.addEventListener('click', () => {
//   event.preventDefault();
//   const number = document.getElementById('track_number').value;
//   const price = document.getElementById('track_price').value;
//   if (!price) {
//     alert('請輸入期望價格');
//     return;
//   }
//   if (price < 0 || price > `${product.data.current_price}`) {
//     alert(`價格必須介於 0 至 ${product.data.current_price}`);
//     return;
//   }
//   const email = document.getElementById('track_email').value;
//   const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
//   if (!email) {
//     alert('請輸入通知信箱');
//     return;
//   }
//   if (email.search(emailRule) == -1) {
//     alert('請輸入正確信箱格式');
//     return;
//   }
//   const data = { number, price, email };
//   fetch('/api/1.0/user/track', {
//     body: JSON.stringify(data),
//     headers: {
//       'content-type': 'application/json',
//     },
//     method: 'POST',
//   })
//     .then((res) => res.json())
//     .then(() => {
//       alert('追蹤商品成功!');
//       document.getElementById('track_price').value = '';
//       document.getElementById('track_email').value = '';
//     })
//     .catch((err) => console.log(err));
// });

window.onload = getProductNumber();
