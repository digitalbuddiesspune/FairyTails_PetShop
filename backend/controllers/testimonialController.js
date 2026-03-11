import Testimonial from '../models/Testimonial.js';

// @desc    Get all active testimonials (public - for home page)
// @route   GET /api/v1/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all testimonials (admin)
// @route   GET /api/v1/admin/testimonials
// @access  Private (admin only)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({})
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new testimonial
// @route   POST /api/v1/admin/testimonials
// @access  Private (admin only)
export const createTestimonial = async (req, res) => {
  try {
    const { name, comment, rating, isActive, order } = req.body;

    if (!name || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'Name, comment, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const testimonial = await Testimonial.create({
      name,
      comment,
      rating: parseInt(rating),
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/v1/admin/testimonials/:id
// @access  Private (admin only)
export const updateTestimonial = async (req, res) => {
  try {
    const { name, comment, rating, isActive, order } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (name) testimonial.name = name;
    if (comment) testimonial.comment = comment;
    if (rating !== undefined) testimonial.rating = parseInt(rating);
    if (isActive !== undefined) testimonial.isActive = isActive;
    if (order !== undefined) testimonial.order = order;

    await testimonial.save();

    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/v1/admin/testimonials/:id
// @access  Private (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    await testimonial.deleteOne();

    res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
