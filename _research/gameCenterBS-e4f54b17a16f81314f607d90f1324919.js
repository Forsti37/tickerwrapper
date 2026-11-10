
var _asset_pipeline_loaded_modules = _asset_pipeline_loaded_modules || {};
var _asset_pipeline_require = function(path) {
	var loadedModule = _asset_pipeline_loaded_modules[path];
	if(loadedModule != undefined) {
		return loadedModule.exports;
	}
	var module = _asset_pipeline_modules[path];
	if(module != undefined) {
		_asset_pipeline_loaded_modules[path] = module();
		return _asset_pipeline_loaded_modules[path].exports;
	}
	return null;
};

var _asset_pipeline_modules = _asset_pipeline_modules || {};
_asset_pipeline_modules['jquery.js'] = 
(function() {
  var module = {exports: {}};
  var exports = module.exports;

  var process = process || {env: {NODE_ENV: "development"}};
//=require jquery/jquery-2.1.4.js

  return module;
})
;var process = process || {env: {NODE_ENV: "development"}};
/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

!function(a,b){"function"==typeof define&&define.amd?define("bloodhound",["jquery"],function(c){return a.Bloodhound=b(c)}):"object"==typeof exports?module.exports=b(_asset_pipeline_require("jquery.js")):a.Bloodhound=b(jQuery)}(this,function(a){var b=function(){"use strict";return{isMsie:function(){return/(msie|trident)/i.test(navigator.userAgent)?navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2]:!1},isBlankString:function(a){return!a||/^\s*$/.test(a)},escapeRegExChars:function(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},isString:function(a){return"string"==typeof a},isNumber:function(a){return"number"==typeof a},isArray:a.isArray,isFunction:a.isFunction,isObject:a.isPlainObject,isUndefined:function(a){return"undefined"==typeof a},isElement:function(a){return!(!a||1!==a.nodeType)},isJQuery:function(b){return b instanceof a},toStr:function(a){return b.isUndefined(a)||null===a?"":a+""},bind:a.proxy,each:function(b,c){function d(a,b){return c(b,a)}a.each(b,d)},map:a.map,filter:a.grep,every:function(b,c){var d=!0;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?void 0:!1}),!!d):d},some:function(b,c){var d=!1;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?!1:void 0}),!!d):d},mixin:a.extend,identity:function(a){return a},clone:function(b){return a.extend(!0,{},b)},getIdGenerator:function(){var a=0;return function(){return a++}},templatify:function(b){function c(){return String(b)}return a.isFunction(b)?b:c},defer:function(a){setTimeout(a,0)},debounce:function(a,b,c){var d,e;return function(){var f,g,h=this,i=arguments;return f=function(){d=null,c||(e=a.apply(h,i))},g=c&&!d,clearTimeout(d),d=setTimeout(f,b),g&&(e=a.apply(h,i)),e}},throttle:function(a,b){var c,d,e,f,g,h;return g=0,h=function(){g=new Date,e=null,f=a.apply(c,d)},function(){var i=new Date,j=b-(i-g);return c=this,d=arguments,0>=j?(clearTimeout(e),e=null,g=i,f=a.apply(c,d)):e||(e=setTimeout(h,j)),f}},stringify:function(a){return b.isString(a)?a:JSON.stringify(a)},noop:function(){}}}(),c="0.11.1",d=function(){"use strict";function a(a){return a=b.toStr(a),a?a.split(/\s+/):[]}function c(a){return a=b.toStr(a),a?a.split(/\W+/):[]}function d(a){return function(c){return c=b.isArray(c)?c:[].slice.call(arguments,0),function(d){var e=[];return b.each(c,function(c){e=e.concat(a(b.toStr(d[c])))}),e}}}return{nonword:c,whitespace:a,obj:{nonword:d(c),whitespace:d(a)}}}(),e=function(){"use strict";function c(c){this.maxSize=b.isNumber(c)?c:100,this.reset(),this.maxSize<=0&&(this.set=this.get=a.noop)}function d(){this.head=this.tail=null}function e(a,b){this.key=a,this.val=b,this.prev=this.next=null}return b.mixin(c.prototype,{set:function(a,b){var c,d=this.list.tail;this.size>=this.maxSize&&(this.list.remove(d),delete this.hash[d.key],this.size--),(c=this.hash[a])?(c.val=b,this.list.moveToFront(c)):(c=new e(a,b),this.list.add(c),this.hash[a]=c,this.size++)},get:function(a){var b=this.hash[a];return b?(this.list.moveToFront(b),b.val):void 0},reset:function(){this.size=0,this.hash={},this.list=new d}}),b.mixin(d.prototype,{add:function(a){this.head&&(a.next=this.head,this.head.prev=a),this.head=a,this.tail=this.tail||a},remove:function(a){a.prev?a.prev.next=a.next:this.head=a.next,a.next?a.next.prev=a.prev:this.tail=a.prev},moveToFront:function(a){this.remove(a),this.add(a)}}),c}(),f=function(){"use strict";function c(a,c){this.prefix=["__",a,"__"].join(""),this.ttlKey="__ttl__",this.keyMatcher=new RegExp("^"+b.escapeRegExChars(this.prefix)),this.ls=c||h,!this.ls&&this._noop()}function d(){return(new Date).getTime()}function e(a){return JSON.stringify(b.isUndefined(a)?null:a)}function f(b){return a.parseJSON(b)}function g(a){var b,c,d=[],e=h.length;for(b=0;e>b;b++)(c=h.key(b)).match(a)&&d.push(c.replace(a,""));return d}var h;try{h=window.localStorage,h.setItem("~~~","!"),h.removeItem("~~~")}catch(i){h=null}return b.mixin(c.prototype,{_prefix:function(a){return this.prefix+a},_ttlKey:function(a){return this._prefix(a)+this.ttlKey},_noop:function(){this.get=this.set=this.remove=this.clear=this.isExpired=b.noop},_safeSet:function(a,b){try{this.ls.setItem(a,b)}catch(c){"QuotaExceededError"===c.name&&(this.clear(),this._noop())}},get:function(a){return this.isExpired(a)&&this.remove(a),f(this.ls.getItem(this._prefix(a)))},set:function(a,c,f){return b.isNumber(f)?this._safeSet(this._ttlKey(a),e(d()+f)):this.ls.removeItem(this._ttlKey(a)),this._safeSet(this._prefix(a),e(c))},remove:function(a){return this.ls.removeItem(this._ttlKey(a)),this.ls.removeItem(this._prefix(a)),this},clear:function(){var a,b=g(this.keyMatcher);for(a=b.length;a--;)this.remove(b[a]);return this},isExpired:function(a){var c=f(this.ls.getItem(this._ttlKey(a)));return b.isNumber(c)&&d()>c?!0:!1}}),c}(),g=function(){"use strict";function c(a){a=a||{},this.cancelled=!1,this.lastReq=null,this._send=a.transport,this._get=a.limiter?a.limiter(this._get):this._get,this._cache=a.cache===!1?new e(0):h}var d=0,f={},g=6,h=new e(10);return c.setMaxPendingRequests=function(a){g=a},c.resetCache=function(){h.reset()},b.mixin(c.prototype,{_fingerprint:function(b){return b=b||{},b.url+b.type+a.param(b.data||{})},_get:function(a,b){function c(a){b(null,a),k._cache.set(i,a)}function e(){b(!0)}function h(){d--,delete f[i],k.onDeckRequestArgs&&(k._get.apply(k,k.onDeckRequestArgs),k.onDeckRequestArgs=null)}var i,j,k=this;i=this._fingerprint(a),this.cancelled||i!==this.lastReq||((j=f[i])?j.done(c).fail(e):g>d?(d++,f[i]=this._send(a).done(c).fail(e).always(h)):this.onDeckRequestArgs=[].slice.call(arguments,0))},get:function(c,d){var e,f;d=d||a.noop,c=b.isString(c)?{url:c}:c||{},f=this._fingerprint(c),this.cancelled=!1,this.lastReq=f,(e=this._cache.get(f))?d(null,e):this._get(c,d)},cancel:function(){this.cancelled=!0}}),c}(),h=window.SearchIndex=function(){"use strict";function c(c){c=c||{},c.datumTokenizer&&c.queryTokenizer||a.error("datumTokenizer and queryTokenizer are both required"),this.identify=c.identify||b.stringify,this.datumTokenizer=c.datumTokenizer,this.queryTokenizer=c.queryTokenizer,this.reset()}function d(a){return a=b.filter(a,function(a){return!!a}),a=b.map(a,function(a){return a.toLowerCase()})}function e(){var a={};return a[i]=[],a[h]={},a}function f(a){for(var b={},c=[],d=0,e=a.length;e>d;d++)b[a[d]]||(b[a[d]]=!0,c.push(a[d]));return c}function g(a,b){var c=0,d=0,e=[];a=a.sort(),b=b.sort();for(var f=a.length,g=b.length;f>c&&g>d;)a[c]<b[d]?c++:a[c]>b[d]?d++:(e.push(a[c]),c++,d++);return e}var h="c",i="i";return b.mixin(c.prototype,{bootstrap:function(a){this.datums=a.datums,this.trie=a.trie},add:function(a){var c=this;a=b.isArray(a)?a:[a],b.each(a,function(a){var f,g;c.datums[f=c.identify(a)]=a,g=d(c.datumTokenizer(a)),b.each(g,function(a){var b,d,g;for(b=c.trie,d=a.split("");g=d.shift();)b=b[h][g]||(b[h][g]=e()),b[i].push(f)})})},get:function(a){var c=this;return b.map(a,function(a){return c.datums[a]})},search:function(a){var c,e,j=this;return c=d(this.queryTokenizer(a)),b.each(c,function(a){var b,c,d,f;if(e&&0===e.length)return!1;for(b=j.trie,c=a.split("");b&&(d=c.shift());)b=b[h][d];return b&&0===c.length?(f=b[i].slice(0),void(e=e?g(e,f):f)):(e=[],!1)}),e?b.map(f(e),function(a){return j.datums[a]}):[]},all:function(){var a=[];for(var b in this.datums)a.push(this.datums[b]);return a},reset:function(){this.datums={},this.trie=e()},serialize:function(){return{datums:this.datums,trie:this.trie}}}),c}(),i=function(){"use strict";function a(a){this.url=a.url,this.ttl=a.ttl,this.cache=a.cache,this.prepare=a.prepare,this.transform=a.transform,this.transport=a.transport,this.thumbprint=a.thumbprint,this.storage=new f(a.cacheKey)}var c;return c={data:"data",protocol:"protocol",thumbprint:"thumbprint"},b.mixin(a.prototype,{_settings:function(){return{url:this.url,type:"GET",dataType:"json"}},store:function(a){this.cache&&(this.storage.set(c.data,a,this.ttl),this.storage.set(c.protocol,location.protocol,this.ttl),this.storage.set(c.thumbprint,this.thumbprint,this.ttl))},fromCache:function(){var a,b={};return this.cache?(b.data=this.storage.get(c.data),b.protocol=this.storage.get(c.protocol),b.thumbprint=this.storage.get(c.thumbprint),a=b.thumbprint!==this.thumbprint||b.protocol!==location.protocol,b.data&&!a?b.data:null):null},fromNetwork:function(a){function b(){a(!0)}function c(b){a(null,e.transform(b))}var d,e=this;a&&(d=this.prepare(this._settings()),this.transport(d).fail(b).done(c))},clear:function(){return this.storage.clear(),this}}),a}(),j=function(){"use strict";function a(a){this.url=a.url,this.prepare=a.prepare,this.transform=a.transform,this.transport=new g({cache:a.cache,limiter:a.limiter,transport:a.transport})}return b.mixin(a.prototype,{_settings:function(){return{url:this.url,type:"GET",dataType:"json"}},get:function(a,b){function c(a,c){b(a?[]:e.transform(c))}var d,e=this;if(b)return a=a||"",d=this.prepare(a,this._settings()),this.transport.get(d,c)},cancelLastRequest:function(){this.transport.cancel()}}),a}(),k=function(){"use strict";function d(d){var e;return d?(e={url:null,ttl:864e5,cache:!0,cacheKey:null,thumbprint:"",prepare:b.identity,transform:b.identity,transport:null},d=b.isString(d)?{url:d}:d,d=b.mixin(e,d),!d.url&&a.error("prefetch requires url to be set"),d.transform=d.filter||d.transform,d.cacheKey=d.cacheKey||d.url,d.thumbprint=c+d.thumbprint,d.transport=d.transport?h(d.transport):a.ajax,d):null}function e(c){var d;if(c)return d={url:null,cache:!0,prepare:null,replace:null,wildcard:null,limiter:null,rateLimitBy:"debounce",rateLimitWait:300,transform:b.identity,transport:null},c=b.isString(c)?{url:c}:c,c=b.mixin(d,c),!c.url&&a.error("remote requires url to be set"),c.transform=c.filter||c.transform,c.prepare=f(c),c.limiter=g(c),c.transport=c.transport?h(c.transport):a.ajax,delete c.replace,delete c.wildcard,delete c.rateLimitBy,delete c.rateLimitWait,c}function f(a){function b(a,b){return b.url=f(b.url,a),b}function c(a,b){return b.url=b.url.replace(g,encodeURIComponent(a)),b}function d(a,b){return b}var e,f,g;return e=a.prepare,f=a.replace,g=a.wildcard,e?e:e=f?b:a.wildcard?c:d}function g(a){function c(a){return function(c){return b.debounce(c,a)}}function d(a){return function(c){return b.throttle(c,a)}}var e,f,g;return e=a.limiter,f=a.rateLimitBy,g=a.rateLimitWait,e||(e=/^throttle$/i.test(f)?d(g):c(g)),e}function h(c){return function(d){function e(a){b.defer(function(){g.resolve(a)})}function f(a){b.defer(function(){g.reject(a)})}var g=a.Deferred();return c(d,e,f),g}}return function(c){var f,g;return f={initialize:!0,identify:b.stringify,datumTokenizer:null,queryTokenizer:null,sufficient:5,sorter:null,local:[],prefetch:null,remote:null},c=b.mixin(f,c||{}),!c.datumTokenizer&&a.error("datumTokenizer is required"),!c.queryTokenizer&&a.error("queryTokenizer is required"),g=c.sorter,c.sorter=g?function(a){return a.sort(g)}:b.identity,c.local=b.isFunction(c.local)?c.local():c.local,c.prefetch=d(c.prefetch),c.remote=e(c.remote),c}}(),l=function(){"use strict";function c(a){a=k(a),this.sorter=a.sorter,this.identify=a.identify,this.sufficient=a.sufficient,this.local=a.local,this.remote=a.remote?new j(a.remote):null,this.prefetch=a.prefetch?new i(a.prefetch):null,this.index=new h({identify:this.identify,datumTokenizer:a.datumTokenizer,queryTokenizer:a.queryTokenizer}),a.initialize!==!1&&this.initialize()}var e;return e=window&&window.Bloodhound,c.noConflict=function(){return window&&(window.Bloodhound=e),c},c.tokenizers=d,b.mixin(c.prototype,{__ttAdapter:function(){function a(a,b,d){return c.search(a,b,d)}function b(a,b){return c.search(a,b)}var c=this;return this.remote?a:b},_loadPrefetch:function(){function b(a,b){return a?c.reject():(e.add(b),e.prefetch.store(e.index.serialize()),void c.resolve())}var c,d,e=this;return c=a.Deferred(),this.prefetch?(d=this.prefetch.fromCache())?(this.index.bootstrap(d),c.resolve()):this.prefetch.fromNetwork(b):c.resolve(),c.promise()},_initialize:function(){function a(){b.add(b.local)}var b=this;return this.clear(),(this.initPromise=this._loadPrefetch()).done(a),this.initPromise},initialize:function(a){return!this.initPromise||a?this._initialize():this.initPromise},add:function(a){return this.index.add(a),this},get:function(a){return a=b.isArray(a)?a:[].slice.call(arguments),this.index.get(a)},search:function(a,c,d){function e(a){var c=[];b.each(a,function(a){!b.some(f,function(b){return g.identify(a)===g.identify(b)})&&c.push(a)}),d&&d(c)}var f,g=this;return f=this.sorter(this.index.search(a)),c(this.remote?f.slice():f),this.remote&&f.length<this.sufficient?this.remote.get(a,e):this.remote&&this.remote.cancelLastRequest(),this},all:function(){return this.index.all()},clear:function(){return this.index.reset(),this},clearPrefetchCache:function(){return this.prefetch&&this.prefetch.clear(),this},clearRemoteCache:function(){return g.resetCache(),this},ttAdapter:function(){return this.__ttAdapter()}}),c}();return l});

var _asset_pipeline_loaded_modules = _asset_pipeline_loaded_modules || {};
var _asset_pipeline_require = function(path) {
	var loadedModule = _asset_pipeline_loaded_modules[path];
	if(loadedModule != undefined) {
		return loadedModule.exports;
	}
	var module = _asset_pipeline_modules[path];
	if(module != undefined) {
		_asset_pipeline_loaded_modules[path] = module();
		return _asset_pipeline_loaded_modules[path].exports;
	}
	return null;
};

var _asset_pipeline_modules = _asset_pipeline_modules || {};
_asset_pipeline_modules['jquery.js'] = 
(function() {
  var module = {exports: {}};
  var exports = module.exports;

  var process = process || {env: {NODE_ENV: "development"}};
//=require jquery/jquery-2.1.4.js

  return module;
})
;var process = process || {env: {NODE_ENV: "development"}};
!function(t,e){"use strict";"undefined"!=typeof module&&module.exports?module.exports=e(_asset_pipeline_require("jquery.js")):"function"==typeof define&&define.amd?define(["jquery"],function(t){return e(t)}):e(t.jQuery)}(this,function(t){"use strict";var e=function(s,i){this.$element=t(s),this.options=t.extend({},e.defaults,i),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.select=this.options.select||this.select,this.autoSelect="boolean"!=typeof this.options.autoSelect||this.options.autoSelect,this.highlighter=this.options.highlighter||this.highlighter,this.render=this.options.render||this.render,this.updater=this.options.updater||this.updater,this.displayText=this.options.displayText||this.displayText,this.itemLink=this.options.itemLink||this.itemLink,this.itemTitle=this.options.itemTitle||this.itemTitle,this.followLinkOnSelect=this.options.followLinkOnSelect||this.followLinkOnSelect,this.source=this.options.source,this.delay=this.options.delay,this.theme=this.options.theme&&this.options.themes&&this.options.themes[this.options.theme]||e.defaults.themes[e.defaults.theme],this.$menu=t(this.options.menu||this.theme.menu),this.$appendTo=this.options.appendTo?t(this.options.appendTo):null,this.fitToElement="boolean"==typeof this.options.fitToElement&&this.options.fitToElement,this.shown=!1,this.listen(),this.showHintOnFocus=("boolean"==typeof this.options.showHintOnFocus||"all"===this.options.showHintOnFocus)&&this.options.showHintOnFocus,this.afterSelect=this.options.afterSelect,this.afterEmptySelect=this.options.afterEmptySelect,this.addItem=!1,this.value=this.$element.val()||this.$element.text(),this.keyPressed=!1,this.focused=this.$element.is(":focus"),this.changeInputOnSelect=this.options.changeInputOnSelect||this.changeInputOnSelect,this.changeInputOnMove=this.options.changeInputOnMove||this.changeInputOnMove,this.openLinkInNewTab=this.options.openLinkInNewTab||this.openLinkInNewTab,this.selectOnBlur=this.options.selectOnBlur||this.selectOnBlur,this.showCategoryHeader=this.options.showCategoryHeader||this.showCategoryHeader};e.prototype={constructor:e,setDefault:function(t){if(this.$element.data("active",t),this.autoSelect||t){var e=this.updater(t);e||(e=""),this.$element.val(this.displayText(e)||e).text(this.displayText(e)||e).change(),this.afterSelect(e)}return this.hide()},select:function(){var t=this.$menu.find(".active").data("value");if(this.$element.data("active",t),this.autoSelect||t){var e=this.updater(t);e||(e=""),this.changeInputOnSelect&&this.$element.val(this.displayText(e)||e).text(this.displayText(e)||e).change(),this.followLinkOnSelect&&this.itemLink(t)?(this.openLinkInNewTab?window.open(this.itemLink(t),"_blank"):document.location=this.itemLink(t),this.afterSelect(e)):this.followLinkOnSelect&&!this.itemLink(t)?this.afterEmptySelect(e):this.afterSelect(e)}else this.afterEmptySelect();return this.hide()},updater:function(t){return t},setSource:function(t){this.source=t},show:function(){var e,s=t.extend({},this.$element.position(),{height:this.$element[0].offsetHeight}),i="function"==typeof this.options.scrollHeight?this.options.scrollHeight.call():this.options.scrollHeight;if(this.shown?e=this.$menu:this.$appendTo?(e=this.$menu.appendTo(this.$appendTo),this.hasSameParent=this.$appendTo.is(this.$element.parent())):(e=this.$menu.insertAfter(this.$element),this.hasSameParent=!0),!this.hasSameParent){e.css("position","fixed");var o=this.$element.offset();s.top=o.top,s.left=o.left}var n=t(e).parent().hasClass("dropup")?"auto":s.top+s.height+i,h=t(e).hasClass("dropdown-menu-right")?"auto":s.left;return e.css({top:n,left:h}).show(),!0===this.options.fitToElement&&e.css("width",this.$element.outerWidth()+"px"),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(e){if(this.query=null!=e?e:this.$element.val(),this.query.length<this.options.minLength&&!this.options.showHintOnFocus)return this.shown?this.hide():this;var s=t.proxy(function(){t.isFunction(this.source)&&3===this.source.length?this.source(this.query,t.proxy(this.process,this),t.proxy(this.process,this)):t.isFunction(this.source)?this.source(this.query,t.proxy(this.process,this)):this.source&&this.process(this.source)},this);clearTimeout(this.lookupWorker),this.lookupWorker=setTimeout(s,this.delay)},process:function(e){var s=this;return e=t.grep(e,function(t){return s.matcher(t)}),(e=this.sorter(e)).length||this.options.addItem?(e.length>0?this.$element.data("active",e[0]):this.$element.data("active",null),"all"!=this.options.items&&(e=e.slice(0,this.options.items)),this.options.addItem&&e.push(this.options.addItem),this.render(e).show()):this.shown?this.hide():this},matcher:function(t){return~this.displayText(t).toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(t){for(var e,s=[],i=[],o=[];e=t.shift();){var n=this.displayText(e);n.toLowerCase().indexOf(this.query.toLowerCase())?~n.indexOf(this.query)?i.push(e):o.push(e):s.push(e)}return s.concat(i,o)},highlighter:function(t){var e=this.query;if(""===e)return t;var s,i=t.match(/(>)([^<]*)(<)/g),o=[],n=[];if(i&&i.length)for(s=0;s<i.length;++s)i[s].length>2&&o.push(i[s]);else(o=[]).push(t);e=e.replace(/[\(\)\/\.\*\+\?\[\]]/g,function(t){return"\\"+t});var h,a=new RegExp(e,"g");for(s=0;s<o.length;++s)(h=o[s].match(a))&&h.length>0&&n.push(o[s]);for(s=0;s<n.length;++s)t=t.replace(n[s],n[s].replace(a,"<strong>$&</strong>"));return t},render:function(e){var s=this,i=this,o=!1,n=[],h=s.options.separator;return t.each(e,function(t,s){t>0&&s[h]!==e[t-1][h]&&n.push({__type:"divider"}),this.showCategoryHeader&&(!s[h]||0!==t&&s[h]===e[t-1][h]||n.push({__type:"category",name:s[h]})),n.push(s)}),e=t(n).map(function(e,n){if("category"==(n.__type||!1))return t(s.options.headerHtml||s.theme.headerHtml).text(n.name)[0];if("divider"==(n.__type||!1))return t(s.options.headerDivider||s.theme.headerDivider)[0];var h=i.displayText(n);return(e=t(s.options.item||s.theme.item).data("value",n)).find(s.options.itemContentSelector||s.theme.itemContentSelector).addBack(s.options.itemContentSelector||s.theme.itemContentSelector).html(s.highlighter(h,n)),s.options.followLinkOnSelect&&e.find("a").attr("href",i.itemLink(n)),e.find("a").attr("title",i.itemTitle(n)),h==i.$element.val()&&(e.addClass("active"),i.$element.data("active",n),o=!0),e[0]}),this.autoSelect&&!o&&(e.filter(":not(.dropdown-header)").first().addClass("active"),this.$element.data("active",e.first().data("value"))),this.$menu.html(e),this},displayText:function(t){return void 0!==t&&void 0!==t.name?t.name:t},itemLink:function(t){return null},itemTitle:function(t){return null},next:function(e){var s=this.$menu.find(".active").removeClass("active").next();for(s.length||(s=t(this.$menu.find(t(this.options.item||this.theme.item).prop("tagName"))[0]));s.hasClass("divider")||s.hasClass("dropdown-header");)s=s.next();s.addClass("active");var i=this.updater(s.data("value"));this.changeInputOnMove&&this.$element.val(this.displayText(i)||i)},prev:function(e){var s=this.$menu.find(".active").removeClass("active").prev();for(s.length||(s=this.$menu.find(t(this.options.item||this.theme.item).prop("tagName")).last());s.hasClass("divider")||s.hasClass("dropdown-header");)s=s.prev();s.addClass("active");var i=this.updater(s.data("value"));this.changeInputOnMove&&this.$element.val(this.displayText(i)||i)},listen:function(){this.$element.on("focus.bootstrap3Typeahead",t.proxy(this.focus,this)).on("blur.bootstrap3Typeahead",t.proxy(this.blur,this)).on("keypress.bootstrap3Typeahead",t.proxy(this.keypress,this)).on("propertychange.bootstrap3Typeahead input.bootstrap3Typeahead",t.proxy(this.input,this)).on("keyup.bootstrap3Typeahead",t.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown.bootstrap3Typeahead",t.proxy(this.keydown,this));var e=t(this.options.item||this.theme.item).prop("tagName");"ontouchstart"in document.documentElement?this.$menu.on("touchstart",e,t.proxy(this.touchstart,this)).on("touchend",e,t.proxy(this.click,this)):this.$menu.on("click",t.proxy(this.click,this)).on("mouseenter",e,t.proxy(this.mouseenter,this)).on("mouseleave",e,t.proxy(this.mouseleave,this)).on("mousedown",t.proxy(this.mousedown,this))},destroy:function(){this.$element.data("typeahead",null),this.$element.data("active",null),this.$element.unbind("focus.bootstrap3Typeahead").unbind("blur.bootstrap3Typeahead").unbind("keypress.bootstrap3Typeahead").unbind("propertychange.bootstrap3Typeahead input.bootstrap3Typeahead").unbind("keyup.bootstrap3Typeahead"),this.eventSupported("keydown")&&this.$element.unbind("keydown.bootstrap3-typeahead"),this.$menu.remove(),this.destroyed=!0},eventSupported:function(t){var e=t in this.$element;return e||(this.$element.setAttribute(t,"return;"),e="function"==typeof this.$element[t]),e},move:function(t){if(this.shown)switch(t.keyCode){case 9:case 13:case 27:t.preventDefault();break;case 38:if(t.shiftKey)return;t.preventDefault(),this.prev();break;case 40:if(t.shiftKey)return;t.preventDefault(),this.next()}},keydown:function(e){17!==e.keyCode&&(this.keyPressed=!0,this.suppressKeyPressRepeat=~t.inArray(e.keyCode,[40,38,9,13,27]),this.shown||40!=e.keyCode?this.move(e):this.lookup())},keypress:function(t){this.suppressKeyPressRepeat||this.move(t)},input:function(t){var e=this.$element.val()||this.$element.text();this.value!==e&&(this.value=e,this.lookup())},keyup:function(t){if(!this.destroyed)switch(t.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:if(!this.shown||this.showHintOnFocus&&!this.keyPressed)return;this.select();break;case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide()}},focus:function(t){this.focused||(this.focused=!0,this.keyPressed=!1,this.options.showHintOnFocus&&!0!==this.skipShowHintOnFocus&&("all"===this.options.showHintOnFocus?this.lookup(""):this.lookup())),this.skipShowHintOnFocus&&(this.skipShowHintOnFocus=!1)},blur:function(t){this.mousedover||this.mouseddown||!this.shown?this.mouseddown&&(this.skipShowHintOnFocus=!0,this.$element.focus(),this.mouseddown=!1):(this.selectOnBlur&&this.select(),this.hide(),this.focused=!1,this.keyPressed=!1)},click:function(t){t.preventDefault(),this.skipShowHintOnFocus=!0,this.select(),this.$element.focus(),this.hide()},mouseenter:function(e){this.mousedover=!0,this.$menu.find(".active").removeClass("active"),t(e.currentTarget).addClass("active")},mouseleave:function(t){this.mousedover=!1,!this.focused&&this.shown&&this.hide()},mousedown:function(t){this.mouseddown=!0,this.$menu.one("mouseup",function(t){this.mouseddown=!1}.bind(this))},touchstart:function(e){e.preventDefault(),this.$menu.find(".active").removeClass("active"),t(e.currentTarget).addClass("active")},touchend:function(t){t.preventDefault(),this.select(),this.$element.focus()}};var s=t.fn.typeahead;t.fn.typeahead=function(s){var i=arguments;return"string"==typeof s&&"getActive"==s?this.data("active"):this.each(function(){var o=t(this),n=o.data("typeahead"),h="object"==typeof s&&s;n||o.data("typeahead",n=new e(this,h)),"string"==typeof s&&n[s]&&(i.length>1?n[s].apply(n,Array.prototype.slice.call(i,1)):n[s]())})},e.defaults={source:[],items:8,minLength:1,scrollHeight:0,autoSelect:!0,afterSelect:t.noop,afterEmptySelect:t.noop,addItem:!1,followLinkOnSelect:!1,delay:0,separator:"category",changeInputOnSelect:!0,changeInputOnMove:!0,openLinkInNewTab:!1,selectOnBlur:!0,showCategoryHeader:!0,theme:"bootstrap3",themes:{bootstrap3:{menu:'<ul class="typeahead dropdown-menu" role="listbox"></ul>',item:'<li><a class="dropdown-item" href="#" role="option"></a></li>',itemContentSelector:"a",headerHtml:'<li class="dropdown-header"></li>',headerDivider:'<li class="divider" role="separator"></li>'},bootstrap4:{menu:'<div class="typeahead dropdown-menu" role="listbox"></div>',item:'<button class="dropdown-item" role="option"></button>',itemContentSelector:".dropdown-item",headerHtml:'<h6 class="dropdown-header"></h6>',headerDivider:'<div class="dropdown-divider"></div>'}}},t.fn.typeahead.Constructor=e,t.fn.typeahead.noConflict=function(){return t.fn.typeahead=s,this},t(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(e){var s=t(this);s.data("typeahead")||s.typeahead(s.data())})});
var process = process || {env: {NODE_ENV: "development"}};
$(document).ready(function() {

    toastr.options = {
        "debug": false,
        "positionClass": "toast-bottom-full-width",
        "onclick": null,
        "progressBar": true,
        "fadeIn": 300,
        "fadeOut": 1000,
        "timeOut": 7500,
        "extendedTimeOut": 3000,
        "preventDuplicates": true
    }

    initRemoteLinks();
    linkGameRows();

    $('.selectRound select.round').change(function() {
        location.href = _appRootUri + 'spielplan/' + competitionId + '/' + competitionAlias + '/' + this.value
    });

    var $muteButton = $('#muteButton');
    var muteCookie = Cookies.get('lp-goalalert');

    if (typeof doGoalSound !== 'undefined' && doGoalSound &&
        typeof allowGoalSound !== 'undefined' && allowGoalSound &&
        muteCookie != 'muted') {
        mute = false;
        $muteButton.removeClass('btn-outline-secondary').addClass('btn-success');
    }

    if (typeof allowGoalSound === 'undefined' || !allowGoalSound) {
        $muteButton.find('i.fas').removeClass('fa-bell').addClass('fa-bell-slash');
        $muteButton.attr('title', 'Toralarm in dieser Ansicht nicht verfügbar');
    }
    $muteButton.click(function(event) {
        event.preventDefault();
        if (!allowGoalSound) {
            toastr.info('Toralarm in dieser Ansicht nicht verfügbar');
        }
        if (isPremium) {
            if (mute || muteCookie == 'muted') {
                mute = false;
                $(this).removeClass('btn-outline-secondary').addClass('btn-success');
                toastr.success('Toralarm aktiviert');
                Cookies.set('lp-goalalert', 'active', { expires: 90, path: '/' });
            } else {
                mute = true;
                $(this).removeClass('btn-success').addClass('btn-outline-secondary');
                toastr.info('Toralarm deaktiviert');
                Cookies.set('lp-goalalert', 'muted', { expires: 90, path: '/' });
            }
        } else {
            $(this).tooltip('hide');
            $( "#gold-modal" ).modal('show');
        }
    });

    $('.refreshSchedule').click(function(event) {
        event.preventDefault();

        startStatisticsPolling();

        if (new Date().getTime() - lastRefreshTime > 30000) {
            loadStatisticsData(false);
            trackOEWAPixel();
            trackAnalyticsViewCount();
        }

        sas.clean();
        sas.refresh({ forceMasterFlag: true }); // all positions

        var analyticsEventLabel = $('.h1-competition').text().trim();
        if(googleAnalyticsFired && typeof ga != 'undefined') {
            ga('send', 'event', 'Ticker-Refresh', 'Ticker-Schedule', analyticsEventLabel);
        }

        if($('.d-block').is(":visible") && $('.d-md-none').is(":visible") && window.scrollY > 150) {
            $('html, body').animate({scrollTop: 0}, 250);
        }

    });


    $('#pickLeagueModal').on('shown.bs.modal', function (e) {
        //console.log('modal shown');
        if ( status == "error" ) {
            var msg = "Sorry but there was an error: ";
            console.log( msg + xhr.status + " " + xhr.statusText );
        } else {
            $(this).find('.drilldown-body').load($(e.relatedTarget).data('url'), function(data) {
                //console.log(data);
                //console.log('call initDrillDown()');
                initDrilldown();
            });
        }
    });

    $('#pickLeagueModal').on('hidden.bs.modal', function (e) {
        //console.log('modal hidden');
        $('#pickLeagueModal').modal('dispose');
        $(this).find('.drilldown-body').html('<p class="jumbotron bg-white text-center text-secondary lead"><i class="fas fa-circle-notch fa-spin mr-2"></i> Lade Ligen-Struktur...</p>');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        if ( $(e.target).attr("href") == '#videos' ) {
            $('#video-teaser').lazy();
        }

        trackOEWAPixel();
    });

    /* games by date */

    if($("#pickDate").length > 0) {
        $( "#pickDate" ).datepicker({
            language: 'at',
            format: "dd.mm.yyyy",
            todayBtn: "linked",
            todayHighlight: true,
            weekStart: 1,
            defaultViewDate: datePicked,
            startDate: '01-08-2012',
            endDate: '+52w',
            //endDate: '31-12-2030',
            templates: {
                leftArrow: '<i class="fa fa-chevron-left text-muted"></i>',
                rightArrow: '<i class="fa fa-chevron-right text-secondary"></i>'
            },
            forceParse: false
        });

        $( "#pickDate" ).change(function() {
            if($(this).data("url")) {
                window.location.href = $(this).data("url").replace("date-placeholder", $(this).val());
            }
        });
    }

    if($('.gamesCountTicker').length > 0) {
        $('.gamesCountTicker').html(gamesCountTicker);
    }

    if($('.gamesCountTicker').length > 0 && gamesCountLive > 0) {
        $('.gamesCountLive > a').html('<span class="badge badge-light">' + gamesCountLive + '</span> Spiel' + (gamesCountLive > 1 ? 'e' : '') + ' <span class="text-uppercase">live</span>!');
        $('.gamesCountLive').show();
    }

    if($('.gamesCountAll').length > 0 /*&& tickerCountOnly*/) {
        $('.gamesCountAll').html(gamesCountAll);
    }

    $('#commentsModal').on('shown.bs.modal', function (e) {
        $(this).find('.modal-body').html('<iframe src="' + $(e.relatedTarget).attr('href') + '" frameborder="0" width="846" height="520"></iframe>');
        $(this).find('.modal-title i').fadeOut();
    });
    $('#commentsModal').on('hidden.bs.modal', function (e) {
        $(this).find('.modal-title i').show();
    });

    /* lazy iframe loading */
    $("#dazn").Lazy({
        effect: 'fadeIn',
        visibleOnly: true,
        afterLoad: function(element) {
            var label = $('#dazn').data('label');
            if(googleAnalyticsFired && typeof ga != 'undefined') {
                ga('send', 'event', 'Widget', 'DAZN', label);
            }
        },
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });

    setTimeout(function() {
        if(typeof $().tooltip == 'function') {
            $("[data-toggle='tooltip']").tooltip();
        }
    }, 1200);

    /* lazy image loading */
    $(".lazy").Lazy({
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 500,
        visibleOnly: true,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        },
        rankingLoader: function(element) {
            $.ajax({
                url: element.data('src') + '?_=' + Math.floor(Date.now() / 50000),
                data: {
                    format: 'html'
                },
                cache: true
            })
                .done(function( data ) {
                    element.html(data);
                    element.find('img').Lazy();
                    if(element.data('highlight')) {
                        $.each(element.data('highlight'), function( index, value ) {
                            element.find('.tableEntry.'+value).addClass('table-primary');
                        });
                    }
                })
                .fail(function() {
                    element.find('.card-body').html('<p>Tabelle konnte nicht geladen werden</p>');
                });
        },
        provinceBoxLoader: function(element) {
            $.ajax({
                url: element.data('src') + '&_=' + Math.floor(Date.now() / 50000),
                data: {
                    format: 'html'
                },
                cache: true
            })
                .done(function( data ) {
                    element.replaceWith(data);
                })
                .fail(function() {
                    element.remove();
                });
        },
        playersLoader: function(element) {
            $.ajax({
                url: element.data('src'),
                data: {
                    format: 'html'
                },
                cache: true
            })
                .done(function( data ) {
                    element.replaceWith(data);
                })
                .fail(function() {
                    element.remove();
                });
        }
    });

}); //document ready



/* fix skyscraper to top when scrolling the page */
if($('.skyscraper').length) {
    $(window).on("scroll", function() {
        if (window.scrollY > $(".bs_top").outerHeight(true) - 10) {
            $('.skyscraper').addClass("fixed");
        } else {
            $('.skyscraper').removeClass("fixed");
        }
    });
}

/* current window visibility  */
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        //console.log('hidden');
        pageVisible = false;
    } else {
        //console.log('visible');
        pageVisible = true;
    }
});

function initDrilldown() {

    $('#drilldown > div.drilldown-body > ul').drilldown({
        wrapper_class: 'drilldown',
        menu_class: 'drilldown-menu list-group',
        submenu_class: 'nav ',
        parent_class: 'dd-parent',
        parent_class_li: 'dd-parent-a',
        active_class: 'active',
        header_class_li: 'breadcrumb',
        header_class: 'breadcrumbwrapper',
        class_selected : 'selected',
        event_type: 'click  ',
        hover_delay: 300,
        speed: 'fast',
        save_state: false,
        show_count: true,
        count_class: 'dd-count float-right badge badge-light my-1',
        icon_class: 'fas fa-chevron-right float-right dd-icon mt-1 mr-1',
        link_type: 'backlink', //breadcrumb , link, backlink
        reset_text: '<span class="glyphicon glyphicon-folder-open"></span> &nbsp;Meisterschaften', // All
        default_text: 'Zurück',
        show_end_nodes: false, // drill to final empty nodes
        hide_empty: true, // hide empty menu when menu_height is set, header no effected
        menu_height: false, // '200px' , false for auto height
        show_header: false,
        header_tag: 'div',// h3
        header_tag_class: 'list-group-item active' // hidden list-group-item active
    });

    $('.lazy-drilldown').Lazy({
        visibleOnly: true
    });
}

function trackOEWAPixel(){
    if (typeof IOMm !== 'undefined' && typeof blockOEWA === 'undefined') {
        IOMm('pageview', {cp: 'RedCont/Sport/Fussball'} ); // Count pageview
    }
}

function linkGameRows() {
    $('.game-row').each(function() {
        var bttn = $( this ).find('.button-holder > .btn-group > .btn');
        if( bttn.is(":hidden") ) {
            var color = bttn.data('color');
            var link = bttn.attr('href');
            $( this ).find('.slt').addClass('bg-' + color);
            if(link) {
                //console.log(link);
                $( this ).on("click",function(){
                    window.location = link;
                });
                $( this ).find('.team > a').on("click",function(e){
                    e.preventDefault();
                    window.location = link;
                });
            }
        }
    });
}

// replacement script for g:remoteLink tag
function initRemoteLinks() {
    $('.remoteLink').click(function(e) {
        e.preventDefault();
        var remoteUrl = $(this).attr('href');
        var targetName = $(this).data('update');
        var before = [];
        var onSuccess = [];
        var onComplete = [];
        var onFailure = [];
        if($(this).data('before')) {
            before = $(this).data('before').split(';');
        }
        if($(this).data('success')) {
            onSuccess = $(this).data('success').split(';');
        }
        if($(this).data('complete')) {
            onComplete = $(this).data('complete').split(';');
        }
        if($(this).data('failure')) {
            onFailure = $(this).data('failure').split(';');
        }

        if(remoteUrl != '' && targetName != '') {
            $.ajax({
                url: remoteUrl,
                dataType: 'html',
                success: function(data) {
                    $('#'+targetName).html(data);
                    // callback to link newly loaded remoteLinks
                    initRemoteLinks();

                    // fire callback functions
                    remoteLinkCallbacks(before);
                    remoteLinkCallbacks(onSuccess);
                    remoteLinkCallbacks(onComplete);
                },
                error: function (data) {
                    // fire callback functions
                    remoteLinkCallbacks(onFailure);
                }
            });
        }
    });
}

function remoteLinkCallbacks(callbackArray) {
    if(callbackArray && callbackArray.length > 0) {
        $.each( callbackArray, function( idx, value ){
            if (value && value.indexOf("(") >= 0) {
                eval(value);
            } else if (value && value.indexOf("(") < 0) {
                eval(value+'()');
            }
        });
    }
}

/* functions for toralarm (goal alert) */
function playGoalSound(soundFile, zweitFile){
    if (soundFile.indexOf('http') !== 0 &&
        soundFile.indexOf('/') !== 0) {		// soundFile does NOT start with 'http' or '/'
        soundFile = _appRootUri+'sounds/'+soundFile;
    }

    if(typeof audioElement === 'undefined') {
        var audioElement = document.createElement('audio');
    }
    audioElement.setAttribute('src', soundFile);

    audioElement.play();
}
var process = process || {env: {NODE_ENV: "development"}};
// instantiate the bloodhound suggestion engine
var searchResults = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: [[
        {
            "id": 177,
            "name": "Admiral Bundesliga",
            "description": "Bundesliga",
            "urlAlias": "bundesliga",
            "class": "Competition",
            "link": "https://ticker.ligaportal.at/spielplan/177/bundesliga"
        },
        {
            "id": 3,
            "name": "Admiral 2. Liga",
            "description": "2. Liga",
            "urlAlias": "2-liga",
            "class": "Competition",
            "link": "https://ticker.ligaportal.at/spielplan/3/2-liga"
        },
        {
            "id": 4,
            "name": "Regionalliga Mitte",
            "description": "Regionalliga Mitte",
            "urlAlias": "regionalliga-mitte",
            "class": "Competition",
            "link": "https://ticker.ligaportal.at/spielplan/4/regionalliga-mitte"
        },
        {
            "id": 125,
            "name": "Regionalliga Ost",
            "description": "Regionalliga Ost",
            "urlAlias": "regionalliga-ost",
            "class": "Competition",
            "link": "https://ticker.ligaportal.at/spielplan/125/regionalliga-ost"
        },
        {
            "id": 126,
            "name": "Regionalliga West",
            "description": "Regionalliga West",
            "urlAlias": "regionalliga-west",
            "class": "Competition",
            "link": "https://ticker.ligaportal.at/spielplan/126/regionalliga-west"
        }
    ]],
    remote: {
        url: _appRootUri + 'search/ajaxSearchReloaded?term=%QUERY',
        wildcard: '%QUERY'
    }
});

$(document).ready(function() {
    $("#searchTerm").typeahead({
        items: 15,
        minLength: 3,
        delay: 1,
        selectOnBlur: false,
        showCategoryHeader: true,
        source: searchResults.ttAdapter(),
        displayText: function(item) {
            return item.description;
        },
        afterSelect: function(item) {
            //alert(item.link);
            document.location = item.link;
        }
    });
});
var process = process || {env: {NODE_ENV: "development"}};
var previousGames = {}
var previousTableRanks = {}

function handleLiveStatisticsResult(json, doGoalAlert) {
	/* -- update games of competition -- */
	
	$.each(json.games, function(index, game) {
		
		var prevGame = previousGames['' + game.id];		

		if (!prevGame 
				|| prevGame.scoreHome != game.scoreHome
				|| prevGame.scoreAway != game.scoreAway
				|| prevGame.scoreHalftimeHome != game.scoreHalftimeHome
				|| prevGame.scoreHalftimeAway != game.scoreHalftimeAway
				|| prevGame.state != game.state
				|| prevGame.isActive != game.isActive) {
			var $gameTr = $('table.gamesOfCompetition tr#' + game.id)
			
			if(prevGame){
				
				if( prevGame.scoreAway != game.scoreAway || prevGame.scoreHome != game.scoreHome){
					
					if(doGoalAlert && typeof playGoalSound == 'function' && game.id != gameId && isPremium){
						sound_file_url = 'https://static.ligaportal.at/sounds/goal/goal.mp3';
						
						if(game.teamHomeGoalSound)
							sound_file_url = game.teamHomeGoalSound;
						 
						if (goalSoundType && goalSoundType == 1) {	// 1 .. Ping -> has higher priority then other goal sound settings 
							sound_file_url = 'https://static.ligaportal.at/sounds/goal/ping.mp3';
						}
					
						if (!mute) {	
							if(game.goalSound)
								playGoalSound(sound_file_url, game.goalSound);
							else
								playGoalSound(sound_file_url, '');
						}

						// original goal alert
                        toastr.info(game.teamHome.nameMiddle + ' - ' + game.teamAway.nameMiddle + ': ' + game.scoreHome + ':' + game.scoreAway + '<br>&raquo; <a href="' + _appRootUri + 'live-ticker/' + game.id + '">zum Live-Ticker</a>', '<i class="fas fa-futbol"></i> TOOOOOOR!!!');

						// version for billa ferdl promo
						/*
						var toastTitle = '<div id="sas_26475"></div><script>var sas = sas || {}; sas.cmd = sas.cmd || []; sas.cmd.push( function () { sas.call( { siteId: 84169, pageId: 602944, formatId: 26475, tagId: "sas_26475" }, { networkId: 1003, domain: "https://styria.smartadserver.com" } ); } ); </script><i class="_fas _fa-futbol"></i> TOOOOOOR!!!';
						var toastrBody = game.teamHome.nameMiddle + ' - ' + game.teamAway.nameMiddle + ': ' + game.scoreHome + ':' + game.scoreAway + '<br>&raquo; <a href="' + _appRootUri + 'live-ticker/' + game.id + '">zum Live-Ticker</a>';
						toastr.info(toastrBody, toastTitle, { timeOut: 20000, extendedTimeOut: 10000 });
						setTimeout(function() {
							$('.toast.toast-info').addClass('toast-alarm');
							$('.toast.toast-alarm').css('opacity',1);
							$('#toast-container').css('z-index',9999999999);
						}, 333);
						*/
						
					}
					
				}				
				
			}

			var result = '<strong>';
			result += game.state == GAME_STATE_NOT_STARTED ? '-:-' : (game.scoreHome + ':' + game.scoreAway);
			result += '</strong>';
			
			if ($('td.score.past', $gameTr).text().indexOf('(') >= 0 ) {		// show halftime result
                result += '<small class="d-block d-sm-inline d-md-inline d-lg-block">';
				result += game.state >= GAME_STATE_HALFTIME ? (' (' + game.scoreHalftimeHome + ':' + game.scoreHalftimeAway + ')') : ' (-:-)';
                result += '</small>';
			}

			$('td.score.past > .btn', $gameTr).html(result);

			var gameStatusClass = 'primary'; //vacant
			var gameStatusText = 'Tickern';
			var gameStatusIcon = 'fa-chevron-right';

			if (game.tickerState > TICKER_RESULT && game.state < GAME_STATE_GAME_STARTED) {
                gameStatusClass = 'warning'; //upcoming
                gameStatusText = 'Zum Ticker';
            } else if (game.isActive) {
                gameStatusClass = 'success'; //live
                gameStatusText = 'Jetzt LIVE';
            } else if (game.state >= GAME_STATE_FINISHED) {
                gameStatusClass = 'danger'; //finished
                gameStatusText = 'Details'
            }
            if (game.jawoiId) {
                gameStatusText = 'Mit Videos';
                gameStatusIcon = 'fa-film';
			} else {
                gameStatusIcon = 'fa-chevron-right';
			}
            if (game.canceled > 0) {
                gameStatusClass = 'danger'; //canceled
                switch(game.canceled) {
                    case 1:
                        gameStatusText = 'Abgesagt';
                        break;
                    case 2:
                        gameStatusText = 'Abgebr.';
                        break;
                    case 3:
                        gameStatusText = 'Nichtantr.';
                        break;
                    default:
                        gameStatusText = 'Abge.';
                        break;
                }
            }

            if(!$('td.gameState > .btn-group > .btn', $gameTr).is('[disabled=disabled]')) {

                $('td.gameState > .btn-group > .btn', $gameTr).removeClass('btn-warning btn-warning-light btn-danger btn-danger-light btn-success btn-success-light btn-primary btn-primary-light');
                $('td.gameState > .btn-group > button.btn', $gameTr).addClass('btn-' + gameStatusClass);
                $('td.gameState > .btn-group > a.btn', $gameTr).addClass('btn-' + gameStatusClass + '-light');
                $('td.gameState > .btn-group > .btn > i', $gameTr).removeClass('fa-film fa-chevron-right');
                $('td.gameState > .btn-group > .btn > i', $gameTr).addClass(gameStatusIcon);
                $('td.gameState > .btn-group > a.btn > span', $gameTr).text(gameStatusText);
            }

			previousGames['' + game.id] = game
		}
	});
	
	/* -- update table -- */
	if(!json.has_playoffs) {
		$.each(json.table, function(index, tableEntry) {
			var $tableTr = $('table.standingsTable tr#' + tableEntry.id)
			$('td.tableRank', $tableTr).html(tableEntry.tableRank);
			$('td.gamesPlayed', $tableTr).html(tableEntry.gamesPlayed);
			//$('td.gamesWon', $tableTr).html(tableEntry.gamesWon);
			//$('td.gamesRemis', $tableTr).html(tableEntry.gamesRemis);
			//$('td.gamesLost', $tableTr).html(tableEntry.gamesLost);
			//$('td.gamesRatio', $tableTr).html(tableEntry.goalsShot + ':' + tableEntry.goalsReceived);
			$('td.gamesDiff', $tableTr).html(tableEntry.goalsShot - tableEntry.goalsReceived);
			$('td.points', $tableTr).html(tableEntry.points);
		});

	} else {
		var tableRankCounter = 0;
        $.each(json.table_one, function(index, tableEntry) {
        	if(tableEntry) {
				var $tableTr = $('table.standingsTable tbody#table_one tr#' + tableEntry.id + '.table_one');
				$('td.tableRank', $tableTr).html(tableEntry.tableRank);
				$('td.gamesPlayed', $tableTr).html(tableEntry.gamesPlayed);
				$('td.gamesDiff', $tableTr).html(tableEntry.goalsShot - tableEntry.goalsReceived);
				$('td.points', $tableTr).html(tableEntry.points);
				tableRankCounter++;
			}
        });

        $.each(json.table_two, function(index, tableEntry) {
        	if(tableEntry) {
				var $tableTr = $('table.standingsTable tbody#table_two tr#' + tableEntry.id + '.table_two');
				$('td.tableRank', $tableTr).html(tableEntry.tableRank - tableRankCounter);
				$('td.gamesPlayed', $tableTr).html(tableEntry.gamesPlayed);
				$('td.gamesDiff', $tableTr).html(tableEntry.goalsShot - tableEntry.goalsReceived);
				$('td.points', $tableTr).html(tableEntry.points);
			}
        });
	}

    $.each($('table.standingsTable tbody'), function(index, table_body) {
        var $table = table_body;
        var $rows = $('tr.tableEntry', $table);
        $rows.sort(function(a, b) {
            var compA = parseInt($('td.tableRank',a).html());
            var compB = parseInt($('td.tableRank',b).html());

            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });

        $.each($rows, function(index, row){
            $table.append(row);
        });
    });

	
	$.each(json.table, function(index, tableEntry) {
		var prevTableRank = previousTableRanks['' + tableEntry.id];
		
		if (prevTableRank && prevTableRank != tableEntry.tableRank) {
			var $tableTr = $('table.standingsTable tr#' + tableEntry.id);
			if (tableEntry.tableRank > prevTableRank) {
				//$('> td', $tableTr).effect("highlight", {color:"#F78181"}, 5000);
			} else {
				//$('> td', $tableTr).effect("highlight", {color:"#BEF781"}, 5000);
			}
		}
		
		previousTableRanks['' + tableEntry.id] = tableEntry.tableRank;
	});
}
var process = process || {env: {NODE_ENV: "development"}};
//= require typeahead/bloodhound.min.js
//= require typeahead/bootstrap3-typeahead.min.js
//= require bootstrap/ligaportal/gamecenter.js
//= require bootstrap/ligaportal/search.js
//= require bootstrap/ligaportal/statisticsBS.js
