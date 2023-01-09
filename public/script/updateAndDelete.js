document.addEventListener('submit', e => {
  e.preventDefault()
})


function updateProduct(){
  const title = document.querySelector('#title').value
  const warranty = document.querySelector('#warranty').value
  const category = document.querySelector('#category').value
  const url = 'http://localhost:4000/admin/products/edit/' + document.querySelector('#update-button').dataset.url
  const error = document.querySelector('#error')
  body = {
    title,
    warranty,
    category
  }
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(response => {
    if(response.successStatus){
      window.location.href = response.redirect
    }else{
      error.innerHTML = response.message
    }
  })
}

async function deleteProduct(id) {
  if(window.confirm('Are you sure?')){
    const data = document.getElementById(id).dataset.url
    const url = 'http://localhost:4000/admin/products/delete/' + data
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const res = await response.json()
    console.log(res)
    if(res.successStatus){
      window.location.href = res.redirect
    }else{
      document.querySelector('#error').innerHTML = res.message
    }
  }else{
    return
  }
}