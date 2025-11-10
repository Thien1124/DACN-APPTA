const mongoose = require('mongoose');

const userMissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Tạo index cho các trường thường được tìm kiếm
userMissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });
userMissionSchema.index({ userId: 1, isCompleted: 1 });

const UserMission = mongoose.model('UserMission', userMissionSchema);

module.exports = UserMission;