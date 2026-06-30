import usermodel from "../model/usermodel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import transporte from "../config/nodemailer.js";



export const register = async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing details" })
    }
    const normalizedEmail = email.toLowerCase().trim()
    try {
        const userExits = await usermodel.findOne({ email: normalizedEmail })
        if (userExits) {
            return res.json({ success: false, message: "User already exists" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new usermodel({ name, email: normalizedEmail, password: hashPassword })
        await user.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SC_TOKEN, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        const mailsend = {
            from: process.env.SENDER_EMAIL,
            to: normalizedEmail,
            subject: "Welcome to Flashman",
            text: `Your account was created successfully with this email: ${normalizedEmail}`
        }
        // Send email in the background to prevent blocking the signup response
        transporte.sendMail(mailsend).catch((mailError) => {
            console.error("Welcome email sending failed:", mailError);
        });
        return res.json({ success: true, token })

    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        })
    }
}


export const login = async (req, res) => {
    // Login request received
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'email and password required' })
    }
    const normalizedEmail = email.toLowerCase().trim()
    try {
        const user = await usermodel.findOne({ email: normalizedEmail })

        if (!user) {
            return res.json({ success: false, message: "Invalid email" })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.json({ success: false, message: "Invalid Password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SC_TOKEN, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        return res.json({ success: true, token })


    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })
        res.json({ success: true, message: 'Logged out' })
    }
    catch (error) {
        return res.json({ success: false, message: 'unable to logout' })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await usermodel.findById(userId)
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }
        if (user.isverified) {
            return res.json({ success: false, message: "User is already verified" })
        }
        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        ); 
        // OTP generated for verification
        user.verifyotp = otp
        user.verifyotpexpire = Date.now() + 24 * 60 * 60 * 1000
        await user.save()
        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Otp verification",
            text: `Your otp is: ${otp}`
        }
        try {
            await transporte.sendMail(mail)
            return res.json({ success: true, message: "Otp is sent to your registered mail" })
        } catch (mailError) {
            console.error("Failed to send OTP email:", mailError);
            return res.json({ success: false, message: mailError.message })
        }
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }

}

export const verifyemail = async (req, res) => {
    const userId = req.userId
    const { otp } = req.body
    if (!userId || !otp) {
        return res.json({
            success: false, message: "Missing details"
        })
    }
    try {
        const user = await usermodel.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        if (user.verifyotpexpire < Date.now()) {
            return res.json({ success: false, message: "OTP has expired. Please request a new one." })
        }
        if (user.verifyotp === '' || user.verifyotp !== String(otp)) {
            return res.json({ success: false, message: "Invalid OTP" })
        }
        user.isverified = true
        user.verifyotp = ""
        user.verifyotpexpire = 0
        await user.save()
        return res.json({ success: true, message: "verification is completed!" })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const isAuthenticate = async (req, res) => {
    try {
        res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const resetOtp = async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.json({ success: false, message: "Enter email" })
    }
    const normalizedEmail = email.toLowerCase().trim()
    try {
        const user = await usermodel.findOne({ email: normalizedEmail })
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );
        // Reset OTP generated
        user.resetotp = otp
        user.resetotpexpire = Date.now() + 15 * 60 * 1000
        await user.save()
        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Otp verification",
            text: `Your otp is: ${otp}`
        }
        try {
            await transporte.sendMail(mail)
            return res.json({ success: true, message: "Reset Otp is sent to your registered mail" })
        } catch (mailError) {
            console.error("Failed to send reset OTP email:", mailError);
            return res.json({ success: false, message: mailError.message })
        }
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Enter credentials" })
    }
    const normalizedEmail = email.toLowerCase().trim()
    try {
        const user = await usermodel.findOne({ email: normalizedEmail })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }
        if (user.resetotpexpire < Date.now()) {
            return res.json({ success: false, message: "OTP has expired. Please request a new one." })
        }
        if (otp === "" || user.resetotp !== String(otp)) {
            return res.json({ success: false, message: "Invalid OTP" })
        }
        const hasedPassword = await bcrypt.hash(newPassword, 10)
        user.resetotp = ''
        user.resetotpexpire = 0
        user.password = hasedPassword
        await user.save()
        return res.json({ success: true, message: "Password has been reset successfully" })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


