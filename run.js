#!/usr/bin/env node

var fs = require('fs'),
    categorys = "",
    location = "",
    findSearch = false,
    pwd = process.cwd();

var yelp = require("yelp").createClient({
    consumer_key: process.env.yelp_consumer_key,
    consumer_secret: process.env.yelp_consumer_secret,
    token: process.env.yelp_token,
    token_secret: process.env.yelp_token_secret
});

function find() {
    yelpQuery();
    yelpQuery(20);
}

function findMany() {
    var manyCateg = categorys.split(",");

    for (var i = 0; i < manyCateg.length;i++) {
        console.log("Running Query for " + manyCateg[i]);
        yelpQuery(0,manyCateg[i]);
        yelpQuery(20, manyCateg[i]);
    }
}

function yelpQuery(offset, categ) {
    if (!offset) offset = 0;
    if (!categ) categ = categorys
    yelp.search({
        category_filter: categ,
        location: location,
        radius_filter: 40000,
        sort: 2,
        limit: 20,
        offset: offset
    }, function(error, data) {
        if (error) return console.log(error);
        data = data.businesses;
        if(!data.length) return;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item && item.name && item.location && item.location.coordinate) {
                var message = item.name.replace(/,/g, "") + ',';

                if (typeof(item.location.address) === "object") {
                    for (var kk in item.location.address) {
                        message += item.location.address[kk].replace(/,/g, "") + " ";
                    }
                } else {
                    message += item.location.address + " ";
                }
                message += item.location.city + " " + item.location.state_code + " " + item.location.postal_code + ',';
                message += item.phone + ',' + (item.snippet_text ? item.snippet_text.replace(/,|\n/g, "") : '') + ',' + item.location.coordinate.latitude + ',' + item.location.coordinate.longitude + ',' + categ.replace(/,/g, "") + ',' + item.id;
                if (message.replace(/ /g, "").length) fs.appendFileSync(pwd + "/data.csv", message.replace(/undefined/g, "") + '\n');
            }
        }
        console.log(data.length + " items added.");
    });
}

fs.writeFileSync(pwd + "/data.csv", 'name,civicAddress,phoneNumber,description,latitude,longitude,type,buisnessId\n');

if (process.argv.length < 4) {
    return console.log("ERROR:\tMust pass required paremeters");
}

process.argv.some(function(val, index, array) {
    if (index >= 2) {
        if (index == 2) {
            if (val === "many"){
                findSearch = true;
            } else {
                location = val;
            }
        } else {
            if (findSearch) {
                if(index == 3) {
                    location = val;
                } else {
                    categorys += (index == 4 ? '' : ',') + val;
                }
            } else {
                categorys += (index == 3 ? '' : ',') + val;
            }
        }
    }
});

findSearch ? findMany(): find();