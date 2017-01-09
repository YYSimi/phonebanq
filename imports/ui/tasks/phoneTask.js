import { IsLoaded } from '../../api/isLoaded.js'

import './phoneTask.html'

Template.PhoneTask.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
});

Template.PhoneTask.onRendered(function() {
    Tracker.autorun( () => {
        if (IsLoaded.getQuillJSLoaded()) {
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
        }
    });
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
    }
});