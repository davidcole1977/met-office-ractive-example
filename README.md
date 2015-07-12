# met-office-ractive-example

> A basic demo that fetches weather observations for the past 24 hours for around 150 UK locations using the Met Office Datapoint API, and displays average and detailed information for your chosen locations.

**This demo was put together quickly and there are a number of Node Package Manager dependencies left over from the boilerplate code that haven't been removed.** 

## Getting started

You'll need [NodeJS](https://nodejs.org/) and [Grunt](http://gruntjs.com/) to install and run this demo.

### Get a Datapoint API key and put it in the code

1. Get an API key at [http://www.metoffice.gov.uk/datapoint](http://www.metoffice.gov.uk/datapoint)
2. Edit the Javascript file src/js/datapoint-service.js, assigning your API key to the variable `apiKey`

```js
var restEndPoint = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/',
    apiKey = 'YOUR API KEY GOES HERE',
```

> Note that you should never put your API key on a publicly available web page, as it could easily be abused. This is a simple demonstration and is not suitable for real world use.

### Install dependencies and run the build

```shell
cd met-office-ractive-example
npm install
grunt
```

The demo page should automatically open in Chrome browser. Alternatively, view the demo at `http://localhost:3000` in your browser.