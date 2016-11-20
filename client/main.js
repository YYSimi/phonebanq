import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Router.configure({
   layoutTemplate: 'main' 
});

Router.route('/mySenators', {
    name: 'mySenators'
});
Router.route('/', {
    name: 'home',
    template: 'info'
})

Template.mySenators.helpers({
    senators : Senators.find({state: "WA"}),
    nSenators : Senators.find({state: "WA"}).count(),
})

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
