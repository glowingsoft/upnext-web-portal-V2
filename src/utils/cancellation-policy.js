export const DEFAULT_CANCELLATION_POLICY = 'non_refundable';

export const CANCELLATION_POLICY_OPTIONS = [
  {
    value: 'non_refundable',
    icon: 'solar:wallet-money-bold-duotone',
    labelKey: 'cancellationNonRefundable',
    label: 'Non-refundable',
    descriptionKey: 'cancellationNonRefundableDescription',
    description: 'Customers do not get their money back if they cancel.',
  },
  {
    value: 'refundable_24h',
    icon: 'solar:calendar-mark-bold-duotone',
    labelKey: 'cancellationRefundable24h',
    label: 'Refundable up to 24 hours before',
    descriptionKey: 'cancellationRefundable24hDescription',
    description: 'Customers get a refund if they cancel at least 24 hours before the appointment.',
  },
];

export function getCancellationPolicy(value) {
  return CANCELLATION_POLICY_OPTIONS.find((option) => option.value === value) || CANCELLATION_POLICY_OPTIONS[0];
}
