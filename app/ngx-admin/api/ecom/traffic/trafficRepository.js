/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const { ObjectID } = require('mongodb');
const BaseRepository = require('../../../db/baseRepository');

class TrafficRepository extends BaseRepository {
  constructor() {
    super('traffic');
  }

  getYearlyData(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { group : { $year : '$date' }, value: '$value' } },
          { $group : { _id : { group : '$group' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.group' : 1 } },
        ])
        .toArray());
  }

  getMonthlyData(startDate, endDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate, $lte: endDate } } },
          { $project : { group : { $month : '$date' }, value: '$value' } },
          { $group : { _id : { group : '$group' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.group' : 1 } },
        ])
        .toArray());
  }

  getWeeklyData(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { group : { $dayOfWeek : '$date' }, value: '$value' } },
          { $group : { _id : { group : '$group' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.group' : 1 } },
        ])
        .toArray());
  }
}

module.exports = TrafficRepository;
