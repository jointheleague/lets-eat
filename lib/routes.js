Router.route('/dashboard', function () {
	this.layout('adminLayout');
	this.render('dashboard', {data: {title: 'Lets Eat'}});
});

Router.route('/:org?', function () {
	var params = this.params;
	currentOrg = params.org;
	console.log("currentOrg:" + currentOrg);
	this.render('main', {data: {title: 'Lets Eat'}});
}, {name: 'home'});



Router.onAfterAction(function(){
	var message = encodeURIComponent("To make sure we can help you quickly, please include the version of Lets Eat you are using, steps to replicate the issue, a description of what you were expecting and a screenshot if relevant.\nThanks!");
	var m2 = "https://github.com/jointheleague/lets-eat/issues/new?title=Your%20Lets%20Eat%20Issue&body="+message;
	$("a[id='houston-report-bug']").attr('href',m2);
});

