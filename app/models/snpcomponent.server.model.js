'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * SNPComponent Schema
 */
var snpcomponentSchema = new Schema({
    datefirstadded: {
        type: Date,
        required: 'Please fill event date'
    },
	tickersymbol: {
		type: String,
		default: '',
		trim: true
    },
	security: {
		type: String,
		default: '',
		trim: true
    },    
	secfilings: {
		type: String,
		default: '',
		trim: true
    },    
	gicssector: {
		type: String,
		default: '',
		trim: true
    },      
    gicssubindustry: {
        type: String,
        default: '',
        trim: true
    },
    location: {
        type: String,
        default: '',
        trim: true
    },
    datefirstadded: {
        type: String,
        default: '',
        trim: true
    },
    cik: {
        type: String,
        default: '',
        trim: true
    },
    founded: {
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
    
{ collection: 'snp_components' });

mongoose.model('snpcomponent', snpcomponentSchema);