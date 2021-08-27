var OMW = config.OWMKEY;
var WB = config.WBKEY;
//Define hourly header Array
var hourlyheaderarray =
[
    "Time",
    "Temp",
    "Feels",
    "Pressure",
    "Humidity",
    "Dew Point",
    "Clouds",
    "Wind Speed",
    "Wind Deg",
    "ID",
    "Description",
    "Detailed",
    "Icon"
]
//Define daily header Array
var dailyheaderarray =
[
    "Time",
    "Sunrise",
    "Sunset",
    "Day Temp",
    "Min Temp",
    "Max Temp",
    "Night Temp",
    "Eve Temp",
    "Morn Temp",
    "Day Feels",
    "Night Feels",
    "Eve Feels",
    "Morn Feels",
    "Pressure",
    "Humidity",
    "Dew Point",
    "Wind Speed",
    "Wind Deg",
    "ID",
    "Description",
    "Detailed",
    "Icon",
    "Clouds",
    "Rain",
    "UVI"
]
//Function to geolocate + pass coordinates to request url
function geoReq()
{
    navigator.geolocation.getCurrentPosition(showPosition, handleError);
    function showPosition(position)
    {
        var userlat = position.coords.latitude;
        var userlong = position.coords.longitude;
        console.log("Lat: " + userlat);
        console.log("Long: " + userlong);
        
        var requesturl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + userlat + '&lon=' + userlong + '&lang=en&units=imperial&exclude=minutely&appid=' + OMW;
        var request = new XMLHttpRequest();
        request.open('GET', requesturl, true);
        request.onload = function()
        {
            // Begin accessing JSON data here
            data = JSON.parse(this.response);
            //Populate predata
            populatePreData();
            //Populate current information
            populateCurrent();
            //Populate hourly information
            for (var h = 0; h < 48; h++)
            {
                populateHourly(h);
            }
            //Populate daily information
            for (var p = 0; p < 8; p++)
            {
                populateDaily(p);
            }
            //Create Hourly and Daily Tables
            createTable(hours, hourlyheaderarray, "hourly");
            createTable(days, dailyheaderarray, "daily");
            document.getElementById("labelhourly").innerHTML = "Hourly Weather";
            document.getElementById("labeldaily").innerHTML = "Daily Weather";
            return data;
        }
        request.send();

        var alerturl = 'https://api.weatherbit.io/v2.0/alerts?lat=' + userlat + '&lon=' + userlong + '&key=' + WB; 	
        var alertrequest = new XMLHttpRequest();
        alertrequest.open('GET', alerturl, true);
        alertrequest.onload = function()
        {
            alerts = JSON.parse(this.response);
            document.getElementById("predata_label").innerHTML = alerts["city_name"] + ", " + alerts["state_code"];
            if (alerts["alerts"]["0"] != undefined)
            {
                document.getElementById("severe_alert").innerHTML = alerts["alerts"]["0"]["title"];
                document.getElementById("severe_alert").style.display = "block";
            }
            
        }
        alertrequest.send();

    }
    function handleError(error)
    {
        switch(error.code)
        {
            case error.PERMISSION_DENIED:
                alert("Allow Location Permissions To Acquire Local Weather Data");
                break;
            case error.TIMEOUT:
                alert("Request Timed Out");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location Information Not Available");
                break;
            case error.UNKNOWN_ERROR:
                alert("THIS WASN'T SUPPOSED TO HAPPEN")
        }
    }
}
//Function to convert utc times
function fixTime(supatime)
{
    var thetime = new Date(supatime * 1000);
    var month = thetime.getMonth() + 1;
    var day = thetime.getDate();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n = weekday[thetime.getDay()];
    var year = thetime.getFullYear();
    var hour = thetime.getHours();
    var minutes = thetime.getMinutes();
    var seconds = thetime.getSeconds();
    seconds = checkTime(seconds);
    minutes = checkTime(minutes);
    //Resolve am/pm
    if (hour >= 12)
    {
        var ampm = "PM"
        if (hour > 12)
        {
            hour = hour - 12;
        }
    }
    else var ampm = "AM";
    return n + " - " + month + "/" + day + "/" + year + " - " + hour + ":" + minutes + ":" + seconds + " " + ampm;
    
}
//Function to shorten time to HH:MM a/p
function shortenTime(supatime)
{
    var thetime = new Date(supatime * 1000);
    var hour = thetime.getHours();
    var minutes = thetime.getMinutes();
    var seconds = thetime.getSeconds();
    seconds = checkTime(seconds);
    minutes = checkTime(minutes);
    //Resolve am/pm
    if (hour >= 12)
    {
        var ampm = "PM"
        if (hour > 12)
        {
            hour = hour - 12;
        }
    }
    else var ampm = "AM";
    return hour + ":" + minutes + ":" + seconds + " " + ampm;
}
//Get date and time
function startTime(){
    var supertime = new Date();
    var month = supertime.getMonth() + 1;
    var day = supertime.getDate();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n = weekday[supertime.getDay()];
    var year = supertime.getFullYear();
    var hour = supertime.getHours();
    var minutes = supertime.getMinutes();
    var seconds = supertime.getSeconds();
    seconds = checkTime(seconds);
    minutes = checkTime(minutes);
    //Resolve am/pm
    if (hour >= 12)
    {
        var ampm = "PM"
        if (hour > 12)
        {
            hour = hour - 12;
        }
    }
    else var ampm = "AM";
    //Add time header and reminder for last weather update
    document.getElementById("timeheader").innerHTML = n + " - " + month + "/" + day + "/" + year + " - " + hour + ":" + minutes + ":" + seconds + " " + ampm;
    //Clock
    var t = setTimeout(startTime, 500);
}
//Time update
function checkTime(i)
    {
        if (i < 10) {i = "0" + i};
        return i;
}
//Display time of last weather update
function updateReminder()
    {
    //Last updated time
    var lastupdate = new Date();
    var lasthour = lastupdate.getHours();
    var lastminutes = lastupdate.getMinutes();
    lastminutes = checkTime(lastminutes);
    //Resolve am/pm
    if (lasthour >= 12)
    {
        var lastampm = "PM"
        if (lasthour > 12)
        {
            lasthour = lasthour - 12;
        }
    }
    else var lastampm = "AM";
    document.getElementById("update-reminder").innerHTML = "Last Refreshed: " + lasthour + ":" + lastminutes + " " + lastampm;
}
//Create data tables for hourly and daily
function createTable(tableData, tableheaders, tabletype) {
    var label = document.createElement('header');
    label.id = "label" + tabletype;
    label.className = "label" + tabletype;
    var table = document.createElement('table');
    table.id = "table" + tabletype;
    table.className = "table" + tabletype;

    var tablehead = document.createElement('thead');
    tablehead.id = "tablehead" + tabletype;
    tablehead.className = "tablehead" + tabletype;
    var headrow = document.createElement('tr');
    headrow.id = "headrow" + tabletype;
    headrow.className = "headrow" + tabletype;
    tableheaders.forEach(function(pls)
    {
        var headercell = document.createElement('th');
        headercell.id = "th" + tabletype;
        headercell.className = "th" + tabletype;
        headercell.innerHTML = pls;
        headrow.appendChild(headercell);
    })
    tablehead.appendChild(headrow);

    var tableBody = document.createElement('tbody');
    tableBody.id = "tbody" + tabletype;
    tableBody.className = "tbody" + tabletype;
    tableData.forEach(function(rowData) {
      var row = document.createElement('tr');
      row.id = "tr" + tabletype;
      row.className = "tr" + tabletype;
      rowData.forEach(function(cellData) {
        var cell = document.createElement('td');
        cell.id = "td" + tabletype;
        cell.className = "td" + tabletype;
        cell.innerHTML = cellData;
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    });
    table.appendChild(tablehead);
    table.appendChild(tableBody);
    document.body.appendChild(label);
    document.body.appendChild(table);
}
//Var for parsed json
var data;
var alerts;
//Array for predata
var predata = new Array(4);
//Array for daily weather
var days = new Array(9);
for (var i = 0; i < days.length; i++)
{
    days[i] = new Array(25);
}
//Array for hourly weather
var hours = new Array(49);
for (var i = 0; i < hours.length; i++)
{
    hours[i] = new Array(13);
}
//Array for current weather
var currents = new Array(17);
function populatePreData()
{
    predata[0] = (data["lat"] + '\xB0' + " N");
    document.getElementById("predatalat").innerHTML = predata[0];
    predata[1] = (data["lon"] + '\xB0' + " W");
    document.getElementById("predatalon").innerHTML = predata[1];
    predata[2] = (data["timezone"]);
    document.getElementById("predatatz").innerHTML = predata[2];
    predata[3] = (data["timezone_offset"]);
    document.getElementById("predatatzo").innerHTML = predata[3];
}
//Define current grab
function populateCurrent()
{
    currents[0] = (data["current"]["dt"]);
    currents[0] = fixTime(currents[0]);
    document.getElementById("currenttime").innerHTML = currents[0];
    currents[1] = (data["current"]["sunrise"]);
    currents[1] = shortenTime(currents[1]);
    document.getElementById("currentsunrise").innerHTML = currents[1];
    currents[2] = (data["current"]["sunset"]);
    currents[2] = shortenTime(currents[2]);
    document.getElementById("currentsunset").innerHTML = currents[2];
    currents[3] = (data["current"]["temp"]);
    currents[3] = currents[3].toFixed(0);
    document.getElementById("currenttemp").innerHTML = currents[3] + '\xB0' + "F";
    currents[4] = (data["current"]["feels_like"]);
    currents[4] = currents[4].toFixed(0);
    document.getElementById("currentfeelslike").innerHTML = currents[4] + '\xB0' + "F";
    currents[5] = (data["current"]["pressure"]) + " hPa";
    document.getElementById("currentpressure").innerHTML = currents[5];
    currents[6] = (data["current"]["humidity"]);
    document.getElementById("currenthumidity").innerHTML = currents[6] + "%";
    currents[7] = (data["current"]["dew_point"]);
    currents[7] = currents[7].toFixed(0) + '\xB0' + "F";
    document.getElementById("currentdewpoint").innerHTML = currents[7];
    currents[8] = (data["current"]["uvi"]);
    document.getElementById("currentuvi").innerHTML = currents[8];
    currents[9] = (data["current"]["clouds"]) + "%";
    document.getElementById("currentclouds").innerHTML = currents[9];
    currents[10] = (data["current"]["visibility"]) + " m";
    document.getElementById("currentvisibility").innerHTML = currents[10];
    currents[11] = (data["current"]["wind_speed"]) + " mph";
    document.getElementById("currentwindspeed").innerHTML = currents[11];
    currents[12] = (data["current"]["wind_deg"]) + '\xB0';
    document.getElementById("currentwinddeg").innerHTML = currents[12];
    currents[13] = (data["current"]["weather"]["0"]["id"]);
    document.getElementById("currentid").innerHTML = currents[13];
    currents[14] = (data["current"]["weather"]["0"]["main"]);
    document.getElementById("currentmain").innerHTML = currents[14];
    currents[15] = (data["current"]["weather"]["0"]["description"]);
    document.getElementById("currentdescription").innerHTML = currents[15];
    currents[16] = (data["current"]["weather"]["0"]["icon"]); 
    currents[16] = "https://openweathermap.org/img/w/" + currents[16] + ".png";
    document.getElementById("currenticon").innerHTML = ("<img src='" + currents[16]  + "'>");
    console.log("Current loading complete");
}
//Define hourly grab
function populateHourly(i)
{
    hours[i][0] = (data["hourly"][i]["dt"]);
    hours[i][0] = fixTime(hours[i][0]);
    hours[i][1] = (data["hourly"][i]["temp"]);
    hours[i][1] = hours[i][1].toFixed(0) + '\xB0' + "F";
    hours[i][2] = (data["hourly"][i]["feels_like"]);
    hours[i][2] = hours[i][2].toFixed(0) + '\xB0' + "F";
    hours[i][3] = (data["hourly"][i]["pressure"]) + " hPa";
    hours[i][4] = (data["hourly"][i]["humidity"]) + "%";
    hours[i][5] = (data["hourly"][i]["dew_point"]);
    hours[i][5] = hours[i][5].toFixed(0) + '\xB0' + "F";
    hours[i][6] = (data["hourly"][i]["clouds"]) + "%";
    hours[i][7] = (data["hourly"][i]["wind_speed"]) + " mph";
    hours[i][8] = (data["hourly"][i]["wind_deg"]) + '\xB0';
    hours[i][9] = (data["hourly"][i]["weather"]["0"]["id"]);
    hours[i][10] = (data["hourly"][i]["weather"]["0"]["main"]);
    hours[i][11] = (data["hourly"][i]["weather"]["0"]["description"]);
    hours[i][12] = (data["hourly"][i]["weather"]["0"]["icon"]);
    hours[i][12] = "https://api.openweathermap.org/img/w/" + hours[i][12] + ".png";
    hours[i][12] = '<img src="'+ hours[i][12] +'">';
    console.log("Hour " + i + " loading complete");
}
//Define daily grab
function populateDaily(i)
{
    days[i][0] = (data["daily"][i]["dt"]);
    days[i][0] = fixTime(days[i][0]);
    days[i][1] = (data["daily"][i]["sunrise"]);
    days[i][1] = shortenTime(days[i][1]);
    days[i][2] = (data["daily"][i]["sunset"]);
    days[i][2] = shortenTime(days[i][2]);
    days[i][3] = (data["daily"][i]["temp"]["day"]);
    days[i][3] = days[i][3].toFixed(0) + '\xB0' + "F";
    days[i][4] = (data["daily"][i]["temp"]["min"]);
    days[i][4] = days[i][4].toFixed(0) + '\xB0' + "F";
    days[i][5] = (data["daily"][i]["temp"]["max"]);
    days[i][5] = days[i][5].toFixed(0) + '\xB0' + "F";
    days[i][6] = (data["daily"][i]["temp"]["night"]);
    days[i][6] = days[i][6].toFixed(0) + '\xB0' + "F";
    days[i][7] = (data["daily"][i]["temp"]["eve"]);
    days[i][7] = days[i][7].toFixed(0) + '\xB0' + "F";
    days[i][8] = (data["daily"][i]["temp"]["morn"]);
    days[i][8] = days[i][8].toFixed(0) + '\xB0' + "F";
    days[i][9] = (data["daily"][i]["feels_like"]["day"]);
    days[i][9] = days[i][9].toFixed(0) + '\xB0' + "F";
    days[i][10] = (data["daily"][i]["feels_like"]["night"]);
    days[i][10] = days[i][10].toFixed(0) + '\xB0' + "F";
    days[i][11] = (data["daily"][i]["feels_like"]["eve"]);
    days[i][11] = days[i][11].toFixed(0) + '\xB0' + "F";
    days[i][12] = (data["daily"][i]["feels_like"]["morn"]);
    days[i][12] = days[i][12].toFixed(0) + '\xB0' + "F";
    days[i][13] = (data["daily"][i]["pressure"])+ "hPa";
    days[i][14] = (data["daily"][i]["humidity"]) + "%";
    days[i][15] = (data["daily"][i]["dew_point"]);
    days[i][15] = days[i][15].toFixed(0) + '\xB0' + "F";
    days[i][16] = (data["daily"][i]["wind_speed"]) + " mph";
    days[i][17] = (data["daily"][i]["wind_deg"]) + '\xB0';
    days[i][18] = (data["daily"][i]["weather"]["0"]["id"]);
    days[i][19] = (data["daily"][i]["weather"]["0"]["main"]);
    days[i][20] = (data["daily"][i]["weather"]["0"]["description"]);
    days[i][21] = (data["daily"][i]["weather"]["0"]["icon"]);
    days[i][21] = "https://api.openweathermap.org/img/w/" + days[i][21] + ".png";
    days[i][21] = '<img src="'+ days [i][21] +'">';
    days[i][22] = (data["daily"][i]["clouds"]) + "%";
    days[i][23] = (data["daily"][i]["rain"]);
    if (typeof days[i][23] != "number")
    {
        days[i][23] = "None";
    }
    else days[i][23] = (data["daily"][i]["rain"]) + " mm";
    days[i][24] = (data["daily"][i]["uvi"]);
    console.log("Daily " + i + " loading complete");
}