import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import AdminLayout from "../layouts/AdminLayout";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../styles/AdminMission.css";

const AdminMission = () => {
  const { toast, showToast, hideToast } = useToast();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "daily",
    requirementType: "lesson_complete",
    requirementCount: 1,
    rewardXP: 0,
    rewardGems: 0,
    rewardHearts: 0,
    isActive: true,
    expiresAt: "",
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const response = await adminService.missions.getAll();
      if (response.success) {
        setMissions(response.missions || []);
      }
    } catch (error) {
      console.error("Error fetching missions:", error);
      showToast("error", "Lỗi", "Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        requirement: {
          type: formData.requirementType,
          count: parseInt(formData.requirementCount),
        },
        rewards: {
          xp: parseInt(formData.rewardXP) || 0,
          gems: parseInt(formData.rewardGems) || 0,
          hearts: parseInt(formData.rewardHearts) || 0,
        },
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || null,
      };

      if (editingMission) {
        // Update existing mission
        const response = await adminService.missions.update(
          editingMission._id,
          payload
        );
        if (response.success) {
          showToast("success", "Thành công", "Cập nhật nhiệm vụ thành công!");
          fetchMissions();
          handleCloseModal();
        }
      } else {
        // Create new mission
        const response = await adminService.missions.create(payload);
        if (response.success) {
          showToast("success", "Thành công", "Tạo nhiệm vụ thành công!");
          fetchMissions();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error("Error saving mission:", error);
      showToast(
        "error",
        "Lỗi",
        error.response?.data?.message || "Không thể lưu nhiệm vụ. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      type: mission.type,
      requirementType: mission.requirement?.type || "lesson_complete",
      requirementCount: mission.requirement?.count || 1,
      rewardXP: mission.rewards?.xp || 0,
      rewardGems: mission.rewards?.gems || 0,
      rewardHearts: mission.rewards?.hearts || 0,
      isActive: mission.isActive,
      expiresAt: mission.expiresAt
        ? new Date(mission.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.missions.delete(id);
      if (response.success) {
        showToast("success", "Thành công", "Xóa nhiệm vụ thành công!");
        fetchMissions();
      }
    } catch (error) {
      console.error("Error deleting mission:", error);
      showToast("error", "Lỗi", "Không thể xóa nhiệm vụ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMission(null);
    setFormData({
      title: "",
      description: "",
      type: "daily",
      requirementType: "lesson_complete",
      requirementCount: 1,
      rewardXP: 0,
      rewardGems: 0,
      rewardHearts: 0,
      isActive: true,
      expiresAt: "",
    });
  };

  const getMissionTypeLabel = (type) => {
    const types = {
      daily: "Hàng ngày",
      weekly: "Hàng tuần",
      achievement: "Thành tích",
    };
    return types[type] || type;
  };

  const getRequirementTypeLabel = (type) => {
    const types = {
      lesson_complete: "Hoàn thành bài học",
      exercise_complete: "Hoàn thành bài tập",
      streak_days: "Chuỗi ngày học",
      xp_earn: "Kiếm điểm XP",
      flashcard_review: "Ôn tập flashcard",
    };
    return types[type] || type;
  };

  return (
    <AdminLayout>
      <div className="admin-mission">
        <div className="admin-mission-header">
          <h1>Quản lý Nhiệm vụ</h1>
          <button
            className="btn-create"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            + Tạo nhiệm vụ mới
          </button>
        </div>

      {loading && <div className="loading">Đang tải...</div>}

      <div className="missions-grid">
        {missions.map((mission) => (
          <div key={mission._id} className="mission-card">
            <div className="mission-header">
              <h3>{mission.title}</h3>
              <span className={`mission-type ${mission.type}`}>
                {getMissionTypeLabel(mission.type)}
              </span>
            </div>

            <p className="mission-description">{mission.description}</p>

            <div className="mission-details">
              <div className="detail-item">
                <strong>Yêu cầu:</strong>
                <span>
                  {getRequirementTypeLabel(mission.requirement?.type)} (
                  {mission.requirement?.count})
                </span>
              </div>

              <div className="detail-item">
                <strong>Phần thưởng:</strong>
                <div className="rewards">
                  {mission.rewards?.xp > 0 && (
                    <span className="reward-badge xp">
                      {mission.rewards.xp} XP
                    </span>
                  )}
                  {mission.rewards?.gems > 0 && (
                    <span className="reward-badge gems">
                      {mission.rewards.gems} 💎
                    </span>
                  )}
                  {mission.rewards?.hearts > 0 && (
                    <span className="reward-badge hearts">
                      {mission.rewards.hearts} ❤️
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <strong>Trạng thái:</strong>
                <span className={mission.isActive ? "active" : "inactive"}>
                  {mission.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </span>
              </div>

              {mission.expiresAt && (
                <div className="detail-item">
                  <strong>Hết hạn:</strong>
                  <span>{new Date(mission.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mission-actions">
              <button
                className="btn-edit"
                onClick={() => handleEdit(mission)}
                disabled={loading}
              >
                Sửa
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(mission._id)}
                disabled={loading}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {missions.length === 0 && !loading && (
        <div className="empty-state">
          <p>Chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ đầu tiên!</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMission ? "Sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mission-form">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Ví dụ: Hoàn thành 5 bài học"
                />
              </div>

              <div className="form-group">
                <label>Mô tả *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Mô tả chi tiết về nhiệm vụ"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại nhiệm vụ *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="achievement">Thành tích</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Loại yêu cầu *</label>
                  <select
                    name="requirementType"
                    value={formData.requirementType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="lesson_complete">Hoàn thành bài học</option>
                    <option value="exercise_complete">Hoàn thành bài tập</option>
                    <option value="streak_days">Chuỗi ngày học</option>
                    <option value="xp_earn">Kiếm điểm XP</option>
                    <option value="flashcard_review">Ôn tập flashcard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Số lượng yêu cầu *</label>
                <input
                  type="number"
                  name="requirementCount"
                  value={formData.requirementCount}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-section">
                <h3>Phần thưởng</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>XP</label>
                    <input
                      type="number"
                      name="rewardXP"
                      value={formData.rewardXP}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Gems 💎</label>
                    <input
                      type="number"
                      name="rewardGems"
                      value={formData.rewardGems}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Hearts ❤️</label>
                    <input
                      type="number"
                      name="rewardHearts"
                      value={formData.rewardHearts}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Ngày hết hạn (tùy chọn)</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Kích hoạt ngay</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Đang xử lý..."
                    : editingMission
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />
      )}
    </AdminLayout>
  );
};

export default AdminMission;
