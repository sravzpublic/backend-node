'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Portfolio Schema
 */
var PortfolioSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Portfolio name',
		trim: true
    },
    description: {
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
	},
    cost: {
        type: Number,
        default: 0,
        required: 'Please fill intial cost'
    },
    value: {
        type: Number,
        default: 0,
        required: 'Please fill current value'
    },
    pnl: {
        type: Number,
        default: 0,
        required: 'Please fill PNL'
    },
    ispublic: {
        type: Boolean,
        default: false,
        required: 'Please set is public'
    },
    pnlcalculationdt: {
        type: Date,
        default: Date.now
    },
    portfolioassets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolioasset' }]
});

mongoose.model('Portfolio', PortfolioSchema);