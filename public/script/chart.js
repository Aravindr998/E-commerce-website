fetch('/admin/order-details',{
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(response => {
  console.log(response)
  const label = response.orders.map( item => {
    const check = new Date(item.date)
    const now = new Date()
    if(check.getFullYear() == now.getFullYear() && check.getMonth() == now.getMonth()){
      return new Date(item.date).toLocaleDateString('en-GB')
    }
  })
  const data = response.orders.map( item => {
    const check = new Date(item.date)
    const now = new Date()
    if(check.getFullYear() == now.getFullYear() && check.getMonth() == now.getMonth()){
      return item.totalSpent
    }
  })
  new Chart("amountSpent", {
    type: "bar",
    data: {
      labels: label,
      datasets: [{
        label: 'Amount Spent in Rs',
        data: data,
        borderWidth: 1,
        backgroundColor: '#81F18D'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
})
fetch('/admin/product-details',{
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(response => {
  console.log(response)
  function getRandomColor(){
    let color = 'hsl('
    color += Math.floor(Math.random() * 360)
    color += ', 46%, 73%)'
    return color
  }
  const label = response.products.map( item => {
    return item.product +' '+ item.color
  })
  const data = response.products.map( item => {
    return item.quantity
  })
  const color = response.products.map( item => {
    return getRandomColor()
  })
  new Chart("products", {
    type: "doughnut",
    data: {
      labels: label,
      datasets: [{
        label: 'Amount Spent in Rs',
        data: data,
        borderWidth: 1,
        backgroundColor: color
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      legend: {
        display: false
      }
    }
  })
})

