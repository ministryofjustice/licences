/* eslint-disable */

$(document).ready(init);

function init() {
    $('.otherResidentsInput').append(
        '<a class="button button-secondary addResidentButton smallMarginTop">Add another</a>'
    );
    $('.otherResidentsInput a').on('click', addResidentFields);
}

function addResidentFields() {
    var numberRegEx = /\d+/g;

    var group = $(this).closest('.otherResidentsInput');
    var finalResident = group.find('.otherResident:last');

    var newIndex = parseInt(finalResident.find('input.residentName').attr('name').match(numberRegEx), 10) + 1;
    var newName = finalResident.find('input.residentName').attr('name').replace(numberRegEx, newIndex);
    var newAge = finalResident.find('input.residentAge').attr('name').replace(numberRegEx, newIndex);
    var newRelation = finalResident.find('input.residentRelation').attr('name').replace(numberRegEx, newIndex);

    var newResident = finalResident.clone();
    newResident.find('input.residentName').attr('name', newName).val('');
    newResident.find('input.residentAge').attr('name', newAge).val('');
    newResident.find('input.residentRelation').attr('name', newRelation).val('');

    $(finalResident).after(newResident);
}
