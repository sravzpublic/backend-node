'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Quota Schema
 */
var QuotaSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Quota name',
		trim: true
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

mongoose.model('Quota', QuotaSchema);