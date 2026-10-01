import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const getWorkspacesData = (t) => [
  {
    id: 'team-1',
    name: t('workspace.team1'),
    logo: `${CONFIG.site.basePath}/assets/icons/workspaces/logo-1.webp`,
    plan: t('workspace.planFree'),
  },
  {
    id: 'team-2',
    name: t('workspace.team2'),
    logo: `${CONFIG.site.basePath}/assets/icons/workspaces/logo-2.webp`,
    plan: t('workspace.planPro'),
  },
  {
    id: 'team-3',
    name: t('workspace.team3'),
    logo: `${CONFIG.site.basePath}/assets/icons/workspaces/logo-3.webp`,
    plan: t('workspace.planPro'),
  },
];

const defaultT = (key) => {
  const translations = {
    'workspace.team1': 'Team 1',
    'workspace.team2': 'Team 2',
    'workspace.team3': 'Team 3',
    'workspace.planFree': 'Free',
    'workspace.planPro': 'Pro',
  };
  return translations[key] || key;
};

export { getWorkspacesData };
export const _workspaces = getWorkspacesData(defaultT);
