import { HTTP } from 'meteor/http';

import { PBTaskTypesEnum } from '../imports/api/taskClasses.js'

var sunlightApiBase = "https://congress.api.sunlightfoundation.com/legislators/locate"
var geocodeApiKey = process.env['GEOCODE_API_KEY'];

// Code needed on both the client and the server goes here.

// TODO:  Split this into multiple files

// TODO:  This is only actually needed on the server, but we need it in two different places, including a meteor Method.
//        Should probably move this to a different file.
export function PopulateLocationFromFacebook(userAccessToken) {
    httpRequestStr="https://graph.facebook.com/v2.8/me?fields=location{location}&access_token=" + userAccessToken
    httpRequestStr=encodeURI(httpRequestStr);

    Meteor.http.get(httpRequestStr, 
        function(error, result) {
            if (!error) {
                if (result.data && result.data.location && result.data.location.location) {
                    var loc = result.data.location.location;
                    console.log(loc);
                    if (loc.state) { Meteor.call('users.setState', loc.state); }
                    if (loc.longitude) { Meteor.call('users.setLongitude', loc.longitude); }
                    if (loc.latitude) { Meteor.call('users.setLatitude', loc.latitude); }
                    if (loc.city) { Meteor.call('users.setCity', loc.city)}
                    UpdateCongressionalInfo(Meteor.user());
                }
            }
            else {
                console.log(error)
            }
        }
    )
}

// TODO:  Same as above.
// TODO:  Put a limit on how often users can geocode.
// TODO:  Cache city/state info.
export function UpdateUserLatLong(user) {
    if (geocodeApiKey && user && user.profile && user.profile.locationDataSource === "manual" ) {
        if (user.profile.city && user.profile.state) {
            findLatLongFromCityState(user.profile.city, user.profile.state, function(err, res) {
                if (error) {
                    // Do nothing.  Error gets handled better higher in the stack.
                }
                else {
                    Meteor.users.update(user._id, {$set: {
                        "profile.latitude": res.latitude,
                        "profile.longitude": res.longitude
                    }}, null, function(error, result) {
                        if (error) {
                            console.log(error)
                        }
                        else {
                            UpdateCongressionalInfo(Meteor.user());
                        }
                    });
                }
            } )            
        }
    }
}

export function findLatLongFromCityState(city, state, callback) {
    console.log("finding latlong from citystate " + city + state);
    console.log(geocodeApiKey);
    if (geocodeApiKey) {
        var httpRequestStr='https://api.geocod.io/v1/geocode' +
                    '?api_key=' + geocodeApiKey +
                    "&q=" + city + "+" + state;
        httpRequestStr = encodeURI(httpRequestStr);

        console.log("making request to " + httpRequestStr);
        HTTP.get(httpRequestStr, {}, function(error, response) {
            if (error) {
                console.log(error);
                callback(error, null);
            }
            else {
                if (response && response.data && response.data.results &&
                response.data.results[0] && response.data.results[0].location) {
                    var latitude = response.data.results[0].location.lat;
                    var longitude = response.data.results[0].location.lng;
                    var result = {latitude: latitude, longitude: longitude};

                    callback(null, result);
                }
            }
        });
    }
}

// TODO:  Implement
export function findLatLongFromAddress(address, city, state, callback) {

}

// Gets congressional info in format { house: [], senate: []}.  Accepts a callback to run once info is ready.
// callback has signature (error, congressionalInfo) => {}.
export function getCongressionalInfoByLatLong(latitude, longitude, callback) {
    if (latitude && longitude) {
        var httpRequestStr = sunlightApiBase + '?latitude=' + latitude + '&longitude=' + longitude;
        getCongressionalInfo(httpRequestStr, callback);
    }
    else {
        throw "Invalid location data"
    }
}

// Gets congressional info in format { house: [], senate: []}.  Accepts a callback to run once info is ready.
// callback has signature (error, congressionalInfo) => {}.
export function getCongressionalInfoByZip(zip, callback) {
    if (zip) {
        var httpRequestStr = sunlightApiBase + '?zip=' + zip;
        getCongressionalInfo(httpRequestStr, callback);
    }
    else {
        throw "Invalid location data"
    }
}

// Gets congressional info in format { house: [], senate: []}.  Accepts a callback to run once info is ready.
// callback has signature (error, congressionalInfo) => {}.
function getCongressionalInfo(httpRequestStr, callback) {
    httpRequestStr = encodeURI(httpRequestStr);

    if (httpRequestStr) {
        HTTP.get(httpRequestStr,
            function (error, response) {
                if (error) {
                    console.log(error);
                    callback(error, null);
                }
                else {
                    congressionalInfo = {
                        house : [],
                        senate : []
                    };
                    response.data.results.forEach( function(elt) {
                        if (elt.chamber === "house") {
                            congressionalInfo.house.push(elt.bioguide_id);
                            if (Meteor.isServer) { // TODO:  Consider removing this -- how often will our senators list _really_ change?  Is the maintenance period enough?
                                var storedRepresentative = Representatives.findOne( {bioguide_id: elt.bioguide_id} );
                                if (storedRepresentative) {
                                    Representatives.update(storedRepresentative._id, elt);
                                } 
                                else {
                                    Representatives.insert(elt);
                                }
                            }
                        }
                        if (elt.chamber === "senate") {
                            congressionalInfo.senate.push(elt.bioguide_id);
                            if (Meteor.isServer) { // TODO:  Consider removing this -- how often will our senators list _really_ change?  Is the maintenance period enough?
                            var storedSenator = Senators.findOne( {bioguide_id: elt.bioguide_id });
                                if (storedSenator) {
                                    Senators.update(storedSenator._id, elt);
                                }
                                else {
                                    Senators.insert(elt);
                                }
                            }
                        }
                    });
                    callback(null, congressionalInfo);
                }
            }
        )
    }
}

// TODO:  This function is getting called too often.  Make these calls more structured/conservative.
export function UpdateCongressionalInfo(user) {
    if (!user || !user.profile) {
        return;
    }

    callback = function(error, congressionalInfo) {
        if (congressionalInfo) {
        Meteor.users.update(
            { _id: user._id},
            { $set: {"profile.congressInfo" : congressionalInfo} });
        }
    };

    // TODO:  Make sure that the user can override this!
    if (user.profile.latitude && user.profile.longitude) {
        getCongressionalInfoByLatLong(user.profile.latitude, user.profile.longitude, callback);
    }
    else if (user.profile.zipCode) {
        getCongressionalInfoByZip(user.profile.zipCode, callback);
    }
}

export function FindTaskFromUserTask(userTask) {
    return Tasks.findOne(new Mongo.ObjectID(userTask.task_id));
}

export function FindTaskDetailFromTask(task) {
    retval = null;
    if (task.task_detail_id && task.task_type){
        switch(task.task_type) {
            case PBTaskTypesEnum.phone:
                retval = PhoneTasks.findOne(new Mongo.ObjectID(task.task_detail_id));
                break;
            case PBTaskTypesEnum.freeform:
                retval = FreeformTasks.findOne(new Mongo.ObjectID(task.task_detail_id));
                break;
            default:
                throw "invalid task type";
        }
    }
    return retval;
}

export function TimeDeltaToPrettyString(utcNow, utcLater) {
    var timeDelta = utcLater - utcNow;
    var prettyString = ""
    if (timeDelta <= 0) {
        prettyString = "elapsed";
    } 
    else if (timeDelta <= 1000*60*60 /* less than an hour */) {
        var nMinutesRemaining = Math.floor(timeDelta/(1000 * 60));
        if (nMinutesRemaining === 0) {
            prettyString = "under 1 minute";
        }
        if (nMinutesRemaining === 1) {
            prettyString = "1 minute";            
        }
        else {
         prettyString = nMinutesRemaining + " minutes";
        }
    }
    else if (timeDelta <= 1000*60*60*24) { /* more than an hour, less than a day */
        var nHoursRemaining = Math.floor(timeDelta/(1000 * 60 * 60));
        if (nHoursRemaining === 1) {
            prettyString = "1 hour";
        }
        else {
         prettyString = nHoursRemaining + " hours";
        }
    }
    else {
        var nDaysRemaining = Math.floor(timeDelta/(1000 * 60 * 60 *24))
        if (nDaysRemaining) {
            prettyString = "1 day";
        }
        else {
            prettystring = nDaysRemaining + "days";
        }
    }

    return prettyString
}

export function getNationalGroup() {
    return UserGroups.findOne({name: "National"});
}

export function getStateGroupByStateName(stateName) {
    return UserGroups.findOne({name: stateName});
}

export function getStateGroupByStateAbbr(stateAbbr) {
    stateName = abbrState(stateAbbr, "name");
    if (stateName) {
        return getStateGroupByStateName(stateName);
    }
}

export function abbrState(input, to){
    
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }    
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }    
    }
}