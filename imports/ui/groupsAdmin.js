import './groupsAdmin.html'

Template.createGroup.events({
    'submit form'(evt) {
        evt.preventDefault();
        console.log("Group creation submitted");

        return false;
    }
});