var STAT_API_KEY = "";
var STAT_API_DOMAIN = "";
var strJ = "";	// Javascript variable for debugging

function sendRequest(url,callback,postData,SelfRef) {
    var req = createXMLHTTPObject();
    if (!req) return;
    var method = (postData) ? "POST" : "GET";
    req.open(method,url,true);
    // Setting the user agent is not allowed in most modern browsers It was
    // a requirement for some Internet Explorer versions a long time ago.
    // There is no need for this header if you use Internet Explorer 7 or
    // above (or any other browser)
    // req.setRequestHeader('User-Agent','XMLHTTP/1.0');
    if (postData)
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    req.onreadystatechange = function () {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
//          alert('HTTP error ' + req.status);
            return;
        }
        callback(req,SelfRef);
    }
    if (req.readyState == 4) return;
    req.send(postData);
}

var XMLHttpFactories = [
    function () {return new XMLHttpRequest()},
    function () {return new ActiveXObject("Msxml3.XMLHTTP")},
    function () {return new ActiveXObject("Msxml2.XMLHTTP.6.0")},
    function () {return new ActiveXObject("Msxml2.XMLHTTP.3.0")},
    function () {return new ActiveXObject("Msxml2.XMLHTTP")},
    function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i=0;i<XMLHttpFactories.length;i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        }
        catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}


var StatJSAPI =
{
	version : '1',
	author : 'Matt Stannard (matt.stannard@4psmarketing.com',
	api_key : '',
	api_domain : '',
	debug_mode : true,
	projects : [],
	sites : [],
	keywords : [],
	ProjectCallback : null,
	SiteCallback : null,
	KeywordCallback : null,
	DebugConsole : function(CFunction,Message)
	{
		if (this.debug_mode)
		{
			console.log("StatJSAPI " + this.version + " >> " + CFunction + " >> " + Message);
		}
	},
	GetStatAPIUrl : function()
	{
		this.DebugConsole("GetStatAPIUrl","Entered function");
		var strURL;
		strURL = "";

		if (this.api_key != "" && this.api_domain != "")
		{
			strURL = "https://" + this.api_domain + ".getstat.com/api/v2/" + this.api_key + "/";
		}
		this.DebugConsole("GetStatAPIUrl","Got Url - " + strURL);
		this.DebugConsole("GetStatAPIUrl","Exited function");
		return(strURL);
	},
	GetDataAsJSON : function(API_FUNCTION,CallBackFunction,SelfRef)
	{
		this.DebugConsole("GetDataAsJSON","Entered function");
		objReturn = null;
		strURL = this.GetStatAPIUrl();

		if (strURL != "")
		{
			strURL = strURL + API_FUNCTION;
			this.DebugConsole("GetDataAsJSON","API Method: " + strURL);
			
			if (strURL.indexOf("format=json") == -1)
			{
				if (strURL.indexOf("?") == -1)
				{
					strURL += "?format=json";
				}
				else
				{
					strURL += "&format=json";
				}
			}

			strURL = "https://apps.4psmarketing.com/stat/proxy.php?m=" + escape(strURL);
			this.DebugConsole("GetDataAsJSON",strURL);

			// This is where we need jQuery to make the request
			this.DebugConsole("GetDataAsJSON","Making HTTP Request");
			
			sendRequest(strURL,CallBackFunction,null,SelfRef); 
			

		}

		this.DebugConsole("GetDataAsJSON","Exited function");
	},
	GetProjects_cb : function(req,t)
	{
		var objProjects;
		var strJSON = req.responseText;
		jsonProjectList = JSON.parse(strJSON);
		strJ = jsonProjectList;

		t.DebugConsole("GetProjects_cb","Entered function");
		t.projects = [];
		jsonProjectList.Response.Result.forEach(function(field){
			t.projects.push(field);
		});

		if (t.SiteCallback)
		{
			t.ProjectCallback(t);
		}

		t.DebugConsole("GetProjects_cb","Exited function");		
	},
	GetProjects : function()
	{
		this.DebugConsole("GetProjects","Entered function");
		if (this.GetStatAPIUrl() != "")
		{
			this.GetDataAsJSON("projects/list?results=500",this.GetProjects_cb,this);
			
		}
		this.DebugConsole("GetProjects","Exited function");
	},
	GetSites_cb : function(req,t)
	{
		var objProjects;
		var strJSON = req.responseText;
		jsonSiteList = JSON.parse(strJSON);
		strJ = jsonSiteList;

		t.DebugConsole("GetSites_cb","Entered function");
		t.sites = [];
		jsonSiteList.Response.Result.forEach(function(field){
			t.sites.push(field);
		});

		if (t.SiteCallback)
		{
			t.SiteCallback(t);
		}

		t.DebugConsole("GetSites_cb","Exited function");		
	},
	GetSites : function(SiteRequest)
	{
		this.DebugConsole("GetSites","Entered function");
		if (SiteRequest != "")
		{
			this.GetDataAsJSON(SiteRequest,this.GetSites_cb,this);
		}
		this.DebugConsole("GetSites","Exited function");
	},
	GetKeywords_cb : function(req,t)
	{
		var objProjects;
		var strJSON = req.responseText;
		jsonKeywordList = JSON.parse(strJSON);
		strJ = jsonKeywordList;

		t.DebugConsole("GetKeywords_cb","Entered function");
		t.keywords = [];
		jsonKeywordList.Response.Result.forEach(function(field){
			t.keywords.push(field);
		});

		if (t.KeywordCallback)
		{
			t.KeywordCallback(t);
		}

		t.DebugConsole("GetKeywords_cb","Exited function");		
	},
	GetKeywords : function(KeywordRequest)
	{
		this.DebugConsole("GetKeywords","Entered function");
		if (KeywordRequest != "")
		{
			this.DebugConsole("GetKeywords",KeywordRequest + "&results=500");
			this.GetDataAsJSON(KeywordRequest + "&results=500",this.GetKeywords_cb,this);
			// /keywords/list?site_id=3037&start=500&results=500&format=json
		}
		this.DebugConsole("GetKeywords","Exited function");
	},
	GetKeywordsAsTable : function()
	{
		var strTable = "";
		
		strTable = "<table>\n";
		strTable += "<thead>\n";
		strTable += "<tr>\n";
		strTable += "<th>Date</th>";
		strTable += "<th>Keyword</th>";
		strTable += "<th>Google Rank</th>";
		strTable += "<th>Google Url</th>";
		strTable += "<th>Bing Rank</th>";
		strTable += "<th>Bing Url</th>";
		strTable += "<th>Yahoo Rank</th>";
		strTable += "<th>Yahoo Url</th>";
		strTable += "</tr>\n";
		strTable += "</thead>\n";
		strTable += "<tbody>\n";

		if (this.keywords.length > 0)
		{
			this.keywords.forEach(function(field){
				strTable += "\n<tr>";
				strTable += "<td>" + field.KeywordRanking.date + "</td>";
				strTable += "<td>" + field.Keyword + "</td>";
				strTable += "<td>" + field.KeywordRanking.Google.Rank + "</td>";
				strTable += "<td>" + field.KeywordRanking.Google.Url + "</td>";
				strTable += "<td>" + field.KeywordRanking.Bing.Rank + "</td>";
				strTable += "<td>" + field.KeywordRanking.Bing.Url + "</td>";
				strTable += "<td>" + field.KeywordRanking.Yahoo.Rank + "</td>";
				strTable += "<td>" + field.KeywordRanking.Yahoo.Url + "</td>";
				strTable += "</tr>";
			});
		}

		strTable += "</tbody>\n";
		strTable += "</table>\n";

		return(strTable);
	}
} 
