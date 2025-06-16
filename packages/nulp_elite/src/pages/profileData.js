import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControl,
  Button,
} from "@mui/material";
import Select from "react-select";
import axios from "axios";
const userData = require("../assets/userData.json");
import * as util from "../services/utilService";
const urlConfig = require("../configs/urlConfig.json");
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useTranslation } from "react-i18next";
const designationsList = require("../configs/designations.json");

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "scroll",
};

const userTypesList = [
  "State Governments / Parastatal Bodies",
  "Urban Local Bodies / Special Purpose Vehicles",
  "Academia and Research Organisations",
  "Multilateral / Bilateral Agencies",
  "Industries",
  "Any Other Government Entities",
  "Others",
];

const PopupForm = ({ open, handleClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [bio, setBio] = useState("");
  const [designation, setDesignation] = useState("");
  const [userType, setUserType] = useState("");
  const [designations, setDesignations] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [customDesignation, setCustomDesignation] = useState("");
  const [customUserType, setCustomUserType] = useState("");
  const _userId = util.userId();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");

  //country state and district
  const [country, setCountry] = useState("India");
  const [otherCountry, setOtherCountry] = useState("");
  const [stateId, setStateId] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);


  const maxChars = 500;
  const { t } = useTranslation();



  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}`;
        const response = await axios.get(url);
        const userData = response.data?.result?.response;

        const fName = userData?.firstName || "";
        const lName = userData?.lastName || "";

        setFirstName(fName);
        setLastName(lName);

        setInitialFirstName(fName);
        setInitialLastName(lName);

      } catch (error) {
        console.error("Error fetching user names:", error);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const url = `${urlConfig.URLS.POFILE_PAGE.USER_READ}`;
        const response = await axios.post(
          url,
          { user_ids: [_userId] },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const userInfo = response?.data?.result?.[0];
        console.log("userInfo", userInfo);

        setBio(userInfo?.bio || "");
        setDesignation(userInfo?.designation || "");
        setUserType(userInfo?.user_type || "");
        setOrganisation(userInfo?.organisation || "");

        if (userInfo?.designation === "other" && userInfo?.customDesignation) {
          setCustomDesignation(userInfo.customDesignation);
        }

        if (userInfo?.user_type === "other" && userInfo?.customUserType) {
          setCustomUserType(userInfo.customUserType);
        }

        setCountry(userInfo?.country || "India");

        if (userInfo?.country === "Others" && userInfo?.otherCountry) {
          setOtherCountry(userInfo.otherCountry);
        }

        if (userInfo?.state_id && userInfo?.state) {
          setStateId(userInfo.state_id);
          setStateName(userInfo.state);
        }

        if (userInfo?.district_id && userInfo?.district) {
          setDistrictId(userInfo.district_id);
          setDistrictName(userInfo.district);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserName();
    fetchUserInfo();

    setDesignations([
      ...designationsList.map((type) => ({ value: type, label: type })),
      { value: "other", label: "Other" },
    ]);
    setUserTypes([
      ...userTypesList.map((type) => ({ value: type, label: type })),
      { value: "other", label: "Other" },
    ]);
  }, []);


  useEffect(() => {
    const isBasicValid = firstName && lastName && organisation && designation && userType;

    let isLocationValid = true;

    if (country === "India") {
      isLocationValid = !!(stateId && districtId);
    } else if (country === "Others") {
      isLocationValid = !!otherCountry;
    }

    setIsSubmitDisabled(!(isBasicValid && isLocationValid));
  }, [firstName, lastName, organisation, designation, userType, country, stateId, districtId, otherCountry]);



  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.post(`${urlConfig.URLS.USER.LOCATION_SEARCH_API}`, {
          request: { filters: { type: "state" } },
        });
        setStatesList(res.data?.result?.response || []);
      } catch (err) {
        console.error("Error fetching states", err);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!stateId) return;

    const fetchDistricts = async () => {
      try {
        const res = await axios.post(`${urlConfig.URLS.USER.LOCATION_SEARCH_API}`, {
          request: {
            filters: { type: "district", parentId: stateId },
          },
        });
        setDistrictsList(res.data?.result?.response || []);
      } catch (err) {
        console.error("Error fetching districts", err);
      }
    };
    fetchDistricts();
  }, [stateId]);


  const handleSubmit = async () => {
    const finalDesignation =
      designation === "other" ? customDesignation : designation;
    const finalUserType = userType === "other" ? customUserType : userType;

    // Construct the request data including location
    const requestData = {
      organisation: organisation,
      designation: finalDesignation,
      user_type: finalUserType,
      bio: bio,
      country: country,
      otherCountry: country === "Others" ? otherCountry : "",
      state_id: country === "India" ? stateId : "",
      state: country === "India" ? stateName : "",
      district_id: country === "India" ? districtId : "",
      district: country === "India" ? districtName : "",
    };

    console.log("requestData 299", requestData)

    try {
      const updateNameUrl = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.UPDATE_USER_PROFILE}`;
      const updateUserInfoUrl = `${urlConfig.URLS.POFILE_PAGE.USER_UPDATE}?user_id=${_userId}`;

      // Update name if changed
      if (firstName !== initialFirstName || lastName !== initialLastName) {
        await axios.patch(updateNameUrl, {
          request: { firstName, lastName, userId: _userId },
        });
      }

      // Update other user info including location
      const response = await axios.put(updateUserInfoUrl, requestData);
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("API Error:", error);
    }

    handleClose();
  };



  const handleBioChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setBio(e.target.value);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleClose();
        }
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" className="h4-title mb-20">
          User Information
        </Typography>
        <Box>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Organization"
            type="text"
            fullWidth
            required
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Bio"
            type="text"
            fullWidth
            value={bio}
            onChange={handleBioChange}
            inputProps={{ maxLength: maxChars }}
          />
          <Typography variant="body2" color="textSecondary">
            {bio.length}/{maxChars}
          </Typography>
          <FormControl fullWidth margin="dense">
            <Select
              options={designations}
              value={designations.find(
                (option) => option.value === designation
              )}
              onChange={(selectedOption) =>
                setDesignation(selectedOption.value)
              }
              placeholder="Select Designation *"
              isClearable
            />
            {designation === "other" && (
              <TextField
                margin="dense"
                label="Enter Custom Designation"
                type="text"
                fullWidth
                value={customDesignation}
                onChange={(e) => setCustomDesignation(e.target.value)}
              />
            )}
          </FormControl>
          <FormControl fullWidth margin="dense">
            <Select
              options={userTypes}
              value={userTypes.find((option) => option.value === userType)}
              onChange={(selectedOption) => setUserType(selectedOption.value)}
              placeholder="Select User Type *"
              isClearable
            />
            {userType === "other" && (
              <TextField
                margin="dense"
                label="Enter Custom User Type"
                type="text"
                fullWidth
                value={customUserType}
                onChange={(e) => setCustomUserType(e.target.value)}
              />
            )}
          </FormControl>

          <FormControl fullWidth margin="dense">
            <Select
              options={[
                { value: "India", label: "India" },
                { value: "Others", label: "Others" }
              ]}
              value={{ value: country, label: country }}
              onChange={(selected) => {
                const value = selected?.value || "";
                setCountry(value);
                if (value !== "India") {
                  setStateId("NA");
                  setDistrictId("NA");
                }
              }}
              placeholder="Select Country"
              isClearable
            />
          </FormControl>

          {country === "Others" && (
            <TextField
              margin="dense"
              label="Enter Your Country"
              type="text"
              fullWidth
              value={otherCountry}
              onChange={(e) => setOtherCountry(e.target.value)}
            />
          )}

          {country === "India" && (
            <>
              <FormControl fullWidth margin="dense">
                <Select
                  options={statesList.map((s) => ({ value: s.id, label: s.name }))}
                  value={statesList.find((s) => s.id === stateId) && { value: stateId, label: stateName }}
                  onChange={(selected) => {
                    setStateId(selected?.value || "");
                    setStateName(selected?.label || "");
                    setDistrictId("");
                    setDistrictName("");
                  }}
                  placeholder="Select State"
                  isClearable
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <Select
                  options={districtsList.map((d) => ({ value: d.id, label: d.name }))}
                  value={districtsList.find((d) => d.id === districtId) && { value: districtId, label: districtName }}
                  onChange={(selected) => {
                    setDistrictId(selected?.value || "");
                    setDistrictName(selected?.label || "");
                  }}
                  placeholder="Select District"
                  isClearable
                  isDisabled={!stateId}
                />
              </FormControl>
            </>
          )}



        </Box>

        <Box pt={4} className="d-flex jc-en">
          <Button
            onClick={handleSubmit}
            className="custom-btn-primary "
            disabled={isSubmitDisabled}
          >
            {t("SUBMIT")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PopupForm;
