(function(mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports, require("jaydata/core")); // CommonJS
    if (typeof define == "function" && define.amd) return define(["exports", "jaydata/core"], mod); // AMD
    mod($data.generatedContext || ($data.generatedContext = {}), $data); // Plain browser env
})(function(exports, $data) {

    exports.$data = $data;

    var types = {};

    types["Northwind.Category"] = $data("$data.Entity").extend("Northwind.Category", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": false,
            "key": true,
            "computed": true
        },
        Name: {
            "type": "Edm.String",
            "maxLength": 4000
        },
        Description: {
            "type": "Edm.String",
            "maxLength": 4000
        },
        Products: {
            "type": "Array",
            "elementType": "Northwind.Product",
            "inverseProperty": "Category"
        }
    });

    types["Northwind.Product"] = $data("$data.Entity").extend("Northwind.Product", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": false,
            "key": true,
            "computed": true
        },
        QuantityPerUnit: {
            "type": "Edm.String",
            "maxLength": 4000
        },
        UnitPrice: {
            "type": "Edm.Double",
            "nullable": false,
            "required": true
        },
        Name: {
            "type": "Edm.String",
            "maxLength": 4000
        },
        Discontinued: {
            "type": "Edm.Boolean",
            "nullable": false,
            "required": true
        },
        Category: {
            "type": "Northwind.Category",
            "inverseProperty": "Products"
        }
    });

    exports.type = types["System.Data.Objects.NorthwindContext"] = $data("$data.EntityContext").extend("System.Data.Objects.NorthwindContext", {
        Categories: {
            "type": "$data.EntitySet",
            "elementType": "Northwind.Category"
        },
        Products: {
            "type": "$data.EntitySet",
            "elementType": "Northwind.Product"
        }
    });

    exports.Northwind = {
        "Category": types["Northwind.Category"],
        "Product": types["Northwind.Product"]
    };

    exports.System = {
        "Data": {
            "Objects": {
                "NorthwindContext": types["System.Data.Objects.NorthwindContext"]
            }
        }
    };

    var ctxType = exports.type;
    exports.factory = function(config) {
        if (ctxType) {
            var cfg = $data.typeSystem.extend({
                name: "oDataV3",
                oDataServiceHost: "http://localhost:63560/Services/Northwind.svc",
                withCredentials: false,
                maxDataServiceVersion: "3.0",
                dataServiceVersion: "1.0"
            }, config);
            return new ctxType(cfg);
        } else {
            return null;
        }
    };

    if (typeof Reflect !== "undefined" && typeof Reflect.defineMetadata === "function") {}

});