

//FixedSlider
(function ($) {

    /**
     *	 Class FunctionSlider
     *	 properties - Object of switch settings and options merged
     */

    var SliderControl = function (DOMElement, properties)
    {

        // Constructor method
        this.createSliderControl = function () {
            this.properties = properties;
            this.DOMElement = DOMElement;
            $(this.DOMElement).data("initialPosXMouse", 0);
            $(this.DOMElement).data("distance", 0);
            $(this.DOMElement).data("canMove", false);

            control = this;


            if (!$(this.DOMElement).data("created")) {
                $(this.DOMElement).append('<div style="background-color: ' + properties.layout.handler.backgroundColor + ';'
                        + ' border-radius: ' + properties.layout.handler.borderRadius + ';'
                        + ' height: ' + properties.layout.handler.height + ';'
                        + ' width: ' + properties.layout.handler.width + ';'
                        + '"></div>').data("created", true);
            }

            $(this.DOMElement).addClass('buttonSwitch')
                    .css({
                        height: properties.layout.height,
                        width: properties.layout.width,
                        padding: properties.layout.padding,
                        borderRadius: properties.layout.borderRadius
                    })
                    .data("distance", 0)
                    .data("pressing", "0")
                    .each(function () {
                        control.setMidle($(this));
                    });


        };


        /**
         *	Turn off events
         */
        this.eventOff = function (element, eventsString) {
            $(element).off(eventsString);
        };

        /**
         *	Change object CSS
         *	If argument applyTo are passed then apply css to the switch button handler
         */
        this.setCSS = function (element, objCSS, applyTo) {
            if (typeof applyTo === 'undefined')
                $(element).css(objCSS);
            else if (typeof applyTo !== 'undefined' && applyTo === 'HANDLER')
                $(element).children().css(objCSS);
        };


        this.setLeft = function (element) {
            $(element).removeClass("middle").addClass("left");
            $(element).trigger("pullLeft", element);
            setTimeout(function () {
                control.setMidle(element);
            }, 500);
        };

        this.setRight = function (element) {
            $(element).removeClass("middle").addClass("right");
            $(element).trigger("pullRight", element);

            setTimeout(function () {
                control.setMidle(element);
            }, 500);
        };

        this.setMidle = function (element) {
            var children = $(element).children()[0];
            var posX = ($(element).width() - $(children).width());
            $(element).addClass("middle").removeClass("left").removeClass("right");
            $(children).css("transform", "translateX(" + posX / 2 + "px)");
            $(element).data("current-posx", posX / 2);
            $(element).data("on", "1");
            $(element).data("pressing", "0");
        };

        this.listEvents = {
            mousedown: function (elem) {
                $(elem).on("mousedown touchstart", function (e) {
                    $(this).data("pressing", "1");
                    $(this).data("distance", 0);
                    var children = $(this).children()[0];
                    $(children).removeClass("transition");

                    //to prevent moving outside switch circle
                    if (e.target === children)
                        $(this).data("canMove", true);
                    else
                        $(this).data("canMove", false);

                    var initialPosX = $(children).css("transform");

                    if (initialPosX === 'none')
                        initialPosX = 0;
                    else
                        initialPosX = parseInt(initialPosX.split(",")[4].replace(" ", ""));

                    $(this).data("initial-posx", initialPosX);
                    $(this).data("initialPosXMouse", e.clientX || e.originalEvent.touches[0].pageX);
                    $(this).data("distance", 0);

                });

            }, mousemove: function (elem) {
                $(elem).on("mousemove touchmove", function (e) {
                    var initialPosXTransform = $(this).data("initial-posx");
                    var relativePosX = ((e.clientX || e.originalEvent.touches[0].pageX) - $(this).data("initialPosXMouse") + initialPosXTransform);
                    var children = $(this).children()[0];
                    if ($(this).data("pressing") === "1" && $(this).data("canMove")) {
                        if (relativePosX >= ($(this).width() - $(children).width() * 0.9)) {
                            $(children).css("transform", "translateX(" + ($(this).width() - $(children).width()) + "px)");
                            $(this).data("current-posx", $(this).width());
                        } else if (relativePosX <= 0) {
                            $(children).css("transform", "translateX(" + 0 + "px)");
                            $(this).data("current-posx", 0);
                        } else {
                            $(children).css("transform", "translateX(" + relativePosX + "px)");
                            $(this).data("current-posx", relativePosX);
                        }

                        if ((e.clientX || e.originalEvent.touches[0].pageX) > ($(this).offset().left + $(this).width())) {
                            $(this).data("pressing", "0");
                        }
                    }
                });
            }, mouseup: function (elem) {
                $(elem).on("mouseup touchend ", function (e) {
                    var children = $(this).children()[0];
                    var relativePosX = $(this).data("current-posx");
                    $(children).addClass("transition");
                    if (relativePosX >= $(this).width() - $(children).width()) {
                        control.setRight(this);
                    } else if (relativePosX <= 0) {
                        control.setLeft(this);
                    } else {
                        control.setMidle(this);
                    }
                    $(this).data("pressing", "0");

                });
            }, mouseleave: function (elem) {
                $(elem).on("mouseleave", function (e) {
                    var children = $(this).children()[0];
                    var relativePosX = $(this).data("current-posx");
                    $(children).addClass("transition");
                    if (relativePosX >= $(this).width() - $(children).width()) {
                        control.setRight(this);
                    } else if (relativePosX <= 0) {
                        control.setLeft(this);
                    } else {
                        control.setMidle(this);
                    }
                    $(this).data("pressing", "0");
                });
            }
        };

    };

    $.fn.FunctionSlider = function (options, value) {

        //default options.
        var settings = {
            layout: {
                height: "1em",
                width: "3em",
                borderRadius: "5em",
                padding: "0.05em",
                handler: {
                    backgroundColor: "white",
                    borderRadius: "50%",
                    height: "100%",
                    width: "1em"
                }
            }
        };

        var obj = null;

        //IN CASE OF FIRST TIME CREATED OR THE ARGUMENT IS NOT A STRING
        //WILL SETUP THE LAYOUT AND ON/OFF COLORS
        if (typeof options !== 'string') {
            settings = $.extend(true, {}, settings, options);
            obj = new SliderControl(this, settings);
            obj.createSliderControl();

        }
        if (options) {
            if (options.setValue === "disabled")
                value = "disabled";
            else if (options.setValue === "enabled")
                value = "enabled";
        }

        if (value === "disabled") {
            $(this).off("touchstart mousedown touchmove mousemove mouseup touchend tap mouseleave");
            $(this).css({backgroundColor: "gray"});
            $($(this).children()).css({backgroundColor: "gainsboro"});

        } else {
            $($(this).children()).css({backgroundColor: settings.layout.handler.backgroundColor});
            settings = $.extend(true, {}, settings, options);
            obj = new SliderControl(this, 'FUNCSLIDER_BTN', settings);
            obj.listEvents.mousedown($(this));
            obj.listEvents.mousemove($(this));
            obj.listEvents.mouseup($(this));
            obj.listEvents.mouseleave($(this));
        }
        return this;
    };


}(jQuery));



