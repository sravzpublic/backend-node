'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Portfolioasset Schema
 */

function RemoveFormatting(value) {
    if (value) {
        value = value.replace(",", "");
    }
    return value;
}

var PortfolioassetSchema = new Schema({
	asset: {
        type: Schema.ObjectId,
        ref: 'Asset'
    },
    purchaseprice: {
        type: Number,
        default: 0,
        required: 'Please fill intial cost',
        set: RemoveFormatting
    },
    value: {
        type: Number,
        default: 0,
        required: 'Current value of the asset',
        set: RemoveFormatting
    },
    pnl: {
        type: Number,
        default: 0,
        required: 'Please fill PNL'
    },
    quantity: {
        type: Number,
        default: 0,
        required: 'Please fill current value'
    },
    weight: {
        type: Number,
        default: 0,
        required: 'Please fill current value'
    },
	created: {
		type: Date,
		default: Date.now
    },
    pnlcalculationdt: {
        type: Date,
        default: Date.now
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
    }
});




mongoose.model('Portfolioasset', PortfolioassetSchema);