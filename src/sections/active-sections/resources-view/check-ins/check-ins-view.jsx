import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';

import { CHECK_IN_TEMPLATES } from './check-ins-mock';
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';
import { FieldFormDialog } from './components/field-form-dialog';
import { TemplateCard } from './components/template-card';
import { TemplateFormDialog } from './components/template-form-dialog';

// ----------------------------------------------------------------------

const EMPTY_TEMPLATE = { name: '', frequency: 'Every Monday', fields: [] };
const EMPTY_FIELD = { name: '', description: '' };

// ----------------------------------------------------------------------

export default function CheckInsView() {
  const [templates, setTemplates] = useState(CHECK_IN_TEMPLATES);

  // Template dialog state
  const [templateDialog, setTemplateDialog] = useState({ open: false, mode: 'create', data: null });

  // Field dialog state (nested inside template dialog)
  const [fieldDialog, setFieldDialog] = useState({ open: false, mode: 'add', data: null, index: null });

  // Delete confirm state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Derived form state
  const [form, setForm] = useState(EMPTY_TEMPLATE);
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD);

  // ----------------------------------------------------------------------
  // Template CRUD

  const openCreateTemplate = () => {
    setForm(EMPTY_TEMPLATE);
    setTemplateDialog({ open: true, mode: 'create', data: null });
  };

  const openEditTemplate = (template) => {
    setForm({ name: template.name, frequency: template.frequency, fields: template.fields.map((f) => ({ ...f })) });
    setTemplateDialog({ open: true, mode: 'edit', data: template });
  };

  const closeTemplateDialog = () => {
    setTemplateDialog({ open: false, mode: 'create', data: null });
    setFieldDialog({ open: false, mode: 'add', data: null, index: null });
  };

  const saveTemplate = () => {
    if (!form.name.trim()) return;
    if (templateDialog.mode === 'create') {
      setTemplates((prev) => [...prev, { id: uuidv4(), name: form.name.trim(), frequency: form.frequency, clientCount: 0, fields: form.fields }]);
    } else {
      setTemplates((prev) => prev.map((t) => (t.id === templateDialog.data.id ? { ...t, name: form.name.trim(), frequency: form.frequency, fields: form.fields } : t)));
    }
    closeTemplateDialog();
  };

  const confirmDeleteTemplate = () => {
    setTemplates((prev) => prev.filter((t) => t.id !== deleteDialog.id));
    setDeleteDialog({ open: false, id: null });
    closeTemplateDialog();
  };

  // ----------------------------------------------------------------------
  // Field CRUD (operates on form.fields)

  const openAddField = () => {
    setFieldForm(EMPTY_FIELD);
    setFieldDialog({ open: true, mode: 'add', data: null, index: null });
  };

  const openEditField = (field, index) => {
    setFieldForm({ name: field.name, description: field.description });
    setFieldDialog({ open: true, mode: 'edit', data: field, index });
  };

  const closeFieldDialog = () => {
    setFieldDialog({ open: false, mode: 'add', data: null, index: null });
  };

  const saveField = () => {
    if (!fieldForm.name.trim()) return;
    const newField = { id: fieldDialog.data?.id || uuidv4(), name: fieldForm.name.trim(), description: fieldForm.description.trim() };
    setForm((prev) => {
      const updated = [...prev.fields];
      if (fieldDialog.mode === 'add') {
        updated.push(newField);
      } else {
        updated[fieldDialog.index] = newField;
      }
      return { ...prev, fields: updated };
    });
    closeFieldDialog();
  };

  const deleteField = (index) => {
    setForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  };

  // ----------------------------------------------------------------------

  return (
    <>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 3, md: 5 } }}>
          <CustomBreadcrumbs heading="Check-In Templates" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Resources' }, { name: 'Check-Ins' }]} />
          <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreateTemplate} sx={{ flexShrink: 0 }}>
            Create Template
          </Button>
        </Stack>

        {/* Template List */}
        {templates.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              border: '1.5px dashed',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Iconify icon="solar:clipboard-list-bold-duotone" width={56} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No check-in templates yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first template to start collecting check-ins from clients.
            </Typography>
            <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreateTemplate}>
              Create Template
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} onEdit={openEditTemplate} onDelete={() => setDeleteDialog({ open: true, id: template.id })} />
            ))}
          </Stack>
        )}
      </DashboardContent>

      {/* ── Template Create / Edit Dialog ── */}
      <TemplateFormDialog
        open={templateDialog.open}
        mode={templateDialog.mode}
        form={form}
        setForm={setForm}
        onClose={closeTemplateDialog}
        onSave={saveTemplate}
        onAddField={openAddField}
        onEditField={openEditField}
        onDeleteField={deleteField}
        onDeleteTemplate={() => setDeleteDialog({ open: true, id: templateDialog.data?.id })}
      />

      {/* ── Add / Edit Field Dialog ── */}
      <FieldFormDialog open={fieldDialog.open} mode={fieldDialog.mode} fieldForm={fieldForm} setFieldForm={setFieldForm} onClose={closeFieldDialog} onSave={saveField} />

      {/* ── Delete Confirm Dialog ── */}
      <DeleteConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} onConfirm={confirmDeleteTemplate} />
    </>
  );
}
