import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations'

import { ContactPreferences } from '../imports/api/userClasses.js'


// Adds default values for user settings fields.
Migrations.add({
    version: 1,
    up: function() {
        Meteor.users.find().forEach((user) => {
            var userEmailAddress = "";
            if (user.emails && user.emails[0] && user.emails[0].address) {
                userEmailAddress = user.emails[0].address;
            }
            else if (user.services && user.services.facebook && user.services.facebook.email) {
                userEmailAddress = user.services.facebook.email;
            }
            var defaultSettings = new ContactPreferences(
                true,
                1,
                "daily",
                (user.profile && user.profile.loginsource === "facebook") ? true : false, // fUseFacebokForRecurring
                false, // fUseEmailForRecurring
                true, // fMajorEventNotify
                (user.profile && user.profile.loginsource === "facebook") ? true : false, // fUseFacebookForMajor
                true, // fUseEmailForMajor
                userEmailAddress // emailAddress
            )
            Meteor.users.update(user._id, {$set: {"profile.contactPreferences": defaultSettings}});
        })
    },
    down: function () {
        Meteor.users.find().forEach((user) => {
            Meteor.users.update(user._id, {$unset: {"profile.contactPreferences": "" }});
        })
    }
})