import './phoneTask.html'
import '../../api/tasks.js'

Template.PhoneTask.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
});

Template.PhoneTask.onRendered(function() {
    // TODO:  This seems janky.  Make sure this pattern is correct.
    if (this.find('.task-notes-display')) {
        var quill = new Quill(this.find('.task-notes-display'), {
            theme: 'snow',
            readOnly: true,
            modules: {
                toolbar: false
            }
        });        
        var delta = JSON.parse(this.data.notes);

        quill.setContents(delta);
    }
})

Template.PhoneTask.helpers({
    findCustomSenators() {
        if (this.call_custom_senators) {
            return this.call_custom_senators.map( (bgId) => {
                return Senators.findOne({bioguide_id : bgId});
            })
        }
    },
    findCustomRepresentatives() {
        if (this.call_custom_representatives) {
            return this.call_custom_representatives.map( (bgId) => {
                return Representatives.findOne({bioguide_id : bgId});
            })
        }
    },
    findMySenators() {
        user = Meteor.user();
        retval = [];
        if (user) {
            if (user.profile && user.profile.congressInfo && user.profile.congressInfo.senate){
                retval = user.profile.congressInfo.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );
            }
        }
        else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
            congresspeople = Session.get("congresspeople");
            if (congresspeople) {
                retval = congresspeople.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );;
            }
        }
        return retval;
    },
    findMyRepresentatives() {
        user = Meteor.user();
        retval = [];
        if (user){
            if (user.profile && user.profile.congressInfo && user.profile.congressInfo.house){
                retval = user.profile.congressInfo.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});
            }
        }
        else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
            congresspeople = Session.get("congresspeople");
            if (congresspeople) {
                retval = congresspeople.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});;
            }
        }
        return retval;
    }
})