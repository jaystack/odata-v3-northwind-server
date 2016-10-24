// JayData 1.5.9 
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define("jaydata/odata3",["jaydata/core"],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.$data = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _oDataConverter = _dereq_('./oDataConverter.js');

var _oDataConverter2 = _interopRequireDefault(_oDataConverter);

var _oDataProvider = _dereq_('./oDataProvider.js');

var _oDataProvider2 = _interopRequireDefault(_oDataProvider);

var _oDataCompiler = _dereq_('./oDataCompiler.js');

var _oDataCompiler2 = _interopRequireDefault(_oDataCompiler);

var _oDataWhereCompiler = _dereq_('./oDataWhereCompiler.js');

var _oDataWhereCompiler2 = _interopRequireDefault(_oDataWhereCompiler);

var _oDataOrderCompiler = _dereq_('./oDataOrderCompiler.js');

var _oDataOrderCompiler2 = _interopRequireDefault(_oDataOrderCompiler);

var _oDataPagingCompiler = _dereq_('./oDataPagingCompiler.js');

var _oDataPagingCompiler2 = _interopRequireDefault(_oDataPagingCompiler);

var _oDataProjectionCompiler = _dereq_('./oDataProjectionCompiler.js');

var _oDataProjectionCompiler2 = _interopRequireDefault(_oDataProjectionCompiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _core2.default;
module.exports = exports['default'];

},{"./oDataCompiler.js":2,"./oDataConverter.js":3,"./oDataOrderCompiler.js":4,"./oDataPagingCompiler.js":5,"./oDataProjectionCompiler.js":6,"./oDataProvider.js":7,"./oDataWhereCompiler.js":8,"jaydata/core":"jaydata/core"}],2:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.storageProviders.oDataV3.oDataCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor() {
        this.context = {};
        this.provider = {};
        //this.logicalType = null;
        this.includes = null;
        this.mainEntitySet = null;
    },
    compile: function compile(query) {

        this.provider = query.context.storageProvider;
        this.context = query.context;

        if (query.defaultType) {
            this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);
        }

        var queryFragments = { urlText: "" };

        this.Visit(query.expression, queryFragments);

        query.modelBinderConfig = {};
        var modelBinder = _core.Container.createModelBinderConfigCompiler(query, this.includes, true);
        modelBinder.Visit(query.expression);

        var queryText = queryFragments.urlText;
        var addAmp = false;
        for (var name in queryFragments) {
            if (name != "urlText" && name != "actionPack" && name != "data" && name != "lambda" && name != "method" && name != "postData" && name != "_isBatchExecuteQuery" && name != "_subQueries" && queryFragments[name] != "") {

                if (addAmp) {
                    queryText += "&";
                } else {
                    queryText += "?";
                }
                addAmp = true;
                if (name != "$urlParams") {
                    queryText += name + '=' + queryFragments[name];
                } else {
                    queryText += queryFragments[name];
                }
            }
        }
        query.queryText = queryText;
        query.postData = queryFragments.postData;
        var result = {
            queryText: queryText,
            withInlineCount: '$inlinecount' in queryFragments || '$count' in queryFragments,
            method: queryFragments.method || 'GET',
            postData: queryFragments.postData,
            isBatchExecuteQuery: queryFragments._isBatchExecuteQuery,
            subQueries: queryFragments._subQueries,
            params: []
        };

        query._getComplitedData = function () {
            return result;
        };

        return result;
    },
    VisitOrderExpression: function VisitOrderExpression(expression, context) {
        this.Visit(expression.source, context);

        var orderCompiler = _core.Container.createoDataOrderCompiler(this.provider);
        orderCompiler.compile(expression, context);
    },
    VisitPagingExpression: function VisitPagingExpression(expression, context) {
        this.Visit(expression.source, context);

        var pagingCompiler = _core.Container.createoDataPagingCompiler(this.provider);
        pagingCompiler.compile(expression, context);
    },
    VisitIncludeExpression: function VisitIncludeExpression(expression, context) {
        this.Visit(expression.source, context);
        if (!context['$select']) {
            if (context['$expand']) {
                context['$expand'] += ',';
            } else {
                context['$expand'] = '';
            }
            context['$expand'] += expression.selector.value.replace(/\./g, '/');

            this.includes = this.includes || [];
            var includeFragment = expression.selector.value.split('.');
            var tempData = null;
            var storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(this.mainEntitySet.createNew);
            for (var i = 0; i < includeFragment.length; i++) {
                if (tempData) {
                    tempData += '.' + includeFragment[i];
                } else {
                    tempData = includeFragment[i];
                }
                var association = storageModel.Associations[includeFragment[i]];
                if (association) {
                    if (!this.includes.some(function (include) {
                        return include.name == tempData;
                    }, this)) {
                        this.includes.push({ name: tempData, type: association.ToType });
                    }
                } else {
                    _core.Guard.raise(new _core.Exception("The given include path is invalid: " + expression.selector.value + ", invalid point: " + tempData));
                }
                storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
            }
        }
    },
    VisitFindExpression: function VisitFindExpression(expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '(';
        if (expression.params.length === 1) {
            var param = expression.params[0];
            var typeName = _core.Container.resolveName(param.type);

            var converter = this.provider.fieldConverter.toDb[typeName];
            var value = converter ? converter(param.value) : param.value;

            converter = this.provider.fieldConverter.escape[typeName];
            value = converter ? converter(param.value) : param.value;
            context.urlText += value;
        } else {
            for (var i = 0; i < expression.params.length; i++) {
                var param = expression.params[i];
                var typeName = _core.Container.resolveName(param.type);

                var converter = this.provider.fieldConverter.toDb[typeName];
                var value = converter ? converter(param.value) : param.value;

                converter = this.provider.fieldConverter.escape[typeName];
                value = converter ? converter(param.value) : param.value;

                if (i > 0) context.urlText += ',';
                context.urlText += param.name + '=' + value;
            }
        }
        context.urlText += ')';
    },
    VisitProjectionExpression: function VisitProjectionExpression(expression, context) {
        this.Visit(expression.source, context);

        var projectionCompiler = _core.Container.createoDataProjectionCompiler(this.context);
        projectionCompiler.compile(expression, context);
    },
    VisitFilterExpression: function VisitFilterExpression(expression, context) {
        ///<param name="expression" type="$data.Expressions.FilterExpression" />

        this.Visit(expression.source, context);

        var filterCompiler = _core.Container.createoDataWhereCompiler(this.provider);
        context.data = "";
        filterCompiler.compile(expression.selector, context);
        context["$filter"] = context.data;
        context.data = "";
    },
    VisitInlineCountExpression: function VisitInlineCountExpression(expression, context) {
        this.Visit(expression.source, context);
        if (this.provider.providerConfiguration.maxDataServiceVersion === "4.0") {
            context["$count"] = expression.selector.value === 'allpages';
        } else {
            context["$inlinecount"] = expression.selector.value;
        }
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, context) {
        context.urlText += "/" + expression.instance.tableName;
        //this.logicalType = expression.instance.elementType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitServiceOperationExpression: function VisitServiceOperationExpression(expression, context) {
        if (expression.boundItem) {
            context.urlText += "/" + expression.boundItem.entitySet.tableName;
            if (expression.boundItem.data instanceof _core2.default.Entity) {
                context.urlText += '(' + this.provider.getEntityKeysValue(expression.boundItem) + ')';
            }
        }
        context.urlText += "/" + expression.cfg.serviceName;
        context.method = context.method || expression.cfg.method;

        //this.logicalType = expression.returnType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitBatchDeleteExpression: function VisitBatchDeleteExpression(expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '/$batchDelete';
        context.method = 'DELETE';
    },

    VisitConstantExpression: function VisitConstantExpression(expression, context) {
        var typeName = _core.Container.resolveName(expression.type);
        if (expression.value instanceof _core2.default.Entity) typeName = _core2.default.Entity.fullName;

        var converter = this.provider.fieldConverter.toDb[typeName];
        var value = converter ? converter(expression.value) : expression.value;

        if (context.method === 'GET' || !context.method) {
            converter = this.provider.fieldConverter.escape[typeName];
            value = converter ? converter(value) : value;

            if (value !== undefined) {
                if (context['$urlParams']) {
                    context['$urlParams'] += '&';
                } else {
                    context['$urlParams'] = '';
                }
                context['$urlParams'] += expression.name + '=' + value;
            }
        } else {
            context.postData = context.postData || {};
            context.postData[expression.name] = value;
        }
    },
    //    VisitConstantExpression: function (expression, context) {
    //        if (context['$urlParams']) { context['$urlParams'] += '&'; } else { context['$urlParams'] = ''; }
    //
    //
    //        var valueType = Container.getTypeName(expression.value);
    //
    //
    //
    //        context['$urlParams'] += expression.name + '=' + this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](expression.value);
    //    },

    VisitCountExpression: function VisitCountExpression(expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '/$count';
    },

    VisitBatchExecuteQueryExpression: function VisitBatchExecuteQueryExpression(expression, context) {
        context.urlText += '/$batch';
        context.method = 'POST';
        context.postData = { __batchRequests: [] };
        context._isBatchExecuteQuery = true;
        context._subQueries = expression.members;

        for (var i = 0; i < expression.members.length; i++) {
            var queryable = expression.members[i];
            var compiler = new _core2.default.storageProviders.oDataV3.oDataCompiler();
            var compiled = compiler.compile(queryable);
            context.postData.__batchRequests.push({
                requestUri: compiled.queryText,
                method: compiled.method,
                data: compiled.data,
                headers: compiled.headers
            });
        }
    }
}, {});

},{"jaydata/core":"jaydata/core"}],3:[function(_dereq_,module,exports){
'use strict';

var _xmlEscape;

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_core2.default.oDataConverterV3 = {
    fromDb: {
        '$data.Byte': _core2.default.Container.proxyConverter,
        '$data.SByte': _core2.default.Container.proxyConverter,
        '$data.Decimal': _core2.default.Container.proxyConverter,
        '$data.Float': _core2.default.Container.proxyConverter,
        '$data.Int16': _core2.default.Container.proxyConverter,
        '$data.Int64': _core2.default.Container.proxyConverter,
        '$data.ObjectID': _core2.default.Container.proxyConverter,
        '$data.Integer': _core2.default.Container.proxyConverter, //function (number) { return (typeof number === 'string' && /^\d+$/.test(number)) ? parseInt(number) : number; },
        '$data.Int32': _core2.default.Container.proxyConverter,
        '$data.Number': _core2.default.Container.proxyConverter,
        '$data.Date': function $dataDate(dbData) {
            if (dbData) {
                if (dbData instanceof Date) {
                    return dbData;
                } else if (dbData.substring(0, 6) === '/Date(') {
                    return new Date(parseInt(dbData.substr(6)));
                } else {
                    //ISODate without Z? Safari compatible with Z
                    if (dbData.indexOf('Z') === -1 && !dbData.match('T.*[+-]')) dbData += 'Z';
                    return new Date(dbData);
                }
            } else {
                return dbData;
            }
        },
        '$data.DateTimeOffset': function $dataDateTimeOffset(dbData) {
            if (dbData) {
                if (dbData instanceof Date) {
                    return dbData;
                } else if (dbData.substring(0, 6) === '/Date(') {
                    return new Date(parseInt(dbData.substr(6)));
                } else {
                    //ISODate without Z? Safari compatible with Z
                    if (dbData.indexOf('Z') === -1 && !dbData.match('T.*[+-]')) dbData += 'Z';
                    return new Date(dbData);
                }
            } else {
                return dbData;
            }
        },
        '$data.Time': _core2.default.Container.proxyConverter,
        '$data.String': _core2.default.Container.proxyConverter,
        '$data.Boolean': _core2.default.Container.proxyConverter,
        '$data.Blob': function $dataBlob(v) {
            if (typeof v == 'string') {
                try {
                    return _core2.default.Container.convertTo(atob(v), '$data.Blob');
                } catch (e) {
                    return v;
                }
            } else return v;
        },
        '$data.Object': function $dataObject(o) {
            if (o === undefined) {
                return new _core2.default.Object();
            } else if (typeof o === 'string') {
                return JSON.parse(o);
            }return o;
        },
        '$data.Array': function $dataArray(o) {
            if (o === undefined) {
                return new _core2.default.Array();
            } else if (o instanceof _core2.default.Array) {
                return o;
            }return JSON.parse(o);
        },
        '$data.GeographyPoint': function $dataGeographyPoint(g) {
            if (g) {
                return new _core2.default.GeographyPoint(g);
            }return g;
        },
        '$data.GeographyLineString': function $dataGeographyLineString(g) {
            if (g) {
                return new _core2.default.GeographyLineString(g);
            }return g;
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(g) {
            if (g) {
                return new _core2.default.GeographyPolygon(g);
            }return g;
        },
        '$data.GeographyMultiPoint': function $dataGeographyMultiPoint(g) {
            if (g) {
                return new _core2.default.GeographyMultiPoint(g);
            }return g;
        },
        '$data.GeographyMultiLineString': function $dataGeographyMultiLineString(g) {
            if (g) {
                return new _core2.default.GeographyMultiLineString(g);
            }return g;
        },
        '$data.GeographyMultiPolygon': function $dataGeographyMultiPolygon(g) {
            if (g) {
                return new _core2.default.GeographyMultiPolygon(g);
            }return g;
        },
        '$data.GeographyCollection': function $dataGeographyCollection(g) {
            if (g) {
                return new _core2.default.GeographyCollection(g);
            }return g;
        },
        '$data.GeometryPoint': function $dataGeometryPoint(g) {
            if (g) {
                return new _core2.default.GeometryPoint(g);
            }return g;
        },
        '$data.GeometryLineString': function $dataGeometryLineString(g) {
            if (g) {
                return new _core2.default.GeometryLineString(g);
            }return g;
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(g) {
            if (g) {
                return new _core2.default.GeometryPolygon(g);
            }return g;
        },
        '$data.GeometryMultiPoint': function $dataGeometryMultiPoint(g) {
            if (g) {
                return new _core2.default.GeometryMultiPoint(g);
            }return g;
        },
        '$data.GeometryMultiLineString': function $dataGeometryMultiLineString(g) {
            if (g) {
                return new _core2.default.GeometryMultiLineString(g);
            }return g;
        },
        '$data.GeometryMultiPolygon': function $dataGeometryMultiPolygon(g) {
            if (g) {
                return new _core2.default.GeometryMultiPolygon(g);
            }return g;
        },
        '$data.GeometryCollection': function $dataGeometryCollection(g) {
            if (g) {
                return new _core2.default.GeometryCollection(g);
            }return g;
        },
        '$data.Guid': function $dataGuid(guid) {
            return guid ? guid.toString() : guid;
        }
    },
    toDb: {
        '$data.Entity': _core2.default.Container.proxyConverter,
        '$data.Byte': _core2.default.Container.proxyConverter,
        '$data.SByte': _core2.default.Container.proxyConverter,
        '$data.Decimal': _core2.default.Container.proxyConverter,
        '$data.Float': _core2.default.Container.proxyConverter,
        '$data.Int16': _core2.default.Container.proxyConverter,
        '$data.Int64': _core2.default.Container.proxyConverter,
        '$data.ObjectID': _core2.default.Container.proxyConverter,
        '$data.Integer': _core2.default.Container.proxyConverter,
        '$data.Int32': _core2.default.Container.proxyConverter,
        '$data.Number': _core2.default.Container.proxyConverter,
        '$data.Date': function $dataDate(e) {
            return e ? e.toISOString().replace('Z', '') : e;
        },
        '$data.Time': _core2.default.Container.proxyConverter,
        '$data.DateTimeOffset': function $dataDateTimeOffset(v) {
            return v ? v.toISOString() : v;
        },
        '$data.String': _core2.default.Container.proxyConverter,
        '$data.Boolean': _core2.default.Container.proxyConverter,
        '$data.Blob': function $dataBlob(v) {
            return v ? _core2.default.Blob.toBase64(v) : v;
        },
        '$data.Object': _core2.default.Container.proxyConverter,
        '$data.Array': _core2.default.Container.proxyConverter,
        '$data.GeographyPoint': _core2.default.Container.proxyConverter,
        '$data.GeographyLineString': _core2.default.Container.proxyConverter,
        '$data.GeographyPolygon': _core2.default.Container.proxyConverter,
        '$data.GeographyMultiPoint': _core2.default.Container.proxyConverter,
        '$data.GeographyMultiLineString': _core2.default.Container.proxyConverter,
        '$data.GeographyMultiPolygon': _core2.default.Container.proxyConverter,
        '$data.GeographyCollection': _core2.default.Container.proxyConverter,
        '$data.GeometryPoint': _core2.default.Container.proxyConverter,
        '$data.GeometryLineString': _core2.default.Container.proxyConverter,
        '$data.GeometryPolygon': _core2.default.Container.proxyConverter,
        '$data.GeometryMultiPoint': _core2.default.Container.proxyConverter,
        '$data.GeometryMultiLineString': _core2.default.Container.proxyConverter,
        '$data.GeometryMultiPolygon': _core2.default.Container.proxyConverter,
        '$data.GeometryCollection': _core2.default.Container.proxyConverter,
        '$data.Guid': _core2.default.Container.proxyConverter
    },
    escape: {
        '$data.Entity': function $dataEntity(e) {
            return JSON.stringify(e);
        },
        '$data.Integer': _core2.default.Container.proxyConverter,
        '$data.Int32': _core2.default.Container.proxyConverter,
        '$data.Number': _core2.default.Container.proxyConverter, // double: 13.5D
        '$data.Int16': _core2.default.Container.proxyConverter,
        '$data.Byte': _core2.default.Container.proxyConverter,
        '$data.SByte': _core2.default.Container.proxyConverter,
        '$data.Decimal': function $dataDecimal(v) {
            return v ? v + 'm' : v;
        },
        '$data.Float': function $dataFloat(v) {
            return v ? v + 'f' : v;
        },
        '$data.Int64': function $dataInt64(v) {
            return v ? v + 'L' : v;
        },
        '$data.Time': function $dataTime(v) {
            return v ? "time'" + v + "'" : v;
        },
        '$data.DateTimeOffset': function $dataDateTimeOffset(date) {
            return date ? "datetimeoffset'" + date + "'" : date;
        },
        '$data.Date': function $dataDate(date) {
            return date ? "datetime'" + date + "'" : date;
        },
        '$data.String': function $dataString(text) {
            return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text;
        },
        '$data.ObjectID': function $dataObjectID(text) {
            return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text;
        },
        '$data.Boolean': function $dataBoolean(bool) {
            return typeof bool === 'boolean' ? bool.toString() : bool;
        },
        '$data.Blob': function $dataBlob(b) {
            return b ? "X'" + _core2.default.Blob.toHexString(_core2.default.Container.convertTo(atob(b), _core2.default.Blob)) + "'" : b;
        },
        '$data.Object': function $dataObject(o) {
            return JSON.stringify(o);
        },
        '$data.Array': function $dataArray(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyPoint': function $dataGeographyPoint(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyLineString': function $dataGeographyLineString(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyMultiPoint': function $dataGeographyMultiPoint(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyMultiLineString': function $dataGeographyMultiLineString(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyMultiPolygon': function $dataGeographyMultiPolygon(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeographyCollection': function $dataGeographyCollection(g) {
            if (g) {
                return _core2.default.GeographyBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryPoint': function $dataGeometryPoint(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryLineString': function $dataGeometryLineString(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryMultiPoint': function $dataGeometryMultiPoint(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryMultiLineString': function $dataGeometryMultiLineString(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryMultiPolygon': function $dataGeometryMultiPolygon(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.GeometryCollection': function $dataGeometryCollection(g) {
            if (g) {
                return _core2.default.GeometryBase.stringifyToUrl(g);
            }return g;
        },
        '$data.Guid': function $dataGuid(guid) {
            return guid ? "guid'" + guid.toString() + "'" : guid;
        }
    },
    unescape: {
        '$data.Entity': function $dataEntity(v, c) {
            var config = c || {};
            var value = JSON.parse(v);
            if (value && config.type) {
                var type = _core.Container.resolveType(config.type);
                /*Todo converter*/
                return new type(value, { converters: undefined });
            }
            return value;
        },
        '$data.Number': function $dataNumber(v) {
            return JSON.parse(v);
        },
        '$data.Integer': function $dataInteger(v) {
            return JSON.parse(v);
        },
        '$data.Int32': function $dataInt32(v) {
            return JSON.parse(v);
        },
        '$data.Byte': function $dataByte(v) {
            return JSON.parse(v);
        },
        '$data.SByte': function $dataSByte(v) {
            return JSON.parse(v);
        },
        '$data.Decimal': function $dataDecimal(v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('m') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Float': function $dataFloat(v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('f') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Int16': function $dataInt16(v) {
            return JSON.parse(v);
        },
        '$data.Int64': function $dataInt64(v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('l') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Boolean': function $dataBoolean(v) {
            return JSON.parse(v);
        },
        '$data.Date': function $dataDate(v) {
            if (typeof v === 'string' && /^datetime'/.test(v)) {
                return v.slice(9, v.length - 1);
            }
            return v;
        },
        '$data.String': function $dataString(v) {
            if (typeof v === 'string' && v.indexOf("'") === 0 && v.lastIndexOf("'") === v.length - 1) {
                return v.slice(1, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.ObjectID': function $dataObjectID(v) {
            if (typeof v === 'string' && v.indexOf("'") === 0 && v.lastIndexOf("'") === v.length - 1) {
                return v.slice(1, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Guid': function $dataGuid(v) {
            if (/^guid'\w{8}-\w{4}-\w{4}-\w{4}-\w{12}'$/.test(v)) {
                var data = v.slice(5, v.length - 1);
                return _core2.default.parseGuid(data).toString();
            }
            return v;
        },
        '$data.Array': function $dataArray(v, c) {
            var config = c || {};

            var value = JSON.parse(v) || [];
            if (value && config.elementType) {
                var type = _core.Container.resolveType(config.elementType);
                var typeName = _core.Container.resolveName(type);
                if (type && type.isAssignableTo && type.isAssignableTo(_core2.default.Entity)) {
                    typeName = _core2.default.Entity.fullName;
                }

                if (Array.isArray(value)) {
                    var converter = _core2.default.oDataConverter.unescape[typeName];
                    for (var i = 0; i < value.length; i++) {
                        value[i] = converter ? converter(value[i]) : value[i];
                    }
                }
                return value;
            }
            return value;
        },
        '$data.DateTimeOffset': function $dataDateTimeOffset(v) {
            if (typeof v === 'string' && /^datetimeoffset'/.test(v)) {
                return _core2.default.Container.convertTo(v.slice(15, v.length - 1), _core2.default.DateTimeOffset);
            }
            return v;
        },
        '$data.Time': function $dataTime(v) {
            if (typeof v === 'string' && /^time'/.test(v)) {
                return _core2.default.Container.convertTo(v.slice(5, v.length - 1), _core2.default.Time);
            }
            return v;
        },
        '$data.Blob': function $dataBlob(v) {
            if (typeof v === 'string') {
                if (/^X'/.test(v)) {
                    return _core2.default.Blob.createFromHexString(v.slice(2, v.length - 1));
                } else if (/^binary'/.test(v)) {
                    return _core2.default.Blob.createFromHexString(v.slice(7, v.length - 1));
                }
            }
            return v;
        },
        '$data.Object': function $dataObject(v) {
            return JSON.parse(v);
        },
        '$data.GeographyPoint': function $dataGeographyPoint(v) {
            if (/^geography'POINT\(/i.test(v)) {
                var data = v.slice(10, v.length - 1);
                return _core2.default.GeographyBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(v) {
            if (/^geography'POLYGON\(/i.test(v)) {
                var data = v.slice(10, v.length - 1);
                return _core2.default.GeographyBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeometryPoint': function $dataGeometryPoint(v) {
            if (/^geometry'POINT\(/i.test(v)) {
                var data = v.slice(9, v.length - 1);
                return _core2.default.GeometryBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(v) {
            if (/^geometry'POLYGON\(/i.test(v)) {
                var data = v.slice(9, v.length - 1);
                return _core2.default.GeometryBase.parseFromString(data);
            }
            return v;
        }
    },
    xmlEscape: (_xmlEscape = {
        '$data.Byte': function $dataByte(v) {
            return v.toString();
        },
        '$data.SByte': function $dataSByte(v) {
            return v.toString();
        },
        '$data.Decimal': function $dataDecimal(v) {
            return v.toString();
        },
        '$data.Float': function $dataFloat(v) {
            return v.toString();
        },
        '$data.Int16': function $dataInt16(v) {
            return v.toString();
        },
        '$data.Int64': function $dataInt64(v) {
            return v.toString();
        },
        '$data.Integer': function $dataInteger(v) {
            return v.toString();
        },
        '$data.Int32': function $dataInt32(v) {
            return v.toString();
        },
        '$data.Boolean': function $dataBoolean(v) {
            return v.toString();
        },
        '$data.Blob': function $dataBlob(v) {
            return _core2.default.Blob.toBase64(v);
        },
        '$data.Date': function $dataDate(v) {
            return v.toISOString().replace('Z', '');
        },
        '$data.DateTimeOffset': function $dataDateTimeOffset(v) {
            return v.toISOString();
        },
        '$data.Time': function $dataTime(v) {
            return v.toString();
        },
        '$data.Number': function $dataNumber(v) {
            return v.toString();
        }
    }, _defineProperty(_xmlEscape, '$data.Integer', function $dataInteger(v) {
        return v.toString();
    }), _defineProperty(_xmlEscape, '$data.Int32', function $dataInt32(v) {
        return v.toString();
    }), _defineProperty(_xmlEscape, '$data.String', function $dataString(v) {
        return v.toString();
    }), _defineProperty(_xmlEscape, '$data.ObjectID', function $dataObjectID(v) {
        return v.toString();
    }), _defineProperty(_xmlEscape, '$data.Object', function $dataObject(v) {
        return JSON.stringify(v);
    }), _defineProperty(_xmlEscape, '$data.Guid', function $dataGuid(v) {
        return v.toString();
    }), _xmlEscape),
    /*,
    '$data.GeographyPoint': function (v) { return this._buildSpatialPoint(v, 'http://www.opengis.net/def/crs/EPSG/0/4326'); },
    '$data.GeometryPoint': function (v) { return this._buildSpatialPoint(v, 'http://www.opengis.net/def/crs/EPSG/0/0'); },
    '$data.GeographyLineString': function (v) { return this._buildSpatialLineString(v, 'http://www.opengis.net/def/crs/EPSG/0/4326'); },
    '$data.GeometryLineString': function (v) { return this._buildSpatialLineString(v, 'http://www.opengis.net/def/crs/EPSG/0/0'); }*/
    simple: { //$value, $count
        '$data.Byte': function $dataByte(v) {
            return v.toString();
        },
        '$data.SByte': function $dataSByte(v) {
            return v.toString();
        },
        '$data.Decimal': function $dataDecimal(v) {
            return v.toString();
        },
        '$data.Float': function $dataFloat(v) {
            return v.toString();
        },
        '$data.Int16': function $dataInt16(v) {
            return v.toString();
        },
        '$data.Int64': function $dataInt64(v) {
            return v.toString();
        },
        '$data.ObjectID': function $dataObjectID(o) {
            return o.toString();
        },
        '$data.Integer': function $dataInteger(o) {
            return o.toString();
        },
        '$data.Int32': function $dataInt32(o) {
            return o.toString();
        },
        '$data.Number': function $dataNumber(o) {
            return o.toString();
        },
        '$data.Date': function $dataDate(o) {
            return o instanceof _core2.default.Date ? o.toISOString().replace('Z', '') : o.toString();
        },
        '$data.DateTimeOffset': function $dataDateTimeOffset(v) {
            return v ? v.toISOString() : v;
        },
        '$data.Time': function $dataTime(o) {
            return o.toString();
        },
        '$data.String': function $dataString(o) {
            return o.toString();
        },
        '$data.Boolean': function $dataBoolean(o) {
            return o.toString();
        },
        '$data.Blob': function $dataBlob(o) {
            return o;
        },
        '$data.Object': function $dataObject(o) {
            return JSON.stringify(o);
        },
        '$data.Array': function $dataArray(o) {
            return JSON.stringify(o);
        },
        '$data.Guid': function $dataGuid(o) {
            return o.toString();
        },
        '$data.GeographyPoint': function $dataGeographyPoint(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryPoint': function $dataGeometryPoint(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyLineString': function $dataGeographyLineString(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyMultiPoint': function $dataGeographyMultiPoint(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyMultiLineString': function $dataGeographyMultiLineString(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyMultiPolygon': function $dataGeographyMultiPolygon(o) {
            return JSON.stringify(o);
        },
        '$data.GeographyCollection': function $dataGeographyCollection(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryLineString': function $dataGeometryLineString(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryMultiPoint': function $dataGeometryMultiPoint(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryMultiLineString': function $dataGeometryMultiLineString(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryMultiPolygon': function $dataGeometryMultiPolygon(o) {
            return JSON.stringify(o);
        },
        '$data.GeometryCollection': function $dataGeometryCollection(o) {
            return JSON.stringify(o);
        }
    }
};

},{"jaydata/core":"jaydata/core"}],4:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.storageProviders.oDataV3.oDataOrderCompiler', _core2.default.storageProviders.oDataV3.oDataWhereCompiler, null, {
    constructor: function constructor(provider) {
        this.provider = provider;
    },

    compile: function compile(expression, context) {
        this.Visit(expression, context);
    },
    VisitOrderExpression: function VisitOrderExpression(expression, context) {
        var orderContext = { data: "" };
        this.Visit(expression.selector, orderContext);
        if (context['$orderby']) {
            context['$orderby'] += ',';
        } else {
            context['$orderby'] = '';
        }
        context['$orderby'] += orderContext.data + (expression.nodeType == _core2.default.Expressions.ExpressionType.OrderByDescending ? " desc" : "");
    },
    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, context) {
        this.Visit(expression.expression, context);
    },
    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.data += "/";
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, context) {
        if (expression.selector instanceof _core2.default.Expressions.AssociationInfoExpression) {
            this.Visit(expression.source, context);
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function VisitAssociationInfoExpression(expression, context) {
        context.data += expression.associationInfo.FromPropertyName + '/';
    },
    VisitEntityExpression: function VisitEntityExpression(expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, context) {
        context.data += expression.memberName;
    },
    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, context) {
        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++];
            };
        });

        args.forEach(function (arg, index) {
            if (index > 0) {
                context.data += ",";
            };
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },
    VisitEntityFunctionOperationExpression: function VisitEntityFunctionOperationExpression(expression, context) {
        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);
        this.Visit(expression.source, context);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.method.params || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++];
            };
        });

        var i = 0;
        args.forEach(function (arg, index) {
            if (arg === undefined || arg instanceof _core2.default.Expressions.ConstantExpression && typeof arg.value === 'undefined') return;

            if (i > 0) {
                context.data += ",";
            };
            i++;
            context.data += params[index].name + '=';
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },
    VisitContextFunctionOperationExpression: function VisitContextFunctionOperationExpression(expression, context) {
        return this.VisitEntityFunctionOperationExpression(expression, context);
    }
});

},{"jaydata/core":"jaydata/core"}],5:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.storageProviders.oDataV3.oDataPagingCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(provider) {
        this.provider = provider;
    },

    compile: function compile(expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function VisitPagingExpression(expression, context) {
        var pagingContext = { data: "" };
        this.Visit(expression.amount, pagingContext);
        switch (expression.nodeType) {
            case _core2.default.Expressions.ExpressionType.Skip:
                context['$skip'] = pagingContext.data;break;
            case _core2.default.Expressions.ExpressionType.Take:
                context['$top'] = pagingContext.data;break;
            default:
                _core.Guard.raise("Not supported nodeType");break;
        }
    },
    VisitConstantExpression: function VisitConstantExpression(expression, context) {
        var typeName = _core.Container.resolveName(expression.type);
        var converter = this.provider.fieldConverter.escape[typeName];
        context.data += converter ? converter(expression.value) : expression.value;
    }
});

},{"jaydata/core":"jaydata/core"}],6:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.storageProviders.oDataV3.oDataProjectionCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(entityContext) {
        this.entityContext = entityContext;
        this.hasObjectLiteral = false;
        this.ObjectLiteralPath = "";
        this.modelBinderMapping = [];
    },

    compile: function compile(expression, context) {
        this.Visit(expression, context);
    },
    VisitProjectionExpression: function VisitProjectionExpression(expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ProjectionExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        context.data = "";
        this.mapping = "";

        this.Visit(expression.selector, context);
        if (context['$select']) {
            context['$select'] += ',';
        } else {
            context['$select'] = '';
        }
        context["$select"] += context.data;
        context.data = "";
    },
    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression instanceof _core2.default.Expressions.EntityExpression || expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
            if (context['$expand']) {
                context['$expand'] += ',';
            } else {
                context['$expand'] = '';
            }
            context['$expand'] += this.mapping.replace(/\./g, '/');
        }if (expression.expression instanceof _core2.default.Expressions.ComplexTypeExpression) {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) {
                    context['$expand'] += ',';
                } else {
                    context['$expand'] = '';
                }
                context['$expand'] += m.join('/');
            }
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) {
                    context['$expand'] += ',';
                } else {
                    context['$expand'] = '';
                }
                context['$expand'] += m.join('/');
            }
        }
    },
    VisitObjectLiteralExpression: function VisitObjectLiteralExpression(expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ObjectLiteralExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        var tempObjectLiteralPath = this.ObjectLiteralPath;
        this.hasObjectLiteral = true;
        expression.members.forEach(function (member, index) {
            this.Visit(member, context);
            if (index < expression.members.length - 1) {
                context.data += ',';
            }
            this.mapping = '';
        }, this);
        this.ObjectLiteralPath = tempObjectLiteralPath;
    },
    VisitObjectFieldExpression: function VisitObjectFieldExpression(expression, context) {

        if (this.ObjectLiteralPath) {
            this.ObjectLiteralPath += '.' + expression.fieldName;
        } else {
            this.ObjectLiteralPath = expression.fieldName;
        }
        this.Visit(expression.expression, context);

        if (expression.expression instanceof _core2.default.Expressions.EntityExpression || expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
            if (context['$expand']) {
                context['$expand'] += ',';
            } else {
                context['$expand'] = '';
            }
            context['$expand'] += this.mapping.replace(/\./g, '/');
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) {
                    context['$expand'] += ',';
                } else {
                    context['$expand'] = '';
                }
                context['$expand'] += m.join('/');
            }
        }
    },

    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },

    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitEntityExpression: function VisitEntityExpression(expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntityExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntitySetExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        if (expression.source instanceof _core2.default.Expressions.EntityExpression) {
            this.Visit(expression.source, context);
        }
        if (expression.selector instanceof _core2.default.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function VisitAssociationInfoExpression(expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') {
            context.data += '/';
        }
        context.data += expression.associationInfo.FromPropertyName;
        if (this.mapping && this.mapping.length > 0) {
            this.mapping += '.';
        }
        this.mapping += expression.associationInfo.FromPropertyName;
    },
    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') {
            context.data += '/';
        }
        context.data += expression.memberName;
        if (this.mapping && this.mapping.length > 0) {
            this.mapping += '.';
        }
        this.mapping += expression.memberName;
    },
    VisitConstantExpression: function VisitConstantExpression(expression, context) {
        //Guard.raise(new Exception('Constant value is not supported in Projection.', 'Not supported!'));
        //context.data += expression.value;
        context.data = context.data.slice(0, context.data.length - 1);
    }
});

},{"jaydata/core":"jaydata/core"}],7:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _datajsPatch;
_datajsPatch = function datajsPatch(OData) {
    // just datajs-1.1.0
    if (OData && OData.jsonHandler && 'useJsonLight' in OData.jsonHandler && (typeof datajs === 'undefined' ? 'undefined' : _typeof(datajs)) === 'object' && !datajs.version) {
        _core2.default.Trace.log('!!!!!!! - patch datajs 1.1.0');
        var oldread = OData.defaultHandler.read;
        OData.defaultHandler.read = function (p, context) {
            delete context.contentType;
            delete context.dataServiceVersion;

            oldread.apply(this, arguments);
        };
        var oldwrite = OData.defaultHandler.write;
        OData.defaultHandler.write = function (p, context) {
            delete context.contentType;
            delete context.dataServiceVersion;

            oldwrite.apply(this, arguments);
        };
    }
    _datajsPatch = function datajsPatch() {};
};

(0, _core.$C)('$data.storageProviders.oDataV3.oDataProvider', _core2.default.StorageProviderBase, null, {
    constructor: function constructor(cfg, ctx) {
        this.SqlCommands = [];
        this.context = ctx;
        this.providerConfiguration = _core2.default.typeSystem.extend({
            dbCreation: _core2.default.storageProviders.DbCreationType.DropTableIfChanged,
            oDataServiceHost: "/odata.svc",
            serviceUrl: "",
            maxDataServiceVersion: '2.0',
            dataServiceVersion: undefined,
            setDataServiceVersionToMax: true,
            user: null,
            password: null,
            withCredentials: false,
            //enableJSONP: undefined,
            //useJsonLight: undefined
            //disableBatch: undefined
            UpdateMethod: 'PATCH'
        }, cfg);

        if (this.providerConfiguration.maxDataServiceVersion === "4.0") {
            if (typeof odatajs === 'undefined' || typeof odatajs.oData === 'undefined') {
                _core.Guard.raise(new _core.Exception('odatajs is required', 'Not Found!'));
            } else {
                this.oData = odatajs.oData;
            }
        } else {
            if (typeof OData === 'undefined') {
                _core.Guard.raise(new _core.Exception('datajs is required', 'Not Found!'));
            } else {
                this.oData = OData;
                _datajsPatch(this.oData);
            }
        }

        this.fixkDataServiceVersions(cfg);

        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    fixkDataServiceVersions: function fixkDataServiceVersions(cfg) {
        if (this.providerConfiguration.dataServiceVersion > this.providerConfiguration.maxDataServiceVersion) {
            this.providerConfiguration.dataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }

        if (this.providerConfiguration.setDataServiceVersionToMax === true) {
            this.providerConfiguration.dataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }

        if (cfg && !cfg.UpdateMethod && this.providerConfiguration.dataServiceVersion < '3.0' || !this.providerConfiguration.dataServiceVersion) {
            this.providerConfiguration.UpdateMethod = 'MERGE';
        }
    },
    initializeStore: function initializeStore(callBack) {
        callBack = _core2.default.typeSystem.createCallbackSetting(callBack);
        switch (this.providerConfiguration.dbCreation) {
            case _core2.default.storageProviders.DbCreationType.DropAllExistingTables:
                var that = this;
                if (this.providerConfiguration.serviceUrl) {

                    var requestData = [{
                        requestUri: that.providerConfiguration.serviceUrl + "/Delete",
                        method: 'POST'
                    }, function (d) {
                        //console.log("RESET oData database");
                        callBack.success(that.context);
                    }, function (error) {
                        callBack.success(that.context);
                    }];

                    this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
                    //if (this.providerConfiguration.user) {
                    //    requestData[0].user = this.providerConfiguration.user;
                    //    requestData[0].password = this.providerConfiguration.password || "";
                    //}

                    this.context.prepareRequest.call(this, requestData);
                    this.oData.request.apply(this, requestData);
                } else {
                    callBack.success(that.context);
                }
                break;
            default:
                callBack.success(this.context);
                break;
        }
    },
    buildDbType_generateConvertToFunction: function buildDbType_generateConvertToFunction(storageModel, context) {
        return function (logicalEntity, convertedItems) {
            var dbInstance = new storageModel.PhysicalType();
            dbInstance.entityState = logicalEntity.entityState;

            storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (property) {
                dbInstance.initData[property.name] = logicalEntity[property.name];
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if (association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1" || association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1" || association.FromMultiplicity == '$$unbound') {
                        var refValue = logicalEntity[association.FromPropertyName];
                        if ( /*refValue !== null &&*/refValue !== undefined) {
                            if (refValue instanceof _core2.default.Array) {
                                dbInstance.initData[association.FromPropertyName] = dbInstance[association.FromPropertyName] || [];
                                refValue.forEach(function (rv) {
                                    if (rv.entityState == _core2.default.EntityState.Modified || convertedItems.indexOf(rv) < 0) {
                                        var sMod = context._storageModel.getStorageModel(rv.getType());
                                        var tblName = sMod.TableName;
                                        var pk = '(' + context.storageProvider.getEntityKeysValue({ data: rv, entitySet: context.getEntitySetFromElementType(rv.getType()) }) + ')';
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: tblName + pk } });
                                    } else {
                                        var contentId = convertedItems.indexOf(rv);
                                        if (contentId < 0) {
                                            _core.Guard.raise("Dependency graph error");
                                        }
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: "$" + (contentId + 1) } });
                                    }
                                }, this);
                            } else if (refValue === null) {
                                dbInstance.initData[association.FromPropertyName] = null;
                            } else {
                                if (refValue.entityState == _core2.default.EntityState.Modified || convertedItems.indexOf(refValue) < 0) {
                                    var sMod = context._storageModel.getStorageModel(refValue.getType());
                                    var tblName = sMod.TableName;
                                    var pk = '(' + context.storageProvider.getEntityKeysValue({ data: refValue, entitySet: context.getEntitySetFromElementType(refValue.getType()) }) + ')';
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: tblName + pk } };
                                } else {
                                    var contentId = convertedItems.indexOf(refValue);
                                    if (contentId < 0) {
                                        _core.Guard.raise("Dependency graph error");
                                    }
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: "$" + (contentId + 1) } };
                                }
                            }
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    dbInstance.initData[cmpType.FromPropertyName] = logicalEntity[cmpType.FromPropertyName];
                }, this);
            }
            return dbInstance;
        };
    },
    buildDbType_modifyInstanceDefinition: function buildDbType_modifyInstanceDefinition() {
        return;
    },
    executeQuery: function executeQuery(query, callBack) {
        callBack = _core2.default.typeSystem.createCallbackSetting(callBack);

        var sql = {};
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }
        var schema = this.context;

        var that = this;
        var countProperty = "__count";
        if (this.providerConfiguration.maxDataServiceVersion === "4.0") {
            countProperty = "@odata.count";
        }

        var requestData = [{
            requestUri: this.providerConfiguration.oDataServiceHost + sql.queryText,
            method: sql.method,
            data: sql.postData,
            headers: {}
        }, function (data, textStatus, jqXHR) {

            if (!data && textStatus.body && !sql.isBatchExecuteQuery) data = JSON.parse(textStatus.body);
            if (callBack.success) {
                var processSuccess = function processSuccess(query, data, sql) {
                    query.rawDataList = typeof data === 'string' ? [{ cnt: _core.Container.convertTo(data, _core2.default.Integer) }] : data;
                    if (sql.withInlineCount && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && (typeof data[countProperty] !== 'undefined' || 'd' in data && typeof data.d[countProperty] !== 'undefined')) {
                        query.__count = new Number(typeof data[countProperty] !== 'undefined' ? data[countProperty] : data.d[countProperty]).valueOf();
                    }
                };

                if (sql.isBatchExecuteQuery) {
                    query.rawDataList = sql.subQueries;
                    for (var i = 0; i < data.__batchResponses.length; i++) {
                        var resp = data.__batchResponses[i];

                        if (!resp.data) {
                            if (resp.body) {
                                resp.data = JSON.parse(resp.body);
                            } else {
                                callBack.error(that.parseError(resp, arguments));
                                return;
                            }
                        }

                        processSuccess(sql.subQueries[i], resp.data, sql.subQueries[i]._getComplitedData());
                    }
                } else {
                    processSuccess(query, data, sql);
                }

                callBack.success(query);
            }
        }, function (error) {
            callBack.error(that.parseError(error, arguments));
        }, sql.isBatchExecuteQuery ? this.oData.batchHandler : undefined];

        if (this.providerConfiguration.maxDataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
            requestData[0].headers.MaxDataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }

        if (this.providerConfiguration.dataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
            requestData[0].headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
        }

        if (typeof this.providerConfiguration.enableJSONP !== 'undefined') {
            requestData[0].enableJsonpCallback = this.providerConfiguration.enableJSONP;
        }
        if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
            requestData[0].useJsonLight = this.providerConfiguration.useJsonLight;
        }

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        //$data.ajax(requestData);
        //OData.request(requestData, requestData.success, requestData.error);
        this.oData.request.apply(this, requestData);
    },
    _compile: function _compile(queryable, params) {
        var compiler = new _core2.default.storageProviders.oDataV3.oDataCompiler();
        var compiled = compiler.compile(queryable);
        return compiled;
    },
    saveChanges: function saveChanges(callBack, changedItems) {
        if (changedItems.length > 0) {
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            this.saveInternal(independentBlocks, 0, callBack);
        } else {
            callBack.success(0);
        }
    },
    saveInternal: function saveInternal(independentBlocks, index2, callBack) {
        if ((this.providerConfiguration.disableBatch === true || _typeof(_core2.default.defaults) === 'object' && _core2.default.defaults.disableBatch === true) && typeof this._saveRestMany === 'function') {
            this._saveRestMany(independentBlocks, index2, callBack);
        } else {
            if (independentBlocks.length > 1 || independentBlocks.length == 1 && independentBlocks[0].length > 1) {
                this._saveBatch(independentBlocks, index2, callBack);
            } else {
                this._saveRest(independentBlocks, index2, callBack);
            }
        }
    },
    _saveRest: function _saveRest(independentBlocks, index2, callBack) {
        var batchRequests = [];
        var convertedItem = [];
        var request;
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                convertedItem.push(independentBlocks[index][i].data);
                request = {
                    requestUri: this.providerConfiguration.oDataServiceHost + '/',
                    headers: {}
                };
                if (this.providerConfiguration.maxDataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
                    request.headers.MaxDataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
                }
                if (this.providerConfiguration.dataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
                    request.headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
                }
                if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
                    request.useJsonLight = this.providerConfiguration.useJsonLight;
                }

                //request.headers = { "Content-Id": convertedItem.length };
                switch (independentBlocks[index][i].data.entityState) {
                    case _core2.default.EntityState.Unchanged:
                        continue;break;
                    case _core2.default.EntityState.Added:
                        request.method = "POST";
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case _core2.default.EntityState.Modified:
                        request.method = this.providerConfiguration.UpdateMethod;
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case _core2.default.EntityState.Deleted:
                        request.method = "DELETE";
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        break;
                    default:
                        _core.Guard.raise(new _core.Exception("Not supported Entity state"));
                }
                //batchRequests.push(request);
            }
        }
        var that = this;

        var requestData = [request, function (data, response) {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var item = convertedItem[0];
                if (response.statusCode == 204) {
                    if (response.headers.ETag || response.headers.Etag || response.headers.etag) {
                        var property = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) {
                            return memDef.concurrencyMode === _core2.default.ConcurrencyMode.Fixed;
                        });
                        if (property && property[0]) {
                            item[property[0].name] = response.headers.ETag || response.headers.Etag || response.headers.etag;
                        }
                    }
                } else {
                    that.reload_fromResponse(item, data, response);
                }

                if (callBack.success) {
                    callBack.success(convertedItem.length);
                }
            } else {
                callBack.error(that.parseError(response));
            }
        }, function (e) {
            callBack.error(that.parseError(e));
        }];

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        this.oData.request.apply(this, requestData);
    },
    _saveBatch: function _saveBatch(independentBlocks, index2, callBack) {
        var batchRequests = [];
        var convertedItem = [];
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                convertedItem.push(independentBlocks[index][i].data);
                var request = {};
                request.headers = {
                    "Content-Id": convertedItem.length
                };
                if (this.providerConfiguration.maxDataServiceVersion != "4.0") {
                    request.headers.MaxDataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
                }
                switch (independentBlocks[index][i].data.entityState) {
                    case _core2.default.EntityState.Unchanged:
                        continue;break;
                    case _core2.default.EntityState.Added:
                        request.method = "POST";
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case _core2.default.EntityState.Modified:
                        request.method = this.providerConfiguration.UpdateMethod;
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case _core2.default.EntityState.Deleted:
                        request.method = "DELETE";
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        break;
                    default:
                        _core.Guard.raise(new _core.Exception("Not supported Entity state"));
                }

                if (this.providerConfiguration.maxDataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
                    request.headers.MaxDataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
                }
                if (this.providerConfiguration.dataServiceVersion && this.providerConfiguration.maxDataServiceVersion !== "4.0") {
                    request.headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
                }
                batchRequests.push(request);
            }
        }
        var that = this;

        var requestData = [{
            requestUri: this.providerConfiguration.oDataServiceHost + "/$batch",
            method: "POST",
            data: {
                __batchRequests: [{ __changeRequests: batchRequests }]
            },
            headers: {}
        }, function (data, response) {
            if (response.statusCode == 202) {
                var result = data.__batchResponses[0].__changeResponses;
                var errors = [];

                for (var i = 0; i < result.length; i++) {
                    if (result[i].statusCode >= 200 && result[i].statusCode < 300) {
                        var item = convertedItem[i];
                        if (result[i].statusCode == 204) {
                            if (result[i].headers.ETag || result[i].headers.Etag || result[i].headers.etag) {
                                var property = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) {
                                    return memDef.concurrencyMode === _core2.default.ConcurrencyMode.Fixed;
                                });
                                if (property && property[0]) {
                                    item[property[0].name] = result[i].headers.ETag || result[i].headers.Etag || result[i].headers.etag;
                                }
                            }
                            continue;
                        }

                        that.reload_fromResponse(item, result[i].data, result[i]);
                    } else {
                        errors.push(that.parseError(result[i]));
                    }
                }
                if (errors.length > 0) {
                    if (errors.length === 1) {
                        callBack.error(errors[0]);
                    } else {
                        callBack.error(new _core.Exception('See inner exceptions', 'Batch failed', errors));
                    }
                } else if (callBack.success) {
                    callBack.success(convertedItem.length);
                }
            } else {
                callBack.error(that.parseError(response));
            }
        }, function (e) {
            callBack.error(that.parseError(e));
        }, this.oData.batchHandler];

        if (this.providerConfiguration.maxDataServiceVersion && this.providerConfiguration.maxDataServiceVersion != "4.0") {
            requestData[0].headers.MaxDataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }
        if (this.providerConfiguration.dataServiceVersion && this.providerConfiguration.maxDataServiceVersion != "4.0") {
            requestData[0].headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
        }
        if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
            requestData[0].useJsonLight = this.providerConfiguration.useJsonLight;
        }

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        this.oData.request.apply(this, requestData);
    },
    reload_fromResponse: function reload_fromResponse(item, data, response) {
        var that = this;
        item.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var propType = _core.Container.resolveType(memDef.type);
            if (memDef.computed || memDef.key || !memDef.inverseProperty) {
                if (memDef.concurrencyMode === _core2.default.ConcurrencyMode.Fixed) {
                    //unescape?
                    item[memDef.name] = response.headers.ETag || response.headers.Etag || response.headers.etag;
                } else if (memDef.isAssignableTo) {
                    if (data[memDef.name]) {
                        item[memDef.name] = new propType(data[memDef.name], { converters: that.fieldConverter.fromDb });
                    } else {
                        item[memDef.name] = data[memDef.name];
                    }
                } else if (propType === _core2.default.Array && memDef.elementType) {
                    var aeType = _core.Container.resolveType(memDef.elementType);
                    if (data[memDef.name] && Array.isArray(data[memDef.name])) {
                        var arrayProperty = [];
                        for (var ap = 0; ap < data[memDef.name].length; ap++) {
                            var aitem = data[memDef.name][ap];
                            if (aeType.isAssignableTo && !Object.isNullOrUndefined(aitem)) {
                                arrayProperty.push(new aeType(aitem, { converters: that.fieldConverter.fromDb }));
                            } else {
                                var etypeName = _core.Container.resolveName(aeType);
                                var econverter = that.fieldConverter.fromDb[etypeName];

                                arrayProperty.push(econverter ? econverter(aitem) : aitem);
                            }
                        }
                        item[memDef.name] = arrayProperty;
                    } else if (!data[memDef.name]) {
                        item[memDef.name] = data[memDef.name];
                    }
                } else {
                    var typeName = _core.Container.resolveName(memDef.type);
                    var converter = that.fieldConverter.fromDb[typeName];

                    item[memDef.name] = converter ? converter(data[memDef.name]) : data[memDef.name];
                }
            }
        }, this);
    },

    //save_getInitData: function (item, convertedItems) {
    //    var self = this;
    //    item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
    //    var serializableObject = {}
    //    item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
    //        if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
    //            if (typeof memdef.concurrencyMode === 'undefined' && (memdef.key === true || item.data.entityState === $data.EntityState.Added || item.data.changedProperties.some(function (def) { return def.name === memdef.name; }))) {
    //                var typeName = Container.resolveName(memdef.type);
    //                var converter = self.fieldConverter.toDb[typeName];
    //                serializableObject[memdef.name] = converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name];
    //            }
    //        }
    //    }, this);
    //    return serializableObject;
    //},
    save_getInitData: function save_getInitData(item, convertedItems, isComplex, isDeep) {
        var self = this;
        if (!isComplex) {
            item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        } else {
            item.physicalData = item.data;
        }
        var serializableObject = {};
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == _core2.default.MemberTypes.complexProperty && item.physicalData[memdef.name]) {
                serializableObject[memdef.name] = self.save_getInitData({ data: item.physicalData[memdef.name] }, convertedItems, true, true);
            } else if (memdef.kind == _core2.default.MemberTypes.navProperty || memdef.kind == _core2.default.MemberTypes.property && !memdef.notMapped) {
                if (isDeep || typeof memdef.concurrencyMode === 'undefined' && (memdef.key === true || item.data.entityState === _core2.default.EntityState.Added || item.data.changedProperties && item.data.changedProperties.some(function (def) {
                    return def.name === memdef.name;
                }))) {

                    if (memdef.kind == _core2.default.MemberTypes.navProperty && item.physicalData[memdef.name] && this.providerConfiguration.maxDataServiceVersion === "4.0") {
                        serializableObject[memdef.name + "@odata.bind"] = item.physicalData[memdef.name].__metadata.uri;
                    } else {
                        var typeName = _core.Container.resolveName(memdef.type);
                        var converter = self.fieldConverter.toDb[typeName];
                        serializableObject[memdef.name] = converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name];
                    }
                }
            }
        }, this);
        return serializableObject;
    },
    save_addConcurrencyHeader: function save_addConcurrencyHeader(item, headers) {
        var property = item.data.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) {
            return memDef.concurrencyMode === _core2.default.ConcurrencyMode.Fixed;
        });
        if (property && property[0]) {
            headers['If-Match'] = item.data[property[0].name];
            //item.data[property[0].name] = "";
        }
    },
    getTraceString: function getTraceString(queryable) {
        var sqlText = this._compile(queryable);
        return queryable;
    },
    supportedDataTypes: {
        value: [_core2.default.Array, _core2.default.Integer, _core2.default.String, _core2.default.Number, _core2.default.Blob, _core2.default.Boolean, _core2.default.Date, _core2.default.Object, _core2.default.GeographyPoint, _core2.default.Guid, _core2.default.GeographyLineString, _core2.default.GeographyPolygon, _core2.default.GeographyMultiPoint, _core2.default.GeographyMultiLineString, _core2.default.GeographyMultiPolygon, _core2.default.GeographyCollection, _core2.default.GeometryPoint, _core2.default.GeometryLineString, _core2.default.GeometryPolygon, _core2.default.GeometryMultiPoint, _core2.default.GeometryMultiLineString, _core2.default.GeometryMultiPolygon, _core2.default.GeometryCollection, _core2.default.Byte, _core2.default.SByte, _core2.default.Decimal, _core2.default.Float, _core2.default.Int16, _core2.default.Int32, _core2.default.Int64, _core2.default.Time, _core2.default.DateTimeOffset],
        writable: false
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: 'eq', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            notEqual: { mapTo: 'ne', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            equalTyped: { mapTo: 'eq', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            notEqualTyped: { mapTo: 'ne', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            greaterThan: { mapTo: 'gt', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            greaterThanOrEqual: { mapTo: 'ge', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },

            lessThan: { mapTo: 'lt', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            lessThenOrEqual: { mapTo: 'le', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            or: { mapTo: 'or', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            and: { mapTo: 'and', dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },

            add: { mapTo: 'add', dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            divide: { mapTo: 'div', allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            multiply: { mapTo: 'mul', allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            subtract: { mapTo: 'sub', allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },
            modulo: { mapTo: 'mod', allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] },

            "in": { mapTo: "in", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression] }
        }
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' }
        }
    },

    supportedFieldOperations: {
        value: {
            /* string functions */

            contains: {
                mapTo: "substringof",
                dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "substring", dataType: "string" }, { name: "@expression" }]
            },

            startsWith: {
                mapTo: "startswith",
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            endsWith: {
                mapTo: "endswith",
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            length: [{
                allowedType: 'string',
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            }, {
                allowedType: 'GeographyLineString',
                mapTo: "geo.length",
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: ['GeographyLineString'] }],
                fixedDataType: 'decimal'
            }, {
                allowedType: 'GeometryLineString',
                mapTo: "geo.length",
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryLineString' }],
                fixedDataType: 'decimal'
            }],

            strLength: {
                mapTo: "length",
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            indexOf: {
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                mapTo: "indexof",
                baseIndex: 1,
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFragment', dataType: 'string' }]
            },

            replace: {
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFrom', dataType: 'string' }, { name: 'strTo', dataType: 'string' }]
            },

            substr: {
                mapTo: "substring",
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "startFrom", dataType: "number" }, { name: "length", dataType: "number", optional: "true" }]
            },

            toLowerCase: {
                mapTo: "tolower",
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            toUpperCase: {
                mapTo: "toupper",
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]

            },

            trim: {
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            concat: {
                dataType: "string", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            /* data functions */

            day: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            hour: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            minute: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            month: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            second: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            year: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },

            /* number functions */
            round: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            floor: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            ceiling: {
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },

            /* geo functions */
            distance: [{
                allowedType: 'GeographyPoint',
                mapTo: "geo.distance",
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeographyPoint' }, { name: "to", dataType: 'GeographyPoint' }],
                fixedDataType: 'decimal'
            }, {
                allowedType: 'GeometryPoint',
                mapTo: "geo.distance",
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryPoint' }, { name: "to", dataType: 'GeometryPoint' }],
                fixedDataType: 'decimal'
            }],

            intersects: [{
                allowedType: 'GeographyPoint',
                mapTo: "geo.intersects",
                dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeographyPoint' }, { name: "in", dataType: 'GeographyPolygon' }]

            }, {
                allowedType: 'GeometryPoint',
                mapTo: "geo.intersects",
                dataType: "boolean", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryPoint' }, { name: "in", dataType: 'GeometryPolygon' }]

            }]
        },
        enumerable: true,
        writable: true
    },
    supportedSetOperations: {
        value: {
            filter: {},
            map: {},
            length: {},
            forEach: {},
            toArray: {},
            single: {},
            some: {
                invokable: false,
                allowedIn: [_core2.default.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'any',
                frameType: _core2.default.Expressions.SomeExpression
            },
            every: {
                invokable: false,
                allowedIn: [_core2.default.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'all',
                frameType: _core2.default.Expressions.EveryExpression
            },
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {},
            include: {},
            batchDelete: {},
            withInlineCount: {},
            find: {}
        },
        enumerable: true,
        writable: true
    },
    supportedContextOperation: {
        value: {
            batchExecuteQuery: true
        },
        enumerable: true,
        writable: true
    },

    fieldConverter: { value: _core2.default.oDataConverterV3 },
    resolveTypeOperations: function resolveTypeOperations(operation, expression, frameType) {
        var memDef = expression.entityType.getMemberDefinition(operation);
        if (!memDef || !memDef.method || memDef.method.IsSideEffecting !== false || !memDef.method.returnType || !(frameType === _core2.default.Expressions.FilterExpression || frameType === _core2.default.Expressions.OrderExpression)) {
            _core.Guard.raise(new _core.Exception("Entity '" + expression.entityType.name + "' Operation '" + operation + "' is not supported by the provider"));
        }

        return memDef;
    },
    resolveSetOperations: function resolveSetOperations(operation, expression, frameType) {
        if (expression) {
            var esDef = expression.storageModel.ContextType.getMemberDefinition(expression.storageModel.ItemName);
            if (esDef && esDef.actions && esDef.actions[operation]) {
                var memDef = _core2.default.MemberDefinition.translateDefinition(esDef.actions[operation], operation, this.getType());
                if (!memDef || !memDef.method || memDef.method.IsSideEffecting !== false || !memDef.method.returnType || !(frameType === _core2.default.Expressions.FilterExpression || frameType === _core2.default.Expressions.OrderExpression)) {

                    _core.Guard.raise(new _core.Exception("Collection '" + expression.storageModel.ItemName + "' Operation '" + operation + "' is not supported by the provider"));
                }

                return memDef;
            }
        }
        return _core2.default.StorageProviderBase.prototype.resolveSetOperations.apply(this, arguments);
    },
    resolveContextOperations: function resolveContextOperations(operation, expression, frameType) {
        var memDef = this.context.getType().getMemberDefinition(operation);
        if (!memDef || !memDef.method || memDef.method.IsSideEffecting !== false || !memDef.method.returnType || !(frameType === _core2.default.Expressions.FilterExpression || frameType === _core2.default.Expressions.OrderExpression)) {
            _core.Guard.raise(new _core.Exception("Context '" + expression.instance.getType().name + "' Operation '" + operation + "' is not supported by the provider"));
        }
        return memDef;
    },

    getEntityKeysValue: function getEntityKeysValue(entity) {
        var result = [];
        var keyValue = undefined;
        var memDefs = entity.data.getType().memberDefinitions.getKeyProperties();
        for (var i = 0, l = memDefs.length; i < l; i++) {
            var field = memDefs[i];
            if (field.key) {
                keyValue = entity.data[field.name];
                var typeName = _core.Container.resolveName(field.type);

                var converter = this.fieldConverter.toDb[typeName];
                keyValue = converter ? converter(keyValue) : keyValue;

                converter = this.fieldConverter.escape[typeName];
                keyValue = converter ? converter(keyValue) : keyValue;

                result.push(field.name + "=" + keyValue);
            }
        }
        if (result.length > 1) {
            return result.join(",");
        }
        return keyValue;
    },
    getFieldUrl: function getFieldUrl(entity, fieldName, entitySet) {
        var keyPart = this.getEntityKeysValue({ data: entity });
        var servicehost = this.providerConfiguration.oDataServiceHost;
        if (servicehost.lastIndexOf('/') === servicehost.length) servicehost = servicehost.substring(0, servicehost.length - 1);

        return servicehost + '/' + entitySet.tableName + '(' + keyPart + ')/' + fieldName + '/$value';
    }, /*
       getServiceMetadata: function () {
         $data.ajax(this._setAjaxAuthHeader({
             url: this.providerConfiguration.oDataServiceHost + "/$metadata",
             dataType: "xml",
             success: function (d) {
                 console.log("OK");
                 console.dir(d);
                 console.log(typeof d);
                 window["s"] = d;
                 window["k"] = this.nsResolver;
                 //s.evaluate("edmx:Edmx/edmx:DataServices/Schema", s, $data.storageProviders.oData.oDataProvider.prototype.nsResolver, XPathResult.ANY_TYPE, null).iterateNext()
               },
             error: function (error) {
                 console.log("error:");
                 console.dir(error);
             }
         }));
       },
       nsResolver: function (sPrefix) {
         switch (sPrefix) {
             case "edmx":
                 return "http://schemas.microsoft.com/ado/2007/06/edmx";
                 break;
             case "m":
                 return "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata";
                 break;
             case "d":
                 return "http://schemas.microsoft.com/ado/2007/08/dataservices";
                 break;
             default:
                 return "http://schemas.microsoft.com/ado/2008/09/edm";
                 break;
         }
       }
       */
    parseError: function parseError(error, data) {

        var message = (error.response || error || {}).body || '';
        try {
            if (message.indexOf('{') === 0) {
                var errorObj = JSON.parse(message);
                errorObj = errorObj['odata.error'] || errorObj.error || errorObj;
                if (errorObj.message) {
                    message = errorObj.message.value || errorObj.message;
                }
            }
        } catch (e) {}

        return new _core.Exception(message, error.message, data || error);
    },
    appendBasicAuth: function appendBasicAuth(request, user, password, withCredentials) {
        request.headers = request.headers || {};
        if (!request.headers.Authorization && user && password) {
            request.headers.Authorization = "Basic " + this.__encodeBase64(user + ":" + password);
        }
        if (withCredentials) {
            request.withCredentials = withCredentials;
        }
    },
    __encodeBase64: function __encodeBase64(val) {
        var b64array = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";

        var input = val;
        var base64 = "";
        var hex = "";
        var chr1,
            chr2,
            chr3 = "";
        var enc1,
            enc2,
            enc3,
            enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            base64 = base64 + b64array.charAt(enc1) + b64array.charAt(enc2) + b64array.charAt(enc3) + b64array.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return base64;
    }
}, null);

_core2.default.StorageProviderBase.registerProvider("oDataV3", _core2.default.storageProviders.oDataV3.oDataProvider);

},{"jaydata/core":"jaydata/core"}],8:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.storageProviders.oDataV3.oDataWhereCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(provider, lambdaPrefix) {
        this.provider = provider;
        this.lambdaPrefix = lambdaPrefix;
    },

    compile: function compile(expression, context) {
        this.Visit(expression, context);
    },

    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, context) {
        this.Visit(expression.expression, context);
    },

    VisitUnaryExpression: function VisitUnaryExpression(expression, context) {
        context.data += expression.resolution.mapTo;
        context.data += "(";
        this.Visit(expression.operand, context);
        context.data += ")";
    },

    VisitSimpleBinaryExpression: function VisitSimpleBinaryExpression(expression, context) {
        context.data += "(";
        //TODO refactor!!!
        if (expression.nodeType == "in") {
            _core.Guard.requireType("expression.right", expression.type, _core2.default.Expressions.ConstantExpression);
            var paramValue = expression.right.value;
            if (!paramValue instanceof Array) {
                _core.Guard.raise(new _core.Exception("Right to the 'in' operator must be an array value"));
            }
            var result = null;
            var orResolution = { mapTo: "or", dataType: "boolean", name: "or" };
            var eqResolution = { mapTo: "eq", dataType: "boolean", name: "equal" };

            paramValue.forEach(function (item) {
                var idValue = item;
                var idCheck = _core.Container.createSimpleBinaryExpression(expression.left, idValue, _core2.default.Expressions.ExpressionType.Equal, "==", "boolean", eqResolution);
                if (result) {
                    result = _core.Container.createSimpleBinaryExpression(result, idCheck, _core2.default.Expressions.ExpressionType.Or, "||", "boolean", orResolution);
                } else {
                    result = idCheck;
                };
            });
            var temp = context.data;
            context.data = '';
            this.Visit(result, context);
            context.data = temp + context.data.replace(/\(/g, '').replace(/\)/g, '');
        } else {
            this.Visit(expression.left, context);
            context.data += " ";
            context.data += expression.resolution.mapTo;
            context.data += " ";
            this.Visit(expression.right, context);
        };
        context.data += ")";
    },

    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, context) {
        this.Visit(expression.source, context);
        if (expression.source instanceof _core2.default.Expressions.ComplexTypeExpression) {
            context.data += "/";
        }
        this.Visit(expression.selector, context);
    },

    VisitAssociationInfoExpression: function VisitAssociationInfoExpression(expression, context) {
        context.data += expression.associationInfo.FromPropertyName;
    },

    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, context) {
        context.data += expression.memberName;
    },

    VisitQueryParameterExpression: function VisitQueryParameterExpression(expression, context) {
        var typeName = _core.Container.resolveName(expression.type);

        var converter = this.provider.fieldConverter.toDb[typeName];
        var value = converter ? converter(expression.value) : expression.value;

        converter = this.provider.fieldConverter.escape[typeName];
        context.data += converter ? converter(value) : value;
    },

    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, context) {
        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++];
            };
        });

        args.forEach(function (arg, index) {
            if (index > 0) {
                context.data += ",";
            };
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },
    VisitEntityFunctionOperationExpression: function VisitEntityFunctionOperationExpression(expression, context) {
        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);
        this.Visit(expression.source, context);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.method.params || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++];
            };
        });
        var i = 0;
        args.forEach(function (arg, index) {
            if (arg === undefined || arg instanceof _core2.default.Expressions.ConstantExpression && typeof arg.value === 'undefined') return;

            if (i > 0) {
                context.data += ",";
            };
            i++;
            context.data += params[index].name + '=';
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },
    VisitContextFunctionOperationExpression: function VisitContextFunctionOperationExpression(expression, context) {
        return this.VisitEntityFunctionOperationExpression(expression, context);
    },

    VisitConstantExpression: function VisitConstantExpression(expression, context) {
        var typeName = _core.Container.resolveName(expression.type);

        var converter = this.provider.fieldConverter.toDb[typeName];
        var value = converter ? converter(expression.value) : expression.value;

        converter = this.provider.fieldConverter.escape[typeName];
        context.data += converter ? converter(value) : value;
    },

    VisitEntityExpression: function VisitEntityExpression(expression, context) {
        this.Visit(expression.source, context);

        if (this.lambdaPrefix && expression.selector.lambda) {
            context.lambda = expression.selector.lambda;
            context.data += expression.selector.lambda + '/';
        }

        //if (expression.selector instanceof $data.Expressions.EntityExpression) {
        //    this.Visit(expression.selector, context);
        //}
    },

    VisitEntitySetExpression: function VisitEntitySetExpression(expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof _core2.default.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
            context.data += "/";
        }
    },

    VisitFrameOperationExpression: function VisitFrameOperationExpression(expression, context) {
        this.Visit(expression.source, context);

        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++];
            };
        });

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg && arg.value instanceof _core2.default.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = _core.Container.createQueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);

                var compiler = new _core2.default.storageProviders.oDataV3.oDataWhereCompiler(this.provider, true);
                var frameContext = { data: "" };
                var compiled = compiler.compile(prep_expression, frameContext);

                context.data += frameContext.lambda + ': ' + frameContext.data;
            };
        }
        context.data += ")";
    }
});

},{"jaydata/core":"jaydata/core"}]},{},[1])(1)
});

