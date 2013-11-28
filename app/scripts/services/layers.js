'use strict';
/*jshint camelcase: false */
/* global colors, hexToRgba*/
//TODO: colors should be injected
angular.module('bmlayersApp')
.factory('layers', function () {
  // Public API here
  return {color: {
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
  tags: {
    id: 'tags',
    type: 'tag',
    visible: true,
    tags:[
      {
        id: 'c0',
        name: '',
        color: colors[0]
      },
      {
        id: 'c1',
        name: '',
        color: colors[1]
      },
      {
        id: 'c2',
        name: '',
        color: colors[2]
      },
      {
        id: 'c3',
        name: '',
        color: colors[3]
      },
      {
        id: 'c4',
        name: '',
        color: colors[4]
      },
      {
        id: 'c5',
        name: '',
        color: colors[5]
      }
    ]
  },
  bmo: {
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
  bmo_detail: {
    id:'bmo_detail',
    type: 'values for specific component',
    attributes: [
      {
        name: 'type_detail',
        isUnique: true,
        values : ['replication', 'innovation'],
        filter: 'bmo.type==\'vp\''
      },
      {
        name: 'size',
        isUnique: true,
        values : 'number',
        filter: 'bmo.type==\'cs\''
      }
    ]
  },
  test: {
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
  notes: {
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
  change: {
    id:'change',
    type: '???',
    attributes: [
      {
        name: 'type',
        isUnique: true,
        values : ['add', 'remove', 'lower', 'raise', 'widen', 'focus'],
      }
    ]
  }, errors: {
    id:'errors',
    type: '???',
    visible: true
  },
  elementStyle: function(element, tags){
    function tagById(id){
      var tag;
      for(var i=0; i < tags.length; i++){
        tag = tags[i];
        if(tag.id === id){
          return tag;
        }
      }
    }
    var styles = 'background-image:',
    increment = element.tags.length -1 > 0 ? 100 / (element.tags.length -1) : 0;
    if(element.image){
      styles+='url(' + element.image + ')';
    }
    if(element.tags.length > 0){
      if(element.image){
        styles+=',';
      }
      styles += 'linear-gradient(135deg'
      element.tags.forEach(function(id, index){
        var offset = index * increment;
        styles +=',' + hexToRgba(tagById(id).color, 0.8) + ' ' + offset + '%';
      });
      if(element.tags.length === 1){
        styles += ',' + hexToRgba(tagById(element.tags[0]).color, 0.8) + ' 100%';
      }
      styles +=');';
    }
    return styles;
  }
    //scale?
    //n attributes of defines names
    //n attributes unknown name?
    
    //rule help max n words value.match(/\w+/g).length;
  };
});