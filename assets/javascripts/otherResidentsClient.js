/* eslint-disable */

$(document).ready(init)

function init() {
    $('.otherResidentsInput').append(
        '<a class="button button-secondary addResidentButton smallMarginTop">Add resident</a>'
    )
    $('.otherResidentsInput a').on('click', addResidentFields)
}

function addResidentFields() {
    var numberRegEx = /\d+/g
    var indexRegEx = /dents\]\[(.*?)\[/g

    var group = $(this).closest('.otherResidentsInput')
    var finalResident = group.find('.resident:last')

    var indexContainingSegment = finalResident
        .find('input.residentName')
        .attr('name')
        .match(indexRegEx)
    var indexes = indexContainingSegment[0].match(numberRegEx)
    var newIndex = parseInt(indexes[indexes.length - 1]) + 1

    var newName = finalResident
        .find('input.residentName')
        .attr('name')
        .replace(indexRegEx, 'dents][' + newIndex + '][')
    var newAge = finalResident
        .find('input.residentAge')
        .attr('name')
        .replace(indexRegEx, 'dents][' + newIndex + '][')
    var newRelation = finalResident
        .find('input.residentRelation')
        .attr('name')
        .replace(indexRegEx, 'dents][' + newIndex + '][')

    var newResident = finalResident.clone()
    newResident
        .find('input.residentName')
        .attr('name', newName)
        .val('')
    newResident
        .find('input.residentAge')
        .attr('name', newAge)
        .val('')
    newResident
        .find('input.residentRelation')
        .attr('name', newRelation)
        .val('')

    $(finalResident).after(newResident)
}
