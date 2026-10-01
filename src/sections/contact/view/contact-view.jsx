import { useState } from 'react';
import { useSelector } from 'react-redux';

import { m } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { selectUser } from 'src/store/slices/userSlice';
import { useSubmitContactUsMutation, useSubmitSupportRequestMutation } from 'src/store/Reducer/contact-support-api';

import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

const CONTACT_INFO = [
  { icon: 'mingcute:mail-line', label: 'General', value: 'hello@upnext.app' },
  { icon: 'mingcute:headphone-line', label: 'Support', value: 'support@upnext.app' },
  { icon: 'mingcute:scissors-line', label: 'Providers', value: 'providers@upnext.app' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactView() {
  const theme = useTheme();
  const user = useSelector(selectUser);
  const isSignedIn = Boolean(user?.token);

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitContactUs, { isLoading: isSubmittingContactUs }] = useSubmitContactUsMutation();
  const [submitSupportRequest, { isLoading: isSubmittingSupportRequest }] = useSubmitSupportRequestMutation();
  const isSubmitting = isSubmittingContactUs || isSubmittingSupportRequest;

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      if (isSignedIn) {
        await submitContactUs(form).unwrap();
      } else {
        await submitSupportRequest(form).unwrap();
      }
      toast.success('Your message has been sent. We will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send your message. Please try again.');
    }
  };

  return (
    <Container maxWidth={false} sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
      <SurfaceCard
        sx={{
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(4px)',
          overflow: 'hidden',
        }}
      >
        {/* Hero */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inDown}>
            <Box
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                py: { xs: 4, md: 6 },
                background: `linear-gradient(145deg, ${brand.ink[900]} 0%, ${brand.green[900]} 52%, ${brand.green[800]} 100%)`,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                }}
              >
                Contact Us
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mt: 1.5, maxWidth: 700 }}>
                Have a question or want to get in touch? Fill in the form and we will get back to you shortly.
              </Typography>
            </Box>
          </m.div>
        </Box>

        {/* Form + contact info */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Grid container>
              {/* Form */}
              <Grid item xs={12} md={7}>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <InputLabel sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
                        Full Name
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange('name')}
                        sx={{ borderRadius: 2, fontSize: '0.875rem' }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <InputLabel sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
                        Email Address
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange('email')}
                        sx={{ borderRadius: 2, fontSize: '0.875rem' }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <InputLabel sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
                        Subject
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        sx={{ borderRadius: 2, fontSize: '0.875rem' }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <InputLabel sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
                        Message
                      </InputLabel>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        placeholder="Tell us more..."
                        value={form.message}
                        onChange={handleChange('message')}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        size="large"
                        loading={isSubmitting}
                        endIcon={<Iconify icon="mingcute:send-fill" width={18} />}
                        sx={{
                          px: 4,
                          borderRadius: 50,
                          bgcolor: brand.green[400],
                          fontWeight: 700,
                          '&:hover': { bgcolor: brand.green[600] },
                        }}
                      >
                        Send Message
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Contact info sidebar */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  borderLeft: { md: `1px solid ${theme.palette.divider}` },
                  borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                }}
              >
                <Box sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Reach us directly
                  </Typography>

                  <Stack spacing={3}>
                    {CONTACT_INFO.map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(brand.green[400], 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={item.icon} width={20} sx={{ color: brand.green[400] }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 600, display: 'block', mb: 0.25 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      mt: 5,
                      p: 3,
                      borderRadius: 2.5,
                      background: `linear-gradient(135deg, ${alpha(brand.ink[900], 0.05)} 0%, ${alpha(brand.green[400], 0.08)} 100%)`,
                      border: `1px solid ${alpha(brand.green[400], 0.15)}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                      Response time
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}>
                      We typically respond within 24 hours on business days. For urgent issues, include &ldquo;Urgent&rdquo; in your subject line.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </m.div>
        </Box>
      </SurfaceCard>
    </Container>
  );
}
