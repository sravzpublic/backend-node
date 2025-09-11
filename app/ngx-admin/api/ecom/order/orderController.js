/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');

const router = express.Router();

const OrderService = require('./orderService');

const orderService = new OrderService();

router.get('/', (req, res) => {
  orderService
    .list(req.query)
    .then(orders => res.send(orders));
});

router.post('/', (req, res) => {
  orderService
    .add(req.body)
    .then(order => res.send(order));
});

router.get('/:id', (req, res) => {
  orderService
    .findById(req.params.id)
    .then(order => res.send(order));
});

router.put('/:id', (req, res) => {
  orderService
    .edit(req.body)
    .then(order => res.send(order));
});

router.delete('/:id', (req, res) => {
  orderService
    .delete(req.params.id)
    .then(() => res.send({ id: req.params.id }));
});

module.exports = router;
