const searchHeader = document.getElementById('search_header');
const menuImg = document.getElementById('menu_img');
const menuList = document.getElementById('menu_list');
const main = document.getElementsByTagName('main');
const navLogin = document.getElementById('nav_login');
const navSignup = document.getElementById('nav_signup');
const loginForm = document.getElementById('login_form');
const signupForm = document.getElementById('signup_form');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

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
main[0].addEventListener('click', () => {
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
      alert('請勿輸入符號');
      return;
    }
    window.location.href = `/search/${searchHeader.value}`;
  }
}
function headerSearch() {
  searchHeader.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') headerSearchBtn();
  });
}
window.onload = headerSearch();

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
function signupRender(obj) {
  document.getElementById('signup_name').value = '';
  document.getElementById('signup_email').value = '';
  document.getElementById('signup_password').value = '';
  if (obj.error) {
    alert(obj.error);
  } else if (obj.data.access_token) {
    alert('註冊成功! 系統已發送「認證信」至您的電子信箱!');
  } else {
    alert('Oops, something went wrong!');
  }
}
function loginRender(obj) {
  document.getElementById('login_email').value = '';
  document.getElementById('login_password').value = '';
  if (obj.error) {
    alert(obj.error);
  } else if (obj.data.access_token) {
    localStorage.setItem('token', obj.data.access_token);
    alert('登入成功!');
    // location.reload();
    // window.location.href = './profile.html';
  } else {
    alert('Oops, something went wrong!');
  }
}
// Native Signup Function
signupBtn.addEventListener('click', () => {
  event.preventDefault();
  const name = document.getElementById('signup_name').value;
  if (!name) {
    alert('Please enter your name');
    return;
  }
  const email = document.getElementById('signup_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    alert('Please enter your email');
    return;
  }
  if (email.search(emailRule) == -1) {
    alert('Invalid email address');
    return;
  }
  const password = document.getElementById('signup_password').value;
  if (!password) {
    alert('Please enter your password');
    return;
  }
  const provider = 'native';
  const result = {
    name, email, password, provider,
  };
  postData('/api/1.0/user/signup', result, signupRender);
});
// Login function
loginBtn.addEventListener('click', () => {
  event.preventDefault();
  const email = document.getElementById('login_email').value;
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (!email) {
    alert('Please enter your email');
    return;
  }
  if (email.search(emailRule) == -1) {
    alert('Invalid email address');
    return;
  }
  const password = document.getElementById('login_password').value;
  if (!password) {
    alert('Please enter your password');
    return;
  }
  const provider = 'native';
  const result = { email, password, provider };
  postData('/api/1.0/user/signin', result, loginRender);
});
/* Integrate Facebook Login */
// Initialization
window.fbAsyncInit = function () {
  FB.init({
    appId: '606485106744129',
    cookie: true,
    xfbml: true,
    version: 'v7.0',
  });
  // Record data
  FB.AppEvents.logPageView();
};
// Load the Facebook Javascript SDK asynchronously
(function (d, s, id) {
  let js; const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s); js.id = id;
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
      alert('Please try again');
    }
  }, { scope: 'public_profile, email' });
}

// Member Modal
const memberModal = document.getElementById('member_modal');
const memberBtn = document.getElementById('member_btn');
const modalClose = document.getElementById('modal_close');

// When the user clicks the button, open the modal
memberBtn.onclick = function () {
  memberModal.style.display = 'flex';
};

// When the user clicks the close button, close the modal
modalClose.onclick = function () {
  memberModal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == memberModal) {
    memberModal.style.display = 'none';
  }
};

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
      alert('Please try again');
      console.log(error);
    });
}
