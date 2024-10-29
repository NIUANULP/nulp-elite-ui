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
  Modal,
  Autocomplete,
  Radio,
  RadioGroup,
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
import stateguideline from "../../assets/state-guidelines.pdf";
import statetnc from "../../assets/state-tnc.pdf";
import Alert from "@mui/material/Alert";
const routeConfig = require("../../configs/routeConfig.json");

import { Observable } from "rxjs";

import { useTranslation } from "react-i18next";

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
];

// List of some popular cities in India
const citiesInIndia = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Visakhapatnam",
  "Bhopal",
  "Patna",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivli",
  "Vasai-Virar",
  "Varanasi",
  // Add more cities as needed
];
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
  const [city, setCity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadType, setUploadType] = useState("file");
  const [previewPlayerPage, setPreviewPlayerPage] = useState();
  const [iconPreviewPage, setIconPreviewPage] = useState();

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
    if (
      formData.indicative_theme == "Miscellaneous/ Others" &&
      !formData.other_indicative_themes
    )
      tempErrors.other_indicative_themes = "Provide other indicative theme";

    if (!formData.state) tempErrors.state = "Provide state";

    if (!formData.city) tempErrors.city = "Provide city";
    if (!formData.title_of_submission)
      tempErrors.title_of_submission = "Title of Submission is required";
    if (!formData.description)
      tempErrors.description = "Description is required";
    // if (!formData.content_id) tempErrors.content_id = "File upload is required";
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
      const mimeType = e.target.files[0].type;
      const _uuid = uuidv4();
      const assetBody = {
        request: {
          content: {
            primaryCategory: "Good Practices",
            contentType: "Resource",
            language: ["English"],
            code: _uuid,
            name: e.target.files[0].name,
            framework: "nulp-learn",
            mimeType: mimeType,
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
        console.log("suceesss----", result);
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
          console.log("upload suceesss------", uploadResult);
          const imgId = result.result.identifier;
          const url = uploadResult.result.pre_signed_url;
          const file = e.target.files[0];
          const csp = "azure"; // Cloud provider (azure, aws, etc.)

          const uploader = new SunbirdFileUploadLib.FileUploader();

          uploader
            .upload({
              file: file,
              url: url,
              csp: "azure",
            })
            .on("error", (error) => {
              console.log("0000", error);
            })
            .on("completed", async (completed) => {
              console.log("1111", completed);

              console.log("url", url);
              console.log("mimeType", mimeType);

              const fileURL = url.split("?")[0];
              console.log("fileUrl", fileURL);
              const data = new FormData();
              data.append("fileUrl", fileURL);
              data.append("mimeType", mimeType);

              data.forEach((value, key) => {
                console.log(`${key}:`, value);
              });
              // const config1 = {
              //   enctype: "multipart/form-data",
              //   processData: false,
              //   contentType: false,
              //   cache: false,
              // };
              // const uploadMediaConfig = {
              //   data,
              //   param: config1,
              // };
              try {
                const response = await fetch(
                  `${urlConfig.URLS.ASSET.UPLOAD}/${imgId}`,
                  {
                    method: "POST",
                    body: data,
                  }
                );

                if (!response.ok) {
                  throw new Error("Something went wrong");
                }

                const uploadResult = await response.json();
                console.log("upload suceesss------", uploadResult);
                setFormData({
                  ...formData,
                  content_id: uploadResult.result.identifier,
                });
                setErrors({ ...errors, icon: "" });
              } catch (error) {
                console.log("error---", error);
              } finally {
              }
            });

          // try {
          //   const subscription = uploadToBlob(url, file, csp).subscribe({
          //     next: (completed) => {
          //       console.log("Upload completed successfully!");
          //     },
          //     error: (error) => {
          //       console.log(`Upload failed: ${error.message}`);
          //     },
          //     complete: () => {
          //       console.log("Upload process completed.");
          //     },
          //   });

          //   // Clean up subscription on unmount
          //   return () => subscription.unsubscribe();
          // } catch (err) {
          //   console.log(err);
          // }
          console.log("file uploaded---");
          setFormData({
            ...formData,
            content_id: uploadResult.result.identifier,
          });
          setErrors({ ...errors, content_id: "" });
        } catch (error) {
          console.log("error---", error);
        } finally {
        }
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
      }
    } else if (type == "url") {
      console.log("------------------", event.target.value);

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
        console.log("suceesss----", result);
        const cont_id = result.result.identifier;
        const data = new FormData();
        data.append(
          "fileUrl",
          event.target.value
            ? event.target.value
            : "https://www.youtube.com/watch?v=dz458ZkBMak"
        );
        data.append("mimeType", "video/x-youtube");

        data.forEach((value, key) => {
          console.log(`${key}:`, value);
        });

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
          console.log("upload suceesss------", uploadResult);
          setFormData({
            ...formData,
            content_id: uploadResult.result.identifier,
          });
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
      setGuidelineLink(stateguideline);
      setTNCLink(statetnc);
    } else if (category_of_participation === "Industry") {
      setGuidelineLink("/assets/industry-guidelines.pdf");
      setTNCLink("../../assets/industry-tnc.pdf");
    } else if (category_of_participation === "Academia") {
      setGuidelineLink("../../assets/academia-guidelines.pdf");
      setTNCLink("../../assets/academia-tnc.pdf");
    } else {
      setGuidelineLink("");
      setTNCLink("");
    }
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
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  useEffect(() => {
    getFramework();
  }, []);

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
                    Preview
                  </a>
                )}
              </Grid>
              <Grid item xs={10}>
                <Alert className="mt-9" everity="info">
                  Upload png, jpeg (Max File size: 1MB)
                </Alert>
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
                          View and Download Guidelines {guidelineLink}
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
                    <InputLabel htmlFor="indicative_theme">
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
                      {indicativeThemes.length > 0 ? (
                        indicativeThemes.map((theme, index) => (
                          <MenuItem key={theme?.name} value={theme?.name}>
                            {theme?.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No options available
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
                        Other Indicative Theme{" "}
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
                        Indicative SubTheme{" "}
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
                <Grid container>
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="State">
                      State <span className="mandatory-symbol"> *</span>
                    </InputLabel>
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
                      required
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
                    <InputLabel htmlFor="City">
                      City <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>

                  <Grid item xs={10}>
                    <Autocomplete
                      freeSolo
                      options={citiesInIndia}
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
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={12}>
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
              </Grid> */}
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
                        label="URL Upload"
                      />
                    </RadioGroup>
                  </Grid>

                  {/* Conditional Fields Based on Selection */}
                  <Grid item xs={2} className="center-align">
                    <InputLabel htmlFor="upload">
                      {uploadType === "file" ? "File Upload" : "URL Upload"}
                      <span className="mandatory-symbol"> *</span>
                    </InputLabel>
                  </Grid>

                  {uploadType === "file" ? (
                    <Grid item xs={10}>
                      <TextField
                        type="file"
                        fullWidth
                        onChange={(event) => handleFileChange(event, "file")}
                        inputProps={{
                          accept: "video/mp4,application/pdf,text/html",
                        }}
                        sx={{ border: "1px dashed" }}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        type="url"
                        fullWidth
                        placeholder="Enter URL"
                        onChange={(event) => handleFileChange(event, "url")}
                      />
                    </Grid>
                  )}

                  <Grid item xs={3}>
                    {" "}
                    {isEdit && formData.content_id && (
                      <a
                        href="#"
                        onClick={(e) => {
                          window.open(
                            `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${previewPlayerPage}`,
                            "_blank"
                          );
                        }}
                      >
                        Preview
                      </a>
                    )}
                  </Grid>
                  <Grid item xs={10}>
                    <Alert className="mt-9" severity="info">
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
                <Box mt={3}>
                  <Button
                    disabled={isNotDraft || openPersonalForm}
                    className="custom-btn-default"
                    onClick={() => handleSubmit("draft")}
                  >
                    Save as Draft
                  </Button>

                  <Button
                    disabled={isNotDraft || openPersonalForm}
                    className="viewAll"
                    onClick={() => setOpenConfirmModal(true)}
                    sx={{ ml: 2, padding: "9px 35px" }} // Adds spacing between the buttons
                  >
                    Proceed to Submit
                  </Button>
                </Box>
              </Grid>
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
                    <div style={{ marginTop: "20px" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setOpenPersonalForm(true); // Proceed action
                          setOpenConfirmModal(false); // Close modal after proceeding
                        }}
                        style={{ marginRight: "10px" }}
                      >
                        {t("PROCEED")}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setOpenConfirmModal(false)}
                      >
                        {"CANCEL"}
                      </Button>
                    </div>
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
                        Participant Details
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Grid container>
                        <Grid item xs={2} className="center-align">
                          <InputLabel htmlFor="User Name">
                            Participant Name{" "}
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
                      Your submission will be used for NULP purposes only and
                      your personal details will not be disclosed to any entity.
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.consent_checkbox}
                          onChange={handleCheckboxChange}
                          name="consent_checkbox"
                        />
                      }
                    />
                    <a href={TNCLink} target="_blank" rel="noopener noreferrer">
                      Accept terms and conditions
                    </a>
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
                        Submit
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
