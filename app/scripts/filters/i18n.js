'use strict';

angular.module('bmlayersApp')
.filter('i18n', ['currentLocale', function (locale) {
  return function (key, parameters) {
    if(typeof locale[key] !== 'undefined'){
      return angular.isArray(parameters) ? locale[key].format.apply(locale[key], parameters) : locale[key];
    }
    return  key;
  };
}])
.value('currentLocale', {
  'partner_network': 'Key Partners',
  'key_activities': 'Key Activities',
  'key_resources': 'Key Resources',
  'cost_structure': 'Cost Structure',
  'value_proposition': 'Value Proposition',
  'customer_segments': 'Customer Segments',
  'customer_relationship': 'Customer Relationships',
  'channels': 'Channels',
  'revenue_streams': 'Revenue Streams',
  'model_coherence': 'Model Coherence',
  'help': 'Help hints',
  'numbers': 'Numbers',
  'trigger': 'Trigger questions',
  'testing': 'Customer Development',
  'training': 'Training',
  'pattern': 'Pattern'
});
