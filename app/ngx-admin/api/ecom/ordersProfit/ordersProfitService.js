/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const logger = require('../../../utils/logger');
const OrderRepository = require('../order/orderRepository');
const OrderProfitRepository = require('./ordersProfitRepository');
const OrderService = require('../order/orderService');
const dateService = require('../../../utils/date.service');
const numberService = require('../../../utils/number.service');

class OrdersProfitService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderProfitRepository = new OrderProfitRepository();
    this.orderService = new OrderService();
  }

  listYear() {
    const today = new Date();

    return Promise.all([
      this.orderService.listOrderStatuses(),
      this.orderProfitRepository.getProfitDataMonthly(
        dateService.getYearStart(today),
        dateService.getYearEnd(today),
      ),
    ])
      .then(([statuses, data]) => {
        return {
          axisXLabels: '',
          chartLabel: '$',
          lines: statuses.map(status => {
            const dataPerStatus = data.filter(item => item._id.status === status);

            return {
              type: status === 'Payment' ? 'transactions' : 'orders',
              values: dataPerStatus.map(item => item.sum),
            };
          }),
        };
      });
  }

  listTwoMonths() {
    const startFirstMont = dateService.startOfMonth(dateService.getMonthBefore(2));
    const endFirstMonth = dateService.endOfMonth(dateService.getMonthBefore(2));
    const startSecondMonth = dateService.startOfMonth(dateService.getMonthBefore(1));
    const endSecondMonth = dateService.endOfMonth(dateService.getMonthBefore(1));

    return Promise.all([
      this.orderProfitRepository.getProfitDataBuckets(startFirstMont, endFirstMonth, 5),
      this.orderProfitRepository.getProfitDataBuckets(startSecondMonth, endSecondMonth, 5),
    ])
      .then(([dataFirstMonth, dataSecondMonth]) => {
        const firstMonthSum = dataFirstMonth
          .map(x => x.sum)
          .reduce((a, b) => a + b, 0);
        const secondMonthSum = dataSecondMonth
          .map(x => x.sum)
          .reduce((a, b) => a + b, 0);

        return {
          axisXLabels: '',
          chartLabel: '$',
          lines: [
            {
              type: '',
              values: [...dataFirstMonth, ...dataSecondMonth].map(item => Math.floor(item.sum)),
            },
          ],
          aggregatedData: [
            {
              value: Math.floor(firstMonthSum),
              title: `${startFirstMont.getDate()} ${dateService.getShortMonthName(startFirstMont.getMonth())}`
                + `- ${endFirstMonth.getDate()} ${dateService.getShortMonthName(endFirstMonth.getMonth())}`,
            },
            {
              value: Math.floor(secondMonthSum),
              title: `${startSecondMonth.getDate()} ${dateService.getShortMonthName(startSecondMonth.getMonth())}`
                + ` - ${endSecondMonth.getDate()} ${dateService.getShortMonthName(endSecondMonth.getMonth())}`,
            },
          ],
        };
      });
  }

  summary() {
    const weekBefore = dateService.getWeekBefore();
    const startOfWeekBefore = dateService.startOfWeek(weekBefore);
    const endOfWeekBefore = dateService.endOfWeek(weekBefore);
    const today = new Date();
    const startOfWeek = dateService.startOfWeek(today);
    const endOfWeek = dateService.endOfWeek(today);

    return Promise.all([
      this.orderRepository.getCountByDates(startOfWeekBefore, endOfWeekBefore),
      this.orderRepository.getCountByDates(startOfWeek, endOfWeek),
      this.orderProfitRepository.getProfitByDates(startOfWeekBefore, endOfWeekBefore),
      this.orderProfitRepository.getProfitByDates(startOfWeek, endOfWeek),
    ])
      .then(([weekBeforeCountData, weekCountData, weekBeforeProfits, weekProfits]) => {
        const random1 = numberService.randomInt(100);
        const random2 = numberService.randomInt(100);
        const weekCountFinalData = weekCountData || { count: 0 };
        const weekBeforeCountFinalData = weekBeforeCountData || { count: 0 };
        const weekProfitsFinal = weekProfits || { sum: 0 };
        const weekBeforeProfitsFinal = weekBeforeProfits || { sum: 0 };

        return {
          weekCommentsProfit: {
            value: random1,
            trend: Math.floor(((random1 - random2) / random2 * 100)),
          },
          weekOrdersProfit: {
            value: weekCountFinalData.count,
            trend: weekBeforeCountFinalData.count === 0
              ? 0
              : Math.floor(
                ((weekCountFinalData.count - weekBeforeCountFinalData.count) / weekBeforeCountFinalData.count * 100),
              ),
          },
          todayProfit: {
            value: Math.floor(weekProfitsFinal.sum),
            trend: Math.floor(((Math.floor(weekProfitsFinal.sum) - Math.floor(weekBeforeProfitsFinal.sum)) / Math.floor(weekBeforeProfitsFinal.sum) * 100)),
          },
        };
      });
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
      this.orderProfitRepository.getOrderSumYearlyByStatus(tenYearBefore),
      this.orderProfitRepository.getOrderSumYearly(tenYearBefore),
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
      this.orderProfitRepository.getOrderSumMonthlyByStatus(dateService.getYearStart(today)),
      this.orderProfitRepository.getOrderSumMonthly(dateService.getYearStart(today)),
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
      this.orderProfitRepository.getOrderSumDailyByStatus(dateService.getWeekBefore(today)),
      this.orderProfitRepository.getOrderSumDaily(dateService.getWeekBefore(today)),
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

  mapRepositoryData(data, getGroup) {
    return data.map(item => {
      return {
        status: item._id.status,
        group: getGroup(item),
        sum: Math.floor(item.sum),
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
            sum: 0,
          };
        }));
        values.sort(this.compareGroups);
        return {
          type: status,
          values: values.map(x => x.sum),
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

module.exports = OrdersProfitService;
