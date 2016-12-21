import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL',
    requestPermissions: {
        facebook: ['user_location', 'email']
    }
})