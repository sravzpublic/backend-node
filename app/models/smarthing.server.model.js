'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

//{"access_token":"735fd09a-85bf-4901-bf0f-af4d2170f469","token_type":"bearer","expires_in":1576633135,"scope":"app","expires_at":"2068-03-05T21:02:45.048Z"}

/**
 * Smarthing Schema
 */
var SmarthingSchema = new Schema({
 token: {
	    access_token: String,
	    token_type: String,
	    expires_in: Number,
	    expires_at: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Smarthing', SmarthingSchema);
