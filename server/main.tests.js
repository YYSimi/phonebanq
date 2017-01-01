import './main.js'
import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'meteor/practicalmeteor:chai';

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
            console.log(user);
            assert.equal(user.username, 'test_account@test.com');
        });
    });
}