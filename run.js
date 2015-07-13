var fs = require('fs'),
    credentials = JSON.parse(fs.readFileSync(".yelp_credentials"));

var yelp = require("yelp").createClient(credentials);

fs.writeFileSync("data.csv", 'name,civicAddress,phoneNumber,description,latitude,longitude,type,buisnessId\n');

var location = "";

if (process.argv.length < 3) {
    return console.log("ERROR:\tMust pass a location as first parameter!");
} else if (process.argv.length < 4) {
    console.log("ERROR:\tMust pass atleast 1 category after location");
    process.stdout.write("ERROR:\tTo Find All Category's: https://www.yelp.com/developers/documentation/v2/all_category_list");
    return;
}

total = 0;
function find(categorys) {
    yelp.search({
        category_filter: categorys,
        location: location,
        radius_filter: 39000
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
                if (message.replace(/ /g, "").length) fs.appendFileSync("data.csv", message.replace(/undefined/g,"") +  '\n');
            }
        }
        console.log("Finished!")
        console.log("Total items added: " + total);
    });
}


var categ = "";
process.argv.some(function(val, index, array) {
    if (index >= 2) {
        if (index == 2) {
            location = val;
        } else {
            categ += (index == 3 ? '' : ',') + val;
        }
    }
});
find(categ);
