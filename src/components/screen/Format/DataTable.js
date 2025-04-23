import React, { useState } from "react";
import {
  Table,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
} from "lucide-react";

export default function DataTable({ data }) {
  // Default data if none is provided
  const defaultData = {
    title: "Project Data",
    columns: [
      { id: "name", label: "Project Name", sortable: true },
      { id: "type", label: "Type", sortable: true },
      { id: "status", label: "Status", sortable: true },
      { id: "date", label: "Date", sortable: true },
    ],
    rows: [
      {
        id: 1,
        name: "React Project",
        type: "Frontend",
        status: "Completed",
        date: "2025-02-15",
      },
      {
        id: 2,
        name: "API Service",
        type: "Backend",
        status: "In Progress",
        date: "2025-03-01",
      },
      {
        id: 3,
        name: "Mobile App",
        type: "Full Stack",
        status: "Planning",
        date: "2025-04-10",
      },
      {
        id: 4,
        name: "E-commerce Site",
        type: "Frontend",
        status: "Completed",
        date: "2025-01-20",
      },
      {
        id: 5,
        name: "Data Dashboard",
        type: "Frontend",
        status: "In Progress",
        date: "2025-03-15",
      },
    ],
  };

  // Use provided data or fallback to defaults
  const tableData = data || defaultData;

  const [rows, setRows] = useState(tableData.rows);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sortedData = [...rows].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
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
    const newFilters = { ...filters, [columnId]: value };
    if (!value) delete newFilters[columnId];
    setFilters(newFilters);

    // Apply filters
    const filteredData = tableData.rows.filter((row) => {
      return Object.keys(newFilters).every((key) => {
        const filterValue = newFilters[key].toLowerCase();
        const cellValue = String(row[key]).toLowerCase();
        return cellValue.includes(filterValue);
      });
    });

    setRows(filteredData);
  };

  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // In a real app, you would generate and download CSV/Excel here
      setIsExporting(false);
      alert("Data exported successfully!");
    }, 1000);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    let bgColor;
    let textColor;

    switch (status) {
      case "Completed":
        bgColor = "bg-green-100 dark:bg-green-900/30";
        textColor = "text-green-800 dark:text-green-400";
        break;
      case "In Progress":
        bgColor = "bg-blue-100 dark:bg-blue-900/30";
        textColor = "text-blue-800 dark:text-blue-400";
        break;
      case "Planning":
        bgColor = "bg-amber-100 dark:bg-amber-900/30";
        textColor = "text-amber-800 dark:text-amber-400";
        break;
      default:
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
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
          <Table className="mr-2 h-4 w-4" />
          {tableData.title}
        </h3>

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
          <button
            onClick={handleExport}
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            title="Export Data"
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-slate-600 dark:border-slate-400 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => window.open("#", "_blank")}
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            title="Settings"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
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
                      column.sortable
                        ? "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                        : ""
                    }`}
                    onClick={() => column.sortable && requestSort(column.id)}
                  >
                    <span>{column.label}</span>
                    {getSortIcon(column)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => console.log("Row clicked:", row)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {row.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(row.date)}
                  </td>
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
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <span>
          Showing {rows.length} of {tableData.rows.length} projects
          {Object.keys(filters).length > 0 && " (filtered)"}
        </span>

        <div className="flex items-center space-x-2">
          <button
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            onClick={() => {
              setFilters({});
              setRows(tableData.rows);
              setIsFilterOpen(false);
            }}
          >
            {Object.keys(filters).length > 0 ? "Clear Filters" : "View All"}
          </button>
        </div>
      </div>
    </div>
  );
}
