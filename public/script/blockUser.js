async function blockUser(id){
  const data = document.getElementById(id).dataset.url
  const url = '/admin/users/block/' + data
  const body = {
    id: data
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
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  })
}

async function unblockUser(id){
  const data = document.getElementById(id).dataset.url
  const url = '/admin/users/block/' + data
  const body = {
    id: data
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
      window.location.href = 'http://localhost:4000/admin/users'
    }else{
      document.querySelector('#error').innerHTML = 'Some error occured. Please try again later'
    }
  })
}