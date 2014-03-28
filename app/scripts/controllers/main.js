'use strict';
/*jshint camelcase: false */

//property layer list unique vs multi select?
var l_bmo = {
  type: ['cs','vp', 'dc']
};

var l_test = {
  test: ['todo', 'fail', 'pass']
};

//property layer any
var l_note = {
  note: '' //regex?, type validation?
};

//property layer multiple values?

//linked layers?


// any additional variable? calc layer => calc variable with objects
// but if want to do calc on values of other namespaces?

//grouping layer
var l_g1 = {

};

var colors = ['#34b27d','#F1F157', '#e09952', '#cb4d4d', '#9933cc', '#4d77cb'];

var bmc = {
  width: 100,
  height: 100
};

angular.module('bmlayersApp')
  .controller('MainCtrl', function ($scope, $timeout, Rules, layers, filterFilter, localStorageService) {
  
  $scope.z = {type:'bmo.type', value:'cs'};
  $scope.layers = layers;
  $scope.filterType = function(type, value){
    return function(e){
      /*
      var typenoequal = type.replace("==","").replace("!=","");
      if(typenoequal.indexOf('=') >= 0) return false;
      */
      if(type === '' && value === ''){
        return true;
      }
      try{
        return eval('e.' + type) === value;
      }
      catch(ex){
        return false;
      }
    };
  };
  
  $scope.formatErrors = function(es){
    return es.reduce(function(s, e){ return s + '\n - ' + e;}, '');
  };
    
  $scope.activeLayerAttributes = function(e){
    var attributes = [];
    for(var id in $scope.layers){
      var l = $scope.layers[id];
      if(l.visible && l.attributes){
        for(var j=0; j < l.attributes.length; j++){
          var a = l.attributes[j];
          if(!a.filter || eval('e.' + a.filter)){
            if(!e.hasOwnProperty(l.id)){
              e[l.id] = {};
            }
            a.layerId = l.id;
            attributes.push(a);
          }
        }
      }
    }
    return attributes;
  };
    
  $scope.toggleTag = function(e, tag){
    var idx = e.tags.indexOf(tag.id);
    if(idx >=0){
      e.tags.splice(idx, 1);
    }else{
      e.tags.push(tag.id);
    }
  };
    
  $scope.removeElement = function(e){
    var idx = $scope.model.elements.indexOf(e);
    if(idx >=0){
      $scope.model.elements.splice(idx, 1);
    }
  };
    

  $scope.tags = function(){
    return $scope.layers.tags.tags;
  };
  
  $scope.views = {
    v_bmo: {
      zones:{
        
      }
    }
  };

  $scope.model = {
    zones:{
      'partner_network':{
        width: bmc.width/5,
        height: bmc.height/4*3,
        top:0,
        left:0,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'pn'
      },
      'key_activities':{
        width: bmc.width/5,
        height: bmc.height/8*3,
        top:0,
        left: bmc.width/5,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'ka'
      },
      'key_resources':{
        width: bmc.width/5,
        height: bmc.height/8*3,
        top:bmc.height/8*3,
        left: bmc.width/5,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'kr'
      },
      'cost_structure':{
        width: bmc.width/2,
        height: bmc.height/4,
        top:bmc.height/8*6,
        left:0,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'c'
      },
      'value_proposition':{
        width: bmc.width/5,
        height: bmc.height/8*6,
        top:0,
        left:bmc.width/5*2,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'vp'
      },
      'customer_segments':{
        width: bmc.width/5,
        height: bmc.height/8*6,
        top:0,
        left:bmc.width/5*4,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'cs'
      },
      'customer_relationship':{
        width: bmc.width/5,
        height: bmc.height/8*3,
        top:0,
        left:bmc.width/5*3,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'cr'
      },
      'channels':{
        width: bmc.width/5,
        height: bmc.height/8*3,
        top:bmc.height/8*3,
        left:bmc.width/5*3,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'dc'
      },
      'revenue_streams':{
        width: bmc.width/2,
        height: bmc.height/8*2,
        top:bmc.height/8*6,
        left:bmc.width/2,
        canvas: 'bmc',
        type: 'bmo.type',
        value: 'r'
      }
    },
    elements: [
      {
        name:'test sd asdf asdf asd f',
        bmo: {
          type: 'cs'
        },
        color:{
          color: 'orange'
        },
        l_g1: true,
        tags: [
          'c0'
        ],
        test: {
          state: 'testing',
          critical: true
        },
        notes: {
          note: 'Hello todo...'
        },
        v_bmo:{
          x:0,
          y:0
        },
        x:0,
        y:0
      },
      {
        name:'test2',
        x:0,
        y:0,
        bmo: {
          type: 'vp'
        },
        tags:[]
      },
      {
        name: 'channel1',
        bmo:{
          type: 'dc'
        },
        tags:['c5']
      },
      {
        name: 'ch2',
        bmo:{
          type: 'dc'
        },
        tags:['c5']
      },
      {
        name: 'r1',
        bmo:{
          type: 'r'
        },
        tags:['c0']
      },
      {
        name: 'no time to buy',
        vpc: {
          type: 'pain',
          parent: 'id of a bmo.type=cs' //TODO reference?
        }
      }
    ]
  };
  /*  
  var elements = localStorageService.get('elements');
  if(elements !== null){
    $scope.model.elements = elements;
  }
  */
  //demo
  $scope.model.elements = [{"name":"Immersive FPS gaming","color":{"color":"yellow"},"bmo":{"type":"vp"},"tags":["c1"],"zone":"value_proposition","x":51.24528301886792,"y":64.28204835766424,"id":"134751b6-a070-4ccc-b243-39562340f3fe","errors":["Check if all the Value Proposition are value proposition or features of a borader vp."]},{"name":"+ Free game +","color":{"color":"yellow"},"bmo":{"type":"vp"},"tags":["c1"],"zone":"value_proposition","x":164.9308176100629,"y":78.83211678832116,"id":"49cbad6e-2caa-6542-0d64-b5990f4324f6","errors":["Check if all the Value Proposition are value proposition or features of a borader vp."]},{"name":"Videogame Retailer","color":{"color":"yellow"},"bmo":{"type":"dc"},"tags":["c1"],"zone":"channels","x":142.95268138801262,"y":41.369107360097324,"id":"79a8ca5b-c94b-4363-b93f-5c4978533f62","errors":[]},{"name":"Game Universe","color":{"color":"yellow"},"bmo":{"type":"kr"},"tags":["c1"],"zone":"key_resources","x":8.025157232704403,"y":43.444609184914846,"id":"be7e57b4-7972-4914-9407-ab746b99484e","errors":[]},{"name":"STEAM","color":{"color":"yellow"},"bmo":{"type":"dc"},"tags":["c1"],"zone":"channels","x":20.03252032520325,"y":44.25435932601881,"id":"c4d1d756-e7e8-4b7c-993f-1c1e32fd3087","errors":[]},{"name":"Developers","color":{"color":"yellow"},"bmo":{"type":"kr"},"tags":["c1"],"zone":"key_resources","x":148.11320754716982,"y":44.67453619221411,"id":"74e353d9-7b78-4eab-90f6-8a6ed23058e9","errors":[]},{"name":"Gamer","color":{"color":"yellow"},"bmo":{"type":"cs"},"tags":["c1"],"zone":"customer_segments","x":72.39370078740157,"y":104.70402190332327,"id":"8aa499cb-ca81-4c1f-8294-f495a0c03992","errors":["Add a size to the customer segment."]},{"name":"automatic-patches","color":{"color":"orange"},"bmo":{"type":"cr"},"tags":["c2"],"zone":"customer_relationship","x":128.0625,"y":64.5396997734139,"id":"0af01f5f-398d-46be-925c-5448fb8d601d","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"Strong story","color":{"color":"yellow"},"bmo":{"type":"vp"},"tags":["c1"],"zone":"value_proposition","x":103.88679245283019,"y":152.03153512773721,"id":"9f613311-af32-46f8-a706-dddbe2230869","errors":["Check if all the Value Proposition are value proposition or features of a borader vp."]},{"name":"Graphicscard Manufacturer","color":{"color":"yellow"},"bmo":{"type":"pn"},"tags":["c1"],"zone":"partner_network","x":72.77157360406092,"y":192.43384700392926,"id":"a22c55d3-ccd1-4e12-a9cc-c5e5dee2e35e","errors":[]},{"name":"+ free 2 play +","color":{"color":"purple"},"bmo":{"type":"r"},"tags":["c4"],"zone":"revenue_streams","x":263.6525974025974,"y":65.22321428571429,"id":"cea4f294-04a1-6ebb-4bc6-de4f5c8e6620","errors":[]},{"name":"Sale of game Box","color":{"color":"yellow"},"bmo":{"type":"r"},"tags":["c1"],"zone":"revenue_streams","x":415.87662337662334,"y":65.49107142857143,"id":"b8669449-cca8-4cdd-8082-a6d2bd0818e1","errors":[]},{"name":"Developers","color":{"color":"yellow"},"bmo":{"type":"c"},"tags":["c1"],"zone":"cost_structure","x":158.11359026369166,"y":65.54129464285714,"id":"373957ef-1f24-4b87-9b2b-8a33a0857d0f","errors":[]},{"name":"platform hosting","color":{"color":"yellow"},"bmo":{"type":"c"},"tags":["c1"],"zone":"cost_structure","x":317.9874213836478,"y":67.00367647058823,"id":"e866c9ac-5797-603a-0954-f41f25d31259","errors":[]},{"name":"+ commission on ingame purchases +","color":{"color":"purple"},"bmo":{"type":"r"},"tags":["c4"],"zone":"revenue_streams","x":136.85138539042822,"y":67.17170266544117,"id":"eb45cf62-0e35-6164-6503-4851d1e0b2ab","errors":["Rewrite title as keyword"]},{"name":"Game development","color":{"color":"yellow"},"bmo":{"type":"ka"},"tags":["c1"],"zone":"key_activities","x":51.97969543147208,"y":101.65753676470588,"id":"eddf1097-fa20-4208-85b2-2168ea5d1c1e","errors":[]},{"name":"Multiplayer Gamer","color":{"color":"orange"},"bmo":{"type":"cs"},"tags":["c2"],"zone":"customer_segments","x":87.68503937007874,"y":224.3202416918429,"id":"e4d4c75b-3458-4f40-90c5-7e3e1f721078","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with .","Add a size to the customer segment."]},{"name":"Serevrs bandwidth","color":{"color":"yellow"},"bmo":{"type":"c"},"tags":["c1"],"zone":"cost_structure","x":499.1194968553459,"y":76.93014705882354,"id":"65e55520-fd89-621e-e39f-e1f09fbdda7a","errors":[]},{"name":"STEAM distribution platform","color":{"color":"yellow"},"bmo":{"type":"vp"},"tags":["c1"],"zone":"value_proposition","x":111.86163522012579,"y":243.88686131386862,"id":"29896dd6-140e-4f97-a558-be46aaee060b","errors":["Check if all the Value Proposition are value proposition or features of a borader vp."]},{"name":"servers","color":{"color":"orange"},"bmo":{"type":"dc"},"tags":["c2"],"zone":"channels","x":33.1608832807571,"y":142.09500456204378,"id":"368b5a93-43b1-4dc6-bd8e-9cc34c1b37d0","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"distributed automated patching","color":{"color":"yellow"},"bmo":{"type":"kr"},"tags":["c1"],"zone":"key_resources","x":148.0503144654088,"y":142.6715328467153,"id":"1776f7b2-25bd-46e6-b2eb-af6b0bd51283","errors":[]},{"name":"Popular mods","color":{"color":"orange"},"bmo":{"type":"kr"},"tags":["c2"],"zone":"key_resources","x":16.89430894308943,"y":145.95190047021944,"id":"15e54a31-7d29-46e4-bad6-1d4a3c5a331f","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"Multiplayer","color":{"color":"orange"},"bmo":{"type":"vp"},"tags":["c2"],"zone":"value_proposition","x":43.65625,"y":331.9875849697885,"id":"464d10ab-4e95-4915-afc9-7df1a3ecffe0","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"Engine liscensing","color":{"color":"red"},"bmo":{"type":"r"},"tags":["c3"],"zone":"revenue_streams","x":9.659949622166247,"y":126.5625,"id":"6a2c5fed-1b46-65fb-8da3-8994b0e2129f","errors":["Add tag to elements in other blocks."]},{"name":"cheat detection","color":{"color":"orange"},"bmo":{"type":"cr"},"tags":["c2"],"zone":"customer_relationship","x":22,"y":196.4984894259819,"id":"a1b8259f-ebfb-48ff-b805-5087cdeba14f","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"upgraded tools","color":{"color":"blue"},"bmo":{"type":"cr"},"tags":["c5"],"zone":"customer_relationship","x":133.34375,"y":201.2868674471299,"id":"c5128f29-c588-4136-a67a-d3dad8d18920","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"?server operators","color":{"color":"orange"},"bmo":{"type":"pn"},"tags":["c2"],"zone":"partner_network","x":76,"y":427.32368768882174,"id":"1b413194-20da-4b4c-89f1-918b15e0ed3f","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"maps, mods","color":{"color":"orange"},"bmo":{"type":"vp"},"tags":["c2"],"zone":"value_proposition","x":78,"y":431.3385101963746,"id":"4282e46d-0c34-413c-a7ee-bd731f8d9e5d","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"anti-cheat","color":{"color":"orange"},"bmo":{"type":"ka"},"tags":["c2"],"zone":"key_activities","x":143.2520325203252,"y":220.8261167711599,"id":"f8a5836f-835c-425b-a88f-e7d5fde3373b","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"* Indie developer *","color":{"color":"purple"},"bmo":{"type":"cs"},"tags":["c4"],"zone":"customer_segments","x":89.11811023622047,"y":449.4689388217523,"id":"7ef68f78-9c49-4b05-af26-e98bd6c383d3","errors":["Add a size to the customer segment."]},{"name":"SDK","color":{"color":"blue"},"bmo":{"type":"dc"},"tags":["c5"],"zone":"channels","x":126.61198738170347,"y":228.52300030413627,"id":"be50c46b-9d6e-48d6-8edd-e883c2aacb42","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"+ Steam workshop +","color":{"color":"purple"},"bmo":{"type":"dc"},"tags":["c4"],"zone":"channels","x":13.473684210526315,"y":238.7523510971787,"id":"95cd75dc-2b0e-632d-06c4-cdec98a13b9a","errors":[]},{"name":"* Sales Knowledge *","color":{"color":"purple"},"bmo":{"type":"kr"},"tags":["c4"],"zone":"key_resources","x":20.764227642276424,"y":241.82259012539186,"id":"b1a05645-dcb2-6138-0a8e-c602371bad76","errors":[]},{"name":"Multiplatform Game Engine","color":{"color":"yellow"},"bmo":{"type":"kr"},"tags":["c1"],"zone":"key_resources","x":151.5772357723577,"y":243.42373628526644,"id":"4ee62c37-0081-4440-8a60-0e85c7111b16","errors":[]},{"name":"Extend the game","color":{"color":"blue"},"bmo":{"type":"vp"},"tags":["c5"],"zone":"value_proposition","x":133.58704453441297,"y":512.5318377742947,"id":"2a80f524-27e6-42a3-a252-1781ccc35b55","errors":["Connect a customer segment with a value proposition and their channel and revenues by tagging them with ."]},{"name":"+ Create ingame items +","color":{"color":"purple"},"bmo":{"type":"vp"},"tags":["c4"],"zone":"value_proposition","x":42.33198380566802,"y":562.4228546238244,"id":"6ce574d2-4e1a-60e9-e786-2880fb8ccebe","errors":[]}];
  
  $scope.$watch('model.elements', function(){
    localStorageService.add('elements', $scope.model.elements);
  }, true);
    
  $scope.zoom = function(z, elements){
    if(!z.zoomed && ((z.value !== 'cs' && z.value !== 'pn' && z.value !== 'vp' && elements.length > 4) || elements.length > 7)){
      if(z.top > 74){
        z.height = z.height * 2;
        z.top = z.top - 25;
      }else{
        z.width = z.width * 2;
        z.left = z.left -10;
      }
      z.zoomed = true;
    }
  };
  $scope.dezoom = function(z){
    if(z.zoomed){
      if(z.top > 49){
        z.height = z.height / 2;
        z.top = z.top + 25;
      }else{
        z.width = z.width / 2;
        z.left = z.left + 10;
      }
      z.zoomed = false;
    }
  };
  
  $scope.importJson = function(){
    try{
      $scope.model.elements = JSON.parse($scope.importJsonSrc);
    }catch(e){
      console.log(e);
    }
  };
    
  $scope.displayRuleCategory = function(cat, first){
    var display = cat !== $scope.currentRuleCategory;
    if(first){ display = true;}
    
    $scope.currentRuleCategory = cat;
    return display;
  };
    
  $scope.addElementToZone = function(zone){
    //TODO view
    var e = {
      name: 'New...',
      tags:[]
    };
    addProperty(e, zone.type, zone.value);
    $scope.model.elements.push(e);
  };
  
  $scope.addCurve = function (){
    $scope.model.curves.push({points: [{x: 10, y: 250}, {x: 0, y: 0}, {x: 200, y: 250}, {x: 250, y: 250}]});
  };
    
  $scope.elementStyle = function (element){
    return layers.elementStyle(element, layers.tags.tags);
  };
    
  function addProperty(obj, properties, value){
    properties = properties.split('.');
    var property = properties.shift();
    obj[property] = {};
    if(properties.length === 0){
      obj[property] = value;
    }else{
      addProperty(obj[property], properties.join('.'), value);
    }
  }
  
  $scope.$watch('model', function(){Rules.checkAll($scope.model);}, true);
  $scope.$watch('layers', function(){Rules.checkAll($scope.model);}, true);
  
  $scope.errorFilter = 'ok';
  $scope.errorFilterStates = {
    'actif': {active:'true'},
    'ok': {active:'true', valid: 'true'},
    'nok': {active:'true', valid: 'false'},
    'inactif': {active:'false'}
  };
  $scope.Rules = Rules;
  $scope.rules = Rules.rules();

});
