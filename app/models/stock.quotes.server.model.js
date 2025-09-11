'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Quote Schema
 */
var StockQuoteSchema = new Schema(
    {
        SravzId: {
            type: String,
            default: '',
            trim: true
        },
        ticker: {
            type: String,
            default: 0,
            trim: true
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        exchangename: {                                                                   
            type: String,
            default: '',
            trim: true
        },
        last: {
            type: Number,
            default: '',
            trim: true
        },
        dayhigh: {
            type: Number,
            default: '',
            trim: true
        },
        daylow: {
            type: Number,
            default: '',
            trim: true
        },
        previousclose: {
            type: Number,
            default: '',
            trim: true
        },
        percentchange: {
            type: String,
            default: '',
            trim: true
        },
        avgvolume: {
            type: Number,
            default: '',
            trim: true
        },
        datetime: {
            type: Date,
            default: '',
            trim: true
        }
    });

mongoose.model('quotes_stocks', StockQuoteSchema);