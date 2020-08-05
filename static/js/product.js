let fetchData = {};

async function getProduct() {
  const number = window.location.pathname.substr(10);
  const result = await fetch(`/api/1.0/products/details?number=${number}`).then((res) => res.json());
  document.title = `${result.data.name} | GU 比價 | GU 搜尋`;
  createProduct(result);
}

// Render page
function createProduct(result) {
  document.getElementById('main_image').setAttribute('src', result.data.main_image);
  document.getElementById('name').innerHTML = result.data.name;
  document.getElementById('number').innerHTML = `商品編號 ${result.data.number}`;
  document.getElementById('highest_price').innerHTML = `${result.data.highest_price} 歷史高價`;
  document.getElementById('lowest_price').innerHTML = `${result.data.lowest_price} 歷史低價`;
  document.getElementById('current_price').innerHTML = `${result.data.current_price} </br> 現在售價`;
  document.getElementById('track_price').setAttribute('max', result.data.current_price);
  drawDatePrice(result.data);
  document.getElementById('about').innerHTML = result.data.about;
  document.getElementById('texture').innerHTML = result.data.texture;
  document.getElementById('website').setAttribute('href', `https://www.gu-global.com/tw/store/goods/${result.data.number}`);
  for (let i = 0; i < result.data.images.length; i += 1) {
    const img = document.createElement('img');
    img.setAttribute('class', 'images');
    img.setAttribute('src', result.data.images[i]);
    document.getElementById('images_box').appendChild(img);
  }
  if (localStorage.getItem('favorite')) checkFavorite(result.data.number);
  fetchData = result;
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
  const firtstDay = new Date(data.date[0]).getTime() - 1.5 * oneDay;
  const lastDay = new Date(data.date[data.date.length - 1]).getTime() + 0.5 * oneDay;
  const tickNum = 8;
  const layout = {
    xaxis: {
      tickmode: 'linear',
      tickformat: '%m/%d',
      tickangle: -50,
      tickfont: {
        family: 'Microsoft JhengHei',
        size: 10,
      },
      dtick: (lastDay - firtstDay) / tickNum,
      range: [firtstDay, lastDay],
      fixedrange: true,
    },
    yaxis: {
      fixedrange: true,
      tickfont: {
        family: 'Microsoft JhengHei',
        size: 12,
      },
    },
    height: 210,
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
      b: 35,
      t: 30,
    },
  };
  Plotly.newPlot('date_price', [datePrice], layout, { scrollZoom: false, displayModeBar: false });
}

// Favorite
const favorite = document.getElementById('favorite');
const favoriteIcon = document.getElementById('favoriteIcon');
const favoriteText = document.getElementById('favoriteText');

function checkFavorite(number) {
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
      text: '此商品已在您的收藏清單',
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
    const userFavorite = localStorage.getItem('favorite');
    let addFavorite;
    if (userFavorite == 'undefined' || userFavorite == 'null' || !userFavorite) {
      addFavorite = fetchData.data.number;
    } else {
      addFavorite = `${userFavorite},${fetchData.data.number}`;
    }
    const updateFavorite = {
      favorite: addFavorite,
    };
    const bearer = `Bearer ${localStorage.getItem('token')}`;
    const result = await fetch('/api/1.0/user/favorite', {
      body: JSON.stringify(updateFavorite),
      headers: {
        'content-type': 'application/json',
        Authorization: bearer,
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
        localStorage.setItem('favorite', fetchData.data.number);
      } else {
        localStorage.setItem('favorite', `${userFavorite},${fetchData.data.number}`);
      }
      favoriteIcon.src = '/static/imgs/fullStar.png';
      favoriteText.innerHTML = '已收藏';
      favoriteText.style.color = 'black';
      Swal.fire({
        icon: 'success',
        title: '商品收藏成功！',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }
});

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
  const { number } = fetchData.data;
  const { name } = fetchData.data;
  const currentPrice = fetchData.data.current_price;
  const mainImage = fetchData.data.main_image;
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

window.onload = [getProduct(), getTrackEmail()];
