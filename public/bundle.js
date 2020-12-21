(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function LazyArray(options) {
    var values  = this._values = {}
    var methods = this._methods = {}
    this.maxLength = Infinity

    if (typeof options === 'function') {
        methods.get = options
    } else {
        this.maxLength = typeof options.maxLength === 'number' ? options.maxLength : Infinity

        if (options.get) {
            methods.get = options.get
        } else if (options.next){
            methods.next = options.next
        }
    }

    var elems = this._elems = methods.get ? {} : []

    for (var key in options) {
        var value = options[key]
        if (/0|[1-9]\d*/.exec(key)) {
            elems[key]   = value
        } else if (key === 'init') {
            options.init.call(values)
        }
    }
}

LazyArray.prototype.get = function (index) {
    return this.slice(index, index + 1)[0]
}

LazyArray.prototype.slice = function (min, max) {
    var elems   = this._elems
    var methods = this._methods
    if (methods.get) {
        pushEach.call(this, min, max, function (index) {
            return methods.get.call(null, index)
        })
    } else {
        var nArgs  = methods.next.length
        pushEach.call(this, elems.length, max, function (index) {
            var predecessors = this._elems.slice(index - nArgs).reverse()
            return methods.next.apply(this._values, predecessors)
        })
    }

    return slice(elems, min, max)
}

module.exports = LazyArray

function slice(obj, min, max) {
    var arr = []
    for (var i = min; i < max; ++i) {
        var item = obj[i]
        if (item === undefined) {
            break
        } else {
            arr.push(item)
        }
    }
    return arr
}

function pushEach(min, max, cb) {
    var elems = this._elems
    var len   = this.maxLength
    if (len !== undefined && len < max)
        max = len

    for (var i = min; i < max; ++i) {
        if (elems[i] === undefined) {
            var item = cb.call(this, i)
            if (item === undefined) {
                this.maxLength = i
                break
            } else {
                elems[i] = item
            }
        }
    }
}
},{}],2:[function(require,module,exports){
module.exports = {
	Buffer:    require('./src/Buffer'),
	Generator: require('./src/Generator')
}

},{"./src/Buffer":3,"./src/Generator":4}],3:[function(require,module,exports){
var LazyArray           = require('lazyarray-lite')
var checkValidParameter = require('./utils.js').checkValidParameter

function Buffer(options) {
    this.minLength = 0
    this.maxLength = Infinity
    if (!(this instanceof Buffer)) {
        return new Buffer(options)
    }
    this.patterns = new LazyArray({
        init: function () {
            this.balls  = options.balls
            this.period = options.period
            this.height = options.height
            initialize.call(this)
        },
        next: function () {
            return getNextPattern(this)
        }
    })
}

Buffer.prototype.slice = function (begin, end) {
    var patterns = this.patterns.slice(begin, end)
    if (typeof this.length !== 'number') {

        this.minLength = Math.min(this.patterns.maxLength, end)
        this.maxLength = Math.min(this.patterns.maxLength, this.maxLength)
        if (this.minLength === this.maxLength) {
            this.length = this.minLength
        }
    }
    return patterns
}

module.exports = Buffer

function initialize () {
    this.balls  = checkValidParameter(this, 'balls', function(self) {
        return self.balls.max
    })

    this.period = checkValidParameter(this, 'period', 1)

    this.height = checkValidParameter(this, 'height', 0, function (self) {
        return self.balls.max * self.period.max
    })

    this.b = this.balls.max
}

function getNextPattern (state) {
    while (state.b >= state.balls.min) {
        if (state.p === undefined) {
            state.p = state.period.max
            periodMin = Math.max(state.period.min, 2)
        }
        
        while (state.p >= periodMin) {
            if (state.h === undefined) {
                heightMax = Math.min(state.height.max, state.p * state.b)
                heightMin = Math.max(state.height.min, state.b + 1)
                state.h = heightMax
            }

            while (state.h >= heightMin) {
                if (state.pos === undefined)  {
                    createStateVariables(state)
                }
                var pattern = getNextSpecificPattern(state)
                while (pattern) {
                    return pattern
                }
                state.pos = undefined
                --state.h
            }
            state.h = undefined
            --state.p
        }
        if (state.period.min <= 1 && 1 <= state.period.max && state.height.min <= state.b && state.b <= state.height.max) {
            state.p = undefined
            return [state.b--]
        }
        state.p = undefined
        --state.b
    }

    return undefined
}

function createStateVariables(state) {
    state.used  = {}
    state.stack = new Stack()
    state.array = []
    state.pos   = 0
    state.rest  = state.b * state.p
    state.val   = state.h
    state.top   = {
        min: state.h,
        index: -1
    }
    state.i     = state.h
    state.num   = state.h % state.p
    pushScope(state)
}

function getNextSpecificPattern(state) {
    if (state.p === 1 && state.b === state.h) {
        return [balls]
    } else {
        while ((state.i >= state.top.min || state.pos !== 1)) {
            if (state.pos < state.p) {
                if (state.i < state.top.min) {
                    popScope(state)
                } else {
                    state.num = (state.i + state.pos) % state.p
                    if (state.used[state.num] === undefined) {
                        pushScope(state)
                    } else {
                        --state.i
                    }
                }
            } else {
                if (state.top.index === 0) {
                    var pattern = [].concat(state.array)
                    popScope(state)
                    return pattern
                }
                popScope(state)
            }
        }
        return false
    }
}

function pushScope (state) {
    // always state.val >= state.i
    state.top.index = state.val > state.i ? 0 : state.top.index + 1
    state.used[state.num] = true
    state.array.push(state.i)
    state.val = state.array[state.top.index]

    state.rest -= state.i
    ++state.pos

    state.stack.push(state.top)

    if (state.pos < state.p) {
        var n   = state.p - state.pos
        state.i = Math.min(state.val, state.rest)
        var min = state.rest - state.h * (n - 1)
        if (n > 1) min++
        state.top = {
            min: Math.max(min, 0),
            index: state.top.index
        }
    }
}

function popScope(state) {
    state.top = state.stack.pop()

    state.top.index = state.stack.top().index
    state.val = state.array[state.top.index]
    
    --state.pos
    state.rest += state.i = state.array.pop()
    state.num   = (state.i + state.pos) % state.p
    state.used[state.num] = undefined
    --state.i
}

function Stack() {
    this.elems = []
}

Stack.prototype = {
    push: function (e) {
        return this.elems.push(e)
    },
    pop: function () {
        return this.elems.pop()
    },
    top: function () {
        return this.elems[this.elems.length - 1]
    },
}
},{"./utils.js":5,"lazyarray-lite":1}],4:[function(require,module,exports){
var Buffer = require('./Buffer.js')

function Generator (options) {
    var buffer = new Buffer(options)
    return buffer.slice(0, Infinity)
}

module.exports = Generator
},{"./Buffer.js":3}],5:[function(require,module,exports){
function isNonNullObject(a) {
    return typeof a === 'object' && a !== null
}

function errorMessage(parameterName, parameterType, expectedTypes) {
    return '`' + parameterName + '` is ' + parameterType 
         + '. Expected ' + expectedTypes.join(' or ') + '.'
}

function checkValidParameter (params, paramName, defaultMinValue, defaultMaxValue) {
    var paramValue = params[paramName]
    var maxValueOK = defaultMaxValue !== undefined
    var minVaLueOK = defaultMinValue !== undefined
    if     (minVaLueOK && maxValueOK && paramValue === undefined) {
        paramValue = {
            max: typeof defaultMaxValue === 'function' ? defaultMaxValue(params) : defaultMaxValue,
            min: typeof defaultMinValue === 'function' ? defaultMinValue(params) : defaultMinValue
        }
    } else {
        if     (typeof paramValue === 'number') {
            params[paramName] = paramValue = { max: paramValue }
        }
        if (isNonNullObject(paramValue)) {
            if (maxValueOK && paramValue.max === undefined) {
                paramValue.max = typeof defaultMaxValue === 'function' ? defaultMaxValue(params) : defaultMaxValue
            } else if (typeof paramValue.max !== 'number') {
                throw new Error(errorMessage(
                    paramName + '.max', 
                    paramValue.max === null ? 'null' : typeof paramValue.max, 
                    ['number']
                ))
            }
            if (paramValue.min === undefined) {
                paramValue.min = typeof defaultMinValue === 'function' ? defaultMinValue(params) : defaultMinValue
            } else if (typeof paramValue.min !== 'number') {
                throw new Error(errorMessage(
                    paramName + '.min', 
                    paramValue.min === null ? 'null' : typeof paramValue.min, 
                    ['number', 'undefined']
                ))
            }
        } else {
            throw new Error(errorMessage(
                paramName, 
                paramValue === null ? 'null' : typeof paramValue, 
                ['number', 'non-null object']
            ))
        }
    }
    return paramValue
}

module.exports = {
    checkValidParameter: checkValidParameter
}
},{}],6:[function(require,module,exports){
var siteswap = require('siteswap-generator');
$(document).ready(function(){
	$("#gif").hide()
})
const makeTable = (data) => {
	var table = ''
	//data[i].join("") will remove commas from array, ex: [5,3,4] becomes 534
	for(var i = 0; i < data.length; i++){
		if(i%4 == 0 && i == 0){
			table += "<div class='row'><div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}else if(i%4 == 0 && i != 0){
			table += "</div><div class='row'><div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}else{
			table += "<div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}
		if(i >= 25)
			break;
	}
	table += "</div>"
	console.log(table)
	$("#pattern-table").empty()
	$("#pattern-table").append(table)
}
$("#submit").click(function(){
	$("#gif").show()
	var url = "https://jugglinglab.org/anim?"
	var notation = document.querySelector('#pattern').value
	var slowdown = document.querySelector('#slowdown').value
	var diam = document.querySelector('#diameter').value
	console.log(url+notation)
	$("#gif").attr("src",url+"pattern="+notation+";border=15;slowdown="+slowdown+";propdiam="+diam+";redirect=true")
	console.log(url+"pattern="+notation+";border=3;slowdown="+slowdown+";propdiam="+diam+";redirect=true")
	$("label").hide
})

$("#generator").click(function(){ // This works, but can cause rendering errors. Try getting all images first so they load, then return that to the page.
	var maxballs = document.querySelector('#numballs').value
	var maxperiod = document.querySelector('#period').value
	var maxheight = document.querySelector('#maxheight').value
	var patterns = siteswap.Generator({
		balls : parseInt(maxballs),
		period: parseInt(maxperiod),
		height: parseInt(maxheight)
	})
	console.log(patterns)
	makeTable(patterns)
})


},{"siteswap-generator":2}]},{},[6]);
