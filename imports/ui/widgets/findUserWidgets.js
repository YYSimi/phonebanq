import './findUserWidgets.html'

Template.selectUser.onRendered(function() {
    this.$('.select-single-user').select2({
        minimumInputLength: 1,
        ajax: {
            delay: 250,
            transport: (params, success, failure) => {
                this.subscribe('findUsersByRegex', params.data.q, {
                    onReady: () => {
                        var regexStr = '^' + params.data.q;
                        success({results: Meteor.users.find({username: {$regex: regexStr}}, {sort: {username:1} }).fetch() } );
                     }
                });
            },
            processResults: function(data, params) {
                var results = [];
                _.each(data.results, function(result) {
                    results.push({
                        id: result._id,
                        text: result.username
                    });
                });

                return {
                    results: results
                }
            }
        }
    });
})

Template.selectUsers.onRendered(function() {
    this.$('.select-multiple-users').select2({
        minimumInputLength: 1,
        ajax: {
            delay: 250,
            transport: (params, success, failure) => {
                this.subscribe('findUsersByRegex', params.data.q, {
                    onReady: () => {
                        var regexStr = '^' + params.data.q;
                        success({results: Meteor.users.find({username: {$regex: regexStr}}, {sort: {username:1} }).fetch() } );
                     }
                });
            },
            processResults: function(data, params) {
                var results = [];
                _.each(data.results, function(result) {
                    results.push({
                        id: result._id,
                        text: result.username
                    });
                });

                return {
                    results: results
                }
            }
        }
    });    
})

Template.selectUsers.events({

})