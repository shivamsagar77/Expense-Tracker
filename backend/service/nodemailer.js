const nodemailer = require("nodemailer");

// 1. Transporter create karo
let transporter = nodemailer.createTransport({
    service: "gmail", // service provider
    auth: {
        user: "shivam.itechsarathi@gmail.com",   // tumhara email
        pass: "gapa pwxc slvm zlaa"        // gmail app password
    }
});

// 2. Mail options define karo
let mailOptions = {
    from: "shivam.itechsarathi@gmail.com",
    to: "halfbloodprince77207@gmail.com",
    subject: "updation of password",
    text: "Your password is updated successfully you new password is : ldfjldfk"
};

// 3. Mail bhejna
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log("Error aya: ", error);
    }
    console.log("Email sent successfully: " + info.response);
});
