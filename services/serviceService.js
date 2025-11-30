const Service = require('../models/Service');

class ServiceService {
  async getAllServices() {
    const services = await Service.find({ isActive: true })
      .sort({ position: 1 })
      .select('-__v')
      .lean();

    return services;
  }

  async createService(data) {
    const service = await Service.create(data);
    return service;
  }

  async updateService(id, data) {
    const service = await Service.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    return service;
  }

  async deleteService(id) {
    await Service.findByIdAndDelete(id);
  }
}

module.exports = new ServiceService();
