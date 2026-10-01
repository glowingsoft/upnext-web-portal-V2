import PropTypes from 'prop-types';

import { BookingsListContent } from '../../sessions-view/bookings-list-content';

export default function ClientBookingsTab({ client }) {
  return <BookingsListContent client={client} />;
}

ClientBookingsTab.propTypes = {
  client: PropTypes.object.isRequired,
};
