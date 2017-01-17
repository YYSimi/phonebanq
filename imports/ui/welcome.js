import './welcome.html';

Template.welcome.onRendered(() => {
    Tracker.autorun(() => {
        if (!!Session.get("congresspeople")) {
            $('#js-featurettes').fadeOut(1000, () => {
                $('#js-anon-tasks').fadeIn(1000);
            });
        }
    })
})