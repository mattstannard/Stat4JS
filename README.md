# Stat4JS
A Javascript API for GetStat (https://www.getstat.com), please note this library is an unofficial library and based on their JSON API. At present not all features have been exposed

## Background
The idea of the library is to be included within your own Projects and I am hoping to include it in a Data Studio Connector relaly soon, however you can invoke it from your Javascript Console in your Browser. To use this you'll need your Stat API Key as well as your Stat Domain (i.e. **XYZ**.getstat.com

This API is provided AS IS and at current in order to get around Access-Control-Origin restrictions I've used a Proxy on line 110, this purely takes an encoded Stat request and forwards it on, nothing is stored.

## Supports
Currently the API supports getting all projects belonging to an account, using this to pull a list of sites by project and then keywords for a particular site (up to 500, pagination will be added). Each function is asynchrnous so you can attach a callback function to run your code when the call is complete.

The core methods now use promises.

## Usage
Include the javascript file Stat4JS.js

`<script src='text/javascript' src='Your Path To Stat4JS.js'></script>`

To invoke the API:

```
StatJSAPI.api_key = 'YOUR API KEY';
StatJSAPI.api_domain = 'YOUR DOMAIN';
```

### Getting Projects
To get a list of all projects invoke GetProjects, this populates the *projects* property:

```
StatJSAPI.GetProjects();
```

Example (with callback)

```
StatJS.ProjectCallback = function(){console.log(StatJS.projects);};
StatJS.GetProjects();
```


### Getting Sites for a Project
To get a list of all sites for a project invoke GetSites, this populates the *sites* property. The *GetSites* requires a Stat URL entry point, this is set on a *Project* object as the *RequestUrl* attribute - if you know this you can use it, or you can read it from an index in the projects array.

```
StatJSAPI.GetSites(EntryPointURL);
```

Example, to get sites for first project in the account (with callback)

```
StatJS.SiteCallback = function(){console.log(StatJS.sites);};
StatJSAPI.GetSites(StatJSAPI.projects[0].RequestUrl);
```

### Getting Keywords for a Site
To get a list of all keywords for a site invoke GetKeywords, this populates the *keywords* property. The *GetKeywords* requires a Stat URL entry point for a keyword list, this is set on a *Site* object as the *RequestUrl* attribute - if you know this you can use it, or you can read it from an index in the sites array.

Currently this reads 500 keywords and can be slow. Pagination is being added.

```
StatJSAPI.GetKeywords(EntryPointURL);
```

Example, to get keywords for first site within a project in the account (with callback)

```
StatJS.SiteCallback = function(){console.log(StatJS.keywords);};
StatJSAPI.GetSites(StatJSAPI.sites[0].RequestUrl);
```
### Getting Keywords for a Project and Site
To get a list of all keywords for a given project and site by name rather than id invoke GetKeywordsByProjectSite. This populates the *keywords* property. 

Currently this reads 500 keywords and can be slow. Pagination is being added.

```
StatJSAPI.GetKeywordsByProjectSite(ProjectName,SiteName);
```

### Outputing a table of keywords
As an example of how to use the *keywords* array there is a function which products an HTML table string from the keywords downloaded.

After getting the keywords invoke:

```
StatJSAPI.GetKeywordsAsTable()
```
### Outputing a to Data Studio compatible schema
The GetKeywordDSSchema takes a Data Studio schema argument and returns a keyword set as a rows compatible with Google Data Studio.

After getting the keywords invoke:

```
StatJSAPI.GetKeywordDSSchema(inputSchema)
```

### Data Studio Data Model
The API includes exampleDataSchema which is the Google Data Studio model it is designed to integrate with.
