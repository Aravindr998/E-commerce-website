async function checkPayment(buttonid){
  const button = document.getElementById(buttonid)
  button.disabled = true
  const address = document.querySelector('input[name = "address"]:checked').value
  const couponId = document.querySelector('#coupon')?.value
  const url = '/checkout/razorpay'
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
      checkout(res.orderInstance)
    }else{
      window.location.href = '/checkout'
    }
  } catch (error) {
    console.log(error)
  }

}

function checkout(order){
  const options = {
    "key": "rzp_test_kW0L0zRl03sMQ6",
    "amount": order.amount,
    "currency": "INR",
    "name": "KROMA",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, 
    "handler": function (response){
      verifyPayment(response, order)
    },
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    },
    "modal": {
      "ondismiss": function(){
        cancelPayment(order)
      }
    }
  }
  const rzp1 = new Razorpay(options)
  rzp1.open()
  rzp1.on('payment.failed', function (response){
    // alert(response.error.code);
    // alert(response.error.description);
    // alert(response.error.source);
    // alert(response.error.step);
    // alert(response.error.reason);
    // alert(response.error.metadata.order_id);
    // alert(response.error.metadata.payment_id);
    paymentFail(response, order)
  })
}

async function verifyPayment(payment, order){
  const response = await fetch('/payment/verify',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment,
      order
    })
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/orderplaced'
  }else{
    window.location.href = '/payment/fail'
  }
}

async function cancelPayment(order){
  const response = await fetch('/payment/cancel',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order
    })
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/payment/fail'
  }else{
    window.location.href = '/payment/fail'
  }
}

async function paymentFail(payment, order){
  const response = await fetch('/payment/fail',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment,
      order
    })
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/payment/fail'
  }else{
    window.location.href = '/payment/fail'
  }
}