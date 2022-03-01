import React from 'react';
import '@assets/css/app.css';
import MyChart from './MyChart';

const mapData = [
  {
    "shipment":"天津市",
    "shipmentCoordinate":[117.200983,39.084158],
    "destination":"上海市",
    "destinationCoordinate":[121.473701,31.230416],
    "unitCarbonEmission":0.0005,
    "totalCarbonEmission":1000.6000,
    "totalTruckSize":2,
    "totalKilometres":2300.0000,
    "carSizeData":[["0~0.25",0],["0.25~0.50",2],["0.50~0.75",0],["0.75~1",0]]
  },
  {
    "shipment":"天津市",
    "shipmentCoordinate":[117.200983,39.084158],
    "destination":"北京市",
    "destinationCoordinate":[116.407526,39.90403],
    "unitCarbonEmission":0.0007,
    "totalCarbonEmission":1000.3200,
    "totalTruckSize":2,
    "totalKilometres":360.0000,
    "carSizeData":[["0~0.25",0],["0.25~0.50",1],["0.50~0.75",0],["0.75~1",1]]
   },
   {
     "shipment":"天津市",
     "shipmentCoordinate":[117.200983,39.084158],
     "destination":"太仓市",
     "destinationCoordinate":[121.13055,31.457735],
     "unitCarbonEmission":0.0008,
     "totalCarbonEmission":1872.3000,
     "totalTruckSize":1,
     "totalKilometres":1100.0000,
     "carSizeData":[["0~0.25",0],["0.25~0.50",0],["0.50~0.75",0],["0.75~1",1]]
   },
   { 
     "shipment":"天津市",
     "shipmentCoordinate":[117.200983,39.084158],
     "destination":"常熟市",
     "destinationCoordinate":[120.752481,31.654376],
     "unitCarbonEmission":0.0005,
     "totalCarbonEmission":502.0000,
     "totalTruckSize":1,
     "totalKilometres":1000.0000,
     "carSizeData":[["0~0.25",0],["0.25~0.50",1],["0.50~0.75",0],["0.75~1",0]]
   },
   {
     "shipment":"天津市",
     "shipmentCoordinate":[117.200983,39.084158],
     "destination":"杭州市",
     "destinationCoordinate":[120.15507,30.274084],
     "unitCarbonEmission":0.0010,
     "totalCarbonEmission":1154.0000,
     "totalTruckSize":3,
     "totalKilometres":3900.0000,
     "carSizeData":[["0~0.5",1],["0.5~1.0",0],["1.0~1.5",2],["1.5~2",0]]
   },
   {
     "shipment":"天津市",
     "shipmentCoordinate":[117.200983,39.084158],
     "destination":"湖州市",
     "destinationCoordinate":[120.086823,30.894348],
     "unitCarbonEmission":0.0005,
     "totalCarbonEmission":1577.3000,
     "totalTruckSize":1,
     "totalKilometres":1150.0000,
     "carSizeData":[["0~0.25",0],["0.25~0.50",1],["0.50~0.75",0],["0.75~1",0]]
   },
   {
     "shipment":"天津市",
     "shipmentCoordinate":[117.200983,39.084158],
     "destination":"廊坊市",
     "destinationCoordinate":[116.683752,39.538047],
     "unitCarbonEmission":0.0009,
     "totalCarbonEmission":1147.9200,
     "totalTruckSize":11,
     "totalKilometres":1320.0000,
     "carSizeData":[["0~0.5",2],["0.5~1.0",6],["1.0~1.5",3],["1.5~2",0]]
   },
 ];
const App = () => {
  return (
    <div>
      <MyChart datas={mapData} />
    </div>
  )
}

export default App;

