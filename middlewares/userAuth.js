module.exports = {
  authenticate: (req, res, next) => {
    if(req.session.user){
      next()
    }else{
      res.redirect('/login')
    }
  },
  isLoggedin: (req, res, next) =>{
    if(req.session.user){
      return res.redirect('/')
    }else{
      next()
    }
  }
}