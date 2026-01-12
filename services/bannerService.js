const Banner = require('../models/Banner');

class BannerService {
  async getAllBanners() {
    const banners = await Banner.find()
    .sort({ createdAt: -1 })
    .select('-__v')
    .lean();

    return banners;
  }

  async getHeroBanners() {
    const banners = await Banner.find({
      type: 'hero'
    })
    .sort({ order: 1 })
    .select('-__v')
    .lean();

    return banners;
  }

  async getPromoBanners() {
    const banners = await Banner.find({
      type: 'promo',
      isActive: true
    })
    .sort({ order: 1 })
    .select('-__v')
    .lean();

    return banners;
  }

  async createBanner(data) {
    const banner = await Banner.create(data);
    return banner;
  }

  async updateBanner(id, data) {
  
    const banner = await Banner.findByIdAndUpdate(
      id,
      {$set: data},
      { new: true, runValidators: true }
    );
    return banner;
  }

  async deleteBanner(id) {
    await Banner.findByIdAndDelete(id);
  }
}

module.exports = new BannerService();
