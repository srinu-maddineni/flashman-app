import jwt from 'jsonwebtoken'

const getuserid = async (req,res,next)=>{
   const {token} = req.cookies

   if(!token){
    return res.json({success:false,message:"User not autherized"})
   }
   try{
    const tokenDecode = jwt.verify(token,process.env.JWT_SC_TOKEN)
    if(tokenDecode.id){
        req.userId = tokenDecode.id
        
    }
    else{
        return res.json({success:false,message:"User not autherized"})
    }
    next()
   }
   catch(error){
    return res.json({success:false,message:error.message})
   }

}

export default getuserid
