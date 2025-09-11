/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const OrderService = require('./ecom/order/orderService');
const UserService = require('./common/user/userService');
const UserActivityService = require('./ecom/userActivities/userActivityService');
const TrafficService = require('./ecom/traffic/trafficService');
const CountryService = require('./ecom/countries/countriesService');
const cipher = require('./common/auth/cipherHelper');
const logger = require('../utils/logger');
const numberService = require('../utils/number.service');
const dateService = require('../utils/date.service');

const countryService = new CountryService();
const orderService = new OrderService();
const userService = new UserService();
const userActivityService = new UserActivityService();
const trafficService = new TrafficService();

class SeedService {
  checkAndSeed() {
    logger.info('Seed Data')
    orderService.getCount()
      .then(count => {
        if (!count) {
          this.seed().then();
        }
      });
  }

  // function to add stub data for testing
  async seed() {
    try {
      logger.info('Seed Data');
      await this.addCustomUsers();
      await this.addRandomUsers(this.getNames());
      logger.info('Seed Users Done');
      const users = await userService.list({ sortBy: 'name', orderBy: 'ASC', pageSize: 20, pageNumber: 1 });
      await this.addRandomUserActivities(users.items);
      logger.info('Seed User Activities Done');
      const types = await orderService.listOrderTypes();
      const statuses = await orderService.listOrderStatuses();
      await this.addRandomOrders(types, statuses);
      logger.info('Seed Orders Done');
      await this.addRandomTraffic();
      logger.info('Seed Traffic Done')
    } catch (err) {
      logger.error(err);
    }
  }

  addCustomUsers() {
    // add 2 custom users
    const usersToAdd = [];
    let hash = cipher.saltHashPassword('!2e4S');
    const admin = {
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@admin.admin',
      fullName: '@Admin',
      role: 'admin',
      age: 18,
      salt: hash.salt,
      passwordHash: hash.passwordHash,
    };
    usersToAdd.push(admin);

    hash = cipher.saltHashPassword('********');
    const guest = {
      firstName: 'Guest',
      lastName: 'Guest',
      email: 'guest@guest.com',
      fullName: 'Guest',
      role: 'user',
      age: 18,
      salt: hash.salt,
      passwordHash: hash.passwordHash,
    };
    usersToAdd.push(user);

    hash = cipher.saltHashPassword('12345');
    const user = {
      firstName: 'User',
      lastName: 'User',
      email: 'user@user.user',
      fullName: '@User',
      role: 'user',
      age: 18,
      salt: hash.salt,
      passwordHash: hash.passwordHash,
    };
    usersToAdd.push(user);
    return userService.addMany(usersToAdd);
  }

  addRandomUsers(names) {
    const usersToAdd = [];
    for (let i = 0; i < 30; i++) {
      const hash = cipher.saltHashPassword(`pass_${i}`);
      const firstName = names[i].split(' ')[0];
      const lastName = names[i].split(' ')[1];
      const newUser = {
        email: `${firstName.toLowerCase()}_${lastName.toLowerCase()}@user.com`,
        fullName: `@User_${firstName}_${lastName}`,
        firstName,
        lastName,
        role: 'user',
        age: 18,
        salt: hash.salt,
        passwordHash: hash.passwordHash,
      };
      usersToAdd.push(newUser);
    }

    return userService.addMany(usersToAdd);
  }

  addRandomUserActivities(addedUsers) {
    const activities = [];
    const today = new Date();

    for (let i = 0; i < 1000; i++) {
      activities.push({
        userId: addedUsers[numberService.randomInt(addedUsers.length - 1)].id,
        date: dateService.randomDate(),
        url: `url ${numberService.random(1, 50)}`,
      });
    }

    for (let i = 0; i < 1000; i++) {
      activities.push({
        userId: addedUsers[numberService.randomInt(addedUsers.length - 1)].id,
        date: dateService.randomDate(new Date(today.getFullYear() - 2, 0, 1)),
        url: `url ${numberService.random(1, 50)}`,
      });
    }

    for (let i = 0; i < 1000; i++) {
      activities.push({
        userId: addedUsers[numberService.randomInt(addedUsers.length - 1)].id,
        date: dateService.randomDate(new Date(today.getFullYear(), 0, 1)),
        url: `url ${numberService.random(1, 50)}`,
      });
    }

    return userActivityService.addMany(activities);
  }

  addRandomOrders(types, statuses) {
    const orders = [];
    const today = new Date();
    const limit = 1000;

    for (let i = 0; i < limit; i++) {
      orders.push(this.createRandomOrder(
        `Order A ${i}`,
        dateService.randomDate(),
        types,
        statuses,
      ));
    }
    for (let i = 0; i < limit; i++) {
      orders.push(this.createRandomOrder(
        `Order B ${i}`,
        dateService.randomDate(new Date(today.getFullYear() - 4, 0, 1), new Date(today.getFullYear() - 2, 1, 1)),
        types,
        statuses,
      ));
    }
    for (let i = 0; i < 400; i++) {
      orders.push(this.createRandomOrder(
        `Order B ${i}`,
        dateService.randomDate(new Date(today.getFullYear() - 3, 0, 1), new Date(today.getFullYear() - 2, 1, 1)),
        types,
        statuses,
      ));
    }
    for (let i = 0; i < 700; i++) {
      orders.push(this.createRandomOrder(
        `Order B ${i}`,
        dateService.randomDate(new Date(today.getFullYear() - 2, 0, 1)),
        types,
        statuses,
      ));
    }
    for (let i = 0; i < 300; i++) {
      orders.push(this.createRandomOrder(
        `Order B ${i}`,
        dateService.randomDate(new Date(today.getFullYear() - 3, 0, 1)),
        types,
        statuses,
      ));
    }
    return orderService.addMany(orders);
  }

  createRandomOrder(name, date, types, statuses) {
    const country = this.randomCountry();

    return {
      name,
      date,
      value: this.randomValue(),
      type: this.randomFromList(types),
      currency: 'USD',
      status: this.randomFromList(statuses),
      countryId: country.code,
      countryName: country.name,
      createdDate: date,
      createdByUserId: 'seed',
    };
  }

  addRandomTraffic() {
    const traffic = [];
    const today = new Date();
    const limit = 1000;
    for (let i = 0; i < limit; i++) {
      traffic.push({
        date: dateService.randomDate(),
        value: numberService.randomInt(100),
      });
    }
    for (let i = 0; i < limit; i++) {
      traffic.push({
        date: dateService.randomDate(new Date(today.getFullYear() - 2, 0, 1)),
        value: numberService.randomInt(100),
      });
    }
    for (let i = 0; i < limit; i++) {
      traffic.push({
        date: dateService.randomDate(new Date(today.getFullYear() - 3, 0, 1)),
        value: numberService.randomInt(100),
      });
    }
    return trafficService.addMany(traffic);
  }

  randomValue() {
    return numberService.random(0, 1000);
  }

  randomFromList(list) {
    let index = numberService.randomInt(list.length);
    if (index === list.length) {
      index--;
    }
    return list[index];
  }

  randomCountry() {
    const { countries } = countryService;

    return countries[numberService.randomInt(countries.length - 1)];
  }

  getNames() {
    return ['Rostand Simon', 'Petulia Samuel', 'Bacon Mathghamhain', 'Adlei Michael', 'Damian IvorJohn', 'Fredenburg Neil', 'Strader O\'\'Neal', 'Meill Donnell', 'Crowell O\'\'Donnell',
      'Lenssen Rory', 'Jac Names', 'Budge Mahoney', 'Bondy Simon', 'Bilow Ahearn', 'Weintrob Farrell', 'Tristan Cathasach', 'Baxy Bradach', 'Utta Damhan', 'Brag Treasach',
      'Vallie Kelly', 'Trutko Aodha', 'Mellins Cennetig', 'Zurek Casey', 'Star O\'\'Neal', 'Hoffer Names', 'Sturges Macshuibhne', 'Lifton Sioda', 'Rochell Ahearn', 'Lynsey Mcmahon',
      'Delp Seaghdha', 'Sproul O\'\'Brien', 'Omar Ahearn', 'Keriann Bhrighde', 'Killoran Sullivan', 'Olette Riagain', 'Kohn Gorman', 'Shimberg Maurice', 'Nalda Aodh',
      'Livvie Casey', 'Zoie Treasach', 'Kletter Daly', 'Sandy Mckay', 'Ern O\'\'Neal', 'Loats Maciomhair', 'Marlena Mulryan', 'Hoshi Naoimhin', 'Schmitt Whalen',
      'Patterson Raghailligh', 'Ardeen Kelly', 'Rasla Simon', 'Douty Cennetig', 'Giguere Names', 'Dorina Clark', 'Rothmuller Simon', 'Shabbir Delaney', 'Placidia Bradach',
      'Savior Keefe', 'Concettina Maguire', 'Malynda Muirchertach', 'Vanzant Fearghal', 'Schroder Ruaidh', 'Ainslie Ciardha', 'Richter Colman', 'Gianni Macghabhann',
      'Norvan O\'\'Boyle', 'Polak Mcneil', 'Bridges Macghabhann', 'Eisenberg Samuel', 'Thenna Daly', 'Moina Mcmahon', 'Gasper Whelan', 'Hutt O\'\'Keefe', 'Quintin Names',
      'Towny Reynold', 'Viviane Ceallachan', 'Girovard Power', 'Fanchon Flann', 'Nickolai Meadhra', 'Polash Login', 'Cacilia Macghabhann', 'Chaffee Rory', 'Baseler Conchobhar',
      'Amathiste Cuidightheach', 'Ishii Riagain', 'Marieann Damhan', 'Rangel Dubhain', 'Alarick Fionn', 'Humfrey Rory', 'Mable O\'\'Mooney', 'Jemie Macdermott', 'Hogen Rhys',
      'Cazzie Mohan', 'Airlie Reynold', 'Safire O\'\'Hannigain', 'Strephonn Nuallan', 'Brion Eoghan', 'Banquer Seaghdha', 'Sedgewinn Mcguire', 'Alma Macghabhann', 'Durward Mcnab'];
  }
}

module.exports = SeedService;
