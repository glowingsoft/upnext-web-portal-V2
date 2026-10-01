export const getBadgeLabel = (item) => item?.translations?.en || item?.name || '';

export function findOnsitePreferredServiceType(badges) {
  const badge = (badges || []).find((b) => getBadgeLabel(b) === 'Preferred Service Type');
  if (!badge) return null;

  const option = (badge.options || []).find((o) => {
    const label = getBadgeLabel(o).toLowerCase();
    return label.includes('onsite') || label.includes('business location');
  });

  if (!option) return null;

  return {
    badgeId: badge._id,
    optionId: option._id,
    badgeName: getBadgeLabel(badge),
    optionName: getBadgeLabel(option),
  };
}
