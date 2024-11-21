import React from "react";
import Button from "@mui/material/Button"; // Import MUI Button if using Material-UI

const ExportToCSV = ({ data, fileName }) => {
  console.log(data);
  const convertToCSV = (data) => {
    if (!data || !data.length) {
      return "";
    }

    // Get headers from the keys of the first object
    const headers = Object.keys(data[0]).join(",");

    // Map rows and escape values with double quotes for CSV formatting
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${value !== null ? value : ""}"`) // Replace null with an empty string
        .join(",")
    );

    // Combine headers and rows
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = () => {
    const csv = convertToCSV(data);
    console.log("csv-----", csv);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  return (
    <Button
      className="viewAll"
      variant="contained"
      color="primary"
      onClick={downloadCSV}
      sx={{ padding: "7px 45px", borderRadius: "90px !important" }}
    >
      Export to CSV
    </Button>
  );
};

export default ExportToCSV;
