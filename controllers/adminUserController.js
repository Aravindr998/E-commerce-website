const userModel = require('../models/users')

const getUserList = async(req, res)=> {
  try {
    const users = await userModel.find().sort({fname: 1})
    res.render('admin/user/user-list', {users})
  } catch (error) {
    console.log(error)
  }
}

const getUserDetails = async(req, res) => {
  try {
    id = req.params.id
    const user = await userModel.findById(id)
    res.render('admin/user/user-details', {user})
  } catch (error) {
    console.log(error)
  }
}

const blockUser = async(req, res) => {
  try {
    const id = req.params.id
    const user = await userModel.findById(id)
    if(user.isBlocked){
      try {
        await userModel.findOneAndUpdate({_id:id}, {
          $set: {
            isBlocked: false
          }
        })
        return res.json({
          successStatus: true,
          redirect: '/admin/users/view/'+id
        })
      } catch (error) {
        console.log(error)
        return res.json({
          successStatus: false
        })
      }
    }else{
      try {
        await userModel.findOneAndUpdate({_id:id}, {
          $set: {
            isBlocked: true
          }
        })
        return res.json({
          successStatus: true,
          redirect: '/admin/users/view/'+id
        })
      } catch (error) {
        console.log(error)
        return res.json({
          successStatus: false
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
  
}



module.exports = {
  getUserList,
  getUserDetails,
  blockUser,
}