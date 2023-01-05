const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const userModel = require('./models/users')
const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouter')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 4000;
const oneDay = 60*60*24*1000

app.set('view engine', 'ejs')

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: oneDay}
}))

mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/kroma')
.then(app.listen(PORT, ()=>{
  console.log(`server listening on port ${PORT}`)
}))
.catch(error =>{
  console.log(`Couldn't connect to database`)
})
app.use('/', userRouter)
app.use('/admin', adminRouter)

