const getPaginationOptions = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = query.sort || "-createdAt";

  return {
    page,
    limit,
    skip,
    sort,
  };
};

const formatPaginationResponse = (data, total, options) => {
  const { page, limit } = options;
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPaginationOptions,
  formatPaginationResponse,
};
