const express = require('express')
const session = require('express-session')
const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouter')
const db  = require('./config/db.config')
const MongoStore = require('connect-mongo')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 4000
const oneDay = 60*60*24*1000

app.set('view engine', 'ejs')

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
})
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  dbName: 'kroma',
  collectionName: 'sessions'
})

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: oneDay},
  store: sessionStore
}))

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`)
  })
})

app.use('/admin', adminRouter)
app.use('/', userRouter)

