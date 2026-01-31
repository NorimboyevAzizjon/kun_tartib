const RecurringTask = require('../models/RecurringTask');
const Task = require('../models/Task');

// @desc    Barcha takrorlanuvchi vazifalarni olish
// @route   GET /api/recurring
// @access  Private
exports.getRecurringTasks = async (req, res) => {
  try {
    const recurringTasks = await RecurringTask.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: recurringTasks.length,
      data: recurringTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Bitta takrorlanuvchi vazifani olish
// @route   GET /api/recurring/:id
// @access  Private
exports.getRecurringTask = async (req, res) => {
  try {
    const recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Takrorlanuvchi vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (recurringTask.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    res.json({
      success: true,
      data: recurringTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Yangi takrorlanuvchi vazifa qo'shish
// @route   POST /api/recurring
// @access  Private
exports.createRecurringTask = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const recurringTask = await RecurringTask.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Takrorlanuvchi vazifa qo\'shildi!',
      data: recurringTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Takrorlanuvchi vazifani yangilash
// @route   PUT /api/recurring/:id
// @access  Private
exports.updateRecurringTask = async (req, res) => {
  try {
    let recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Takrorlanuvchi vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (recurringTask.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    recurringTask = await RecurringTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Takrorlanuvchi vazifa yangilandi!',
      data: recurringTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Takrorlanuvchi vazifani o'chirish
// @route   DELETE /api/recurring/:id
// @access  Private
exports.deleteRecurringTask = async (req, res) => {
  try {
    const recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Takrorlanuvchi vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (recurringTask.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    await recurringTask.deleteOne();

    res.json({
      success: true,
      message: 'Takrorlanuvchi vazifa o\'chirildi!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Takrorlanuvchi vazifani faollashtirish/o'chirish
// @route   PATCH /api/recurring/:id/toggle
// @access  Private
exports.toggleRecurringTask = async (req, res) => {
  try {
    let recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({
        success: false,
        message: 'Takrorlanuvchi vazifa topilmadi'
      });
    }

    // Foydalanuvchi tekshiruvi
    if (recurringTask.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    recurringTask.isActive = !recurringTask.isActive;
    await recurringTask.save();

    res.json({
      success: true,
      message: recurringTask.isActive ? 'Vazifa faollashtirildi!' : 'Vazifa to\'xtatildi!',
      data: recurringTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Bugungi takrorlanuvchi vazifalarni yaratish
// @route   POST /api/recurring/generate
// @access  Private
exports.generateTodaysTasks = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const dateStr = today.toISOString().split('T')[0];

    // Faol takrorlanuvchi vazifalarni olish
    const recurringTasks = await RecurringTask.find({ 
      user: req.user.id,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: today } }
      ]
    });

    const generatedTasks = [];

    for (const recurring of recurringTasks) {
      let shouldGenerate = false;

      switch (recurring.recurrence) {
        case 'daily':
          shouldGenerate = true;
          break;
        case 'weekly':
          shouldGenerate = recurring.daysOfWeek && recurring.daysOfWeek.includes(dayOfWeek);
          break;
        case 'monthly':
          shouldGenerate = recurring.dayOfMonth === dayOfMonth;
          break;
        case 'yearly':
          // Check if today matches the start date's month and day
          const startDate = new Date(recurring.createdAt);
          shouldGenerate = startDate.getMonth() === today.getMonth() && 
                          startDate.getDate() === today.getDate();
          break;
      }

      if (shouldGenerate) {
        // Bu kun uchun allaqachon yaratilganmi tekshirish
        const existingTask = await Task.findOne({
          user: req.user.id,
          recurringId: recurring._id.toString(),
          date: dateStr
        });

        if (!existingTask) {
          const newTask = await Task.create({
            user: req.user.id,
            title: recurring.title,
            category: recurring.category,
            priority: recurring.priority,
            time: recurring.time,
            date: dateStr,
            recurringId: recurring._id.toString(),
            completed: false
          });
          generatedTasks.push(newTask);
        }
      }
    }

    res.json({
      success: true,
      message: `${generatedTasks.length} ta vazifa yaratildi`,
      data: generatedTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};
