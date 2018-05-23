/* eslint-disable */

$(document).ready(init);

function init() {
    $('#bespokeConditionsInput').append(
        '<a class="button button-secondary addBespokeButton smallMarginTop">Add another</a>'
    );
    $('#bespokeConditionsInput a').on('click', addBespokeFields);
    $('.bespokeTitleWrapper .removeWrapper').append('<a class="link removeBespoke">Remove</a>');
    $('.removeBespoke').on('click', removeBespoke);
}

function addBespokeFields() {

    var numberRegEx = /\d+/g;
    var indexRegEx = /bespokeConditions\[(.*?)]/g;

    var group = $(this).closest('#bespokeConditionsInput');
    var finalBespoke = group.find('.bespokeConditionsForm:last');

    var indexContainingSegment = finalBespoke.find('textarea.bespokeInput').attr('name').match(indexRegEx);
    var indexes = indexContainingSegment[0].match(numberRegEx);
    var newIndex = parseInt(indexes[indexes.length - 1]) + 1;

    var newTextbox = finalBespoke.find('textarea.bespokeInput').attr('name').replace(indexRegEx, "bespokeConditions[" + newIndex + "]");
    var newCheckbox = finalBespoke.find('input.bespokeCheckbox').attr('name').replace(indexRegEx, "bespokeConditions[" + newIndex + "]");
    var newCheckboxLabel = finalBespoke.find('label.bespokeCheckboxLabel').attr('for').replace(indexRegEx, "bespokeConditions[" + newIndex + "]");

    var newBespoke = finalBespoke.clone();
    newBespoke.find('textarea.bespokeInput').attr('name', newTextbox).attr('id', newTextbox).val('');
    newBespoke.find('input.bespokeCheckbox').attr('name', newCheckbox).prop('checked', false);
    newBespoke.find('label.bespokeCheckboxLabel').attr('for', newCheckboxLabel);
    $(finalBespoke).after(newBespoke);

    retitle();
    $('.removeBespoke').on('click', removeBespoke);
}

function removeBespoke() {
    $(this).off();
    var bespokeConditions = $('.bespokeConditionsForm');
    var closestBespoke = $(this).closest('.bespokeConditionsForm');

    if(bespokeConditions.length > 1) {
        closestBespoke.remove();
    } else {
        closestBespoke.find('textarea.bespokeInput').val('');
        closestBespoke.find('input.bespokeCheckbox').prop('checked', false)
    }

    retitle()
}

function retitle() {
    $('.bespokeConditionsForm').each(function(index) {
        $(this).find('.bespokeTitle').text('Bespoke condition ' + Number(index + 1));
    })
}
