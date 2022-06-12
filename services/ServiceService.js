const ServiceModel = require("../models/ServiceModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
const { findOneAndUpdate } = require("../models/ServiceModel");
class ServiceService {
  constructor() { }
  async addService(body) {
    try {
      const service = await ServiceModel.findOne({ nom: body.nom }).lean();
      if (service) throw new AlreadyExistError("Service already exist!");
      const registeredService = new ServiceModel(body);
      //console.log(registeredService)
      await registeredService.save();
      return { service: registeredService };
    } catch (error) {
      console.log(error);
    }
  }
  async addFermeture(body) {
    try {
      const { services, dates } = body;
      const start = new Date(dates[0]);
      const end = new Date(dates[1]);
      const promises = services.map(async (se) => {
        await ServiceModel.findOneAndUpdate(
          { _id: se.serviceId },
          { fermeture: { start: start, end: end } }
        ).lean();
      });
      await Promise.all(promises);
      const servicesAll = await ServiceModel.find({}).lean();
      return servicesAll;
    } catch (error) {
      console.log(error);
    }
  }
  async getAllServices({ status }) {
    try {
      let filterQuery = {}
      if (status == "terminated") {
        filterQuery = {
          ...filterQuery, status: "terminated"
        }
      } else {
        filterQuery = {
          ...filterQuery, status: {$ne : "terminated" }
        }
      }
      const services = await ServiceModel.find(filterQuery).lean();
      return services;
    } catch (error) {
      throw error;
    }
  }
  async removeService({ serviceId }) {
    try {
      let service = await ServiceModel.findOne({ _id: serviceId }).lean();
      if (!service) throw new NotFoundError();
      await ServiceModel.findByIdAndRemove({ _id: serviceId }).lean();
      return { info: "Service removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateService(body, { serviceId }) {
    try {
      const terminatedService = await ServiceModel.findOneAndUpdate(
        { _id: serviceId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      console.log(terminatedService)
      const newService = await ServiceModel.findById(serviceId).lean();
      return newService;
    } catch (error) {
      throw error;
    }
  }
  async changeServiceDisponibility({ serviceId }, { startDate, endDate }) {
    const availablity = {
      availablity: {
        startDate,
        endDate,
      },
    };
    try {
      await ServiceModel.findOneAndUpdate(
        { _id: serviceId },
        {
          $set: availablity,
        },
        { returnOriginal: false }
      ).lean();
      return {
        availablity: `disponibilité : start: ${startDate} -> end: ${endDate}`,
      };
    } catch (error) {
      console.log(error);
      throw err;
    }
  }
  async manageSchedule({ serviceId }, body) {
    try {
      await ServiceModel.findOneAndUpdate(
        { _id: serviceId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      return {
        message: "schedule changed successfully!",
      };
    } catch (error) {
      console.log(error);
      throw err;
    }
  }
}
module.exports = ServiceService;
