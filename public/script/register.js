document.addEventListener('submit', (e) =>{
  console.log('function called')
  const fname = document.querySelector('#fname').value
  const lname = document.querySelector('#lname').value
  const email = document.querySelector('#email').value
  const phone = document.querySelector('#phone').value
  const password = document.querySelector('#password').value
  const otpCard = document.querySelector('#otp-card')
  if(window.getComputedStyle(otpCard).display == 'none'){
    e.preventDefault()
    console.log('inside queryselector')
    confirmPassword = document.querySelector('#confirm-password').value
    const url = '/register'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
        password: password,
        'confirm-password': confirmPassword
      })
    }).then(response => response.json())
    .then(response => {
      if(response.saveStatus == true){
        document.querySelector('#register-card').style.display = "none"
        document.querySelector('#otp-card').style.display = "block"
      }else{
        window.location.href = response.redirect
      }
    })
  }else{
    console.log(fname, lname, email, phone, password)
    console.log('inside else case')
    e.preventDefault()
    const otp = document.querySelector('#otp').value
    const url = '/register/otp'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
        password: password,
        otp: otp,
        otpEntered: true
      })
    })
    .then(response => response.json())
    .then(response => {
      if(response.message){
        document.querySelector('#error-text').innerHTML = 'Incorrect OTP'
      }else if(response.saveStatus){
        window.location.href = response.redirect
      }else{
        window.location.href = response.redirect
      }
    })
  }
})

function resendOtp(){
  const otp = document.querySelector('#otp').value
  const phone = document.querySelector('#phone').value
  const url = '/register/otp/resend'
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      otp,
      phone
    })
  }).then((response) => response.json())
  .then((response) => {
    document.querySelector('#success-text').innerHTML = response.message
  })
}