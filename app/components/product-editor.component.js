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
var services_1 = require('../services');
var Northwind_1 = require('../../jaydata-model/Northwind');
var Subject_1 = require("rxjs/Subject");
var ProductEditorComponent = (function () {
    function ProductEditorComponent(northwindService) {
        var _this = this;
        this.action = "create";
        this.notifyText = "Please wait ...";
        this.isChange = true;
        this.onSaveSub = new Subject_1.Subject();
        northwindService.getContext(function (context) { return _this.context = context; });
        this.product = new Northwind_1.Northwind.Product();
    }
    ProductEditorComponent.prototype.targetProduct = function (product) {
        this.isChange = true;
        this.product = product;
        this.action = "edit";
        this.context.Products.attach(this.product);
        this.notifyText = "Please wait ...";
    };
    ProductEditorComponent.prototype.add = function (category) {
        this.isChange = false;
        this.category = category;
        this.product = new Northwind_1.Northwind.Product();
        this.product.Category = this.category;
        this.context.Categories.attach(this.category);
    };
    ProductEditorComponent.prototype.OnSave = function () {
        var _this = this;
        this.product.Sync = -1;
        if (!this.isChange) {
            this.context.Products.add(this.product);
        }
        this.context.saveChanges()
            .then(function () { return _this.notifyText = "Complete"; })
            .catch(function (error) { return _this.notifyText = "Error: " + error.name; });
        this.context.stateManager.reset();
        this.onSaveSub.next(this.product);
    };
    ProductEditorComponent = __decorate([
        core_1.Component({
            selector: 'product-editor',
            templateUrl: './templates/product-editor.template.html'
        }), 
        __metadata('design:paramtypes', [services_1.NorthwindService])
    ], ProductEditorComponent);
    return ProductEditorComponent;
}());
exports.ProductEditorComponent = ProductEditorComponent;
//# sourceMappingURL=product-editor.component.js.map