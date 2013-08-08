var elements = [];
var lookupBlock = {'partner_network':'pn', 'key_activities':'ka', 'key_resources':'kr',
		'cost_structure':'c', 'value_proposition':'vp','customer_segments':'cs',
		'customer_relationship':'cr','channels':'dc','revenue_streams':'r'
		}
var lookupColor = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];
App.appView.currentView.currentView.model.postIts().models.sort(function(a, b){return a.attributes.top - b.attributes.top;}).forEach(function(p){
	var e = {};
	e.name = p.attributes.name;
	e.color = {color: p.attributes.colour_class};
	e.bmo = {type: lookupBlock[p.attributes.block]};
	e.tags = ['c'+ lookupColor.indexOf(p.attributes.colour_class)];
	elements.push(e);
});

var text = test = document.createElement('textarea');
text.value = JSON.stringify(elements);
text.style.top = 0;
text.style.left = 0;
text.style.width = '100%'
text.style.height = '50%';
text.style.position = 'absolute';
text.style.zIndex  = 9999;
text.ondblclick = function(){ this.parentNode.removeChild(this) };
document.getElementsByTagName('body')[0].appendChild(text);
