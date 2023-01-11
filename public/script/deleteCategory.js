function deleteCategory(id){
  const url = 'http://localhost:4000/admin/categories/' + id
  const body = {
    id
  }
  const message = 'Are you sure? All products associated with this category will also be deleted'
  if(window.confirm(message)){
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
  }else{
    return
  }
}