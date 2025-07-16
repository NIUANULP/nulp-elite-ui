import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

const CertificationCriteriaSection = ({
  batchDetails,
  batchDetail,
  score,
  checkCertTemplate,
  className,
}) => {
  const { t } = useTranslation();

  if (!batchDetails || !checkCertTemplate(batchDetails)) {
    return null;
  }

  return (
    <Accordion
      className={`${className} accordionBoxShadow`}
      style={{
        background: "#F9FAFC",
        borderRadius: "10px",
        margin: "10px",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        className={`${className} h4-title`}
      >
        {t("CERTIFICATION_CRITERIA")}
      </AccordionSummary>
      <AccordionDetails
        style={{
          background: "#fff",
          margin: "5px 10px",
          borderRadius: "10px",
        }}
      >
        {batchDetail && (
          <ul>
            <li className="h6-title">{t("COMPLETION_CERTIFICATE_ISSUED")}</li>
            {score !== "no certificate" && (
              <li className="h6-title">
                {t("CERT_ISSUED_SCORE")}
                {` ${score}% `}
                {t("ASSESSMENT")}
              </li>
            )}
          </ul>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CertificationCriteriaSection;
