// const jwt = require('jsonwebtoken');
// const config = require('config');

module.exports = function(req, res, next) {
    let jwtto = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MzY0OTI3MzkzIiwibmFtZSI6IlByZWNpc2UgTGlnaHRpbmcgV2VtYSBUcmFuc2ZlciIsImlhdCI6MTUxNjIzOTAyMn0.zA7-Gqke7lqN1WK897ZfFeMhi4nmN0ybpTFsQIbQ3Uk'
    const token = req.header('Authorization');
    if(!token) return res.status(401).send({ messsage: 'Access denied no token provided'});
    try{
        // const decoded = jwt.verify(token.trim().split(' ')[1], 'wema transfer');
        // console.log(decoded)
        if(token.trim().split(' ')[0] === 'Bearer'){
            if(token.trim().split(' ')[1] === jwtto) {
                next();
            }else{
                res.status(400).send({ messsage: 'Invalid token provided'});
            }
        }else{
            res.status(400).send({ messsage: 'wrong auth type'});
        }
    }catch(err){
        res.status(401).send({ messsage: 'Invalid token provided'});
    }
}