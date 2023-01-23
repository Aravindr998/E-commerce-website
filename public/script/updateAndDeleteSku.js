document.addEventListener('submit', (e)=>{
  e.preventDefault()
})
function updateSku(id){
  const data = document.getElementById(id).dataset.url
  const url = 'http://localhost:4000/admin/products/edit/skus/' + data
  const form = document.getElementById('form')
  const formData = new FormData(form)
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
  const url = 'http://localhost:4000/admin/products/delete/skus/'+ prodId + '/' + data
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