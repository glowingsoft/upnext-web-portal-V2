import { Fragment } from 'react';
import { Box, Button, Card, Chip, Divider, Grid, Rating, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { varAlpha } from 'src/theme/styles';
import { useGetReviewsQuery } from 'src/store/Reducer/services-api';
import { useGetBusinessReviewsQuery, useGetBusinessReviewsPublicQuery } from 'src/store/Reducer/businesses-api';
import { normalizeReviewStats } from 'src/utils/reviews';
import { formatSlotTime12h } from 'src/utils/schedule-format';
import ServiceCard from '../../services-view/components/service-card-main';

const PROVIDER_OVERVIEW_CREAM = '#fff3d8';
const PROVIDER_OVERVIEW_ACCENT = '#b79a73';

function normalizeOverviewService(item) {
  const durationMins = item.durationMins ?? item.sessionSlotMins;
  return {
    ...item,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    reviewCount: item.reviewCount ?? item.totalReviews ?? 0,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  };
}

function StatCard({ icon, label, value }) {
  return (
    <Box
      sx={{
        px: 2.75,
        py: 2.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
        height: '100%',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.32),
          boxShadow: (theme) => `0 10px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Iconify icon={icon} width={20} sx={{ color: PROVIDER_OVERVIEW_ACCENT, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: PROVIDER_OVERVIEW_ACCENT, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.4 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ color: 'text.primary', pl: 3, fontWeight: 800 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

function CategoryStatCard({ icon, label, categories }) {
  return (
    <Box
      sx={{
        px: 2.75,
        py: 2.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
        height: '100%',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.32),
          boxShadow: (theme) => `0 10px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Iconify icon={icon} width={20} sx={{ color: PROVIDER_OVERVIEW_ACCENT, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: PROVIDER_OVERVIEW_ACCENT, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.4 }}>
          {label}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ pl: 3, gap: 0.75 }}>
        {categories.map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            clickable
            sx={{
              height: 22, fontSize: 11, fontWeight: 700, borderRadius: 999,
              bgcolor: PROVIDER_OVERVIEW_CREAM, border: '1px solid',
              borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35),
              color: 'text.primary', transition: 'all 0.18s ease',
              '& .MuiChip-label': { px: 1 },
              '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function StarRating({ rating }) {
  return <Rating value={Number(rating) || 0} precision={0.5} readOnly size="small" />;
}

export default function ProviderOverviewTab({ provider, onShowAllServices, isPublicView = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state) => state.user);
  const { t } = useTranslate();
  const isAdmin = user?.user?.accountState?.userType === 'admin';
  const isAdminRoute = pathname.includes('/admin-dashboard');

  const previewServices = (provider.services || []).map(normalizeOverviewService);
  const totalServices = previewServices.length;

  // The business-overview endpoint only returns { avgRating, totalReviews } — no star-by-star
  // breakdown — so the rating bars below need their own request to the reviews-stats endpoint,
  // same as the Reviews tab, rather than reading a breakdown field that isn't in this response.
  const reviewsTargetId = provider.businessProfileId || provider.profileId || provider.business?._id || provider._id;
  const genericStatsResult = useGetReviewsQuery(
    { scope: 'business', targetId: reviewsTargetId, page: 1, limit: 1 },
    { skip: !reviewsTargetId || isAdminRoute || isPublicView }
  );
  const adminStatsResult = useGetBusinessReviewsQuery(
    { businessId: reviewsTargetId, page: 1, limit: 1 },
    { skip: !reviewsTargetId || !isAdminRoute }
  );
  const publicStatsResult = useGetBusinessReviewsPublicQuery(
    { businessId: reviewsTargetId, page: 1, limit: 1 },
    { skip: !reviewsTargetId || !isPublicView }
  );
  const { data: reviewStatsData } = isAdminRoute ? adminStatsResult : isPublicView ? publicStatsResult : genericStatsResult;
  const reviewStats = normalizeReviewStats(reviewStatsData?.data?.stats, []);

  const handleViewService = (service) => {
    const serviceId = service?._id || service?.id;
    if (!serviceId) return;
    router.push(isAdmin ? paths.adminDashboard.serviceDetails(serviceId) : paths.dashboard.serviceDetails(serviceId));
  };

  const whyClientsLoveUs = [
    t('clientsServedTopRated', { count: provider.reviewCount || '100+' }),
    t('premiumCareTrusted', { category: provider.category?.toLowerCase() || t('beauty') }),
    t('consistentResults', { experience: provider.experience || t('experiencedTeam') }),
    t('regularAppointmentsAvailability', { availability: provider.preferredBookingTime || t('flexible') }),
  ];

  const priceRangeLabel = (() => {
    const range = provider.priceRange;
    if (!range) return null;
    const { min, max } = range;
    if (min == null && max == null) return null;
    // {min: 0, max: 0} means no price has actually been set yet — not a real "$0" price.
    if (!min && !max) return null;
    if (min != null && max != null) return min === max ? `$${min.toLocaleString()}` : `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    return `$${(min ?? max).toLocaleString()}`;
  })();

  const nextAvailableSlot = provider.nextAvailableSlot;
  const nextAppointment = (() => {
    if (!nextAvailableSlot) return t('notAvailable');
    const openTime = formatSlotTime12h(nextAvailableSlot.open);
    const closeTime = formatSlotTime12h(nextAvailableSlot.close);
    const dayLabel = nextAvailableSlot.label || nextAvailableSlot.dayOfWeek || '';
    return `${dayLabel} • ${openTime.time} ${openTime.meridiem} – ${closeTime.time} ${closeTime.meridiem}`;
  })();

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={8}>
        <Stack spacing={2.5}>
          <Card sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>{t('about')}</Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 2.5 }}>
              {provider.description || t('providerDescriptionFallback')}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, p: 2.5, height: '100%', border: '1px solid', borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.18), boxShadow: 'none' }}>
                  <Typography variant="caption" sx={{ color: PROVIDER_OVERVIEW_ACCENT, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase', display: 'block' }}>
                    {t('whyClientsLoveUs')}
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {whyClientsLoveUs.map((item) => (
                      <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                        <Iconify icon="eva:checkmark-fill" width={18} sx={{ color: 'primary.main', flexShrink: 0, mt: 0.25 }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, fontWeight: 500 }}>{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 2, p: 2.5, height: '100%', border: '1px solid',
                    borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                    '&:hover': { boxShadow: (theme) => `0 14px 36px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.12)}`, transform: 'translateY(-1px)' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: PROVIDER_OVERVIEW_ACCENT, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase' }}>
                    {t('specialties')}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {(provider.specialty || []).map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        clickable
                        sx={{
                          px: 0.5, borderRadius: 999, fontWeight: 700,
                          bgcolor: PROVIDER_OVERVIEW_CREAM, border: '1px solid',
                          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35),
                          color: 'text.primary', transition: 'all 0.18s ease',
                          '& .MuiChip-label': { px: 1.25 },
                          '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', transform: 'translateY(-1px)', boxShadow: (theme) => `0 10px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}` },
                        }}
                      />
                    ))}
                  </Stack>

                  {!!provider.tags?.length && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{ color: PROVIDER_OVERVIEW_ACCENT, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase', display: 'block', mt: 2.5 }}
                      >
                        {t('tags')}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                        {provider.tags.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            size="small"
                            clickable
                            sx={{
                              px: 0.5, borderRadius: 999, fontWeight: 700,
                              bgcolor: PROVIDER_OVERVIEW_CREAM, border: '1px solid',
                              borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35),
                              color: 'text.primary', transition: 'all 0.18s ease',
                              '& .MuiChip-label': { px: 1.25 },
                              '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', transform: 'translateY(-1px)', boxShadow: (theme) => `0 10px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}` },
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                  {isAdminRoute && (
                    <>
                      <Divider sx={{ my: 2.25, borderStyle: 'dashed', opacity: 0.75 }} />

                      <Box
                        sx={{
                          p: 2, borderRadius: 2, border: '1px solid',
                          borderColor: nextAvailableSlot
                            ? (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24)
                            : 'divider',
                          borderStyle: nextAvailableSlot ? 'solid' : 'dashed',
                          bgcolor: nextAvailableSlot ? 'background.paper' : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                          '&:hover': nextAvailableSlot
                            ? { borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35), boxShadow: (theme) => `0 10px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}` }
                            : {},
                        }}
                      >
                        <Box
                          sx={{
                            width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            bgcolor: nextAvailableSlot
                              ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
                              : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                          }}
                        >
                          <Iconify
                            icon="solar:calendar-mark-bold"
                            width={20}
                            sx={{ color: nextAvailableSlot ? 'primary.main' : 'text.disabled' }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: nextAvailableSlot ? PROVIDER_OVERVIEW_ACCENT : 'text.disabled',
                              fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', display: 'block',
                            }}
                          >
                            {t('nextAvailableAppointment')}
                          </Typography>
                          {nextAvailableSlot ? (
                            <>
                              <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 800 }}>{nextAppointment}</Typography>
                              {nextAvailableSlot.target?.name && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                  {nextAvailableSlot.target.name}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                              {t('noUpcomingAvailability', { defaultValue: 'No upcoming availability' })}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Card>

          {/* Info grid */}
          <Grid container spacing={2}>
            {(provider.categories?.length > 0 || provider.category) && (
              <Grid item xs={12} sm={6} md={4}>
                <CategoryStatCard
                  icon="solar:tag-horizontal-bold-duotone"
                  label={t('categories', { defaultValue: 'Categories' })}
                  categories={provider.categories?.length > 0 ? provider.categories : [provider.category]}
                />
              </Grid>
            )}
            {[
              { label: t('providerType'), value: provider.providerType, icon: 'solar:layers-bold' },
              { label: t('businessSize'), value: provider.businessSize, icon: 'solar:buildings-bold' },
              { label: t('experience'), value: provider.experience, icon: 'solar:diploma-bold' },
              { label: t('location'), value: provider.location, icon: 'solar:map-point-bold' },
              ...(priceRangeLabel
                ? [{ label: t('priceRange', { defaultValue: 'Price Range' }), value: priceRangeLabel, icon: 'solar:wallet-money-bold' }]
                : []),
              ...(provider.preferredServiceType
                ? [{ label: t('preferredServiceType'), value: provider.preferredServiceType, icon: 'solar:map-point-wave-bold' }]
                : []),
            ].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.label}>
                <StatCard icon={item.icon} label={item.label} value={item.value} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>

      {/* RIGHT COLUMN */}
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 2.5, p: { xs: 2.5, md: 3 }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: { md: 'sticky' }, top: { md: 24 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Iconify icon="solar:star-bold" width={18} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" fontWeight={700}>{t('rating')}</Typography>
          </Stack>

          {provider.rating ? (
            <>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>{Number(provider.rating).toFixed(1)}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>/ 5</Typography>
              </Stack>
              <StarRating rating={provider.rating} />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
                {t('basedOnReviews', { count: provider.reviewCount ?? 0 })}
              </Typography>
            </>
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 2 }}>
              <Iconify icon="solar:star-outline" width={36} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>{t('noRatingsYet')}</Typography>
            </Stack>
          )}

          <Stack spacing={0.75} sx={{ mt: 2 }}>
            {reviewStats.ratingCounts.map(({ star, count }) => {
              const total = reviewStats.totalReviews || provider.reviewCount || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <Stack key={star} direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ width: 8, color: 'text.secondary' }}>{star}</Typography>
                  <Iconify icon="solar:star-bold" width={12} sx={{ color: 'warning.main' }} />
                  <Box sx={{ flex: 1, height: 6, borderRadius: 6, bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.22), overflow: 'hidden' }}>
                    <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'warning.main', transition: 'width 0.4s ease' }} />
                  </Box>
                  <Typography variant="caption" sx={{ width: 28, textAlign: 'right', color: 'text.secondary' }}>{count}</Typography>
                </Stack>
              );
            })}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            {[
              { icon: 'solar:map-point-bold', value: provider.location },
              { icon: 'solar:diploma-bold', value: provider.experience ? t('experienceWithValue', { value: provider.experience }) : null },
            ]
              .filter((item) => Boolean(item.value))
              .map((item) => (
                <Stack key={item.icon} direction="row" alignItems="center" spacing={1.25}>
                  <Iconify icon={item.icon} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{item.value}</Typography>
                </Stack>
              ))}
          </Stack>
        </Card>
      </Grid>

      {/* SERVICES PREVIEW — customer-facing only; provider/admin get the full Services tab instead */}
      {isPublicView && (
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>{t('services')}</Typography>
            </Stack>

            {totalServices > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={() => onShowAllServices?.()}
                endIcon={<Iconify icon="solar:arrow-right-line-duotone" width={16} />}
                sx={{
                  textTransform: 'none', fontWeight: 800, borderRadius: 999, px: 1.75, py: 0.75,
                  color: 'primary.main',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                  border: '1px solid', borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
                  transition: 'all 0.18s ease',
                  '& .MuiButton-endIcon': { ml: 0.75, transition: 'transform 0.18s ease' },
                  '&:hover': {
                    bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.14),
                    borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.32),
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => `0 10px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.14)}`,
                  },
                  '&:hover .MuiButton-endIcon': { transform: 'translateX(2px)' },
                  '&:active': { transform: 'translateY(0px)' },
                }}
              >
                {t('viewAll')}
              </Button>
            )}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {previewServices.length ? (
              previewServices.map((service) => (
                <Fragment key={service._id || service.id}>
                  <ServiceCard svc={service} onView={() => handleViewService(service)} />
                </Fragment>
              ))
            ) : (
              <Box
                sx={{
                  gridColumn: '1 / -1', p: 3, borderRadius: 2, border: '1px dashed',
                  borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
                  bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1, minHeight: 132, textAlign: 'center',
                }}
              >
                <Iconify icon="solar:clipboard-remove-bold" width={28} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary' }}>
                  {t('noServicesAvailable')}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
