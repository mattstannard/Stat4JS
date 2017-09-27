var STAT_API_KEY = "";
var STAT_API_DOMAIN = "";
var strJ;

/* Data Schema */
var exampleDataSchema = [
  {
    name: 'keywordid',
    label: 'KeywordId',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'keyword',
    label: 'Keyword',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'searchengine',
    label: 'SearchEngine',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'rankdate',
    label: 'Ranking Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'rankurl',
    label: 'Ranking URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'ranking',
    label: 'Ranking',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'count',
    label: 'Count',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  }
];

/* End Data Schema */
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

function makeRequest (method,url) {
  return new Promise(function (resolve, reject) {
    var xhr = createXMLHTTPObject();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
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
	api_http_method : '',
	debug_mode : true,
	projects : [],
	sites : [],
	keywords : [],
	ProjectCallback : null,
	SiteCallback : null,
	KeywordCallback : null,
	ContextProjectId : 0,
	ContextSiteId : 0,
	ContextProjectName : "",
	ContextSiteName : "",
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
	GetDataAsJSONP : function(API_FUNCTION)
	{
		var api_ref = this;

		this.DebugConsole("GetDataAsJSONP","Entered function");

		return new Promise(function (resolve, reject) 
		{
			api_ref.DebugConsole("GetDataAsJSONP","Entered Promise");

			var response;
			var strURL = "";

			
			strURL = api_ref.GetStatAPIUrl();

			if (strURL != "")
			{
				strURL = strURL + API_FUNCTION;
				api_ref.DebugConsole("GetDataAsJSONP","API Method: " + strURL);
				
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
				api_ref.DebugConsole("GetDataAsJSONP",strURL);

				if (api_ref.api_http_method == 'URLFETCH')
				{
					t = UrlFetchApp.fetch(strURL);
					response = t.getContentText();
					resolve(JSON.parse(response));
				}
				else
				{
					api_ref.DebugConsole("GetDataAsJSONP","Making request");
					makeRequest("GET",strURL).then(function(t){
						response = t;
						resolve(JSON.parse(response));
					});
				}
			}

			api_ref.DebugConsole("GetDataAsJSONP","Exited Promise");
		});

		this.DebugConsole("GetDataAsJSONP","Exited function");
	},
	GetProjects : function()
	{
		this.DebugConsole("GetProjects","Entered function");

		var api_ref = this;
		var jsonProjectList = null;
		var strJ = "";
		if (this.GetStatAPIUrl() != "")
		{
			this.GetDataAsJSONP("projects/list?results=500").then(function(t)
			{
				jsonProjectList = t;
				
				api_ref.projects = [];
				jsonProjectList.Response.Result.forEach(function(field){
					api_ref.projects.push(field);
				});

				if (api_ref.ProjectCallback)
				{
					api_ref.ProjectCallback(api_ref);
				}
			});
		}
		this.DebugConsole("GetProjects","Exited function");
	},
	GetSites : function(SiteRequest)
	{
		this.DebugConsole("GetSites","Entered function");

		var api_ref = this;
		var jsonSiteList = null;

		this.GetDataAsJSONP(SiteRequest).then(function(t)
		{
			jsonSiteList = t;
			api_ref.sites = [];

			try
			{
				jsonSiteList.Response.Result.forEach(function(field){
					api_ref.sites.push(field);
				});
			}
			catch(err)
			{
				api_ref.sites.push(jsonSiteList.Response.Result);
			}

			if (api_ref.SiteCallback)
			{
				api_ref.SiteCallback(api_ref);
			}
		});

		this.DebugConsole("GetSites","Exited function");
	},
	GetKeywords : function(KeywordRequest)
	{
		this.DebugConsole("GetKeywords","Entered function");

		var api_ref = this;
		var jsonKeywordList = null;
		
		this.GetDataAsJSONP(KeywordRequest).then(function(t)
		{
			jsonKeywordList = t;
			api_ref.keywords = [];
			jsonKeywordList.Response.Result.forEach(function(field){
				api_ref.keywords.push(field);
			});

			if (api_ref.KeywordCallback)
			{
				api_ref.KeywordCallback(api_ref);
			}
		});

		
		this.DebugConsole("GetKeywords","Exited function");
	},
	GetKeywordsByProjectSite : function(ProjectName,SiteName)
	{
		var api_ref = this;
		var project_id = 0;
		var project_request = "";
		var site_id = 0;
		var site_request = "";

		this.DebugConsole("GetSiteIdByNames","Entered function");

		// TODO: Increase limit from 500 keywords
		
		// Google AppScript doesn't support promises so we do it 
		// slightly differently, could tidy this up to reduce code duplication
		if (api_ref.api_http_method == 'URLFETCH')
		{
			// Firstly get the projects
			strURL = api_ref.GetStatAPIUrl();
			strURL = strURL + "projects/list?results=500&format=json";
			
            // Logger.log(strURL);
			var response = UrlFetchApp.fetch(strURL);
            jsonProjectList = JSON.parse(response.getContentText());
			api_ref.projects = [];

			jsonProjectList.Response.Result.forEach(function(field)
			{
				api_ref.projects.push(field);

				if (field.Name.toLowerCase() == ProjectName.toLowerCase())
				{
					project_id = field.Id;
					project_request = field.RequestUrl;
				}
			});

			Logger.log("Project Id " + project_id);

			if (project_request != "")
			{
				strURL = api_ref.GetStatAPIUrl();
				strURL += project_request;
				var response = UrlFetchApp.fetch(strURL);
				jsonSiteList = JSON.parse(response.getContentText());
				api_ref.sites = [];

				try
				{
					jsonSiteList.Response.Result.forEach(function(field){
						api_ref.sites.push(field);
						if (field.Name.toLowerCase() == ProjectName.toLowerCase())
						{
							site_id = field.Id;
							site_request = field.RequestUrl;
						}
					});
				}
				catch(err)
				{
					api_ref.sites.push(jsonSiteList.Response.Result);
					site_id = jsonSiteList.Response.Result.Id;
					site_request = jsonSiteList.Response.Result.RequestUrl;
				}

				Logger.log("Site Id " + site_id);

				if (site_request != "")
				{
					strURL = api_ref.GetStatAPIUrl();
					strURL += site_request;
					var response = UrlFetchApp.fetch(strURL);
					jsonKeywordList = JSON.parse(response.getContentText());

					api_ref.keywords = [];
					jsonKeywordList.Response.Result.forEach(function(field){
						api_ref.keywords.push(field);
					});
				}
			}

		}
		else
		{
			this.GetDataAsJSONP("projects/list?results=500&format=json").then(function(t)
			{
				jsonProjectList = t;
				api_ref.projects = [];
				jsonProjectList.Response.Result.forEach(function(field)
				{
					api_ref.projects.push(field);

					if (field.Name.toLowerCase() == ProjectName.toLowerCase())
					{
						project_id = field.Id;
						project_request = field.RequestUrl;
					}
				});	


				// So we want sites
				if (project_request != "")
				{
					api_ref.DebugConsole("GetSiteIdByNames","Matched field >> " + project_id);
					api_ref.GetDataAsJSONP(project_request).then(function(r)
					{
						jsonSiteList = r;
						api_ref.sites = [];

						try
						{
							jsonSiteList.Response.Result.forEach(function(field){
								api_ref.sites.push(field);
								if (field.Name.toLowerCase() == ProjectName.toLowerCase())
								{
									site_id = field.Id;
									site_request = field.RequestUrl;
								}
							});
						}
						catch(err)
						{
							api_ref.sites.push(jsonSiteList.Response.Result);
							site_id = jsonSiteList.Response.Result.Id;
							site_request = jsonSiteList.Response.Result.RequestUrl;
						}

						// So we want keywords for a site
						if (site_request != "")
						{
							api_ref.DebugConsole("GetSiteIdByNames","Matched field >> " + site_id);
							api_ref.GetDataAsJSONP(site_request).then(function(s)
							{
								jsonKeywordList = s;
								api_ref.keywords = [];

								jsonKeywordList.Response.Result.forEach(function(field){
									api_ref.keywords.push(field);
								});

							});
						}

					});
				}



			
			});
		}
	},
	GetKeywordDSSchema : function(dataSchema)
	{
		// Return a schema for Data Studio
		var data = [];
		
		if (this.keywords.length > 0)
		{
			this.keywords.forEach(function(field){
				var values = [];
				dataSchema.forEach(function(sField) {
					switch(sField.name) {
						case 'keywordid' : 
							values.push(field.Id);
							break;
						case 'keyword' :
							values.push(field.Keyword);
							break;
						case 'searchengine' :
							values.push('Google');
							break;
						case 'rankdate' :
							values.push(field.KeywordRanking.date);
							break;
						case 'rankurl' :
							values.push(field.KeywordRanking.Google.Url);
							break;
						case 'ranking' :
							values.push(field.KeywordRanking.Google.Rank);
							break;
                        case 'count' :
                            values.push(1);
                            break;
					}
				});

                if (field.KeywordRanking.Google.Rank != null)
                {
                  data.push({
                    values: values
                  });
                }
			});
		}

		return(data);
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
