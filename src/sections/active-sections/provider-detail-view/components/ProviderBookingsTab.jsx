import PropTypes from 'prop-types';

import { BookingsListContent } from '../../sessions-view/bookings-list-content';

export default function ProviderBookingsTab({ provider, isPublicView = false }) {
  return <BookingsListContent provider={provider} isPublicView={isPublicView} />;
}

ProviderBookingsTab.propTypes = {
  provider: PropTypes.object.isRequired,
  isPublicView: PropTypes.bool,
};
