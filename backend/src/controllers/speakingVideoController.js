const SpeakingVideo = require('../models/SpeakingVideo');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService');
const path = require('path');
const fs = require('fs');

/**
 * Admin: Tạo video speaking mới
 * POST /api/speaking-videos
 */
const createSpeakingVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, transcript, duration, level, category, thumbnailUrl, order } = req.body;

    // Validation
    if (!title || !videoUrl || !transcript) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: title, videoUrl, transcript'
      });
    }

    const video = await SpeakingVideo.create({
      title,
      description,
      videoUrl,
      transcript: transcript.trim(),
      duration: duration || 0,
      level: level || 'beginner',
      category: category || 'general',
      thumbnailUrl: thumbnailUrl || '',
      order: order || 0,
      uploadedBy: req.user._id
    });

    await logAudit({
      userId: req.user._id,
      action: 'CREATE_SPEAKING_VIDEO',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: { videoId: video._id, title }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo video speaking thành công',
      data: { video }
    });
  } catch (error) {
    console.error('[ERROR] Create speaking video:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo video'
    });
  }
};

/**
 * Admin: Lấy tất cả video speaking
 * GET /api/speaking-videos/admin
 */
const getAllVideosForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, category, search } = req.query;

    const filter = {};
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { transcript: { $regex: search, $options: 'i' } }
      ];
    }

    const videos = await SpeakingVideo.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpeakingVideo.countDocuments(filter);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get videos for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách video'
    });
  }
};

/**
 * User: Lấy danh sách video speaking (chỉ active)
 * GET /api/speaking-videos
 */
const getAllVideosForUser = async (req, res) => {
  try {
    const { level, category, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (level) filter.level = level;
    if (category) filter.category = category;

    const videos = await SpeakingVideo.find(filter)
      .select('-transcript') // Không trả transcript khi list
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpeakingVideo.countDocuments(filter);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get videos for user:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách video'
    });
  }
};

/**
 * User: Lấy chi tiết video speaking (có transcript)
 * GET /api/speaking-videos/:id
 */
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await SpeakingVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    if (!video.isActive && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Video này không khả dụng'
      });
    }

    // Lấy lịch sử attempt của user
    const attempts = await SpeakingAttempt.find({
      user: req.user._id,
      video: id,
      status: 'completed'
    })
      .select('overallScore accuracyScore pronunciationScore fluencyScore createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        video,
        userAttempts: attempts
      }
    });
  } catch (error) {
    console.error('[ERROR] Get video by id:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy video'
    });
  }
};

/**
 * Admin: Cập nhật video
 * PUT /api/speaking-videos/:id
 */
const updateSpeakingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const video = await SpeakingVideo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    await logAudit({
      userId: req.user._id,
      action: 'UPDATE_SPEAKING_VIDEO',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: { videoId: video._id, title: video.title }
    });

    res.json({
      success: true,
      message: 'Cập nhật video thành công',
      data: { video }
    });
  } catch (error) {
    console.error('[ERROR] Update video:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật video'
    });
  }
};

/**
 * Admin: Xóa video
 * DELETE /api/speaking-videos/:id
 */
const deleteSpeakingVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await SpeakingVideo.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Xóa tất cả attempts liên quan
    await SpeakingAttempt.deleteMany({ video: id });

    await logAudit({
      userId: req.user._id,
      action: 'DELETE_SPEAKING_VIDEO',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: { videoId: id, title: video.title }
    });

    res.json({
      success: true,
      message: 'Xóa video thành công'
    });
  } catch (error) {
    console.error('[ERROR] Delete video:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa video'
    });
  }
};

/**
 * User: Lấy lịch sử attempts
 * GET /api/speaking-videos/:id/attempts
 */
const getUserAttempts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const attempts = await SpeakingAttempt.find({
      user: req.user._id,
      video: id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpeakingAttempt.countDocuments({
      user: req.user._id,
      video: id,
      status: 'completed'
    });

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy lịch sử'
    });
  }
};

module.exports = {
  createSpeakingVideo,
  getAllVideosForAdmin,
  getAllVideosForUser,
  getVideoById,
  updateSpeakingVideo,
  deleteSpeakingVideo,
  getUserAttempts
};
