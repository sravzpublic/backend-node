/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const OrderRepository = require('./orderRepository');
const CountryService = require('../countries/countriesService');

class OrderService {
  constructor() {
    this.repository = new OrderRepository();
    this.countryService = new CountryService();
  }

  getCount() {
    return this.repository.getCount();
  }

  findById(id) {
    return this.repository.findById(id)
      .then(user => this.mapOrderToDto(user));
  }

  add(dto) {
    const order = this.mapDtoToOrder(dto);

    return this.countryService.getCountries()
      .then(countries => {
        const country = countries.find(x => x.id === order.countryId);
        order.countryName = country.name;

        return this.repository.add(order);
      });
  }

  edit(dto) {
    const order = this.mapDtoToOrder(dto);

    return this.countryService.getCountries()
      .then(countries => {
        const country = countries.find(x => x.id === order.countryId);
        order.countryName = country.name;
        return this.repository.edit(dto.id, order);
      });
  }

  delete(id) {
    return this.repository.delete(id);
  }

  list(filter) {
    return Promise.all([
      this.repository.listFiltered(filter),
      this.repository.getCountFiltered(filter),
    ])
      .then(([data, count]) => {
        return {
          items: data.map(item => this.mapOrderToDto(item)),
          totalCount: count,
        };
      });
  }

  addMany(orders) {
    return this.repository.addMany(orders);
  }

  listOrderTypes() {
    const types = ['Sofas', 'Furniture', 'Lighting', 'Tables', 'Textiles'];
    return new Promise((resolve) => {
      types.sort();

      resolve(types);
    });
  }

  listOrderStatuses() {
    const types = ['Payment', 'Canceled'];

    return new Promise((resolve) => {
      resolve(types);
    });
  }

  mapOrderToDto(item) {
    return item ? {
      id: item._id,
      name: item.name,
      date: item.date,
      sum: {
        currency: 'USD',
        value: Math.floor(item.value),
      },
      type: item.type,
      status: item.status,
      country: {
        id: item.countryId,
        name: item.countryName,
      },
    } : {};
  }

  mapDtoToOrder(dto) {
    return dto ? {
      name: dto.name,
      date: new Date(dto.date),
      value: parseInt(dto.sum.value, 10),
      currency: dto.sum.currency || 'USD',
      type: dto.type,
      status: dto.status,
      countryId: dto.country.id,
      countryName: dto.country.name,
    } : {};
  }
}

module.exports = OrderService;
