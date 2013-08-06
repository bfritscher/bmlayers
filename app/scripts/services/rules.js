'use strict';

angular.module('bmlayersApp')
  .factory('Rules', function (layers) {
        var model;
        var unUsedTags = [];
        var elementsByTags = {};                    
        var elementsByTypes = {};
        var elementsWithoutTags = [];
        
        var rules = {
            bmc_complete: new Rule({
                title: 'All blocks of the model are used.',
                fix: 'Check if the empty blocks really do not apply.',
                category: 'model_coherence',
                why: 'All blocks have interactions, covering all blocks strengthens the business model.',
                when: 'model has 9 or more elements',
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
                    var points = types.length;
                    var idx = -1;
                    model.elements.forEach(function(e){
                        if(e.bmo && e.bmo.type){
                            idx = types.indexOf(e.bmo.type);
                            if(idx >= 0) types.splice(idx, 1);
                        }
                    });
                    types.forEach(function(t){
                       rule.addError({name:t});
                       points--;
                    });
                    this.points = points;
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
                    rule.points = Math.floor( (model.elements.length - rule.errors.length) / model.elements.length * 10);
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
            bmc_split_multisided: new Rule({
                title: 'Customer Segements are split into sides',
                fix: 'Connect each value proposition wither their customer segment by tagging them into groups.',
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
            //TODO: rule if there are no tags? and more than n in same type?
            bmc_vp_detail_level: new Rule({
                title: 'Value Proposition detail level',
                fix: 'Check if all the Value Proposition are value proposition or features of a borader vp.',
                category: 'model_coherence',
                why: 'Value proposition should be more than a list of product features',
                when: 'more than 3 value propositions and at least one customer segment',
                trigger: function(){
                    return elementsByTypes['vp'].length > 3 && elementsByTypes['cs'].length > 0;
                },
                rule: function(rule){
                    function checkList(list){
                        var vp = [];
                        list.forEach(function(e){
                            if(e.bmo && e.bmo.type === 'vp'){
                                vp.push(e);
                            }
                        });
                        if(vp.length > 3){
                            vp.forEach(function(e){
                                rule.addError(e);
                                e.errors.push(rule.fix);
                            });
                        }
                    }
                    for(var tagId in elementsByTags){
                        checkList(elementsByTags[tagId]);
                    }
                    checkList(elementsWithoutTags);
                }
            }),
            bmc_vp_produced: new Rule({
                title: 'Value Proposition is produced',
                fix: 'Connect activity, resource or partner which are required to produce this vp',
                category: 'model_coherence',
                why: 'VP has to be generated',
                when: 'when vp >0',
                trigger: function(){
                    return elementsByTypes['vp'].length > 0;
                },
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
                    for(var tagId in elementsByTags){
                        var types = [];
                        elementsByTags[tagId].forEach(function(e){
                            if(e.bmo && e.bmo.type){
                                if(types.indexOf(e.bmo.type) < 0) types.push(e.bmo.type);
                            }
                        });
                        if(types.length === 1){
                           var tag = layers.tags.tags[tagId.substr(1)];
                           rule.addError({name:tag.name});
                            elementsByTags[tagId].forEach(function(e){
                                if(e.bmo && e.bmo.type){
                                    //TODO better??
                                    e.errors.push(rule.fix.format(tag.name));
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
                why: 'Forgot to use a defined tag',
                when: 'always',
                trigger: function(){return true;},
                rule: function(rule){
                    unUsedTags.forEach(function(tagId){
                        var tag = layers.tags.tags[tagId.substr(1)];
                        if(tag.name != ''){
                            rule.addError({name: tag.name});
                        }
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
                    if(!(elementsByTypes.ka.length > 0 && elementsByTypes.kr.length > 0 && elementsByTypes.vp.length > 0)){
                        rule.addError({name: 'No Activity Perspective!'});
                    }
                }
            }),
            help_right_side: new Rule({
                title: 'Using client perspective',
                fix: 'Check out this information....',
                category: 'help',
                why: 'Business Model show What we provide to Whom and How we make it.',
                when: 'always',
                trigger: function(){return true;},
                rule: function(rule){
                    if(!(elementsByTypes.cs.length > 0 && elementsByTypes.dc.length > 0 && elementsByTypes.vp.length > 0)){
                        rule.addError({name: 'No Client Perspective!'});
                    }
                }
            }),
            help_financial_side: new Rule({
                title: 'Using financial perspective',
                fix: 'Add cost strucutre and revenue streams',
                category: 'help',
                why: 'Business Model show What we provide to Whom and How we make it and How much.',
                when: 'model has activity and client perspectives',
                trigger: function(){return rules.help_left_side.check() && rules.help_right_side.check();},
                rule: function(rule){
                    if(!(elementsByTypes.r.length > 0 && elementsByTypes.c.length > 0)){
                        rule.addError({name: 'No Financial!'});
                    }
                }
            }),
            /*
            help_split_cs: new Rule({
                title: 'CS only 1?',
                fix: 'split?',
                category: 'help',
                why: '',
                when: '',
                trigger: function(){return true;},
                rule: function(rule){
                     rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            */
            add_detail_cs: new Rule({
                title: 'Customer segment has a size.',
                fix: 'Add a size to the customer segment.',
                category: 'numbers',
                why: 'Being able to calculated revenue',
                when: '??? detail, calculation mode?',
                trigger: function(){return true;},
                rule: function(rule){
                    elementsByTypes['cs'].forEach(function(e){
                        if(!(e.bmo_detail && e.bmo_detail.size)){
                            rule.addError(e);
                            //TODO better??
                            e.errors.push(rule.fix);
                        }
                    });
                }
            }),
            add_detail_revenue: new Rule({
                title: 'revenue % or total',
                fix: 'calc?',
                category: 'numbers',
                why: '',
                when: '',
                trigger: function(){return true;},
                rule: function(rule){
                     rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            add_detail_cost: new Rule({
                title: 'fix, variable, ... per item?',
                fix: 'calc?',
                category: 'numbers',
                why: '',
                when: '',
                trigger: function(){return true;},
                rule: function(rule){
                     rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            trigger_recurring_revenue: new Rule({
                title: 'Recurring revenue by providing a service',
                fix: 'Can a product be transformed into a service?',
                category: 'trigger',
                why: 'more regular financial flow',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //All(vp.type = product) && All(revenue.type!=recurring)
                     rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            trigger_switching_cost: new Rule({
                title: 'Switching cost',
                fix: 'Can switching cost be added?',
                category: 'trigger',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Any(Cr has properity lock-in or switching cost)
                     rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            trigger_cost_structure: new Rule({
                title: 'Cost strucutre more variable than fixed',
                fix: '',
                category: 'trigger',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //???
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            trigger_more_partners: new Rule({
                title: 'Getting others to do the work',
                fix: '',
                category: 'trigger',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            pattern_unbundling: new Rule({
                title: 'Unbundling',
                fix: '',
                category: 'pattern',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            pattern_multisided: new Rule({
                title: 'Multi-sided',
                fix: '',
                category: 'pattern',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            pattern_freemium: new Rule({
                title: 'Freemium',
                fix: '',
                category: 'pattern',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            pattern_bait_hook: new Rule({
                title: 'Bait & Hook',
                fix: '',
                category: 'pattern',
                why: '',
                when: '???',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            }),
            test_state: new Rule({
                title: 'Element has a test state',
                fix: 'Add test state to element',
                category: 'testing',
                why: 'Move beyond guesses',
                when: 'test layer is active',
                trigger: function(){return layers.test.visible;},
                rule: function(rule){
                    model.elements.forEach(function(e){
                         if(!(e.test && e.test.state)){
                             rule.addError(e);
                            //TODO better??
                             e.errors.push(rule.fix);
                         }
                    });
                }                
            }),
            compare_to_exercice: new Rule({
                title: 'Exercice compare',
                fix: '',
                category: 'training',
                why: 'training',
                when: 'exercice loaded',
                trigger: function(){return true;},
                rule: function(rule){
                    //Count of partner and connected to which products % total
                    //elements at rate place
                    //elements in addition
                    //elements missing
                    //element in right layers/tags
                    rule.addError({name:'NOT IMPLEMENTED'});
                }
            })
        };

    // Public API here
    return {
      counts: {
          'actif': 0,
          'ok': 0,
          'nok': 0,
          'inactif': 0
      },
      points: 0,
      checkAll: function(m){
          this.points = 0;
          var self = this;
          model = m;
          //reset errors on elements
          model.elements.forEach(function(e){
              e.errors = [];
          });
          this.counts = {
              'actif': 0,
              'ok': 0,
              'nok': 0,
              'inactif': 0
          };
          
          if(layers.errors.visible){
              //precalculate data structure which can be used by rules
              unUsedTags = layers.tags.tags.filter(function(l){
                  return l.name != '';
                }).reduce(function(l, t){
                    l.push(t.id);
                    return l;
              }, []);
              elementsByTags = {};
              elementsWithoutTags = [];
              elementsByTypes = {};
              layers.bmo.attributes[0].values.forEach(function(type){
                  elementsByTypes[type] = [];
              });
              
              model.elements.forEach(function(e){
                  if(e.tags && e.tags.length > 0){
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
                  }else{
                      elementsWithoutTags.push(e);
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
                  if(rule.active){
                      self.counts.actif++;
                      if(rule.valid){
                          self.counts.ok++;
                      } else {
                          self.counts.nok++;
                      }
                      self.points += rule.points;
                  }else{
                      self.counts.inactif++;
                  }
                  
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
        //by default set top 10 points if valid
        if(this.valid && this.points === 0) this.points = 10;
    }
    return this.valid;
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

Rule.prototype.isNotImplemented = function (){
    return this.errors[0] && this.errors[0].obj.name == 'NOT IMPLEMENTED';
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