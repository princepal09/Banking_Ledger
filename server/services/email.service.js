const nodemailer = require("nodemailer")
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth:{
        type : 'OAuth2',
        user : process.env.EMAIL_USER,
        clientId : process.env.CLIENT_ID,
        clientSecret : process.env.CLIENT_SECRET,
        refreshToken : process.env.REFRESH_TOKEN,
    }
});

// Verify the connection configuration

transporter.verify((error, success) =>{
    if(error){
        console.error("Error Connecting to email server: ",error)
    } else{
        console.log("Email server is ready to send messages");
    }
} )

const sendEmail = async(to, subject, text, html) =>{
    try{
        const info = await transporter.sendMail({
            from : `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        })

        console.log("Message Sent : %s",info.messageId)
        console.log("Preview URL : %s",nodemailer.getTestMessageUrl(info))
    }catch(err){
        console.error('Error sending mails',err);

    }

}

exports.sendRegistrationEmail = async(userEmail, name) => {
    const subject = 'Welcome to Backend - Ledger'
    const text = `Hello ${name},Thank you for registering with Backend - Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.Best regards,The Backend - Ledger Team`
    const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend - Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Backend - Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
    
}