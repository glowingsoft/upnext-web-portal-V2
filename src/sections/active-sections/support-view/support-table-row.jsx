import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import { memo, useCallback, useState } from 'react';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import EllipsisCellWithTooltip from 'src/components/table/ellipsis-cell-with-tooltip';
import { EllipsisCellOpenable } from 'src/components/table/ellipsis-cell-openable';
import { ReadOnlyTextPreviewDialog } from 'src/components/table/read-only-text-preview-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';
import QuickSupportReply from './components/quick-support-reply';
import { STATUS_OPTIONS } from './supports-list-view';

export const SupportTableRow = memo(
  ({ row, serialNumber, onReplySent, onResolve }) => {
    const { t } = useTranslate();
    const reply = useBoolean();
    const messagePreview = useBoolean();
    const [previewMessageBody, setPreviewMessageBody] = useState('');

    const openMessagePreview = useCallback(() => {
      setPreviewMessageBody(row?.message ?? '');
      messagePreview.onTrue();
    }, [messagePreview.onTrue, row?.message]);

    const actions = [
      {
        key: 'reply',
        icon: 'tabler:message-filled',
        tooltip: t('reply'),
        color: reply.value ? 'inherit' : 'default',
        onClick: () => {
          reply.onTrue();
        },
        hidden: row.status !== 'pending',
      },
    ];

    return (
      <>
        <TableRow hover tabIndex={-1}>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

          <TableCell>
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar
                alt={row.name}
                src={row.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 700,
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark',
                }}
              >
                {row.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Typography variant="body2" fontWeight={600}>
                  {row.name}
                </Typography>
              </Stack>
            </Stack>
          </TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.email || 'N/A'}</TableCell>

          <EllipsisCellWithTooltip maxWidth="150px">{row?.subject || 'N/A'}</EllipsisCellWithTooltip>

          <EllipsisCellOpenable
            maxWidth="200px"
            onOpen={openMessagePreview}
            openLabel={t('viewFullMessage')}
          >
            {row?.message || 'N/A'}
          </EllipsisCellOpenable>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.createdAt ? fDate(row.createdAt) : 'N/A'}</TableCell>
          <TableCell>
            <Label variant="soft" color={STATUS_OPTIONS.find((option) => option.value === row.status)?.color || 'default'} sx={{ textTransform: 'capitalize' }}>
              {row.status || 'N/A'}
            </Label>
          </TableCell>

          <TableCell>
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
              {row.status === 'pending' && <GenericTableRowActions actions={actions} />}
              {row.status === 'responded' && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={() => onResolve(row._id)}
                  sx={{
                    whiteSpace: 'nowrap',
                    bgcolor: 'primary.lighter',
                    color: 'primary.dark',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.darker' },
                  }}
                >
                  {t('markResolved', { defaultValue: 'Mark resolved' })}
                </Button>
              )}
              {row.status !== 'pending' && row.status !== 'responded' && '--'}
            </Box>
          </TableCell>
        </TableRow>

        {/* <UserQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      /> */}
        <QuickSupportReply
          open={reply.value}
          onClose={() => reply.onFalse()}
          onSend={(message) => onReplySent(row._id, message)}
        />

        <ReadOnlyTextPreviewDialog
          open={messagePreview.value}
          onClose={messagePreview.onFalse}
          title={t('message')}
          text={previewMessageBody}
          dismissLabel={t('close')}
          emptyMessage={t('noPreviewContent')}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.row._id === nextProps.row._id &&
      prevProps.row.name === nextProps.row.name &&
      prevProps.row.balance === nextProps.row.balance &&
      prevProps.row.status === nextProps.row.status &&
      prevProps.row.createdAt === nextProps.row.createdAt &&
      prevProps.row.message === nextProps.row.message &&
      prevProps.row.subject === nextProps.row.subject &&
      prevProps.serialNumber === nextProps.serialNumber
    );
  }
);

SupportTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onReplySent: PropTypes.func.isRequired,
  onResolve: PropTypes.func.isRequired,
};

SupportTableRow.displayName = 'SupportTableRow';
