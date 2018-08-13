var repo = require('../Repositories/userRepo');
var baseService = require('../Services/baseService'); //contains the content of module.exports
var joiSchema = require('../JoiSchema/userSchema');
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'b2comicscrum@gmail.com',
        pass: 'genesystechhub'
    }
});



function userService(joiSchema){
    //must be added for population purposes
    this.structure = '-__v';
    this.populateA = ''; // {path: 'categories', select: '-_id -__v'}
    this.populateB = ''; //{path: 'userComments', select:'-user -__v'};
    
    //needed to define the joiSchema
    this.joiSchema = joiSchema;
}
userService.prototype = baseService(repo);

exports.createAccount = function(req, res, data){
    repo.createAccount(data, function(err, userAccount){
        if(err) res.json({err: err, message: "Something went wrong, please try again"});
        else{
            exports.sendMail(req, res, data.email, data.userName);
            userAccount.save();         
            };

            res.json({sub: userAccount, message: 'Your account has been created successfully'});
        });
};  

exports.sendMail = function(req, res, userAccount, name){
    // setup email data with unicode symbols
    var mailOptions = {
        from: 'b2comicscrum@gmail.com', // sender address
        to: userAccount, // list of receivers
        subject: `Welcome to Our World Of Nollywood Movies ${name} 🎇`, // Subject line
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err){
        if (err) {
           console.log(err);
        }
        else{
            console.log('Email sent successfully');
        }
    });
}




module.exports = new userService(joiSchema);
