import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'meteor/practicalmeteor:chai';

import { ContactPreferences } from './userClasses.js';

import './userGroups.js'

// if (Meteor.isServer) {
//     describe('user group methods', function() {
//         var email = 'test_account@test.com'
//         var password = '123456'
//         var userId;
//         var user;
//         beforeEach(() => {
//             resetDatabase()
//             userId = Accounts.createUser({email: email, password : password});
//             user = Meteor.users.findOne(userId)
//             assert(user, "failed to find user");
//             Meteor.userId = function() { return userId };
//         })

//         it('deleteUser test', function() {
//             Meteor.call('users.deleteUser');
//             user = Meteor.users.findOne(userId);
//             assert(!user, "failed to delete user");
//         });

//         it('setContactPreferences test', function () {
//             var prefs = new ContactPreferences(
//                 true,
//                 2,
//                 'weekly',
//                 true,
//                 false,
//                 false,
//                 true,
//                 true,
//                 "foo@bar.com"
//             );
//             Meteor.call('users.setContactPreferences', prefs);
//             var user = Meteor.users.findOne(userId);
//             assert.deepEqual(prefs, user.profile.contactPreferences);
//         } )
//     });
// }