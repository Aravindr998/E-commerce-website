document.addEventListener('submit', (e) =>{
  console.log('function called')
  const fname = document.querySelector('#fname').value
  const lname = document.querySelector('#lname').value
  const email = document.querySelector('#email').value
  const phone = document.querySelector('#phone').value
  const otpCard = document.querySelector('#otp-card')
  if(window.getComputedStyle(otpCard).display == 'none'){
    e.preventDefault()
    console.log('inside queryselector')
    const url = 'http://localhost:4000/dashboard/edit'
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
      })
    }).then(response => response.json())
    .then(response => {
      if(response.saveStatus == true){
        document.querySelector('#dashboard-card').style.display = "none"
        document.querySelector('#otp-card').style.display = "block"
      }else{
        console.log('in else case')
        window.location.href = response.redirect
      }
    })
  }else{
    console.log(fname, lname, email, phone)
    console.log('inside else case')
    e.preventDefault()
    const otp = document.querySelector('#otp').value
    const url = 'http://localhost:4000/dashboard/edit/otp'
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
        otp: otp,
        otpEntered: true
      })
    })
    .then(response => response.json())
    .then(response => {
      if(response.message){
        document.querySelector('#error-text').innerHTML = 'Incorrect OTP'
      }else if(response.saveStatus){
        window.location.href = '/dashboard'
      }else{
        window.location.href = '/dashboard'
      }
    })
  }
})

function resendOtp(){
  const otp = document.querySelector('#otp').value
  const phone = document.querySelector('#phone').value
  const url = 'http://localhost:4000/register/otp/resend'
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