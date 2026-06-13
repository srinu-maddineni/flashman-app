import nodemailer from 'nodemailer'

const transporte = nodemailer.createTransport({
    host:"smtp-relay.brevo.com" ,
    port: 2525,
    auth:{
        user : process.env.SMTP_USER,
        pass : process.env.SMTP_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
})

export default transporte