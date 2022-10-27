const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.authentication = (req,res,next)=>{
    const token = req.header('Authorization');
    const user = (jwt.verify(token , 'itstoken' ))
    User.findByPk(user.userId).then(foundUser=>{
        req.user = foundUser ;
        next();
    })
    

}