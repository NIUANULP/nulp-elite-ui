import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const CertNotAttachedSection = ({
  isEnrolled,
  batchDetails,
  checkCertTemplate,
  className,
}) => {
  const { t } = useTranslation();

  if (!isEnrolled || !batchDetails || checkCertTemplate(batchDetails)) {
    return null;
  }

  return (
    <Box
      style={{
        background: "#e3f5ff",
        padding: "10px",
        borderRadius: "10px",
        color: "#424242",
      }}
      className={`${className} accordionBoxShadow`}
    >
      <Typography
        variant="h7"
        style={{
          margin: "0 0 9px 0",
          display: "block",
          fontSize: "16px",
        }}
      >
        {t("CERT_NOT_ATTACHED")}
      </Typography>
    </Box>
  );
};

export default CertNotAttachedSection;
