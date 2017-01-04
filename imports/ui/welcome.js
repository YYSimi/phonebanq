import './welcome.html';

Template.welcome.onRendered(() => {
    Tracker.autorun(() => {
        if (!!Session.get("congresspeople")) {
            console.log("fading");
            console.log($('#js-featurettes'));
            $('#js-featurettes').fadeOut(1000, () => {
                $('#js-anon-tasks').fadeIn(1000);
            });
        }
    })
})