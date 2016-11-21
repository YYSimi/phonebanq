import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
    requestPermissions: {
        facebook: ['user_location', 'user_birthday', 'user_friends']
    }
})