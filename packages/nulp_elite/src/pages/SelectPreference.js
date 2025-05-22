import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import * as util from "../services/utilService";
import { useTranslation } from "react-i18next";
const urlConfig = require("../configs/urlConfig.json");
import ToasterCommon from "./ToasterCommon";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const SelectPreference = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [frameworkData, setFrameworkData] = useState();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const classes = useStyles();
  const _userId = util.userId();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState([]);
  const [isRootOrg, setIsRootOrg] = useState(false);
  const [frameworks, setFrameworks] = useState([]);
  const [defaultFramework, setDefaultFramework] = useState("");
  const [custodianOrgId, setCustodianOrgId] = useState("");
  const [isEmptyPreference, setIsEmptyPreference] = useState(true);
  const [domain, setDomain] = useState();
  const [subDomain, setSubDomain] = useState();
  const [language, setLanguage] = useState();
  const [topic, setTopic] = useState();
  const [isDisabled, setIsDisabled] = useState(true);
  const [preCategory, setPreCategory] = useState("");
  const [preTopic, setPreTopic] = useState("");
  const [preSubCategory, setPreSubCategory] = useState([]);
  const [preLanguages, setPreLanguages] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [orgId, setOrgId] = useState();
  const [framworkname, setframworkname] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    getUserData();
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uservData = await util.userData();
        setOrgId(uservData?.data?.result?.response?.rootOrgId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserDataAndSetCustodianOrgData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.SYSTEM_SETTING.CUSTODIAN_ORG}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch custodian organization ID");
      }
      const data = await response.json();
      const custodianOrgId = data?.result?.response?.value;
      setCustodianOrgId(custodianOrgId);
      const rootOrgId = sessionStorage.getItem("rootOrgId");
      if (custodianOrgId) {
        if (custodianOrgId === orgId) {
          const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${custodianOrgId}`;
          const response = await fetch(url);
          const data = await response.json();
          const defaultFramework = data?.result?.channel?.defaultFramework;
          setDefaultFramework(defaultFramework);
          localStorage.setItem("defaultFramework", defaultFramework);
        } else {
          const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${orgId}`;
          const response = await fetch(url);
          const data = await response.json();
          const defaultFramework = data?.result?.channel?.defaultFramework;
          setDefaultFramework(defaultFramework);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      setToasterOpen(true);
    }
  };
  useEffect(() => {
    if (orgId) {
      fetchUserDataAndSetCustodianOrgData();
    }
  }, [orgId]);

  useEffect(() => {
    const defaultFrameworkFromLocal = localStorage.getItem("defaultFramework");
    setDefaultFramework(defaultFrameworkFromLocal);
    if (defaultFramework) {
      getFramework(defaultFramework);
    }
  }, [defaultFramework,selectedCategory]);

  const handleCategoryChange = (event) => {
    const selectedBoard = event.target.value;
    setSelectedCategory(selectedBoard);
    const selectedIndex = categories.findIndex(
      (category) => category.name === selectedBoard
    );
    if (selectedIndex !== -1) {
      setSubCategories(categories[selectedIndex]?.associations || []);
    } else {
      setSubCategories([]);
    }

    setSelectedSubCategory([]);
  };

  const handleSubCategoryChange = (event) => {
    if (!selectedCategory) {
      showErrorMessage(t("SELECT_CATEGORY_FIRST"));
      return;
    }
    setSelectedSubCategory(event.target.value);
  };

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguages(event.target.value);
  };

  const getFramework = async (defaultFramework) => {
    setIsLoading(true);
    setError(null);

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
      setFrameworkData(data?.result?.framework?.categories);
      const Categoryindex = data?.result?.framework?.categories.findIndex(
  (category) => category.code === "board"
);
      setCategories(data?.result?.framework?.categories[Categoryindex]?.terms);
      const SubCategoryindex = data?.result?.framework?.categories.findIndex(
  (category) => category.code === "gradeLevel"
);
    if(selectedCategory){
      const selectedIndex = data?.result?.framework?.categories[Categoryindex]?.terms.findIndex(
      (category) => category.name === selectedCategory
    );
    if (selectedIndex !== -1) {
      setSubCategories(data?.result?.framework?.categories[Categoryindex]?.terms[selectedIndex]?.associations || []);
    } else {
      setSubCategories([]);
    }
}else{
setSubCategories(data?.result?.framework?.categories[SubCategoryindex]?.terms);
}
      const Topicsindex = data?.result?.framework?.categories.findIndex(
  (category) => category.code === "subject"
);
      setTopics(data?.result?.framework?.categories[Topicsindex]?.terms);
      const Languagesindex = data?.result?.framework?.categories.findIndex(
  (category) => category.code === "medium"
);
      setLanguages(data?.result?.framework?.categories[Languagesindex]?.terms);

      setDomain(data?.result?.framework?.categories[Categoryindex]?.name);
      setSubDomain(data?.result?.framework?.categories[SubCategoryindex]?.name);
      setTopic(data?.result?.framework?.categories[Topicsindex]?.name);
      setLanguage(data?.result?.framework?.categories[Languagesindex]?.name);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}`;
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

      const responseData = await response.json();
      if (Object.entries(responseData?.result?.response?.framework).length === 0 ) {
        setIsEmptyPreference(false);
      } else {
        setSelectedCategory(
          responseData?.result?.response?.framework?.board[0]
        );
        setSelectedSubCategory(
          responseData?.result?.response?.framework?.gradeLevel
        );

        setSelectedTopic(
          responseData?.result?.response?.framework?.subject &&
            responseData?.result?.response?.framework?.subject[0]
        );
        setSelectedLanguages(responseData?.result?.response?.framework?.medium);

        setPreCategory(responseData?.result?.response?.framework?.board[0]);
        responseData?.result?.response?.framework?.subject &&
          setPreTopic(responseData?.result?.response?.framework?.subject[0]);
        setPreLanguages(responseData?.result?.response?.framework?.medium);
        setPreSubCategory(
          responseData?.result?.response?.framework?.gradeLevel
        );
      }
      
      if (responseData?.result?.response?.framework?.id?.length > 0 && responseData.result.response.framework.id[0] === "nulp") {
        setframworkname(true);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async () => {
    setIsLoading(true);
    setError(null);

    const requestBody = {
      params: {},
      request: {
        framework: {
          board: [selectedCategory],
          medium: selectedLanguages,
          gradeLevel: selectedSubCategory,
          // subject: [selectedTopic],
          id: "nulp-domain",
        },
        userId: _userId,
      },
    };

    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.UPDATE_USER_PROFILE}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        setToastMessage(t("Preferences updated successfully!"));
        setShowToast(true);
        onClose();
      } else {
         showErrorMessage(t("FAILED_TO_FETCH_DATA"));
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }
      // if (!response.ok) {
      //   showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      //   throw new Error(t("FAILED_TO_FETCH_DATA"));
      // }
      // if(response.ok){
      //   setToastMessage("Preferance Updated Successfully");
      //   setShowToast(true);
      // }

      const responseData = await response.json();
    } catch (error) {
      showErrorMessage("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = () => {
    updateUserData();
    onClose();
  };

  const closeToast = () => {
    setShowToast(false);
  };

  const handleClose = () => {
    onClose();
  };

  const deepEqual = (array1, array2) => {
    array1 = array1.sort();
    array2 = array2.sort();
    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      });
    return is_same;
  };

  useEffect(() => {
    if (
      preCategory == selectedCategory &&
      preTopic == selectedTopic &&
      deepEqual(preLanguages, selectedLanguages) &&
      deepEqual(preSubCategory, selectedSubCategory)
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedLanguages,
    selectedTopic,
    preCategory,
    preTopic,
    preLanguages,
    preSubCategory,
  ]);

  return (
    <>
     <Dialog
      open={isOpen}
      // onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableBackdropClick
      disableEscapeKeyDown
    >
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <DialogTitle>{t("SELECT_PREF")}</DialogTitle>
      {framworkname && (
        <DialogTitle>
          {t("CHANGE_PREF_OLD_USER")}
        </DialogTitle>
      )}
      <DialogContent>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="category-label" className="year-select">
              {"Domain"}
            </InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories?.map((category) => (
                <MenuItem key={category?.id} value={category?.name}>
                  {category?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="sub-category-label" className="year-select">
              {"Sub-Domain"}
            </InputLabel>
            <Select
              labelId="sub-category-label"
              id="sub-category-select"
              multiple
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              disabled={!selectedCategory}
            >
              {subCategories?.map((subCategory) => (
                <MenuItem key={subCategory?.id} value={subCategory?.name}>
                  <Checkbox
                    checked={selectedSubCategory?.includes(subCategory?.name)}
                  />
                  <ListItemText primary={subCategory?.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="language-label" className="year-select">
              {"language"}
            </InputLabel>
            <Select
              labelId="language-label"
              id="language-select"
              multiple
              value={selectedLanguages}
              onChange={handleLanguageChange}
            >
              {languages?.map((language) => (
                <MenuItem key={language?.id} value={language?.name}>
                  <Checkbox
                    checked={selectedLanguages?.includes(language?.name)}
                  />
                  <ListItemText primary={language?.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {/*Comment Topic from user Preferance popup because of costomer request */}
        {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="topic-label" className="year-select">
            {"Topic"}
          </InputLabel>
          <Select
            labelId="topic-label"
            value={selectedTopic}
            onChange={handleTopicChange}
          >
            {topics?.map((topic) => (
              <MenuItem key={topic?.id} value={topic?.name}>
                {topic?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */} 
      </DialogContent>
      <DialogActions>
        {isEmptyPreference && (
          <Button onClick={handleClose} className="custom-btn-default">
            {t("CANCEL")}
          </Button>
        )}
        <Button
          onClick={handleSavePreferences}
          className="custom-btn-primary"
          disabled={isDisabled}
        >
          {t("SUBMIT")}
        </Button>
      </DialogActions>
    </Dialog>
    {showToast && (
        <ToasterCommon response={toastMessage} onClose={closeToast} />
      )}
    </> 
  );
};

export default SelectPreference;