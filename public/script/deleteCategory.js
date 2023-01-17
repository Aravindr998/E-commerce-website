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