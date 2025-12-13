const Task = require('../models/Task');

// @desc    Barcha vazifalarni olish
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Bitta vazifani olish
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Yangi vazifa qo'shish
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vazifa qo\'shildi!',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Vazifani yangilash
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Vazifa yangilandi!',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Vazifani o'chirish
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Vazifa o\'chirildi!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Vazifa statusini o'zgartirish (toggle complete)
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: !task.completed },
      { new: true }
    );

    res.json({
      success: true,
      message: task.completed ? 'Vazifa bajarildi!' : 'Vazifa qayta ochildi!',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};
