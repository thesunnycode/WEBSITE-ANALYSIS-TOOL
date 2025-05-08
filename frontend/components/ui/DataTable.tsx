import React from "react";
import PropTypes from "prop-types";

const DataTable = ({ columns, data }) => {
  return (
    <table
      className="min-w-full divide-y divide-gray-200"
      role="table"
      aria-label="Data Table"
    >
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.accessor}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              role="columnheader"
            >
              {column.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} role="row">
            {columns.map((column) => (
              <td
                key={column.accessor}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                role="cell"
              >
                {row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataTable;
