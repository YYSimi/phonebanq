import './about.html';

// TODO:  Figure out how to move the nav link highlighting to a central place and avoid copypasta
Template.about.onRendered(() => {
    console.log(this.location.pathname);
    $('a[href="' + this.location.pathname + '"]').parents('li,ul').addClass('active');
})

Template.about.onDestroyed(() =>{
    console.log(this.location.pathname);
    $('a[href="' + this.location.pathname + '"]').parents('li,ul').removeClass('active');
});