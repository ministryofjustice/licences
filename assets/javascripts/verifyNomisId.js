/* eslint-disable */
function getNomisUserDetails() {

    const nomisUserName = $('#nomisId').val();

    $('#nomisUserName').text('');
    $('#nomisName').text('');

    $.get('/admin/roUsers/verify?nomisUserName=' + nomisUserName, function(userInfo) {

        $('#nomisUserName').text(userInfo.username);
        $('#nomisName').text(userInfo.name);

    }).fail(function(err) {
        $('#nomisUserName').text(err.statusText);
    });
}
