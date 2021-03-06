var repo = require('../Repositories/trailerCommentRepo');
var trailerRepo = require('../Repositories/trailerRepo');
var baseService = require('../Services/baseService'); //contains the content of module.exports
var joiSchema = require('../JoiSchema/trailerCommentSchema');
var trailerRepo = require('../Repositories/trailerRepo');
var validator = require('../JoiSchema/validator');

function trailerCommentService(joiSchema){
    //must be added for population purposes
    this.structure = '-__v -trailer';
    this.populateA = {path: 'user', select: 'username profilePicture'};;
    this.populateB = ''; //{path: 'trailerComments', select:'-trailer -__v'};
    
    //needed to define the joiSchema
    this.joiSchema = joiSchema;
}
trailerCommentService.prototype = baseService(repo);

trailerCommentService.prototype.addPopulate = function(req, res, data){
    var valid = validator.isValid(req, res, this.joiSchema, data);
    if (valid != null){
        res.status(400).json(valid);
    }
    else{
        repo.add(data, function(err, result){
            try {
                if (err) {
                    if (err.code == 11000) res.status(409).json({err:err, message: 'Already taken. Pick another please'});
                    else{
                        res.status(500).json({err: err, message: 'Data could not be created'});
                    }
                }else{
                    trailerRepo.getById(result.trailer, '' , '' , '' , function(err, trailer){
                        if (trailer != null) {
                            trailer.trailerComments.push(result._id);
                            trailer.save();
                            if(err) res.json({err: err, message: 'the comment could not be added'});
                        }
                    });
                res.json({message: 'the comment was added successfully', comment: result});
                }            
            } catch (error) {
                res.json({error: error});
            }
        });
    }
}

module.exports = new trailerCommentService(joiSchema, trailerRepo);
