/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const queryFilterOptions = {
  filterByname: (value) => {
    return { name: { $regex: value, $options: '-i' } };
  },
  filterBytype: (value) => {
    return { type: { $regex: value, $options: '-i' } };
  },
  filterBystatus: (value) => {
    return { status: { $regex: value, $options: '-i' } };
  },
  filterBycountry: (value) => {
    return { countryName: { $regex: value, $options: '-i' } };
  },
  filterBysum: (value) => {
    return { $where: `/^${value}.*/.test(this.value)` };
  },
  filterBydate: (value) => {
    return { $where: `/${value}/.test(this.createdDate && this.createdDate.toLocaleDateString())` };
  },
};

const sortByOptions = {
  sum: 'value',
  country: 'countryName',
};

const getFilterQuery = (orderFilter) => {
  const query = Object.keys(orderFilter).reduce((result, value) => {
    if (queryFilterOptions[value]) {
      const filterOption = queryFilterOptions[value](orderFilter[value]);

      return {
        ...result,
        ...filterOption,
      };
    }

    return result;
  }, {});

  return query;
};

const mapOrderFilterParameters = (orderFilter) => {
  const query = getFilterQuery(orderFilter);
  const sortBy = sortByOptions[orderFilter.sortBy] || orderFilter.sortBy;

  return {
    ...orderFilter,
    query,
    sortBy,
  };
};

module.exports = {
  mapOrderFilterParameters,
};
