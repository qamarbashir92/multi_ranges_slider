
/*
 * Edited jQuery UI Slider
 *
 * Depends:
 *	ui.core.js
 */

(function($) {
    $.widget('ui.slider', $.ui.mouse, {
        getter: 'value values',
        version: '@VERSION',
        eventPrefix: 'slide',
        options: {
            animate: false,
            delay: 0,
            distance: 0,
            handles: null,
            activeHandle: 0,
            max: 0,
            min: 0,
            orientation: 'horizontal',
            mainClass: 'mainClass',
            range: false,
            typeNames: null,
            showTypeNames: false,
            type: 'number',
            ranges: null,
            step: 0,
            ticks: {
                // use default values
                // main tick is 1
                tickMain : 0,
                // side tick is 0.5
                tickSide : 0,
                // show main label
                tickShowLabelMain : true,
                // don't show side label
                tickShowLabelSide : false
            },
            value: 0,
            values: null,
            tooltips: null
        },

        _strpad: function(inputString, chars, padString) {
            var result = padString + inputString;
            var remFromLeft = result.length - chars;
            return result.substr(remFromLeft);
        },
        // get time from float (e.g. 22.5 => 22:30)
        _getTimeStringFromFloat: function(time) {
            time = parseFloat(time);
            // hours from the float
            var hours = Math.floor(time);
            // minutes from the float
            var minutes = (time - hours) * 60;
            // start time as string
            return (hours + ':' + this._strpad(minutes, 2, '0'));
        },

        _init: function() {

            var self = this, o = this.options;
            this._keySliding = false;
            this._handleIndex = null;
            this._detectOrientation();
            this._mouseInit();

            // add slider wrapper
            // $('<div class="wrapper"></div>').appendTo(this.element);
            // alert("qb");
            var myDiv = $('.ticks');
            if ( myDiv.length== '0'){
                // add tick wrapper
                $('<div class="ticks "><hr class="slider_line"></div>').appendTo(this.element);
            }else{
                myDiv.html('');
                myDiv.append('<hr class="slider_line">');
            }

            // TODO
            // redo classes
            this.element
                .addClass('ui-slider'
                    + ' ui-slider-' + this.orientation
                    + ' ' + o.mainClass
                    + ' ui-widget'
                    + ' ui-widget-content'
                    + ' ui-corner-all');

            // only when one range present
            /*this.range = $([]);
            if (o.range) {
                // add range wrapper
                this.range = $('<div></div>');
                if (o.range === true) {
                    if (!o.values) o.values = [this._valueMin(), this._valueMin()];
                    if (o.values.length && o.values.length < 2) {
                        o.values = [o.values[0], o.values[0]];
                    }
                }
                // append to slider
                this.range
                .appendTo(this.element)
                .addClass("ui-slider-range");

                if (o.range == "min" || o.range == "max") {
                    this.range.addClass("ui-slider-range-" + o.range);
                }

                // note: this isn't the most fittingly semantic framework class for this element,
                // but worked best visually with a variety of themes
                this.range.addClass("ui-widget-header");
            }*/
            /*
            // add handles for present values
            if (o.values && o.values.length) {
                o.ranges = new Array();
                while ($(".ui-slider-handle", this.element).length < o.values.length) {
                    $('<a href="#"></a>')
                    .appendTo(this.element)
                    .addClass("ui-slider-handle");
                    var range = $('<div></div>');
                    range
                    .appendTo(this.element)
                    .addClass("ui-slider-range").addClass("ui-widget-header");
                    o.ranges.push(range);
                }
            }
            **/



            // add base handler
            /*
            if ($(".ui-slider-handle", this.element).length == 0)
                $('<a href="#"></a>')
                .appendTo(this.element)
                .addClass("ui-slider-handle");
            */
            // create handles
            this._refreshHandles();

            // create ticks if option is not disabled
            if (o.ticks !== false) {
               this._createTicks();
            }
            // call refresh value
            this._refreshValue();

            this._activateHandle(o.activeHandle);

        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function() {
            // _super and _superApply handle keeping the right this-context
            this._superApply(arguments);
            //this._refresh();
        },
        // _setOption is called for each individual option that is changing
        _setOption: function(key, value) {
            this._super(key, value);
        },

        // create ticks
        _createTicks: function() {

            var o = this.options;
           // console.log(o.ticks.pStartDate);
            // minimum
            var min = this._valueMin();
            // maximum
            var max = this._valueMax();
            var tickWapper = $(this.element).find('div.ticks');
            // count spacing
            // screen width
            var pDivW= $(".ticks").width() / $('.ticks').parent().width() * 100;
            var chkW= ( pDivW > 100) ? 100:pDivW;
            // $('.ticks').css('width',(chkW)+'%');
            var spacing =  (chkW) / (max - min);
            // console.log("Spacing: "+spacing);
            // console.log("min: "+min+"-----max: "+max);
            var scaleRes=scaleBarValues(o.ticks.pStartDate,max);
            // console.log(scaleRes);
            var TodayDateNo=GetTodayDateNo(o.ticks.pStartDate);
            // console.log(TodayDateNo);
            // create ticks
            var tempIdx=0,liToMD=0; // liToMD match to recent month days
            for (var i=min ; i <=max ; i = i+1){
                // console.log(i);
                // parent big tick
                if( !$.isNumeric( scaleRes[tempIdx]) ){
                    $('<span class="slider-tick-mark-main" id="main_tick_'+i+'"></span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
                    if (o.ticks.tickShowLabelMain) {
                        $('<span class="slider-tick-mark-main-text" id="main_tick_txt_'+i+'">' + monthNames(scaleRes[tempIdx]) + '</span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                    }
                    tempIdx=tempIdx+1;
                }
                else{ // child small tick
                    // console.log(max+"-----"+i);
                    var crrMDays=scaleRes[tempIdx];
                    if( liToMD-crrMDays === 0){
                        // console.log(tempIdx+"-----"+i);
                        liToMD=0;
                        if($.isNumeric( scaleRes[tempIdx+1])) {
                            $('<span class="slider-tick-mark-side" id="small_tick_'+i+'"></span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                            if (o.ticks.tickShowLabelSide) {
                                $('<span class="slider-tick-mark-side-text" id="small_tick_txt_'+i+'">' + i + '</span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                            }
                        }
                        tempIdx=tempIdx+1;
                    }
                }
                liToMD=liToMD+1;
                /// current date helight
                if(TodayDateNo === i){
                    $('<span class="slider-tick-mark-side_current" id="small_tick_crnt_'+i+'"></span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                    if (o.ticks.tickShowLabelSide) {
                        $('<span class="slider-tick-mark-side-text" id="small_tick_crnt_txt_'+i+'">' + i + '</span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                    }
                }
                // at end scale bar label
                if(i === max){
                    // console.log(max+"-----"+i);
                    $('<span class="slider-tick-mark-main" id="main_tick_'+i+'"></span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
                    if (o.ticks.tickShowLabelMain) {
                        $('<span class="slider-tick-mark-main-text" id="main_tick_txt_'+i+'">' + monthNames(scaleRes[scaleRes.length -1] ) + '</span>').css('left', (spacing * i) + '%').appendTo(tickWapper);
                    }
                }
            }

            $(".ticks>span").each(function (i) {
                // console.log($(this).position().left);
                var v1=$(this).position().left;
                $(this).css("left","0");
                var v2=$(this).position().left;
                $(this).css("left",(v1-(v2*2))+"px");
            });

            // for (var i = min; i <= max; i = i+1) { // (o.ticks.tickSide)
            //     var main_tick_bar= (i / o.ticks.tickMain) % 1 ; //// o.ticks.tickMain
            //     // console.log( main_tick_bar);
            //     if ( main_tick_bar === 0) {
            //         $('<span class="slider-tick-mark-main"></span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
            //         if (o.ticks.tickShowLabelMain)
            //             $('<span class="slider-tick-mark-main-text">' + i + '</span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
            //     }
            //     else {
            //         $('<span class="slider-tick-mark-side"></span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
            //         if (o.ticks.tickShowLabelSide)
            //             $('<span class="slider-tick-mark-side-text">' + i + '</span>').css('left', (spacing * i) +  '%').appendTo(tickWapper);
            //     }
            //
            // }

        },

        // add handle
        addHandle: function(handle) {
            var self = this, o = this.options;
            // add handle to handle list
            o.handles.push(handle);
            // refresh handles
            this._refreshHandles();
            // refresh values
            this._refreshValue();
        },
        // refresh handles
        _refreshHandles: function() {
            var self = this, o = this.options;
            // remove all handle elements
            $('.ui-slider-handle', this.element).remove();
            // remove all range elements
            $('.ui-slider-range', this.element).remove();

            // add handles for present values
            if (o.handles && o.handles.length) {
                // store this element
                var elem = self.element;

                // sort the handles by value
                o.handles.sort(function(a, b) {
                    return a.value - b.value;
                });
                o.values = [];

                // go through all handles
                $.each(o.handles, function(i) {
                    o.values.push(o.handles[i].value);

                    // alert(i);
                    // qb
                    // create handle element
                    var handle = $('<a href="#"></a>');
                    // append with classes
                    handle.appendTo(elem)
                        .addClass('ui-slider-handle')
                        .attr('data-id', i)
                        .attr('data-value', o.handles[i].value)
                        .addClass('ui-state-default'
                            + ' ui-corner-all');

                    // if handle type was set
                    if (o.handles[i].type !== null) {
                        handle.attr('data-type', o.handles[i].type)
                            .addClass(o.handles[i].type);
                    }

                    // qb length-1
                    // alert(o.handles.length);
                    // create ranges for all handles
                    if (i < o.handles.length-1) {
                        // create range element
                        var range = $('<div></div>');
                        // append with classes
                        range
                            .appendTo(elem)
                            .addClass('ui-slider-range').addClass('ui-widget-header')
                            .attr('data-value', o.handles[i].value)
                            .attr('data-id', i);

                        // if handle type was set
                        if (o.handles[i].type !== null) {
                            range.attr('data-type', o.handles[i].type)
                                .addClass(o.handles[i].type);
                        }
                    }


                });
            }


            this.handles = $('a.ui-slider-handle', this.element);
            this.range = $('div.ui-slider-range', this.element);

            this.handle = this.handles.eq(0);
            // console.log(this.range.eq(0));
            // this.range = this.range.eq(1);

            this.handles.filter('a')
                .click(function(event) {

                    event.preventDefault();
                    // activate handle
                    self._activateHandle($(this).attr('data-id'));

                    //$(this).addClass('ui-state-active');
                })
                .hover(function() {
                    $(this).addClass('ui-state-hover');
                }, function() {
                    $(this).removeClass('ui-state-hover');
                })
                .focus(function() {
                    $('.ui-slider .ui-state-focus', this.element).removeClass('ui-state-focus');
                    $(this).addClass('ui-state-focus');
                })
                .blur(function() {
                    $(this).removeClass('ui-state-focus');
                });

            /// qb
                this.range.filter('div')
                .click(function(event) {

                    event.preventDefault();
                    // activate handle
                    self._activateHandle($(this).attr('data-id'));

                    //$(this).addClass('ui-state-active');
                })
                .hover(function() {
                    $(this).addClass('ui-state-hover');
                }, function() {
                    $(this).removeClass('ui-state-hover');
                })
                .focus(function() {
                    $('.ui-slider .ui-state-focus', this.element).removeClass('ui-state-focus');
                    $(this).addClass('ui-state-focus');
                })
                .blur(function() {
                    $(this).removeClass('ui-state-focus');
                });

                //// range handel adjusment show hide
            this.handles.each(function(i) {
                // console.log(i);
                // qb
                if( i==0 ){
                    $(this).hide();
                }else if (!o.isEditable){
                    $(this).hide();
                }
                $(this).data('index.ui-slider-handle', i);
            });

            // this.range.each(function(i) {
            //     // console.log(i);
            //     // qb
            //     $(this).data('index.ui-slider-range', i);
            // });

            if (this.options.tooltips) {
                this.handles.append('<span class="ui-slider-tooltip ui-widget-content ui-corner-all"></span>');
                this.range.append('<span class="ui-slider-tooltip ui-widget-content ui-corner-all"></span>');
            }

            // keyboard control
            this.handles.keydown(function(event){
                var ret = true;

                var index = $(this).data('index.ui-slider-handle');

                if (self.options.disabled)
                    return;

                switch (event.keyCode) {
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.UP:
                    case $.ui.keyCode.RIGHT:
                    case $.ui.keyCode.DOWN:
                    case $.ui.keyCode.LEFT:
                        ret = false;
                        if (!self._keySliding) {
                            self._keySliding = true;
                            $(this).addClass('ui-state-active');
                            self._start(event, index);
                        }
                        break;
                }

                var curVal, newVal, step = self._step();
                if (self.options.values && self.options.values.length) {
                    curVal = newVal = self.values(index);
                } else {
                    curVal = newVal = self.value();
                }

                switch (event.keyCode) {
                    case $.ui.keyCode.HOME:
                        newVal = self._valueMin();
                        break;
                    case $.ui.keyCode.END:
                        newVal = self._valueMax();
                        break;
                    case $.ui.keyCode.UP:
                    case $.ui.keyCode.RIGHT:
                        if(curVal == self._valueMax()) return;
                        newVal = curVal + step;
                        break;
                    case $.ui.keyCode.DOWN:
                    case $.ui.keyCode.LEFT:
                        if(curVal == self._valueMin()) return;
                        newVal = curVal - step;
                        break;
                }

                self._slide(event, index, newVal);

                return ret;

            }).keyup(function(event) {

                var index = $(this).data('index.ui-slider-handle');

                if (self._keySliding) {
                    self._stop(event, index);
                    self._change(event, index);
                    self._keySliding = false;
                    $(this).removeClass('ui-state-active');
                }

            });
        },
        // activate handle
        _activateHandle: function(index) {

            // all handles
            this.handles = $('a.ui-slider-handle', this.element);
            // remove active handle indicator
            $(this.handles).removeClass('ui-state-active');

            // get the activated handle
            var handle = $(this.handles).eq(index);
            // add class
            // qb
           // handle.addClass('ui-state-active').focus();

            // get value
            var value = handle.attr('data-value');
            // get type
            var type = handle.attr('data-type');

            // set active handle
            this.options.activeHandle = index;

            // trigger the handleActivated event
            this._trigger('handleActivated', null, {
                index: index,
                value: value,
                type: type
            });
        },

        // edit handle, change handle type
        editHandle: function(index, type) {
            // change handle type in options
            this.options.handles[index].type = type;
            // refresh handles
            this._refreshHandles();
            // refresh values
            this._refreshValue();
            // activate handle
            this._activateHandle(this.options.activeHandle);
        },

        // remove handle
        removeHandle: function(index) {
            // remove from options
            this.options.handles.splice(index, 1);
            // from values
            this.options.values.splice(index, 1);
            // remove element
            this.handles.eq(index).remove();
            // refresh handles
            this._refreshHandles();
            // refresh values
            this._refreshValue();
        },

        destroy: function() {

            this.handles.remove();
            this.range.remove();

            this.element
                .removeClass('ui-slider'
                    + ' ui-slider-horizontal'
                    + ' ui-slider-vertical'
                    + ' ui-slider-disabled'
                    + ' ui-widget'
                    + ' ui-widget-content'
                    + ' ui-corner-all')
                .removeData('slider')
                .unbind('.slider');

            this._mouseDestroy();

        },

        _mouseCapture: function(event) {
            // return ;
            // console.log(event);
            /// disable start range to mouse click
            // console.log($(event.target).attr('data-type'));
            var o = this.options;
            if(!o.isEditable){
                return;
            }
            var range=$(event.target).attr('data-type');
            // console.log(range);
            if(range === 'r1' || typeof range == 'undefined'){
                return;
            }

            if (o.disabled)
                return false;

            this.elementSize = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };
            this.elementOffset = this.element.offset();

            var position = {
                x: event.pageX,
                y: event.pageY
            };
            var normValue = this._normValueFromMouse(position);

            var distance = this._valueMax() - this._valueMin() + 1, closestHandle;
            var self = this, index;
            // console.log(self._handleIndex);

            // if there is an active handle, set that
            if (self._handleIndex !== null)
                closestHandle = $(self.handles[self._handleIndex]);
            else {
                self.handles.each(function(i) {
                    var thisDistance = Math.abs(normValue - self.values(i));
                    if (distance > thisDistance) {
                        distance = thisDistance;
                        closestHandle = $(this);
                        index = i;
                    }
                });
            }

            // workaround for bug #3736 (if both handles of a range are at 0,
            // the first is always used as the one with least distance,
            // and moving it is obviously prevented by preventing negative ranges)
            if(o.range === true && this.values(1) === o.min) {
                closestHandle = $(this.handles[++index]);
            }

            this._start(event, index);

            self._handleIndex = index;

            this._activateHandle($(closestHandle).attr('data-id'));

            // remove active class for all handles
            /*this.handles.removeClass('ui-state-active');
            // add to closest handle
            closestHandle
            .addClass('ui-state-active')
            .focus();*/

            var offset = closestHandle.offset();
            var mouseOverHandle = !$(event.target).parents().andSelf().is('.ui-slider-handle');
            this._clickOffset = mouseOverHandle ? {
                left: 0,
                top: 0
            } : {
                left: event.pageX - offset.left - (closestHandle.width() / 2),
                top: event.pageY - offset.top
                    - (closestHandle.height() / 2)
                    - (parseInt(closestHandle.css('borderTopWidth'),10) || 0)
                    - (parseInt(closestHandle.css('borderBottomWidth'),10) || 0)
                    + (parseInt(closestHandle.css('marginTop'),10) || 0)
            };

            normValue = this._normValueFromMouse(position);
            this._slide(event, index, normValue);
            return true;

        },

        _mouseStart: function(event) {
            return true;
        },

        // mouse drag handler
        _mouseDrag: function(event) {
            // qb
            var o = this.options;
            if(!o.isEditable){
                return false;
            }
            if (this._handleIndex == '0') {
                this._slide(event, this._handleIndex, 0);
                return;
            }

            var position = {
                x: event.pageX,
                y: event.pageY
            };
            var normValue = this._normValueFromMouse(position);
            // console.log(normValue);

            this._slide(event, this._handleIndex, normValue);

            return false;

        },

        // mouse stop drag handler
        _mouseStop: function(event) {

            //this.handles.removeClass('ui-state-active');
            this._stop(event, this._handleIndex);
            this._change(event, this._handleIndex);
            this._handleIndex = null;
            this._clickOffset = null;

            return false;

        },

        _detectOrientation: function() {
            this.orientation = this.options.orientation == 'vertical' ? 'vertical' : 'horizontal';
        },

        _normValueFromMouse: function(position) {

            var pixelTotal, pixelMouse;
            if ('horizontal' == this.orientation) {
                pixelTotal = this.elementSize.width;
                pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
            } else {
                pixelTotal = this.elementSize.height;
                pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
            }

            var percentMouse = (pixelMouse / pixelTotal);
            if (percentMouse > 1) percentMouse = 1;
            if (percentMouse < 0) percentMouse = 0;
            if ('vertical' == this.orientation)
                percentMouse = 1 - percentMouse;

            var valueTotal = this._valueMax() - this._valueMin(),
                valueMouse = percentMouse * valueTotal,
                valueMouseModStep = valueMouse % this.options.step,
                normValue = this._valueMin() + valueMouse - valueMouseModStep;

            if (valueMouseModStep > (this.options.step / 2))
                normValue += this.options.step;

            // Since JavaScript has problems with large floats, round
            // the final value to 5 digits after the decimal point (see #4124)
            return parseFloat(normValue.toFixed(5));

        },

        _start: function(event, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index)
                uiHash.values = this.values()
            }
            this._trigger('start', event, uiHash);
        },

        _slide: function(event, index, newVal) {
            // qb
            var o = this.options;
            if(!o.isEditable){
                return false;
            }

            var handle = this.handles[index];

            if (this.options.values && this.options.values.length) {

                var oldVal = this.values(index);

                if (oldVal < newVal && index < this.options.values.length - 1 && newVal >= this.options.values[index+1])
                    newVal = this.options.values[index+1] - this.options.step;

                if (oldVal > newVal && index > 0 && newVal <= this.options.values[index-1])
                    newVal = this.options.values[index-1] + this.options.step;

                if (newVal != oldVal) {
                    var newValues = this.values();
                    newValues[index] = newVal;
                    // A slide can be canceled by returning false from the slide callback
                    var allowed = this._trigger('slide', event, {
                        handle: this.handles[index],
                        value: newVal,
                        values: newValues
                    });
                    if (allowed !== false) {
                        this.values(index, newVal, ( event.type == 'mousedown' && this.options.animate ), true);
                    }
                }

            } else {

                if (newVal != this.value()) {
                    // A slide can be canceled by returning false from the slide callback
                    var allowed = this._trigger('slide', event, {
                        handle: this.handles[index],
                        value: newVal
                    });
                    if (allowed !== false) {
                        this._setData('value', newVal, ( event.type == 'mousedown' && this.options.animate ));
                    }

                }

            }

        },

        _stop: function(event, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index)
                uiHash.values = this.values()
            }
            this._trigger('stop', event, uiHash);
        },

        _change: function(event, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index)
                uiHash.values = this.values()
            }
            this._trigger('change', event, uiHash);
        },

        value: function(newValue) {

            if (arguments.length) {
                this._setData('value', newValue);
                this._change(null, 0);
            }

            return this._value();

        },

        values: function(index, newValue, animated, noPropagation) {

            if (arguments.length > 1) {
                this.options.values[index] = newValue;
                this._refreshValue(animated);
                if(!noPropagation) this._change(null, index);
            }

            if (arguments.length) {
                if (this.options.values && this.options.values.length) {
                    return this._values(index);
                } else {
                    return this.value();
                }
            } else {
                return this._values();
            }

        },

        _setData: function(key, value, animated) {

            $.widget.prototype._setData.apply(this, arguments);

            switch (key) {
                case 'orientation':

                    this._detectOrientation();

                    this.element
                        .removeClass('ui-slider-horizontal ui-slider-vertical')
                        .addClass('ui-slider-' + this.orientation);
                    this._refreshValue(animated);
                    break;
                case 'value':
                    this._refreshValue(animated);
                    break;
            }

        },

        _step: function() {
            var step = this.options.step;
            return step;
        },

        _value: function() {

            var val = this.options.value;
            if (val < this._valueMin()) val = this._valueMin();
            if (val > this._valueMax()) val = this._valueMax();

            return val;

        },

        _values: function(index) {

            if (arguments.length) {
                var val = this.options.values[index];
                if (val < this._valueMin()) val = this._valueMin();
                if (val > this._valueMax()) val = this._valueMax();

                return val;
            } else {
                return this.options.values;
            }

        },

        _valueMin: function() {
            var valueMin = this.options.min;
            return valueMin;
        },

        _valueMax: function() {
            var valueMax = this.options.max;
            return valueMax;
        },

        // refresh value function
        _refreshValue: function(animate) {
            var oRange = this.options.range, o = this.options, self = this;
            var numOptions = this.options.values ? this.options.values.length : 0;

            if (numOptions) {
                // minimum
                var min = this._valueMin();
                // maximum
                var max = this._valueMax();
                // whole range
                var diff = this._valueMax() - this._valueMin();
                /*if (oRange === true) {
                    var firstHandlePercent = (this.values(0) - min) / diff * 100;
                    var rangePercent = (this.values(numOptions-1) - min) / diff * 100 - firstHandlePercent;
                    if (self.orientation == 'horizontal') {
                        self.range.stop(1,1)[animate ? 'animate' : 'css']({
                            left: firstHandlePercent + '%', 
                            width: rangePercent + '%'
                        }, o.animate);
                    } else {
                        self.range.stop(1,1)[animate ? 'animate' : 'css']({
                            bottom: firstHandlePercent + '%', 
                            height: rangePercent + '%'
                        }, o.animate);
                    }
                }*/
                var allHandles = this.handles;
                var allranges = this.range;
                // all handles values chnges inner html span
                this.handles.each(function(i, j) {

                    var valPercent = (self.values(i) - min) / diff * 100;
                    // value of handler in percent
                    //var valPercent = ($(this).attr('data-value') - min) / diff * 100;
                    var _set = {};
                    _set[self.orientation == 'horizontal' ? 'left' : 'bottom'] = valPercent + '%';
                    $(this).stop(1,1)[animate ? 'animate' : 'css'](_set, o.animate);

                    // add attribute with value
                    $(this).attr('data-value', self.values(i));
                   o.handles[i].value = self.values(i);
                    // add attribute with value
                    //// qb
                    $(allranges[i]).attr('data-value', self.values(i));
                    // allranges[i].value = self.values(i);

                });
                // qb
                // all handles for tooltip fill
                this.handles.each(function(i, j) {
                    // show tooltip
                    if (o.tooltips) {
                        //$('.ui-slider-tooltip', this).text(o.tooltips[self.values(i)]);
                        var text = '';
                        // if not last show range to next
                        if (i < allHandles.length-1) {
                            if (o.showTypeNames) {
                                text += o.typeNames[$(this).attr('data-type')];
                            }
                            // console.log(allHandles.eq(i+1).attr('data-value'));
                            if (o.type == 'number')
                                text += ' '+dateToYMD(addDays(o.ticks.pStartDate,$(this).attr('data-value') ))+' - '+dateToYMD(addDays(o.ticks.pStartDate, allHandles.eq(i+1).attr('data-value') ));
                                // text += ' '+$(this).attr('data-value')+' - '+allHandles.eq(i+1).attr('data-value');
                            else if (o.type == 'time')
                                text += ' '+self._getTimeStringFromFloat($(this).attr('data-value'))+' - '+self._getTimeStringFromFloat(allHandles.eq(i+1).attr('data-value'));

                            ///// qb
                            // console.log(allranges);
                            $('.ui-slider-tooltip',allranges[i]).text(text);
                        }
                        // if last show range from previous
                        else {
                            if (o.showTypeNames) {
                               text += o.typeNames[$(this).attr('data-type')];
                            }
                            if (o.type == 'number')
                                text += ' '+dateToYMD(addDays(o.ticks.pStartDate,$(this).attr('data-value') ))+' - '+dateToYMD(addDays(o.ticks.pStartDate,o.max ));
                                // text += ' '+$(this).attr('data-value')+' - '+o.max;
                            if (o.type == 'time')
                                text += ' '+self._getTimeStringFromFloat($(this).attr('data-value')) + ' - 0:00';
                        }
                       $('.ui-slider-tooltip',this).text(text); ///

                        //$('.ui-slider-tooltip', this).text(self._getTimeStringFromFloat(allHandles.eq(i-1).attr('data-value'))+' - '+self._getTimeStringFromFloat($(this).attr('data-value')));
                        /*
                            if (i < allHandles.length-1)
                                $('.ui-slider-tooltip', this).text(self.values(i)+' - '+self.values(i+1));
                            // if last show range from previous
                            else
                                $('.ui-slider-tooltip', this).text(self.values(i-1)+' - '+self.values(i));
                             */
                    }
                });

                // get all range elements
                var ranges = $('.ui-slider-range', this.element);
                // go through all ranges
                ranges.each(function(i, j) {
                    // get value of this handler
                    var valPercent = (self.values(i) - min) / diff * 100;
                    // get value of nex handler
                    // if not last, get next
                    if (i < ranges.length)
                        var nextPercent = (self.values(i+1) - min) / diff * 100;
                    // else 100%
                    else
                        var nextPercent = 100;
                    // get range width
                    var rangePercent = (nextPercent - valPercent);
                    // set style by orientation
                    if (self.orientation == 'horizontal') {
                        $(this).css({
                            left: valPercent + '%',
                            width: rangePercent + '%'
                        });
                    } else {
                        $(this).css({
                            bottom: valPercent + '%',
                            height: rangePercent + '%'
                        });
                    }
                    /*
                        $(this).removeClass('minimum');
                        $(this).removeClass('saving');
                        $(this).removeClass('comfort');
                        $(this).addClass($('.ui-slider-handle:eq('+i+')', self.element).attr('data-temperature'));    */

                });
            }
            else {
                var value = this.value(),
                    valueMin = this._valueMin(),
                    valueMax = this._valueMax(),
                    valPercent = valueMax != valueMin
                        ? (value - valueMin) / (valueMax - valueMin) * 100
                        : 0;
                var _set = {};
                _set[self.orientation == 'horizontal' ? 'left' : 'bottom'] = valPercent + '%';
                this.handle.stop(1,1)[animate ? 'animate' : 'css'](_set, o.animate).find('.ui-slider-tooltip').text(o.tooltips ? o.tooltips[self.value()] : '');

                (oRange == 'min') && (this.orientation == 'horizontal') && this.range.stop(1,1)[animate ? 'animate' : 'css']({
                    width: valPercent + '%'
                }, o.animate);
                (oRange == 'max') && (this.orientation == 'horizontal') && this.range[animate ? 'animate' : 'css']({
                    width: (100 - valPercent) + '%'
                }, {
                    queue: false,
                    duration: o.animate
                });
                (oRange == 'min') && (this.orientation == 'vertical') && this.range.stop(1,1)[animate ? 'animate' : 'css']({
                    height: valPercent + '%'
                }, o.animate);
                (oRange == 'max') && (this.orientation == 'vertical') && this.range[animate ? 'animate' : 'css']({
                    height: (100 - valPercent) + '%'
                }, {
                    queue: false,
                    duration: o.animate
                });
            }

        }

    });

})(jQuery);

var scaleBarValues=function(startDate,max) {
    var monthArr=groupArray( numberToDatesArr(startDate,max),'keys' );
    var monthDaysArr=groupArray( numberToDatesArr(startDate,max),'values' );
    var cnt=monthArr.length;
    var fnlRes;
    // console.log(monthArr);
    // console.log(monthDaysArr);
    if( cnt < 12){
        // for(var i=0;i<cnt;i=i+1){
        //     monthDaysArr.addArrValueAtIndex( i*2 ,monthArr[i] );
        // }
        monthDaysArr.addArrValueAtIndex( 0,monthArr[ 0] );
        monthDaysArr.addArrValueAtIndex( (monthDaysArr.length+1),monthArr[ (monthArr.length - 1)] );
        fnlRes=monthDaysArr;
    }
    else if( cnt === 12){
        var intrvl=cnt/4;
        for(var i=0;i<=intrvl;i=i+1){
            // console.log( (i*(intrvl+1)) );
            monthDaysArr.addArrValueAtIndex( (i*(intrvl+1)),monthArr[i*intrvl] );
        }
        monthDaysArr.addArrValueAtIndex( (monthDaysArr.length+1),monthArr[ (monthArr.length - 1)] );
        fnlRes=monthDaysArr;
    }
    else if( cnt > 12){
        // var noYears=cnt/12;
        // var tYear=parseInt(noYears);
        // var tMonths=Math.ceil(cnt-(tYear*12));
        // console.log("Total : "+ noYears + " Years: "+tYear+" Months: "+tMonths );
        var MtY=[];
        for(var i=0;i<cnt;i=i+1){
            MtY.push(monthArr[i].split('-')[0]);
        }
        var yearsArr=groupArray( MtY,'keys' );
        var yearscountArr=groupArray( MtY,'values' );
        // console.log(yearsArr);
        // console.log(yearscountArr);
        var intrvl=3;
        var tempYearsDays = [], tempDays = 0, tempIndx = 0,mainArrIndx=0;
        for(var j=0;j < yearsArr.length;j=j+1) {
            for (var i = 0; i < yearscountArr[j]; i = i + 1) {
                tempYearsDays.push(monthDaysArr[i+mainArrIndx]);
                tempIndx = tempIndx + 1;
                if (tempIndx === intrvl) {
                    tempYearsDays.push(0);
                    tempIndx = 0;
                }
                if( (i+1) === yearscountArr[j]){
                    tempYearsDays.push(0);
                    tempIndx = 0;
                    tempYearsDays.push(yearsArr[j]+"-year");
                    mainArrIndx=mainArrIndx+ (i+1);
                }
            }
        }
        // console.log(tempYearsDays);
        var sum=[];var j=0;
        for(var i=0;i< tempYearsDays.length;i=i+1) {
            if($.isNumeric( tempYearsDays[i] ) ){
                if (parseInt(tempYearsDays[i]) != 0) {
                    j += parseInt(tempYearsDays[i]);
                } else {
                    if (parseInt(tempYearsDays[i+1]) != 0) {
                        sum.push(j);
                        j = 0;
                    }
                }
            }else{
                sum.push(tempYearsDays[i]);
            }
        }
        // console.log(sum);
        // var intrvl=3;
        // var mod= cnt % intrvl;
        // var tempYearsDays = [], tempDays = 0, tempIndx = 0;
        // for(var j=0;j < yearsArr.length;j=j+1) {
        //     for (var i = 0; i < yearscountArr[j]; i = i + 1) {
        //         tempDays += monthDaysArr[i];
        //         tempIndx = tempIndx + 1;
        //         if (tempIndx === intrvl) {
        //             tempYearsDays.push(tempDays);
        //             tempDays = 0;
        //             tempIndx = 0;
        //         }
        //         if(mod >0){
        //             tempYearsDays.push(monthDaysArr[i]);
        //         }
        //         if( (i+1) === yearscountArr[j]){
        //             tempYearsDays.push(yearsArr[j]+"-12");
        //         }
        //     }
        // }
        // tempYearsDays.addArrValueAtIndex( 4,monthArr[11] );
        // tempYearsDays.push(30);
        // tempYearsDays.push(monthArr[ (monthArr.length - 1)] );
        // monthDaysArr.addArrValueAtIndex( (monthDaysArr.length+1),monthArr[ (monthArr.length - 1)] );
        fnlRes=sum;
    }
    // console.log(fnlRes);
    return fnlRes;
}

/////dates fns
var dateToYMD=function(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}
var dateToYM=function(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m);
}
var dateToDays=function(d1,d2) {
    var days = Math.ceil((d2-d1) / (1000 * 3600 * 24));
    return days;
}
var addDays= function(date, days) {
    var result = new Date(date);
    // console.log(result.getDate() + days);
    result.setDate(result.getDate() + parseInt(days));
    return result;
}
var numberToDatesArr=function(_sDate,maxDays) {
    //console.log(maxDays);
    var dates_arr=[];
    for (var i = 0; i <= maxDays; i = i+1) {
        dates_arr.push( dateToYM(addDays(_sDate, (i))) );
    }
    return dates_arr;
}
var groupArray=function (dateArr,is_keys) {
    let array =dateArr,
        result = array.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
    //console.log(Object.values(result));
    let res;
    if( is_keys=='keys' ){
        res=Object.keys(result);
    }else{
        res=Object.values(result);
    }
    return res;
}
var uniqueArr=function (array){
    return array.filter(function(el, index, arr) {
        return index === arr.indexOf(el);
    });
}
Array.prototype.addArrValueAtIndex = function ( index, item ) {
    this.splice( index, 0, item );
};
var monthNames=function (date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    var spltDate=date.split('-');
    //console.log(date);
    var res="";
    if(spltDate[1]=='year'){
        res=spltDate[0];
    }else{
        const d = new Date(date);
        res=monthNames[d.getMonth()]+"-"+d.getFullYear();
    }
    return  res;
}
var GetTodayDateNo=function(sdate) {
    var d2 = new Date();
    var day = Math.ceil((d2-sdate) / (1000 * 3600 * 24));
    return day;
}