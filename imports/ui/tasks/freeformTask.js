import './freeformTask.html'

Template.FreeformTask.onRendered(function() {
    var quill = new Quill(this.find('.instructions'), {
        theme: 'snow',
        readOnly: true,
        modules: {
            toolbar: false
        }
    });
    
    var delta = JSON.parse(this.data.instructions);

    quill.setContents(delta);
})