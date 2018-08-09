var service = require('../Services/clipsService');

exports.add = function(req, res){
    data = {
        title: req.body.title,
        description: req.body.description,
        rating: req.body.rating,
        year: req.body.year,
        productionCompany: req.body.productionCompany,
        duration: req.body.duration,
        trailerCover: req.files[0].path,
        trailerVideo: req.files[1].path
    }
    return service.add(req, res, data);
}

exports.getAll = function(req, res){
    return service.getAll(req, res);
}

exports.getById = function(req, res){
    var id = req.params.id;
    return service.getById(req, res, id);
}

exports.search = function(req, res){
    var option = req.query;
    return service.search(req, res, option);
}

exports.delete = function(req, res){
    var option = {_id: req.params.id};
    return service.delete(req, res, option);
}
