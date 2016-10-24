"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Subject_1 = require("rxjs/Subject");
var Northwind_1 = require('../../jaydata-model/Northwind');
require("jaydata/odata");
var NorthwindService = (function () {
    function NorthwindService() {
        var _this = this;
        this.localSubject = new Subject_1.Subject();
        this.remoteSubject = new Subject_1.Subject();
        Northwind_1.Northwind.Category.addMember("Sync", { type: "int", nullable: false });
        Northwind_1.Northwind.Product.addMember("Sync", { type: "int", nullable: false });
        Northwind_1.factory({
            name: 'local'
        })
            .onReady()
            .then(function (context) { return _this.onLocalReady(context); });
        Northwind_1.factory()
            .onReady()
            .then(function (context) { return _this.onRemoteReady(context); });
    }
    NorthwindService.prototype.getContext = function (setContext) {
        if (this.localContext) {
            setContext(this.localContext);
        }
        else {
            this.localSubject.subscribe(setContext);
        }
    };
    NorthwindService.prototype.getRemoteContext = function (setContext) {
        if (this.remoteContext) {
            setContext(this.remoteContext);
        }
        else {
            this.remoteSubject.subscribe(setContext);
        }
    };
    NorthwindService.prototype.onLocalReady = function (context) {
        this.localContext = context;
        this.localSubject.next(this.localContext);
        this.localSubject.complete();
    };
    NorthwindService.prototype.onRemoteReady = function (context) {
        this.remoteContext = context;
        this.remoteSubject.next(this.remoteContext);
        this.remoteSubject.complete();
    };
    NorthwindService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], NorthwindService);
    return NorthwindService;
}());
exports.NorthwindService = NorthwindService;
//# sourceMappingURL=northwind.service.js.map