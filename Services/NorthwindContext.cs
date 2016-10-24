using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Northwind
{
    public class NorthwindContext : DbContext
    {
        static NorthwindContext()
        {
            Database.SetInitializer(new NorthwindContextInitializer());
        }

        public NorthwindContext() : base("northwind")
        {

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
    }

    public class Category
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual List<Product> Products { get; set; }
    }

    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string QuantityPerUnit { get; set; }
        public double UnitPrice { get; set; }
        public string Name { get; set; }
        public bool Discontinued { get; set; }
        public virtual Category Category { get; set; }
    }

    public class NorthwindContextInitializer : DropCreateDatabaseIfModelChanges<NorthwindContext>
    {
        protected override void Seed(NorthwindContext context)
        {
            var beverages = new Category { Name = "Beverages", Description = "Soft drinks" };
            var grains = new Category { Name = "Grains/Cereals", Description = "Breads" };
            var meat = new Category { Name = "Meat/Poultry", Description = "Prepared meats" };
            var produce = new Category { Name = "Produce", Description = "Dried fruit and bean curd" };
            var seafood = new Category { Name = "Seafood", Description = "Seaweed and fish" };
            var condiments = new Category { Name = "Condiments", Description = "Sweet and savory sauces" };
            var dairy = new Category { Name = "Dairy Products", Description = "Cheeses" };
            var confections = new Category { Name = "Confections", Description = "Desserts" };

            context.Products.Add(new Product { Name = "Chai", QuantityPerUnit = "10 boxes x 20 bags", UnitPrice = 39.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Chang", QuantityPerUnit = "24 - 12 oz bottles", UnitPrice = 19.00, Discontinued = true, Category = beverages });
            context.Products.Add(new Product { Name = "Aniseed Syrup", QuantityPerUnit = "12 - 550 ml bottles", UnitPrice = 10.00, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Chef Anton's Cajun Seasoning", QuantityPerUnit = "48 - 6 oz jars", UnitPrice = 22.00, Discontinued = true, Category = condiments });
            context.Products.Add(new Product { Name = "Chef Anton's Gumbo Mix", QuantityPerUnit = "36 boxes", UnitPrice = 21.35, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Grandma's Boysenberry Spread", QuantityPerUnit = "12 - 8 oz jars", UnitPrice = 25.00, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Ikura", QuantityPerUnit = "12 - 200 ml jars", UnitPrice = 31.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Queso Cabrales", QuantityPerUnit = "1 kg pkg.", UnitPrice = 21.00, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Queso Manchego La Pastora", QuantityPerUnit = "10 - 500 g pkgs.", UnitPrice = 38.00, Discontinued = true, Category = dairy });
            context.Products.Add(new Product { Name = "Konbu", QuantityPerUnit = "2 kg box", UnitPrice = 6.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Tofu", QuantityPerUnit = "40 - 100 g pkgs.", UnitPrice = 23.25, Discontinued = false, Category = produce });
            context.Products.Add(new Product { Name = "Genen Shouyu", QuantityPerUnit = "24 - 250 ml bottles", UnitPrice = 15.50, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Pavlova", QuantityPerUnit = "32 - 500 g boxes", UnitPrice = 17.45, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Alice Mutton", QuantityPerUnit = "20 - 1 kg tins", UnitPrice = 39.00, Discontinued = false, Category = meat });
            context.Products.Add(new Product { Name = "Carnarvon Tigers", QuantityPerUnit = "16 kg pkg.", UnitPrice = 62.50, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Teatime Chocolate Biscuits", QuantityPerUnit = "10 boxes x 12 pieces", UnitPrice = 9.20, Discontinued = true, Category = confections });
            context.Products.Add(new Product { Name = "Sir Rodney's Marmalade", QuantityPerUnit = "30 gift boxes", UnitPrice = 81.00, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Sir Rodney's Scones", QuantityPerUnit = "24 pkgs. x 4 pieces", UnitPrice = 10.00, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Uncle Bob's Organic Dried Pears", QuantityPerUnit = "12 - 1 lb pkgs.", UnitPrice = 30.00, Discontinued = true, Category = produce });
            context.Products.Add(new Product { Name = "Northwoods Cranberry Sauce", QuantityPerUnit = "12 - 12 oz jars", UnitPrice = 40.00, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Mishi Kobe Niku", QuantityPerUnit = "18 - 500 g pkgs.", UnitPrice = 97.00, Discontinued = false, Category = meat });
            context.Products.Add(new Product { Name = "Gustaf's Knäckebröd", QuantityPerUnit = "24 - 500 g pkgs.", UnitPrice = 21.00, Discontinued = false, Category = grains });
            context.Products.Add(new Product { Name = "Tunnbröd", QuantityPerUnit = "12 - 250 g pkgs.", UnitPrice = 9.00, Discontinued = false, Category = grains });
            context.Products.Add(new Product { Name = "Guaraná Fantástica", QuantityPerUnit = "12 - 355 ml cans", UnitPrice = 4.50, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "NuNuCa Nuß-Nougat-Creme", QuantityPerUnit = "20 - 450 g glasses", UnitPrice = 14.00, Discontinued = true, Category = confections });
            context.Products.Add(new Product { Name = "Gumbär Gummibärchen", QuantityPerUnit = "100 - 250 g bags", UnitPrice = 31.23, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Nord-Ost Matjeshering", QuantityPerUnit = "10 - 200 g glasses", UnitPrice = 25.89, Discontinued = true, Category = seafood });
            context.Products.Add(new Product { Name = "Gorgonzola Telino", QuantityPerUnit = "12 - 100 g pkgs", UnitPrice = 12.50, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Mascarpone Fabioli", QuantityPerUnit = "24 - 200 g pkgs.", UnitPrice = 32.00, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Geitost", QuantityPerUnit = "500 g", UnitPrice = 2.50, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Sasquatch Ale", QuantityPerUnit = "24 - 12 oz bottles", UnitPrice = 14.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Steeleye Stout", QuantityPerUnit = "24 - 12 oz bottles", UnitPrice = 18.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Inlagd Sill", QuantityPerUnit = "24 - 250 g  jars", UnitPrice = 19.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Gravad lax", QuantityPerUnit = "12 - 500 g pkgs.", UnitPrice = 26.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Côte de Blaye", QuantityPerUnit = "12 - 75 cl bottles", UnitPrice = 263.50, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Chartreuse verte", QuantityPerUnit = "750 cc per bottle", UnitPrice = 18.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Boston Crab Meat", QuantityPerUnit = "24 - 4 oz tins", UnitPrice = 18.40, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Jack's New England Clam Chowder", QuantityPerUnit = "12 - 12 oz cans", UnitPrice = 9.65, Discontinued = true, Category = seafood });
            context.Products.Add(new Product { Name = "Singaporean Hokkien Fried Mee", QuantityPerUnit = "32 - 1 kg pkgs.", UnitPrice = 14.00, Discontinued = true, Category = grains });
            context.Products.Add(new Product { Name = "Ipoh Coffee", QuantityPerUnit = "16 - 500 g tins", UnitPrice = 46.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Rogede sild", QuantityPerUnit = "1k pkg.", UnitPrice = 9.50, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Spegesild", QuantityPerUnit = "4 - 450 g glasses", UnitPrice = 12.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Zaanse koeken", QuantityPerUnit = "10 - 4 oz boxes", UnitPrice = 9.50, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Schoggi Schokolade", QuantityPerUnit = "100 - 100 g pieces", UnitPrice = 43.90, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Rössle Sauerkraut", QuantityPerUnit = "25 - 825 g cans", UnitPrice = 45.60, Discontinued = false, Category = produce });
            context.Products.Add(new Product { Name = "Thüringer Rostbratwurst", QuantityPerUnit = "50 bags x 30 sausgs.", UnitPrice = 123.79, Discontinued = true, Category = meat });
            context.Products.Add(new Product { Name = "Chocolade", QuantityPerUnit = "10 pkgs.", UnitPrice = 12.75, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Maxilaku", QuantityPerUnit = "24 - 50 g pkgs.", UnitPrice = 20.00, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Valkoinen suklaa", QuantityPerUnit = "12 - 100 g bars", UnitPrice = 16.25, Discontinued = true, Category = confections });
            context.Products.Add(new Product { Name = "Manjimup Dried Apples", QuantityPerUnit = "50 - 300 g pkgs.", UnitPrice = 53.00, Discontinued = true, Category = produce });
            context.Products.Add(new Product { Name = "Filo Mix", QuantityPerUnit = "16 - 2 kg boxes", UnitPrice = 7.00, Discontinued = false, Category = grains });
            context.Products.Add(new Product { Name = "Gnocchi di nonna Alice", QuantityPerUnit = "24 - 250 g pkgs.", UnitPrice = 38.00, Discontinued = true, Category = grains });
            context.Products.Add(new Product { Name = "Ravioli Angelo", QuantityPerUnit = "24 - 250 g pkgs.", UnitPrice = 19.50, Discontinued = false, Category = grains });
            context.Products.Add(new Product { Name = "Escargots de Bourgogne", QuantityPerUnit = "24 pieces", UnitPrice = 13.25, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Raclette Courdavault", QuantityPerUnit = "5 kg pkg.", UnitPrice = 55.00, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Camembert Pierrot", QuantityPerUnit = "15 - 300 g rounds", UnitPrice = 34.00, Discontinued = true, Category = dairy });
            context.Products.Add(new Product { Name = "Sirop d'érable", QuantityPerUnit = "24 - 500 ml bottles", UnitPrice = 28.50, Discontinued = true, Category = condiments });
            context.Products.Add(new Product { Name = "Tarte au sucre", QuantityPerUnit = "48 pies", UnitPrice = 49.30, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "Vegie-spread", QuantityPerUnit = "15 - 625 g jars", UnitPrice = 43.90, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Wimmers gute Semmelknödel", QuantityPerUnit = "20 bags x 4 pieces", UnitPrice = 33.25, Discontinued = true, Category = grains });
            context.Products.Add(new Product { Name = "Louisiana Fiery Hot Pepper Sauce", QuantityPerUnit = "32 - 8 oz bottles", UnitPrice = 21.05, Discontinued = true, Category = condiments });
            context.Products.Add(new Product { Name = "Louisiana Hot Spiced Okra", QuantityPerUnit = "24 - 8 oz jars", UnitPrice = 17.00, Discontinued = false, Category = condiments });
            context.Products.Add(new Product { Name = "Laughing Lumberjack Lager", QuantityPerUnit = "24 - 12 oz bottles", UnitPrice = 14.00, Discontinued = true, Category = beverages });
            context.Products.Add(new Product { Name = "Scottish Longbreads", QuantityPerUnit = "10 boxes x 8 pieces", UnitPrice = 12.50, Discontinued = false, Category = confections });
            context.Products.Add(new Product { Name = "MyProduct", QuantityPerUnit = "Crate", UnitPrice = 666.00, Discontinued = true, Category = dairy });
            context.Products.Add(new Product { Name = "Outback Lager", QuantityPerUnit = "24 - 355 ml bottles", UnitPrice = 15.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Flotemysost", QuantityPerUnit = "10 - 500 g pkgs.", UnitPrice = 21.50, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Mozzarella di Giovanni", QuantityPerUnit = "24 - 200 g pkgs.", UnitPrice = 34.80, Discontinued = false, Category = dairy });
            context.Products.Add(new Product { Name = "Röd Kaviar", QuantityPerUnit = "24 - 150 g jars", UnitPrice = 15.00, Discontinued = false, Category = seafood });
            context.Products.Add(new Product { Name = "Perth Pasties", QuantityPerUnit = "48 pieces", UnitPrice = 32.80, Discontinued = true, Category = meat });
            context.Products.Add(new Product { Name = "Tourtière", QuantityPerUnit = "16 pies", UnitPrice = 7.45, Discontinued = true, Category = meat });
            context.Products.Add(new Product { Name = "Pâté chinois", QuantityPerUnit = "24 boxes x 2 pies", UnitPrice = 24.00, Discontinued = true, Category = meat });
            context.Products.Add(new Product { Name = "Longlife Tofu", QuantityPerUnit = "5 kg pkg.", UnitPrice = 10.00, Discontinued = false, Category = produce });
            context.Products.Add(new Product { Name = "Rhönbräu Klosterbier", QuantityPerUnit = "24 - 0.5 l bottles", UnitPrice = 7.75, Discontinued = true, Category = beverages });
            context.Products.Add(new Product { Name = "Lakkalikööri", QuantityPerUnit = "500 ml", UnitPrice = 18.00, Discontinued = false, Category = beverages });
            context.Products.Add(new Product { Name = "Original Frankfurter grüne Soße", QuantityPerUnit = "12 boxes", UnitPrice = 13.00, Discontinued = false, Category = condiments });

            context.SaveChanges();
        }
    }
}