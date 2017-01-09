import './congressionalInfoWidgets.html'

Template.nationalSenatorTableEntry.onCreated(() => {
    console.log(Template.instance().data);
})

Template.nationalRepresentativeTableEntry.onCreated(() => {
    console.log(Template.instance().data);
})

Template.officialRepresentationNav.onCreated(function() {
    this.currentTab = new ReactiveVar("nationalOfficials");
})

Template.officialRepresentationNav.helpers({
    tab: function() {
        return Template.instance().currentTab.get();
    }
})

Template.officialRepresentationNav.events({
    'click .nav-tabs li': function(evt, tmpl) {
        var currentTab = $(event.target).closest('li');
        currentTab.addClass( "active" );
        $(".nav-tabs li").not(currentTab).removeClass("active");
        tmpl.currentTab.set(currentTab.data("template"));
    }
})
