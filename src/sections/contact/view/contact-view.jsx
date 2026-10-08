import { useState } from 'react';

import { m } from 'framer-motion';
import {
  Box,
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
import { useSubmitSupportRequestMutation } from 'src/store/Reducer/contact-support-api';

import { brand } from 'src/sections/home/landing/theme';
import PageHero from 'src/sections/home/landing/PageHero';

const CONTACT_INFO = [
  { icon: 'mingcute:mail-line', label: 'General', value: 'hello@upnext.app' },
  { icon: 'mingcute:headphone-line', label: 'Support', value: 'support@upnext.app' },
  { icon: 'mingcute:scissors-line', label: 'Providers', value: 'providers@upnext.app' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactView() {
  const theme = useTheme();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitSupportRequest, { isLoading: isSubmitting }] = useSubmitSupportRequestMutation();

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
      await submitSupportRequest(form).unwrap();
      toast.success('Your message has been sent. We will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send your message. Please try again.');
    }
  };

  return (
    <Box sx={{ pt: { xs: '64px', md: '66px' }, minHeight: '70vh', bgcolor: 'background.paper' }}>
      <Box>
        {/* Hero */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inDown}>
            <PageHero
              eyebrow="Contact"
              title="Contact Us"
              subtitle="Have a question or want to get in touch? Fill in the form and we will get back to you shortly."
            />
          </m.div>
        </Box>

        {/* Form + contact info */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Box sx={{ px: { xs: 2.5, sm: 5, md: 6, lg: 8 }, py: { xs: 6, md: 10 } }}>
            <Grid container spacing={{ xs: 5, md: 6, lg: 8 }} alignItems="flex-start">
              {/* Form */}
              <Grid item xs={12} md={7} lg={8}>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    py: { md: 1 },
                    '& .MuiOutlinedInput-root': { bgcolor: '#fff', transition: 'box-shadow 0.2s ease' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '1.5px',
                      borderColor: 'rgba(145,158,171,0.24)',
                      transition: 'border-color 0.2s ease',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand.green[400] },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '1.5px',
                      borderColor: brand.green[400],
                    },
                    '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: `0 6px 20px ${alpha(brand.green[400], 0.2)}` },
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.75rem', lg: '1.75rem' } }}>
                    Send us a message
                  </Typography>
                  <Box sx={{ width: 48, height: '1px', mb: { xs: 3, md: 4 }, bgcolor: alpha(brand.green[400], 0.6) }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                        Full Name
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange('name')}
                        sx={{ borderRadius: 2, fontSize: '0.95rem' }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                        Email Address
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange('email')}
                        sx={{ borderRadius: 2, fontSize: '0.95rem' }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                        Subject
                      </InputLabel>
                      <OutlinedInput
                        fullWidth
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        sx={{ borderRadius: 2, fontSize: '0.95rem' }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>
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
                          '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.95rem' },
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
                          px: 4.5,
                          py: 1.6,
                          borderRadius: 50,
                          bgcolor: brand.green[400],
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          boxShadow: `0 8px 20px ${alpha(brand.green[400], 0.35)}`,
                          '&:hover': { bgcolor: brand.green[600], boxShadow: `0 10px 24px ${alpha(brand.green[600], 0.35)}` },
                        }}
                      >
                        Send Message
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Contact info sidebar */}
              <Grid item xs={12} md={5} lg={4}>
                <Box
                  sx={{
                    height: 1,
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 3,
                    background: `linear-gradient(160deg, ${brand.green[50]} 0%, ${brand.green[100]} 100%)`,
                    border: `1px solid ${alpha(brand.green[400], 0.2)}`,
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.75rem', lg: '1.75rem' } }}>
                    Reach us directly
                  </Typography>
                  <Box sx={{ width: 48, height: '1px', mb: { xs: 3, md: 4 }, bgcolor: alpha(brand.green[400], 0.6) }} />

                  <Stack spacing={3}>
                    {CONTACT_INFO.map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            border: `1px solid ${alpha(brand.green[400], 0.3)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={item.icon} width={22} sx={{ color: brand.green[600] }} />
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              mb: 0.25,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            component="a"
                            href={`mailto:${item.value}`}
                            sx={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              textDecoration: 'none',
                              '&:hover': { color: brand.green[600], textDecoration: 'underline', textUnderlineOffset: 3 },
                            }}
                          >
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
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(brand.green[400], 0.2)}`,
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: '1.15rem', sm: '1.15rem', md: '1.15rem', lg: '1.2rem' } }}>
                      Response time
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, lineHeight: 1.8, fontSize: '0.92rem' }}>
                      We typically respond within 24 hours on business days. For urgent issues, include &ldquo;Urgent&rdquo; in your subject line.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            </Box>
          </m.div>
        </Box>
      </Box>
    </Box>
  );
}
