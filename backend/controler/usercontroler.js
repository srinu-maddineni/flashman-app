import usermodel from "../model/usermodel.js";

export const userData = async (req,res) =>{
    const userId = req.userId
    if(!userId){
        return res.json({success:false,message:"Session expired, please log in again"})
    }
    try{
        const user = await usermodel.findById(userId)
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        return res.json({success:true,
            userData:{
                _id:user._id,
                name:user.name,
                isAuthenticated:user.isverified
        }})
    }
    catch(error){
        return res.json({success:false,message:error.message})
    }
}
