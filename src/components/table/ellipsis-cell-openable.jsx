import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// ----------------------------------------------------------------------

const NA = 'N/A';

/** Table cell with ellipsis + optional tooltip; opens preview when clickable content is clicked. */
export function EllipsisCellOpenable({
  children,
  maxWidth = '150px',
  onOpen,
  openLabel,
  tooltipWhenOverflow = true,
  ...props
}) {
  const textRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const resolved = typeof children === 'number' ? String(children) : children;
  const str = resolved == null || resolved === '' ? '' : String(resolved);
  const canOpen = str && str !== NA && typeof onOpen === 'function';

  const checkOverflow = () => {
    const el = textRef.current;
    if (!el) return;
    setShowTooltip(el.scrollWidth > el.clientWidth);
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  useEffect(() => {
    const timeout = setTimeout(checkOverflow, 50);
    return () => clearTimeout(timeout);
  }, [children]);

  const handleKeyDown = (e) => {
    if (!canOpen) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  const handleClick = (e) => {
    if (!canOpen) return;
    e.stopPropagation();
    onOpen();
  };

  const content = (
    <span
      ref={textRef}
      style={{
        display: 'inline-block',
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </span>
  );

  const interactive = canOpen ? (
    <span
      role="button"
      tabIndex={0}
      aria-label={openLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ display: 'inline-block', width: '100%' }}
    >
      {content}
    </span>
  ) : (
    content
  );

  return (
    <TableCell
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth,
        cursor: canOpen ? 'pointer' : 'default',
      }}
      {...props}
    >
      {tooltipWhenOverflow && showTooltip ? (
        <Tooltip
          title={children}
          arrow
          enterDelay={400}
          disableInteractive
          disableTouchListener={canOpen}
          describeChild
        >
          {interactive}
        </Tooltip>
      ) : (
        interactive
      )}
    </TableCell>
  );
}

EllipsisCellOpenable.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOpen: PropTypes.func,
  openLabel: PropTypes.string,
  tooltipWhenOverflow: PropTypes.bool,
};
