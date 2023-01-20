async function checkPayment(buttonid){
  const button = document.getElementById(buttonid)
  button.disabled = true
  const address = document.querySelector('input[name = "address"]:checked').value
  const couponId = document.querySelector('#coupon')?.value
  const url = '/checkout/payment'
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        couponId
      })
    })
    const res = await response.json()
    if(res.successStatus){
      window.location = res.url
    }else{
      window.location.href = '/checkout'
    }
  } catch (error) {
    console.log(error)
  }

}