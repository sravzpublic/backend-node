/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');

const router = express.Router();

const OrdersAggregatedService = require('./ordersAggregatedService');
const OrdersProfitService = require('../ordersProfit/ordersProfitService');

const ordersAggregatedService = new OrdersAggregatedService();
const ordersProfitService = new OrdersProfitService();

router.get('/', (req, res) => {
  ordersAggregatedService
    .list(req.query.aggregation)
    .then(data => res.send(data));
});

router.get('/profit', (req, res) => {
  ordersProfitService
    .list(req.query.aggregation)
    .then(data => res.send(data));
});

router.get('/country', (req, res) => {
  ordersAggregatedService
    .listByCountry(req.query.countryCode)
    .then(data => res.send(data));
});

router.get('/summary', (req, res) => {
  ordersAggregatedService
    .summary()
    .then(data => res.send(data));
});

module.exports = router;
