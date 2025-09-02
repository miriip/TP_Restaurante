using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum OrderPrice
    {
        ASC,
        DESC
    }
}
