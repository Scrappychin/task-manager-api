const sgMail = require('@sendgrid/mail')

//when naming environment variables convention is to do all uppercase with underscores
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'c3046763@gmail.com',
//     from: 'c3046763@gmail.com',
//     subject: 'first sendgrid email',
//     text: 'this is the text scrote'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'c3046763@gmail.com',
        subject: 'Thanks for joining the tasks App',
        //the thing below is a template string, it uses the backtick quate next to the 1 key to inject variables inside the string
        text: `Welcome to the app, ${name} Let me know how you get along with the app`
        //can use html instead of text to do a nice email. But the dude says that text emails from web applications actually have a better response rate.
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'c3046763@gmail.com',
        subject: 'Sorry to see you go',
        //the thing below is a template string, it uses the backtick quate next to the 1 key to inject variables inside the string
        text: `Sorry to see you go, ${name} you have been removed from the task App`
        //can use html instead of text to do a nice email. But the dude says that text emails from web applications actually have a better response rate.
    })
}


//we have to export an object instead of the file to be able to export multiple different types of emails I assume

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
