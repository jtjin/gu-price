async function getProfile() {
  if (!localStorage.getItem('token')) {
    // Check if token is available
    alert('Invalid acess, please signup or login!');
    window.location.href = '/';
  } else {
    const bearer = `Bearer ${localStorage.getItem('token')}`;
    const result = await fetch('/api/1.0/user/profile', {
      headers: {
        Authorization: bearer,
      },
    }).then((res) => res.json());
    // Check if token correct
    if (result.error) {
      alert('Invalid acess, please signup or login!');
      localStorage.clear();
      window.location.href = '/';
    }
    // Check if token expired
    const time = (new Date() - new Date(result.data.login_at)) / 1000;
    if (time <= result.data.access_expired) {
      createProfile(result.data);
    } else {
      alert('Your token has expired, please login again!');
      localStorage.clear();
      window.location.href = '/';
    }
  }
}

async function createProfile(data) {
  // Create photo
  document.getElementById('photo').src = data.picture ? data.picture : '/static/imgs/user.png';
  // Create name
  document.getElementById('name').innerHTML = data.name;
  // Create email
  document.getElementById('email').innerHTML = `電子信箱：${data.email}`;
  // Create loginAt
  document.getElementById('loginAt').innerHTML = `上次登入時間：${new Date(data.login_at)}`;
  // Create favorite
  localStorage.setItem('favorite', data.favorite);
  if (!data.favorite) {
    document.getElementById('msg').innerHTML = '尚無收藏任何商品';
  } else {
    const result = await createFavorite(data.favorite);
    if (result == 0) {
      document.getElementById('msg').innerHTML = '尚無收藏任何商品';
    }
  }
}

async function createFavorite(favorite) {
  favorite = favorite.split(',');
  let result = 0;
  for (let i = 0; i < favorite.length; i += 1) {
    const data = await fetch(`/api/1.0/products/details?number=${favorite[i]}`).then((res) => res.json());
    if (data.data) {
      createProducts(data.data);
      result += 1;
    }
  }
  return result;
}

function createProducts(data) {
  const products = document.getElementById('products');
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

//  function logOut() {
// localStorage.clear()
//    localStorage.removeItem('token');
// localStorage.removeItem('photo');
// localStorage.removeItem('favorite');
// localStorage.removeItem('id');
//    window.location.href = './';
//  }

window.onload = getProfile();
