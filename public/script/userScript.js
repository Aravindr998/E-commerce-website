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