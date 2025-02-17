const responseEnhancer = (req, res, next) => {
    res.success = function(data, message = 'Success') {
        return res.status(200).json({
            status: 'success',
            message,
            data
        });
    };

    res.created = function(data, message = 'Created successfully') {
        return res.status(201).json({
            status: 'success',
            message,
            data
        });
    };

    res.noContent = function() {
        return res.status(204).send();
    };

    next();
};

module.exports = responseEnhancer; 