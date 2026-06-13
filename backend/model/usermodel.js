import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{type: String, required :true},
    email : {type: String ,required:true , unique : true, lowercase: true, trim: true},
    password : {type: String ,required:true },
    verifyotp : {type : String , default : ''},
    verifyotpexpire : {type : Number , default : 0},
    isverified : {type : Boolean , default : false},
    resetotp : {type : String ,default : ''},
    resetotpexpire : {type : Number , default : 0}
})

const usermodel = mongoose.models.user || mongoose.model('user',userSchema)

export default usermodel