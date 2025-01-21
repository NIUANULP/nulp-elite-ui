import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "components/header";
import Footer from "components/Footer";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";
import Alert from "@mui/material/Alert";

const useStyles = makeStyles((theme) => ({
  active: {
    color: "#004367", // Change color to blue
    textDecoration: "underline", // Add underline
  },
}));

const FAQPage = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [faqData, setFaqData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Login");
  const [error, setError] = useState(null);
  const setLanguage = localStorage.getItem('lang') || 'en';
  let url;
  if (setLanguage === 'en') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-en.json";
  } else if (setLanguage === 'hi') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-hi.json";
  } else if (setLanguage === 'gg') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-gu.json";
  } else if (setLanguage === 'ta') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-ta.json";
  } else if (setLanguage === 'be') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-be.json";
  } else if (setLanguage === 'ma') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-mr.json";
  } else if (setLanguage === 'mal') {
    url = "https://nulpstorage.blob.core.windows.net/public/portal-faq/resources/res/faq-ml.json";
  }
  
  useEffect(() => {
    setError(null);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((result) => {
        setFaqData(result.categories);
      })
      .catch((error) => {
        console.error("Error fetching FAQ data:", error);
        setError(error.message);
      });
  }, [url, setLanguage]);

  return (
    <div>
      <Header />
      <Box>
      {setLanguage && url && <Container maxWidth="xl" role="main" className="min-472 pb-30">
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}
        <Box sx={{ fontSize: "18px", color: "#484848", marginTop: "15px" }}>
          {t("FAQS")}
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={3}>
            <Accordion

              style={{
                background: "#f9fafc",
                borderRadius: "10px",
                marginTop: "10px",
                maxHeight: "calc(100vh - 20px)",
                overflow: "auto",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{
                  background: "#F9FAFC",
                  borderRadius: "10px",
                  position: "sticky",
                  top: "0",
                  zIndex: "1",
                }}
                className="h5-title"
              >
                {t("SELECT_CATEGORY")}
              </AccordionSummary>
              <AccordionDetails
                style={{ background: "#fff" }}
                className="h6-title"
              >
                {faqData.map((category, index) => (
                  <li
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    className={
                      selectedCategory === category.name ? classes.active : ""
                    }
                    style={{ cursor: "pointer", marginBottom: "10px" }}
                  >
                    {t(category.name.toUpperCase())}
                  </li>
                ))}
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12} lg={9}>
            {faqData
              .filter((category) => category.name === selectedCategory)
              .map((selectedCategoryData, index) => (
                <div key={index}>
                  {selectedCategoryData.faqs.map((faq, faqIndex) => (
                    <Accordion
                      key={faqIndex}
                      style={{
                        background: "#f9fafc",
                        borderRadius: "10px",
                        marginTop: "10px",
                        maxHeight: "calc(100vh - 20px)",
                        overflow: "auto",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        style={{
                          background: "#F9FAFC",
                          borderRadius: "10px",
                          position: "sticky",
                          top: "0",
                          zIndex: "1",
                        }}
                        className="h5-title"
                      >
                        {faq.topic}
                      </AccordionSummary>
                      <AccordionDetails
                        style={{ background: "#fff" }}
                        className="h6-title"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: faq.description,
                          }}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              ))}
          </Grid>
        </Grid>
      </Container>}
      </Box>
      <Footer />
    </div>
  );
};

export default FAQPage;
