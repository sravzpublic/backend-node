'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * dj30Component Schema
 */
var dj30componentSchema = new Schema({
    dateadded: {
        type: Date,
        required: 'Please fill event date'
    },
	symbol: {
		type: String,
		default: '',
		trim: true
    },
	company: {
		type: String,
		default: '',
		trim: true
    },    
	exchange: {
		type: String,
		default: '',
		trim: true
    },    
	industry: {
		type: String,
		default: '',
		trim: true
    },      
    notes: {
        type: String,
        default: '',
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
},
    
{ collection: 'dj30_components' });

mongoose.model('dj30component', dj30componentSchema);