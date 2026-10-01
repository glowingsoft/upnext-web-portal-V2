import { Box, Button, Chip, CircularProgress, Fab, IconButton, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import TaskModal from './components/TaskModal';
import { mockTasks } from './mocks/mock-data';
import { DashboardContent } from 'src/layouts/dashboard';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: 'incomplete', label: 'In Complete' },
  { value: 'completed', label: 'Completed' },
];

const TasksView = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tasks, setTasks] = useState(mockTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequest = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t !== taskToDelete));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      setIsDeleting(false);
      // If the deleted task was being edited, close modal
      if (editTask && editTask === taskToDelete) {
        setModalOpen(false);
        setEditTask(null);
      }
    }, 500);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleAddClick = () => {
    setEditTask(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditClick = (task) => {
    setEditTask(task);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (data) => {
    if (modalMode === 'edit' && editTask) {
      setTasks((prev) => prev.map((t) => (t === editTask ? { ...t, ...data } : t)));
    } else {
      setTasks((prev) => [...prev, { ...data, status: 'incomplete' }]);
    }
  };

  const handleStatusToggle = (task) => {
    setTasks((prev) => prev.map((t) => (t === task ? { ...t, status: t.status === 'completed' ? 'incomplete' : 'completed' } : t)));
  };

  // Filter tasks by selected date
  const filteredTasks = tasks.filter((t) => dayjs(t.date).format('YYYY-MM-DD') === selectedDate);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading="Tasks" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Tasks' }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Stack spacing={2}>
        <Box sx={{ maxWidth: 320 }}>
          <DatePicker
            label="Select Date"
            value={dayjs(selectedDate)}
            onChange={(val) => setSelectedDate(dayjs(val).format('YYYY-MM-DD'))}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        <Stack spacing={2}>
          {filteredTasks.length === 0 && (
            <Typography color="text.secondary" align="center">
              No tasks for this date.
            </Typography>
          )}
          {filteredTasks.map((task, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                gap: 2,
              }}
            >
              <IconButton onClick={() => handleStatusToggle(task)} color={task.status === 'completed' ? 'success' : 'default'}>
                {task.status === 'completed' ? <Iconify icon="eva:checkmark-circle-2-fill" width={28} /> : <Iconify icon="eva:radio-button-off-outline" width={28} />}
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                  {task.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {task.description}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <Chip
                    label={PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label + ' Priority'}
                    color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                    size="small"
                  />
                  <Chip label={STATUS_OPTIONS.find((s) => s.value === task.status)?.label} color={task.status === 'completed' ? 'success' : 'default'} size="small" />
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', gap: 0 }}>
                <IconButton onClick={() => handleEditClick(task)} color="primary">
                  <Iconify icon="solar:pen-bold" width={22} />
                </IconButton>
                <IconButton onClick={() => handleDeleteRequest(task)} color="error">
                  <Iconify icon="solar:trash-bin-trash-bold" width={22} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1201,
          boxShadow: 3,
        }}
      >
        <Iconify icon="eva:plus-fill" width={28} />
      </Fab>

      <TaskModal open={modalOpen} onClose={handleModalClose} onSubmit={handleModalSubmit} onDelete={() => handleDeleteRequest(editTask)} initialData={editTask} mode={modalMode} />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        title="Delete Task"
        content={<>Are you sure you want to delete this task? This action cannot be undone.</>}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </DashboardContent>
  );
};

export default TasksView;
