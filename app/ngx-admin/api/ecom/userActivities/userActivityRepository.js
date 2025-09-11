/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License. 
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const BaseRepository = require('../../../db/baseRepository');

class UserActivityRepository extends BaseRepository {
  constructor() {
    super('userActivities');
  }

  getYearlyData(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { group : { $year : '$date' } } },
          { $group : { _id : { group : '$group' }, count : { $sum : 1 } } },
          { $sort: { '_id.group' : 1 } },
        ])
        .toArray());
  }

  getMonthlyData(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { group : { $dayOfMonth : '$date' } } },
          { $group : { _id : { group : '$group' }, count : { $sum : 1 } } },
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
          { $project : { group : { $dayOfWeek : '$date' } } },
          { $group : { _id : { group : '$group' }, count : { $sum : 1 } } },
          { $sort: { '_id.group' : 1 } },
        ])
        .toArray());
  }
}

module.exports = UserActivityRepository;
