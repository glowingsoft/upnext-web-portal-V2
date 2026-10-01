import { useEffect, useMemo } from 'react';

import { applySorting } from 'src/utils/table-utils';

// ----------------------------------------------------------------------

function getNestedValue(row, path) {
  return path.split('.').reduce((value, key) => value?.[key], row);
}

function filterRowsBySearch(rows, searchValue, searchFields) {
  const search = (searchValue || '').toLowerCase().trim();
  if (!search) return rows;

  return rows.filter((row) =>
    searchFields.some((field) => String(getNestedValue(row, field) ?? '').toLowerCase().includes(search))
  );
}

function paginateRows(rows, page, rowsPerPage) {
  const start = page * rowsPerPage;
  return rows.slice(start, start + rowsPerPage);
}

// ----------------------------------------------------------------------

export function useClientSideTablePagination({
  rows = [],
  searchValue = '',
  searchFields = [],
  filterFn,
  currentPage = 0,
  itemsPerPage = 10,
  onPageChange,
  orderBy,
  order,
}) {
  const filteredRows = useMemo(() => {
    let result = filterRowsBySearch(rows, searchValue, searchFields);
    if (filterFn) {
      result = result.filter(filterFn);
    }
    return result;
  }, [rows, searchValue, searchFields, filterFn]);

  const sortedRows = useMemo(() => {
    if (!orderBy) return filteredRows;
    return applySorting(filteredRows, orderBy, order);
  }, [filteredRows, orderBy, order]);

  const paginatedRows = useMemo(
    () => paginateRows(sortedRows, currentPage, itemsPerPage),
    [sortedRows, currentPage, itemsPerPage]
  );

  useEffect(() => {
    if (!onPageChange) return;

    const maxPage = Math.max(0, Math.ceil(sortedRows.length / itemsPerPage) - 1);
    if (currentPage > maxPage) {
      onPageChange(null, maxPage);
    }
  }, [sortedRows.length, currentPage, itemsPerPage, onPageChange]);

  return {
    paginatedRows,
    totalCount: sortedRows.length,
  };
}
