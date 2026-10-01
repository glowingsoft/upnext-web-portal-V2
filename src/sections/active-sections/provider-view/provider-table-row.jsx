import { Avatar, Box, Link, Rating, Stack, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { useUpdateProviderCertificationMutation, useUpdateProviderStatusMutation } from 'src/store/Reducer/businesses-api';
import { ProviderQuickEditDialog } from './provider-quick-edit-dialog';

const CATEGORY_CHIPS_VISIBLE = 2;

const ACTIVE_VALUES = new Set(['active', 'approved', 'enabled', 'open']);
const PENDING_VALUES = new Set(['pending', 'awaiting_approval', 'awaiting approval', 'in_review', 'in review']);
const SUSPENDED_VALUES = new Set(['suspended']);
const DELETED_VALUES = new Set(['deleted']);

const CERT_STATUS_COLOR = { approved: 'success', pending: 'warning', rejected: 'error', not_submitted: 'default' };

function normalizeValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}
function getAvatarSrc(url) {
  if (!url || typeof url !== 'string') return undefined;
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  const secondHttpIndex = trimmed.indexOf('http', trimmed.indexOf('http') + 1);
  if (secondHttpIndex > 0) {
    trimmed = trimmed.slice(secondHttpIndex);
  }

  if (/\/$/.test(trimmed) || /noimg/i.test(trimmed)) return undefined;
  return trimmed;
}

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

function normalizeProviderStatus(provider) {
  const rawStatus = provider?.status || provider?.accountStatus || provider?.state || provider?.registrationStatus || provider?.user?.status || provider?.user?.accountStatus;

  if (rawStatus) {
    const normalized = normalizeValue(rawStatus);
    if (ACTIVE_VALUES.has(normalized)) return 'active';
    if (PENDING_VALUES.has(normalized)) return 'pending';
    if (SUSPENDED_VALUES.has(normalized)) return 'suspended';
    if (DELETED_VALUES.has(normalized)) return 'deleted';
    if (normalized === 'inactive') return 'inactive';
  }

  if (typeof provider?.isAvailable === 'boolean') {
    return provider.isAvailable ? 'active' : 'inactive';
  }

  return 'inactive';
}

export const ProviderTableRow = memo(
  ({ row, serialNumber }) => {
    const router = useRouter();
    const { t } = useTranslate();
    const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
    const [specialtiesModalOpen, setSpecialtiesModalOpen] = useState(false);
    const [certModalOpen, setCertModalOpen] = useState(false);
    const [activeCertFileIndex, setActiveCertFileIndex] = useState(0);
    const [quickEditOpen, setQuickEditOpen] = useState(false);
    const [localStatusOverride, setLocalStatusOverride] = useState(null);
    const [updateProviderStatus] = useUpdateProviderStatusMutation();
    const [updateProviderCertification] = useUpdateProviderCertificationMutation();
    const userState = useSelector((state) => state.user);
    const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
    const isAdmin = userType === 'admin';
    const isCustomer = userType === 'customer' || userType === 'user';
    const detailsPath = isAdmin ? paths?.adminDashboard?.providerDetails(row._id) : paths?.dashboard?.providerDetails(row._id);
    const userId = row?.user?._id || row?.userId;
    const specialties = row?.skills || row?.specialty || [];
    const showChips = specialties.slice(0, 1);
    const hasMore = specialties.length > 1;
    const extraSpecialtiesCount = specialties.length - showChips.length;
    const extraSpecialtiesTooltip = specialties.slice(showChips.length).join(', ');
    const statusValue = localStatusOverride || normalizeProviderStatus(row);
    const isActive = statusValue === 'active';
    const isPending = statusValue === 'pending';
    const isSuspended = statusValue === 'suspended';
    const isDeleted = statusValue === 'deleted';

    const chipTextSx = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      minWidth: 0,
    };
    const specialtyChipSx = {
      bgcolor: '#fff2d0',
      color: '#7a5a2b',
      borderColor: 'rgba(122, 90, 43, 0.25)',
    };

    const userDisplayName = row?.user?.name || row?.userName || row?.username || '—';
    const userEmail = row?.user?.email || row?.email || '';
    const userAvatar = getAvatarSrc(row?.user?.profileIcon || row?.user?.avatar || row?.avatar);

    const businessName = row?.businessName || row?.name || '—';
    const businessImage = getAvatarSrc(row?.image || row?.avatar);

    const avgRating = row?.rating?.avgRating ?? (typeof row?.rating === 'number' ? row.rating : 0);
    const totalReviews = row?.rating?.totalReviews ?? row?.reviewCount ?? 0;

    const categoryList = Array.isArray(row?.categoryNames)
      ? row.categoryNames.filter(Boolean)
      : [(typeof row?.category === 'string' && row.category) || row?.category?.name || row?.category?.translations?.en].filter(Boolean);
    const visibleCategories = categoryList.slice(0, CATEGORY_CHIPS_VISIBLE);
    const extraCategoriesCount = categoryList.length - visibleCategories.length;
    const extraCategoriesTooltip = categoryList.slice(visibleCategories.length).join(', ');
    const categoryChipSx = {
      bgcolor: '#e3f2fd',
      color: '#1565c0',
      borderColor: 'rgba(21, 101, 192, 0.25)',
    };

    const chargeLabel = (() => {
      const charge = row?.priceRange || row?.charge;
      if (charge == null) return '—';
      if (typeof charge === 'string') return charge;
      if (typeof charge === 'number') return charge > 0 ? `$${charge.toLocaleString()}` : '—';
      const { min, max } = charge;
      if (min == null && max == null) return '—';
      // {min: 0, max: 0} means no price has actually been set yet — not a real "$0" price.
      if (!min && !max) return '—';
      if (min != null && max != null) return min === max ? `$${min.toLocaleString()}` : `$${min.toLocaleString()} - $${max.toLocaleString()}`;
      return `$${(min ?? max).toLocaleString()}`;
    })();

    const locationLabel =
      (typeof row?.location === 'string' && row.location) ||
      row?.location?.address ||
      (Array.isArray(row?.location?.coordinates) ? row.location.coordinates.join(', ') : '') ||
      'N/A';

    // GeoJSON coordinate order is [lng, lat]. [0, 0] is a placeholder default, not a real point.
    const locationCoords = Array.isArray(row?.location?.coordinates) && row.location.coordinates.length === 2 ? row.location.coordinates : null;
    const hasRealCoords = locationCoords && (locationCoords[0] !== 0 || locationCoords[1] !== 0);
    const locationTooltip = hasRealCoords ? `${locationLabel} (${locationCoords[1]}, ${locationCoords[0]})` : locationLabel;

    const certifications = row?.certifications || null;
    const certStatus = normalizeValue(certifications?.status);
    const certFiles = Array.isArray(certifications?.files) ? certifications.files : [];
    const hasCertification = Boolean(certifications) && certStatus !== 'not_submitted';

    const providerForDialog = {
      name: businessName,
      licensedProfessional: hasCertification,
      certificationStatus: certStatus,
      documents:
        certFiles.length > 0
          ? certFiles.map((url, index) => ({
              id: `cert-${index}`,
              name: certifications?.name ? `${certifications.name} (${index + 1})` : t('certificateNumber', { number: index + 1 }),
              type: 'PDF',
              url,
            }))
          : Array.isArray(row?.documents)
            ? row.documents
            : Array.isArray(row?.registrationDocuments)
              ? row.registrationDocuments
              : [],
    };

    const handleUpdateStatus = async (nextStatus) => {
      await updateProviderStatus({ userId, status: nextStatus }).unwrap();
      setLocalStatusOverride(nextStatus);
    };

    const handleApproveCertification = async () => {
      await updateProviderCertification({ userId, action: 'approve' }).unwrap();
      setLocalStatusOverride('active');
    };

    const handleRejectCertification = async (rejectionReason) => {
      await updateProviderCertification({ userId, action: 'reject', rejectionReason }).unwrap();
      setLocalStatusOverride('inactive');
    };

    const actions = [
      {
        key: 'details',
        icon: 'solar:eye-bold',
        tooltip: t('viewProvider'),
        onClick: () => {
          router.push(detailsPath);
        },
      },
      ...(isAdmin
        ? [
            {
              key: 'edit',
              icon: 'solar:pen-bold',
              tooltip: t('edit'),
              onClick: () => setQuickEditOpen(true),
            },
          ]
        : []),
    ];

    return (
      <>
      <TableRow hover tabIndex={-1}>
        <TableCell>{serialNumber}</TableCell>
        <TableCell sx={{ minWidth: 240, verticalAlign: 'middle' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt={userDisplayName}
              src={userAvatar}
              sx={{ width: 34, height: 34, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
            >
              {getInitial(userDisplayName)}
            </Avatar>

            <Stack sx={{ minWidth: 0 }}>
              <Box
                component="span"
                sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {userDisplayName}
              </Box>
              <Box
                component="span"
                sx={{ color: 'text.secondary', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {userEmail || '—'}
              </Box>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell sx={{ minWidth: 320, verticalAlign: 'middle' }}>

          <Stack direction="row" spacing={2} alignItems="center">

            <Avatar
              alt={businessName}
              src={businessImage}
              sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
            >
              {getInitial(businessName)}
            </Avatar>

            <Stack sx={{ alignItems: 'flex-start', minWidth: 0, flex: 1 }}>

              <Link color="inherit" noWrap sx={{ cursor: 'pointer', fontWeight: 600, maxWidth: '100%' }} onClick={() => router.
                push(detailsPath)}>
                {businessName}
              </Link>
              <Box
                component="span"
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center',
                  gap: 1
                }}
              >
                <Rating max={1} readOnly value={avgRating > 0 ? 1 : 0} size='small' /> {Number(avgRating).toFixed(1)} ({totalReviews} {t('reviews')})
              </Box>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" gap={0.5} alignItems="center" sx={{ flexWrap: 'nowrap', maxWidth: '100%' }}>
            {categoryList.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
            )}
            {visibleCategories.map((cat) => (
              <Tooltip key={cat} title={cat}>
                <Label
                  color="info"
                  sx={{
                    ...categoryChipSx,
                    ...chipTextSx,
                    flexShrink: 0,
                    maxWidth: 110,
                  }}
                >
                  {cat}
                </Label>
              </Tooltip>
            ))}
            {extraCategoriesCount > 0 && (
              <Tooltip title={extraCategoriesTooltip}>
                <Label
                  color="info"
                  onClick={() => setCategoriesModalOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    ...categoryChipSx,
                  }}
                >
                  {`+${extraCategoriesCount}`} {t('more')}
                </Label>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" gap={0.5} alignItems="center" sx={{ flexWrap: 'nowrap', maxWidth: '100%' }}>
            {specialties.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
            )}
            {showChips.map((item) => (
              <Tooltip key={item} title={item}>
                <Label
                  color="primary"
                  sx={{
                    ...specialtyChipSx,
                    ...chipTextSx,
                    flexShrink: 0,
                    maxWidth: 110,
                  }}
                >
                  {item}
                </Label>
              </Tooltip>
            ))}
            {hasMore && (
              <Tooltip title={extraSpecialtiesTooltip}>
                <Label
                  color="primary"
                  onClick={() => setSpecialtiesModalOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    ...specialtyChipSx,
                  }}
                >
                  {`+${extraSpecialtiesCount}`} {t('more')}
                </Label>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {chargeLabel}
        </TableCell>
        <TableCell align="center" sx={{ maxWidth: 160 }}>
          <Tooltip title={locationTooltip} arrow>
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                verticalAlign: 'middle',
              }}
            >
              {locationLabel}
            </Box>
          </Tooltip>
        </TableCell>

        {isAdmin && (
          <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
              <Label color={certifications ? CERT_STATUS_COLOR[certStatus] || 'default' : 'default'}>
                {!certifications || certStatus === 'not_submitted' ? t('no') : certStatus ? t(certStatus) : t('pending')}
              </Label>
              {certFiles.length > 0 && (
                <Tooltip title={t('viewCertificate')}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setActiveCertFileIndex(0);
                      setCertModalOpen(true);
                    }}
                  >
                    <Iconify icon="solar:file-text-bold" width={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        )}

        {!isCustomer && (
          <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
            <Label color={isPending ? 'warning' : isSuspended ? 'info' : isDeleted ? 'error' : isActive ? 'success' : 'secondary'}>
              {isPending ? t('pending') : isSuspended ? t('suspended') : isDeleted ? t('deleted') : isActive ? t('active') : t('inactive')}
            </Label>
          </TableCell>
        )}


        <TableCell align='center' >
          <Box sx={{ flex: 1, width: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GenericTableRowActions actions={actions} />
          </Box>
        </TableCell>
      </TableRow>

      <Dialog open={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('categories')}
          <IconButton size="small" onClick={() => setCategoriesModalOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {categoryList.map((cat) => (
              <Label key={cat} color="info" sx={categoryChipSx}>
                {cat}
              </Label>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={specialtiesModalOpen} onClose={() => setSpecialtiesModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('specialties')}
          <IconButton size="small" onClick={() => setSpecialtiesModalOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {specialties.map((item) => (
              <Label key={item} color="primary" sx={specialtyChipSx}>
                {item}
              </Label>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={certModalOpen} onClose={() => setCertModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {certifications?.name || t('certificate')}
          <IconButton size="small" onClick={() => setCertModalOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        {certFiles.length > 1 && (
          <Stack direction="row" gap={1} sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }} flexWrap="wrap">
            {certFiles.map((_, index) => (
              <Label
                key={index}
                color={index === activeCertFileIndex ? 'primary' : 'default'}
                onClick={() => setActiveCertFileIndex(index)}
                sx={{ cursor: 'pointer' }}
              >
                {t('fileNumber', { number: index + 1 })}
              </Label>
            ))}
          </Stack>
        )}

        <DialogContent sx={{ p: 0, display: 'flex', flex: 1 }}>
          {certFiles[activeCertFileIndex] && (
            <Box
              component="iframe"
              src={certFiles[activeCertFileIndex]}
              title={certifications?.name || t('certificate')}
              sx={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
            />
          )}
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <ProviderQuickEditDialog
          open={quickEditOpen}
          onClose={() => setQuickEditOpen(false)}
          provider={providerForDialog}
          statusValue={statusValue}
          onUpdateStatus={handleUpdateStatus}
          onApprove={handleApproveCertification}
          onReject={handleRejectCertification}
        />
      )}
      </>
    );
  },
  (prev, next) =>
    prev.row._id === next.row._id &&
    prev.row.businessName === next.row.businessName &&
    prev.row.isAvailable === next.row.isAvailable &&
    prev.row.categoryNames === next.row.categoryNames &&
    prev.row.priceRange === next.row.priceRange &&
    prev.row.location === next.row.location &&
    prev.row.certifications?.status === next.row.certifications?.status &&
    prev.row.certifications?.files?.length === next.row.certifications?.files?.length &&
    prev.serialNumber === next.serialNumber
);

ProviderTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
};

ProviderTableRow.displayName = 'ProviderTableRow';
