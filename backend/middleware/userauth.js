import jwt from 'jsonwebtoken'

const getuserid = async (req,res,next)=>{
   let token = (req.cookies || {}).token

   if (!token && req.headers.authorization) {
     const authHeader = req.headers.authorization
     if (authHeader.startsWith('Bearer ')) {
       token = authHeader.substring(7)
     }
   }

   if(!token){
    return res.json({success:false,message:"User not authorized"})
   }
   try{
    const tokenDecode = jwt.verify(token,process.env.JWT_SC_TOKEN)
    if(tokenDecode.id){
        req.userId = tokenDecode.id
        
    }
    else{
        return res.json({success:false,message:"User not authorized"})
    }
    next()
   }
   catch(error){
    return res.json({success:false,message:error.message})
   }

}

export default getuserid
