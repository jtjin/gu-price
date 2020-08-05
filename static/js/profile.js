async function getProfile() {
  if (!localStorage.getItem('token')) {
    await Swal.fire({
      icon: 'error',
      title: '存取無效！',
      text: '請註冊帳號或登入會員',
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
    window.location.href = '/';
  } else {
    const bearer = `Bearer ${localStorage.getItem('token')}`;
    const result = await fetch('/api/1.0/user/profile', {
      headers: {
        Authorization: bearer,
      },
    }).then((res) => res.json());

    if (result.error) {
      await Swal.fire({
        icon: 'warning',
        text: result.error,
        confirmButtonColor: '#3085d6',
        confirmButtonText: '確定',
      });
      localStorage.clear();
      window.location.href = '/';
    }

    const time = (new Date() - new Date(result.data.login_at)) / 1000;
    if (time <= result.data.access_expired) {
      createProfile(result.data);
    } else {
      await Swal.fire({
        icon: 'warning',
        text: '您的存取權杖已過期，請重新登入',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '確定',
      });
      localStorage.clear();
      window.location.href = '/';
    }
  }
}

async function createProfile(data) {
  document.getElementById('photo').src = data.picture ? data.picture : '/static/imgs/user.png';
  if (data.name.length > 20) data.name = data.name.substr(0, 20);
  document.getElementById('name').innerHTML = data.name;
  document.getElementById('email').innerHTML = `電子信箱：${data.email}`;
  document.getElementById('loginAt').innerHTML = `上次登入時間：${new Date(data.login_at)}`;
  localStorage.setItem('favorite', data.favorite);
  if (!data.favorite) {
    document.getElementById('msg').innerHTML = '尚無收藏任何商品';
  } else {
    const count = await getFavorite(data.favorite);
    if (count === 0) {
      document.getElementById('msg').innerHTML = '尚無收藏任何商品';
    } else {
      document.getElementById('msg').remove();
    }
  }
  if (Object.keys(data.tracks).length === 0) {
    document.getElementById('track_msg').innerHTML = '尚無追蹤任何商品';
  } else {
    const count = await getTrack(data.tracks);
    if (count === 0) {
      document.getElementById('track_msg').innerHTML = '尚無追蹤任何商品';
    } else {
      document.getElementById('track_msg').remove();
    }
  }
}

async function getFavorite(favorite) {
  favorite = favorite.split(',');
  let count = 0;
  for (let i = 0; i < favorite.length; i += 1) {
    const result = await fetch(`/api/1.0/products/details?number=${favorite[i]}`).then((res) => res.json());
    if (result.data) {
      createFavorite(result.data);
      count += 1;
    }
  }
  return count;
}

function createFavorite(data) {
  const products = document.getElementById('products');
  // Create <a class='product'>
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
  if (data.current_price < data.highest_price) {
    divPrice.innerHTML += '<br><span style="color: red"><b>※特價商品</b></span>';
  }
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
    confirmButtonColor: '#28a745',
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

async function getTrack(tracks) {
  const trackList = Object.keys(tracks);
  let count = 0;
  for (let i = 0; i < trackList.length; i += 1) {
    const result = await fetch(`/api/1.0/products/details?number=${trackList[i]}`).then((res) => res.json());
    if (result.data) {
      createTrack(result.data, tracks[trackList[i]]);
      count += 1;
    }
  }
  return count;
}

function createTrack(data, trackPrice) {
  const products = document.getElementById('track_products');
  // Create <a class='product'>
  const a = document.createElement('a');
  a.setAttribute('class', 'product');
  a.setAttribute('href', `/products/${data.number}`);
  // Create <div class='delete'>
  const divDelete = document.createElement('div');
  const imgDelete = document.createElement('img');
  divDelete.setAttribute('class', 'delete');
  imgDelete.setAttribute('src', '/static/imgs/remove.png');
  imgDelete.setAttribute('onclick', 'deleteTrack()');
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
  divPrice.innerHTML = `追蹤價格 $${trackPrice}`;
  a.appendChild(divPrice);
  products.appendChild(a);
}

async function deleteTrack() {
  event.preventDefault();
  const product = event.target.parentElement.parentElement;
  Swal.fire({
    title: '確定要取消追蹤嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.value) {
      let number = product.getElementsByClassName('number');
      number = number[0].innerHTML;
      // Send delete info to server
      const deleteTrack = {
        number,
        userId: localStorage.getItem('id'),
      };
      const result = await fetch('/api/1.0/user/track', {
        body: JSON.stringify(deleteTrack),
        headers: {
          'content-type': 'application/json',
        },
        method: 'DELETE',
      }).then((res) => res.json());

      if (result.error) {
        await Swal.fire({
          icon: 'error',
          title: '取消追蹤失敗',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: '取消追蹤成功',
          showConfirmButton: false,
          timer: 1500,
        });
        location.reload();
      }
    }
  });
}

window.onload = getProfile();
