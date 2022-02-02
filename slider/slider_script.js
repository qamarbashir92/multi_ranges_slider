// var startDate,endDate;
$( window ).resize(function() {
    all_slider_fns();
});

function sliderInit(){
    var d1=$('#val1').val();
    var d2=$('#val2').val();

    front_slider_script_fn('#slider',null,d1,d2,true);
}

var front_slider_script_fn=function(sDivId,ranges,sDate,eDate,isEdited){

    var startDate = new Date(sDate);
    var endDate = new Date(eDate);
    var max_days=dateToDays(startDate,endDate);
    var range= parseInt(max_days /4);
    // console.log(dateToYMD(addDays(startDate,'364')));
    var ranges_arr=[];
    if(ranges == null){
        for(var i=0;i<4;i++){
            ranges_arr.push(range*i);
        }
    }else{

    }
    // create slider
    $(sDivId).slider({
        // set min and maximum values
        // day hours in this example
        min: 0,
        max: parseFloat(max_days),
        // step
        // quarter of an hour in this example
        step: parseFloat(1),
        //scale bar ticks
        ticks: {
            // use default values
            // main tick is 1
            tickMain:1,
            // side tick is 0.5
            tickSide: 0.5,
            // show main label
            tickShowLabelMain: true,
            // don't show side label
            tickShowLabelSide: false,
            pStartDate:startDate,
            pEndDate:endDate
        },
        // current data
        handles: [
            {
                value: parseFloat(ranges_arr[0]),
                type: "r1"
            }, {
                value: parseFloat(ranges_arr[1]),
                type: "r2"
            }, {
                value: parseFloat(ranges_arr[2]),
                type: "r3"
            }, {
                value: parseFloat(ranges_arr[3]),
                type: "r4"
            }],
        isEditable:isEdited,
        // display type names
        showTypeNames: true,
        typeNames: {
            'r1': 'Strategic',
            'r2': 'Design and Planning',
            'r3': 'Construction',
            'r4': 'Delivery'
        },
        // main css class (of unset data)
        mainClass: 'sleep',
        // range
        range: false,
        // show tooltips
        tooltips: true,
        // slide callback
        slide: function(e, ui) {
            // console.log(e, ui);
        },
        // handle clicked callback
        handleActivated: function(event, handle) {
            return;
            // get select element
            var select = $(this).parent().find('.slider-controller select');
            // set selected option
            select.val(handle.type);
        }

    });

}

$(function() {
    // button for adding new ranges
    $('.slider-controller button.add').click(function(e) {
        e.preventDefault();
        // get slider
        var $slider = $('#slider');
        // trigger addHandle event
        $slider.slider('addHandle', {
            value: 12,
            type: $('.slider-controller select').val()
        });
        return false;
    });

    // button for removing currently selected handle
    $('.slider-controller button.remove').click(function(e) {
        e.preventDefault();
        // get slider
        var $slider = $('#slider');
        // trigger removeHandle event on active handle
        $slider.slider('removeHandle', $slider.find('a.ui-state-active').attr('data-id'));

        return false;
    });

    // when clicking on handler
    $(document).on('click', '.slider a', function() {
        var select = $('.slider-controller select');
        // enable if disabled
        //select.attr('disabled', false);
        alert($(this).attr('data-type'));
        select.val($(this).attr('data-type'));
        /*if ($(this).parent().find('a.ui-state-active').length)
          $(this).toggleClass('ui-state-active');*/
    });
});