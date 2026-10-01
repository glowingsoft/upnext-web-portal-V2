import { useRef } from 'react';
import { Controller } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export const JWT_OTP_LENGTH = 6;

export function JwtOtpCodeFields({ control, name = 'otp', otpLength = JWT_OTP_LENGTH }) {
  const inputRefs = useRef([]);

  return (
    <Box>
      <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 700 }}>
        OTP Code
      </Typography>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const currentValue = (field.value || '').slice(0, otpLength);
          const digits = Array.from({ length: otpLength }, (_, index) => currentValue[index] || '');

          const updateDigits = (nextDigits) => {
            field.onChange(nextDigits.join('').replace(/\D/g, '').slice(0, otpLength));
          };

          const setFocusAt = (index) => {
            const input = inputRefs.current[index];
            if (input) input.focus();
          };

          const handleDigitChange = (index, rawValue) => {
            const clean = rawValue.replace(/\D/g, '');
            const nextDigits = [...digits];

            if (!clean) {
              nextDigits[index] = '';
              updateDigits(nextDigits);
              return;
            }

            if (clean.length > 1) {
              const pasted = clean.slice(0, otpLength - index).split('');
              pasted.forEach((digit, pasteIndex) => {
                nextDigits[index + pasteIndex] = digit;
              });
              updateDigits(nextDigits);
              setFocusAt(Math.min(index + pasted.length, otpLength - 1));
              return;
            }

            nextDigits[index] = clean;
            updateDigits(nextDigits);
            if (index < otpLength - 1) setFocusAt(index + 1);
          };

          const handlePaste = (event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength).split('');
            if (!pasted.length) return;

            const nextDigits = Array.from({ length: otpLength }, (_, idx) => pasted[idx] || '');
            updateDigits(nextDigits);
            setFocusAt(Math.min(pasted.length, otpLength - 1));
          };

          return (
            <>
              <Stack direction="row" spacing={1.5} onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <TextField
                    key={index}
                    value={digit}
                    onChange={(event) => handleDigitChange(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && !digits[index] && index > 0) {
                        setFocusAt(index - 1);
                      }
                    }}
                    inputRef={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    inputProps={{
                      maxLength: 1,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      style: { textAlign: 'center', fontWeight: 700, fontSize: 20 },
                    }}
                    sx={{
                      width: 58,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                ))}
              </Stack>

              {fieldState.error && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.75, display: 'block' }}>
                  {fieldState.error.message}
                </Typography>
              )}
            </>
          );
        }}
      />
    </Box>
  );
}
