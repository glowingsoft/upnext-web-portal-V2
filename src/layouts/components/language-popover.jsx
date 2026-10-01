import { m } from 'framer-motion';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { useTranslate } from 'src/locales';

import { varHover } from 'src/components/animate';
import { FlagIcon } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { bookingsApi } from 'src/store/Reducer/bookings-api';
import { useUpdateAdminProfileMutation } from 'src/store/Reducer/auth';
import { getApiLanguage } from 'src/utils/multi-lang-content';

// ----------------------------------------------------------------------

export function LanguagePopover({ data = [], sx, ...other }) {
  const popover = usePopover();

  const { onChangeLang, currentLang } = useTranslate();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.permission === 1;

  const [updateAdminProfile] = useUpdateAdminProfileMutation();

  const handleChangeLang = useCallback(
    async (newLang) => {
      onChangeLang(newLang);
      popover.onClose();

      if (isAdmin) {
        // Booking data is keyed off the admin's saved profile language, not a header — wait
        // for the PUT to resolve before refetching, otherwise the refetch can race the backend
        // update and come back with the old language's data.
        try {
          await updateAdminProfile({ language: getApiLanguage(newLang) }).unwrap();
          dispatch(bookingsApi.util.invalidateTags(['bookings']));
        } catch {
          // Language update failed — leave cached booking data as-is.
        }
      }
    },
    [onChangeLang, popover, isAdmin, updateAdminProfile, dispatch]
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          p: 0,
          width: 40,
          height: 40,
          ...(popover.open && { bgcolor: 'action.selected' }),
          ...sx,
        }}
        {...other}
      >
        <FlagIcon code={currentLang.countryCode} />
      </IconButton>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList sx={{ width: 160, minHeight: 72 }}>
          {data?.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => handleChangeLang(option.value)}
            >
              <FlagIcon code={option.countryCode} />
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}
