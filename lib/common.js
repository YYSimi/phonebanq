import { HTTP } from 'meteor/http';

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
    var geocodeApiKey = process.env['GEOCODE_API_KEY'];

    if (geocodeApiKey && user && user.profile && user.profile.locationDataSource === "manual" ) {
        if (user.profile.city && user.profile.state) {
            var httpRequestStr='https://api.geocod.io/v1/geocode' +
                        '?api_key=' + geocodeApiKey +
                        "&q=" + user.profile.city + "+" + user.profile.state;
            httpRequestStr = encodeURI(httpRequestStr);

            console.log("making request to " + httpRequestStr);
            HTTP.get(httpRequestStr, {}, function(error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    if (response && response.data && response.data.results &&
                    response.data.results[0] && response.data.results[0].location) {
                        var latitude = response.data.results[0].location.lat;
                        var longitude = response.data.results[0].location.lng;
                        
                        Meteor.users.update(user._id, {$set: {
                            "profile.latitude": latitude,
                            "profile.longitude": longitude
                        }}, null, function(error, result) {
                            if (error) {
                                console.log(error)
                            }
                            else {
                                UpdateCongressionalInfo(Meteor.user());
                            }
                        });
                    }
                }
            })
        }
    }
}

export function UpdateCongressionalInfo(user) {
    if (!user || !user.profile) {
        return;
    }

    var httpRequestStrBase = "https://congress.api.sunlightfoundation.com/legislators/locate"
    var httpRequestStr = ""

    // TODO:  Make sure that the user can override this!
    if (user.profile.latitude && user.profile.longitude) {
        httpRequestStr = httpRequestStrBase + '?latitude=' + user.profile.latitude + '&longitude=' + user.profile.longitude;
    }
    else if (user.profile.zipCode) {
        httpRequestStr = httpRequestStrBase + '?zip=' + user.profile.zipCode;
    }
    httpRequestStr = encodeURI(httpRequestStr);

    if (httpRequestStr) {
        HTTP.get(httpRequestStr,
            function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    var congressInfo = {
                        house : [],
                        senate : []
                    }
                    response.data.results.forEach( function(elt) {
                        if (elt.chamber === "house") {
                            congressInfo.house.push(elt.bioguide_id);
                            var storedRepresentative = Representatives.findOne( {bioguide_id: elt.bioguide_id} );
                            if (storedRepresentative) {
                                Representatives.update(storedRepresentative._id, elt);
                            } 
                            else {
                                Representatives.insert(elt);
                            }
                        }
                        if (elt.chamber === "senate") {
                            congressInfo.senate.push(elt.bioguide_id);
                            var storedSenator = Senators.findOne( {bioguide_id: elt.bioguide_id });
                            if (storedSenator) {
                                Senators.update(storedSenator._id, elt);
                            }
                            else {
                                Senators.insert(elt);
                            }
                        }
                    });

                    Meteor.users.update(
                        { _id: user._id},
                        { $set: {"profile.congressInfo" : congressInfo} });
                }
            }
        )
    }
}

export function FindTaskFromUserTask(userTask) {
    return Tasks.findOne(new Mongo.ObjectID(userTask.task_id));
}

export function FindTaskDetailFromTask(task) {
    retval = null;
    if (task.task_detail_id && task.task_type){
        switch(task.task_type) {
            case "phone":
                retval = PhoneTasks.findOne(new Mongo.ObjectID(task.task_detail_id));
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