import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY',
    requestPermissions: {
        facebook: ['user_location', 'email']
    }
})