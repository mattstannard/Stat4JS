# Stat4JS
A Javascript API for GetStat (https://www.getstat.com), please note this library is an unofficial library and based on their JSON API. At present not all features have been exposed

## Background
The idea of the library is to be included within your own Projects and I am hoping to include it in a Data Studio Connector relaly soon, however you can invoke it from your Javascript Console in your Browser. To use this you'll need your Stat API Key as well as your Stat Domain (i.e. **XYZ**.getstat.com

## Supports
Currently the API supports getting all projects belonging to an account, using this to pull a list of sites by project and then keywords for a particular site (up to 500, pagination will be added). Each function is asynchrnous so you can attach a callback function to run your code when the call is complete.

## Usage
Include the javascript file Stat4JS.js

`<script src='text/javascript' src='Your Path To Stat4JS.js'></script>`

To invoke the API:

`
StatJSAPI.api_key = 'YOUR API KEY';
StatJSAPI.api_domain = 'YOUR DOMAIN';
`

To get a list of all projects invoke GetProjects, this populates the projects array:

`
StatJSAPI.GetProjects();
`

Example (with callback)

`
StatJS.ProjectCallback = function(){console.log(StatJS.projects);};
StatJS.GetProjects();
`

