import mongoose from "mongoose"


const conectDb = async ()=>{
 mongoose.connection.on('connected',()=>{console.log("mongodb connected")})
 await mongoose.connect(`${process.env.MONGODB}/srinu`)
}
export default conectDb