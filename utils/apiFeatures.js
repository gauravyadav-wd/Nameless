class ApiFeatures {
  constructor(query, queryString, quesModel) {
    this.query = query;
    this.queryString = queryString;
    this.quesModel = quesModel;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["sort", "limit", "page"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte)|(gt)|(lte)|(lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  async paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
      return this;
    }
    return this;
  }
}

module.exports = ApiFeatures;
