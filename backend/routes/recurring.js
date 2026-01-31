const express = require('express');
const router = express.Router();
const { 
  getRecurringTasks, 
  getRecurringTask, 
  createRecurringTask, 
  updateRecurringTask, 
  deleteRecurringTask,
  toggleRecurringTask,
  generateTodaysTasks
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

// Barcha routelar himoyalangan
router.use(protect);

// Generate today's tasks from recurring
router.post('/generate', generateTodaysTasks);

router.route('/')
  .get(getRecurringTasks)
  .post(createRecurringTask);

router.route('/:id')
  .get(getRecurringTask)
  .put(updateRecurringTask)
  .delete(deleteRecurringTask);

router.patch('/:id/toggle', toggleRecurringTask);

module.exports = router;
