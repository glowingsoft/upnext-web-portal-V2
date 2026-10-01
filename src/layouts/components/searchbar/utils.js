import { paths } from 'src/routes/paths';
import { flattenArray } from 'src/utils/helper';

const FALLBACK_ICON_BY_PATH = {
  [paths.dashboard.appSettings.terms]: 'solar:document-text-bold-duotone',
  [paths.dashboard.appSettings.privacy]: 'solar:shield-check-bold-duotone',
  [paths.dashboard.appSettings.about]: 'solar:info-circle-bold-duotone',
  [paths.dashboard.appSettings.faqs]: 'solar:question-circle-bold-duotone',
  [paths.dashboard.appSettings.contact]: 'solar:letter-bold-duotone',
  [paths.dashboard.appSettings.helpCenter]: 'solar:lightbulb-bold-duotone',
  [paths.dashboard.appSettings.notifications]: 'solar:bell-bing-bold-duotone',
  [paths.dashboard.appSettings.analytics]: 'solar:chart-2-bold-duotone',
  [paths.dashboard.appSettings.billingHistory]: 'solar:bill-list-bold-duotone',
  [paths.dashboard.appSettings.connect]: 'solar:link-bold-duotone',
  [paths.dashboard.appSettings.connectManageCards]: 'solar:card-bold-duotone',
  [paths.dashboard.appSettings.connectPayoutMethod]: 'solar:card-transfer-bold-duotone',
};

export function getFallbackIconName(path) {
  return FALLBACK_ICON_BY_PATH[path];
}

export function getAllItems({ data }) {
  const reduceItems = data.map((list) => handleLoop(list.items, list.subheader)).flat();

  const items = flattenArray(reduceItems).map((option) => {
    const group = splitPath(reduceItems, option.path);

    return {
      group: group && group.length > 1 ? group[0] : option.subheader,
      title: option.title,
      path: option.path,
      icon: option.icon,
      iconName: option.icon ? undefined : getFallbackIconName(option.path),
    };
  });

  return items;
}

// ----------------------------------------------------------------------

export function applyFilter({ inputData, query }) {
  if (query) {
    inputData = inputData.filter(
      (item) =>
        item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.path.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function splitPath(array, key) {
  let stack = array.map((item) => ({ path: [item.title], currItem: item }));

  while (stack.length) {
    const { path, currItem } = stack.pop();

    if (currItem.path === key) {
      return path;
    }

    if (currItem.children?.length) {
      stack = stack.concat(
        currItem.children.map((item) => ({
          path: path.concat(item.title),
          currItem: item,
        }))
      );
    }
  }
  return null;
}

// ----------------------------------------------------------------------

export function handleLoop(array, subheader) {
  return array?.map((list) => ({
    subheader,
    ...list,
    ...(list.children && { children: handleLoop(list.children, subheader) }),
  }));
}

export function groupItems(array) {
  const group = array.reduce((groups, item) => {
    groups[item.group] = groups[item.group] || [];

    groups[item.group].push(item);

    return groups;
  }, {});

  return group;
}
