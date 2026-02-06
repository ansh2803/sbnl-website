const jwt = require("jsonwebtoken");

exports.verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({msg:"No token"});

  try {
    const decoded = jwt.verify(token, "sbnl_secret_key");
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({msg:"Invalid token"});
  }
};
module.exports = function(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({msg:"No token"});

  const token = authHeader.split(" ")[1]; // Get token after "Bearer "

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  }catch{
    res.status(401).json({msg:"Invalid token"});
  }
}