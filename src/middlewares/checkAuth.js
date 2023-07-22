const jwt = require('jsonwebtoken');
const checkAuth = async (req, res, next) => {
    try{
        const token = req.headers.authorization;
        const verifiedToken = await jwt.verify(token, process.env.Auth_Secret_Key);
        req.body._id = verifiedToken._id;
        next()
    }catch(err){
        res.status(500).json({
            msg: "auth error, please login"
        })
    }
}

module.exports = checkAuth;