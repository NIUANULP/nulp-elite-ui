import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const BatchDetailsSection = ({ batchData, className, formatDate, isGuest }) => {
  const { t } = useTranslation();
  const fallback = isGuest ? "" : "Not Provided";

  return (
    <Box
      style={{
        background: "#F9FAFC",
        padding: "10px",
        borderRadius: "10px",
        color: "#484848",
        boxShadow: "0px 4px 4px 0px #00000040",
      }}
      className={className}
    >
      <Typography
        variant="h7"
        style={{
          margin: "0 0 9px 0",
          display: "block",
          fontSize: "16px",
        }}
      >
        {t("BATCH_DETAILS")}:
      </Typography>
      <Box
        style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <Typography
          variant="h7"
          style={{
            fontWeight: "500",
            margin: "9px 0",
            display: "block",
            fontSize: "14px",
          }}
        >
          {t("BATCH_START_DATE")}:{" "}
          {batchData?.startDate
            ? formatDate(batchData?.startDate)
            : fallback}
        </Typography>
        <Typography
          variant="h7"
          style={{
            fontWeight: "500",
            margin: "9px 0",
            display: "block",
            fontSize: "14px",
          }}
        >
          {t("BATCH_END_DATE")}:{" "}
          {batchData?.endDate ? formatDate(batchData?.endDate) : fallback}
        </Typography>
        <Typography
          variant="h7"
          style={{
            fontWeight: "500",
            margin: "9px 0",
            display: "block",
            fontSize: "14px",
          }}
        >
          {t("LAST_DATE_FOR_ENROLLMENT")}:{" "}
          {batchData?.enrollmentEndDate
            ? formatDate(batchData.enrollmentEndDate)
            : fallback}
        </Typography>
      </Box>
    </Box>
  );
};

BatchDetailsSection.propTypes = {
  batchData: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    enrollmentEndDate: PropTypes.string,
  }),
  className: PropTypes.string,
  formatDate: PropTypes.func.isRequired,
  isGuest: PropTypes.bool,
};

BatchDetailsSection.defaultProps = {
  batchData: {},
  className: "",
  isGuest: false,
};

export default BatchDetailsSection;
