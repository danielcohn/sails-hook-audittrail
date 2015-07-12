'use strict'
var _ = require('../node_modules/lodash'),
	Waterline = require('sails/node_modules/waterline'),
	mysql = require('../node_modules/sails-mysql')

module.exports = function(config) {
	var table = "audittrail"
	if(config.hasOwnProperty('tableName'))
		table = config.tableName

	var waterline = new Waterline();
	

	var includeModule = config.connection.adapter || config.connection.module

	var dbModule = require('../node_modules/'+includeModule)

	var newConfig = {
		adapters: {

		},
		connections: {
			auditorAdapterConnection: config.connection
		}
	}
	
	newConfig['adapters'][includeModule] = dbModule
	
	var auditModel = Waterline.Collection.extend({
		identity: 'audittrail',
	  // Define a custom table name
	  tableName: table,

	  // Set schema true/false for adapters that support schemaless
	  schema: true,

	  // Define an adapter to use
	  connection: 'auditorAdapterConnection',

	  // Define attributes for this collection
	  attributes: {
	  	columnName: {
	  		type: 'string'
	  	},
	  	oldValue: {
	  		type: 'string'
	  	},


	  	newValue: {
	  		type: 'string'
	  	},
	  	modelID:{
	  		type: 'string'
	  	},

	  	timestamp: {
	  		type: 'string'
	  	},
	  	foreignKey:{
	  		type: 'string'

	  	},
	  	operation: {
	  		type: 'string'
	  	}
	  }
	});
	waterline.loadCollection(auditModel);
	var init = function(cb) {
		waterline.initialize(newConfig, function (err, ontology) {
			if (err != null) {
				cb(err)
			}
			var Audit = ontology.collections.audittrail;
			config.model = Audit
			cb(null,Audit)
		});
	}
	return {
		init:init
	}
}