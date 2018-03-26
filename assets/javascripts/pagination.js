/* eslint-disable */
$(document).ready(paginate());

function paginate() {
    var state = {
        numberToShow: 20,
        pageNumber: 0,
        totalNumber: 0,
        lastIndex: 0,
        firstIndex: 0,
        maxPageNumber: 0
    };

    function init() {
        state.totalNumber = $('.hdcEligible').length;
        state.maxPageNumber = Math.ceil(state.totalNumber / state.numberToShow) -1;

        if(state.numberToShow < state.totalNumber) {
            updateState();
            hideOutsideRange();
            addPaginationControls();
            hideUnnecessaryButtons();
            $('#pagination a').on('click', updatePage)
        }
    }

    function updateState() {
        state.firstIndex = state.pageNumber * state.numberToShow || 0;
        state.lastIndex = Math.min(
            state.firstIndex + state.numberToShow, state.totalNumber
        ) - 1;
    }

    function hideOutsideRange() {
        $('.hdcEligible').each(function(index) {
            var tooLow = index < state.firstIndex;
            var tooHigh = index > state.lastIndex;

            if(tooHigh || tooLow) {
                $(this).addClass('js-hidden');
            } else {
                $(this).removeClass('js-hidden');
            }
        });
    }

    function addPaginationControls() {

        $('#hdcEligiblePrisoners').after('' +
            '<nav id="pagination" role="navigation" aria-label="Pagination">' +
            '<a class="pub-c-pagination__link-title prev">' +
            '   <svg class="pub-c-pagination__link-icon prevArrow" xmlns="http://www.w3.org/2000/svg" height="13" width="17" viewBox="0 0 17 13">' +
            '       <path fill="currentColor" d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>' +
            '   </svg>' +
            '   Prev' +
            '<span id="prevLabel" class="pub-c-pagination__link-label">Page 0</span>' +
            '</a>' +
            '   <div id="paginationInfo"></div>' +
            '<a class="pub-c-pagination__link-title next">' +
            '   Next' +
            '<svg class="pub-c-pagination__link-icon nextArrow" xmlns="http://www.w3.org/2000/svg" height="13" width="17" viewBox="0 0 17 13">' +
            '       <path fill="currentColor" d="m10.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>' +
            '   </svg>' +
            '<span id="nextLabel" class="pub-c-pagination__link-label">Page 2</span></a></nav>'
        );
        addPaginationInfo();
    }

    function hideUnnecessaryButtons(){
        if (state.pageNumber >= state.maxPageNumber) {
            $('#pagination a.next').addClass('js-hidden')
        } else {
            $('#pagination a.next').removeClass('js-hidden')
        }

        if(state.pageNumber === 0) {
            $('#pagination a.prev').addClass('js-hidden')
        } else {
            $('#pagination a.prev').removeClass('js-hidden')
        }
    }

    function updatePage() {
        if($(this).hasClass('next')) {
            paginate(state.pageNumber + 1)
        } else if($(this).hasClass('prev')) {
            paginate(state.pageNumber - 1)
        }
    }

    function paginate(pageNumber) {
        if(pageNumber >= 0 && pageNumber <= state.maxPageNumber) {
            state.pageNumber = pageNumber;
            updateState();
            updateView();
        }
    }

    function updateView() {
        hideOutsideRange();
        addPaginationInfo();
        hideUnnecessaryButtons();
    }

    function addPaginationInfo() {
        $("#paginationInfo").html('Offenders '+String(state.firstIndex+1)+' - '+String(state.lastIndex+1)+' of '+String(state.totalNumber));
        $("#prevLabel").text('Page '+String(state.pageNumber));
        $("#nextLabel").text('Page '+String(state.pageNumber + 2));
    }

    return init
}
