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
var products_component_1 = require('./products.component');
var product_editor_component_1 = require('./product-editor.component');
var CategoriesComponent = (function () {
    function CategoriesComponent(northwindService) {
        var _this = this;
        this.categories = [];
        this.northwindService = northwindService;
        northwindService.getContext(function (context) { return _this.OnContextLoaded(context); });
    }
    CategoriesComponent.prototype.OnContextLoaded = function (context) {
        var _this = this;
        this.context = context;
        this.sync(function () {
            _this.context.Categories
                .toArray()
                .then(function (categories) { return _this.categories = categories; });
        });
    };
    CategoriesComponent.prototype.sync = function (cb) {
        var _this = this;
        var now = Date.now();
        this.northwindService.getRemoteContext(function (remoteContext) {
            remoteContext.Categories.toArray().then(function (categories) {
                return Promise.all(categories.map(function (category) {
                    return category.getProperty("Products").then(function (products) {
                        category.Sync = now;
                        category.Products = [];
                        return _this.context.Categories.single("it.Id == \"" + category.Id + "\"").then(function (localCategory) {
                            if (localCategory.Sync >= 0)
                                _this.context.Categories.attach(category, Northwind_1.$data.EntityAttachMode.AllChanged);
                            return Promise.all(products.map(function (product) {
                                product.Category = category;
                                product.Sync = now;
                                return _this.context.Products.single("it.Id == \"" + product.Id + "\"").then(function (localProduct) {
                                    if (localProduct.Sync >= 0) {
                                        _this.context.Products.attach(product, Northwind_1.$data.EntityAttachMode.AllChanged);
                                        category.Products.push(product);
                                    }
                                    else {
                                        category.Products.push(localProduct);
                                    }
                                }, function () {
                                    _this.context.Products.add(product);
                                });
                            }));
                        }, function () {
                            products.forEach(function (product) {
                                product.Sync = now;
                                product.Category = category;
                                _this.context.Products.add(product);
                            });
                            _this.context.Categories.add(category);
                        });
                    });
                }));
            }).then(function () { return _this.context.saveChanges().then(cb); });
        });
    };
    CategoriesComponent.prototype.toggleSlider = function (products, slider) {
        if (products.isActive) {
            slider.style.height = "0px";
        }
        else {
            slider.style.height = "100%";
        }
    };
    CategoriesComponent.prototype.OnClick = function (products, slider) {
        this.toggleSlider(products, slider);
        products.openToggle();
    };
    CategoriesComponent.prototype.OnAdd = function (products, slider) {
        products.open();
        slider.style.height = "100%";
        products.add();
    };
    CategoriesComponent.prototype.OnSync = function () {
        var _this = this;
        var now = Date.now();
        this.northwindService.getRemoteContext(function (remoteContext) {
            _this.context.Products.include("Category").filter("it.Sync == -1").toArray().then(function (products) {
                Promise.all(products.map(function (product) {
                    _this.context.Products.attach(product);
                    product.Sync = now;
                    var proxyProduct = new Northwind_1.Northwind.Product(product);
                    proxyProduct.Sync = undefined;
                    var proxyCategory = new Northwind_1.Northwind.Category({ Id: product.Category.Id });
                    proxyProduct.Category = remoteContext.Categories.attachOrGet(proxyCategory);
                    return remoteContext.Products.single("it.Id == " + product.Id).then(function (remoteProduct) {
                        remoteContext.Products.attach(proxyProduct, Northwind_1.$data.EntityAttachMode.AllChanged);
                    }, function () {
                        remoteContext.Products.add(proxyProduct);
                    });
                })).then(function () {
                    remoteContext.saveChanges().then(function () {
                        _this.context.saveChanges().then(function () {
                            alert("Sync completed.");
                        });
                    });
                });
            });
        });
    };
    CategoriesComponent = __decorate([
        core_1.Component({
            selector: 'categories',
            templateUrl: './templates/categories.template.html',
            directives: [products_component_1.ProductsComponent, product_editor_component_1.ProductEditorComponent]
        }), 
        __metadata('design:paramtypes', [services_1.NorthwindService])
    ], CategoriesComponent);
    return CategoriesComponent;
}());
exports.CategoriesComponent = CategoriesComponent;
//# sourceMappingURL=categories.component.js.map