'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Quote Schema
 */
var QuoteSchema = new Schema(
    {
        SravzId: {
            type: String,
            default: '',
            trim: true
        },
        chg: {
            type: Number,
            default: 0,
            trim: true
        },
        Chg_Pct: {
            type: String,
            default: '',
            trim: true
        },
        Commodity: {
            type: String,
            default: '',
            trim: true
        },
        High: {
            type: String,
            default: '',
            trim: true
        },
        Last: {
            type: String,
            default: '',
            trim: true
        },
        Low: {
            type: String,
            default: '',
            trim: true
        },
        Month: {
            type: String,
            default: '',
            trim: true
        },
        Time: {
            type: String,
            default: '',
            trim: true
        },
        Country: {
            type: String,
            default: '',
            trim: true
        }    
});

mongoose.model('quotes_commodities', QuoteSchema);