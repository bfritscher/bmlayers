'use strict';

angular.module('bmlayersApp')
  .factory('layers', function () {

    // Public API here
    return {color: 
		{
			id: 'color',
			type: 'one_value_from_list',
			attributes: [
				{
					name: 'color',
					isUnique: true,
					values : ['red', 'blue']
				}
			]
			
		},
        tags:
        {
			id: 'tags',
			type: 'tag',
            tags:[
                {
                    name: 's3',
                    color: colors[0]
                },
                {
                    name: 'normal',
                    color: colors[1]
                },
                {
                    name: 'dummy',
                    color: colors[5]
                }
            ]	
		},
        bmo:
		{
			id:'bmo',
			type:'one_value_from_list',
			attributes: [
				{
					name: 'type',
					isUnique: true,
					values : ['cs', 'vp', 'dc', 'cr', 'r', 'c','pn','kr', 'ka']
				}
			]
		},
        bmo_detail:
		{
			id:'bmo_detail',
			type: 'values for specific component',
			attributes: [
				{
					name: 'type_detail',
					isUnique: true,
					values : ['replication', 'innovation'],
					filter: "bmo.type=='vp'"
				},
                {
					name: 'size',
					isUnique: true,
					values : 'number',
					filter: "bmo.type=='cs'"
				}
			]
		},
        test:
		{
			id:'test',
			type:'one_value_from_list',
			attributes: [
				{
					name: 'state',
					isUnique: true,
					values : ['testing', 'pass', 'fail'],
				},
				{
					name: 'critical',
					isUnique: true,
					values: [false, true]			
				}
			]
		},
        notes:
		{
			id: 'notes',
			type:'one_value_openformat',
			attributes: [
				{
					name: 'note',
					isUnique: true,
					values : '',
				}
			]
		},
        change:
		{
			id:'change',
			type: '???',
			attributes: [
				{
					name: 'type',
					isUnique: true,
					values : ['add', 'remove', 'lower', 'raise', 'widen', 'focus'],
				}
			]
		},
        errors:
        {
            id:'errors',
            type: '???',
            visible: true
        }
		//scale?
		//n attributes of defines names
		//n attributes unknown name?
		
		//rule help max n words value.match(/\w+/g).length;
	};
  });
