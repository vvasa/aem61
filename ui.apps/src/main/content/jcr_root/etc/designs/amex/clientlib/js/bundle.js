Amex = {
        _logLevels: {
            error: 1,
            warn: 2,
            info: 3,
            log: 4
        },
        _logLevel: 0,
        init: function(a) {
            "use strict";
            this.setupLoging(), this.setupPageRefreshes(a), Amex.Tracking.init(), Amex.DataService.init(), Amex.Global.init(), Amex.Browser.init(), Amex.Youtube.init(), Amex.Module.init()
        },
        setupLoging: function() {
            var a = window.console || {},
                b = ["log", "info", "warn", "error"],
                c = function() {},
                d = Array.prototype.slice,
                e = parseInt(Amex.Browser.getQuery("log_level"), 10);
            Amex._logLevel = "number" != typeof e || isNaN(e) ? Amex.Settings.logLevel : e;
            for (var f = function(b, e) {
                    return a[b] ? function() {
                        if (!(Amex._logLevel < e)) {
                            var a = d.call(arguments, 0);
                            a.unshift("Amex." + b + ":"), Function.prototype.apply.call(window.console[b], window.console, a)
                        }
                    } : c
                }, g = 0; g < b.length; g++) {
                var h = b[g];
                Amex[h] = f(h, Amex._logLevels[h])
            }
        },
        setupPageRefreshes: function(a) {
            var b = location.pathname;
            ("/" === b || "/qa/" === b || "/staging/" === b || "/artists/ellie-goulding/" === b) && a.split(",").forEach(function(a) {
                var a = new Date(a),
                    c = a.getUTCFullYear(),
                    d = a.getUTCMonth(),
                    e = a.getUTCDate(),
                    f = a.getUTCHours(),
                    g = a.getUTCMinutes(),
                    h = a.getUTCSeconds(),
                    i = Date.UTC(c, d, e, f, g, h) - Date.now();
                i > 0 && setTimeout(function() {
                    location = location.origin + b
                }, i)
            })
        },
        getPagePath: function(a) {
            return Amex.Settings.pageRoot + a
        },
        getAssetsPath: function(a) {
            return Amex.Settings.assetsRoot + a
        }
    }, Amex.Animation = {
        lerp: function(a, b, c) {
            return a + (b - a) * c
        },
        _linear: function(a) {
            return a
        },
        _swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2
        },
        animate: function(a, b, c, d, e) {
            c = void 0 !== c ? c : 400;
            var f = $.Deferred(),
                g = performance.now(),
                h = b - a,
                i = e || Amex.Animation._swing;
            return function j() {
                if ("rejected" !== f.state()) {
                    var e = performance.now() - g;
                    if (e >= c) d(b), f.resolve();
                    else {
                        var k = a + h * i(e / c);
                        d(k), requestAnimationFrame(j)
                    }
                }
            }(), f
        },
        setProgressIndicator: function(a, b, c) {
            var d = a.find(".progress-indicator--inner"),
                e = a.width(),
                f = d.width(),
                g = Math.round(f / e * 100) / 100,
                h = e * (1 - g) / (c - 1);
            d.css("left", h * b)
        },
        animateNoiseMeter: function(a, b, c, d) {
            var e = a.find("svg"),
                f = a.find("[data-percentage]");
            c = c || 1400;
            var g = parseInt(f.text(), 10),
                h = Amex.Module.NoiseMeterModule;
            return Amex.Animation.animate(g, b, c, function(a) {
                f.text(Math.round(a)), h.setSvgPercentage(e, a)
            }).done(function() {
                100 === b && (d || f.hide(), a.find(".checkmark").show())
            })
        }
    }, Amex.Browser = {
        init: function() {
            this.checkSupport("js", !0), this.checkSupport("csstransforms3d", this.css3dTransformSupported()), this.checkSupport("cssanimations", this.cssAnimationsSupported()), this.checkSupport("lineargradient", this.linearGradientSupported()), this.checkSupport("touch", this.isTouchDevice()), this.checkSupport("mobile-tablet", this.isMobileOrTablet()), this.checkSupport("ios", this.isIOS()), this.checkSupport("android", this.isAndroid()), this.checkSupport("galaxys4", this.isGalaxyS4()), this.checkSupport("lt-ie9", this.isBrowser("ie", 0, 8.99)), this.checkSupport("cssvhunit", this.cssvhunit())
        },
        checkSupport: function(a, b) {
            b === !0 ? $("html").removeClass("no-" + a).addClass(a) : $("html").removeClass(a).addClass("no-" + a)
        },
        backgroundVideoSupported: function() {
            if (void 0 === Amex.Browser._backgroundVideoSupported) {
                var a = !0,
                    b = document.createElement("video");
                b.canPlayType || (a = !1), Amex.Browser.isMobileOrTablet() && (a = !1), Amex.Browser.isBrowser("ie", 0, 9) && (a = !1), Amex.Browser.getQuery("no_background_video") === !0 && (a = !1), Amex.Browser._backgroundVideoSupported = a
            }
            return Amex.Browser._backgroundVideoSupported
        },
        linearGradientSupported: function() {
            var a = document.createElement("div"),
                b = " -webkit- -moz- -o- -ms- -khtml- ".split(" "),
                c = "background-image:",
                d = "linear-gradient(left top,#9f9, white);";
            return a.style.cssText = (c + b.join(d + c)).slice(0, -c.length), -1 !== ("" + a.style.backgroundImage).indexOf("linear-gradient")
        },
        css3dTransformSupported: function() {
            if (void 0 === Amex.Browser._css3dTransformSupported) {
                var a = document.createElement("p"),
                    b = {
                        transform: "transform",
                        webkitTransform: "-webkit-transform",
                        OTransform: "-o-transform",
                        msTransform: "-ms-transform",
                        MozTransform: "-moz-transform"
                    };
                document.body.insertBefore(a, null);
                var c = !1,
                    d = null;
                for (var e in b)
                    if (void 0 !== a.style[e] && (a.style[e] = "translate3d(1px,1px,1px)", window.getComputedStyle(a).getPropertyValue(b[e]))) {
                        c = !0, d = e;
                        break
                    }
                this.isBrowser("ie", 0, 9) && (c = !1), $(a).remove(), Amex.Browser._css3dTransformsStyleName = d, Amex.Browser._css3dTransformSupported = c
            }
            return Amex.Browser._css3dTransformSupported
        },
        cssAnimationsSupported: function() {
            if (void 0 === Amex.Browser._cssAnimationsSupported) {
                var a = document.createElement("p"),
                    b = ["Webkit", "Moz", "O"],
                    c = void 0 !== a.style.animationName;
                if (!c)
                    for (var d = 0; d < b.length; d++)
                        if (void 0 !== a.style[b[d] + "AnimationName"]) {
                            c = !0;
                            break
                        }
                Amex.Browser._cssAnimationsSupported = c
            }
            return Amex.Browser._cssAnimationsSupported
        },
        isTouchDevice: function() {
            return "ontouchstart" in window
        },
        isMobileOrTablet: function() {
            if (void 0 === Amex.Browser._isMobileOrTablet) {
                var a = navigator.userAgent,
                    b = !!(a.match(/Android/i) || a.match(/webOS/i) || a.match(/iPhone/i) || a.match(/iPad/i) || a.match(/iPod/i) || a.match(/BlackBerry/i) || a.match(/Windows Phone/i));
                Amex.Browser._isMobileOrTablet = b
            }
            return Amex.Browser._isMobileOrTablet
        },
        isIOS: function() {
            return void 0 === Amex.Browser._isIOS && (Amex.Browser._isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent)), Amex.Browser._isIOS
        },
        isAndroid: function() {
            return void 0 === Amex.Browser._isAndroid && (Amex.Browser._isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1), Amex.Browser._isAndroid
        },
        isGalaxyS4: function() {
            return void 0 === Amex.Browser._isGalaxyS4 && (Amex.Browser._isGalaxyS4 = navigator.userAgent.toLowerCase().indexOf("samsung-sgh-i337") > -1), Amex.Browser._isGalaxyS4
        },
        isBrowser: function(a, b, c) {
            var d = Amex.Browser.getBrowserInfo();
            if (a.toLowerCase() !== d.name) return !1;
            var e = d.version;
            return b = b || e, c = c || b, e >= parseInt(b, 10) && e <= parseInt(c, 10)
        },
        getBrowserInfo: function() {
            if (!Amex.Browser._browserInfo) {
                var a, b, c = navigator.userAgent;
                if (/iPad|iPhone|iPod/i.test(c)) a = /CriOS/.test(c) ? "mobilechrome" : "mobilesafari", b = c.match(/OS (\d+)_(\d+)(?:_(\d+))?/)[1];
                else {
                    var d = c.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                    if (a = d[1], b = d[2], /trident/i.test(d[1])) {
                        var e = /\brv[ :]+(\d+)/g.exec(c) || [];
                        a = "IE", b = e[1] || null
                    } else if ("Chrome" === d[1]) {
                        var f = c.match(/\bOPR\/(\d+)/);
                        null !== f && (a = "Opera", b = f[1])
                    } else {
                        b || (a = navigator.appNam, b = navigator.appVersion);
                        var g = c.match(/version\/(\d+)/i);
                        null !== g && (b = g[1])
                    }
                    "MSIE" === a && (a = "IE")
                }
                Amex.Browser._browserInfo = {
                    name: a.toLowerCase(),
                    version: parseInt(b, 10)
                }
            }
            return Amex.Browser._browserInfo
        },
        _parseQuery: function() {
            if (void 0 === Amex.Browser._queryValues) {
                for (var a = (window.location.search || "").replace("?", ""), b = a.split("&"), c = {}, d = 0; d < b.length; d++) {
                    var e = b[d].split("="),
                        f = e[0],
                        g = e[1];
                    c[f] = void 0 === g ? !0 : "true" === g ? !0 : "false" === g ? !1 : g
                }
                Amex.Browser._queryValues = c
            }
            return Amex.Browser._queryValues
        },
        getQuery: function(a) {
            var b = Amex.Browser._parseQuery();
            return b[a]
        },
        cssvhunit: function() {
            var a;
            return this.injectElementWithStyles("#modernizr { height: 50vh; }", function(b) {
                var c = parseInt(window.innerHeight / 2, 10),
                    d = parseInt((window.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle).height, 10);
                a = !(d != c)
            }), a
        },
        injectElementWithStyles: function(a, b, c, d) {
            var e, f, g, h, i = "modernizr",
                j = this.createElement("div"),
                k = this.getBody();
            if (parseInt(c, 10))
                for (; c--;) g = this.createElement("div"), g.id = d ? d[c] : i + (c + 1), j.appendChild(g);
            return e = ["&#173;", '<style id="s', i, '">', a, "</style>"].join(""), j.id = i, (k.fake ? k : j).innerHTML += e, k.appendChild(j), k.fake && (k.style.background = "", k.style.overflow = "hidden", h = docElement.style.overflow, docElement.style.overflow = "hidden", docElement.appendChild(k)), f = b(j, a), k.fake ? (k.parentNode.removeChild(k), docElement.style.overflow = h, docElement.offsetHeight) : j.parentNode.removeChild(j), !!f
        },
        createElement: function(a) {
            return document.createElement(a)
        },
        getBody: function() {
            var a = document.body;
            return a || (a = this.createElement("body"), a.fake = !0), a
        }
    }, Amex.Cookies = {
        getItem: function(a) {
            a = encodeURIComponent(a).replace(/[\-\.\+\*]/g, "\\$&");
            var b = document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + a + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1");
            return b ? decodeURIComponent(b) : null
        },
        setItem: function(a, b, c, d, e, f) {
            if (!a || /^(?:expires|max\-age|path|domain|secure)$/i.test(a)) return !1;
            var g = "";
            if (c) switch (c.constructor) {
                case Number:
                    g = c === 1 / 0 ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + c;
                    break;
                case String:
                    g = "; expires=" + c;
                    break;
                case Date:
                    g = "; expires=" + c.toUTCString()
            }
            document.cookie = encodeURIComponent(a) + "=" + encodeURIComponent(b) + g + (e ? "; domain=" + e : "") + (d ? "; path=" + d : "") + (f ? "; secure" : "")
        },
        hasItem: function(a) {
            return a ? new RegExp("(?:^|;\\s*)" + encodeURIComponent(a).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie) : !1
        },
        removeItem: function(a, b, c) {
            Amex.Cookies.hasItem(a) && (document.cookie = encodeURIComponent(a) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (c ? "; domain=" + c : "") + (b ? "; path=" + b : ""))
        }
    },
    function() {
        "use strict";

        function a(a, b) {
            var c, d;
            for (c = a.length; c--;)(d = a[c]).callback.apply(d.ctx, b)
        }
        var b = Array.prototype.slice;
        Amex.Events = {
            on: function(a, b, c) {
                return a && b ? (this._events || (this._events = {}), (this._events[a] || (this._events[a] = [])).unshift({
                    callback: b,
                    _context: c,
                    ctx: c || this
                }), this) : this
            },
            once: function(a, b, c) {
                this.on(a, function d() {
                    this.off(a, d, c), b.apply(this, arguments)
                }, c)
            },
            off: function(a, b, c) {
                var d, e, f;
                if (!this._events) return this;
                if (!a) return this._events = {}, this;
                for (e = this._events[a] || [], d = e.length; d--;) f = e[d], b != f.callback || c && c != f._context || e.splice(d, 1);
                return e.length || delete this._events[a], this
            },
            trigger: function(c) {
                if (!c || !this._events) return this;
                var d = b.call(arguments, 1),
                    e = this._events[c];
                return e && a(e, d), this
            }
        }
    }(), Amex.Global = {
        $window: null,
        windowWidth: 0,
        windowHeight: 0,
        init: function() {
            this.setup(), this.bindEvents()
        },
        setup: function() {
            this.$window = $(window), this.isCSSVHUnitSupported = Amex.Browser.cssvhunit(), this.onScrollHandler = $.proxy(this.onScrollHandler, this), this.onResizeHandler = $.proxy(this.onResizeHandler, this), this.revealEffectDelay = 200, this.revealLastTime = 0, this._$revealElements = $(".reveal-effect"), this.revealEffectUpdateHandler = $.proxy(this.revealEffectUpdateHandler, this), this._parallaxElem = $(".page-background--parallax").get(0), this.onScrollFrame = $.proxy(this.onScrollFrame, this), this.setFixedHeroHeight = $.proxy(this.setFixedHeroHeight, this), this.setFixedHeroHeight();
            var a = this;
            $(function() {
                a.onResizeHandler(), a.onScrollHandler()
            })
        },
        bindEvents: function() {
            this.$window.on("resize", this.onResizeHandler), this.$window.on("scroll resize", this.onScrollHandler), Amex.Events.on("window.resize", this.setAmexLogoVersion, this), Amex.Browser.isMobileOrTablet() || Amex.Browser.isBrowser("ie", 0, 9) ? this.$window.on("orientationchange", $.proxy(this.onOrientationChange, this)) : (this._parallaxElem && Amex.Events.on("window.scrollFrame", this.parallaxEffectScrollHandler, this), Amex.Events.on("window.scrollFrame", this.revealEffectScrollHandler, this), Amex.Events.on("window.resize", this.cacheRevealElementValues, this)), Amex.DataService.fetchGeoData().done(this.fixAndroidAppVersion), Amex.DataService.fetchGeoData().done(this.fixItunesAppVersion)
        },
        onResizeHandler: function() {
            this.windowWidth = this.$window.width(), this.windowHeight = this.$window.height(), Amex.Events.trigger("window.resize")
        },
        onOrientationChange: function() {
            this.setFixedHeroHeight(), Amex.Events.trigger("window.orientationChange")
        },
        cacheRevealElementValues: function() {
            for (var a = this._$revealElements, b = 0, c = a.length; c > b; b++) {
                var d = $(a[b]);
                d.data("top", d.offset().top), d.data("height", d.height())
            }
        },
        fixAndroidAppVersion: function() {
            if (Amex.Util.isUS()) {
                var a = "https://play.google.com/store/apps/details?id=com.americanexpress.droid.amexunstaged";
                $("[data-app-link-googleplay]").attr("href", a)
            }
        },
        fixItunesAppVersion: function() {
            if (Amex.Util.isUS()) {
                var a = "https://itunes.apple.com/us/app/american-express-unstaged/id1025128992?ls=1&mt=8";
                $("[data-app-link-itunes]").attr("href", a)
            }
        },
        setFixedHeroHeight: function() {
            Amex.Browser.isMobileOrTablet() && !this.isCSSVHUnitSupported && $("[data-hero-height]").height(this.$window.height())
        },
        setAmexLogoVersion: function() {
            var a = Amex.Browser.isMobileOrTablet() ? "amex_logo_mobile.png" : "amex_logo.jpg";
            $(".amex-logo").attr("src", Amex.getAssetsPath("/assets/images/" + a))
        },
        onScrollHandler: function() {
            this.scrollFrameRAFId || (this.scrollFrameRAFId = requestAnimationFrame(this.onScrollFrame))
        },
        onScrollFrame: function() {
            this.scrollFrameRAFId = null;
            var a = this.$window.scrollTop();
            Amex.Events.trigger("window.scrollFrame", a)
        },
        parallaxEffectScrollHandler: function(a) {
            this._parallaxElem.style[Amex.Browser._css3dTransformsStyleName] = "translate3d(0," + Math.round(.3 * a) + "px, 0)"
        },
        revealEffectScrollHandler: function(a) {
            for (var b = this.windowHeight, c = a + b, d = this._$revealElements, e = 0, f = d.length; f > e; e++) {
                var g = $(d[e]),
                    h = g.data("top");
                if (c >= h) {
                    var i = g.data("height");
                    a > h + i ? g.removeClass("reveal-effect_pending").addClass("reveal-effect_visible") : (g.addClass("reveal-effect_pending"), this.revealUpdateRAFId || (this.revealUpdateRAFId = requestAnimationFrame(this.revealEffectUpdateHandler)))
                }
            }
            this._$revealElements = this._$revealElements.not(".reveal-effect_visible")
        },
        revealEffectUpdateHandler: function() {
            this.revealUpdateRAFId = null;
            var a = this._$revealElements.filter(".reveal-effect_pending"),
                b = a.length;
            if (b) {
                var c = performance.now();
                c - this.revealLastTime > this.revealEffectDelay && (this.revealLastTime = c, $(a.get(0)).removeClass("reveal-effect_pending").addClass("reveal-effect_visible"), --b), this._$revealElements = this._$revealElements.not(".reveal-effect_visible"), b && (this.revealUpdateRAFId = requestAnimationFrame(this.revealEffectUpdateHandler)), 0 === this._$revealElements.length && Amex.Events.off("window.scrollFrame", this.revealEffectScrollHandler, this)
            }
        }
    }, Amex.Module = {
        init: function() {
            this.initModules()
        },
        initModules: function(a) {
            a = a || $(document.body);
            var b, c, d, e = this,
                f = a.find(".js-module");
            f.each(function(a, f) {
                if (b = $(f), c = b.data("module-name"), !c) return void Amex.warn("Module name not found for element", b);
                if (!e.hasOwnProperty(c) && c.length > 0) return void Amex.warn("Module ", c, " is missing in namespace");
                d = "amex_" + c.charAt(0).toLowerCase() + c.slice(1), $.fn[d] || e.registerModule(d, e[c]);
                var g = b.data();
                g = $.extend({}, g), b[d](g)
            })
        },
        getNamespace: function(a, b) {
            "use strict";
            for (var c = b.split("."), d = a, e = c.length, f = 0; e > f; f++) d.hasOwnProperty(c[f]) || (d[c[f]] = {}), d = d[c[f]];
            return d
        },
        registerModule: function(a, b) {
            var c;
            $.fn[a] = function(d) {
                return this.each(function() {
                    $.data(this, a) || (c = $.data(this, a, Object.create(b).init(d, this)))
                })
            }
        }
    }, "function" != typeof Object.create && (Object.create = function() {
        var a = function() {};
        return function(b) {
            if (arguments.length > 1) throw Error("Second argument not supported");
            if ("object" != typeof b) throw TypeError("Argument must be an object");
            a.prototype = b;
            var c = new a;
            return a.prototype = null, c
        }
    }()),
    function() {
        for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
        window.requestAnimationFrame || (window.requestAnimationFrame = function(b, c) {
            var d = (new Date).getTime(),
                e = Math.max(0, 16 - (d - a)),
                f = window.setTimeout(function() {
                    b(d + e)
                }, e);
            return a = d + e, f
        }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function(a) {
            clearTimeout(a)
        })
    }(),
    function() {
        if ("performance" in window == !1 && (window.performance = {}), Date.now = Date.now || function() {
                return (new Date).getTime()
            }, "now" in window.performance == !1) {
            var a = Date.now();
            performance.timing && performance.timing.navigationStart && (a = performance.timing.navigationStart), window.performance.now = function() {
                return Date.now() - a
            }
        }
    }(), Amex.Tracking = {
        init: function() {
            if (this.layerTracked = !1, this.bindEvents(), "" !== Amex.Settings.pageTrackingLayertrack) var a = 0,
                b = !1,
                c = setInterval(function() {
                    "function" == typeof $iTagTracker && (Amex.Tracking.track("layertrack", Amex.Settings.pageTrackingLayertrack), b = !0), (a++ > 20 || b) && clearInterval(c)
                }, 500)
        },
        bindEvents: function() {
            $("body").on("click", "[data-tracking-rmaction]", this.onRmactionClickHandler), window.addEventListener("message", function(a) {
                "cg_login" == Object.keys(a.data)[0] && ("function" == typeof $iTagTracker ? $iTagTracker("rmaction", a.data[Object.keys(a.data)[0]]) : null)
            })
        },
        onRmactionClickHandler: function(a) {
            var b = $(a.target).closest("[data-tracking-rmaction]"),
                c = b.attr("data-tracking-rmaction"),
                d = b.is("[data-multiple-page-tracking]");
            Amex.Tracking.trackRmAction(c, d)
        },
        trackRmAction: function(a, b) {
            var c = b ? "UnstagedMultiple" : Amex.Settings.pageRmaction;
            Amex.Tracking.track("rmaction", "Click_" + c + a)
        },
        trackVidstart: function(a) {
            Amex.Tracking.track("rmaction", "Click_" + a)
        },
        track: function(a, b) {
            "function" == typeof $iTagTracker && $iTagTracker(a, b), Amex.info("tracking", a, b)
        }
    }, Array.prototype.contains = function(a) {
        return this.indexOf(a) > -1
    }, Amex.Util = {
        safeHTML: function(a) {
            return a.replace(/>/g, "&gt;").replace(/</g, "&lt;")
        },
        highlightSocialMediaText: function(a) {
            return a ? (a = this.safeHTML(a), a = a.replace(/#.+?(?=[\s.,:,]|$)/g, function(a) {
                return "<em>" + a + "</em>"
            }), a = a.replace(/(?:^|[\s.,:,])(@.+?)(?=[\s.,:,]|$)/g, function(a, b) {
                return a.replace(b, "<em>" + b + "</em>")
            })) : a
        },
        getLatestUGCEntry: function(a) {
            if (!a) return null;
            for (var b = a[0], c = 0; c < a.length; c++) {
                var d = a[c];
                new Date(d.created) > new Date(b.created) && (b = d)
            }
            return b
        },
        getFormattedTimeSince: function(a) {
            a.getTime()
        },
        isUS: function() {
            var a = Amex.DataService.geoData;
            return a ? "us" === ("" + a.country).toLowerCase() : null
        },
        sketchyIsUS: function() {
            return "en-us" === ("" + navigator.language).toLowerCase()
        },
        artistDataPromise: function(a, b) {
            var c = $.Deferred(),
                d = a || Amex.Settings.pageArtist;
            return b = b || Amex.Settings.pageArtistType, d && b ? Amex.DataService.fetchLocalData(b + "Artists").done(function(a) {
                for (var b = null, e = 0; e < a.length; e++)
                    if (a[e].id === d) {
                        b = a[e];
                        break
                    }
                b ? c.resolve(b) : c.reject()
            }) : c.reject(), c
        },
        onSwipe: function(a, b) {
            if (Amex.Browser.isTouchDevice()) {
                var c = 80,
                    d = null;
                a.on("touchstart", function(a) {
                    d = {
                        x: a.originalEvent.changedTouches[0].pageX
                    }
                }), a.on("touchend touchcancel touchleave", function(a) {
                    d = null
                }), a.on("touchmove", function(a) {
                    if (d) {
                        var e = a.originalEvent.changedTouches[0],
                            f = d.x - e.pageX,
                            g = Math.abs(f);
                        g > 10 && a.preventDefault(), g > c && (b(f > 0 ? 1 : -1), d = null)
                    }
                })
            }
        },
        loadAsyncImages: function(a) {
            a.add(a.find("[data-async-image]")).each(function() {
                var a = $(this),
                    b = a.attr("data-async-image");
                b && (a.is("img") ? a.attr("src", b) : a.css("background-image", 'url("' + b + '")'), a.removeAttr("data-async-image"))
            })
        },
        isElementInActiveViewport: function(a) {
            var b = $(window),
                c = b.scrollTop(),
                d = b.height(),
                e = a.offset().top,
                f = a.height() / 2,
                g = c + d / 2;
            return Math.abs(g - (e + f)) < f ? !0 : !1
        },
        isArtistIdInList: function(a, b) {
            return b.contains(a) ? !0 : !1
        }
    }, Amex.Youtube = {
        idCounter: 0,
        apiLoaded: !1,
        apiBaseUrl: "https://www.googleapis.com/youtube/v3/",
        apiKey: "AIzaSyDRDK97IrClFIqZ_ktgzF9VBBItnVG0RQA",
        init: function() {
            this.setup(), this.bindEvents(), setTimeout($.proxy(function() {
                this.checkForAutoplayVideo()
            }, this), 0)
        },
        setup: function() {
            this.$globalContainer = $("#global-youtube-container"), this.active = !1
        },
        bindEvents: function() {
            function a() {
                b.apiLoaded = !0, Amex.Events.trigger("youtube.loaded")
            }
            var b = this;
            "undefined" != typeof YT && YT.Player ? window.setTimeout(a, 1e3) : window.onYouTubeIframeAPIReady = a, $("body").on("click", ".js-modal-youtube[data-video-id]", function(a) {
                a.preventDefault(), b.openVideoLink(b.$globalContainer, $(this))
            })
        },
        isActive: function() {
            return this.active
        },
        _insertYoutubePlayer: function(a) {
            if (this.apiLoaded) this._setupVideoplay(a);
            else var b = 10,
                c = 7e3,
                d = (new Date).getTime(),
                e = window.setInterval($.proxy(function() {
                    this.apiLoaded ? (this._setupVideoplay(a), window.clearInterval(e)) : (new Date).getTime() - d >= c && window.clearInterval(e)
                }, this), b)
        },
        _setupVideoplay: function(a) {
            var b = a.$container,
                c = this.getPlayer(b, a.videoId, a.noForceCreate === !0 ? !1 : !0);
            c.readyPromise().done($.proxy(function() {
                c.hasStartedPlaying = !1, Amex.Browser.isMobileOrTablet() || (a.cueVideo ? c.cueVideoById(a.videoId) : c.loadVideoById(a.videoId))
            }, this))
        },
        getPlayer: function(a, b, c) {
            if (!a.data("youtube-player") || c) {
                var d = a.find("[data-video-embed]");
                if (d.length || (d = $('<div class="embed" data-video-embed></div>'), a.find(".embed").replaceWith(d)), void 0 === d.attr("id") && d.attr("id", this.createId()), void 0 === b) throw new Error("Video ID [" + videoID + "] must not be undefined");
                a.data("youtube-player", this._createPlayer(d.attr("id"), a, b))
            }
            return a.data("youtube-player")
        },
        _createPlayer: function(a, b, c) {
            var d = $.Deferred(),
                e = new YT.Player(a, {
                    width: "100%",
                    height: "100%",
                    videoId: c,
                    playerVars: {
                        showinfo: 1,
                        rel: 0,
                        wmode: "transparent",
                        autoplay: 0,
                        controls: 2,
                        autohide: 1
                    },
                    events: {
                        onReady: function() {
                            d.resolve(e), console.log("Video is ready"), this.noTrackVideo !== !0 && (console.log("Video is tracking"), Amex.Tracking.trackVidstart(c))
                        },
                        onStateChange: function() {
                            var a = e.getPlayerState(),
                                c = {
                                    videoId: e.getVideoData().video_id,
                                    player: e,
                                    $container: b
                                };
                            if (this.state !== a) switch (this.state = a, a) {
                                case YT.PlayerState.UNSTARTED:
                                    Amex.Events.trigger("video.loading", c);
                                    break;
                                case YT.PlayerState.ENDED:
                                    Amex.Events.trigger("video.ended", c);
                                    break;
                                case YT.PlayerState.PLAYING:
                                    e.hasStartedPlaying = !0, Amex.Events.trigger("video.playing", c);
                                    break;
                                case YT.PlayerState.PAUSED:
                                    Amex.Events.trigger("video.paused", c);
                                    break;
                                case YT.PlayerState.BUFFERING:
                                    Amex.Events.trigger("video.buffering", c);
                                    break;
                                case YT.PlayerState.CUED:
                            }
                        }
                    }
                });
            return e.readyPromise = function() {
                return d
            }, e
        },
        openVideoLink: function(a, b) {
            var c = {
                videoId: b.attr("data-video-id"),
                playlistArtist: b.attr("data-playlist-artist") || null,
                $container: a
            };
            c.playlistArtist && (c.playlistArtistType = b.attr("data-playlist-artist-type") || null), this.openVideo(c)
        },
        openVideo: function(a) {
            if (!a.videoId) throw "No video id supplied to Amex.Youtube.openVideo";
            a.$container || (a.$container = this.$globalContainer), this._insertYoutubePlayer(a), this.noTrackVideo = a.noTracking, a.$container.show(), this.active = !0, Amex.Events.trigger("video.show", a)
        },
        closeVideo: function(a) {
            var b = a.data("youtube-player");
            b && b.stopVideo && b.stopVideo(), a.hide(), this.active = !1, Amex.Events.trigger("video.hide", {
                $container: a
            })
        },
        createId: function() {
            var a = "video-" + this.idCounter++;
            return 0 === $("#" + a).length ? a : this.createId()
        },
        checkForAutoplayVideo: function() {
            var a = null,
                b = Amex.Browser.getQuery("autoplay_video_id"),
                c = Amex.Browser.getQuery("autoplay_video");
            if (b) a = b;
            else if (c) {
                var d = $(".js-media-image[data-yt-id]:first").data("yt-id");
                d && (a = d)
            }
            a && this.openVideo({
                videoId: a,
                $container: this.$globalContainer
            })
        },
        getVideoInfo: function(a) {
            var b = this.apiBaseUrl + "videos?part=snippet&key=" + this.apiKey + "&id=" + a;
            return $.getJSON(b)
        }
    }, Amex.Module.AboutModule = {
        init: function(a, b) {
            return this.$elem = $(b), this.bindEvents(), this
        },
        bindEvents: function() {
            this.$elem.find("[data-readmore-open]").click($.proxy(function(a) {
                a.preventDefault(), this.toggleReadmoreOverlay(!0)
            }, this)), this.$elem.find("[data-readmore-close]").click($.proxy(function(a) {
                a.preventDefault(), this.toggleReadmoreOverlay(!1)
            }, this)), this.$elem.find("[data-calendar-open]").click($.proxy(function(a) {
                a.preventDefault(), this.toggleCalendarOverlay(!0)
            }, this)), this.$elem.find("[data-calendar-close]").click($.proxy(function(a) {
                a.preventDefault(), this.toggleCalendarOverlay(!1)
            }, this))
        },
        toggleReadmoreOverlay: function(a) {
            this.$elem.find("[data-popup-readmore]").toggleClass("popup_visible", a)
        },
        toggleCalendarOverlay: function(a) {
            this.$elem.find("[data-popup-calendar]").toggleClass("popup_visible", a)
        }
    };
var $eachQuestion = $(".faq-question-wrapper").find(".faq-question"),
    $title = $eachQuestion.find(".title"),
    $faqAnswer = $eachQuestion.find(".faq-answer");
$faqAnswer.hide(), $eachQuestion.on("click", function() {
    $(this).find(".faq-answer").slideToggle(), $(this).find(".title").toggleClass("rotate")
}), Amex.Module.AppInDetailModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.currentIndex = 0
    },
    bindEvents: function() {
        this.$elem.find(".amex-arrow").click($.proxy(this.onArrowClickHandler, this))
    },
    onArrowClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target),
            c = b.hasClass("amex-arrow_left") ? -1 : 1;
        this.moveSlider(c)
    },
    moveSlider: function(a) {
        this.setSliderPosition(this.currentIndex + a)
    },
    setSliderPosition: function(a) {
        var b = this.$elem.find(".gallery--item"),
            c = b.width(),
            d = this.$elem.find(".gallery--wrapper").width(),
            e = parseInt(b.last().css("margin-left"), 10),
            f = Math.floor(d / c),
            g = b.length - f + 1;
        a = (g + a) % g;
        var h = -(c * a + e * a);
        this.$elem.find(".gallery").css({
            transform: "translateX(" + h + "px)"
        }), this.currentIndex = a
    }
}, Amex.Module.AppNotificationModule = {
    iOSIntlAppId: "1025137059",
    iOSUsAppId: "1025128992",
    androidUsAppId: "com.americanexpress.droid.amexunstaged",
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        if (this.androidCookieName = "seen-android-app", Amex.Browser.isIOS()) {
            this.showIOSAppNotification(Amex.Util.sketchyIsUS())
        } else Amex.Browser.isAndroid() && !Amex.Cookies.hasItem(this.androidCookieName) && Amex.DataService.fetchGeoData()
    },
    bindEvents: function() {
        this.$elem.find(".close-button, .app-link").click($.proxy(function() {
            Amex.Cookies.setItem(this.androidCookieName, !0, 1 / 0), this.$elem.hide()
        }, this)), Amex.Browser.isAndroid() && !Amex.Cookies.hasItem(this.androidCookieName) && Amex.Events.on("geoData.updated", this.showAppNotification, this)
    },
    showAppNotification: function() {
        var a = Amex.DataService.geoData,
            b = !1;
        b = a ? "us" === ("" + a.country).toLowerCase() : Amex.Util.sketchyIsUS(), Amex.Cookies.hasItem(this.androidCookieName) || this.showAndroidNotification(b), console.log(a)
    },
    showIOSAppNotification: function(a) {
        var b = a ? this.iOSUsAppId : this.iOSIntlAppId,
            c = $('<meta name="apple-itunes-app" content="app-id={appId}" />'.replace("{appId}", b));
        $("head").append(c)
    },
    showAndroidNotification: function(a) {
        a && this.$elem.find(".app-link").attr("href", "https://play.google.com/store/apps/details?id=" + this.androidUsAppId), this.$elem.show()
    }
}, Amex.Module.ArtistListRowModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.$elem.find(".row-list .row-item").first();
        this._$pagePlaylist = this.$elem.find(".row-list").clone(), this.currentIndex = 0, this.hidden = !1, this.hiddenTriggerPoint = 400, this.onResizeHandler()
    },
    bindEvents: function() {
        if (Amex.Events.on("window.resize", this.onResizeHandler, this), Amex.Events.on("window.orientationChange", this.onOrientationChange, this), this.$elem.find("[data-move-left]").click($.proxy(function(a) {
                a.preventDefault(), this.moveSlider(-1)
            }, this)), this.$elem.find("[data-move-right]").click($.proxy(function(a) {
                a.preventDefault(), this.moveSlider(1)
            }, this)), Amex.Browser.isMobileOrTablet()) {
            var a = this;
            Amex.Util.onSwipe(this.$elem, function(b) {
                a.moveSlider(b), a.updateProgressIndicator()
            })
        }
    },
    onOrientationChange: function() {
        this.onResizeHandler()
    },
    onResizeHandler: function() {
        var a = this.$elem.find(".amex-arrow"),
            b = this.$elem.find(".row-list .row-item"),
            c = $(window).width(),
            d = 2 * a.width(),
            e = this.itemWidth = b.outerWidth(!0),
            f = c - d,
            g = Math.min(5, b.length);
        this.sliderWidth = e;
        for (var h = 1, i = this.$elem.find(".progress-indicator"); g > h && this.sliderWidth < f - e;) this.sliderWidth += e, h += 1;
        $(".artists-container", this.$elem).width(this.sliderWidth), i.width(this.sliderWidth), this.itemsVisible = h, this.maxMoveIndex = b.length - this.itemsVisible + 1, h >= b.length ? (a.hide(), i.css("opacity", 0)) : Amex.Browser.isMobileOrTablet() ? i.css("opacity", 1) : a.show(), this.setSliderPositionAt(this.currentIndex)
    },
    updateProgressIndicator: function() {
        var a = this.$elem.find(".row-list .row-item").length - this.itemsVisible,
            b = this.currentIndex,
            c = $(".mobile-hero-progress-indicator--container .progress-indicator");
        this.setProgressIndicator(c, this.sliderWidth, b, a)
    },
    moveSlider: function(a) {
        this.currentIndex = (this.maxMoveIndex + this.currentIndex + a) % this.maxMoveIndex, this.setSliderPositionAt(this.currentIndex)
    },
    setSliderPositionAt: function(a) {
        a = (this.maxMoveIndex + a) % this.maxMoveIndex;
        var b = -(this.itemWidth * a);
        this.$elem.find(".row-list").css({
            transform: "translateX(" + b + "px)"
        })
    },
    setItemVisible: function(a) {
        var b = a.position();
        if (b) {
            var c = b.left,
                d = a.index(),
                e = Math.min(Math.floor(d / this.itemsVisible * (this.itemsVisible - 1)), this.maxMoveIndex - 1);
            (0 > c || c >= 112 * this.itemsVisible) && this.setSliderPositionAt(e)
        }
    },
    setProgressIndicator: function(a, b, c, d) {
        var e = b / 100 * 40,
            f = (b - e) / d * c,
            g = a.find(".progress-indicator--inner");
        g.css("left", f)
    }
}, Amex.Module.BackgroundMediaModule = {
    mediaClass: "media-item",
    mediaVisibleClass: "media-item_is_visible",
    init: function(a, b) {
        return this.$elem = $(b), this.resizeTimeout, this.options = $.extend({
            heroVersion: !1,
            noVideo: !1
        }, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        if (this.$window = $(window), this.mobileHeroImageTrigger = 769, this.activated = !1, this.isPlaying = !1, this.userPausedBackgroundLoop = !1, this.currentMediaIndex = 0, this.playlistAnimated = !1, this.useVideoBackground = !1, this.videoLoadedEvent = "canplaythrough", this.videoStartTimeoutId = null, this.videoStartTimeoutLength = (this.options.heroVersion, 800), this.slideshowIntervalId = null, this.slideshowIntervalLength = 6e3, this.$elem.find(".js-desktop-default").addClass(this.mediaVisibleClass), Amex.Browser.backgroundVideoSupported() && this.options.noVideo === !1 && this.$elem.find("video").length > 0) {
            this.useVideoBackground = !0;
            var a = "unstagedArtists";
            Amex.DataService.fetchLocalData(a).done($.proxy(function(a) {}, this)), Amex.Browser.isBrowser("firefox") && this.$elem.find("video").each(function() {
                var a = this,
                    b = $(a),
                    c = $(b.find("source"));
                c.attr("src", c.attr("src").replace("mp4", "ogv")), c.attr("type", c.attr("type").replace("mp4", "ogg")), b[0].load()
            })
        } else Amex.Util.loadAsyncImages(this.$elem);
        this.$toggleLoop = this.$elem.next("[data-toggle-background-loop-elem]")
    },
    bindEvents: function() {
        if (Amex.Events.on("window.scrollFrame", this.scrollHandler, this), Amex.Events.on("window.resize", this.onResizeHandler, this), this.$elem.find("video").on("ended", $.proxy(this.onVideoEndedHandler, this)), this.$toggleLoop.find("[data-toggle-background-loop]").click($.proxy(this.onToggleBackgroundLoopHandler, this)), Amex.Events.on("video.show", this.deactivate, this), Amex.Events.on("video.hide", this.scrollHandler, this), this.options.heroVersion && Amex.Events.on("heroArtist.requestNext", this.setNextMediaItem, this), this.useVideoBackground && Amex.Events.on("playlist.animated", this.onPlaylistAnimated, this), !(Amex.Browser.isMobileOrTablet() || "objectFit" in document.documentElement.style)) {
            var a = this.$elem.find("video.media-item"),
                b = this;
            a.each(function(a, c) {
                var d = $(c);
                d.on("loadedmetadata", function(a) {
                    b.checkVideoSize(a.target)
                })
            })
        }
    },
    onResizeHandler: function() {
        var a = this;
        clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
            a._offsetTop = a.$elem.offset().top, a.moduleHeight = a.$elem.height(), a.checkVideoSize(a.$elem.find("video.media-item")), a.setHeroImageVersion()
        }, 250)
    },
    onPlaylistAnimated: function() {
        this.playlistAnimated = !0, this.requestVideoPlay()
    },
    checkVideoSize: function(a) {
        if (!Amex.Browser.isMobileOrTablet()) {
            var b = Amex.Browser.getBrowserInfo();
            if (!("objectFit" in document.documentElement.style) || "safari" === b.name) {
                var c = $(a),
                    d = c.parent(),
                    e = d.outerWidth() - c.outerWidth(),
                    f = d.outerHeight() - c.outerHeight();
                e > f ? (c.removeClass("is-width-auto"), c.addClass("is-height-auto")) : (c.removeClass("is-height-auto"), c.addClass("is-width-auto"))
            }
        }
    },
    setHeroImageVersion: function() {
        var a = Amex.Global.windowWidth,
            b = "Mobile",
            c = "16x9";
        if (a < this.mobileHeroImageTrigger) {
            var d = b;
            b = c, c = d
        }
        this.$elem.find(".media-item[data-image]").each(function() {
            var a = $(this),
                d = a.css("background-image");
            a.css("background-image", d.replace(new RegExp(b, "g"), c))
        })
    },
    activate: function() {
        this.activated || (this.useVideoBackground ? (this.videoStartTimeoutId = window.setTimeout($.proxy(function() {
            this.requestVideoPlay()
        }, this), this.videoStartTimeoutLength), this.activated = !0) : Amex.Browser.isMobileOrTablet() || this.options.noSlideshow === !0 || Amex.Youtube.isActive() || (this.resumeSlideshow(), this.activated = !0))
    },
    deactivate: function() {
        this.activated && (this.useVideoBackground ? (window.clearTimeout(this.videoStartTimeoutId), this.pauseVideo()) : this.pauseSlideshow(), this.activated = !1)
    },
    scrollHandler: function(a) {
        this.isModuleInViewport(a) ? this.activate() : this.deactivate()
    },
    loadVideo: function(a) {
        var b = this.getVideo(),
            c = $(b),
            d = this.$elem.find("[data-image]." + this.mediaClass).get(a);
        if (c.data("artist-id") != $(d).data("artist-id")) {
            c.data("artist-id", $(d).data("artist-id"));
            var e = $(c.find("source"));
            e.attr("src", $(d).data("video-url")), Amex.Browser.isBrowser("firefox") && e.attr("src", e.attr("src").replace("mp4", "ogv")), c.load()
        }
        if (!c.data("isLoading")) {
            var f = $.proxy(function() {
                this.checkVideoSize(c),
                    c.off(this.videoLoadedEvent, f), this.$toggleLoop.find("[data-toggle-background-loop]").show(), c.data("isLoading", !1), c.data(this.videoLoadedEvent, !0), b.pause(), a === this.currentMediaIndex && this.requestVideoPlay()
            }, this);
            c.data(this.videoLoadedEvent) ? f() : (c.data("isLoading", !0), c.on(this.videoLoadedEvent, f), b.readyState > 3 && f(), b.muted = !0, b.play())
        }
    },
    onVideoEndedHandler: function(a) {
        this.$elem.find(".js-media-image").removeClass(this.mediaVisibleClass);
        var b = a.target;
        b.currentTime = 0, b.pause(), b === this.getVideo() && (this.loadVideo(this.getNextIndex(this.currentMediaIndex)), this.setNextMediaItem())
    },
    requestVideoPlay: function() {
        return !this.playlistAnimated || this.userPausedBackgroundLoop || Amex.Youtube.isActive() ? void 0 : this.isVideoLoaded(this.currentMediaIndex) ? void(this.isModuleInViewport() && this.playVideo()) : void this.loadVideo(this.currentMediaIndex)
    },
    playVideo: function() {
        var a = this.getVideo();
        $(a).addClass(this.mediaVisibleClass), a.play(), this.isPlaying = !0, this.triggerArtistUpdated()
    },
    pauseVideo: function() {
        var a = this.getVideo(),
            b = $(this.getImage(this.currentMediaIndex));
        a.pause(), this.userPausedBackgroundLoop || this.options.heroVersion || ($(a).removeClass(this.mediaVisibleClass), Amex.Util.loadAsyncImages(b), b.addClass(this.mediaVisibleClass)), this.isPlaying = !1
    },
    onToggleBackgroundLoopHandler: function(a) {
        if (a.preventDefault(), this.userPausedBackgroundLoop = !this.userPausedBackgroundLoop, this.$toggleLoop.find(".toggle-background-loop").toggleClass("toggle-background-loop_paused", this.userPausedBackgroundLoop), this.userPausedBackgroundLoop) {
            var b = this.getVideo();
            b && b.pause()
        } else this.requestVideoPlay()
    },
    setNextMediaItem: function(a) {
        this.currentMediaIndex = this.getNextIndex(this.currentMediaIndex, a), this.useVideoBackground ? this.requestVideoPlay() : this.showCurrentSlide()
    },
    triggerArtistUpdated: function() {
        this.options.heroVersion && Amex.Events.trigger("heroArtist.updated", {
            index: this.currentMediaIndex,
            artistId: $(this.getImage(this.currentMediaIndex)).attr("data-artist-id")
        })
    },
    showCurrentSlide: function() {
        var a = $(this.getImage(this.currentMediaIndex));
        this.$elem.find("." + this.mediaClass).removeClass(this.mediaVisibleClass), a.addClass(this.mediaVisibleClass), this.triggerArtistUpdated()
    },
    resumeSlideshow: function() {
        this.slideshowIntervalId = window.setInterval($.proxy(function() {
            this.setNextMediaItem()
        }, this), this.slideshowIntervalLength)
    },
    pauseSlideshow: function() {
        window.clearInterval(this.slideshowIntervalId)
    },
    isModuleInViewport: function(a) {
        var b = this.$window;
        "number" != typeof a && (a = b.scrollTop());
        var c = Amex.Global.windowHeight;
        if (this.options.heroVersion) return c > a;
        var d = this._offsetTop,
            e = this.moduleHeight,
            f = e / 2,
            g = a + c / 2;
        return Math.abs(g - (d + f)) < f ? !0 : !1
    },
    isVideoLoaded: function(a) {
        return $(this.getVideo()).data(this.videoLoadedEvent)
    },
    getVideo: function() {
        return this.$elem.find("video." + this.mediaClass).get(0)
    },
    getImage: function(a) {
        return this.$elem.find("[data-image]." + this.mediaClass).get(a)
    },
    getNextIndex: function(a, b) {
        b = "number" == typeof b ? b : 1;
        var c = this.$elem.find("[data-image]." + this.mediaClass).length;
        return (c + a + b) % c
    }
}, Amex.Module.BrowserInfoModule = {
    euCountries: ["FR", "DE", "IT", "NL", "ES", "GB", "IE", "PL", "SE"],
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        if (this.cookieName = "euCookiesAccepted", this.geoDataFailed = !1, this.upgradeMessageAccepted = Amex.Browser.isBrowser("ie", 0, 9) ? !1 : !0, Amex.Cookies.hasItem(this.cookieName) ? setTimeout(function() {
                Amex.Events.trigger("cookies.accepted")
            }, 0) : Amex.DataService.fetchGeoData().error($.proxy(function() {
                this.geoDataFailed = !0, this.tryShowCookieMessage()
            }, this)), Amex.Browser.isBrowser("ie", 0, 9)) {
            var a = this;
            setTimeout(function() {
                a.showMessage("upgrade")
            }, 0)
        }
    },
    bindEvents: function() {
        this.$elem.find("[data-close]").click($.proxy(this.onCloseClick, this)), Amex.Events.on("geoData.updated", this.onGeoDataUpdated, this), Amex.Events.on("cookies.accepted", this.onCookiesAccepted, this)
    },
    onCookiesAccepted: function() {
        var a = this.$elem;
        setTimeout(function() {
            a.remove()
        }, 800)
    },
    tryShowCookieMessage: function() {
        if (!Amex.Cookies.hasItem(this.cookieName) && this.upgradeMessageAccepted) {
            var a = Amex.DataService.geoData;
            if (a || this.geoDataFailed)
                if (a) {
                    var b = a.country; - 1 !== $.inArray(b, this.euCountries) && this.showMessage("cookies")
                } else this.showMessage("cookies")
        }
    },
    onGeoDataUpdated: function() {
        this.tryShowCookieMessage()
    },
    onCloseClick: function(a) {
        a.preventDefault();
        var b = this.$elem;
        b.removeClass("browser-info-module_is_visible");
        var c = b.find(".browser-message_active").attr("data-message-type");
        "cookies" === c ? (Amex.Cookies.setItem(this.cookieName, !0, 1 / 0), Amex.Events.trigger("cookies.accepted")) : "upgrade" === c && (this.upgradeMessageAccepted = !0, this.tryShowCookieMessage())
    },
    showMessage: function(a) {
        this.$elem.css("max-height", Amex.Global.windowHeight);
        var b = this.$elem.find(".browser-message");
        b.removeClass("browser-message_active");
        var c = b.filter('[data-message-type="' + a + '"]');
        c.addClass("browser-message_active"), setTimeout($.proxy(function() {
            this.$elem.addClass("browser-info-module_is_visible")
        }, this), 0)
    }
}, Amex.Module.CountdownModule = {
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.countdownIntervalTime = 500, this.countdownIntervalId = null, this.refreshDateIntervalTime = 6e4, this.refreshDateIntervalId = window.setInterval($.proxy(this.fetchTargetDate, this), this.refreshDateIntervalTime), this.fetchTargetDate()
    },
    bindEvents: function() {
        Amex.Events.on("eventInfo.updated", this.onEventInfoUpdated, this)
    },
    updateCountdown: function() {
        var a = Math.max(this.targetDate - (new Date).getTime()),
            b = Math.floor(a / 864e5),
            c = Math.floor(a / 36e5) % 24,
            d = Math.floor(a / 6e4) % 60,
            e = Math.floor(a / 1e3) % 60;
        this.$elem.find("[data-days]").text(this.zeroPrefix(b)), this.$elem.find("[data-hours]").text(this.zeroPrefix(c)), this.$elem.find("[data-minutes]").text(this.zeroPrefix(d)), this.$elem.find("[data-seconds]").text(this.zeroPrefix(e))
    },
    zeroPrefix: function(a) {
        return 0 > a ? "00" : (a >= 0 && 10 > a ? "0" : "") + a
    },
    fetchTargetDate: function() {
        Amex.DataService.fetchEventInfo(this.options.eventId)
    },
    onEventInfoUpdated: function() {
        var a = this.options.eventId,
            b = Amex.DataService.eventData[a];
        b && (this.targetDate = new Date((new Date).getTime() + 1e3 * b.seconds_remaining), this.countdownIntervalId || (this.countdownIntervalId = window.setInterval($.proxy(this.updateCountdown, this), this.countdownIntervalTime)), this.$elem.find("[data-date]").text(this.formattedDate(this.targetDate)), this.$elem.find("[data-time]").text(this.formattedTime(this.targetDate)), this.updateCountdown(), this.$elem.addClass("countdown-module_visible"))
    },
    formattedDate: function(a) {
        return this.monthNames[a.getMonth()] + " " + a.getDate() + ", " + a.getFullYear()
    },
    formattedTime: function(a) {
        var b = a.getHours(),
            c = a.getMinutes(),
            d = b >= 12 ? "pm" : "am";
        b %= 12, b = b ? b : 12, c = 10 > c ? "0" + c : c;
        var e = b + ":" + c + " " + d;
        return e
    }
}, Amex.Module.ExploreUnstagedArtistsModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.$airArtists = [], this.$allArtists = !1, this.bindEvents(), this.setup(), this
    },
    setup: function() {
        Amex.DataService.fetchLocalData("unstagedArtists");
        var a = "airArtists";
        Amex.DataService.fetchLocalData(a).done($.proxy(function(a) {
            a && $(Amex.DataService.localData.airArtists).each($.proxy(function(a, b) {
                Amex.Util.isArtistIdInList(b.id, ["raesremmurd", "borns", "piamia", "gavinjames"]) && this.$airArtists.push(b)
            }, this))
        }, this))
    },
    bindEvents: function() {
        Amex.Events.on("localData.updated", this.randomizeArtists, this)
    },
    randomizeArtists: function() {
        if (Amex.DataService.localData.unstagedArtists) {
            Amex.Events.off("localData.updated", this.randomizeArtists, this), this.$allArtists = this.$airArtists.concat(Amex.DataService.localData.unstagedArtists);
            for (var a = this.$allArtists.slice(0), b = this.$elem.find(".unstaged-artist"), c = 0; c < b.length; c++) {
                var d = $(b[c]),
                    e = Math.floor(Math.random() * a.length),
                    f = a[e];
                a.splice(e, 1);
                var g = f.name,
                    h = Amex.getAssetsPath(f.artistImages.square[0]),
                    i = Amex.getPagePath(f.artistpagelink);
                d.attr("href", i), d.find("img").attr("src", h), d.find(".unstaged-artist--name").text(g)
            }
        }
    }
}, Amex.Module.FollowUsOverlayModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.bindEvents(), this
    },
    bindEvents: function() {
        Amex.Events.on("followusoverlay.toggle", this.toggleOverlay, this), this.$elem.find("[data-close]").click(function(a) {
            a.preventDefault(), Amex.Events.trigger("followusoverlay.toggle", {
                show: !1
            })
        })
    },
    toggleOverlay: function(a) {
        a ? this.$elem.toggleClass("follow-us-overlay-module_visible", !!a.close) : this.$elem.toggleClass("follow-us-overlay-module_visible")
    }
}, Amex.Module.HeaderModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.bindEvents(), this
    },
    bindEvents: function() {
        this.options.sticky && Amex.Events.on("window.scrollFrame", this.onScrollHandler, this)
    },
    onScrollHandler: function(a) {
        this.$elem.addClass("header-container_sticky");
        var b = this.$elem.offset().top;
        this.$elem.toggleClass("header-container_sticky", b > a)
    }
}, Amex.Module.HeroModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({
            noPlaylist: !1
        }, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        if (this.$heroModule = this.$elem.find(".hero-module"), this.$heroContent = this.$elem.find(".hero-content"), this.$heroOverlay = this.$elem.find(".hero-overlay"), this.currentArtistIndex = 0, this.currentArtistId = null, Amex.Browser.isBrowser("ie", 0, 8)) {
            var a = this.$elem.find(".media-item");
            a.hide(), a.first().show()
        }
        this.options.noPlaylist && setTimeout(function() {
            Amex.Events.trigger("playlist.animated")
        }, 0), Amex.Browser.backgroundVideoSupported() && this.$elem.find(".js-desktop-default").addClass("title_is_visible")
    },
    bindEvents: function() {
        Amex.Browser.isMobileOrTablet() || Amex.Browser.isBrowser("ie", 0, 9) || (Amex.Events.on("window.scrollFrame", this.updateScrollEffect, this), Amex.Events.on("window.resize", this.onResizeHandler, this)), this.$elem.find("[data-video-play]").click($.proxy(this.onVideoPlayClick, this)), Amex.Events.on("heroArtist.updated", this.onHeroArtistUpdated, this)
    },
    onResizeHandler: function() {
        this._contentHeight = this.$heroContent.height()
    },
    onVideoPlayClick: function(a) {
        a.preventDefault();
        var b = $(a.target).closest("[data-video-id]");
        this.options.noPlaylist ? Amex.Youtube.openVideo({
            videoId: b.attr("data-video-id")
        }) : null !== this.currentArtistId ? Amex.Events.trigger("playlist.requestPlayArtistId", this.currentArtistId) : Amex.Events.trigger("playlist.requestPlay", this.currentArtistIndex)
    },
    onHeroArtistUpdated: function(a) {
        var b = this.$elem.find(".title"),
            c = $(b.get(a.index));
        a.artistId && "static-image" !== a.artistId ? (c = b.filter('[data-artist-id="' + a.artistId + '"]'), this.currentArtistId = a.artistId) : this.currentArtistId = null, 0 !== c.length && b.removeClass("title_is_visible"), c.addClass("title_is_visible"), this.currentArtistIndex = a.index
    },
    updateScrollEffect: function(a) {
        var b = Math.round(.9 * Amex.Global.windowWidth),
            c = a / b;
        if (c >= 1) return void this.$heroModule.hide();
        this.$heroModule.show(), 0 >= c ? this.$heroOverlay.hide() : this.$heroOverlay.show().css({
            "-ms-filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + c + ")",
            opacity: c
        });
        var d = this._contentHeight,
            e = c / 15 * -b,
            f = "translate3d(0px," + (e - d / 2) + "px, 0px)";
        this.$heroContent.css({
            "-moz-transform": f,
            "-webkit-transform": f,
            "-o-transform": f,
            "-ms-transform": f,
            transform: f
        })
    }
}, Amex.Module.LivestreamPlayerModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        if (this.pollDataIntervalTime = 3e4, this.pollDataIntervalId = window.setInterval($.proxy(this.fetchPollData, this), this.pollDataIntervalTime), this.cameraUnlocked = !1, Amex.Browser.isMobileOrTablet()) this.isBrowser = !1;
        else {
            this.setCameraAngle(this.$elem.find("[data-camera-id]").attr("data-camera-id"));
            var a = this.$elem.find(".livestream-player-drawer");
            window.setTimeout($.proxy(function() {
                this.fetchPollData(), a.addClass("livestream-player-drawer_is_visible")
            }, this), 5e3), this.isBrowser = !0
        }
    },
    bindEvents: function() {
        this.$elem.find(".livestream-player-drawer--arrow").click(function(a) {
            a.preventDefault();
            var b = $(this);
            b.closest(".livestream-player-drawer").hasClass("livestream-player-drawer_is_visible") || Amex.Tracking.trackRmAction(b.attr("data-tracking-rmaction-manual")), b.closest(".livestream-player-drawer").toggleClass("livestream-player-drawer_is_visible")
        }), this.$elem.bind("click", "[data-camera-id]", $.proxy(this.onCameraAngleClickHandler, this)), Amex.Events.on("polls.updated", this.onPollDataUpdated, this);
        var a = this;
        twttr.ready(function(b) {
            b.events.bind("tweet", $.proxy(a.onTweetIntentReceived, a)), Amex.Browser.isBrowser("ie") && b.events.bind("click", $.proxy(a.onTweetIntentReceived, a))
        }), Amex.Events.on("window.resize", this.onResizeHandler, this)
    },
    onResizeHandler: function() {
        this.isBrowser || (this.mediaQuery ? (this.$elem.addClass("mobile-hide"), this.$elem.parent().find(".livestream-player-module_mobile").addClass("mobile-show")) : (this.$elem.removeClass("mobile-hide"), this.$elem.parent().find(".livestream-player-module_mobile").removeClass("mobile-show")))
    },
    onCameraAngleClickHandler: function(a) {
        var b = $(a.target).closest("[data-camera-id]"),
            c = b.attr("data-camera-id");
        c && (a.preventDefault(), this.setCameraAngle(c))
    },
    setCameraAngle: function(a) {
        var b = this.$elem.find('[data-camera-id="' + a + '"]');
        Amex.Youtube.openVideo({
            videoId: a,
            $container: this.$elem.find("#livestream-player-container"),
            noForceCreate: !0,
            noTracking: !0
        }), this.$elem.find(".camera-angle_selected").removeClass("camera-angle_selected"), b.addClass("camera-angle_selected")
    },
    fetchPollData: function() {
        Amex.DataService.fetchPollData(this.options.pollId)
    },
    onPollDataUpdated: function() {
        var a = this.options.pollId,
            b = Amex.DataService.pollData[a];
        if (b) {
            for (var c = this.$elem.find(".vote-song"), d = 0; 2 > d; d++) {
                var e = $(c.get(d)),
                    f = b.results[d],
                    g = 100 * f.total;
                g = g - Math.floor(g) === .5 && 1 === d ? Math.floor(g) : Math.round(g), e.find(".vote-link").attr("href", this.buildTweetIntent(f.keywords)), e.find(".song-title").text(f.name), Amex.Animation.animateNoiseMeter(e, g, void 0, !0)
            }
            var h = Math.max.apply(Math, c.map(function() {
                return $(this).find(".song-title").height()
            }).toArray());
            c.find(".song-title").height(h)
        }
    },
    buildTweetIntent: function(a) {
        var b = a.join(" ");
        return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(b)
    },
    onTweetIntentReceived: function(a) {
        var b = a.target,
            c = !1;
        this.$elem.find(".vote-link").each(function() {
            b === this && (c = !0)
        }), c && this.unlockCameraAngle()
    },
    unlockCameraAngle: function() {
        var a = "livestream";
        Amex.DataService.fetchLocalData(a).done($.proxy(function(a) {
            if (a) {
                var b = a.cameraAngles[3],
                    c = this.$elem.find(".camera-angle_locked");
                c.removeClass("camera-angle_locked"), c.attr("data-camera-id", b.id), c.attr("data-camera-title", b.title), c.find(".icon").removeClass("icon-lock").addClass("icon-cam"), c.find(".locked-stripes").remove(), this.$elem.find(".vote-title").hide(), this.$elem.find(".vote-title_unlocked").show()
            }
        }, this)), this.cameraUnlocked = !0
    }
}, Amex.Module.LivestreamSongPolls = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.pollDataIntervalTime = 3e4, this.pollDataIntervalId = window.setInterval($.proxy(this.fetchPollData, this), this.pollDataIntervalTime)
    },
    bindEvents: function() {
        this.$elem.find(".livestream-player-drawer--arrow").click(function(a) {
            a.preventDefault();
            var b = $(this);
            b.closest(".livestream-player-drawer").hasClass("livestream-player-drawer_is_visible") || Amex.Tracking.trackRmAction(b.attr("data-tracking-rmaction-manual")), b.closest(".livestream-player-drawer").toggleClass("livestream-player-drawer_is_visible")
        }), this.$elem.bind("click", "[data-camera-id]", $.proxy(this.onCameraAngleClickHandler, this)), Amex.Events.on("polls.updated", this.onPollDataUpdated, this);
        var a = this;
        twttr.ready(function(b) {
            b.events.bind("tweet", $.proxy(a.onTweetIntentReceived, a)), Amex.Browser.isBrowser("ie") && b.events.bind("click", $.proxy(a.onTweetIntentReceived, a))
        }), Amex.Events.on("window.resize", this.onResizeHandler, this)
    },
    fetchPollData: function() {
        Amex.DataService.fetchPollData(this.options.pollId)
    },
    onPollDataUpdated: function() {
        var a = this.options.pollId,
            b = Amex.DataService.pollData[a];
        if (b) {
            for (var c = this.$elem.find(".vote-song"), d = 0; 2 > d; d++) {
                var e = $(c.get(d)),
                    f = b.results[d],
                    g = 100 * f.total;
                g = g - Math.floor(g) === .5 && 1 === d ? Math.floor(g) : Math.round(g), e.find(".vote-link").attr("href", this.buildTweetIntent(f.keywords)), e.find(".song-title").text(f.name), Amex.Animation.animateNoiseMeter(e, g, void 0, !0), 1 === f.total ? (e.addClass("active"), e.removeClass("inactive"), e.closest(".vote--container").find(".PollUnlocked").text(f.name), e.closest(".slide-item").addClass("unlocked")) : f.total < 1 && (e.removeClass("active"), e.addClass("inactive")), e.each(function() {
                    1 == !$(this).closest(".slide-item").find(".active").length && ($(this).closest(".slide-item").removeClass("unlocked"), e.removeClass("inactive"))
                })
            }
            var h = Math.max.apply(Math, c.map(function() {
                return $(this).find(".song-title").height()
            }).toArray());
            c.find(".song-title").height(h)
        }
    },
    buildTweetIntent: function(a) {
        var b = a.join(" ");
        return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(b)
    },
    onTweetIntentReceived: function(a) {
        var b = a.target,
            c = !1;
        this.$elem.find(".vote-link").each(function() {
            b === this && (c = !0)
        }), c && this.unlockCameraAngle()
    }
};
var $slide = $(".slide-item"),
    $slideGroup = $(".livestream-carousel"),
    $bullet = $(".bullet"),
    $prevBtn = $(".slide-nav").find(".btn-prev"),
    $nextBtn = $(".slide-nav").find(".btn-next"),
    slidesTotal = $slide.length - 1,
    current = 0,
    isAutoSliding = !0;
$bullet.first().addClass("current");
var clickSlide = function() {
        isAutoSliding = !1;
        var a = $bullet.index($(this));
        updateIndex(a)
    },
    updateIndex = function(a) {
        isAutoSliding ? current === slidesTotal ? current = 0 : current++ : current = a, $bullet.removeClass("current"), $bullet.eq(current).addClass("current"), transition(current)
    },
    transition = function(a) {
        $slideGroup.animate({
            left: "-" + a + "00%"
        })
    };
$bullet.on("click", clickSlide), $bullet.on("click", function() {
    0 === current ? ($prevBtn.removeClass("active"), $prevBtn.addClass("inactive"), $nextBtn.addClass("active"), $nextBtn.removeClass("inactive")) : 1 === current && ($nextBtn.removeClass("active"), $nextBtn.addClass("inactive"), $prevBtn.addClass("active"), $prevBtn.removeClass("inactive"))
}), $prevBtn.addClass("inactive"), $prevBtn.on("click", function() {
    current === slidesTotal ? current = 0 : current--, $bullet.removeClass("current"), $bullet.eq(current).addClass("current"), 0 === current ? ($(this).addClass("inactive"), $(this).removeClass("active")) : ($(this).addClass("active"), $(this).removeClass("inactive")), $nextBtn.removeClass("inactive"), transition(current)
}), $nextBtn.on("click", function() {
    current === slidesTotal ? current = 0 : current++, $bullet.removeClass("current"), $bullet.eq(current).addClass("current"), 1 === current ? ($(this).addClass("inactive"), $(this).removeClass("active")) : ($(this).addClass("active"), $(this).removeClass("inactive")), $prevBtn.removeClass("inactive"), transition(current)
});
var $pollIntro = $(".livestream-poll-intro"),
    $beginPollsBtn = $pollIntro.find(".btn-begin"),
    $slideNav = $(".slide-nav");
$pollIntro.length && $beginPollsBtn.on("click touchend", function() {
    $pollIntro.addClass("hide"), $slideGroup.addClass("show"), $slideNav.addClass("show")
}), Amex.Module.MediaGalleryModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.shouldAnimateTransition() && !Amex.Browser.isMobileOrTablet() && (this.doStartAnimation = !0, this.setupBlockAnimationPositions(this.$elem.find(".media-tile--block"), "right"))
    },
    bindEvents: function() {
        this.$elem.find(".amex-arrow").click($.proxy(this.onArrowClickHandler, this)), this.$elem.on("click", ".media-tile", $.proxy(this.onTileClickHandler, this)), Amex.Events.on("photoGallery.close", this.onPhotoGalleryCloseHandler, this), Amex.Util.artistDataPromise().done($.proxy(function(a) {
            this.getTotalMediaItems(a) > 6 && this.$elem.addClass("media-gallery_has_more")
        }, this)), this.doStartAnimation && Amex.Events.on("window.scrollFrame", this.onScrollHandler, this), this.setupMediaBlock(this.$elem.find(".media-tile--block"))
    },
    fitVideoText: function(a) {
        a.find(".media-tile_video").each(function() {
            var a = $(this),
                b = .4 * parseInt(a.css("height"), 10),
                c = a.find(".title"),
                d = c.text().split(/\s+/);
            if (c.height() > b) {
                d.push("...");
                do d.splice(-2, 1), c.text(d.join(" ")); while (d.length && c.height() > b)
            }
        })
    },
    setupMediaBlock: function(a) {
        Amex.Browser.isTouchDevice() && Amex.Util.onSwipe(a, $.proxy(function(a) {
            this.setNextMediaBlock(a)
        }, this)), this.fitVideoText(this.$elem.find(".media-tile--block"))
    },
    onTileClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target).closest(".media-tile");
        b.hasClass("media-tile_video") ? this.onVideoClickHandler(b) : this.onPhotoTileClickHandler(b)
    },
    onScrollHandler: function(a) {
        var b = this.$elem.offset(),
            c = 100;
        if (a + Amex.Global.windowHeight > b.top + c) {
            var d = this.$elem.find(".media-tile--block");
            this.animateBlocks(null, d, "left"), Amex.Events.off("window.scrollFrame", this.onScrollHandler, this)
        }
    },
    onPhotoGalleryCloseHandler: function() {
        this.$elem.show()
    },
    onPhotoTileClickHandler: function(a) {
        var b = a.find(".image-substitute").attr("data-image-src");
        Amex.Util.artistDataPromise().done($.proxy(function(a) {
            var c = a.artistImages.gallery.concat(),
                d = 0;
            c = $.map(c, function(a, c) {
                var e = Amex.getAssetsPath(a);
                return a === b && (d = c), {
                    src: e,
                    title: "Photo " + c
                }
            });
            var e = {
                artist: {
                    name: a.name
                },
                images: c,
                index: d
            };
            Amex.Events.trigger("photoGallery.requestOpen", e), this.$elem.hide()
        }, this))
    },
    onArrowClickHandler: function(a) {
        a.preventDefault();
        var b = parseInt($(a.target).attr("data-direction"), 10);
        this.setNextMediaBlock(b)
    },
    onVideoClickHandler: function(a) {
        var b = a.find("[data-video-id]"),
            c = b.attr("data-video-id");
        Amex.Youtube.openVideo({
            videoId: c
        })
    },
    setActiveMediaBlock: function(a) {
        var b = this.$elem.find(".media-tile--block"),
            c = $(b.get(a));
        b.removeClass("media-tile--block_active"), c.addClass("media-tile--block_active"), Amex.Animation.setProgressIndicator(this.$elem.find(".progress-indicator"), a, b.length)
    },
    setNextMediaBlock: function(a) {
        this.animationLocked || this.$elem.hasClass("media-gallery_has_more") === !1 || (this.animationLocked = !0, Amex.Util.artistDataPromise().done($.proxy(function(b) {
            var c = this.$elem.find(".media-tile--block"),
                d = parseInt(c.attr("data-media-block-index"), 10),
                e = this.getNextBlockStartIndex(b, d, a),
                f = this.getMediaItems(b, e),
                g = this.getProgress(b, e);
            Amex.Animation.setProgressIndicator(this.$elem.find(".progress-indicator"), g.index, g.count);
            var h = c.clone(),
                i = this.$elem.find(".media-tile_template").clone().removeClass("media-tile_template");
            h.empty(), h.hide(), h.attr("data-media-block-index", e);
            for (var j = 0; j < f.length; j++) {
                var k = i.clone(),
                    l = f[j];
                k.find(".image-substitute").css("background-image", 'url("' + Amex.getAssetsPath(l.src) + '")'), k.addClass("media-tile_" + j), k.addClass("media-tile_" + l.type), "video" === l.type ? (k.find("[data-video-title]").text(l.title), k.find("[data-video-id]").attr("data-video-id", l.id)) : (k.attr("data-tracking-rmaction", "MediaGallery"), k.find(".title").remove(), k.find("[data-image-src]").attr("data-image-src", l.src)), h.append(k)
            }
            h.insertAfter(c), this.setupMediaBlock(h), this.shouldAnimateTransition() ? this.animateBlocks(c, h, -1 === a ? "right" : "left") : this.switchBlock(c, h)
        }, this)))
    },
    getProgress: function(a, b) {
        var c = this.getTotalMediaItems(a);
        return {
            count: Math.floor(c / 6) + (c % 6 === 0 ? 0 : 1),
            index: Math.floor(b / 6)
        }
    },
    getNextBlockStartIndex: function(a, b, c) {
        var d = this.getTotalMediaItems(a),
            e = b + 6 * c;
        return e >= d && (e = 0), 0 > e && (e = d - (d % 6 === 0 ? 6 : d % 6)), e
    },
    getMediaItems: function(a, b) {
        for (var c = [], d = b; d < a.videos.length && c.length < 6; d++) c.push({
            src: a.videos[d].image,
            title: a.videos[d].title,
            id: a.videos[d].id,
            type: "video"
        });
        var e = a.artistImages.gallery ? a.artistImages.gallery.length : 0;
        for (d = b - a.videos.length + c.length; e > d && c.length < 6; d++) c.push({
            src: a.artistImages.gallery[d],
            type: "image"
        });
        return c
    },
    switchBlock: function(a, b) {
        b.show(), a.remove(), this.animationLocked = !1
    },
    animateBlocks: function(a, b, c) {
        var d, e = this.getTileOutsidePosition,
            f = "left" === c ? "right" : "left";
        d = "right" === c ? ["4", "3", "1", "5", "2", "0"] : ["1", "2", "4", "0", "3", "5"];
        var g = "media-tile_transition_" + d.join(" media-tile_transition_"),
            h = 1e3,
            i = b.find(".media-tile");
        i.each(function(a) {
            var b = $(this);
            b.addClass("media-tile_transition_" + d[a]), b.css(Amex.Browser._css3dTransformsStyleName, "translate3d(" + e(b, f) + "px,0,0)")
        });
        var j = null;
        a ? (j = a.find(".media-tile"), j.removeClass("media-tile_transition"), j.css(Amex.Browser._css3dTransformsStyleName, "translate3d(0,0,0)"), j.removeClass(g)) : h = 0;
        var k = this;
        setTimeout(function() {
            j && (j.addClass("media-tile_transition"), j.each(function(a) {
                var b = $(this);
                b.addClass("media-tile_transition_" + d[a]), b.css(Amex.Browser._css3dTransformsStyleName, "translate3d(" + e(b, c) + "px,0,0)")
            }), setTimeout(function() {
                a.remove()
            }, 1400)), b.show(), setTimeout(function() {
                i.addClass("media-tile_transition"), i.css(Amex.Browser._css3dTransformsStyleName, "translate3d(0,0,0)"), setTimeout(function() {
                    k.animationLocked = !1
                }, 1500)
            }, h)
        }, 50)
    },
    setupBlockAnimationPositions: function(a, b) {
        var c = this.getTileOutsidePosition;
        a.find(".media-tile").each(function() {
            var a = $(this);
            a.css(Amex.Browser._css3dTransformsStyleName, "translate3d(" + c(a, b) + "px,0,0)")
        })
    },
    getTileOutsidePosition: function(a, b) {
        var c = a.offset().left,
            d = $(window).width();
        return "left" === b ? -(c + d) : d + c
    },
    shouldAnimateTransition: function() {
        return Amex.Browser.css3dTransformSupported() ? "none" !== $(".media-tile").css("float") ? !1 : !0 : !1
    },
    getTotalMediaItems: function(a) {
        var b = a.artistImages.gallery ? a.artistImages.gallery.length : 0;
        return a.videos.length + b
    }
}, Amex.Module.MenuModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.menuItemHeight = null, this.maxMoveIndex = null, this.artistWrapperIndex = 0, this.hoverDirection = 0, this.isAnimating = !1, this.hoverIntervalTime = 250, this.moveMenuArtists = $.proxy(this.moveMenuArtists, this)
    },
    bindEvents: function() {
        this.$elem.find(".menu-wrapper a").click($.proxy(this.menuLinkClickHandler, this)), this.$elem.find(".collapsed-menu").click($.proxy(this.toggleMenuHandler, this)), this.$elem.find("[data-arrow-direction]").hover($.proxy(this.onArrowHoverIn, this), $.proxy(this.onArrowHoverOut, this))
    },
    onArrowHoverIn: function(a) {
        this.hoverDirection = parseInt($(a.target).attr("data-arrow-direction"), 10), this.moveMenuArtists()
    },
    onArrowHoverOut: function(a) {
        this.hoverDirection = 0
    },
    setupMenuArtistValues: function() {
        if (!this.menuItemHeight || !this.maxMoveIndex) {
            var a = this.$elem.find(".menu-wrapper--artists"),
                b = a.find(".menu-item"),
                c = a.height();
            this.menuItemHeight = b.outerHeight(!0), this.maxMoveIndex = Math.max(0, b.length - Math.round(c / this.menuItemHeight))
        }
    },
    moveMenuArtists: function() {
        if (0 !== this.hoverDirection && !this.isAnimating) {
            this.setupMenuArtistValues();
            var a = this.artistWrapperIndex * this.menuItemHeight;
            this.artistWrapperIndex += this.hoverDirection, this.artistWrapperIndex < 0 && (this.artistWrapperIndex = 0), this.artistWrapperIndex > this.maxMoveIndex && (this.artistWrapperIndex = this.maxMoveIndex);
            var b = this.artistWrapperIndex * this.menuItemHeight;
            if (a !== b) {
                this.isAnimating = !0;
                var c = this,
                    d = this.$elem.find(".menu-wrapper--artists-inner");
                Amex.Animation.animate(a, b, this.hoverIntervalTime, function(a) {
                    d.css("transform", "translateY(" + -a + "px)")
                }, Amex.Animation._linear).done(function() {
                    c.isAnimating = !1, c.moveMenuArtists()
                })
            }
        }
    },
    toggleMenuHandler: function(a) {
        a.preventDefault(), this.$elem.find(".menu-module").toggleClass("open"), $("body").toggleClass("menu-opened")
    },
    onMenuClickHandler: function(a) {
        if (a.preventDefault(), Amex.Browser.isTouchDevice()) {
            var b = $(a.target).closest(".menu"),
                c = $("body");
            b.toggleClass("open"), c.toggleClass("menu-opened")
        }
    },
    menuLinkClickHandler: function(a) {
        var b = $(a.target).closest("a");
        b.closest(".menu");
        void 0 !== b.attr("data-follow-us") && (a.preventDefault(), Amex.Events.trigger("followusoverlay.toggle"))
    }
}, Amex.Module.NoiseMeterModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({
            noiseId: null,
            isFirst: !1
        }, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        var a = this.options.isFirst;
        this.updateIntervalTime = 2e4, this.updateIntervalId = null, a && this.setupNoiseMeterIntervalPoll()
    },
    setupNoiseMeterIntervalPoll: function() {
        Amex.DataService.fetchPollData(this.options.noiseId), this.updateIntervalId = window.setInterval($.proxy(function() {
            Amex.DataService.fetchPollData(this.options.noiseId)
        }, this), this.updateIntervalTime)
    },
    bindEvents: function() {
        Amex.Events.on("polls.updated", this.onNoiseMetersUpdatedHandler, this), this.options.isFirst || Amex.Events.on("noiseMeters.unlocked", this.onNoiseMeterUnlockedHandler, this), Amex.Events.on("window.scrollFrame", this.onScrollHandler, this), this.$elem.find(".js-facebook-share").on("click", this.onFacebookShareClick.bind(this))
    },
    onNoiseMeterUnlockedHandler: function() {
        Amex.Events.off("noiseMeters.unlocked", this.onNoiseMeterUnlockedHandler, this), this.$elem.removeClass("noise-meter-module_locked"), this.setupNoiseMeterIntervalPoll()
    },
    onNoiseMetersUpdatedHandler: function() {
        var a = Amex.DataService.pollData[this.options.noiseId];
        a && (this.noiseDataUpdated = !0, (Amex.Browser.isMobileOrTablet() || Amex.Util.isElementInActiveViewport(this.$elem)) && this.updateNoiseMeterValues())
    },
    onFacebookShareClick: function(a) {
        Amex.DataService.postPollData(this.$elem.data("noise-id"), this.$elem.data("noise-choice-name"))
    },
    onScrollHandler: function() {
        this.noiseDataUpdated && Amex.Util.isElementInActiveViewport(this.$elem) && this.updateNoiseMeterValues()
    },
    updateNoiseMeterValues: function() {
        this.noiseDataUpdated = !1;
        var a = Amex.DataService.pollData[this.options.noiseId],
            b = (a.results || [])[0] || 0,
            c = 100 * b.total;
        c = c >= 100 ? 100 : c, Amex.Animation.animateNoiseMeter(this.$elem, c).done($.proxy(function() {
            c >= 100 && this.unlockNoiseMeter()
        }, this))
    },
    unlockNoiseMeter: function() {
        window.clearInterval(this.updateIntervalId), Amex.Events.off("polls.updated", this.onNoiseMetersUpdatedHandler, this), this.$elem.find(".noise-meter--footer-text_active").hide(), this.$elem.find(".noise-meter--footer-text_done").show(), this.$elem.find(".button-link [data-button-text]").text("Follow"), this.$elem.find(".post-event-overlay.show").addClass("active"), Amex.Events.trigger("noiseMeters.unlocked", {
            isFirst: this.options.isFirst
        })
    },
    _polarToCartesian: function(a, b, c, d) {
        var e = (d - 90) * Math.PI / 180;
        return {
            x: a + c * Math.cos(e),
            y: a + c * Math.sin(e)
        }
    },
    getPercentageArcDesc: function(a, b, c, d, e) {
        d >= 100 && (d = 99.999);
        var f, g, h, i = 3.6 * d;
        e ? (f = 360 - i, g = 0) : (f = 0, g = i), h = 180 >= i ? "0" : "1";
        var j = this._polarToCartesian(a, b, c, g),
            k = this._polarToCartesian(a, b, c, f),
            l = ["M", j.x, j.y, "A", c, c, 0, h, 0, k.x, k.y].join(" ");
        return l
    },
    setSvgPercentage: function(a, b, c) {
        var d = a.width(),
            e = a.height(),
            f = d / 2,
            g = e / 2;
        c = c || d / 2 - a.find("path").attr("stroke-width") / 2;
        var h = !1,
            i = this.getPercentageArcDesc(f, g, c, b, h);
        a.find("path").attr("d", i)
    }
}, Amex.Module.PhotoGalleryModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.bindEvents(), this
    },
    bindEvents: function() {
        this.$elem.find(".photo-gallery--list").on("click", ".photo-gallery--list-item", $.proxy(this.onListItemClickHandler, this)), this.$elem.find(".photo-gallery--active-container .amex-arrow").click($.proxy(this.onActiveArrowClickHandler, this)), this.$elem.find(".photo-gallery--list-container .amex-arrow").click($.proxy(this.onListArrowClickHandler, this)), this.$elem.find(".gallery-close").click($.proxy(this.onCloseGalleryHandler, this)), Amex.Util.onSwipe(this.$elem.find(".photo-gallery--active-container"), $.proxy(this.setNextPhoto, this)), Amex.Events.on("photoGallery.requestOpen", this.onRequestPhotoGalleryOpen, this)
    },
    onCloseGalleryHandler: function(a) {
        a.preventDefault(), this.$elem.removeClass("photo-gallery_active"), this.$elem.find(".photo-gallery--list").empty(), Amex.Events.trigger("photoGallery.close")
    },
    onRequestPhotoGalleryOpen: function(a) {
        this.setupPhotoGallery(a.artist, a.images), this.setActivePhotoIndex(a.index)
    },
    setupPhotoGallery: function(a, b) {
        for (var c = this.$elem.find(".photo-gallery--list-item_template").clone().removeClass("photo-gallery--list-item_template"), d = this.$elem.find(".photo-gallery--list"), e = 0; e < b.length; e++) {
            var f = c.clone();
            f.find("img").attr("src", b[e].src), f.attr("data-photo-title", b[e].title), d.append(f)
        }
        this.$elem.find(".photo-info--artist").text(a.name), this.currentX = 0, this.setActivePhotoIndex(Math.floor(Math.random() * this.$elem.find(".photo-gallery--list .photo-gallery--list-item").length)), this.slidePhotoList(-100),
            this.$elem.addClass("photo-gallery_active")
    },
    onActiveArrowClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target),
            c = b.hasClass("amex-arrow_left") ? -1 : 1;
        this.setNextPhoto(c)
    },
    setNextPhoto: function(a) {
        var b = this.$elem.find(".photo-gallery--list .photo-gallery--list-item"),
            c = b.filter(".photo-gallery--list-item_active").index(),
            d = (b.length + c + a) % b.length;
        this.setActivePhotoIndex(d)
    },
    onListArrowClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target),
            c = b.hasClass("amex-arrow_left") ? -1 : 1;
        this.slidePhotoList(c)
    },
    slidePhotoList: function(a) {
        var b = this.$elem.find(".photo-gallery--list .photo-gallery--list-item"),
            c = b.not(".photo-gallery--list-item_active").width(),
            d = c * b.length,
            e = this.$elem.find(".photo-gallery--list-wrapper").width();
        this.currentX = Math.max(0, Math.min(this.currentX + a * e / 2, d - e)), this.$elem.find(".photo-gallery--list").css("transform", "translate3d(-" + this.currentX + "px,0,0)")
    },
    onListItemClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target).closest(".photo-gallery--list-item"),
            c = b.index();
        this.setActivePhotoIndex(c)
    },
    setActivePhotoIndex: function(a) {
        var b = this.$elem.find(".photo-gallery--list .photo-gallery--list-item"),
            c = $(b.get(a)),
            d = this.$elem.find(".photo-gallery--active-image");
        d.attr("src", c.find("img").attr("src")), b.removeClass("photo-gallery--list-item_active"), c.addClass("photo-gallery--list-item_active"), this.$elem.find("[data-photo-index]").text(a + 1), this.$elem.find("[data-photo-count]").text(b.length), Amex.Animation.setProgressIndicator(this.$elem.find(".progress-indicator"), a, b.length)
    }
}, Amex.Module.PlaylistModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        var a = this.$elem.find(".video-list .video-item").first();
        this._$pagePlaylist = this.$elem.find(".video-list").clone(), this.currentIndex = 0, this.hidden = !1, this.hiddenTriggerPoint = 400, this.onResizeHandler(), this.highlightVisibleItems();
        var b = this;
        Amex.Browser.cssAnimationsSupported() && !this.$elem.hasClass("playlist-module_no_hero") ? (a.attr("data-artist-id") && !this.options.noStickyAnimation && a.addClass("video-item_stick_animation"), setTimeout(function() {
            b.$elem.addClass("playlist-module_animate"), setTimeout($.proxy(b.onStartAnimationDone, b), 2800)
        }, 1e3)) : this.onStartAnimationDone(), a.attr("data-artist-id") || $(".playlist-progress-indicator--container .progress-indicator").hide(), this.$elem.find(".video-list li").length >= 2 ? this.$elem.addClass("playlist-module_list") : this.$elem.addClass("playlist-module_single")
    },
    bindEvents: function() {
        Amex.Events.on("window.resize", this.onResizeHandler, this), Amex.Events.on("window.scrollFrame", this.onScrollHandler, this), Amex.Events.on("window.orientationChange", this.onOrientationChange, this), this.$elem.on("click", "[data-video-id]", $.proxy(this.onVideoPlayClick, this)), this.$elem.find("[data-move-left]").click($.proxy(function(a) {
            a.preventDefault(), this.moveSlider(-1)
        }, this)), this.$elem.find("[data-move-right]").click($.proxy(function(a) {
            a.preventDefault(), this.moveSlider(1)
        }, this)), Amex.Events.on("video.playing", this.onVideoPlay, this), Amex.Events.on("video.ended", this.onVideoEnded, this), Amex.Events.on("video.show", this.onVideoShow, this), Amex.Events.on("video.hide", this.onVideoHide, this), Amex.Events.on("heroArtist.updated", this.onHeroArtistUpdated, this), Amex.Events.on("playlist.requestPlay", this.onRequestPlaylistPlay, this), Amex.Events.on("playlist.requestPlayArtistId", this.onRequestPlayArtistId, this)
    },
    onStartAnimationDone: function() {
        if (this.$elem.removeClass("playlist-module_pre-animate playlist-module_animate"), this.options.noStickyAnimation || this.artistHighlighted || this.setHighlightedArtist($(this.$elem.find("[data-artist-id]").get(0)).attr("data-artist-id")), Amex.Events.trigger("playlist.animated"), Amex.Browser.isMobileOrTablet()) {
            var a = this;
            Amex.Util.onSwipe(this.$elem, function(b) {
                a.moveSlider(b), a.updateProgressIndicator()
            })
        }
    },
    onScrollHandler: function(a) {
        Amex.Browser.isMobileOrTablet() || (a > this.hiddenTriggerPoint ? this.hidden || (this.hidden = !0, this.$elem.addClass("playlist-module_hidden")) : this.hidden && (this.hidden = !1, this.$elem.removeClass("playlist-module_hidden")))
    },
    onOrientationChange: function() {
        console.log("orientation change"), this.onResizeHandler()
    },
    onRequestPlayArtistId: function(a) {
        var b = this.$elem.find('[data-artist-id="' + a + '"]'),
            c = 0 === b.length ? 0 : b.index();
        this.onRequestPlaylistPlay(c)
    },
    onRequestPlaylistPlay: function(a) {
        var b = $(this.$elem.find("[data-video-id]").get(a));
        this.playVideo(b.attr("data-video-id"))
    },
    onHeroArtistUpdated: function(a) {
        this.highlightArtistId = a.artistId, this.setHighlightedArtist(this.highlightArtistId)
    },
    onResizeHandler: function() {
        for (var a = this.$elem.find(".amex-arrow"), b = this.$elem.find(".video-list .video-item"), c = $(window).width(), d = 2 * a.width(), e = this.itemWidth = b.outerWidth(!0), f = c - d, g = Math.min(5, b.length), h = e, i = 1, j = this.$elem.find(".progress-indicator"); g > i && f - e > h;) h += e, i += 1;
        $(".js-playlist-wrapper", this.$elem).width(h), this.itemsVisible = i, this.maxMoveIndex = b.length - this.itemsVisible + 1, i >= b.length ? (a.hide(), j.css("opacity", 0)) : Amex.Browser.isMobileOrTablet() ? j.css("opacity", 1) : a.show(), this.highlightVisibleItems(), this.setSliderPositionAt(this.currentIndex)
    },
    updateProgressIndicator: function() {
        var a = this.$elem.find(".video-item").length - this.itemsVisible,
            b = this.currentIndex,
            c = $(".mobile-hero-progress-indicator--container .progress-indicator");
        Amex.Animation.setProgressIndicator(c, b, a)
    },
    moveSlider: function(a) {
        this.currentIndex = (this.maxMoveIndex + this.currentIndex + a) % this.maxMoveIndex, this.setSliderPositionAt(this.currentIndex), this.highlightVisibleItems()
    },
    highlightVisibleItems: function() {
        var a = this,
            b = this.$elem.find(".video-list .video-item");
        b.removeClass("is-highlighted"), b.each(function(b) {
            b >= a.currentIndex && b < a.currentIndex + a.itemsVisible && $(this).addClass("is-highlighted")
        })
    },
    setSliderPositionAt: function(a) {
        a = (this.maxMoveIndex + a) % this.maxMoveIndex;
        var b = -(this.itemWidth * a);
        this.$elem.find(".video-list").css({
            transform: "translateX(" + b + "px)"
        })
    },
    onVideoPlayClick: function(a) {
        a.preventDefault();
        var b = $(a.target).closest("[data-video-id]"),
            c = b.attr("data-video-id");
        this.playVideo(c)
    },
    playVideo: function(a) {
        Amex.Youtube.openVideo({
            videoId: a
        })
    },
    onVideoPlay: function(a) {
        if (!this.$elem.hasClass("single_video")) {
            var b = a.videoId;
            this.$elem.find(".video-item_is_active").removeClass("video-item_is_active");
            var c = this.$elem.find('[data-video-id="' + b + '"]');
            c.addClass("video-item_is_active"), c.length > 0 && (this.artistHighlighted = !0), this.setItemVisible(c)
        }
    },
    onVideoEnded: function(a) {
        if (!Amex.Browser.isMobileOrTablet() && !this.$elem.hasClass("single_video")) {
            var b = a.player,
                c = b.getVideoData().video_id,
                d = this.$elem.find(".video-list .video-item"),
                e = d.filter('[data-video-id="' + c + '"]').index(),
                f = null;
            if (-1 !== e && e < d.length - 1) {
                var g = $(d.get(e + 1));
                f = {
                    videoId: g.attr("data-video-id"),
                    title: g.find("[data-title]").text(),
                    artistName: g.attr("data-artist-name")
                }
            }
            Amex.Events.trigger("youtubeplayer.requestNext", f)
        }
    },
    onVideoShow: function(a) {
        Amex.Browser.isMobileOrTablet() || this.$elem.addClass("increased_z"), this.$elem.toggleClass("single_video", a.noPlaylist === !0), a.playlistArtist && (this.$elem.hide(), Amex.Util.artistDataPromise(a.playlistArtist, a.playlistArtistType).always($.proxy(function(a) {
            if (this.$elem.show(), a) {
                var b = this.renderPlaylist(a.videos);
                this.setVideoPlaylist(b)
            }
        }, this)))
    },
    onVideoHide: function() {
        this.$elem.find(".video-item_is_active").removeClass("video-item_is_active"), this.$elem.removeClass("increased_z"), this.$elem.removeClass("single_video"), this.setVideoPlaylist(this._$pagePlaylist), this.setHighlightedArtist(this.highlightArtistId)
    },
    setVideoPlaylist: function(a) {
        this.$elem.find(".video-list").replaceWith(a), this.onResizeHandler()
    },
    setHighlightedArtist: function(a) {
        var b = this.$elem.find('.video-item[data-artist-id="' + a + '"]');
        0 !== b.length && (this.$elem.find(".video-item_is_active").removeClass("video-item_is_active"), b.addClass("video-item_is_active"), this.setItemVisible(b))
    },
    setItemVisible: function(a) {
        var b = a.position();
        if (b) {
            var c = b.left,
                d = a.index(),
                e = Math.min(Math.floor(d / this.itemsVisible * (this.itemsVisible - 1)), this.maxMoveIndex - 1);
            (0 > c || c >= 200 * this.itemsVisible) && this.setSliderPositionAt(e)
        }
    },
    renderPlaylist: function(a) {
        for (var b = this.$elem.find(".video-list").clone().empty(), c = this.$elem.find(".video-item.template").clone().removeClass("template"), d = 0, e = a.length; e > d; d++) {
            var f = a[d],
                g = c.clone();
            g.attr("data-video-id", f.id), g.find("[data-background-image]").css("background-image", 'url("' + Amex.getAssetsPath(f.image) + '")'), g.find("[data-title]").text(f.title), b.append(g)
        }
        return b
    }
}, Amex.Module.PodsModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.$airArtists = [], this.$allArtists = !1, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.hoveredPod = null, this.lastRotatedPod = null, this.contentRotationDelay = 3e3, Amex.Browser.isGalaxyS4() || (this.contentRotationInterval = setInterval($.proxy(this.rotateRandomPodContent, this), this.contentRotationDelay));
        var a = "airArtists";
        Amex.DataService.fetchLocalData(a).done($.proxy(function(a) {
            a && $(Amex.DataService.localData.airArtists).each($.proxy(function(a, b) {
                Amex.Util.isArtistIdInList(b.id, ["raesremmurd", "borns", "piamia", "gavinjames"]) && this.$airArtists.push(b)
            }, this))
        }, this))
    },
    bindEvents: function() {
        Amex.Events.on("localData.updated", function() {
            this.hasArtistsData() && this.$elem.find(".pod-arrow").addClass("pod-arrow_active")
        }, this), this.$elem.find(".pod-arrow").click($.proxy(this.onArrowClickHandler, this)), this.$elem.find("[data-video-play]").click($.proxy(this.onVideoPlayClickHandler, this)), this.$elem.find("[data-pod-swipe]").each($.proxy(function(a, b) {
            this.bindPodSwipe($(b))
        }, this)), this.$elem.find(".pod").hover($.proxy(this.onPodHoverIn, this), $.proxy(this.onPodHoverOut, this)), Amex.Events.on("ugc.updated", this.onUGCContentUpdated, this)
    },
    onPodHoverIn: function(a) {
        var b = $(a.target).closest(".pod");
        this.hoveredPod = b
    },
    onPodHoverOut: function(a) {
        var b = $(a.target).closest(".pod");
        b.is(this.hoveredPod) && (this.hoveredPod = null)
    },
    rotateRandomPodContent: function() {
        if (Amex.Util.isElementInActiveViewport(this.$elem)) {
            var a = this.$elem.find(".pod[data-pod-swipe]");
            a = a.not(this.hoveredPod).not(this.lastRotatedPod);
            var b = Math.floor(Math.random() * a.length),
                c = $(a.get(b)),
                d = c.data("lastSlideDirection") || 1;
            this.slidePodContent(c, d, !0), this.lastRotatedPod = c
        }
    },
    onUGCContentUpdated: function(a) {
        "twitter" === a && this.updateTwitterContent(Amex.Util.getLatestUGCEntry(Amex.DataService.ugcData.twitter))
    },
    updateTwitterContent: function(a) {
        if (a) {
            var b = this.$elem.find(".pod_tweet");
            b.find("[data-username]").text(Amex.Util.safeHTML(a.user.username)), b.find("[data-text-content]").html(Amex.Util.highlightSocialMediaText(a.data.text))
        }
    },
    bindPodSwipe: function(a) {
        Amex.Util.onSwipe(a, $.proxy(function(b) {
            this.slidePodContent(a, b)
        }, this))
    },
    onVideoPlayClickHandler: function(a) {
        a.preventDefault();
        var b = $(a.target).closest(".pod"),
            c = b.attr("data-artist-id"),
            d = this.getNextArtist(c, 0),
            e = d.videos[0];
        Amex.Youtube.openVideo({
            videoId: e.id,
            noPlaylist: !0
        })
    },
    onArrowClickHandler: function(a) {
        if (a.preventDefault(), this.hasArtistsData()) {
            var b = $(a.target),
                c = b.closest(".pod"),
                d = b.hasClass("pod-arrow_left") ? -1 : 1;
            this.slidePodContent(c, d)
        }
    },
    slidePodContent: function(a, b, c) {
        if (!this.isPodLocked(a)) {
            this.lockPod(a);
            var d = a.find("[data-pod-animate].next, [data-pod-animate].prev");
            d.length && d.remove(), this.$allArtists || (this.$allArtists = this.$airArtists.concat(Amex.DataService.localData.unstagedArtists));
            var e, f = a.attr("data-pod-type"),
                g = a.attr("data-artist-id");
            switch (f) {
                case "photos":
                    e = this.getNextArtist(g, b), this.slidePhotoContent(a, e, b);
                    break;
                case "videos":
                    e = this.getNextArtist(g, b), this.slideVideoContent(a, e, b);
                    break;
                case "albums":
                    e = this.getNextAirArtist(g, b), this.slideAlbumsContent(a, e, b);
                    break;
                default:
                    return void this.unlockPod(a)
            }
            c !== !0 && a.data("lastSlideDirection", b), a.attr("data-artist-id", e.id)
        }
    },
    slideVideoContent: function(a, b, c) {
        var d = b.name,
            e = b.videos[0],
            f = Amex.getAssetsPath(e.image),
            g = e.title,
            h = "https://youtube.com/watch?v=" + e.id;
        a.find("[data-link]").attr("href", h);
        var i = a.find(".pod-background-image"),
            j = a.find(".pod-title"),
            k = i.clone(),
            l = j.clone();
        l.find("[data-artist-name]").text(d), l.find("[data-video-title]").text(g), i.addClass("current"), j.addClass("current"), k.addClass(1 === c ? "next" : "prev"), l.addClass(1 === c ? "next" : "prev"), l.addClass("opacity"), k.on("load error", $.proxy(function() {
            this.animatePodSlide(a)
        }, this)), k.attr("src", f), k.insertAfter(i), l.insertAfter(j)
    },
    slidePhotoContent: function(a, b, c) {
        var d = Amex.getAssetsPath(b.artistImages.square[0]),
            e = b.name,
            f = Amex.getPagePath(b.artistpagelink);
        a.find("[data-link]").attr("href", f);
        var g = a.find(".pod-background-image"),
            h = a.find(".pod-title"),
            i = g.clone(),
            j = h.clone();
        j.text(e), j.addClass("opacity"), g.addClass("current"), h.addClass("current"), i.addClass(1 === c ? "next" : "prev"), j.addClass(1 === c ? "next" : "prev"), i.on("load error", $.proxy(function() {
            this.animatePodSlide(a)
        }, this)), i.attr("src", d), i.insertAfter(g), j.insertAfter(h)
    },
    slideAlbumsContent: function(a, b, c) {
        var d = Amex.getAssetsPath(b.album.image),
            e = b.name,
            f = b.album.title,
            g = Amex.getPagePath(b.artistpagelink);
        a.find("[data-link]").attr("href", g);
        var h = a.find(".pod-background-image"),
            i = a.find(".pod-title"),
            j = a.find(".pod-subtitle"),
            k = a.find(".js-store-google"),
            l = a.find(".js-store-itunes"),
            m = h.clone(),
            n = i.clone(),
            o = j.clone();
        n.text(e), n.addClass("opacity"), o.text(f), o.addClass("opacity"), h.addClass("current"), i.addClass("current"), j.addClass("current"), b.album.googleplayUrl ? (k.css("visibility", "visible"), k.css("opacity", "1"), k.attr({
            href: b.album.googleplayUrl,
            "data-tracking-rmaction": b.id + k.attr("data-tracking-rmaction-original")
        })) : (k.css("opacity", "0"), setTimeout(function() {
            k.css("visibility", "hidden")
        }, 300)), b.album.itunesUrl ? (l.css("visibility", "visible"), l.css("opacity", "1"), l.attr({
            href: b.album.itunesUrl,
            "data-tracking-rmaction": b.id + l.attr("data-tracking-rmaction-original")
        })) : (l.css("opacity", "0"), setTimeout(function() {
            l.css("visibility", "hidden")
        }, 300)), m.addClass(1 === c ? "next" : "prev"), n.addClass(1 === c ? "next" : "prev"), o.addClass(1 === c ? "next" : "prev"), m.on("load error", $.proxy(function() {
            this.animatePodSlide(a)
        }, this)), m.attr("src", d), m.insertAfter(h), n.insertAfter(i), o.insertAfter(j)
    },
    animatePodSlide: function(a) {
        var b = this,
            c = a.find("[data-pod-animate].current"),
            d = a.find("[data-pod-animate].next, [data-pod-animate].prev");
        setTimeout(function() {
            c.addClass("transition").removeClass("current").addClass(d.hasClass("next") ? "prev" : "next"), d.addClass("transition").removeClass("next prev").addClass("current"), setTimeout(function() {
                b.unlockPod(a), d.removeClass("current")
            }, 600)
        }, 500)
    },
    getNextArtist: function(a, b) {
        for (var c = this.$allArtists, d = c.length, e = -1, f = 0; d > f; f++)
            if (c[f].id === a) {
                e = f;
                break
            }
        var g = (d + e + b) % d;
        return c[g]
    },
    getNextUnstagedArtist: function(a, b) {
        for (var c = Amex.DataService.localData.unstagedArtists, d = c.length, e = -1, f = 0; d > f; f++)
            if (c[f].id === a) {
                e = f;
                break
            }
        var g = (d + e + b) % d;
        return c[g]
    },
    getNextAirArtist: function(a, b) {
        for (var c = this.$airArtists, d = c.length, e = -1, f = 0; d > f; f++)
            if (c[f].id === a) {
                e = f;
                break
            }
        var g = (d + e + b) % d;
        return c[g]
    },
    hasArtistsData: function() {
        return !(!Amex.DataService.localData || !Amex.DataService.localData.unstagedArtists)
    },
    lockPod: function(a) {
        a.data("locked", !0)
    },
    unlockPod: function(a) {
        a.data("locked", !1)
    },
    isPodLocked: function(a) {
        return a.data("locked") === !0
    }
}, Amex.Module.PromulgateBornsModule = {
    ads: {
        small: "/assets/images/BORNS-tour-static-300x50.jpg",
        large: "/assets/images/720x90-BORNS-tour-static.jpg"
    },
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.currentSize = null, this.currentBannerIndex = 0, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        "function" == typeof window.matchMedia && (this.mediaQuery = window.matchMedia("only screen and (max-width: 600px)")), this.updateAdSize()
    },
    bindEvents: function() {
        this.mediaQuery && this.mediaQuery.addListener($.proxy(this.updateAdSize, this)), Amex.Events.on("data.updated", this.updateAdSize, this)
    },
    updateAdSize: function() {
        return this.mediaQuery ? void(this.mediaQuery.matches ? this.renderAd("small") : this.renderAd("large")) : void this.renderAd("large")
    },
    renderAd: function(a) {
        this.$elem.find(".ad").html('<img src="' + Amex.getAssetsPath(this.ads[a]) + '" alt="American Express">')
    }
}, Amex.Module.PromulgateModuleDeadCo = {
    ads: {
        small: "/assets/images/amex-deadco-banner.png",
        large: "/assets/images/amex-deadco-banner.png"
    },
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.currentSize = null, this.currentBannerIndex = 0, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        "function" == typeof window.matchMedia && (this.mediaQuery = window.matchMedia("only screen and (max-width: 600px)")), this.updateAdSize()
    },
    bindEvents: function() {
        this.mediaQuery && this.mediaQuery.addListener($.proxy(this.updateAdSize, this)), Amex.Events.on("data.updated", this.updateAdSize, this)
    },
    updateAdSize: function() {
        return this.mediaQuery ? void(this.mediaQuery.matches ? this.renderAd("small") : this.renderAd("large")) : void this.renderAd("large")
    },
    renderAd: function(a) {
        this.$elem.find(".ad").html('<img src="' + Amex.getAssetsPath(this.ads[a]) + '" alt="American Express">')
    }
}, Amex.Module.PromulgateModule = {
    ads: {
        small: "/assets/images/promulgates/newsletter-banner-mobile.jpg",
        large: "/assets/images/promulgates/newsletter-banner-desktop.jpg"
    },
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.currentSize = null, this.currentBannerIndex = 0, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        "function" == typeof window.matchMedia && (this.mediaQuery = window.matchMedia("only screen and (max-width: 600px)")), this.updateAdSize()
    },
    bindEvents: function() {
        this.mediaQuery && this.mediaQuery.addListener($.proxy(this.updateAdSize, this)), Amex.Events.on("data.updated", this.updateAdSize, this)
    },
    updateAdSize: function() {
        return this.mediaQuery ? void(this.mediaQuery.matches ? this.renderAd("small") : this.renderAd("large")) : void this.renderAd("large")
    },
    renderAd: function(a) {
        this.$elem.find(".ad").html('<img src="' + Amex.getAssetsPath(this.ads[a]) + '" alt="American Express">')
    }
}, Amex.Module.PromulgateModuleRobin = {
    ads: {
        small: "/assets/images/amex-banner-mobile.jpg",
        large: "/assets/images/amex-banner-desktop.jpg"
    },
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.currentSize = null, this.currentBannerIndex = 0, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        "function" == typeof window.matchMedia && (this.mediaQuery = window.matchMedia("only screen and (max-width: 600px)")), this.updateAdSize()
    },
    bindEvents: function() {
        this.mediaQuery && this.mediaQuery.addListener($.proxy(this.updateAdSize, this)), Amex.Events.on("data.updated", this.updateAdSize, this)
    },
    updateAdSize: function() {
        return this.mediaQuery ? void(this.mediaQuery.matches ? this.renderAd("small") : this.renderAd("large")) : void this.renderAd("large")
    },
    renderAd: function(a) {
        this.$elem.find(".ad").html('<img src="' + Amex.getAssetsPath(this.ads[a]) + '" alt="American Express">')
    }
}, Amex.Module.PromulgateTaylorModule = {
    ads: {
        small: "/assets/images/TS_MOB_01.jpg",
        large: "/assets/images/TS_OLA_01.jpg"
    },
    init: function(a, b) {
        return this.$elem = $(b), this.options = $.extend({}, a), this.currentSize = null, this.currentBannerIndex = 0, this.setup(), this.bindEvents(), this
    },
    setup: function() {
        "function" == typeof window.matchMedia && (this.mediaQuery = window.matchMedia("only screen and (max-width: 600px)")), this.updateAdSize()
    },
    bindEvents: function() {
        this.mediaQuery && this.mediaQuery.addListener($.proxy(this.updateAdSize, this)), Amex.Events.on("data.updated", this.updateAdSize, this)
    },
    updateAdSize: function() {
        return this.mediaQuery ? void(this.mediaQuery.matches ? this.renderAd("small") : this.renderAd("large")) : void this.renderAd("large")
    },
    renderAd: function(a) {
        this.$elem.find(".ad").html('<img src="' + Amex.getAssetsPath(this.ads[a]) + '" alt="American Express">')
    }
};
var $scrollArrow = $(".scroll-arrow"),
    $prefadeBackground = $(".page-background");
if ($scrollArrow && $prefadeBackground.length) {
    var backgroundScrollTop = $prefadeBackground.offset().top;
    $scrollArrow.on("click", function(a) {
        a.preventDefault(), $("body, html").animate({
            scrollTop: backgroundScrollTop - 120 + "px"
        }, 1e3)
    })
}
Amex.Module.WhatsHappeningModule = {
    init: function(a, b) {
        return this.$elem = $(b), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        Amex.DataService.fetchUGCData("instagram"), Amex.DataService.fetchUGCData("twitter", "whatshappening"), Amex.DataService.fetchUGCData("facebook"), Amex.DataService.fetchUGCData("youtube")
    },
    bindEvents: function() {
        Amex.Events.on("ugc.updated", this.onUgcUpdatedHandler, this)
    },
    onUgcUpdatedHandler: function(a) {
        switch (a) {
            case "instagram":
                this.updateInstagram(Amex.Util.getLatestUGCEntry(Amex.DataService.ugcData.instagram));
                break;
            case "twitter":
                this.updateTwitter(Amex.Util.getLatestUGCEntry(Amex.DataService.ugcData.twitter));
                break;
            case "facebook":
                this.updateFacebook(Amex.Util.getLatestUGCEntry(Amex.DataService.ugcData.facebook));
                break;
            case "youtube":
                this.updateYoutube(Amex.Util.getLatestUGCEntry(Amex.DataService.ugcData.youtube))
        }
    },
    updateInstagram: function(a) {
        if (a && a.images) {
            var b = this.$elem.find(".social-gadget_instagram"),
                c = a.images[0].src;
            b.find("img").attr("src", c)
        }
    },
    updateTwitter: function(a) {
        if (a && a.data) {
            var b = this.$elem.find(".social-gadget_twitter"),
                c = a.data.text,
                d = a.data.id_str;
            b.find("p").html(Amex.Util.highlightSocialMediaText(c)), b.find("[data-twitter-retweet]").attr("href", "https://twitter.com/intent/retweet?tweet_id=" + d), b.find("[data-twitter-favorite]").attr("href", "https://twitter.com/intent/favorite?tweet_id=" + d)
        }
    },
    updateFacebook: function(a) {
        if (a && a.data) {
            var b = this.$elem.find(".social-gadget_facebook"),
                c = a.data.message;
            b.find("p").html(Amex.Util.highlightSocialMediaText(c))
        }
    },
    updateYoutube: function(a) {
        if (a && a.data) {
            var b = this.$elem.find(".social-gadget_youtube"),
                c = a.data.snippet.thumbnails.medium.url,
                d = Amex.Util.safeHTML(a.data.snippet.title),
                e = new Date(a.data.snippet.publishedAt),
                f = [Amex.Module.CountdownModule.monthNames[e.getMonth()], e.getDate(), e.getFullYear()].join(" &middot; ");
            b.find("img").attr("src", c), b.find(".video-title").text(d), b.find(".video-date").html(f)
        }
    }
}, Amex.Module.YoutubePlayerModule = {
    init: function(a, b) {
        return this.timeoutDelay = 350, Amex.Browser.isBrowser("ie", 0, 99) && (this.timeoutDelay = 1e3), this.$elem = $(b), this.options = $.extend({}, a), this.setup(), this.bindEvents(), this
    },
    setup: function() {
        this.$playerOverlay = this.$elem.find(".youtube-player--overlay"), this.$pausedState = this.$playerOverlay.find("[data-overlay-paused]"), this.$endedState = this.$playerOverlay.find("[data-overlay-ended]"), this.$globalOverlay = $("#global-youtube-overlay"), this.nextVideoWaitStartTime = null, this.nextVideoFrameId = null, this.nextVideoWaitTime = 10, this.onNextVideoWaitUpdate = $.proxy(this.onNextVideoWaitUpdate, this)
    },
    bindEvents: function() {
        Amex.Events.on("video.show", this.onVideoShow, this), Amex.Events.on("video.hide", this.onVideoHide, this), Amex.Events.on("video.playing", this.onVideoPlay, this), Amex.Events.on("video.paused", this.onVideoPaused, this), Amex.Events.on("video.buffering", this.onVideoBuffering, this), Amex.Events.on("youtubeplayer.requestNext", this.scheduleNextVideo, this), this.$playerOverlay.click($.proxy(this.onPlayerOverlayClick, this)), this.$globalOverlay.click($.proxy(this.onCloseVideoHandler, this)), this.$elem.find(".close-button").click($.proxy(this.onCloseVideoHandler, this)), Amex.Events.on("window.resize", this.onResize, this)
    },
    onResize: function() {
        if (this.$elem.is(":visible")) {
            this.$elem.css("left", (Amex.Global.windowWidth - this.$elem.outerWidth(!0)) / 2);
            var a = this.$elem.find(".close-button"),
                b = this.$elem.find(".embed");
            if (Amex.Browser.isMobileOrTablet()) {
                var c = $("[data-biggest-header-item]");
                a.css("top", c.height() + 20);
                var d = 9 * Amex.Global.windowWidth / 16;
                b.css("width", Amex.Global.windowWidth), b.css("height", d), b.css("margin-top", "-" + d / 2 + "px")
            } else b.css("width", ""), b.css("height", ""), b.css("margin-top", ""), a.css("top", "")
        }
    },
    showPlayerOverlay: function(a) {
        if (this.$playerOverlay.fadeIn(), this.$pausedState.hide(), this.$endedState.hide(), !Amex.Browser.isMobileOrTablet()) switch (a) {
            case YT.PlayerState.PAUSED:
                this.$pausedState.fadeIn();
                break;
            case YT.PlayerState.ENDED:
                this.$endedState.fadeIn()
        }
    },
    onPlayerOverlayClick: function(a) {
        0 === $(a.target).closest(".youtube-player--recommendations .video-item").length && this.getPlayer().playVideo()
    },
    onCloseVideoHandler: function(a) {
        a.preventDefault(), this.closeVideo()
    },
    onVideoPaused: function(a) {
        var b = this;
        a.$container.is(this.$elem) && (Amex.Browser.isMobileOrTablet() || a.player.hasStartedPlaying && (clearTimeout(this.showPlayerOverlayTimeout), this.showPlayerOverlayTimeout = setTimeout(function() {
            b.showPlayerOverlay(YT.PlayerState.PAUSED)
        }, this.timeoutDelay)))
    },
    onVideoBuffering: function(a) {
        clearTimeout(this.showPlayerOverlayTimeout), Amex.Browser.isMobileOrTablet() || this.$playerOverlay.hide()
    },
    onVideoPlay: function(a) {
        clearTimeout(this.showPlayerOverlayTimeout), a.$container.is(this.$elem) && (this.lastPlaylistIndex = a.player.getPlaylistIndex(), this.$playerOverlay.hide(), this.cancelNextVideoWait())
    },
    onVideoShow: function(a) {
        a.$container.is(this.$elem) && (this.createSuggestedVideos(a.videoId), this.lastPlaylistIndex = null, this.$playerOverlay.hide(), this.$globalOverlay.show(), this.onResize())
    },
    onVideoHide: function(a) {
        a.$container.is(this.$elem) && (this.$globalOverlay.hide(), this.$playerOverlay.hide(), this.cancelNextVideoWait())
    },
    closeVideo: function() {
        Amex.Youtube.closeVideo(this.$elem)
    },
    scheduleNextVideo: function(a) {
        return a ? (Amex.Browser.isMobileOrTablet() && Amex.Youtube.openVideo({
            videoId: a.videoId,
            noForceCreate: !0
        }), a.artistName ? (this.$endedState.find("[data-next-artist]").text(a.artistName), this.$endedState.find("[data-next-dash]").show()) : this.$endedState.find("[data-next-dash]").hide(), this.$endedState.find("[data-next-title]").text(a.title), Amex.Youtube.openVideo({
            videoId: a.videoId,
            cueVideo: !0,
            noForceCreate: !0
        }), this.showPlayerOverlay(YT.PlayerState.ENDED), this.nextVideoId = a.videoId, this.nextVideoWaitStartTime = performance.now(), void(this.nextVideoFrameId = requestAnimationFrame(this.onNextVideoWaitUpdate))) : (this.showPlayerOverlay("none"), void(Amex.Browser.isMobileOrTablet() && Amex.Youtube.closeVideo(this.$elem)))
    },
    cancelNextVideoWait: function() {
        this.nextVideoId = null, this.nextVideoWaitStartTime = null, cancelAnimationFrame(this.nextVideoFrameId)
    },
    onNextVideoWaitUpdate: function() {
        if (null !== this.nextVideoId) {
            var a = (performance.now() - this.nextVideoWaitStartTime) / 1e3;
            if (a >= this.nextVideoWaitTime) this.getPlayer().playVideo(), this.cancelNextVideoWait();
            else {
                this.nextVideoFrameId = requestAnimationFrame(this.onNextVideoWaitUpdate);
                var b = a / this.nextVideoWaitTime * 100;
                Amex.Module.NoiseMeterModule.setSvgPercentage(this.$endedState.find("svg"), b)
            }
        }
    },
    getPlayer: function() {
        return Amex.Youtube.getPlayer(this.$elem)
    },
    createSuggestedVideos: function(a) {
        function b() {
            for (var b = Amex.DataService.localData.unstagedArtists.concat(), c = 0; c < b.length; c++)
                if (b[c].videos[0].id === a) {
                    b.splice(c, 1);
                    break
                }
            return b
        }

        function c() {
            var a = Math.round(Math.random() * e.length - 1);
            e[a];
            return e.splice(a, 1)[0]
        }

        function d(a) {
            if (!a) throw new Error("`artist` parameter is undefined");
            var b = "";
            return b += '<a class="image-container js-modal-youtube" href="https://www.youtube.com/watch?v=' + a.videos[0].id + '" title="' + f + '"  data-video-id="' + a.videos[0].id + '">', b += '<img src="' + Amex.getAssetsPath(a.videos[0].image) + '" alt="' + a.name + ' video thumbnail">', b += '<span class="play-link"><span class="icon icon-play"></span></span>', b += "</a>", b += '<div class="title title_centered"><em>' + a.name + "</em><div>" + a.videos[0].title + "</div></div>"
        }
        var e, f, g, h, i = "unstagedArtists";
        Amex.DataService.fetchLocalData(i).done($.proxy(function(a) {
            a && (e = b(), f = $(".js-youtube-recommendations").data("play-title"), g = c(), h = c(), this.$elem.find(".js-youtube--recommendation_left").empty().append(d(g)), this.$elem.find(".js-youtube--recommendation_right").empty().append(d(h)))
        }, this))
    }
}, Amex.DataService = {
    apiBaseUrl: "https://amex-web-services.appspot.com/",
    noiseMeterData: null,
    pollData: null,
    eventData: null,
    geoData: null,
    localData: null,
    _promises: {},
    init: function() {
        $.support.cors = !0
    },
    fetchLocalData: function(a) {
        if (this._promises.localData || (this._promises.localData = {}), this._promises.localData[a]) return this._promises.localData[a];
        var b = Amex.Settings.pageRoot + "/assets/data/",
            c = b + a + ".json",
            d = $.ajax({
                url: c,
                dataType: "json"
            });
        return d.done(function(b) {
            Amex.DataService.localData = Amex.DataService.localData || {}, Amex.DataService.localData[a] = b, Amex.Events.trigger("localData.updated")
        }), this._promises.localData[a] = d, this._promises.localData[a]
    },
    fetchPollData: function(a) {
        function b(a) {
            Amex.DataService.pollData = Amex.DataService.pollData || {}, $.each($.isArray(a.items) ? a.items : [a], function(a, b) {
                Amex.DataService.pollData[b.id] = b
            }), Amex.Events.trigger("polls.updated")
        }
        var c = "amex_api/polls";
        return a && (c += "?id=" + a), Amex.DataService.fetchFromApi(c).done(b)
    },
    fetchNoiseMeterData: function(a) {
        function b(a) {
            Amex.DataService.noiseMeterData = Amex.DataService.noiseMeterData || {}, $.each($.isArray(a.items) ? a.items : [a], function(a, b) {
                Amex.DataService.noiseMeterData[b.id] = b, Amex.DataService.noiseMeterData[b.id].unlocked = parseInt(b.value, 10) >= 100
            }), Amex.Events.trigger("noiseMeters.updated")
        }
        var c = "amex_api/noise_meters";
        return a && (c += "?id=" + a), Amex.DataService.fetchFromApi(c).done(b)
    },
    fetchGeoData: function() {
        return this._promises.geo || (this._promises.geo = Amex.DataService.fetchFromApi("amex_api/geo_info/get").done(function(a) {
            Amex.DataService.geoData = a, Amex.Events.trigger("geoData.updated")
        })), this._promises.geo
    },
    fetchEventInfo: function(a) {
        function b(a) {
            Amex.DataService.eventData = Amex.DataService.eventData || {}, $.each($.isArray(a.items) ? a.items : [a], function(a, b) {
                Amex.DataService.eventData[b.id] = b
            }), Amex.Events.trigger("eventInfo.updated", {})
        }
        var c = "amex_api/events";
        return a && (c += "?id=" + a), Amex.DataService.fetchFromApi(c).done(b)
    },
    fetchUGCData: function(a, b) {
        function c(b) {
            var c = Amex.DataService.ugcData = Amex.DataService.ugcData || {};
            $.each(b.items, function(a, b) {
                var d = c[b.network] = c[b.network] || [],
                    e = 0 !== $.grep(d, function(a) {
                        return a.id === b.id
                    }).length;
                e || d.push(b)
            }), Amex.Events.trigger("ugc.updated", a)
        }
        var d = "amex_api/ugc?network=" + a;
        return b && (d += "&tag=" + b), Amex.DataService.fetchFromApi(d).done(c)
    },
    fetchFromApi: function(a) {
        var b = Amex.DataService.apiBaseUrl + a,
            c = $.ajax({
                type: "GET",
                url: b,
                dataType: "json",
                timeout: 1e4,
                crossDomain: !0
            });
        return c.error(function(b, c, d) {
            Amex.error("couldnt fetch ", a, c, d)
        }), c
    },
    postPollData: function(a, b) {
        var c = $.ajax({
            type: "POST",
            url: Amex.DataService.apiBaseUrl + "amex_api/polls/vote",
            timeout: 1e4,
            crossDomain: !0,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                poll_id: a,
                item: b
            })
        });
        return c.error(function(a, b, c) {
            Amex.error("Couldn't fetch ", b, c)
        }), c
    }
};