'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Ecocal Schema
 */
var EcocalSchema = new Schema({
    date: {
        type: Date,
        required: 'Please fill event date'
    },
	satistic: {
		type: String,
		default: '',
		required: 'Please fill statistic name',
		trim: true
    },
	country: {
		type: String,
		default: '',
		required: 'Please fill statistic name',
		trim: true
    },    
	event: {
		type: String,
		default: '',
		required: 'Please fill statistic name',
		trim: true
    },    
	eventtime: {
		type: String,
		default: '',
		required: 'Please fill statistic name',
		trim: true
    },      
    actual: {
        type: String,
        default: '',
        trim: true
    },
    for: {
        type: String,
        default: '',
        trim: true
    },
    timet: {
        type: String,
        default: '',
        trim: true
    },
    briefingforecast: {
        type: String,
        default: '',
        trim: true
    },
    marketexpects: {
        type: String,
        default: '',
        trim: true
    },
    marketexpectation: {
        type: String,
        default: '',
        trim: true
    },    
    prior: {
        type: String,
        default: '',
        trim: true
    },
    priortothis: {
        type: String,
        default: '',
        trim: true
    },    
    revisedfrom: {
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
    
{ collection: 'economic_calendar' });

mongoose.model('Ecocal', EcocalSchema);