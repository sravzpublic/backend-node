/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');
const OrderService = require('../order/orderService');

const router = express.Router();

const orderService = new OrderService();

router.get('/', (req, res) => {
  orderService
    .listOrderTypes()
    .then(data => res.send(data));
});

module.exports = router;
