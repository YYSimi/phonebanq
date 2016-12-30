import './loginUi.html'

function trimInput(val) {
    return val.replace(/^\s*|\s*$/g, "");
}

function isValidPassword(userPassword) {
    return val.length >= 6 ? true : false;
}

Template.login.onCreated(function () {
    
})

Template.login.events({
    'submit #login-form' : function(e, t){
        e.preventDefault();
        // retrieve the input field values
        var email = t.find('#login-email').value
            password = t.find('#login-password').value;

        // Trim and validate your fields here.... 

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err){
        if (err) {
            // The user might not have been found, or their passwword
            // could be incorrect. Inform the user that their
            // login attempt has failed. 
        }
        else {}
            // The user has been logged in.
        });
        return false; 
    }
});

Template.register.events({
    'submit #register-form' : function(e, t) {
        e.preventDefault();
        var email = trimInput(t.find('#account-email').value);
        var password = t.find('#account-password').value;

        // Trim and validate the input
        if (isValidPassword(password)) {
            Accounts.createUser({email: email, password : password}, function(err){
                if (err) {
                // Inform the user that account creation failed
                } else {
                // Success. Account has been created and the user
                // has logged in successfully. 
                }
            });
        }

        return false;
        }
});