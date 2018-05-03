
(function ($) {

    /**
     *	 Class switchControls
     *	 properties - Object of switch settings and options merged
     */

    var switchControl = function (DOMElement, properties)
    {
        // Constructor method
        this.createSwitchControl = function () {
            this.properties = properties;
            this.DOMElement = DOMElement;
            $(this.DOMElement).data("initialPosXMouse", 0);
            $(this.DOMElement).data("canMove", false);

            self = this;

            $(this.DOMElement).addClass('buttonSwitch')
                    .css({
                        height: properties.layout.height,
                        width: properties.layout.width,
                        padding: properties.layout.padding,
                        borderRadius: properties.layout.borderRadius
                    })
                    .append('<div style="background-color: ' + properties.layout.handler.backgroundColor + ';'
                            + ' border-radius: ' + properties.layout.handler.borderRadius + ';'
                            + ' height: ' + properties.layout.handler.height + ';'
                            + ' width: ' + properties.layout.handler.width + ';'
                            + '"></div>')
                    .data("distance", 0)
                    .data("pressing", "0")
                    .each(function () {
                        if ($(this.DOMElement).data("on") === "1")
                            self.setOn($(this.DOMElement));
                        else
                            self.setOff($(this.DOMElement));
                    });
        };

        //// Public methods
        /**
         * Set data attribute value
         */
        this.setData = function (key, value) {
            $(this.DOMElement).data(key, value);
        };

        /**
         * Get data attribute value
         */
        this.getData = function (key) {
            return $(this.DOMElement).data(key);
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


        //// Private methods
        /**
         * Set the button status to "ON"
         */
        this.setOn = function (element, options) {
            var children = $(element).children()[0];
            $(children).addClass("transition");
            var posX = ($(element).width() - $(children).width());
            $(children).css("transform", "translateX(" + posX + "px)");
            $(element).data("current-posx", posX);
            $(element).data("pressing", "0");
            $(element).css({backgroundColor: $(element).data("on-color")});
            if ($(element).data("on") === "0") {
                $(element).trigger("toggle", true);
            }
            $(element).data("on", "1");
        };

        /**
         * Set the button status to "OFF"
         */
        this.setOff = function (element, options) {
            var children = $(element).children()[0];
            $(children).addClass("transition");
            $(children).css("transform", "translateX(" + 0 + "px)");
            $(element).data("current-posx", 0);
            $(element).css({backgroundColor: $(element).data("off-color")});
            $(element).data("pressing", "0");
            if ($(element).data("on") === "1") {
                $(element).trigger("toggle", false);
            }
            $(element).data("on", "0");

        };

        this.listEvents = {
            mousedown: function (elem) {

                $(elem).on("mousedown touchstart", function (e) {
                    //$(this).data("pressing", "1");
                    $(this).data("pressing", "1");
                    //$(this).data("distance", 0);;
                    $(this).data("distance", 0);
                    var children = $(this).children()[0];
                    $(children).removeClass("transition");
                    //to prevent moving outside switch circle
                    if (e.target === children)
                        //self.canMove = true;
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
            },
            mousemove: function (elem) {
                $(elem).on("mousemove touchmove", function (e) {
                    var dist = $(this).data("distance");
                    dist++;
                    $(this).data("distance", dist);
                    //$(this).data("distance", distance);

                    var initialPosXTransform = $(this).data("initial-posx");//$(this).data("initial-posx");
                    var relativePosX = ((e.clientX || e.originalEvent.touches[0].pageX) - $(this).data("initialPosXMouse") + initialPosXTransform);
                    var children = $(this).children()[0];
                    if ($(this).data("pressing") === "1" && $(this).data("canMove")) {
                        if (relativePosX > $(this).width() - $(children).width()) {
                            self.setOn($(this));
                        } else if (relativePosX < 0) {
                            self.setOff($(this));
                        } else {
                            $(children).css("transform", "translateX(" + relativePosX + "px)");
                            $(this).data("current-posx", relativePosX);
                        }
                        if ((e.clientX || e.originalEvent.touches[0].pageX) > ($(this).offset().left + $(this).width())) {
                            $(this).data("pressing", "0");
                        }
                    }
                });
            },
            mouseup: function (elem) {
                $(elem).on("mouseup touchend ", function (e) {
                    var totalSize = $(this).width();
                    var distance = $(this).data("distance");

                    if ($(this).data("pressing") === "1") {
                        if ((Math.abs(distance) <= totalSize * 0.03) && (!e.originalEvent.touches)) {
                            if ($(this).data("on") === "0") {
                                self.setOn($(this));
                            } else {
                                self.setOff($(this));
                            }
                        } else {
                            if ($(this).data("current-posx") > totalSize / 3) {
                                self.setOn($(this));
                            } else {
                                self.setOff($(this));
                            }
                        }
                    }
                    $(this).data("pressing", "0");

                });
            },
            mouseleave: function (elem) {
                $(elem).on("mouseleave", function (e) {
                    var currentPosX = $(this).data("current-posx");
                    if ($(this).data("pressing") === "1") {
                        if (currentPosX > $(this).width() / 2) {
                            self.setOn($(this));
                        } else {
                            self.setOff($(this));
                        }
                    }
                    $(this).data("pressing", "0");
                });
            },
            tap: function (elem) {
                $(elem).on("tap", function (e) {
                    if ($(this).data("on") === "0") {
                        self.setOn($(this));
                    } else {
                        self.setOff($(this));
                    }
                });
            }
        };

    }; // end of class

    $.fn.Switch = function (options, value) {

        //default options.
        var settings = {
            layout: {
                height: "1em",
                width: "2em",
                borderRadius: "5em",
                padding: "0.05em",
                on: {
                    color: "orange"
                },
                off: {
                    color: "gray"
                },
                handler: {
                    backgroundColor: "white",
                    borderRadius: "50%",
                    height: "100%",
                    width: "1em"
                }
            }
        };

        var objSwitch = null;


        //IN CASE OF FIRST TIME CREATED OR THE ARGUMENT IS NOT A STRING
        //WILL SETUP THE LAYOUT AND ON/OFF COLORS
        if (typeof options !== 'string' || !$(this).data("on-color")) {
            settings = $.extend(true, {}, settings, options);
            objSwitch = new switchControl(this, settings);
            objSwitch.createSwitchControl();
            $(objSwitch.DOMElement).data("on-color", settings.layout.on.color);
            $(objSwitch.DOMElement).data("off-color", settings.layout.off.color);
            this.data('objSwitch', objSwitch);
        } // Object is already created we need to get it from data attribute
        else
        {
            settings = $.extend(true, {}, settings, options);
            objSwitch = this.data('objSwitch');
        }

        if (options) {
            if (options.setValue === "disabled")
                value = "disabled";
            else if (options.setValue === "enabled")
                value = "enabled";
        }

        if (value === "disabled") {
            objSwitch.eventOff(objSwitch.DOMElement, "touchstart mousedown touchmove mousemove mouseup touchend tap mouseleave");
            objSwitch.setCSS(objSwitch.DOMElement, {backgroundColor: "gray"});
            objSwitch.setCSS(objSwitch.DOMElement, {backgroundColor: "gainsboro"}, 'HANDLER');

        } else {

            objSwitch.setCSS(objSwitch.DOMElement, {backgroundColor: settings.layout.handler.backgroundColor}, 'HANDLER');

            $(objSwitch.DOMElement).each(function (k, v) {
                if ($(v).data("on") === '1')
                    objSwitch.setCSS(v, {backgroundColor: $(v).data("on-color")});
                else
                    objSwitch.setCSS(v, {backgroundColor: $(v).data("off-color")});
            });

            objSwitch.listEvents.mousedown(objSwitch.DOMElement);
            objSwitch.listEvents.mousemove(objSwitch.DOMElement);
            objSwitch.listEvents.mouseup(objSwitch.DOMElement);
            objSwitch.listEvents.mouseleave(objSwitch.DOMElement);
            objSwitch.listEvents.tap(objSwitch.DOMElement);
        }

        //SET VALUES
        if (options !== undefined) {
            if (options === "setValue") {
                if (value === "on") {
                    $(this).each(function (v, k) {
                        objSwitch.setOn($(this));
                    });

                } else if (value === "off") {
                    $(this).each(function (v, k) {
                        objSwitch.setOff($(this));
                    });
                } else if (value === "toggle") {
                    $(this).each(function (v, k) {
                        if ($(k).data("on") === "1")
                            objSwitch.setOff($(k));
                        else
                            objSwitch.setOn($(k));
                    });
                }
            } else if (options.setValue) {
                if (options.setValue === 'on') {
                    $(this).each(function (v, k) {
                        objSwitch.setOn($(this));
                    });
                } else if (options.setValue === 'off') {
                    $(this).each(function (v, k) {
                        objSwitch.setOff($(this));
                    });
                } else if (options.setValue === "toggle") {
                    $(this).each(function (v, k) {
                        if ($(k).data("on") === "1")
                            objSwitch.setOff($(k));
                        else
                            objSwitch.setOn($(k));
                    });
                }
            }
        }

        return this;
    };


}(jQuery));



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



