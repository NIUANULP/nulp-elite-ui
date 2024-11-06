import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const PDFContent = () => {
  //   const { contentId } = useParams();
  const { t } = useTranslation();

  // Now contentId contains the value from the URL parameter
  return (
    <div>
      <Header />
      <Box>
      <Container maxWidth="md" role="main" className="container-pb">
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Breadcrumbs
              aria-label="breadcrumb"
              style={{
                padding: "25px 0",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <Link underline="hover" color="#004367" href="/">
                {t("COURSES")}
              </Link>
              <Link
                underline="hover"
                href=""
                aria-current="page"
                color="#484848"
              >
                Case of Urban Sanitation in India
                {/* {userData?.result?.content?.name} */}
              </Link>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={4}>
            <Link
              href="#"
              style={{
                textAlign: "right",
                marginTop: "20px",
                display: "block",
              }}
            >
              <ShareOutlinedIcon />
            </Link>
          </Grid>
        </Grid>
        <Box>
          <Typography
            variant="h7"
            style={{
              margin: "0 0 9px 0",
              display: "block",
              fontSize: "11px",
            }}
          >
            {t("RELEVANT_FOR")}:
            <Button
              size="small"
              style={{
                background: "#ffefc2",
                color: "#484848",
                fontSize: "10px",
                margin: "0 10px",
              }}
            >
              SWM
              {/* {userData?.result?.content?.board} */}
            </Button>
            <Button
              size="small"
              style={{
                background: "#ffefc2",
                color: "#484848",
                fontSize: "10px",
              }}
            >
              {" "}
              Sanitation
              {/* {userData?.result?.content?.gradeLevel} */}
            </Button>
          </Typography>
        </Box>
        PDF will be intergrated Here
      </Container>
      <FloatingChatIcon />
      </Box>
      <Footer />
    </div>
  );
};

export default PDFContent;
