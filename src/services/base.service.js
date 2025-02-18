const { NotFoundError } = require('../utils/errors');

class BaseService {
    constructor(model) {
        this.model = model;
    }

    async getAll(options) {
        const { page, limit, sort, search, filter = {} } = options;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = { ...this.buildSearchQuery(search), ...filter };
        } else {
            query = filter;
        }

        const [data, total] = await Promise.all([
            this.model.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(query)
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getById(id) {
        const data = await this.model.findById(id);
        if (!data) {
            throw new NotFoundError('Resource not found');
        }
        return data;
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(id, data) {
        const updated = await this.model.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!updated) {
            throw new NotFoundError('Resource not found');
        }
        return updated;
    }

    async delete(id) {
        const deleted = await this.model.findByIdAndDelete(id);
        if (!deleted) {
            throw new NotFoundError('Resource not found');
        }
        return deleted;
    }

    buildSearchQuery(search) {
        // Override this method in child services
        return {};
    }
}

module.exports = BaseService; 