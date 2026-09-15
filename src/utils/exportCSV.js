export function exportToCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("Nothing to export.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCell = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    // Wrap in quotes if it contains a comma, quote, or newline; double up any internal quotes
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
