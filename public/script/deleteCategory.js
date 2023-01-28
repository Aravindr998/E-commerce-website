function deleteCategory(id){
  const url = 'http://localhost:4000/admin/categories/' + id
  const body = {
    id
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(response => {
    if(response.successStatus){
      console.log('success', response)
      window.location.href = response.redirect
    }else{
      console.log('failed', response)
      document.querySelector('#error').innerHTML = response.message
    }
  })
  .catch(error => {
    console.log(error)
  })
}

async function setCurrent(id, bannerId){
  const url = 'http://localhost:4000/admin/banner/' + bannerId
  const body = {
    bannerId
  }
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if(res.successStatus){
      window.location.href = 'http://localhost:4000/admin/banner'
    }else{
      document.querySelector('.text-danger').innerHTML = 'Some Error occured'
    }
  } catch (error) {
    console.log(error)
  }
}

async function deleteBanner(id, bannerId){
  const url = 'http://localhost:4000/admin/banner/' + bannerId
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const res = await response.json()
    if(res.successStatus){
      window.location.href = 'http://localhost:4000/admin/banner'
    }else{
      document.querySelector('.text-danger').innerHTML = 'Some Error occured'
    }
  } catch (error) {
    console.log(error)
  }
}

async function changeStatus(id, selectId, orderId){
  const url = 'http://localhost:4000/admin/orders'
  const body = {
    orderId,
    orderStatus: document.getElementById(selectId).value
  } 
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if(res.successStatus){
      window.location.href = 'http://localhost:4000/admin/orders'
    }else{
      document.querySelector('#error').innerHTML = 'Some Error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)
  }
}

async function cancelOrder(div1, div2, orderId, selectId){
  const url = 'http://localhost:4000/admin/orders/cancel'
  const body = {
    orderId
  } 
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if(res.successStatus){
      const buttonDiv = document.getElementById(div1)
      const cancelledDiv = document.getElementById(div2)
      buttonDiv.classList.add('d-none')
      cancelledDiv.classList.remove('d-none')
      document.getElementById(selectId).disabled = true
    }else{
      document.querySelector('#error').innerHTML = 'Some Error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)
  }
}

async function deleteCoupon(id){
  const url = 'http://localhost:4000/admin/coupons'
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id
    })
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/admin/coupons'
  }else{
    document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
  }
}