let container = document.querySelector('.img-cont')
let image = document.querySelector('#main-image')
let lens = document.querySelector('.lens')
let result = document.querySelector('.result')
//for changing the image of the product

function changeImage(id) {
  const newImage = document.querySelector(`#${id} img`).src
  console.log(image)
  const mainImage = document.querySelector('#main-image')
  mainImage.src = newImage
}

//code to zoom on hover
if(container){
  container.addEventListener('mousemove', zoomImage)
}


function zoomImage(e) {

  let containerRect = container.getBoundingClientRect()
  let imageRect = image.getBoundingClientRect()
  let lensRect = lens.getBoundingClientRect()
  let resultRect = result.getBoundingClientRect()

  result.style.backgroundImage = `url(${image.src})`

  let x = e.clientX - containerRect.left - lensRect.width/2
  let y = e.clientY - containerRect.top - lensRect.height/2

  let minX = 0
  let minY = 0
  let maxX = containerRect.width - lensRect.width
  let maxY = containerRect.height - lensRect.height

  if(x <= minX){
    x = minX
  } else if (x >= maxX){
    x = maxX
  }
  if(y <= minY){
    y = minY
  } else if (y >= maxY){
    y = maxY
  }

  lens.style.left = x + 'px'
  lens.style.top = y + 'px'

  let fx = resultRect.width/lensRect.width
  let fy = resultRect.height/lensRect.height


  result.style.backgroundSize = `${imageRect.width * fx}px ${imageRect.height*fy}px`
  result.style.backgroundPosition = `-${x*fx}px -${y*fy}px`
}
if(container){
  container.addEventListener('mouseenter', showZoom)
}

function showZoom() {
  lens.style.visibility = 'visible'
  result.style.visibility = 'visible'
}
if(container){
  container.addEventListener('mouseleave', hideZoom)
}

function hideZoom() {
  lens.style.visibility = 'hidden'
  result.style.visibility = 'hidden'
}

async function addToCart(id){
  const button = document.getElementById(id)
  const prodId = button.dataset.prodid
  const skuId = button.dataset.skuid
  const url = '/cart/add/' + prodId + '/' + skuId
  const body = {
    prodId,
    skuId
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
    console.log(res)
    if(res.successStatus){
      document.querySelector('.added-to-cart').classList.add('alert-success')
      document.querySelector('.added-to-cart p').innerHTML = res.message
      document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
      document.querySelector('.added-to-cart').style.visibility = 'visible'
      console.log(button)
      button.removeAttribute('onclick')
      button.innerHTML = '<a href="/cart" class = "button-link">Go To Cart</a>'
    }else if(res.redirect){
      window.location.href = res.redirect
    }else{
      document.querySelector('.added-to-cart').classList.add('alert-danger')
      document.querySelector('.added-to-cart p').innerHTML = res.message
      document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
      document.querySelector('.added-to-cart').style.visibility = 'visible'
    }
  } catch (error) {
    console.log(error)
  }
}

async function changeQty(id, amount, count){
  const idb = 'dec-button'+count
  const button = document.getElementById(id)
  let reduceButton = document.getElementById(idb)
  const data = button.dataset.id
  const prodId = button.dataset.prodid
  const url = '/cart/update/'+data
  const body = {
    skuId: data,
    amount,
    prodId
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
      document.getElementById(prodId).innerHTML = res.quantity
      document.getElementById('cart-total').innerHTML = '???'+res.cartTotal
      document.getElementById('tax').innerHTML = '???'+Math.round(res.cartTotal*0.18)
      document.getElementById('total').innerHTML = '???'+Math.round(res.cartTotal*1.18)
      if(res.quantity == 1){
         reduceButton.disabled = true
      }else{
        reduceButton.disabled = false
      }
    }else{
      const toastLiveExample = document.getElementById('liveToast')
      const toast = new bootstrap.Toast(toastLiveExample)
      toast.show()
    }
  } catch (error) {
    console.log(error)
  }
}

async function removeProduct(id, prodId, skuId) {
  const url = '/cart/remove/' + prodId + '/' + skuId
  body = {
    prodId,
    skuId
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
      window.location.href = '/cart'
    }else{
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  } catch (error) {
   console.log(error) 
  }
}

async function moveToWishlist(id, prodId, skuId){
  const url = '/cart/wishlist/add'
  const body = {
    prodId,
    skuId
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
      window.location.href = '/cart'
    }else{
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)
  }
}

async function moveToCart(id, prodId, skuId){
  const url = '/wishlist/cart/add/'+prodId+'/'+skuId
  const body = {
    prodId,
    skuId
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
    window.location.href = '/wishlist'
  }else{
    document.getElementById('error').innerHTML = 'Some error occured. Please try again later'
  }
 } catch (error) {
  console.log(error)
 }
}

async function addToWishlist(id, prodId, skuId){
  const button = document.getElementById(id)
  if(button.querySelector('.wishlist').classList.contains('fill-black')){
    console.log('first')
    const url = '/wishlist/remove'
    const body = {
      skuId
    }
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if(res.successStatus){
      button.querySelector('.wishlist').classList.remove('fill-black')
    }else{
      document.querySelector('.added-to-cart').classList.add('alert-danger')
      document.querySelector('.added-to-cart p').innerHTML = 'Some error occured. Please try again later'
      document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
      document.querySelector('.added-to-cart').style.visibility = 'visible'
    }
  }else{
    console.log('second')
    const url = '/products/wishlist/add'
    const body = {
      prodId,
      skuId
    }
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const res = await response.json()
    if(res.successStatus){
      document.querySelector('.added-to-cart').classList.add('alert-success')
      document.querySelector('.added-to-cart p').innerHTML = 'Item added to wishlist!'
      document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
      document.querySelector('.added-to-cart').style.visibility = 'visible'
      document.querySelector('svg.wishlist').classList.add('fill-black')
    }else if(res.redirect){
      window.location.href = res.redirect
    }else{
      document.querySelector('.added-to-cart').classList.add('alert-danger')
      document.querySelector('.added-to-cart p').innerHTML = 'Some error occured. Please try again later'
      document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
      document.querySelector('.added-to-cart').style.visibility = 'visible'
    }
  }
}

async function removeFromCart(id, prodId, skuId){
  const url = '/wishlist/remove'
  const body = {
    prodId,
    skuId
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
      window.location.href = '/wishlist'
    }else{
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)    
  }
}

async function cancelOrder(id){
  const url = '/orders/cancel'
  const body = {
    id
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
      location.reload()
    }else{
      document.querySelector('#error').innerHTML = 'Some Error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)
  }
}

async function addCoupon(id){
  const url = '/checkout/coupons'
  const error = document.querySelector('#coupon-error')
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id})
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/checkout'
  }else{
    error.innerHTML = res.message
  }
}

async function buynow(skuId, prodId){
  const url = '/buy-now'
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prodId,
      skuId
    })
  })
  const res = await response.json()
  if(res.successStatus){
    window.location.href = '/checkout'
  }else if(res.redirect){
    window.location.href = '/login'
  }else if(res.message){
    document.querySelector('.added-to-cart').classList.add('alert-danger')
    document.querySelector('.added-to-cart p').innerHTML = res.message
    document.querySelector('.added-to-cart').style.transform = 'translateY(0rem)'
    document.querySelector('.added-to-cart').style.visibility = 'visible'
  }
}

async function deleteAddress(id){
  try {
    const response = await fetch('/dashboard/address/delete', {
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
      window.location.href = '/dashboard/address/manage'
    }
  } catch (error) {
    console.log(error)
  }
}

async function returnOrder(id){
  try {
    const url = '/orders/return'
    const response =  await fetch(url, {
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
      window.location.reload()
    }
  } catch (error) {
    console.log(error)
  }
}