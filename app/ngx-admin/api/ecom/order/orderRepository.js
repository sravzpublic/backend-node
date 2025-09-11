/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const BaseRepository = require('../../../db/baseRepository');
const { mapOrderFilterParameters } = require('./orderRepositoryParametersMapper');

class OrderRepository extends BaseRepository {
  constructor() {
    super('orders');
  }

  getCountByDates(startDate, endDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match: { date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ])
        .next());
  }

    getCountFiltered(filter) {
        const listFilter = this._getListFilter(filter);

        return super.getCountFiltered(listFilter);
    }

    listFiltered(filter) {
      const mappedFilter = mapOrderFilterParameters(filter);

      return super.listFiltered(mappedFilter);
    }

    _getListFilter(filter) {
        const copyFilter = { ...filter };

        copyFilter.query = {};

        // names here are not fully consistent with naming convention for compatibility with ng2-smart-table api on UI
        if (copyFilter.filterByname) {
            copyFilter.query.name = { $regex: copyFilter.filterByname, $options: '-i' };
        }
        if (copyFilter.filterBydate) {
            copyFilter.query.date = { $regex: copyFilter.filterBydate, $options: '-i' };
        }
        if (copyFilter.filterBysum) {
            copyFilter.query.value = { $regex: copyFilter.filterBysum, $options: '-i' };
        }
        if (copyFilter.filterBytype) {
            copyFilter.query.type = { $regex: copyFilter.filterBytype, $options: '-i' };
        }
        if (copyFilter.filterBycountry) {
            copyFilter.query.countryName = { $regex: copyFilter.filterBycountry, $options: '-i' };
        }
        if (copyFilter.filterBystatus) {
            copyFilter.query.status = { $regex: copyFilter.filterBystatus, $options: '-i' };
        }

        return copyFilter;
    }
}

module.exports = OrderRepository;
