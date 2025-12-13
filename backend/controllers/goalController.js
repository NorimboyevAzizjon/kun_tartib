const Goal = require('../models/Goal');

// @desc    Barcha maqsadlarni olish
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Yangi maqsad qo'shish
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const goal = await Goal.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Maqsad qo\'shildi!',
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Maqsadni yangilash
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Maqsad yangilandi!',
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Maqsadni o'chirish
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Maqsad o\'chirildi!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};
