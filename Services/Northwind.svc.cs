using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Objects;
using System.Data.Services;
using System.Data.Services.Common;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;

namespace Northwind
{
    public class NorthwindService : DataService<ObjectContext>
    {
        public static void InitializeService(DataServiceConfiguration config)
        {
            config.SetEntitySetAccessRule("*", EntitySetRights.All);
            config.SetServiceOperationAccessRule("*", ServiceOperationRights.All);
            config.DataServiceBehavior.MaxProtocolVersion = DataServiceProtocolVersion.V3;
            config.UseVerboseErrors = true;
        }

        protected override ObjectContext CreateDataSource()
        {
            var northwind = new NorthwindContext();
            var context = ((IObjectContextAdapter)northwind).ObjectContext;
            context.ContextOptions.ProxyCreationEnabled = false;
            return context;
        }
    }
}
