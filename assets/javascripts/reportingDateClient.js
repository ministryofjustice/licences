/* eslint-disable */
// TODO look at minification and bundling

datepicker('#reportingDate', {
    formatter: function(textField, date) {
        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth()+1)).slice(-2);
        var year = date.getFullYear();
        textField.value = day + '/' + month + '/' + year;
    }
});
