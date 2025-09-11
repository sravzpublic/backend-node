/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const getMongoDBClient = require('../../../db/mongodbClient');

class OrdersProfitRepository {
  constructor() {
    this.dbClient = getMongoDBClient();
    this.collection = 'orders';
  }

  getProfitDataMonthly(startDate, endDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate, $lte : endDate  } } },
          { $project : { month : { $month : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', month : '$month' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.status': 1, '_id.month' : 1 } },
        ])
        .toArray());
  }

  getProfitDataBuckets(startDate, endDate, numberOfBuckets) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match: { date: { $gte: startDate, $lte: endDate } } },
          {
            $bucketAuto: {
              groupBy: '$date',
              buckets: numberOfBuckets,
              output: {
                sum: { $sum: '$value' },
              },
            },
          },
          { $sort: { min: 1 } },
        ])
        .toArray());
  }

  getProfitByDates(startDate, endDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate, $lte : endDate } } },
          { $project : { value : '$value' } },
          { $group : { _id : null, sum : { $sum : '$value' } } },
        ])
        .next());
  }

  getOrderSumYearlyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { year : { $year : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', year : '$year' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.status': 1, '_id.year' : 1 } },
        ])
        .toArray());
  }

  getOrderSumYearly(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { year : { $year : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', year : '$year' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.year' : 1 } },
        ])
        .toArray());
  }

  getOrderSumMonthlyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { month : { $month : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', month : '$month' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.status': 1, '_id.month' : 1 } },
        ])
        .toArray());
  }

  getOrderSumMonthly(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { month : { $month : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', month : '$month' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.month' : 1 } },
        ])
        .toArray());
  }

  getOrderSumDailyByStatus(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { day : { $dayOfWeek : '$date' }, status: '$status', value: '$value' } },
          { $group : { _id : { status : '$status', day : '$day' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.status': 1, '_id.day' : 1 } },
        ])
        .toArray());
  }

  getOrderSumDaily(startDate) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match : { date : { $gte : startDate } } },
          { $project : { day : { $dayOfWeek : '$date' }, value: '$value', status: 'All' } },
          { $group : { _id : { status : '$status', day : '$day' }, sum : { $sum : '$value' } } },
          { $sort: { '_id.day' : 1 } },
        ])
        .toArray());
  }
}

module.exports = OrdersProfitRepository;
