/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License. 
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const TrafficRepository = require('./trafficRepository');

class TrafficService {
  constructor() {
    this.repository = new TrafficRepository();
  }

  addTraffic(data) {
    return this.repository.add(data);
  }

  addMany(traffic) {
    return this.repository.addMany(traffic);
  }

  list(filter) {
    return Promise.all([
      this.repository.listFiltered(filter),
      this.repository.getCountFiltered(filter),
    ])
      .then(([data, count]) => {
        return {
          items: data.map(item => this.mapTrafficToDto(item)),
          totalCount: count,
        };
      });
  }

  mapTrafficToDto(item) {
    return item ? {
      id: item._id,
      date: item.date,
      value: item.value,
    } : {};
  }
}

module.exports = TrafficService;
