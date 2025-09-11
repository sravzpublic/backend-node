/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const logger = require('../../../utils/logger');
const TrafficRepository = require('../traffic/trafficRepository');
const numberService = require('../../../utils/number.service');
const dateService = require('../../../utils/date.service');

class TrafficAggregatedService {
  constructor() {
    this.trafficRepository = new TrafficRepository();
  }

  list(filter) {
    switch (filter) {
      case 'year': {
        return this.listYearly()
          .then(data => this.mapTraffic(data));
      }
      case 'month': {
        return this.listMonthly()
          .then(data => this.mapTraffic(data, group => dateService.getShortMonthName(group - 1)));
      }
      case 'week': {
        return this.listWeekly()
          .then(data => this.mapTraffic(data, group => dateService.getShortWeekDay(group)));
      }
      default: {
        logger.info(`Incorrect filter parameter ${filter} of trafficAggregatedService.list`);
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    }
  }

  // returns data for the last 10 years
  listYearly() {
    const tenYearBefore = dateService.getYearsBefore(10);
    return this.trafficRepository.getYearlyData(tenYearBefore)
      .then(data => {
        data = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(tenYearBefore.getFullYear(), 10);
        const valuesToAdd = range.filter(x => !data.find(item => item.group === x));
        return data.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  // returns data from start of the month (up to 31 items)
  listMonthly() {
    const today = new Date();
    return this.trafficRepository.getMonthlyData(dateService.getYearStart(today), dateService.getYearEnd(today))
      .then(data => {
        data = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(1, 12);
        const valuesToAdd = range.filter(x => !data.find(item => item.group === x));
        return data.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  // todo: fix order of weekdays, it sorted now by day index, but the real order for 'week before' is different
  // returns 7 items of the data for period of 7 days before
  listWeekly() {
    const weekBefore = dateService.getWeekBefore();
    return this.trafficRepository.getWeeklyData(weekBefore)
      .then(data => {
        const mappedData = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(1, 7);
        const valuesToAdd = range.filter(x => !mappedData.find(item => item.group === x));

        return mappedData.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  mapEmptyEntries(values) {
    return values.map(x => {
      return {
        group: x,
        sum: 0,
      };
    });
  }

  mapTraffic(data, groupHandler) {
    data.sort(this.compareGroups);
    return data.map((item, index) => {
      const prevValue = index > 0 ? data[index - 1].sum : 0;
      const prevPeriod = index > 0 ? data[index - 1].group : 0;
      const trend = prevValue ? (item.sum - prevValue) / prevValue * 100 : 0;

      return {
        value: item.sum,
        period: groupHandler ? groupHandler(item.group) : item.group,
        trend,
        comparison: {
          currentPeriod: groupHandler ? groupHandler(item.group) : item.group,
          currentValue: item.sum,
          previousPeriod: groupHandler ? groupHandler(prevPeriod) : prevPeriod,
          previousValue: prevValue,
        },
      };
    });
  }

  compareGroups(a, b) {
    if (a.group > b.group) {
      return 1;
    }
    if (a.group < b.group) {
      return -1;
    }
    return 0;
  }

  mapRepositoryData(data) {
    return data.map(item => {
      return {
        group: item._id.group,
        sum: item.sum,
      };
    });
  }
}

module.exports = TrafficAggregatedService;
