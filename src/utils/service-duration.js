export function getItemDurationMins(item) {
  return item.sessionSlotMins ?? item.durationMins;
}
