'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * russellcomponent Schema
 */

var russellcomponentSchema = new Schema({
	ticker: {
		type: String,
		default: '',
		trim: true
    },
	name: {
		type: String,
		default: '',
		trim: true
    },    
	asset_class: {
		type: String,
		default: '',
		trim: true
    },    
	weight_pct: {
		type: Number,
		default: '',
		trim: true
    },      
    price: {
        type: Number,
        default: '',
        trim: true
    },
    shares: {
        type: Number,
        default: '',
        trim: true
    },
    market_value: {
        type: Number,
        default: '',
        trim: true
    },
    notional_value: {
        type: Number,
        default: '',
        trim: true
    },
    sector: {
        type: String,
        default: '',
        trim: true
    },
	sedol: {
		type: String,
        default: '',
        trim: true
    },
	isin: {
		type: String,
        default: '',
        trim: true
    },   
	exchange: {
		type: String,
        default: '',
        trim: true
	},      
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
},
    
{ collection: 'russell_components' });

mongoose.model('russellcomponent', russellcomponentSchema);