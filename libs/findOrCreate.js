'use strict';
//import sails waterline Deferred
var Deferred = require('waterline/lib/waterline/query/deferred'),
    _ = require('lodash'),
    Auditor = require('./auditor')

/**
 * @description path sails `findOrCreate()` method to allow
 *              custom error message definitions
 * @param  {Object} model          a valid sails model
 * @param  {Function} validateCustom a function to transform sails `ValidationError`
 *                                   to custome `Errors`
 */
module.exports = function(model,config) {
    //remember sails defined findOrCreate
    //method
    //See https://github.com/balderdashy/waterline/blob/master/lib/waterline/query/composite.js#L24
    var sailsFindOrCreate = model.findOrCreate;

    //prepare new findOrCreate method
    function findOrCreate(criteria, values, callback) {
        // return Deferred
        // if no callback passed
        // See https://github.com/balderdashy/waterline/blob/master/lib/waterline/query/composite.js#L43
        if (typeof callback !== 'function') {
            //this refer to the
            //model context
            return new Deferred(model, model.findOrCreate, criteria, values);
        }

        //otherwise
        //call sails findOrCreate
        
        sailsFindOrCreate
            .call(model, criteria, values, function(error, result) {
                //any findOrCreate error
                //found?
                if (error) {
                    callback(error);
                } else {
                    //no error
                    //return
                    if(!_.isUndefined(result)) {
                        result.auditor = new Auditor(model,config);
                        result.auditor.startAuditing(result);
                    }
                    //console.log(result.auditor);
                    callback(null, result);
                }
            });
        
        
    }

    //bind our new findOrCreate
    //to our models
    model.findOrCreate = findOrCreate;
};