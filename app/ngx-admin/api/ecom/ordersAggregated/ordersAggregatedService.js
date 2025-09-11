/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const logger = require('../../../utils/logger');
const OrdersAggregatedRepository = require('./ordersAggregatedRepository');
const OrderRepository = require('../order/orderRepository');
const numberService = require('../../../utils/number.service');
const dateService = require('../../../utils/date.service');

class OrdersAggregatedService {
  constructor() {
    this.ordersAggregatedRepository = new OrdersAggregatedRepository();
    this.orderRepository = new OrderRepository();
  }

  listByCountry(countryCode) {
    return this.ordersAggregatedRepository.getCountryStatistics(countryCode)
      .then(data => data.map(item => {
        return {
          orderType: item._id.type,
          count: item.count,
        };
      }));
  }

  list(aggregation) {
    switch (aggregation) {
      case 'year': {
        return this.listYearly()
          .then(data => this.mapOrders(data, x => x));
      }
      case 'month': {
        return this.listMonthly()
          .then(data => this.mapOrders(data, x => dateService.getShortMonthName(x - 1)));
      }
      case 'week': {
        return this.listWeekly()
          .then(data => this.mapOrders(data, x => dateService.getShortWeekDay(x)));
      }
      default: {
        logger.info(`Incorrect filter parameter ${aggregation} of ordersAggregatedService.list`);
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    }
  }

  // returns data for the last 10 years
  listYearly() {
    const tenYearBefore = dateService.getYearsBefore(10);
    return Promise.all([
      this.ordersAggregatedRepository.getOrderCountYearlyByStatus(tenYearBefore),
      this.ordersAggregatedRepository.getOrderCountYearly(tenYearBefore),
    ])
      .then(([dataGrouped, dataAll]) => {
        const mappedDataGrouped = this.mapRepositoryData(dataGrouped, item => item._id.year);
        const mappedDataAll = this.mapRepositoryData(dataAll, item => item._id.year);

        return {
          data: mappedDataGrouped.concat(mappedDataAll),
          range: numberService.getSequentialRange(tenYearBefore.getFullYear(), 10),
        };
      });
  }

  // returns data from start of the month (up to 31 items)
  listMonthly() {
    const today = new Date();
    return Promise.all([
      this.ordersAggregatedRepository.getOrderCountMonthlyByStatus(dateService.getYearStart(today)),
      this.ordersAggregatedRepository.getOrderCountMonthly(dateService.getYearStart(today)),
    ])
      .then(([dataGrouped, dataAll]) => {
        const mappedDataGrouped = this.mapRepositoryData(dataGrouped, item => item._id.month);
        const mappedDataAll = this.mapRepositoryData(dataAll, item => item._id.month);

        return {
          data: mappedDataGrouped.concat(mappedDataAll),
          range: numberService.getSequentialRange(1, 12),
        };
      });
  }

  // todo: fix order of weekdays, it sorted now by day index, but the real order for 'week before' is different
  // returns 7 items of the data for period of 7 days before
  listWeekly() {
    const today = new Date();
    return Promise.all([
      this.ordersAggregatedRepository.getOrderCountDailyByStatus(dateService.getWeekBefore(today)),
      this.ordersAggregatedRepository.getOrderCountDaily(dateService.getWeekBefore(today)),
    ])
      .then(([dataGrouped, dataAll]) => {
        const mappedDataGrouped = this.mapRepositoryData(dataGrouped, item => item._id.day);
        const mappedDataAll = this.mapRepositoryData(dataAll, item => item._id.day);

        return {
          data: mappedDataGrouped.concat(mappedDataAll),
          range: numberService.getSequentialRange(1, 7),
        };
      });
  }

  summary() {
    const monthBefore = dateService.getMonthBefore(1);
    const startOfMonthBefore = dateService.startOfMonth(monthBefore);
    const endOfMonthBefore = dateService.endOfMonth(monthBefore);

    const weekBefore = dateService.getWeekBefore();
    const startOfWeekBefore = dateService.startOfWeek(weekBefore);
    const endOfWeekBefore = dateService.endOfWeek(weekBefore);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(dateService.addDays(now));

    return Promise.all([
      this.orderRepository.getCount(),
      this.orderRepository.getCountByDates(startOfMonthBefore, endOfMonthBefore),
      this.orderRepository.getCountByDates(startOfWeekBefore, endOfWeekBefore),
      this.orderRepository.getCountByDates(todayStart.toISOString(), todayEnd.toISOString()),
    ])
      .then(([totalCount, monthBeforeCount, weekBeforeCount, todayCount]) => {
        const finalTotalCount = totalCount || 0;
        const finalMonthBeforeCount = monthBeforeCount || { count: 0 };
        const finalWeekBeforeCount = weekBeforeCount || { count: 0 };
        const finalTodayCount = todayCount || { count: 0 };

        return {
          today: finalTodayCount.count,
          lastMonth: finalMonthBeforeCount.count,
          lastWeek: finalWeekBeforeCount.count,
          marketplace: finalTotalCount,
        };
      });
  }

  mapRepositoryData(data, getGroup) {
    return data.map(item => {
      return {
        status: item._id.status,
        group: getGroup(item),
        count: item.count,
      };
    });
  }

  mapOrders(result, groupHandler) {
    const statuses = [...new Set(result.data.map(item => item.status))];
    let labels = [...new Set(result.data.map(x => x.group))];
    const labelsToAdd = result.range.filter(x => !labels.find(item => item === x));

    labels = labels.concat(labelsToAdd);
    labels.sort((a, b) => a - b);
    labels = labels.map(x => groupHandler(x));

    return {
      axisXLabels: labels,
      chartLabel: '',
      lines: statuses.map(status => {
        let values = result.data.filter(item => item.status === status);
        const valuesToAdd = result.range.filter(x => !values.find(item => item.group === x));

        values = values.concat(valuesToAdd.map(x => {
          return {
            status,
            group: x,
            count: 0,
          };
        }));

        values.sort(this.compareGroups);

        return {
          type: status,
          values: values.map(x => x.count),
        };
      }),
    };
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
}

module.exports = OrdersAggregatedService;
