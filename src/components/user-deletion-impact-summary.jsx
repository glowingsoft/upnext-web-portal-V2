import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

function formatLabel(value) {
  const label = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function getAffectedRecords(affectedRecords) {
  const records = [];

  function collect(value, path) {
    if (typeof value === 'number') {
      if (value > 0) {
        records.push({ key: path.join('.'), label: path.map(formatLabel).join(' · '), count: value });
      }
      return;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([key, child]) => collect(child, [...path, key]));
    }
  }

  Object.entries(affectedRecords || {}).forEach(([key, value]) => collect(value, [key]));
  return records;
}

export function UserDeletionImpactSummary({ affectedRecords }) {
  const { t } = useTranslate();
  const records = getAffectedRecords(affectedRecords);

  return (
    <Box
      sx={{
        mt: 2,
        p: 1.5,
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 1.5,
        bgcolor: 'primary.lighter',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ color: 'primary.dark' }}>
          {t('hardDeleteImpactTitle')}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t('hardDeleteImpactDescription')}
      </Typography>

      {records.length > 0 ? (
        <Stack spacing={0.75} sx={{ mt: 1.5, maxHeight: 240, overflowY: 'auto' }}>
          {records.map((record) => (
            <Box
              key={record.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="solar:check-circle-linear" width={18} sx={{ flexShrink: 0, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {record.label}
              </Typography>
              <Chip size="small" color="primary" variant="soft" label={record.count} sx={{ minWidth: 28, fontWeight: 700 }} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {t('hardDeleteNoAffectedRecords')}
        </Typography>
      )}
    </Box>
  );
}

UserDeletionImpactSummary.propTypes = {
  affectedRecords: PropTypes.object.isRequired,
};
