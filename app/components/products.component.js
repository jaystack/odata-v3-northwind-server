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
var product_editor_component_1 = require('./product-editor.component');
var ProductsComponent = (function () {
    function ProductsComponent(northwindService) {
        this.northwindService = northwindService;
        this.products = [];
        this.isActive = false;
    }
    ProductsComponent.prototype.openToggle = function () {
        if (this.isActive) {
            this.isActive = false;
        }
        else {
            this.init();
        }
    };
    ProductsComponent.prototype.open = function () {
        this.init();
    };
    ProductsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.editor.onSaveSub.subscribe(function (product) {
            if (product.Category.Id === _this.category.Id) {
                _this.init();
                if (_this.products.filter(function (it) { return it.Id == product.Id; }).length == 0) {
                    _this.products.push(product);
                }
            }
        });
    };
    ProductsComponent.prototype.add = function () {
        this.editor.add(this.category);
    };
    ProductsComponent.prototype.init = function () {
        var _this = this;
        this.northwindService.getContext(function (context) { return _this.OnContextLoaded(context); });
    };
    ProductsComponent.prototype.OnContextLoaded = function (context) {
        var _this = this;
        this.category.getProperty("Products").then(function (products) {
            _this.products = products;
            _this.isActive = true;
        });
    };
    ProductsComponent.prototype.OnClick = function (product) {
        product.Category = this.category;
        this.editor.targetProduct(product);
    };
    __decorate([
        core_1.Input("category"), 
        __metadata('design:type', Object)
    ], ProductsComponent.prototype, "category", void 0);
    __decorate([
        core_1.Input("editor"), 
        __metadata('design:type', product_editor_component_1.ProductEditorComponent)
    ], ProductsComponent.prototype, "editor", void 0);
    ProductsComponent = __decorate([
        core_1.Component({
            selector: 'products',
            templateUrl: './templates/products.template.html'
        }), 
        __metadata('design:paramtypes', [services_1.NorthwindService])
    ], ProductsComponent);
    return ProductsComponent;
}());
exports.ProductsComponent = ProductsComponent;
//# sourceMappingURL=products.component.js.map