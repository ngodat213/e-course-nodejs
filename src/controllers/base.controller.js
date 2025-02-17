class BaseController {
    constructor(service) {
        this.service = service;
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, sort, search } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sort || { createdAt: -1 },
                search
            };

            const data = await this.service.getAll(options);
            return res.success(data);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await this.service.getById(id);
            return res.success(data);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await this.service.create(req.body);
            return res.success(data);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = await this.service.update(id, req.body);
            return res.success(data);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.service.delete(id);
            return res.success({ message: 'Deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BaseController; 