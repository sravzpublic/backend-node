/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const getMongoDBClient = require('../../../db/mongodbClient');

class OrdersAggregatedRepository {
  constructor() {
    this.dbClient = getMongoDBClient();
    this.collection = 'orders';
  }

  getCountryStatistics(countryCode) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { countryId : { $eq : countryCode } } },
          { $project : { type : '$type' } },
          { $group : { _id : { type : '$type' }, count : { $sum : 1 } } },
          { $sort: { '_id.type': 1 } },
        ])
        .toArray());
  }

  getOrderCountYearlyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { year : { $year : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', year : '$year' }, count : { $sum : 1 } } },
          { $sort: { '_id.status': 1, '_id.year' : 1 } },
        ])
        .toArray());
  }

  getOrderCountYearly(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { year : { $year : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', year : '$year' }, count : { $sum : 1 } } },
          { $sort: { '_id.year' : 1 } },
        ])
        .toArray());
  }

  getOrderCountMonthlyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { month : { $month : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', month : '$month' }, count : { $sum : 1 } } },
          { $sort: { '_id.status': 1, '_id.month' : 1 } },
        ])
        .toArray());
  }

  getOrderCountMonthly(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { month : { $month : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', month : '$month' }, count : { $sum : 1 } } },
          { $sort: { '_id.month' : 1 } },
        ])
        .toArray());
  }

  getOrderCountDailyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { day : { $dayOfWeek : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', day : '$day' }, count : { $sum : 1 } } },
          { $sort: { '_id.status': 1, '_id.day' : 1 } },
        ])
        .toArray());
  }

  getOrderCountDaily(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { day : { $dayOfWeek : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', day : '$day' }, count : { $sum : 1 } } },
          { $sort: { '_id.day' : 1 } },
        ])
        .toArray());
  }
}

module.exports = OrdersAggregatedRepository;
