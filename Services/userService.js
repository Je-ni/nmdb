var repo = require('../Repositories/userRepo');
var baseService = require('../Services/baseService'); //contains the content of module.exports
var joiSchema = require('../JoiSchema/userSchema');
var nodemailer = require('nodemailer');
var validator = require('../JoiSchema/validator');
var token = require('../Config/jwt');
var cloud = require('../Config/cloudinary');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'helloflixia@gmail.com',
        pass: 'genesystechhub'
    }
});

function userService(joiSchema){
    //must be added for population purposes
    this.structure = '-__v -password';
    this.populateA = ''; // {path: 'categories', select: '-_id -__v'}
    this.populateB = ''; //{path: 'userComments', select:'-user -__v'};
    
    //needed to define the joiSchema
    this.joiSchema = joiSchema;
}
userService.prototype = baseService(repo);

userService.prototype.uploadPicture = function(req, res, data){
    repo.update(data._id, {profilePicture: data.profilePicture, profilePictureId : data.profilePictureId}, function(err, user){
        try{
            if(err) res.json({err: err, message: `The profile picture could not be updated`});
            else if (data.profilePictureId != null){
                res.json({message: 'Profile picture uploaded successfully'});
            }
            else res.json({message: 'Profile picture not uploaded. Please try again'});
        }catch(exception){
            res.json({error:exception});
        }
    });
}

userService.prototype.createAccount = function(req, res, data){
    var valid = validator.isValid(req, res, this.joiSchema, data);
    if (valid != null){
        res.json(valid);
    }else{
        repo.createAccount(data, function(err, userAccount){
            try{
                if(err) res.status(500).json({err: err, message: "Something went wrong, please try again"});
                else{
                    sendMail(req, res, data.email, data.username);
                    userAccount.save();
                    res.json({
                        sub: userAccount, 
                        message: 'Your account has been created successfully',
                        token: token({
                            email: data.email,
                            id: data._id
                        }),
                    });
                };
            }catch(exception){
                res.json({error:exception});
            }
        });
    }
}

sendMail = function(req, res, userAccount, name){
    try{ 
        // setup email data with unicode symbols
        var mailOptions = {
            from: 'helloflixia@gmail.com', // sender address
            to: userAccount, // list of receivers
            subject: `Welcome to Our World Of Nollywood Movies ${name} 🎇`, // Subject line
            html: "<p>You are very welcome to our platform😁. Expect enough fun and updates from us.</p>"+
                `Please click <a href='http://localhost:3000/users/email/verify/${userAccount}'>here😭</a` + 
                `or copy this link to your browser: http://localhost:3000/users/email/verify/${userAccount}`
        };
        /**I need a function that ensures that email is sent
         * else notify me of the failure to send email.
         */
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(err){
            if (err) {
                console.log('Email not sent');
            }
            else{
                console.log('Email sent successfully');
            }
        });
    }catch(exception){
        res.status(520).json({error:exception});
    }    
}

userService.prototype.verify = function(req, res, data){    
    repo.get(data, '', '', '', function(err, user){
        try {
        if (err) res.status(500).json({err: err, message: 'Something went wrong.Please try again'});
        else if (user.length >= 1){
            if (user[0].verified == 'true'){
                res.json({message: 'You\'re already verified. Please proceed'})
            }else{
                repo.update(user[0]._id, {verified: true}, function(err, update){
                    if(err) res.status(500).json({err: err, message: `The user could not be verified`});
                    else res.json({message: 'You have successfully been verified. We welcome you OFFICIALLY'});
                });
            }
        }else {
            res.status(404).json({message: 'Your email doesn\'t seem to be registered. Please do try to signup again'});
        }
    } catch (error) {
        res.status(520).json({error: error});
        }
    });
}

userService.prototype.deleteUser = function (req, res, id){
    repo.getById(id,'','','', function(err, data){
        try {
            if (data != null){
                repo.delete({_id:id}, function(err, result){
                    if (err) res.json({error: err, message: 'The data could not be deleted'});
                    else if (result == null){
                        res.json({message: 'Resource does not exist'});
                    }else{
                        cloud.deleteImage(data.profilePictureId).then(()=>{
                            res.json({message: 'Resource deleted successfully'});
                        });                  
                    }
                });
            }else {
                res.json({message: "Picture not found, delete not successful"});
            }        
        } catch(exception){
            res.json({error : exception});
        }
    })       
};
    
module.exports = new userService(joiSchema);
