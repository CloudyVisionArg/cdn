var $page = getPage({
    id: 'scriptsversion',
    title: 'Versiones de los scripts',
});

var $pageCont = $('.page-content', $page);

$pageCont.append('holaa');


resolve({
    component: {
    	render: function () {
    		return $page;
    	},
    }
});