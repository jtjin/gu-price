let product = {};
// Get Product Number from url
async function getProductNumber() {
  const number = window.location.pathname.substr(10);
  const result = await fetch(`/api/1.0/products/details?number=${number}`).then((res) => res.json());
  document.title = `${result.data.name} | GU 比價 | GU 搜尋`;
  product = result;
  showProduct(result);
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
  // highest_price
  const highestPrice = document.getElementById('highest_price');
  highestPrice.innerHTML = `${result.data.highest_price} 歷史高價`;
  // lowest_price
  const lowestPrice = document.getElementById('lowest_price');
  lowestPrice.innerHTML = `${result.data.lowest_price} 歷史低價`;
  // current_price
  const currentPrice = document.getElementById('current_price');
  currentPrice.innerHTML = `${result.data.current_price} </br> 現在售價`;
  document.getElementById('track_price').setAttribute('max', result.data.current_price);
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
  // favorite
  if (localStorage.getItem('favorite')) checkFavorite(result.data.number);
}
function drawDatePrice(data) {
  const datePrice = {
    x: data.date,
    y: data.price,
    mode: 'lines+markers',
    type: 'scatter',
    fill: 'tozeroy',
  };
  const oneDay = 24 * 60 * 60 * 1000;
  const firtstDay = new Date(data.date[0]).getTime() - oneDay;
  const lastDay = new Date(data.date[data.date.length - 1]).getTime();
  const layout = {
    xaxis: {
      type: 'date',
      range: [firtstDay, lastDay],
      fixedrange: true,
    },
    yaxis: {
      fixedrange: true,
    },
    height: 200,
    width: 320,
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
  Plotly.newPlot('date_price', [datePrice], layout, { scrollZoom: false, displayModeBar: false });
}

const favorite = document.getElementById('favorite');
const favoriteIcon = document.getElementById('favoriteIcon');
const favoriteText = document.getElementById('favoriteText');

function checkFavorite(number) {
  // check if item in userFavorite
  const userFavorite = localStorage.getItem('favorite').split(',');
  const duplicateFavorite = userFavorite.find((p) => p == number);
  if (duplicateFavorite) {
    favoriteIcon.src = '/static/imgs/fullStar.png';
    favoriteText.innerHTML = '已收藏';
    favoriteText.style.color = 'black';
  }
}

favorite.addEventListener('click', async () => {
  if (!localStorage.getItem('token')) {
    Swal.fire({
      icon: 'warning',
      text: '請先登入再收藏商品',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (favoriteText.innerHTML == '已收藏') {
    Swal.fire({
      icon: 'warning',
      text: '此商品已在您的商藏清單',
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
    const userFavorite = localStorage.getItem('favorite');
    let addFavorite;
    if (userFavorite == 'undefined' || userFavorite == 'null' || !userFavorite) {
      addFavorite = product.data.number;
    } else {
      addFavorite = `${userFavorite},${product.data.number}`;
    }
    // Post the updateFavorite to server
    const updateFavorite = {
      favorite: addFavorite,
      access_token: localStorage.getItem('token'),
    };
    const result = await fetch('/api/1.0/favorite', {
      body: JSON.stringify(updateFavorite),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    }).then((res) => res.json());

    if (result.error) {
      Swal.fire({
        icon: 'error',
        title: '商品收藏失敗！',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      if (userFavorite == 'undefined' || userFavorite == 'null' || !userFavorite) {
        localStorage.setItem('favorite', product.data.number);
      } else {
        localStorage.setItem('favorite', `${userFavorite},${product.data.number}`);
      }
      favoriteIcon.src = '/static/imgs/fullStar.png';
      favoriteText.innerHTML = '已收藏';
      favoriteText.style.color = 'black';
      Swal.fire({
        icon: 'success',
        title: '商品商藏成功！',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }
});

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

function getTrackEmail() {
  if (localStorage.getItem('email')) {
    document.getElementById('track_email').value = localStorage.getItem('email');
    document.getElementById('track_email').setAttribute('readonly', 'true');
  }
}

trackBtn.addEventListener('click', () => {
  event.preventDefault();
  if (!localStorage.getItem('token')) {
    Swal.fire({
      icon: 'warning',
      text: '請先登入再追蹤商品',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const { number } = product.data;
  const { name } = product.data;
  const currentPrice = product.data.current_price;
  const mainImage = product.data.main_image;
  const price = document.getElementById('track_price').value;
  if (!price) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入期望價格',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (price < 0 || price >= currentPrice) {
    Swal.fire({
      icon: 'warning',
      text: `價格必須介於 0 至 ${currentPrice}`,
      confirmButtonColor: '#3085d6',
      confirmButtonText: '我知道了',
    });
    return;
  }
  const email = document.getElementById('track_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入通知信箱',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (email.search(emailRule) == -1) {
    Swal.fire({
      icon: 'error',
      text: 'Email 格式錯誤',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const userId = localStorage.getItem('id');
  const data = {
    name, number, mainImage, currentPrice, price, email, userId,
  };
  Swal.fire({
    imageUrl: '/static/imgs/spinner.gif',
    showConfirmButton: false,
    allowOutsideClick: false,
  });
  fetch('/api/1.0/user/track', {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => res.json())
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '商品追蹤成功！',
        showConfirmButton: false,
        timer: 1500,
      });
      document.getElementById('track_price').value = '';
      if (!localStorage.getItem('email')) {
        document.getElementById('track_email').value = '';
      }
    })
    .catch((err) => {
      Swal.fire({
        icon: 'error',
        title: '商品追蹤失敗！',
        showConfirmButton: false,
        timer: 1500,
      });
      console.log(err);
    });
});

window.onload = [getProductNumber(), getTrackEmail()];
