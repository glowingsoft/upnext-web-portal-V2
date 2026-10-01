import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Image } from '../image';
import { Iconify } from '../iconify';
import { RejectionFiles } from './components/rejection-files';

// ----------------------------------------------------------------------

export function UploadAvatar({ sx, error, value, disabled, helperText, placeholderContent, placeholderSx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });

  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const isImageFile =
    typeof value === 'string'
      ? value.startsWith('data:image/') ||
      value.startsWith('http') ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(value) ||
      /unsplash\.com|freepik\.com|picsum\.photos|\/assets\//i.test(value)
      : value instanceof File
        ? value.type.startsWith('image/')
        : false;

  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = hasFile ? (
    isImageFile ? (
      <Image alt="avatar" src={preview} sx={{ width: 1, height: 1, borderRadius: '50%' }} />
    ) : (
      <Box
        sx={{
          width: 1,
          height: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
          color: 'text.secondary',
        }}
      >
        <Iconify icon="solar:file-text-bold" width={44} />
      </Box>
    )
  ) : null;

  const renderPlaceholder = (
    <Box
      className="upload-placeholder"
      sx={{
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: '50%',
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        transition: (theme) => theme.transitions.create(['opacity'], { duration: theme.transitions.duration.shorter }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
        }),
        ...(!hasFile && placeholderSx),
      }}
    >
      {hasFile || !placeholderContent ? (
        <>
          <Iconify icon="solar:camera-add-bold" width={32} />
          <Typography variant="caption">{hasFile ? 'Update photo' : 'Upload photo'}</Typography>
        </>
      ) : (
        placeholderContent
      )}
    </Box>
  );

  const renderContent = (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {renderPreview}
      {renderPlaceholder}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          p: 1,
          m: 'auto',
          width: 144,
          height: 144,
          cursor: 'pointer',
          overflow: 'hidden',
          borderRadius: '50%',
          border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          ...(isDragActive && { opacity: 0.72 }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...(hasError && { borderColor: 'error.main' }),
          ...(hasFile && {
            ...(hasError && {
              bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
            }),
            '&:hover .upload-placeholder': { opacity: 1 },
          }),
          ...sx,
        }}
      >
        <input {...getInputProps()} />

        {renderContent}
      </Box>

      {helperText && helperText}

      <RejectionFiles files={fileRejections} />
    </>
  );
}
