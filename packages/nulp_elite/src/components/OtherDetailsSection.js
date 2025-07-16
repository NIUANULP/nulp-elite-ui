import React from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

const OtherDetailsSection = ({
  userData,
  courseData,
  formatDate,
  copyrightOpen,
  handlecopyrightOpen,
  handlecopyrightClose,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Accordion
        className={`${className} accordionBoxShadow`}
        style={{
          background: "#F9FAFC",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          className="h4-title"
        >
          {t("OTHER_DETAILS")}
        </AccordionSummary>
        <AccordionDetails style={{ background: "#fff" }}>
          <Typography className="h6-title">
            {t("CREATED_BY")}:{" "}
            {userData && userData.result && userData.result.content.creator}
          </Typography>
          <Typography className="h6-title">
            {t("PUBLISHED_ON_NULP_BY")}:{" "}
            {userData &&
              userData.result &&
              userData.result?.content?.orgDetails?.orgName}
          </Typography>
          <Typography className="h6-title">
            {t("CREATED_ON")}:{" "}
            {userData &&
              userData.result &&
              formatDate(userData.result.content.children[0].createdOn)}
          </Typography>
          <Typography className="h6-title">
            {t("UPDATED_ON")}:{" "}
            {userData &&
              userData.result &&
              formatDate(userData.result.content.children[0].lastUpdatedOn)}
          </Typography>

          <Typography
            className=""
            onClick={handlecopyrightOpen}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
              fontSize: "small",
            }}
          >
            {t("CREDITS")}
          </Typography>
          <Dialog
            open={copyrightOpen}
            onClose={handlecopyrightClose}
            sx={{ "& .MuiDialog-paper": { width: "455px" } }}
          >
            <DialogTitle>{t("CREDITS")}</DialogTitle>
            <DialogContent>
              <p
                style={{
                  color: "#4d4d4d",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {t("COPYRIGHT")}
              </p>
              {userData?.result?.content?.orgDetails?.orgName &&
              userData?.result?.content?.copyrightYear
                ? `${userData.result.content.orgDetails.orgName}, ${userData.result.content.copyrightYear}`
                : userData?.result?.content?.orgDetails?.orgName ||
                  userData?.result?.content?.copyrightYear}
              <h5>{t("THIS_CONTENT_IS_DERIVED_FROM")}</h5>
              <p
                style={{
                  color: "#4d4d4d",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {t("CONTENT")}
              </p>
              {userData?.result?.content?.name}
              <p
                style={{
                  color: "#4d4d4d",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {t("LICENSE_TERMS")}
              </p>
              {userData?.result?.content?.licenseDetails?.name}
              <p
                style={{
                  color: "#4d4d4d",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {t("PUBLISHED_ON_NULP_BY")}
              </p>
              {userData?.result?.content?.orgDetails?.orgName}
            </DialogContent>
            <DialogActions>
              <Button onClick={handlecopyrightClose} color="primary">
                {t("CLOSE")}
              </Button>
            </DialogActions>
          </Dialog>
          <Typography className="h6-title">
            {t("LICENSE_TERMS")}:{" "}
            {userData?.result?.content?.licenseDetails?.name}
            {t("FOR_DETAILS")}:{" "}
            <a
              href={userData?.result?.content?.licenseDetails?.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {userData?.result?.content?.licenseDetails?.url}
            </a>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default OtherDetailsSection;
