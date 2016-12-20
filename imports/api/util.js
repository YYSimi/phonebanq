import { Meteor } from 'meteor/meteor';

import { getCongressionalInfoByZip, getCongressionalInfoByLatLong, findLatLongFromCityState } from '../../lib/common.js'

Meteor.methods({
    //TODO:  Move this elsewhere.  Make sure this is the right way to avoid CORS.
    'util.getCongressionalInfoByZip'(zipCode){
        check(zipCode, String);
        var congInfoSync = Meteor.wrapAsync(getCongressionalInfoByZip)
        var result = congInfoSync(zipCode);
        return result;
    },
    'util.getCongressionalInfoByCity'(city, state){
        check(city, String);
        check(state, String);

        var latLongSync = Meteor.wrapAsync(findLatLongFromCityState)
        var loc = latLongSync(city, state);
        var congInfoSync = Meteor.wrapAsync(getCongressionalInfoByLatLong, loc.latitude, loc.longitude);
        var result = congInfoSync(loc.latitude, loc.longitude); // TODO:  Looks like argument duplication to me.  Take a look at this.
        return result;
    },
    'util.getCongressionalInfoByAddress'(street, city, state){
        throw "Not Yet Implemented";
    }
});