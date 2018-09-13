/* eslint-disable */
function getNomisUserDetails() {

    const nomisUserName = $('#nomisId').val();

    $('#nomisUserName').text('');
    $('#nomisFirstName').text('');
    $('#nomisLastName').text('');

    $.get('/admin/roUsers/verify?nomisUserName=' + nomisUserName, function(userInfo) {

        $('#nomisUserName').text(userInfo.username);
        $('#nomisFirstName').text(userInfo.firstName);
        $('#nomisLastName').text(userInfo.lastName);

    }).fail(function(err) {
        $('#nomisUserName').text(err.statusText);
    });
}
