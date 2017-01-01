import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'meteor/practicalmeteor:chai';
import './users.js'

if (Meteor.isServer) {
    describe('user methods', () => {
        beforeEach(() => {
            resetDatabase()
        })

        it('deleteUser test', () => {
            var email = 'test_account@test.com'
            var password = '123456'
            console.log(Meteor.users.find().fetch());
            var userId = Accounts.createUser({email: email, password : password});

            var user = Meteor.users.findOne(userId)
            assert(user, "failed to find user");
            Meteor.userId = function() { return userId };
            Meteor.call('users.deleteUser')
            var user = Meteor.users.findOne(userId);
            assert(!user, "failed to delete user");
        });
    });
}