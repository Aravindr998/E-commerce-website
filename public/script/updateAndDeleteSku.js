function updateSku(id){
  const form = document.getElementById('form')
  const formData = new FormData(form)
  const data = document.getElementById(id).dataset.url
  const url = '/admin/products/edit/skus/' + data
  const input1 = document.querySelector('#image1')
  const input2 = document.querySelector('#image2')
  const input3 = document.querySelector('#image3')
  formData.append("image1", input1)
  formData.append("image2", input2)
  formData.append("image3", input3)
  fetch(url, {
    method: 'PUT',
    body: formData
  })
  .then(response => response.json())
  .then(response => {
    if(response.successStatus){
      window.location.href = response.redirect
    }else{
      document.querySelector('#error').innerHTML = response.message
    }
  })
  .catch(error => {
    console.log(error)
  })
}

async function deleteSku(id){
  const data = document.getElementById(id).dataset.url
  const prodId = document.getElementById(id).dataset.prodid
  const url = '/admin/products/delete/skus/'+ prodId + '/' + data
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(response => {
    if(response.successStatus){
      window.location.href = response.redirect
    }else{
      document.querySelector('error-sku').innerHTML = response.message
    }
  })
  .catch(error => {
    console.log(error)
  })
}

const offerForm = document.querySelector('#offer')
if(offerForm){
  offerForm.addEventListener('submit', (e) => {
    e.preventDefault()
  })
}

async function applyOffer(id) {
  const url = '/admin/products/offer/add'
  const percent = document.querySelector('#offer').value
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id, percent})
    })
    const res = await response.json()
    if(res.successStatus){
      window.location.reload()
    }else{
      document.querySelector('#error-offer p').innerHTML = res.message
    }
  } catch (error) {
    console.log(error)
  }
}

async function removeOffer(id) {
  const url = '/admin/products/offer/remove'
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    })
    const res = await response.json()
    if(res.successStatus){
      window.location.reload()
    }else{
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  } catch (error) {
    console.log(error)
  }
}