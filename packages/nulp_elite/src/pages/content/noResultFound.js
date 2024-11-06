import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import Box from "@mui/material/Box";
import { BorderAllRounded } from "@mui/icons-material";

const NoResult = () => {
  //   const { contentId } = useParams();
  const { t } = useTranslation();

  // Now contentId contains the value from the URL parameter
  return (
    <Box style={{ width: "100%" }}>
      {/* <Container maxWidth="md" role="main" className="container-pb"> */}
      <Box
        style={{
          fontSize: "30px",
          textAlign: "center",
          margin: "0 21px",
          BorderRadius: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
        className="center-box"
      >
        <SearchOffIcon style={{ fontSize: "70px", color: "#ccc" }} />
        <Box>{t("NO_RESULT_FOUND")}</Box>
      </Box>
      {/* </Container> */}
      <FloatingChatIcon />
    </Box>
  );
};

export default NoResult;
