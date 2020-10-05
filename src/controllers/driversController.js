import response from "../helpers/response";
import Queries from "../services/Queries";
import Distance from "geo-distance";
import db from "../database/models/index";
import Decode from "../helpers/addressDecoder";
import Service from "../services/index";

class DriversController {
  static async getDrivers(req, res) {
    try {
      const drivers = await Service.GetUser({role: 'driver'});
      if (drivers) {
        return response.success(res, "List of Drivers", 200, drivers);
      }
      return response.error(res, "No Driver found", 404);
    } catch (e) {
      return response.error(res, e.message, 500);
    }
  }
  static async getAvailableDrivers(req, res) {
    try {
      const drivers = await Queries.findAll(db.user, {
        role: "driver",
        status: "available",
      });
      if (drivers) {
        return response.success(res, "List of available Drivers", 200, drivers);
      }
      return response.error(res, "No Available Driver", 404);
    } catch (e) {
      return response.error(res, e.message, 500);
    }
  }
  static async getDriversWithinLocation(req, res) {
    try {
      const { locationId } = req.params;
      const decodeLocation = await Queries.findOneRecord(db.location, {
        id: locationId,
      });
      const locationCoordinate = {
        lat: decodeLocation.latitude,
        lon: decodeLocation.longitude,
      };
      const drivers = await Queries.findAll(db.user, {
        role: "driver",
        status: "available",
      });
      if (drivers) {
        const availableDrivers = drivers.map(async (driver) => {
          let closerDriver = [];
          const driverLocation = await Queries.findOneRecord(db.location, {
            id: driver.locationId,
          });
          const cordinate = {
            lat: driverLocation.latitude,
            lon: driverLocation.longitude,
          };
          const myLoToDriverLo = Distance.between(locationCoordinate, cordinate);
          if (myLoToDriverLo < Distance("3 km")) {
            closerDriver.push(driver.dataValues);
          }
          if (availableDrivers) {
            return response.success(
              res,
              "List of available Drivers",
              200,
              closerDriver
            );
          } else {
            return response.error(
              res,
              "No Available Driver Within that location",
              404
            );
          }
        });
        console.log(availableDrivers);
      }
      return response.error(res, "No Available Driver", 404);
    } catch (e) {
      return response.error(res, e.message, 500);
    }
  }
  static async getSpecificDrivers(req, res) {
    try {
      const { driverId } = req.params;
      const driver = await Queries.findOneRecord(db.user, {
        role: "driver",
        id: driverId,
      });
      if (driver.count > 0) {
        return response.success(res, "Driver Information", 200, driver);
      }
      return response.error(res, "that specific driver is not available", 404);
    } catch (e) {
      return response.error(res, e.message, 500);
    }
  }
}

export default DriversController;
