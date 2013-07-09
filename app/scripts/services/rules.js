'use strict';

angular.module('bmlayersApp')
  .factory('Rules', function (layers) {
        var model;
        var unUsedTags = [];
        var elementsByTags = {};                    
        var elementsByTypes = {};
        
        var rules = {
            bmc_complete: new Rule({
                title: 'All blocks of the model are used.',
                fix: 'Check if the empty blocks really do not apply.',
                category: 'model_coherence',
                why: 'All blocks have interactions, covering all blocks strengthens the business model.',
                when: 'model has 9 or more elements',
                points: 10,
                trigger: function(){
                    return model.elements.reduce(function(sum, e){
                        if(e.bmo){
                            sum++;
                        }
                        return sum;
                    }, 0) >= 9;
                },
                rule: function(rule){
                    var types = angular.copy(layers.bmo.attributes[0].values);
                    var idx = -1;
                    model.elements.forEach(function(e){
                        if(e.bmo && e.bmo.type){
                            idx = types.indexOf(e.bmo.type);
                            if(idx >= 0) types.splice(idx, 1);
                        }
                    });
                    types.forEach(function(t){
                       rule.addError({name:t});
                    });
                }
            }),
            elements_keywords: new Rule({
                title: 'Elements are keywords',
                fix: 'Rewrite title as keywords',
                category: 'model_coherence',
                why: 'Model is more legible with keywords instead of sentences.',
                when: 'always',
                trigger: function(){return true;},
                rule: function(rule){
                    model.elements.forEach(function(e){
                        if(e.name.split(' ').length > 4){
                            rule.addError(e);
                            //TODO better??
                            e.errors.push(rule.fix);
                        }
                    });
                }
            }),
            bmc_customer_perspective_complete: new Rule({
                title: 'Customer Perspective parts are complete.',
                fix: 'Connect a customer segment with a value proposition and their channel and revenues by tagging them.',
                category: 'model_coherence',
                why: 'Elements have to be connected to be meaningful',
                when: '???',
                trigger: function(){return true;},//'layer.bmo.count > 3?',
                rule: function(rule){
                    model.elements.forEach(function(e){
         
                    });
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            bmc_tag_not_block: new Rule({
                title: 'Tags are used to connect blocks.',
                fix: 'Add tag {0} to elements in other blocks.',
                category: 'model_coherence',
                why: 'Elements have to be connected to be meaningful',
                when: 'always, for all tag layers',
                trigger: function(){return true;},
                rule: function(rule){
                    for(var tag in elementsByTags){
                        var types = [];
                        elementsByTags[tag].forEach(function(e){
                            if(e.bmo && e.bmo.type){
                                if(types.indexOf(e.bmo.type) < 0) types.push(e.bmo.type);
                            }
                        });
                        if(types.length === 1){
                           rule.addError({name:tag});
                            elementsByTags[tag].forEach(function(e){
                                if(e.bmo && e.bmo.type){
                                    //TODO better??
                                    e.errors.push(rule.fix.format(tag));
                                }
                            });
                        }
                    }
                }
            }),
            tag_used: new Rule({
                title: 'There are no unused tags',
                fix: 'Delete or use tag.',
                category: 'model_coherence',
                why: '???',
                when: 'always',
                trigger: function(){return true;},
                rule: function(rule){
                    unUsedTags.forEach(function(t){
                       rule.addError({name:t});
                    });
                }
            }),
            help_left_side: new Rule({
                title: 'Using activity perspective',
                fix: 'Check out this information....',
                category: 'help',
                why: 'Business Model show What we provide to Whom and How we make it.',
                when: 'always',
                trigger: function(){return true;},
                rule: function(rule){
                    if(elementsByTypes.pn.length + elementsByTypes.ka.length + elementsByTypes.kr.length === 0){
                        rule.addError({name: 'No Activity Perspective!'});
                    }
                }
            }),
            test_state: new Rule({
                title: 'Element has a test state',
                fix: 'Add test state to element',
                category: 'testing',
                why: 'Move beyond guesses',
                when: 'test layer is active',
                trigger: function(){return layers.test.visible;},//'layer.bmo.count > 3?',
                rule: function(rule){
                    model.elements.forEach(function(e){
                         if(!(e.test && e.test.state)){
                             rule.addError(e);
                            //TODO better??
                             e.errors.push(rule.fix);
                         }
                    });
                }                
        })};

    // Public API here
    return {
      checkAll: function(m){
          var points = 0;
          model = m;
          //reset errors on elements
          model.elements.forEach(function(e){
              e.errors = [];
          });        
          
          if(layers.errors.visible){
              //precalculate data structure which can be used by rules
              unUsedTags = layers.tags.tags.reduce(function(l, t){l.push(t.name);return l;}, []);
              elementsByTags = {};
              elementsByTypes = {};
              layers.bmo.attributes[0].values.forEach(function(type){
                  elementsByTypes[type] = [];
              });
              
              model.elements.forEach(function(e){
                  if(e.tags){
                      e.tags.forEach(function(t){
                          var idx = unUsedTags.indexOf(t);
                          if(idx >= 0) unUsedTags.splice(idx, 1);
                          
                          var es = [];
                          if(elementsByTags.hasOwnProperty(t)){
                              es = elementsByTags[t];
                          }
                          es.push(e);
                          elementsByTags[t] = es;
                      });
                  }
                  
                  if(e.bmo && e.bmo.type){
                      var es = [];
                      if(elementsByTypes.hasOwnProperty(e.bmo.type)){
                          es = elementsByTypes[e.bmo.type];
                      }
                      es.push(e);
                      elementsByTypes[e.bmo.type] = es;
                  }
                  
              });

               
              //process rules
              this.rules().forEach(function(rule){
                  rule.check(); 
              });
          }
      },
      rules: function(){
          var rs = [];
          for(var key in rules){
              rs.push(rules[key])
          }
          return rs;
      }
    };
  });


function RuleFail(rule, obj){
    this.rule = rule;
    this.obj = obj;
     //Types?
}

function Rule(obj){
    this.title = 'norule';
    this.category = '';
    this.fix = '';
    this.why = '';
    this.when = '';
    this.points = 0;
    
    obj = obj || {};
    angular.extend(this, obj)
    
    this.valid = false;
    this.errors = [];
    this.active = false;
};
Rule.prototype.check = function(){
    this.active = this.trigger();
    this.valid = false;
    if(this.active){
        this.errors = [];
        this.rule(this);
        this.valid =  this.errors.length == 0;
    }
};
Rule.prototype.trigger = function trigger(){
    this.active = false;
};
Rule.prototype.rule = function rule(){
    return false;
};
Rule.prototype.addError = function addError(obj){
    this.errors.push(new RuleFail(this, obj));
};

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}