import './loginUi.html'

function trimInput(val) {
    return val.replace(/^\s*|\s*$/g, "");
}

Template.login.onRendered(function () {
    Template.instance().$("#login-form").validate();
})

//TODO:  Fill out implementation.
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

Template.register.onRendered(function() {
    //TODO:  Figure out why this call fails.
    //Template.instance().$("#register-form").validate();
})

Template.register.events({
    'submit #register-form' : function(e, t) {
        e.preventDefault();
        var username = trimInput(t.find('#account-username').value);
        var email = trimInput(t.find('#account-email').value);
        var password = t.find('#account-password').value;

        Accounts.createUser({username: username, email: email, password : password}, function(err){
            if (err) {
                console.log(err);
            } else {
            }
        });

        return false;
    }
});