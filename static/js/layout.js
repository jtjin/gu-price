const searchHeader = document.getElementById('search_header');
const menuImg = document.getElementById('menu_img');
const menuList = document.getElementById('menu_list');
const main = document.getElementsByTagName('main')[0];
const navLogin = document.getElementById('nav_login');
const navSignup = document.getElementById('nav_signup');
const loginForm = document.getElementById('login_form');
const signupForm = document.getElementById('signup_form');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

navLogin.addEventListener('click', () => {
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  navSignup.style.background = 'none';
  navLogin.style.background = 'white';
});

navSignup.addEventListener('click', () => {
  signupForm.style.display = 'block';
  loginForm.style.display = 'none';
  navSignup.style.background = 'white';
  navLogin.style.background = 'none';
});

menuImg.addEventListener('click', () => {
  if (menuList.className == 'show') {
    menuList.classList.remove('show');
  } else {
    menuList.classList.add('show');
  }
});

main.addEventListener('click', () => {
  if (menuList.className == 'show') {
    menuList.classList.remove('show');
  }
});

function isValid(str) {
  return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?\ ]/g.test(str);
}

function headerSearchBtn() {
  if (searchHeader.value) {
    if (!isValid(searchHeader.value)) {
      Swal.fire({
        icon: 'warning',
        title: '請勿輸入特殊符號！',
        text: '不接受空格、@、!、$、^、&...等特殊符號',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '我知道了',
      });
      return;
    }
    window.location.href = `/search/${searchHeader.value}`;
  }
}

searchHeader.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') headerSearchBtn();
});

// Member Modal
const memberModal = document.getElementById('member_modal');
const memberBtn = document.getElementById('member_btn');
const memberLogo = document.getElementById('member_logo');
const modalClose = document.getElementById('modal_close');
const profileModal = document.getElementById('profile_modal');
const profileClose = document.getElementById('profile_close');

// When the user clicks the button, open the modal
memberBtn.onclick = () => {
  if (!localStorage.getItem('token')) {
    memberModal.style.display = 'flex';
  } else {
    switch (profileModal.style.display) {
      case 'flex':
        profileModal.style.display = 'none';
        break;
      default:
        let name = localStorage.getItem('name');
        if (name.length > 10) name = name.substr(0, 10);
        document.getElementById('profile_name').innerHTML = name;
        profileModal.style.display = 'flex';
    }
  }
};

// When the user clicks the close button, close the modal
modalClose.onclick = () => {
  memberModal.style.display = 'none';
};
profileClose.onclick = () => {
  profileModal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
  if (event.target == memberModal) {
    memberModal.style.display = 'none';
  }
  if (event.target !== memberBtn && event.target !== memberLogo && event.target !== modalClose && profileModal.style.display === 'flex') {
    profileModal.style.display = 'none';
  }
};

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

// Native Signup Function
signupBtn.addEventListener('click', () => {
  event.preventDefault();
  const name = document.getElementById('signup_name').value;
  if (!name) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入用戶名稱',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const email = document.getElementById('signup_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入 Email',
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
  const password = document.getElementById('signup_password').value;
  if (!password) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入密碼',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const provider = 'native';
  const data = {
    name, email, password, provider,
  };
  Swal.fire({
    imageUrl: '/static/imgs/spinner.gif',
    showConfirmButton: false,
    allowOutsideClick: false,
  });
  postData('/api/1.0/user/signup', data, signupRender);
});

function signupRender(result) {
  document.getElementById('signup_name').value = '';
  document.getElementById('signup_email').value = '';
  document.getElementById('signup_password').value = '';
  if (result.error) {
    Swal.fire({
      icon: 'error',
      text: JSON.stringify(result.error),
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
  } else if (result.data.access_token) {
    Swal.fire({
      icon: 'success',
      title: '註冊成功！',
      text: '系統已發送「認證信」至您的電子信箱',
      confirmButtonColor: '#3085d6',
      confirmButtonText: '確定',
    });
    document.getElementById('member_modal').style.display = 'none';
  } else {
    Swal.fire({
      icon: 'warning',
      text: '請再嘗試一次',
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

// Login function
loginBtn.addEventListener('click', () => {
  event.preventDefault();
  const email = document.getElementById('login_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入 Email',
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
  const password = document.getElementById('login_password').value;
  if (!password) {
    Swal.fire({
      icon: 'warning',
      text: '請輸入密碼',
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const provider = 'native';
  const data = { email, password, provider };
  postData('/api/1.0/user/signin', data, loginRender);
});

async function loginRender(result) {
  document.getElementById('login_email').value = '';
  document.getElementById('login_password').value = '';
  if (result.error) {
    Swal.fire({
      icon: 'warning',
      text: result.error,
      showConfirmButton: false,
      timer: 1500,
    });
  } else if (result.data.access_token) {
    localStorage.setItem('token', result.data.access_token);
    localStorage.setItem('id', result.data.user.id);
    localStorage.setItem('photo', result.data.user.picture);
    localStorage.setItem('name', result.data.user.name);
    localStorage.setItem('email', result.data.user.email);
    await Swal.fire({
      icon: 'success',
      title: '登入成功',
      showConfirmButton: false,
      timer: 1500,
    });
    window.location.href = '/profile';
  } else {
    Swal.fire({
      icon: 'warning',
      text: '請再嘗試一次',
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

/* Integrate Facebook Login */
// Initialization
window.fbAsyncInit = () => {
  FB.init({
    appId: '1031835573900181',
    cookie: true,
    xfbml: true,
    version: 'v7.0',
  });
  // Record data
  FB.AppEvents.logPageView();
};
// Load the Facebook Javascript SDK asynchronously
(function (d, s, id) {
  let js;
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function FacebookLogin() {
  FB.login((response) => {
    if (response.status === 'connected') {
      const result = {
        id: response.authResponse.userID,
        provider: response.authResponse.graphDomain,
        access_token: response.authResponse.accessToken,
      };
      postData('/api/1.0/user/signin', result, loginRender);
    } else {
      Swal.fire({
        icon: 'warning',
        text: '請再嘗試一次',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }, { scope: 'public_profile, email' });
}

/* Integrate Google Login */
function GoogleLogin() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signIn()
    .then((GoogleUser) => {
      const profile = GoogleUser.getBasicProfile();
      const result = {
        id: profile.getId(),
        provider: GoogleUser.getAuthResponse().idpId,
        access_token: GoogleUser.getAuthResponse().id_token,
      };
      postData('/api/1.0/user/signin', result, loginRender);
    })
    .catch((error) => {
      Swal.fire({
        icon: 'warning',
        text: '請再嘗試一次',
        showConfirmButton: false,
        timer: 1500,
      });
      console.log(error);
    });
}

logoutBtn.addEventListener('click', () => {
  Swal.fire({
    title: '確定要登出嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.value) {
      localStorage.clear();
      await Swal.fire({
        icon: 'success',
        title: '登出成功',
        showConfirmButton: false,
        timer: 1500,
      });
      if (window.location.pathname == '/profile') {
        window.location.href = '/';
      } else {
        location.reload();
      }
    }
  });
});

// Compare
function updateCompare() {
  event.preventDefault();
  document.getElementById('comparison_bg').style.display = 'block';
  document.getElementById('comparison_arrow').style.display = 'flex';
  let product;
  let img;
  let userCompare = sessionStorage.getItem('compare');
  // Check the user click div or img or p
  if (event.target.className == 'compare') {
    product = event.target.parentElement;
    img = event.target.getElementsByTagName('img');
  } else {
    product = event.target.parentElement.parentElement;
    img = event.target.parentElement.getElementsByTagName('img');
  }
  let number = product.getElementsByClassName('number');
  let name = product.getElementsByClassName('name');
  let mainImage = product.getElementsByTagName('img');
  number = number[0].innerHTML;
  name = name[0].innerHTML;
  mainImage = mainImage[0].getAttribute('src');
  img = img[0];

  if (img.getAttribute('src') == '/static/imgs/unchecked.png') {
    // Add it into localstroage
    if (userCompare == 'undefined' || userCompare == 'null' || userCompare == '' || !userCompare) {
      sessionStorage.setItem('compare', number);
    } else {
      if (userCompare.split(',').length > 3) {
        Swal.fire({
          icon: 'warning',
          title: '比較列表已滿！',
          text: '請移除 1 項不須比較的商品',
          confirmButtonText: '確定',
        });
        return;
      }
      if (userCompare.split(',').find((p) => p == number)) {
        Swal.fire({
          icon: 'warning',
          title: '商品已在比較列表中！',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
      sessionStorage.setItem('compare', `${userCompare},${number}`);
    }
    img.setAttribute('src', '/static/imgs/checked.png');
    addCompare(mainImage, name, number);
  } else {
    img.setAttribute('src', '/static/imgs/unchecked.png');
    // Remove it from localstroage
    userCompare = userCompare.split(',');
    const deleteCompareIndex = userCompare.findIndex((p) => p == number);
    userCompare.splice(deleteCompareIndex, 1);
    userCompare = userCompare.join(',');
    sessionStorage.setItem('compare', userCompare);
    removeCompare(number);
  }
}

function addCompare(mainImage, name, number) {
  const comparisonUl = document.getElementById('comparison_ul');
  // create <li class='item'>
  const li = document.createElement('li');
  li.setAttribute('class', 'item');
  li.setAttribute('number', number);
  // create <div class='compare_product_info'>
  const div = document.createElement('div');
  div.setAttribute('class', 'compare_product_info');
  li.appendChild(div);
  // create <div class='delete_compare'> <img>
  const divDelete = document.createElement('div');
  const imgDelete = document.createElement('img');
  divDelete.setAttribute('class', 'delete_compare');
  imgDelete.setAttribute('src', '/static/imgs/remove.png');
  imgDelete.setAttribute('onclick', 'clickRemoveCompare()');
  divDelete.appendChild(imgDelete);
  div.appendChild(divDelete);
  // create <img> <h4>
  const img = document.createElement('img');
  const h4 = document.createElement('h4');
  img.setAttribute('src', mainImage);
  h4.innerHTML = name;
  div.appendChild(img);
  div.appendChild(h4);
  comparisonUl.appendChild(li);
}

function removeCompare(number) {
  const deleteItem = document.querySelector(`li[number='${number}']`);
  if (deleteItem) deleteItem.remove();
}

function clickRemoveCompare() {
  const li = event.target.parentElement.parentElement.parentElement;
  const number = li.getAttribute('number');
  // change checked img
  const checkedImg = document.querySelector(`img[number='${number}']`);
  if (checkedImg) checkedImg.setAttribute('src', '/static/imgs/unchecked.png');
  // Remove it from localstroage
  let userCompare = sessionStorage.getItem('compare');
  userCompare = userCompare.split(',');
  const deleteCompareIndex = userCompare.findIndex((p) => p == number);
  userCompare.splice(deleteCompareIndex, 1);
  userCompare = userCompare.join(',');
  sessionStorage.setItem('compare', userCompare);
  // Remove li
  li.remove();
}

document.getElementById('comparison_close').addEventListener('click', () => {
  document.getElementById('comparison_bg').style.display = 'none';
  document.getElementById('comparison_arrow').style.display = 'flex';
});

document.getElementById('comparison_arrow').addEventListener('click', () => {
  document.getElementById('comparison_bg').style.display = 'block';
});

document.getElementById('go_to_compare').addEventListener('click', () => {
  if (sessionStorage.getItem('compare')) window.location.href = '/compare';
});

document.getElementById('clear_compare').addEventListener('click', () => {
  let userCompare = sessionStorage.getItem('compare');
  if (userCompare) {
    userCompare = userCompare.split(',');
    for (let i = 0; i < userCompare.length; i += 1) {
      number = userCompare[i];
      // change checked img
      const checkedImg = document.querySelector(`img[number='${number}']`);
      if (checkedImg) checkedImg.setAttribute('src', '/static/imgs/unchecked.png');
      // Remove li
      const li = document.querySelector(`li[number='${number}']`);
      li.remove();
    }
    sessionStorage.removeItem('compare');
  }
});

async function checkCompare() {
  if (sessionStorage.getItem('compare')) {
    if (window.location.pathname == '/compare') {
      document.getElementById('comparison_arrow').style.display = 'none';
    } else {
      let userCompare = sessionStorage.getItem('compare');
      userCompare = userCompare.split(',');
      for (let i = 0; i < userCompare.length; i += 1) {
        const result = await fetch(`/api/1.0/products/details?number=${userCompare[i]}`).then((res) => res.json());
        addCompare(result.data.main_image, result.data.name, result.data.number);
      }
      document.getElementById('comparison_arrow').style.display = 'flex';
    }
  }
}

function getMemberLogo() {
  memberLogo.src = localStorage.getItem('photo') ? localStorage.getItem('photo') : '/static/imgs/member.png';
}

window.onload = [getMemberLogo(), checkCompare()];

// toTop-arrow
backTop = document.getElementById('backTop');

// When the user scrolls down 20px from the top of the document, show the button
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backTop.style.display = 'block';
  } else {
    backTop.style.display = 'none';
  }
}
window.onscroll = () => scrollFunction();

// When the user clicks on the button, scroll to the top of the document
backTop.addEventListener('click', () => {
  document.documentElement.scrollTop = 0;
});
