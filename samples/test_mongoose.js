var  mongoose = require('mongoose'),
  https = require('https'),
  fs = require('fs'),
  chalk = require('chalk'),
  Schema = mongoose.Schema; 

  var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: ''
	},
	lastName: {
		type: String,
		trim: true,
		default: ''
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: ''
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: ''
    },
    token: {
        type: String,
        default: '',
        trim: true
    },
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	}
});




/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(process.env.MONGOLAB_URI, {
    auto_reconnect: true,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0
  },
  function (err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!' + err));
      console.log(chalk.red(err));
    }
  });

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection opened');
})

var User = mongoose.model('User', UserSchema);

// find all athletes who play tennis, selecting the 'name' and 'age' fields
User.find({}, 'name', function (err, athletes) {
  if (err) return handleError(err);
  console.log(athletes)
  // 'athletes' contains the list of athletes that match the criteria.
})