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

container.addEventListener('mousemove', zoomImage)


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

container.addEventListener('mouseenter', showZoom)

function showZoom() {
  lens.style.visibility = 'visible'
  result.style.visibility = 'visible'
}

container.addEventListener('mouseleave', hideZoom)

function hideZoom() {
  lens.style.visibility = 'hidden'
  result.style.visibility = 'hidden'
}

async function addToCart(id){
  const button = document.getElementById(id)
  const prodId = button.dataset.prodid
  const skuId = button.dataset.skuid
  const url = 'http://localhost:4000/cart/add/' + prodId + '/' + skuId
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
      button.value = 'Added To Cart'
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
  const url = 'http://localhost:4000/cart/update/'+data
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
      document.getElementById('cart-total').innerHTML = '₹'+res.cartTotal
      document.getElementById('tax').innerHTML = '₹'+Math.round(res.cartTotal*0.18)
      document.getElementById('total').innerHTML = '₹'+Math.round(res.cartTotal*1.18)
      if(res.quantity == 1){
        console.log('entered')
         reduceButton.disabled = true
      }else{
        console.log('entered2')
        console.log(reduceButton)
        reduceButton.disabled = false
      }
    }else{
      location.reload()
    }
  } catch (error) {
    console.log(error)
  }
}

function removeProducts(id, prodId, skuId) {
  const url = 'http://localhost:4000/cart/remove/' + prodId + '/' + skuId
}