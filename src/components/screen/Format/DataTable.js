import React, { useState, useEffect } from "react";
import {
  Table,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertCircle,
} from "lucide-react";

export default function DataTable({ data }) {
  const [tableData, setTableData] = useState(null);
  const [rows, setRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  // Process and validate data when it's received
  useEffect(() => {
    console.log("DataTable received data:", data);
    processData(data);
  }, [data]);

  const processData = (inputData) => {
    try {
      // Reset error state
      setError(null);

      // Handle null or undefined data
      if (!inputData) {
        setError("No data provided");
        setTableData(createDefaultTableData());
        setRows([]);
        return;
      }

      // Handle error object passed from parent
      if (inputData.error) {
        setError(inputData.error);
        setTableData(createDefaultTableData());
        setRows([]);
        return;
      }

      // Parse string data if needed
      let processedData = inputData;
      if (typeof inputData === "string") {
        try {
          processedData = JSON.parse(inputData);
        } catch (err) {
          console.error("Failed to parse string data:", err);
          setError("Invalid JSON data");
          setTableData(createDefaultTableData());
          setRows([]);
          return;
        }
      }

      // Handle different potential data structures
      let formattedData = { columns: [], rows: [] };

      // If data already has the expected structure
      if (
        processedData.columns &&
        Array.isArray(processedData.columns) &&
        processedData.rows &&
        Array.isArray(processedData.rows)
      ) {
        formattedData = {
          title: processedData.title || "Data Table",
          columns: processedData.columns,
          rows: processedData.rows,
        };
      }
      // If data is an array of objects (derive columns from first item)
      else if (Array.isArray(processedData)) {
        if (processedData.length === 0) {
          formattedData = {
            title: "Empty Dataset",
            columns: [],
            rows: [],
          };
        } else {
          // Use the first object's keys as columns
          const firstItem = processedData[0];
          const columns = Object.keys(firstItem).map((key) => ({
            id: key,
            label:
              key.charAt(0).toUpperCase() +
              key
                .slice(1)
                .replace(/([A-Z])/g, " $1")
                .trim(), // Convert camelCase to Title Case
          }));

          formattedData = {
            title: "Data Table",
            columns: columns,
            rows: processedData,
          };
        }
      }
      // Try to handle a custom structure
      else {
        console.warn("Unknown data structure:", processedData);

        // Try to extract title, columns, and rows from the data
        formattedData.title =
          processedData.title || processedData.name || "Data Table";

        // For columns, look for common column properties
        const possibleColumnsProps = [
          "columns",
          "headers",
          "fields",
          "properties",
        ];
        for (const prop of possibleColumnsProps) {
          if (processedData[prop] && Array.isArray(processedData[prop])) {
            formattedData.columns = processedData[prop];
            break;
          }
        }

        // If still no columns, try to derive them from the first row of data
        const possibleRowsProps = ["rows", "data", "items", "records"];
        for (const prop of possibleRowsProps) {
          if (processedData[prop] && Array.isArray(processedData[prop])) {
            formattedData.rows = processedData[prop];

            // Derive columns from the first row if needed
            if (
              formattedData.columns.length === 0 &&
              formattedData.rows.length > 0
            ) {
              const firstRow = formattedData.rows[0];
              formattedData.columns = Object.keys(firstRow).map((key) => ({
                id: key,
                label:
                  key.charAt(0).toUpperCase() +
                  key
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim(),
              }));
            }

            break;
          }
        }
      }

      // Ensure columns have id and label properties
      formattedData.columns = (formattedData.columns || []).map((col) => {
        if (typeof col === "string") {
          return { id: col, label: col.charAt(0).toUpperCase() + col.slice(1) };
        }
        return {
          id: col.id || col.key || col.name || "unknown",
          label: col.label || col.title || col.name || col.id || "Unknown",
          sortable: col.sortable !== false,
        };
      });

      // Validate columns and rows
      if (!formattedData.columns || formattedData.columns.length === 0) {
        setError("No columns defined in table data");
        // Add a default column if none exists
        formattedData.columns = [
          { id: "col1", label: "Column 1" },
          { id: "col2", label: "Column 2" },
        ];
      }

      if (!formattedData.rows || formattedData.rows.length === 0) {
        console.warn("No rows found in table data");
        // Don't set error, just show empty table
        formattedData.rows = [
          { col1: "No data available", col2: "Please try again" },
        ];
      }

      console.log("Processed table data:", formattedData);

      // Set the processed data
      setTableData(formattedData);
      setRows(formattedData.rows);
    } catch (err) {
      console.error("Error processing table data:", err);
      setError(`Error processing data: ${err.message}`);
      setTableData(createDefaultTableData());
      setRows([]);
    }
  };

  // Create default table data when actual data can't be processed
  const createDefaultTableData = () => {
    return {
      title: "Data Table",
      columns: [
        { id: "col1", label: "Column 1", sortable: true },
        { id: "col2", label: "Column 2", sortable: true },
      ],
      rows: [{ col1: "No data available", col2: "Please try again" }],
    };
  };

  // Handle sorting
  const requestSort = (key) => {
    if (!key) return;

    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    // Create a copy of rows to sort
    const sortedData = [...rows].sort((a, b) => {
      // Handle cases where key doesn't exist in objects
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      // Handle null and undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different types
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setRows(sortedData);
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.id) {
      return <ChevronDown className="h-4 w-4 opacity-40" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
    ) : (
      <ChevronDown className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
    );
  };

  // Handle filtering
  const handleFilterChange = (columnId, value) => {
    try {
      if (!columnId) return;

      const newFilters = { ...filters, [columnId]: value };
      if (!value) delete newFilters[columnId];
      setFilters(newFilters);

      // Apply filters - check if tableData exists first
      if (tableData && tableData.rows) {
        const filteredData = tableData.rows.filter((row) => {
          return Object.keys(newFilters).every((key) => {
            if (!row) return false;

            const filterValue = newFilters[key].toLowerCase();
            // Handle case where the property might not exist
            const cellValue =
              row[key] !== undefined && row[key] !== null
                ? String(row[key]).toLowerCase()
                : "";
            return cellValue.includes(filterValue);
          });
        });

        setRows(filteredData);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      // Don't change the rows if there's an error
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;

    let bgColor;
    let textColor;

    const statusLower = String(status).toLowerCase();

    if (
      statusLower.includes("complet") ||
      statusLower.includes("done") ||
      statusLower.includes("finish")
    ) {
      bgColor = "bg-green-100 dark:bg-green-900/30";
      textColor = "text-green-800 dark:text-green-400";
    } else if (
      statusLower.includes("progress") ||
      statusLower.includes("in ") ||
      statusLower.includes("ongoing")
    ) {
      bgColor = "bg-blue-100 dark:bg-blue-900/30";
      textColor = "text-blue-800 dark:text-blue-400";
    } else if (
      statusLower.includes("plan") ||
      statusLower.includes("pending") ||
      statusLower.includes("scheduled")
    ) {
      bgColor = "bg-amber-100 dark:bg-amber-900/30";
      textColor = "text-amber-800 dark:text-amber-400";
    } else if (
      statusLower.includes("cancel") ||
      statusLower.includes("stop") ||
      statusLower.includes("fail")
    ) {
      bgColor = "bg-red-100 dark:bg-red-900/30";
      textColor = "text-red-800 dark:text-red-400";
    } else {
      bgColor = "bg-slate-100 dark:bg-slate-700";
      textColor = "text-slate-800 dark:text-slate-300";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Return original string if it can't be parsed as a date
    }
  };

  // Determine if a column might be a status column
  const isStatusColumn = (columnId, columnLabel) => {
    if (!columnId || !columnLabel) return false;

    const id = String(columnId).toLowerCase();
    const label = String(columnLabel).toLowerCase();
    return id.includes("status") || label.includes("status");
  };

  // Determine if a column might be a date column
  const isDateColumn = (columnId, columnLabel) => {
    if (!columnId || !columnLabel) return false;

    const id = String(columnId).toLowerCase();
    const label = String(columnLabel).toLowerCase();
    return (
      id.includes("date") ||
      id.includes("time") ||
      label.includes("date") ||
      label.includes("time")
    );
  };

  // Safely access cell value
  const getCellValue = (row, columnId) => {
    if (!row || row[columnId] === undefined) return "";
    return String(row[columnId]);
  };

  // Loading state
  if (!tableData) {
    return (
      <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 p-4 text-center">
        <div className="animate-pulse">Loading table data...</div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
          <Table className="mr-2 h-4 w-4" />
          {tableData.title || "Data Table"}
        </h3>

        {tableData.columns && tableData.columns.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer ${
                Object.keys(filters).length > 0
                  ? "text-indigo-600 dark:text-indigo-400"
                  : ""
              }`}
              title="Filter Data"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Note: Using default table data. {error}</span>
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && tableData.columns && tableData.columns.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filter Data
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {tableData.columns.map((column) => (
              <div key={`filter-${column.id}`} className="flex flex-col">
                <label
                  htmlFor={`filter-${column.id}`}
                  className="text-xs text-slate-500 dark:text-slate-400 mb-1"
                >
                  {column.label}
                </label>
                <input
                  id={`filter-${column.id}`}
                  type="text"
                  value={filters[column.id] || ""}
                  onChange={(e) =>
                    handleFilterChange(column.id, e.target.value)
                  }
                  placeholder={`Filter ${column.label.toLowerCase()}`}
                  className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {tableData.columns && tableData.columns.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {tableData.columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  >
                    <button
                      className={`flex items-center space-x-1 focus:outline-none ${
                        column.sortable !== false
                          ? "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          : ""
                      }`}
                      onClick={() =>
                        column.sortable !== false && requestSort(column.id)
                      }
                    >
                      <span>{column.label}</span>
                      {getSortIcon({
                        ...column,
                        sortable: column.sortable !== false,
                      })}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {rows.length > 0 ? (
                rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    {tableData.columns.map((column) => (
                      <td
                        key={`${rowIndex}-${column.id}`}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {isStatusColumn(column.id, column.label) ? (
                          getStatusBadge(getCellValue(row, column.id))
                        ) : isDateColumn(column.id, column.label) ? (
                          formatDate(getCellValue(row, column.id))
                        ) : (
                          <span
                            className={
                              column.id === tableData.columns[0].id
                                ? "font-medium text-slate-900 dark:text-white"
                                : "text-slate-700 dark:text-slate-300"
                            }
                          >
                            {getCellValue(row, column.id)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableData.columns.length}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No data matches your filter criteria. Try adjusting your
                    filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No columns defined for this table.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <span>
          Showing {rows.length} of {tableData.rows?.length || 0} items
          {Object.keys(filters).length > 0 && " (filtered)"}
        </span>

        <div className="flex items-center space-x-2">
          <button
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            onClick={() => {
              setFilters({});
              setRows(tableData.rows || []);
              setIsFilterOpen(false);
            }}
          >
            {Object.keys(filters).length > 0 ? "Clear Filters" : "Reset View"}
          </button>
        </div>
      </div>
    </div>
  );
}
