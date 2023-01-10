const mongoose = require('mongoose')

mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URL)
.then(()=> {
  console.log('Connected to database')
})
.catch(error =>{
  console.log(`Couldn't connect to database`)
})

module.exports = mongoose.connection