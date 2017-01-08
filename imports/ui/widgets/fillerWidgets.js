import { Template } from 'meteor/templating';

import './fillerWidgets.html'

Template.loginRequired.onCreated(function() {
    console.log(this);
})