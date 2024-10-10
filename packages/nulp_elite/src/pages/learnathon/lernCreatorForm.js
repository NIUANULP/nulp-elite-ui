import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Footer from "components/Footer";
import Header from "components/header";
// const [globalSearchQuery, setGlobalSearchQuery] = useState();
// // location.state?.globalSearchQuery || undefined
// const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");

const categories = [
  "State / UT / SPVs / ULBs / Any Other",
  "Industry",
  "Academia",
];

const themes = [
  "NULP Domain 1",
  "NULP Domain 2",
  "NULP Domain 3",
  "NULP Domain 4",
  "NULP Domain 5",
  "NULP Domain 6",
  "NULP Domain 7",
  "NULP Domain 8",
  "NULP Domain 9",
  "NULP Domain 10",
  "Others",
];

const LernCreatorForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    submissionIcon: "",
    category: "",
    organisation: "",
    department: "",
    theme: "",
    title: "",
    description: "",
    file: null,
    consent: false,
  });

  const [guidelineLink, setGuidelineLink] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };
  const handleIconChange = (e) => {
    setFormData({
      ...formData,
      submissionIcon: e.target.files[0],
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      consent: e.target.checked,
    });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({ ...formData, category });

    // Set appropriate guideline link based on category
    if (category === "State / UT / SPVs / ULBs / Any Other") {
      setGuidelineLink("link-to-state-guidelines.pdf");
    } else if (category === "Industry") {
      setGuidelineLink("link-to-industry-guidelines.pdf");
    } else if (category === "Academia") {
      setGuidelineLink("link-to-academia-guidelines.pdf");
    } else {
      setGuidelineLink("");
    }
  };

  const handleSubmit = (action) => {
    if (!formData.consent) {
      alert("You must accept the terms and conditions.");
      return;
    }

    // Handle form submission (draft or review)
    console.log("Form submitted:", formData);
    if (action === "draft") {
      alert("Saved as draft");
    } else if (action === "review") {
      alert("Sent for review");
    }
  };

  return (
    <>
      <Header />
      <Paper elevation={3} sx={{ padding: "20px", backgroundColor: "#f9f4eb" }}>
        <Box p={3} maxWidth={800} mx="auto">
          <Typography variant="h5" gutterBottom>
            Upload Learnathon Submission
          </Typography>

          <Box my={2}>
            <Button
              variant="contained"
              onClick={() => (window.location.href = "/helpdesk")}
              style={{ float: "right" }}
            >
              Need Help
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            Participant Details
          </Typography>
          <Divider sx={{ marginBottom: "20px" }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="User Name*"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Email*"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Mobile Number*"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
            Submission Details
          </Typography>
          <Divider sx={{ marginBottom: "20px" }} />
          <Grid item xs={12}>
            <div>
              <Tooltip title="Supported formats: MP4, PDF, HTML5, YouTube links">
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <TextField
                type="file"
                fullWidth
                onChange={handleIconChange}
                inputProps={{
                  accept: "jpg,png",
                }}
              />
            </div>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                margin="normal"
                label="Category of Participation*"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              {guidelineLink && (
                <a
                  href={guidelineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View and Download Guidelines
                </a>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Name of Organisation*"
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Name of Department/Group"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                margin="normal"
                label="Indicative Theme*"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
              >
                {themes.map((theme) => (
                  <MenuItem key={theme} value={theme}>
                    {theme}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Title of Submission*"
                name="title"
                value={formData.title}
                onChange={handleChange}
                inputProps={{ maxLength: 20 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Description*"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                inputProps={{ maxLength: 100 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <div>
                <Tooltip title="Supported formats: MP4, PDF, HTML5, YouTube links">
                  <IconButton>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <TextField
                  type="file"
                  fullWidth
                  onChange={handleFileChange}
                  inputProps={{
                    accept: "video/mp4,application/pdf,text/html,video/youtube",
                  }}
                />
              </div>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consent}
                onChange={handleCheckboxChange}
                name="consent"
              />
            }
            label="I accept the terms and conditions"
          />

          <Typography
            variant="body2"
            color="textSecondary"
            gutterBottom
            style={{ marginTop: "20px" }}
          >
            Your submission will be used for NULP purposes only and your
            personal details will not be disclosed to any entity.
          </Typography>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit("draft")}
            >
              Save as Draft
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleSubmit("review")}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>
      <Footer />
    </>
  );
};

export default LernCreatorForm;
