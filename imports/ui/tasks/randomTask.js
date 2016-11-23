import { Template } from 'meteor/templating';

import './randomTask.html'
import '../../api/tasks.js'

Template.randomTask.helpers({
    test() {  //TODO:  Rename this method
        Meteor.call('tasks.createRandom');
        return "Helpers test"}
})