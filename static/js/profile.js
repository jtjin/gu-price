async function getProfile() {
  if (!localStorage.getItem('token')) {
    // Check if token is available
    await Swal.fire({
      icon: 'error',
      title: '存取無效！',
      text: '請註冊帳號或登入會員',
      showConfirmButton: false,
      timer: 1500,
    });
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
      await Swal.fire({
        icon: 'warning',
        text: result.error,
        showConfirmButton: false,
        timer: 1500,
      });
      localStorage.clear();
      window.location.href = '/';
    }
    // Check if token expired
    const time = (new Date() - new Date(result.data.login_at)) / 1000;
    if (time <= result.data.access_expired) {
      createProfile(result.data);
    } else {
      await Swal.fire({
        icon: 'warning',
        text: '您的存取權杖已過期，請重新登入',
        showConfirmButton: false,
        timer: 1500,
      });
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
  // Create <div class='delete'>
  const divDelete = document.createElement('div');
  const imgDelete = document.createElement('img');
  divDelete.setAttribute('class', 'delete');
  imgDelete.setAttribute('src', '/static/imgs/remove.png');
  imgDelete.setAttribute('onclick', 'deleteFavorite()');
  divDelete.appendChild(imgDelete);
  a.appendChild(divDelete);
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

async function deleteFavorite() {
  event.preventDefault();
  const product = event.target.parentElement.parentElement;
  Swal.fire({
    title: '確定要移除收藏嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.value) {
      let number = product.getElementsByClassName('number');
      number = number[0].innerHTML;
      // Post the updateFavorite to server
      let userFavorite = localStorage.getItem('favorite').split(',');
      const deleteFavoriteIndex = userFavorite.findIndex((p) => p == number);
      userFavorite.splice(deleteFavoriteIndex, 1);
      userFavorite = userFavorite.join(',');
      const updateFavorite = {
        favorite: userFavorite,
        id: localStorage.getItem('id'),
      };
      const result = await fetch('/api/1.0/favorite', {
        body: JSON.stringify(updateFavorite),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      }).then((res) => res.json());

      if (result.error) {
        await Swal.fire({
          icon: 'error',
          title: '收藏移除失敗',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: '收藏移除成功',
          showConfirmButton: false,
          timer: 1500,
        });
        location.reload();
      }
    }
  });
}

window.onload = getProfile();
