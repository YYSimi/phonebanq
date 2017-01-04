import './main.js'
import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'meteor/practicalmeteor:chai';
import { ContactPreferences} from '../imports/api/userClasses.js';

if (Meteor.isServer) {
    describe('user creation', () => {
        beforeEach(() => {
            resetDatabase()
        })

        it('usernames are properly generated for e-mail based logins', () => {
            var email = 'test_account@test.com'
            var password = '123456'
            console.log(Meteor.users.find().fetch());
            var userId = Accounts.createUser({email: email, password : password});

            var user = Meteor.users.findOne(userId)
            assert(user, "failed to find user");
            assert.equal(user.username, 'test_account@test.com');
        });

        it('default settings are properly generated for local-login-based new users', () => {
            var email = 'test_account@test.com'
            var password = '123456'
            console.log(Meteor.users.find().fetch());
            var userId = Accounts.createUser({email: email, password : password});

            var user = Meteor.users.findOne(userId)
            assert(user, "failed to find user");
            var expectedContactPreferences = new ContactPreferences(
                true,       // fRecurringNotify
                1,          // notifyPeriod
                "daily",    // notifyPeriodType
                false,      // fUseFacebookForRecurring
                false,      // fUseEmailForRecurring
                true,       // fMajorEventNotify
                false,      // fUseFacebookForMajor
                true,       // fUseEmailForMajor
                email       // emailAddress
            );

            assert.deepEqual(user.profile.contactPreferences, expectedContactPreferences, "actualprefs are " + user.profile.contacPreferences);
        })
    });
}