const BASE_URL =  "https://rayv-webix4.jpl.nasa.gov/devel/ep";
const API_PATH = "/wp-json/dash/v1";

const INITIAL_REPO = "ufs-weather-model";
const INITIAL_METRIC = "views";

const CHART_OPTS = {
    'responsive':true,
    legend: {
        display: true,
        labels: {
            fontSize: 16,
        }
    },
    scales: {
        y: {
            'drawOnChartArea': false,
            'lineWidth': 2
        },
        x: {
            'drawOnChartArea': false,
            'lineWidth': 2
        }
    }

};

const REPOS = [
    {name: 'ufs-weather-model', title: 'Weather Model'}, 
    {name: 'ufs-srweather-app', title: 'Short Range Weather App'},
];

const METRICS = [
    {name: 'views', title: 'Views'}, 
    {name: 'clones', title: 'Clones'}, 
    {name: 'frequency', title: 'Additions and Deletions'}, 
    {name: 'commits', title: 'Commits'}, 
    {name: 'contributors', title: 'Top Contributors'}, 
    {name: 'releases', title: 'Releases'}, 
];


/********************** for testing only ***************************/
const RELEASE_DATA = {
    releases: [
        {'name': 'ufs-srw-v2.0.0', 'date': '2022-06-22T20:27:34Z'}, 
        {'name': 'ufs-v1.0.1', 'date': '2021-09-15T22:17:57Z'}, 
        {'name': 'ufs-v1.0.0', 'date': '2021-03-03T20:46:26Z'}
    ]
};

const CONTRIBUTOR_DATA = {
    count: 30, 
    'top': [
        {login: 'SamuelTrahanNOAA', contributions: 163}, 
        {login: 'junwang-noaa', contributions: 158}, 
        {login: 'climbfuji', contributions: 74}
    ]
}
/*******************************************************************/


function Dash(initialVnode) {

    let model = {
        selectedRepo: INITIAL_REPO, 
        selectedMetric: INITIAL_METRIC,
        repo: INITIAL_REPO,
        metric: INITIAL_METRIC,
        data: null,
        chart: null,
	    loaded: false,	
        error: "",
    };

    function getUrl() {
        return `${BASE_URL}${API_PATH}/${model.repo}/${model.metric}`;
    }

    function getTitle(lst, name) {
        let m = {};

        lst.forEach(function(obj) {
            m[obj.name] = obj.title
        });

        return m[name];
    }

    function getFullTitle() {

        let repoTitle = getTitle(REPOS, model.repo);
        let metricTitle = getTitle(METRICS, model.metric);
        return `${repoTitle} - ${metricTitle}`;
    }

    /******************** Update Functions *********************/
    function updateRepo(e) {
        e.redraw = false;
        model.selectedRepo = e.target.value;
        //console.log(`${model.repo} - ${model.metric}`);
        //console.log(e.target.options[e.target.selectedIndex].text);
    }
    
    function updateMetric(e) {
        e.redraw = false;
        model.selectedMetric = e.target.value;
        //console.log(`${model.repo} - ${model.metric}`);
        //console.log(e.target);
        //console.log(e.target.options[e.target.selectedIndex].text);
    }

    function submitCallback(e) {
        e.preventDefault();
        model.repo = model.selectedRepo;
        model.metric = model.selectedMetric;

        //let base = 'https://rayv-webix4.jpl.nasa.gov/devel/ep/wp-json/dash/v1/ufs-weather-model/views/';

        //let url = `/${model.repo}/${model.metric}/`;

        // For testing only
        //let url = "https://jsonplaceholder.typicode.com/todos/1";
        let url = getUrl();
        updateData(url);

    }

	function initData(url) {
        model.loaded = false;
		let headers = {};
		console.log("**** sending request ****")
		return m.request({
			method: "GET",
			url: url,
			headers: headers,
		})
		.then(function(data){
            model.data = data;
            //model.data = dash_chart_data;
            model.loaded = true;
            console.log("**** RESPONSE ****", data);
		})
        .catch(function(e) {
            model.error = e.code + ": Error loading data";
        })
	}

	function updateData(url) {
        model.loaded = false;
		headers = {};
		console.log("**** sending request 2 ****")
		return m.request({
			method: "GET",
			url: url,
			headers: headers,
		})
		.then(function(data){
            if (model.metric === "releases") {
                model.data = data;
                //model.data = RELEASE_DATA;
            }
            else if (model.metric === "contributors") {
                model.data = data;
                //model.data = CONTRIBUTOR_DATA;
            }
            else {
                model.data = data;
                //model.data = dash_chart_data2;
                model.chart.data = model.data
                model.chart.update();
            }
            model.loaded = true;
            console.log("**** RESPONSE ****", data);
		})
        .catch(function(e) {
            model.error = e.code + ": Error loading data";
        })
	}
    /***********************************************************/

    /************************** View Functions ***********************/
    function selectView(id, name, options, callback) {

        let opts = options.map(function(option) {
            return m("option", {value: option.name}, option.title);
        });

        return m("select", {id: id, name: name, onchange: callback}, opts);
    }

    function formView(id, name, children) {

        return m("form", {id: id, name: name}, children);
    }

    function metricDataView(vnode) {
        let d = model.data;
        if (model.metric === "views" || model.metric === "clones") {
            let name = getTitle(METRICS, model.metric);
            let c = d['count'];
            let u = d['uniques'];
            let txt = `Total ${name}: ${c} Unique ${name}: ${u}`;
            return m("div", {}, txt);
        }
        return "";

    }

    function createChart(vnode) {
        const ctx = vnode.dom.getContext('2d');

        model.chart = new Chart(ctx, {
            type: "line",
            data: model.data,
            options: CHART_OPTS
            });
    }

    function chartView(vnode) {
        return [m("canvas#chart", {oncreate: createChart}), metricDataView()];
    }

    function buttonView(label, callback){
        return m("button", {onclick: callback}, label);

    }

    function contributorViewList(vnode) {
        let data = model.data;
        let count = data['count'];

        let h3 = m("h3", {}, `Total Number of Contributors: ${count}`);

        let children = data['top'].map(function(item) {
            let login = item['login'];
            let contrib = item['contributions'];
            let txt = `${login} (${contrib})`;
            return m("li", {}, txt);

        });

        return m("div", {style: {display: "block"}}, [h3, m("h4", {}, "Top Contributors"), m("ol", {}, children)])

        //return [h3, m("ol", {style: {display: "none"}}, children)];

    }
    function contributorViewTable(vnode) {
        let data = model.data;
        let count = data['count'];

        let h3 = m("h3", {}, `Total Number of Contributors: ${count}`);

        let header_rows = [m("tr", [m("th", "Login"), m("th", "Number of Contributions")])];

        let data_rows = data['top'].map(function(item) {
            return m("tr", [m("td", item["login"]), m("td", item["contributions"])])
            });

        let children = header_rows.concat(data_rows);

        let table = m("table", {border: "1"}, children)
         
        return [h3, table];
    }

    function releaseViewList(vnode) {
        let data = model.data.releases;
        let h3 = m("h3", {}, "Releases");

        let children = data.map(function(item) {
            let name = item['name'];
            let d = item['date'];
            let txt = `${name} - ${d}`;
            return m("li", {}, txt);
        });

        return m("div", {}, [h3, m("ol", {}, children)]);
    }

    function releaseViewTable(vnode) {
        let data = model.data.releases;
        let h3 = m("h3", {}, "Releases");

        let header_rows = [m("tr", [m("th", "Name"), m("th", "Date")])];

        let data_rows = data.map(function(item) {
            return m("tr", [m("td", item["name"]), m("td", item["date"])])
            });

        let children = header_rows.concat(data_rows);

        let table = m("table", {border: "1"}, children)
         
        return [h3, table];
    }

    function dataView(vnode) {
        if (model.metric === "releases") 
            //return releaseViewList(vnode);
            return releaseViewTable(vnode);
        
        if (model.metric === "contributors")
            //return contributorViewList(vnode);
            return contributorViewTable(vnode);

        return chartView(vnode);
    }

    function view(vnode) {


        let repoLabel = m("label", {for: 'repo-select'}, "Select Repository ");
        let repoSelect = selectView('repo-select', 'repo-select', REPOS, updateRepo);

        let metricLabel = m("label", {for: 'metric-select'}, "Select Metric ");
        let metricSelect = selectView('metric-select', 'metric-select', METRICS, updateMetric);

        let btn = buttonView('Submit', submitCallback);

        let frm = formView('dash-form', 'dash-form', [repoLabel, repoSelect, metricLabel, metricSelect, btn]);
        
        let dv = null

        if (model.error)
            dv = m("div", model.error);

        else if (!model.loaded || !model.data)
            //dv = m("div", "Loading...");
            dv = m("div.loader");

        else if (model.data.hasOwnProperty('message'))
            dv = m("div", model.data.message);

        else
            dv = dataView(vnode);


        return [
            frm, 
            m("h1", {}, getFullTitle()),
            dv
        ];


    }
    /*****************************************************************/

	function init(vnode){
        // let url = "https://jsonplaceholder.typicode.com/todos/1";
        //let url = "https://rayv-webix4.jpl.nasa.gov/devel/ep/wp-json/dash/v1/ufs-weather-model/views/";
        let url = getUrl();

        return initData(url);
	}

    return {
        oninit: init,
        view: view,
        }
}

let root = document.getElementById('dashboard-app');


m.mount(root, Dash);






