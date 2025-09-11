'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Smarthing = mongoose.model('Smarthing'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  smarthing;

/**
 * Smarthing routes tests
 */
describe('Smarthing CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Smarthing
    user.save(function () {
      smarthing = {
        name: 'Smarthing name'
      };

      done();
    });
  });

  it('should be able to save a Smarthing if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Smarthing
        agent.post('/api/smarthings')
          .send(smarthing)
          .expect(200)
          .end(function (smarthingSaveErr, smarthingSaveRes) {
            // Handle Smarthing save error
            if (smarthingSaveErr) {
              return done(smarthingSaveErr);
            }

            // Get a list of Smarthings
            agent.get('/api/smarthings')
              .end(function (smarthingsGetErr, smarthingsGetRes) {
                // Handle Smarthings save error
                if (smarthingsGetErr) {
                  return done(smarthingsGetErr);
                }

                // Get Smarthings list
                var smarthings = smarthingsGetRes.body;

                // Set assertions
                (smarthings[0].user._id).should.equal(userId);
                (smarthings[0].name).should.match('Smarthing name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Smarthing if not logged in', function (done) {
    agent.post('/api/smarthings')
      .send(smarthing)
      .expect(403)
      .end(function (smarthingSaveErr, smarthingSaveRes) {
        // Call the assertion callback
        done(smarthingSaveErr);
      });
  });

  it('should not be able to save an Smarthing if no name is provided', function (done) {
    // Invalidate name field
    smarthing.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Smarthing
        agent.post('/api/smarthings')
          .send(smarthing)
          .expect(400)
          .end(function (smarthingSaveErr, smarthingSaveRes) {
            // Set message assertion
            (smarthingSaveRes.body.message).should.match('Please fill Smarthing name');

            // Handle Smarthing save error
            done(smarthingSaveErr);
          });
      });
  });

  it('should be able to update an Smarthing if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Smarthing
        agent.post('/api/smarthings')
          .send(smarthing)
          .expect(200)
          .end(function (smarthingSaveErr, smarthingSaveRes) {
            // Handle Smarthing save error
            if (smarthingSaveErr) {
              return done(smarthingSaveErr);
            }

            // Update Smarthing name
            smarthing.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Smarthing
            agent.put('/api/smarthings/' + smarthingSaveRes.body._id)
              .send(smarthing)
              .expect(200)
              .end(function (smarthingUpdateErr, smarthingUpdateRes) {
                // Handle Smarthing update error
                if (smarthingUpdateErr) {
                  return done(smarthingUpdateErr);
                }

                // Set assertions
                (smarthingUpdateRes.body._id).should.equal(smarthingSaveRes.body._id);
                (smarthingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Smarthings if not signed in', function (done) {
    // Create new Smarthing model instance
    var smarthingObj = new Smarthing(smarthing);

    // Save the smarthing
    smarthingObj.save(function () {
      // Request Smarthings
      request(app).get('/api/smarthings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Smarthing if not signed in', function (done) {
    // Create new Smarthing model instance
    var smarthingObj = new Smarthing(smarthing);

    // Save the Smarthing
    smarthingObj.save(function () {
      request(app).get('/api/smarthings/' + smarthingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', smarthing.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Smarthing with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/smarthings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Smarthing is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Smarthing which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Smarthing
    request(app).get('/api/smarthings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Smarthing with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Smarthing if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Smarthing
        agent.post('/api/smarthings')
          .send(smarthing)
          .expect(200)
          .end(function (smarthingSaveErr, smarthingSaveRes) {
            // Handle Smarthing save error
            if (smarthingSaveErr) {
              return done(smarthingSaveErr);
            }

            // Delete an existing Smarthing
            agent.delete('/api/smarthings/' + smarthingSaveRes.body._id)
              .send(smarthing)
              .expect(200)
              .end(function (smarthingDeleteErr, smarthingDeleteRes) {
                // Handle smarthing error error
                if (smarthingDeleteErr) {
                  return done(smarthingDeleteErr);
                }

                // Set assertions
                (smarthingDeleteRes.body._id).should.equal(smarthingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Smarthing if not signed in', function (done) {
    // Set Smarthing user
    smarthing.user = user;

    // Create new Smarthing model instance
    var smarthingObj = new Smarthing(smarthing);

    // Save the Smarthing
    smarthingObj.save(function () {
      // Try deleting Smarthing
      request(app).delete('/api/smarthings/' + smarthingObj._id)
        .expect(403)
        .end(function (smarthingDeleteErr, smarthingDeleteRes) {
          // Set message assertion
          (smarthingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Smarthing error error
          done(smarthingDeleteErr);
        });

    });
  });

  it('should be able to get a single Smarthing that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Smarthing
          agent.post('/api/smarthings')
            .send(smarthing)
            .expect(200)
            .end(function (smarthingSaveErr, smarthingSaveRes) {
              // Handle Smarthing save error
              if (smarthingSaveErr) {
                return done(smarthingSaveErr);
              }

              // Set assertions on new Smarthing
              (smarthingSaveRes.body.name).should.equal(smarthing.name);
              should.exist(smarthingSaveRes.body.user);
              should.equal(smarthingSaveRes.body.user._id, orphanId);

              // force the Smarthing to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Smarthing
                    agent.get('/api/smarthings/' + smarthingSaveRes.body._id)
                      .expect(200)
                      .end(function (smarthingInfoErr, smarthingInfoRes) {
                        // Handle Smarthing error
                        if (smarthingInfoErr) {
                          return done(smarthingInfoErr);
                        }

                        // Set assertions
                        (smarthingInfoRes.body._id).should.equal(smarthingSaveRes.body._id);
                        (smarthingInfoRes.body.name).should.equal(smarthing.name);
                        should.equal(smarthingInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Smarthing.remove().exec(done);
    });
  });
});
