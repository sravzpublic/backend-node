'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Asset Schema
 */
var AssetSchema = new Schema({
    SravzId: {
        type: String,
        default: '',
        required: 'Sravz ID to uniquely identify the asset in the system',
        trim: true
    },
    Name: {
		type: String,
		default: '',
		required: 'Please fill Asset name',
		trim: true
    },
    Country: {
        type: String,
        default: '',
        trim: true
    },
    Month: {
        type: String,
        default: '',
        trim: true
    },
    Type: {
        type: String,
        default: '',
        trim: true
    },
    Exchange: {
        type: String,
        default: 'CME',
        required: 'Please fill Asset exchange where this symbol is traded',
        trim: true
    },
    Currency: {
        type: String,
        default: '',
        required: 'Please fill Asset exchange traded currency',
        trim: true
    },
	Created: {
		type: Date,
		default: Date.now
	},
	User: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Asset', AssetSchema);