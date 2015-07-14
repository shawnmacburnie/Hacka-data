#!/usr/bin/env node
var fs = require('fs'),
    categorys = "",
    location = "",
    searchCompleted = 0,
    total = 0,
    pwd = process.cwd();

var yelp = require("yelp").createClient({
    consumer_key: process.env.yelp_consumer_key,
    consumer_secret: process.env.yelp_consumer_secret,
    token: process.env.yelp_token,
    token_secret: process.env.yelp_token_secret
});

fs.writeFileSync(pwd + "/data.csv", 'name,civicAddress,phoneNumber,description,latitude,longitude,type,buisnessId\n');

if (process.argv.length < 3) {
    return console.log("ERROR:\tMust pass a location as first parameter!");
} else if (process.argv.length < 4) {
    console.log("ERROR:\tMust pass atleast 1 category after location");
    process.stdout.write("ERROR:\tTo Find All Category's: https://www.yelp.com/developers/documentation/v2/all_category_list");
    return;
}
function find() {
    yelpQuery();
    yelpQuery(20);
}

function yelpQuery(offset) {
    if(!offset) offset = 0;
    yelp.search({
        category_filter: categorys,
        location: location,
        radius_filter: 39000,
        sort: 2,
        limit: 20,
        offset: offset
    }, function(error, data) {
        if (error) return console.log(error)
        data = data.businesses;
        total += data.length;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if(item && item.name && item.location && item.location.coordinate) {
                var message = item.name.replace(/,/g, "") + ',';

                if(typeof(item.location.address) === "object") {
                    for(var kk in item.location.address){
                        message += item.location.address[kk].replace(/,/g, "") + " ";
                    }
                } else {
                    message += item.location.address + " ";
                }
                message += item.location.city + " " + item.location.state_code + " " + item.location.postal_code + ',';
                message += item.phone + ',' + (item.snippet_text ? item.snippet_text.replace(/,|\n/g, "") : '') + ',' + item.location.coordinate.latitude + ',' + item.location.coordinate.longitude +',' + categorys.replace(/,/g, "") + ',' + item.id;
                if (message.replace(/ /g, "").length) fs.appendFileSync(pwd + "/data.csv", message.replace(/undefined/g,"") +  '\n');
            }
        }
        if(++searchCompleted == 2) {
            console.log("Finished!");
            console.log("File Saved to: " + pwd + "/data.csv");
            console.log("Total items added: " + total);
        }
    });
}

process.argv.some(function(val, index, array) {
    if (index >= 2) {
        if (index == 2) {
            location = val;
        } else {
            categorys += (index == 3 ? '' : ',') + val;
        }
    }
});
find();
