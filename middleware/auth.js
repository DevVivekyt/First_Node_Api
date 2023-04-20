const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next)=>{
    const token = req.body.token ||req.query.token || req.headers["authorization"];

    if(!token){
        res.status(200).send({message:"A token is required for authentication"})
    }

    try {
        const authToken = jwt.verify(token,process.env.JWT_SECRET);
        req.User = authToken
    } catch (error) {
        res.status(400).send({message:"Invalid token"})
    }
    return next()
}

module.exports = verifyToken