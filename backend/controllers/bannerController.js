import Banner from '../models/Banner.js';

// @desc    Get all banners (public - for home page)
// @route   GET /api/v1/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const { deviceType } = req.query;
    const query = { isActive: true };
    
    if (deviceType) {
      query.deviceType = deviceType;
    }
    
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/v1/admin/banners
// @access  Private (admin only)
export const getAllBanners = async (req, res) => {
  try {
    const { deviceType } = req.query;
    const query = {};
    
    if (deviceType) {
      query.deviceType = deviceType;
    }
    
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new banner
// @route   POST /api/v1/admin/banners
// @access  Private (admin only)
export const createBanner = async (req, res) => {
  try {
    const { image, link, deviceType, isActive, order } = req.body;

    if (!image || !deviceType) {
      return res.status(400).json({ success: false, message: 'Image and device type are required' });
    }

    if (!['mobile', 'desktop'].includes(deviceType)) {
      return res.status(400).json({ success: false, message: 'Device type must be mobile or desktop' });
    }

    const banner = await Banner.create({
      image,
      link: link || '#',
      deviceType,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update a banner
// @route   PUT /api/v1/admin/banners/:id
// @access  Private (admin only)
export const updateBanner = async (req, res) => {
  try {
    const { image, link, deviceType, isActive, order } = req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (deviceType && !['mobile', 'desktop'].includes(deviceType)) {
      return res.status(400).json({ success: false, message: 'Device type must be mobile or desktop' });
    }

    if (image) banner.image = image;
    if (link !== undefined) banner.link = link;
    if (deviceType) banner.deviceType = deviceType;
    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;

    await banner.save();

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/v1/admin/banners/:id
// @access  Private (admin only)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.deleteOne();

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
