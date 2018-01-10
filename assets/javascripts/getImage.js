function getAndReplaceImage(id) {
    $.get('image/'+id, function(data) {
        if(data.image) {
            $('#prisonerImage').attr('src', data.image);
        }
    });
}
