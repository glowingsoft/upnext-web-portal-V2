import dayjs from 'dayjs';

export const mockTasks = [
  {
    name: "Review Jake's check-in photos",
    description: 'Review and provide feedback on Jake’s weekly check-in photos.',
    date: dayjs().format('YYYY-MM-DD'),
    priority: 'high',
    status: 'incomplete',
  },
  {
    name: 'Update client progress',
    description: 'Update the progress for all active clients in the dashboard.',
    date: dayjs().format('YYYY-MM-DD'),
    priority: 'medium',
    status: 'incomplete',
  },
  {
    name: 'Send invoice to Sarah',
    description: 'Prepare and send the monthly invoice to Sarah.',
    date: dayjs().format('YYYY-MM-DD'),
    priority: 'low',
    status: 'completed',
  },
];
