import { Box, Card, Divider, Stack, Typography } from '@mui/material';

const reviewStats = {
  average: 4.9,
  total: 134,
  breakdown: { 5: 115, 4: 14, 3: 4, 2: 1, 1: 0 },
};

const reviews = [
  {
    id: 'r1',
    reviewer: 'Jake D.',
    rating: 5,
    comment: 'Marcus is exceptional. Won my first show 12 weeks into working with him. His nutrition approach is science-based and his communication is always prompt.',
    date: '2026-05-15',
  },
  {
    id: 'r2',
    reviewer: 'Emily S.',
    rating: 5,
    comment: 'Great experience! Marcus helped me break my bench press plateau. Highly recommend for anyone serious about results.',
    date: '2026-05-10',
  },
  {
    id: 'r3',
    reviewer: 'Chris P.',
    rating: 4,
    comment: 'Very knowledgeable and supportive. Sometimes strict, but it works!',
    date: '2026-04-22',
  },
];

export default function ClientReviewTab() {
  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            {reviewStats.average}
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFD600', fontWeight: 700 }}>
            ★
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({reviewStats.total} reviews)
          </Typography>
        </Stack>
        <Box sx={{ mt: 1 }}>
          {Object.entries(reviewStats.breakdown)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([star, count]) => (
              <Stack key={star} direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ width: 16 }}>
                  {star}
                </Typography>
                <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8, mx: 1 }}>
                  <Box sx={{ width: `${(count / reviewStats.total) * 100}%`, height: 8, bgcolor: 'primary.main', borderRadius: 1 }} />
                </Box>
                <Typography variant="body2">{count}</Typography>
              </Stack>
            ))}
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2}>
        {reviews.map((item) => (
          <Box key={item.id}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2">{item.reviewer}</Typography>
              <Typography variant="body2" sx={{ color: '#FFD600', fontWeight: 700 }}>
                {'★'.repeat(Math.max(0, Math.min(5, Math.round(item.rating) || 0)))}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {item.comment}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.date).toLocaleDateString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

