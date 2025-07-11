import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Typography,
  Box,
  Grid,
  Modal,
  Autocomplete,
  Radio,
  RadioGroup,
  CircularProgress,
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
import acdemiaguideline from "../../assets/academia-guidelines.pdf";
import stateguideline from "../../assets/state-guidelines.pdf";
import industryguideline from "../../assets/industry-guidelines.pdf";
import industrytnc from "../../assets/tnc.pdf";
import acdemiatnc from "../../assets/tnc.pdf";
import statetnc from "../../assets/tnc.pdf";
import Loader from "components/Loader";
import Checkbox from "@mui/material/Checkbox";

import citiesInIndia from "./learnCities.json";
import Alert from "@mui/material/Alert";
const routeConfig = require("../../configs/routeConfig.json");
import dayjs from "dayjs";

import { Observable } from "rxjs";

import { useTranslation } from "react-i18next";

const isFormClosed = dayjs().isAfter(
  dayjs(urlConfig.LEARNATHON_DATES.CONTENT_SUBMISSION_END_DATE),
  "minute"
);

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
  //"Miscellaneous/ Others",
];
const IndianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Puducherry",
  "Ladakh",
];

// List of some popular cities in India

//  Add more cities as needed
const LernCreatorForm = () => {
  const _userId = util.userId(); // Assuming util.userId() is defined
  const [isEdit, setIsEdit] = useState(false);
  const [isNotDraft, setIsNotDraft] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [openPersonalForm, setOpenPersonalForm] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [indicativeThemes, setIndicativeThemes] = useState([]);
  const [indicativeSubThemes, setIndicativeSubThemes] = useState([]);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadType, setUploadType] = useState("file");
  const [previewPlayerPage, setPreviewPlayerPage] = useState();
  const [iconPreviewPage, setIconPreviewPage] = useState();
  const [youtubeUrl, setyoutubeURL] = useState();
  const [preIndicativeTheme, setPreIndicativeThemes] = useState();
  const [TNCOpen, setTNCOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUploadTypeChange = (event) => {
    console.log(event.target.value);
    setUploadType(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredStates = IndianStates.filter((state) =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    indicative_sub_theme: "",
    state: "",
    city: "",
    title_of_submission: "",
    description: "",
    content_id: null,
    consent_checkbox: false,
    status: "",
    created_by: _userId,

    // "link_to_guidelines": "https://demo.com/guideline",
  });
  const [guidelineLink, setGuidelineLink] = useState("");
  const [TNCLink, setTNCLink] = useState("");
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
          throw new Error("Something went wrong");
        }

        const result = await response.json();
        setPreviewPlayerPage(result.result.data[0].content_id);
        setIconPreviewPage(result.result.data[0].icon);
        // fetchIconData(result.result.data[0].icon);
        fetchContentData(result.result.data[0].content_id);
        setIsEdit(true);
        const readResponse = result.result.data[0];
        if (result.result.data[0].status != "draft") {
          setIsNotDraft(true);
        }
        if (readResponse.indicative_theme) {
          setPreIndicativeThemes(readResponse.indicative_theme);
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
          indicative_sub_theme: readResponse.indicative_sub_theme || "",
          state: readResponse.state || "",
          city: readResponse.city || "",
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
      } finally {
      }
    }
  };
  // const fetchIconData = async (icon) => {
  //   try {
  //     const response = await fetch(
  //       `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.GET}/${content_Id}?fields=transcripts,ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author,badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors,copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain,editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl,keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData,osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl,subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory,additionalCategories,interceptionPoints,interceptionType&orgdetails=orgName,email&licenseDetails=name,description,url`,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch course data");
  //     const data = await response.json();
  //     console.log("uploadedeeee content -------", data.result.content);
  //   } catch (error) {
  //     console.error("Error fetching course data:", error);
  //   }
  // };
  const fetchContentData = async (content_Id) => {
    try {
      const response = await fetch(
        `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.GET}/${content_Id}?fields=transcripts,ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author,badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors,copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain,editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl,keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData,osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl,subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory,additionalCategories,interceptionPoints,interceptionType&orgdetails=orgName,email&licenseDetails=name,description,url`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch course data");
      const data = await response.json();
      console.log("content readddd-----", data.result.content);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };
  const handleCityChange = (event, newValue) => {
    setFormData({
      ...formData,
      city: newValue || event.target.value,
    });
  };
  const validate = () => {
    let tempErrors = {};

    if (!formData.user_name) tempErrors.user_name = "User Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    )
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
    if (
      !formData.indicative_sub_theme &&
      formData.indicative_theme !== "Miscellaneous/ Others"
    )
      tempErrors.indicative_sub_theme = "Indicative Sub Theme is required";
    if (
      formData.indicative_theme == "Miscellaneous/ Others" &&
      !formData.other_indicative_themes
    )
      tempErrors.other_indicative_themes = "Provide other indicative theme";

    //if (!formData.state) tempErrors.state = "Provide state";

    //if (!formData.city) tempErrors.city = "Provide city";
    if (!formData.title_of_submission)
      tempErrors.title_of_submission = "Title of Submission is required";
    if (!formData.description)
      tempErrors.description = "Description is required";
    if (!formData.content_id) tempErrors.content_id = "File upload is required";
    if (!formData.consent_checkbox)
      tempErrors.consent_checkbox = "You must accept the terms and conditions";

    if (!formData.consent_checkbox) {
      alert("You must accept the terms and conditions.");
      return;
    }

    setErrors(tempErrors);
    console.log(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const getUserData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("userInfo---", data.result.response);
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

  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    const selectedBoard = e.target.value;
    console.log(selectedBoard, "selectedBoard");
    const selectedIndex = indicativeThemes.findIndex(
      (category) => category.name === selectedBoard
    );
    if (selectedIndex !== -1) {
      setIndicativeSubThemes(
        indicativeThemes[selectedIndex]?.associations || []
      );
    } else {
      setIndicativeSubThemes([]);
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handlesubthemeChange = (e) => {
    const { name, value } = e.target;
    const selectedsubBoard = e.target.value;
    console.log(selectedsubBoard, "selectedsubBoard");
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleIconChange = async (e) => {
    reader.readAsDataURL(e.target.files[0]);
    const mimeType = e.target.files[0].type;
    const _uuid = uuidv4();
    const assetBody = {
      request: {
        asset: {
          primaryCategory: "asset",
          language: ["English"],
          code: _uuid,
          name: formData.title_of_submission
            ? formData.title_of_submission
            : "Untitled Content",
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
        throw new Error("Something went wrong");
      }

      const result = await response.json();

      const uploadUrlBody = {
        request: {
          content: {
            fileName: e.target.files[0].name,
          },
        },
      };

      try {
        const response = await fetch(
          `${urlConfig.URLS.ICON.UPLOADIMG}/${result.result.identifier}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(uploadUrlBody),
          }
        );

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const uploadResult = await response.json();
        const uploadBody = new FormData();
        uploadBody.append("file", e.target.files[0]);
        uploadBody.append("mimeType", "image/png");

        try {
          const response = await fetch(
            `${urlConfig.URLS.ICON.UPLOAD}${result.result.identifier}?enctype=multipart/form-data&processData=false&contentType=false&cache=false`,
            {
              method: "POST",
              body: uploadBody,
            }
          );
          if (!response.ok) {
            alert("Something went wrong while uploading Image");
            throw new Error("Something went wrong");
          }

          const uploadResult = await response.json();
          console.log(uploadResult.result.artifactUrl);
          setFormData({
            ...formData,
            icon: uploadResult.result.artifactUrl,
          });

          setErrors({ ...errors, icon: "" });
        } catch (error) {
          console.log("error---", error);
        } finally {
        }

        setErrors({ ...errors, icon: "" });
      } catch (error) {
        console.log("error---", error);
      } finally {
      }
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
    }
    // setFormData({
    //   ...formData,
    //   icon: "https://devnewnulp.blob.core.windows.net/contents/content/do_1141731824771481601676/artifact/do_1141731824771481601676_1730124815972_samplejpgimage_2mbmb.jpg",
    // });
  };
  const handleFileChange = async (e, type) => {
    if (type == "file") {
      const _uuid = uuidv4();
      const assetBody = {
        request: {
          content: {
            primaryCategory: "Good Practices",
            contentType: "Resource",
            language: ["English"],
            code: _uuid,
            name: formData.title_of_submission
              ? formData.title_of_submission
              : "Untitled Content",
            framework: "nulp-learn",
            mimeType:
              e.target.files[0].type == "application/zip"
                ? "application/vnd.ekstep.html-archive"
                : e.target.files[0].type,
            createdBy: _userId,
            organisation: [userInfo.rootOrg.channel],
            createdFor: [userInfo.rootOrg.id],
          },
        },
      };
      console.log("assetBody-----", assetBody);
      try {
        const response = await fetch(`${urlConfig.URLS.ASSET.CREATE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assetBody),
        });

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const result = await response.json();
        console.log("success----", result);

        const imgId = result.result.identifier;
        const uploadBody = {
          request: {
            content: {
              fileName: e.target.files[0].name,
            },
          },
        };

        try {
          const response = await fetch(
            `${urlConfig.URLS.ASSET.UPLOADURL}/${result.result.identifier}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(uploadBody),
            }
          );

          if (!response.ok) {
            throw new Error("Something went wrong");
          }

          const uploadResult = await response.json();
          console.log("upload success------", uploadResult);

          const url = uploadResult.result.pre_signed_url;
          const file = e.target.files[0];
          setLoading(true);
          const uploader = new SunbirdFileUploadLib.FileUploader();

          uploader
            .upload({
              file: file,
              url: url,
              csp: "azure",
            })
            .on("error", (error) => {
              console.log("error", error);
              setLoading(false);
            })
            .on("completed", async (completed) => {
              console.log("completed", completed);
              const fileURL = url.split("?")[0];

              const data = new FormData();
              const mimeType =
                e.target.files[0].type == "application/zip"
                  ? "application/vnd.ekstep.html-archive"
                  : e.target.files[0].type;

              data.append("fileUrl", fileURL);
              data.append("mimeType", mimeType);

              try {
                const response = await fetch(
                  `${urlConfig.URLS.ASSET.UPLOAD}/${imgId}`,
                  {
                    method: "POST",
                    body: data,
                  }
                );

                if (!response.ok) {
                  alert("Something went wrong while uploading file");
                  throw new Error("Something went wrong");
                }

                if (response.ok) {
                  alert("File uploaded successfully");
                }

                const uploadResult = await response.json();
                console.log("final upload success------", uploadResult);
                setFormData({
                  ...formData,
                  content_id: uploadResult.result.identifier,
                });
                setErrors({ ...errors, icon: "" });
              } catch (error) {
                console.log("error---", error);
                alert("Something went wrong while uploading file");
              } finally {
                setLoading(false);
              }
            });
          setErrors({ ...errors, content_id: "" });
        } catch (error) {
          console.log("error---", error);
        }
      } catch (error) {
        console.log("error---", error);
      }
    } else if (type == "url") {
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (youtubeUrl === "" || youtubeRegex.test(youtubeUrl)) {
        const _uuid = uuidv4();
        const assetBody = {
          request: {
            content: {
              primaryCategory: "Good Practices",
              contentType: "Resource",
              language: ["English"],
              code: _uuid,
              name: formData.title_of_submission
                ? formData.title_of_submission
                : "Untitled Content",
              framework: "nulp-learn",
              mimeType: "video/x-youtube",
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
            throw new Error("Something went wrong");
          }

          const result = await response.json();
          console.log("success----", result);

          const cont_id = result.result.identifier;
          const data = new FormData();
          data.append("fileUrl", youtubeUrl);
          data.append("mimeType", "video/x-youtube");

          try {
            const response = await fetch(
              `${urlConfig.URLS.ASSET.UPLOAD}/${cont_id}`,
              {
                method: "POST",
                body: data,
              }
            );

            if (!response.ok) {
              throw new Error("Something went wrong");
            }

            const uploadResult = await response.json();
            console.log("upload success------", uploadResult);
            setFormData({
              ...formData,
              content_id: uploadResult.result.identifier,
            });
            setErrors({ ...errors, icon: "" });
          } catch (error) {
            console.log("error---", error);
          }
        } catch (error) {
          console.log("error---", error);
        }
      } else {
        let tempErrors = {};
        tempErrors.youtube = "Add youtube URL correctly";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
      }
    }
  };

  const uploadToBlob = (signedURL, file, csp) => {
    return new Observable((observer) => {
      const uploaderLib = new SunbirdFileUploadLib.FileUploader();

      uploaderLib
        .upload({ url: signedURL, file, csp })
        .on("error", (error) => {
          // Emit the error and notify the observer of failure
          observer.error(error);
        })
        .on("completed", (completed) => {
          // Emit the completed status and close the observable stream
          observer.next(completed);
          observer.complete();
        });
    });
  };
  const handleCheckboxChange = (confirmed) => {
    setFormData({
      ...formData,
      consent_checkbox: true,
    });
    setTNCOpen(false);
  };

  const handleCategoryChange = (e) => {
    const category_of_participation = e.target.value;
    setFormData({ ...formData, category_of_participation });
    setErrors({ ...errors, category_of_participation: "" });
    // Set appropriate guideline link based on category_of_participation
    if (category_of_participation === "State / UT / SPVs / ULBs / Any Other") {
      setGuidelineLink(stateguideline);
      setTNCLink(stateguideline);
    } else if (category_of_participation === "Industry") {
      setGuidelineLink(industryguideline);
      setTNCLink(industryguideline);
    } else if (category_of_participation === "Academia") {
      setGuidelineLink(acdemiaguideline);
      setTNCLink(acdemiaguideline);
    } else {
      setGuidelineLink("");
      setTNCLink("");
    }
  };
  const handleUrlChange = (event) => {
    console.log(event.target.value);
    setyoutubeURL(event.target.value);
  };

  const checkDraftValidations = () => {
    let tempErrors = {};
    // if (!formData.user_name) tempErrors.user_name = "User Name is required";
    if (!formData.title_of_submission)
      tempErrors.title_of_submission = "Title of Submission is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const confirmSubmission = async () => {
    setOpenConfirmModal();
  };
  const handleSubmit = async (action) => {
    formData.created_by = _userId;
    // Handle form submission (draft or review)
    console.log("Form submitted:", formData);
    console.log(action);
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
            throw new Error("Something went wrong");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error.message);
          alert(error.message);
        } finally {
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
            throw new Error("Something went wrong");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error.message);
          alert(error.message);
        } finally {
        }
      }

      console.log("Saved as draft");
    } else if (action === "review") {
      formData.status = "review";
      if (!validate()) return;

      console.log("submit-form---", formData);

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
            throw new Error("Something went wrong");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error);
        } finally {
        }
      } else {
        console.log("ggggg");

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
            throw new Error("Something went wrong");
          }

          const result = await response.json();
          console.log("suceesss");
          navigate("/webapp/mylernsubmissions");
          // setData(result.result.data);
          // setTotalPages(Math.ceil(result.result.totalCount / 10));
        } catch (error) {
          console.log("error---", error);
        } finally {
        }
      }
      console.log("Sent for review");
    }
  };

  const getFramework = async (defaultFramework) => {
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/nulp-domain`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }

      const data = await response.json();
      const Categoryindex = data?.result?.framework?.categories.findIndex(
        (category) => category.code === "board"
      );
      setIndicativeThemes(
        data?.result?.framework?.categories[Categoryindex]?.terms
      );
      if (preIndicativeTheme) {
        const selectedBoard = preIndicativeTheme;
        const categories = data?.result?.framework?.categories;

        if (categories?.[Categoryindex]?.terms) {
          const terms = categories[Categoryindex].terms;

          const selectedIndex = terms.findIndex(
            (category) => category.name === selectedBoard
          );

          if (selectedIndex !== -1) {
            setIndicativeSubThemes(
              data?.result?.framework?.categories[Categoryindex]?.terms[
                selectedIndex
              ]?.associations || []
            );
          } else {
            setIndicativeSubThemes([]);
          }
        } else {
          console.error("No terms found in the specified category index");
          setIndicativeSubThemes([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const openTNC = async () => {
    setTNCOpen(true);
  };

  useEffect(() => {
    getFramework();
  }, [preIndicativeTheme]);

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
              {t("UPLOAD_LEARN_SUBMISSION")}
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
                {t("NEED_HELP")}
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
          <Grid item xs={12} sx={{ borderBottom: "2px solid #057184" }}>
            <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
              {t("SUBMISSION_DETAILS")}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: "30px" }}>
            <Grid container>
              <Grid item xs={2} className="center-align">
                <InputLabel htmlFor="Name of Organisation">
                  {t("SUBMISSION_ICON")}
                </InputLabel>
              </Grid>

              <Grid item xs={7}>
                <TextField
                  type="file"
                  fullWidth
                  onChange={handleIconChange}
                  inputProps={{
                    accept: "jpg,png",
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                {" "}
                {isEdit && formData.icon && (
                  <a
                    href={formData.icon}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("PREVIEW")}
                  </a>
                )}
              </Grid>
              <Grid item xs={10}>
                <Alert className="mt-9" everity="info">
                  {t("IMG_GUIDELINES")}
                </Alert>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={2} className="center-align">
                <InputLabel htmlFor="Title of Submission">
                  {t("TITLE_OF_SUBMISSION")}{" "}
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
                  inputProps={{ maxLength: 150 }}
                  error={!!errors.title_of_submission}
                  required
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={2} className="center-align">
                <InputLabel htmlFor="Description">
                  {t("DESCRIPTION")}{" "}
                  <span className="mandatory-symbol"> *</span>
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
                  inputProps={{ maxLength: 500 }}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Grid item xs={12} sm={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Category of Participation">
                      {t("CATEGORY_OF_PARTICIPATION")}
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
                  <Grid item style={{ padding: "30px" }} xs={3}>
                    <Box>
                      {guidelineLink && (
                        <a
                          href={guidelineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("VIEW_AND_DOWLOAD_GUIDELINES")}
                        </a>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Alert className="mt-9" severity="info">
                  {t("STAR_CITY_MSG")}
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="State">State</InputLabel>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      select
                      fullWidth
                      margin="normal"
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      error={!!errors.state}
                      helperText={errors.state}
                      onInput={handleSearchChange}
                    >
                      {filteredStates.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>{" "}
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="City">City</InputLabel>
                  </Grid>

                  <Grid item xs={10}>
                    <Autocomplete
                      freeSolo
                      options={
                        formData.state
                          ? citiesInIndia[formData.state] || []
                          : []
                      }
                      value={formData.city}
                      onChange={handleCityChange}
                      onInputChange={handleCityChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          margin="normal"
                          label="City"
                          name="city"
                          error={!!errors.city}
                          helperText={errors.city}
                          disabled={!formData.state}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="Name of Organisation">
                      {t("NAME_OF_ORG")}{" "}
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
                      {t("NAME_OF_DEPT/GROUP")}
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
                    <InputLabel htmlFor="indicative_theme">
                      {t("INDICATIVE_THEME")}{" "}
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
                      onChange={handleThemeChange}
                      error={!!errors.indicative_theme}
                      helperText={errors.indicative_theme}
                      required
                    >
                      {indicativeThemes.length > 0 ? (
                        indicativeThemes
                          .filter(
                            (theme) => theme?.name !== "Miscellaneous/ Others"
                          )
                          .map((theme, index) => (
                            <MenuItem key={theme?.name} value={theme?.name}>
                              {theme?.name}
                            </MenuItem>
                          ))
                      ) : (
                        <MenuItem disabled value="">
                          {t("NO_OPTION_AVAILABLE")}
                        </MenuItem>
                      )}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              {formData.indicative_theme === "Miscellaneous/ Others" && (
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={2} className="center-align">
                      <InputLabel htmlFor="other_indicative_themes">
                        {t("OTHER_INDICATIVE_THEME")}{" "}
                        <span className="mandatory-symbol"> *</span>
                      </InputLabel>
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Other Indicative Theme"
                        name="other_indicative_themes"
                        value={formData.other_indicative_themes}
                        onChange={handleChange}
                        error={!!errors.other_indicative_themes}
                        helperText={errors.other_indicative_themes}
                        required
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {formData.indicative_theme !== "Miscellaneous/ Others" && (
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={2} className="center-align">
                      <InputLabel htmlFor="indicative_sub_theme">
                        {t("INDICATIVE_SUBTHEME")}{" "}
                        <span className="mandatory-symbol"> *</span>
                      </InputLabel>
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Indicative SubTheme"
                        name="indicative_sub_theme"
                        value={formData.indicative_sub_theme}
                        onChange={handlesubthemeChange}
                        error={!!errors.indicative_sub_theme}
                        helperText={errors.indicative_sub_theme}
                        required
                      >
                        {indicativeSubThemes.map((theme) => (
                          <MenuItem key={theme?.name} value={theme?.name}>
                            {theme?.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Toggle between URL and File */}
                  <Grid item xs={12}>
                    <RadioGroup
                      row
                      value={uploadType}
                      onChange={handleUploadTypeChange}
                      aria-label="Upload Type"
                    >
                      <FormControlLabel
                        value="file"
                        control={<Radio />}
                        label="File Upload"
                      />
                      <FormControlLabel
                        value="url"
                        control={<Radio />}
                        label="Youtube URL Upload"
                      />
                    </RadioGroup>
                  </Grid>

                  {/* Conditional Fields Based on Selection */}
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="upload">
                      {uploadType === "file"
                        ? "File Upload"
                        : "Youtube URL Upload"}
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>

                  {uploadType === "file" ? (
                    <Grid item xs={7}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <TextField
                          type="file"
                          fullWidth
                          onChange={(event) => handleFileChange(event, "file")}
                          error={!!errors.content_id}
                          inputProps={{
                            accept: "video/mp4,application/pdf,text/html",
                          }}
                          sx={{ border: "1px dashed" }}
                        />

                        {loading && (
                          <CircularProgress size={24} sx={{ marginLeft: 2 }} />
                        )}
                      </Box>
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        type="url"
                        fullWidth
                        placeholder="Enter URL"
                        onChange={(event) => handleUrlChange(event)}
                        error={!!errors.youtube || !!errors.content_id}
                        helperText={
                          !!errors.youtube
                            ? "Please enter a valid YouTube URL."
                            : ""
                        }
                      />
                    </Grid>
                  )}

                  <Grid item xs={4}>
                    {" "}
                    {uploadType === "url" && (
                      <Grid item xs={2}>
                        <Button
                          //  disabled={!formda}
                          className="custom-btn-default"
                          onClick={() => handleFileChange(youtubeUrl, "url")}
                        >
                          {t("UPLOAD")}
                        </Button>
                      </Grid>
                    )}
                    {isEdit && formData.content_id && (
                      <Grid item xs={2}>
                        <a
                          href="#"
                          onClick={(e) => {
                            window.open(
                              `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${previewPlayerPage}`,
                              "_blank"
                            );
                          }}
                        >
                          {t("PREVIEW")}
                        </a>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item xs={10}>
                    <Alert className="mt-9" severity="info">
                      {t("CONT_FORMAT")}
                    </Alert>
                  </Grid>
                </Grid>
              </Grid>
              {!isFormClosed && (
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
                  <Box mt={3}>
                    <Button
                      disabled={isNotDraft || openPersonalForm || loading}
                      className="custom-btn-default"
                      onClick={() => handleSubmit("draft")}
                    >
                      {t("SAVE_AS_DRAFT")}
                    </Button>

                    <Button
                      disabled={isNotDraft || openPersonalForm || loading}
                      className="viewAll"
                      onClick={() => setOpenConfirmModal(true)}
                      sx={{ ml: 2, padding: "9px 35px" }} // Adds spacing between the buttons
                    >
                      {t("PROCEED_TO_SUBMIT")}
                    </Button>
                  </Box>
                </Grid>
              )}
              {openConfirmModal && (
                <Modal
                  open={openConfirmModal}
                  onClose={() => setOpenConfirmModal(false)}
                  aria-labelledby="confirmation-modal-title"
                  aria-describedby="confirmation-modal-description"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "8px",
                      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                      width: "400px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      id="confirmation-modal-title"
                      gutterBottom
                    >
                      {t("ARE_YOU_SURE")}
                    </Typography>
                    <Typography
                      id="confirmation-modal-description"
                      color="textSecondary"
                    >
                      {t("YOU_WILL_NOT_BE_ABLE_TO_UPDATE")}
                    </Typography>

                    {/* Modal Actions */}
                    <Box
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box>
                        <Button
                          variant="contained"
                          className="viewAll"
                          onClick={() => {
                            setOpenPersonalForm(true); // Proceed action
                            setOpenConfirmModal(false); // Close modal after proceeding
                          }}
                        >
                          {t("PROCEED")}
                        </Button>
                      </Box>
                      <Box ml={"20px"}>
                        <Button
                          className="cancelBtn"
                          onClick={() => setOpenConfirmModal(false)}
                        >
                          {t("CANCEL")}
                        </Button>
                      </Box>
                    </Box>
                  </div>
                </Modal>
              )}
              {openPersonalForm && (
                <>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      sx={{
                        borderBottom: "2px solid #057184",
                        marginBottom: "20px",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {t("PARTICIPAION_DETAILS")}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Grid container>
                        <Grid item xs={2} className="center-align">
                          <InputLabel htmlFor="Participant Name">
                            {t("PARTICIPANT")}
                            <br /> {t("NAME")}
                            <span className="mandatory-symbol"> *</span>
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
                            {t("EMAIL")}{" "}
                            <span className="mandatory-symbol"> *</span>
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
                            {t("MOBILE")} <br /> {t("NUMBER")}
                            <span className="red"> *</span>
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
                    <Box>{t("NULP_DECLARE")}</Box>

                    <a href="#" onClick={openTNC}>
                      {t("TNC")}
                    </a>

                    {TNCOpen && (
                      <Modal
                        open={TNCOpen}
                        onClose={() => setTNCOpen(false)}
                        aria-labelledby="confirmation-modal-title"
                        aria-describedby="confirmation-modal-description"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            width: "700px",
                            maxHeight: "80vh", // Ensures modal does not exceed viewport height
                            overflowY: "auto", // Enables vertical scrolling if content exceeds height
                            textAlign: "justify",
                          }}
                        >
                          <Typography
                            variant="h6"
                            id="confirmation-modal-title"
                            gutterBottom
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            {t("Terms and Conditions")}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="div"
                            style={{
                              whiteSpace: "pre-wrap", // Ensures formatted line breaks are retained
                            }}
                          >
                            <p>
                              <strong>
                                Terms and Conditions for Content Submission on
                                NULP
                              </strong>
                            </p>
                            <p>
                              By submitting content (including but not limited
                              to thumbnails, tags, audio, video, text, images,
                              illustrations, or other resources) to the National
                              Urban Learning Platform (NULP), the user agrees to
                              the following terms and conditions. Non-compliance
                              with these terms may result in the removal of
                              content and/or suspension of access to the
                              platform and participation in similar future
                              competitions.
                            </p>
                            <ol>
                              <li>
                                <strong>Prohibition of Hate Speech</strong>
                                <ul>
                                  <li>
                                    Content must not promote enmity, hatred, or
                                    ill-will against individuals or groups based
                                    on:
                                  </li>
                                  <ul>
                                    <li>
                                      Caste, Class, Tribe, Race, Ethnicity
                                    </li>
                                    <li>Sex, Gender, or Gender Identity</li>
                                    <li>
                                      National Origin or Religious Affiliation
                                    </li>
                                    <li>Sexual Orientation</li>
                                    <li>Disabilities or Diseases</li>
                                  </ul>
                                </ul>
                              </li>
                              <li>
                                <strong>Sexually Explicit Content</strong>
                                <ul>
                                  <li>
                                    Content must not include pornography,
                                    sexually explicit material, or depictions of
                                    sexual acts.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>
                                  Sexual Violence and Exploitation
                                </strong>
                                <ul>
                                  <li>
                                    Content must not depict or promote the
                                    sexual exploitation of minors or incidents
                                    of sexual violence.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Nudity and Vulgarity</strong>
                                <ul>
                                  <li>
                                    Content must not display nudity unless it is
                                    educational, documentary, scientific, or
                                    artistic with clear context.
                                  </li>
                                  <li>
                                    Content must not include vulgarity,
                                    obscenity, or degrading material.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Violence</strong>
                                <ul>
                                  <li>
                                    Content must not promote, encourage, or
                                    glorify violent actions or behaviors.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Discrimination and Bullying</strong>
                                <ul>
                                  <li>
                                    Content must not degrade, shame, or harass
                                    individuals or groups.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Harmful or Dangerous Content</strong>
                                <ul>
                                  <li>
                                    Content must not incite dangerous or illegal
                                    activities.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Involvement of Children</strong>
                                <ul>
                                  <li>
                                    Content must not depict children subjected
                                    to abuse or violence.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Substance Abuse</strong>
                                <ul>
                                  <li>
                                    Content must not encourage or glorify the
                                    use of alcohol, drugs, or tobacco.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Defamation</strong>
                                <ul>
                                  <li>
                                    Content must not defame or ridicule
                                    individuals, groups, or people with
                                    disabilities.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>
                                  Content Sensitive to Children with Special
                                  Needs
                                </strong>
                                <ul>
                                  <li>
                                    Content must be accessible and sensitive to
                                    children with special needs.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Environmental Sensitivity</strong>
                                <ul>
                                  <li>
                                    Content must not glorify activities causing
                                    environmental damage.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Copyright Compliance</strong>
                                <ul>
                                  <li>
                                    You confirm that you own the rights to the
                                    submitted content or have the necessary
                                    permissions/licenses.
                                  </li>
                                  <li>
                                    NULP is not liable for copyright
                                    infringement claims arising from your
                                    content.
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>
                                  User Responsibility and Agreement
                                </strong>
                                <ul>
                                  <li>
                                    By submitting content, you certify that your
                                    submission complies with these terms and
                                    conditions.
                                  </li>
                                  <li>
                                    You agree to take full responsibility for
                                    any content you submit, including any
                                    consequences arising from non-compliance.
                                  </li>
                                  <li>
                                    NULP reserves the right to review, remove,
                                    or reject any content that violates these
                                    terms or fails to align with the platform's
                                    standards.
                                  </li>
                                  <li>
                                    Users submitting content that repeatedly
                                    violates these terms may face account
                                    suspension or termination.
                                  </li>
                                  <li>
                                    If any copyright issue or participation
                                    through unfair means is identified by
                                    competent authority, your entry will be
                                    deleted from NULP, prize money will be
                                    forfeited, and you will be banned from
                                    further participation.
                                  </li>
                                </ul>
                              </li>
                            </ol>
                            <p>
                              <strong>Content Review and Moderation</strong>
                            </p>
                            <p>
                              The NULP team reserves the right to moderate,
                              monitor, and take action against any submitted
                              content that breaches these terms. In this regard
                              decisions made by the team will be final.
                            </p>
                            <p>
                              By proceeding with the submission, you acknowledge
                              and agree to abide by these Terms and Conditions.
                            </p>
                          </Typography>

                          {/* Modal Actions */}
                          <Box
                            style={{ marginTop: "20px", textAlign: "center" }}
                          >
                            <FormControlLabel
                              control={<Checkbox />}
                              label={t(
                                "I hereby confirm that I accept the above-mentioned terms and conditions."
                              )}
                            />
                          </Box>

                          <Box
                            style={{
                              marginTop: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Box style={{ padding: "5px" }}>
                              <Button
                                variant="contained"
                                className="viewAll"
                                onClick={() => handleCheckboxChange(true)}
                              >
                                {t("CONFIRM")}
                              </Button>
                            </Box>
                            <Box style={{ padding: "5px" }}>
                              <Button
                                className="cancelBtn"
                                onClick={() => setTNCOpen(false)}
                              >
                                {t("CANCEL")}
                              </Button>
                            </Box>
                          </Box>
                        </div>
                      </Modal>
                    )}
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
                    <Box mt={3}>
                      <Button
                        disabled={isNotDraft}
                        className="viewAll"
                        onClick={() => handleSubmit("review")}
                        sx={{ ml: 2, padding: "9px 35px" }} // Adds spacing between the buttons
                      >
                        {t("SUBMIT")}
                      </Button>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
};

export default LernCreatorForm;
