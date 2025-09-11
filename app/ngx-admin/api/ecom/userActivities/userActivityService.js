/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const logger = require('../../../utils/logger');
const UserActivityRepository = require('./userActivityRepository');
const numberService = require('../../../utils/number.service');
const dateService = require('../../../utils/date.service');

class UserActivityService {
  constructor() {
    this.userActivityRepository = new UserActivityRepository();
  }

  add(userActivity) {
    return this.userActivityRepository.add(userActivity);
  }

  addMany(userActivities) {
    return this.userActivityRepository.addMany(userActivities);
  }

  list(filter) {
    const today = new Date();
    switch (filter) {
      case 'year': {
        return this.listYearly()
          .then(data => this.mapUserActivities(data));
      }
      case 'month': {
        return this.listMonthly(today)
          .then(data => this.mapUserActivities(
            data,
            group => `${group} ${dateService.getShortMonthName(today.getMonth())}`,
          ));
      }
      case 'week': {
        return this.listWeekly()
          .then(data => this.mapUserActivities(data,
            group => dateService.getShortWeekDay(group)));
      }
      default: {
        logger.info(`Incorrect filter parameter ${filter} of userActivitiesService.list`);
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    }
  }

  // returns data for the last 10 years
  listYearly() {
    const tenYearBefore = new Date();
    tenYearBefore.setFullYear(tenYearBefore.getFullYear() - 10);
    return this.userActivityRepository.getYearlyData(tenYearBefore)
      .then(data => {
        const mappedData = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(tenYearBefore.getFullYear(), 10);
        const valuesToAdd = range.filter(x => !mappedData.find(item => item.group === x));

        return mappedData.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  // returns data from start of the month (up to 31 items)
  listMonthly(date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    return this.userActivityRepository.getMonthlyData(monthStart)
      .then(data => {
        data = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(1, date.getDate());
        const valuesToAdd = range.filter(x => !data.find(item => item.group === x));
        return data.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  // todo: fix order of weekdays, it sorted now by day index, but the real order for 'week before' is different
  // returns 7 items of the data for period of 7 days before
  listWeekly() {
    const weekBefore = new Date();
    weekBefore.setDate(weekBefore.getDate() - 7);
    return this.userActivityRepository.getWeeklyData(weekBefore)
      .then(data => {
        data = this.mapRepositoryData(data);
        const range = numberService.getSequentialRange(1, 7);
        const valuesToAdd = range.filter(x => !data.find(item => item.group === x));
        return data.concat(this.mapEmptyEntries(valuesToAdd));
      });
  }

  mapEmptyEntries(values) {
    return values.map(x => {
      return {
        group: x,
        sum: 0,
        count: 0,
      };
    });
  }

  mapUserActivities(data, groupHandler) {
    data.sort(this.compareGroups);

    return data.map((item, index) => {
      const prevCount = index > 0 ? data[index - 1].count : 0;
      const trend = prevCount ? (item.count - prevCount) / prevCount * 100 : 0;

      return {
        pagesVisit: item.count,
        label: groupHandler ? groupHandler(item.group) : item.group,
        trend,
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
        count: item.count,
      };
    });
  }
}

module.exports = UserActivityService;
