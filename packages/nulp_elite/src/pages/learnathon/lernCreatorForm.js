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
const urlConfig = require("../../configs/urlConfig.json");
import * as util from "../../services/utilService";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";

// const [globalSearchQuery, setGlobalSearchQuery] = useState();
// // location.state?.globalSearchQuery || undefined
// const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");

const categories = [
  "State / UT / SPVs / ULBs / Any Other",
  "Industry",
  "Academia",
];

const themes = [
  "Solid Waste Management",
  "Environment and Climate",
  "WASH - Water, Sanitation and Hygiene",
  "Urban Planning and Housing",
  "Transport and Mobility",
  "Social Aspects",
  "Municipal Finance",
  "General Administration",
  "Governance and Urban Management",
  "Miscellaneous/ Others",
];

const LernCreatorForm = () => {
  const _userId = util.userId(); // Assuming util.userId() is defined
  const [isEdit, setIsEdit] = useState(false);
  const [isNotDraft, setIsNotDraft] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    mobile_number: "",
    icon: "",
    category_of_participation: "",
    name_of_organisation: "",
    name_of_department_group: "",
    indicative_theme: "",
    other_indicative_themes: "",
    title_of_submission: "",
    description: "",
    content_id: null,
    consent_checkbox: false,
    status: "",
    created_by: _userId,

    // "link_to_guidelines": "https://demo.com/guideline",
  });
  const [guidelineLink, setGuidelineLink] = useState("");
  const location = useLocation();
  const queryString = location.search;
  let contentId = queryString.startsWith("?do_")
    ? queryString.slice(1)
    : undefined;
  useEffect(() => {
    fetchData();
    getUserData();
  }, [contentId]);
  const reader = new FileReader();

  const fetchData = async () => {
    const requestBody = {
      request: {
        filters: {
          created_by: _userId,
          learnathon_content_id: contentId,
        },
      },
    };
    if (contentId) {
      try {
        const response = await fetch(`${urlConfig.URLS.LEARNATHON.LIST}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch polls");
        }

        const result = await response.json();
        setIsEdit(true);
        const readResponse = result.result.data[0];
        if (result.result.data[0].status != "draft") {
          setIsNotDraft(true);
        }
        // Update formData with the response data
        setFormData((prevFormData) => ({
          ...prevFormData,
          user_name: readResponse.user_name || "",
          email: readResponse.email || "",
          mobile_number: readResponse.mobile_number || "",
          icon: readResponse.icon || "",
          category_of_participation:
            readResponse.category_of_participation || "",
          name_of_organisation: readResponse.name_of_organisation || "",
          name_of_department_group: readResponse.name_of_department_group || "",
          indicative_theme: readResponse.indicative_theme || "",
          other_indicative_themes: readResponse.other_indicative_themes || "",
          title_of_submission: readResponse.title_of_submission || "",
          description: readResponse.description || "",
          content_id: readResponse.content_id || null,
          consent_checkbox: readResponse.consent_checkbox || false,
          status: readResponse.status || "",
          created_by: readResponse.created_by || _userId, // assuming _userId is defined elsewhere
          // If you want to include the link to guidelines:
          // link_to_guidelines: readResponse.link_to_guidelines || "",
        }));
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.user_name) tempErrors.user_name = "User Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Email is not valid";

    if (!formData.mobile_number)
      tempErrors.mobile_number = "Mobile Number is required";
    else if (!/^\d{10}$/.test(formData.mobile_number))
      tempErrors.mobile_number = "Mobile Number must be 10 digits";

    if (!formData.category_of_participation)
      tempErrors.category_of_participation =
        "Category of Participation is required";
    if (!formData.name_of_organisation)
      tempErrors.name_of_organisation = "Name of Organisation is required";
    if (!formData.indicative_theme)
      tempErrors.indicative_theme = "Indicative Theme is required";
    // if (!formData.other_indicative_theme) tempErrors.other_indicative_theme = "Indicative Theme is required";
    if (!formData.title_of_submission)
      tempErrors.title_of_submission = "Title of Submission is required";
    if (!formData.description)
      tempErrors.description = "Description is required";
    if (!formData.content_id) tempErrors.content_id = "File upload is required";
    if (!formData.consent_checkbox)
      tempErrors.consent_checkbox = "You must accept the terms and conditions";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const getUserData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const response = await fetch(url);
      const data = await response.json();
      setUserInfo(data.result.response);
    } catch (error) {
      console.error("Error while getting user data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleIconChange = async (e) => {
    reader.readAsDataURL(e.target.files[0]);
    const _uuid = uuidv4();
    const assetBody = {
      request: {
        asset: {
          primaryCategory: "asset",
          language: ["English"],
          code: _uuid,
          name: e.target.files[0].name,
          mediaType: "image",
          mimeType: "image/png",
          createdBy: _userId,
          channel: userInfo.rootOrg.channel,
        },
      },
    };
    try {
      const response = await fetch(`${urlConfig.URLS.ICON.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch polls");
      }

      const result = await response.json();
      console.log("suceesss----", result);

      const uploadBody = {
        request: {
          content: {
            fileName: e.target.files[0].name,
          },
        },
      };
      try {
        const response = await fetch(
          `${urlConfig.URLS.ICON.UPLOAD}/${result.result.identifier}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(uploadBody),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch polls");
        }

        const uploadResult = await response.json();
        console.log("upload suceesss------", uploadResult);
        setFormData({
          ...formData,
          icon: uploadResult.result.identifier,
        });
        setErrors({ ...errors, icon: "" });

        // setData(result.result.data);
        // setTotalPages(Math.ceil(result.result.totalCount / 10));
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }
  };
  const handleFileChange = async (e) => {
    console.log("e.target.files[0]----", e.target.files[0]);
    const _uuid = uuidv4();
    const assetBody = {
      request: {
        content: {
          primaryCategory: "Good Practices",
          contentType: "Resource",
          language: ["English"],
          code: _uuid,
          name: e.target.files[0].name,
          mediaType: "image",
          mimeType: e.target.files[0].type,
          createdBy: _userId,
          organisation: [userInfo.rootOrg.channel],
          createdFor: [userInfo.rootOrg.id],
        },
      },
    };
    try {
      const response = await fetch(`${urlConfig.URLS.ASSET.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch polls");
      }

      const result = await response.json();
      console.log("suceesss----", result);

      const uploadBody = {
        request: {
          content: {
            fileName: formData.title_of_submission,
          },
        },
      };
      try {
        const response = await fetch(
          `${urlConfig.URLS.ASSET.UPLOAD}/${result.result.identifier}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(uploadBody),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch polls");
        }

        const uploadResult = await response.json();
        console.log("upload suceesss------", uploadResult);
        setFormData({
          ...formData,
          content_id: uploadResult.result.identifier,
        });
        setErrors({ ...errors, content_id: "" });

        // setData(result.result.data);
        // setTotalPages(Math.ceil(result.result.totalCount / 10));
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      consent_checkbox: e.target.checked,
    });
  };

  const handleCategoryChange = (e) => {
    const category_of_participation = e.target.value;
    setFormData({ ...formData, category_of_participation });
    setErrors({ ...errors, category_of_participation: "" });
    // Set appropriate guideline link based on category_of_participation
    if (category_of_participation === "State / UT / SPVs / ULBs / Any Other") {
      setGuidelineLink("link-to-state-guidelines.pdf");
    } else if (category_of_participation === "Industry") {
      setGuidelineLink("link-to-industry-guidelines.pdf");
    } else if (category_of_participation === "Academia") {
      setGuidelineLink("link-to-academia-guidelines.pdf");
    } else {
      setGuidelineLink("");
    }
  };

  const checkDraftValidations = () => {
    let tempErrors = {};
    if (!formData.user_name) tempErrors.user_name = "User Name is required";
    if (!formData.title_of_submission)
      tempErrors.title_of_submission = "Title of Submission is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleSubmit = async (action) => {
    if (!formData.consent_checkbox) {
      alert("You must accept the terms and conditions.");
      return;
    }

    formData.created_by = _userId;
    // Handle form submission (draft or review)
    console.log("Form submitted:", formData);
    if (action === "draft") {
      formData.status = "draft";
      // Add validations

      if (!checkDraftValidations()) return;

      if (isEdit == false) {
        try {
          const response = await fetch(`${urlConfig.URLS.LEARNATHON.CREATE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch polls");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error.message);
          alert(error.message);
          // setError(error.message);
        } finally {
          // setIsLoading(false);
        }
      } else if (isEdit == true) {
        console.log("formData----", formData);
        try {
          const response = await fetch(
            `${urlConfig.URLS.LEARNATHON.UPDATE}?id=${contentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch polls");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error.message);
          alert(error.message);
          // setError(error.message);
        } finally {
          // setIsLoading(false);
        }
      }

      console.log("Saved as draft");
    } else if (action === "review") {
      formData.status = "review";
      if (!validate()) return;

      if (isEdit == false) {
        try {
          const response = await fetch(`${urlConfig.URLS.LEARNATHON.CREATE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch polls");
          }

          const result = await response.json();
          console.log("suceesss");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error);
          // setError(error.message);
        } finally {
          // setIsLoading(false);
        }
      } else {
        try {
          const response = await fetch(
            `${urlConfig.URLS.LEARNATHON.UPDATE}?id=${contentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch polls");
          }

          const result = await response.json();
          console.log("suceesss");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error);
          // setError(error.message);
        } finally {
          // setIsLoading(false);
        }
      }

      console.log("Sent for review");
    }
  };

  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        className="pb-30 allContent xs-pb-80 all-card-list mt-180"
      >
        <Grid container>
          <Grid item xs={10}>
            <Typography variant="h6" gutterBottom className="fw-600 mt-20">
              Upload Learnathon Submission
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Box my={2}>
              <Button
                className="viewAll"
                onClick={() =>
                  window.open(
                    "https://helpdesknulp.niua.org/public/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                style={{
                  float: "right",
                  padding: "7px 35px",
                  borderRadius: "20px !important",
                }}
              >
                Need Help
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{
            padding: "20px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          }}
        >
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              sx={{ borderBottom: "2px solid #057184", marginBottom: "20px" }}
            >
              <Typography variant="h6" gutterBottom>
                Participant Details
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Grid container>
                <Grid item xs={2} className="center-align">
                  <InputLabel htmlFor="User Name">
                    User Name <span className="mandatory-symbol"> *</span>
                  </InputLabel>
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="User Name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    error={!!errors.user_name}
                    helperText={errors.user_name}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container>
                <Grid item xs={2} className="center-align">
                  <InputLabel htmlFor="Email">
                    Email <span className="mandatory-symbol"> *</span>
                  </InputLabel>
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Grid container>
                <Grid item xs={2} className="center-align">
                  <InputLabel htmlFor="Mobile Number">
                    Mobile <br /> Number<span className="red"> *</span>
                  </InputLabel>
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Mobile Number"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    error={!!errors.mobile_number}
                    helperText={errors.mobile_number}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ borderBottom: "2px solid #057184" }}>
            <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
              Submission Details
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: "30px" }}>
            <Grid container>
              <Grid item xs={2} className="center-align">
                <InputLabel htmlFor="Name of Organisation">
                  Submission Icon
                </InputLabel>
              </Grid>
              <Grid item xs={10}>
                <TextField
                  type="file"
                  fullWidth
                  onChange={handleIconChange}
                  inputProps={{
                    accept: "jpg,png",
                  }}
                />
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <Alert className="mt-9" everity="info">
                  Supported formats: MP4, PDF, HTML5, YouTube links
                </Alert>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Grid item xs={12} sm={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Category of Participation">
                      Category of Participation
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={7}>
                    <TextField
                      select
                      fullWidth
                      margin="normal"
                      label="Category of Participation"
                      name="category_of_participation"
                      value={formData.category_of_participation}
                      onChange={handleCategoryChange}
                      error={!!errors.category_of_participation}
                      helperText={errors.category_of_participation}
                      required
                    >
                      {categories.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <Box>
                      {guidelineLink && (
                        <a
                          href={guidelineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View and Download Guidelines
                        </a>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Name of Organisation">
                      Name of Organisation{" "}
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Name of Organisation"
                      name="name_of_organisation"
                      value={formData.name_of_organisation}
                      onChange={handleChange}
                      error={!!errors.name_of_organisation}
                      helperText={errors.name_of_organisation}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Name of Department/Group">
                      Name of Department/Group
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Name of Department/Group"
                      name="name_of_department_group"
                      value={formData.name_of_department_group}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Indicative Theme">
                      Indicative Theme{" "}
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      select
                      fullWidth
                      margin="normal"
                      label="Indicative Theme"
                      name="indicative_theme"
                      value={formData.indicative_theme}
                      onChange={handleChange}
                      error={!!errors.indicative_theme}
                      helperText={errors.indicative_theme}
                      required
                    >
                      {themes.map((theme) => (
                        <MenuItem key={theme} value={theme}>
                          {theme}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Title of Submission">
                      Title of Submission{" "}
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Title of Submission"
                      name="title_of_submission"
                      value={formData.title_of_submission}
                      onChange={handleChange}
                      inputProps={{ maxLength: 20 }}
                      error={!!errors.title_of_submission}
                      helperText={errors.title_of_submission}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Description">
                      Description <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      inputProps={{ maxLength: 100 }}
                      error={!!errors.description}
                      helperText={errors.description}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="File Upload">
                      File Upload <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      type="file"
                      fullWidth
                      onChange={handleFileChange}
                      inputProps={{
                        accept:
                          "video/mp4,application/pdf,text/html,video/youtube",
                      }}
                      sx={{ border: "1px dashed" }}
                    />
                  </Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={10}>
                    <Alert className="mt-9" everity="info">
                      Supported formats: MP4, PDF, HTML5, YouTube links
                    </Alert>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                alignItems="center"
                direction="column"
                textAlign="center"
                className="mb-30"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.consent_checkbox}
                      onChange={handleCheckboxChange}
                      name="consent_checkbox"
                    />
                  }
                  label="Terms and conditions"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Grid
        container
        item
        xs={12}
        justifyContent="center"
        alignItems="center"
        direction="column"
        textAlign="center"
        className="mb-30"
      >
        <Box>
          Your submission will be used for NULP purposes only and your personal
          details will not be disclosed to any entity.
        </Box>

        <Box mt={3}>
          <Button
            disabled={isNotDraft}
            className="custom-btn-default"
            onClick={() => handleSubmit("draft")}
          >
            Save as Draft
          </Button>

          <Button
            disabled={isNotDraft}
            className="viewAll"
            onClick={() => handleSubmit("review")}
            sx={{ ml: 2, padding: "9px 35px" }} // Adds spacing between the buttons
          >
            Submit
          </Button>
        </Box>
      </Grid>

      <Footer />
    </>
  );
};

export default LernCreatorForm;
