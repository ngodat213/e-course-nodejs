const responseEnhancer = (req, res, next) => {
    res.success = function(data, message = 'Success') {
        return res.status(200).json({
            code: 200,
            success: true,
            message,
            data
        });
    };

    res.created = function(data, message = 'Created successfully') {
        return res.status(201).json({
            status: 'success',
            code: 201,
            success: true,
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