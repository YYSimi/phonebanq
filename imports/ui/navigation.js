import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import './navigation.html';

Template.nav.helpers({
    fIsThisRouteActive(routeName) {
        return Router.current().route.getName() === routeName;
    },
    // HACK:  Can only have one instance of loginbuttons on a page due to meteor bug.  
    // Need to un-render Loginbuttons Template, rather than just hiding it.
    fIsLeftAlignedLoginbutonsVisible() {
        return Template.instance().fIsLeftAlignedLoginbutonsVisible.get();
    }
})


// HACK:  Can only have one instance of loginbuttons on a page due to meteor bug.  
// Need to track visibility state and un-render Loginbuttons Template on hide, rather than just hiding it.
Template.nav.onCreated( () => {
    var tmpl = Template.instance(); 
    tmpl.fIsLeftAlignedLoginbutonsVisible = new ReactiveVar("false");

    $(window).resize(
        _.debounce(function(){
            tmpl.fIsLeftAlignedLoginbutonsVisible.set( $('.left-aligned-loginbuttons').is(':visible'));
        }, 300, false)
    );
})

Template.nav.onRendered(() => {
    var tmpl = Template.instance();
    tmpl.fIsLeftAlignedLoginbutonsVisible.set( $('.left-aligned-loginbuttons').is(':visible'));
})