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
  },
  validateAddress: (req, res, next) => {
    if(!req.body.street1){
      req.session.Errmessage = 'Address field cannot be empty'
    }else if(!req.body.city){
      req.session.Errmessage = 'City cannot be empty'
    }else if(!req.body.state){
      req.session.Errmessage = 'State cannot be empty'
    }else if(!req.body.zip){
      req.session.Errmessage = 'Zip cannot be empty'
    }else if(!(req.body.zip).match(/^[6]\d{5}$/)){
      req.session.Errmessage = 'Enter valid zip code'
    }
    if(req.session.Errmessage){
      req.session.address = {
        street1: req.body.street1,
        street2: req.body.street2,
        state: req.body.state,
        city: req.body.city,
        zip: req.body.zip
      }
      res.redirect('/dashboard/address/add')
    }else{
      next()
    }
  }
}