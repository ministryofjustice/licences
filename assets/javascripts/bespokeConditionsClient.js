/* eslint-disable */

$(document).ready(init)

function init() {
    $('#bespokeConditionsForm').append(
        '<a class="button button-secondary addBespokeButton smallMarginTop">Add another</a>'
    )
    $('#bespokeConditionsForm a').on('click', addBespokeFields)
    $('.bespokeTitleWrapper .removeWrapper').append('<div><a class="link removeBespoke">Remove</a>')
    $('.removeBespoke').on('click', removeBespoke)
}

function addBespokeFields() {
    var numberRegEx = /\d+/g
    var indexRegEx = /bespokeConditions\[(.*?)]/g

    var group = $(this).closest('#bespokeConditionsInput')
    var finalBespoke = group.find('.bespokeConditionsForm:last')

    var indexContainingSegment = finalBespoke
        .find('textarea.bespokeInput')
        .attr('name')
        .match(indexRegEx)
    var indexes = indexContainingSegment[0].match(numberRegEx)
    var newIndex = parseInt(indexes[indexes.length - 1]) + 1

    var newTextbox = finalBespoke
        .find('textarea.bespokeInput')
        .attr('name')
        .replace(indexRegEx, 'bespokeConditions[' + newIndex + ']')
    var newApprovedYes = finalBespoke
        .find('#bespokeApprovedYes input.bespokeApproved')
        .attr('name')
        .replace(indexRegEx, 'bespokeConditions[' + newIndex + ']')
    var newApprovedNo = finalBespoke
        .find('#bespokeApprovedNo input.bespokeApproved')
        .attr('name')
        .replace(indexRegEx, 'bespokeConditions[' + newIndex + ']')

    var newBespoke = finalBespoke.clone()
    newBespoke
        .find('textarea.bespokeInput')
        .attr('name', newTextbox)
        .attr('id', newTextbox)
        .val('')
    newBespoke
        .find('#bespokeApprovedYes input.bespokeApproved')
        .attr('name', newApprovedYes)
        .attr('id', newApprovedYes)
        .prop('checked', false)
    newBespoke
        .find('#bespokeApprovedNo input.bespokeApproved')
        .attr('name', newApprovedNo)
        .attr('id', newApprovedNo)
        .prop('checked', false)
    newBespoke.find('label.bespokeCheckboxLabelYes').attr('for', newApprovedYes)
    newBespoke.find('label.bespokeCheckboxLabelNo').attr('for', newApprovedNo)
    $(finalBespoke).after(newBespoke)

    $('.removeBespoke').on('click', removeBespoke)
}

function removeBespoke() {
    $(this).off()
    var bespokeConditions = $('.bespokeConditionsForm')
    var closestBespoke = $(this).closest('.bespokeConditionsForm')

    if (bespokeConditions.length > 1) {
        closestBespoke.remove()
    } else {
        closestBespoke.find('textarea.bespokeInput').val('')
        closestBespoke.find('input.bespokeCheckbox').prop('checked', false)
    }
}
