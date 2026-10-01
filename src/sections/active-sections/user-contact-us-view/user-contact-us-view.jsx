import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, RHFTextField } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { Card, CardContent } from '@mui/material';
import { useSubmitSupportRequestMutation } from 'src/store/Reducer/contact-support-api';

function createContactUsSchema(t) {
  return zod.object({
    name: zod
      .string()
      .trim()
      .min(1, { message: t('fieldRequired', { field: t('name') }) })
      .min(2, { message: t('nameMustBeAtLeast2Chars') }),
    email: zod
      .string()
      .trim()
      .min(1, { message: t('emailIsRequired') })
      .email({ message: t('emailMustBeValid') }),
    subject: zod
      .string()
      .trim()
      .min(1, { message: t('fieldRequired', { field: t('subject') }) })
      .min(3, { message: t('subjectMustBeAtLeast3Chars') }),
    message: zod
      .string()
      .trim()
      .min(1, { message: t('fieldRequired', { field: t('message') }) })
      .min(10, { message: t('messageMustBeAtLeast10Chars') }),
  });
}

const defaultValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function UserContactUsView() {
  const { t } = useTranslate();
  const user = useSelector((state) => state.user?.user);
  const userName = user?.basicInfo?.name || user?.displayName || '';
  const userEmail = user?.basicInfo?.email || user?.email || '';

  const ContactUsSchema = useMemo(() => createContactUsSchema(t), [t]);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ContactUsSchema),
    defaultValues: { ...defaultValues, name: userName, email: userEmail },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [submitSupportRequest] = useSubmitSupportRequestMutation();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitSupportRequest(data).unwrap();
      toast.success(t('messageSentSuccess'));
      reset({ ...defaultValues, name: userName, email: userEmail });
    } catch (error) {
      toast.error(error?.data?.message || t('failedToSendMessage'));
    }
  });

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('contactUs')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('contactUs') }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Box sx={{ pb: 4 }} component={Card} >
        <CardContent>
          <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('name')}
                </Typography>
                <RHFTextField name="name" placeholder={t('enterYourName')} fullWidth disabled />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('email')}
                </Typography>
                <RHFTextField name="email" fullWidth disabled />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('subject')}
                </Typography>
                <RHFTextField name="subject" placeholder={t('enterYourSubject')} fullWidth />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('message')}
                </Typography>
                <RHFTextField name="message" placeholder={t('typeHere')} multiline rows={6} fullWidth />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={isSubmitting}
                  sx={{ px: 4 }}
                >
                  {t('send')}
                </LoadingButton>
              </Box>
            </Stack>
          </Form>
        </CardContent>
      </Box>
    </DashboardContent>
  );
}
