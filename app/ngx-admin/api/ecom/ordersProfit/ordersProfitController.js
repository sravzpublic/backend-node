/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');

const router = express.Router();

const OrdersProfitService = require('./ordersProfitService');

const ordersProfitService = new OrdersProfitService();

router.get('/', (req, res) => {
  ordersProfitService
    .listYear()
    .then(data => res.send(data));
});

router.get('/short', (req, res) => {
  ordersProfitService
    .listTwoMonths()
    .then(data => res.send(data));
});

router.get('/summary', (req, res) => {
  ordersProfitService
    .summary(req.params)
    .then(data => res.send(data));
});

module.exports = router;
