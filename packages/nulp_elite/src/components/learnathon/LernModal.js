import React, { useState, useEffect } from "react";
import { Modal, Box, IconButton, Button, Grid } from "@mui/material";
import * as util from "services/utilService";
const urlConfig = require("../../configs/urlConfig.json");
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ToasterCommon from "pages/ToasterCommon";
import dayjs from "dayjs";
const routeConfig = require("../../configs/routeConfig.json");



const LernModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [toasterMessage, setToasterMessage] = useState("");
  const [toasterOpen, setToasterOpen] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(() => {
    // Check if the modal has been shown in the current session
    const isModalShown = sessionStorage.getItem("isModalShown");
    return isModalShown !== "true"; // Show modal if not already shown
  });
  const [isReviewer, setIsREviewer] = useState(false)
  const [lernUser, setLernUser] = useState([]);
  const [responseCode, setResponseCode] = useState([]);
  const [orgId, setOrgId] = useState([]);
  const [learnathonUser ,isLearnathonUser]=useState()
  const _userId = util.userId();
  const handleClose = () => {
    setIsModalOpen(false);
    sessionStorage.setItem("isModalShown", "true"); // Set flag to not show modal again
  };

  const today = dayjs();
  const formattedDate = today.subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

  const isParticipateNow = today.isBetween(
    dayjs(urlConfig.LEARNATHON_DATES.CONTENT_SUBMISSION_START_DATE),
    dayjs(urlConfig.LEARNATHON_DATES.CONTENT_SUBMISSION_END_DATE),
    "minute"
  );

  const isReviewNow = today.isBetween(
    dayjs(urlConfig.LEARNATHON_DATES.CONTENT_REVIEW_START_DATE),
    dayjs(urlConfig.LEARNATHON_DATES.CONTENT_REVIEW_END_DATE),
    "minute"
  );

  const isVoteNow = today.isBetween(
    dayjs(formattedDate),
    dayjs(urlConfig.LEARNATHON_DATES.VOTING_END_DATE),
    "minute"
  );

  const fetchData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}`;
      const response = await fetch(url);
      const data = await response.json();
      const rolesData = data.result.response.channel;
      const roles = data.result.response.roles;
      let organizationId;
      isLearnathonUser(data.result.response.firstName.includes("tekdiNulp11"))
      console.log(data.result.response.firstName.includes("tekdiNulp11"),"data.result.response---------------");

      if (roles[0]?.scope[0]?.organisationId) {
        organizationId = roles[0].scope[0].organisationId;
      } else {
        organizationId =
          data?.result?.response?.organisations[0]?.organisationId;
      }

      const extractedRoles = roles.map((roleObj) => roleObj.role);
      setRoleList(extractedRoles);
      setOrgId(organizationId);
      setLernUser(rolesData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkAccess = async () => {
    try {
      const url = `${urlConfig.URLS.CHECK_USER_ACCESS}`;
      const response = await fetch(url);
      const data = await response.json();

      const userID = data.result.data;
      const user = userID.find((user) => user.user_id === _userId);

      if (!user) {
        console.log("User ID not found. Calling fetchUserAccess...");
        fetchUserAccess();
      } else if (user.creator_access === true) {
        navigate("/webapp/mylernsubmissions");
        setIsModalOpen(false);
        console.log(
          "User ID found with creator access. No need to call fetchUserAccess."
        );
      } else if (user.creator_access === false) {
        console.log(
          "User ID found but no creator access. Calling fetchUserAccess..."
        );
        fetchUserAccess();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  let responsecode;
  const fetchUserAccess = async () => {
    const isCreator = roleList.includes("CONTENT_CREATOR");
    const isReviewer = roleList.includes("SYSTEM_ADMINISTRATION")
    setIsREviewer(isReviewer)

    try {
      const url = `${urlConfig.URLS.PROVIDE_ACCESS}`;
      const role = isCreator ? roleList : ["CONTENT_CREATOR", ...roleList];
      const requestPayload = {
        request: {
          organisationId: orgId,
          roles: role,
          userId: _userId,
        },
      };

      if (isCreator) {
        requestPayload.isCreator = false;
      } else {
        requestPayload.isCreator = true;
      }

      const response = await axios.post(url, requestPayload);
      const data = await response.data;
      const result = data.result.data.responseCode;

      responsecode = result;
      setResponseCode(result);

      if (result === "OK") {
        navigate("webapp/mylernsubmissions");
        setIsModalOpen(false);
      } else {
        setToasterMessage("Something went wrong! Please try again later");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // Fetch data when the component mounts or _userId changes
  useEffect(() => {
    if (_userId) {
      fetchData();
    }
  }, [_userId]);

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
    overflow: "auto",
    borderRadius: "10px",
    width: {
      xs: "100%",
      sm: "100%",
      md: "600px",
    },
  };

  const handleCardClick = async () => {
    sessionStorage.setItem("isModalShown", "true"); // Set flag to not show modal again

    if (lernUser === "nulp-learn") {
      navigate("/webapp/mylernsubmissions");
      setIsModalOpen(false); // Close the modal
    } else {
      await checkAccess();
    }
  };

  return (
    <div>
      {toasterMessage && (
        <Box>
          <ToasterCommon response={toasterMessage} />
        </Box>
      )}
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Box className="h2-title">{t("LERN_title")}</Box>
            </Box>
            <Box>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box className="mt-10 xs-mb-10">
            <Divider />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={4}>
              <Box className="profileBox">
                <img height="222px" width="207px" src={require("../../assets/Image_for_Pop_up.jpg")} alt="" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <Box className="profileBox ml-20">
                {/*Commented for Demo*/}
               {/* {isParticipateNow && (
                    <Box>
                        <Box className="mt-20">{t("LERN_MESSAGE")}</Box>
                        <Box className="mt-20">{t("LERN_MESSAGE_LINE_TWO")}</Box>
                    </Box>
                )}
                {isReviewNow && isReviewer && (
                    <Box>
                        <Box className="mt-20">{t("REVIEW_NOW")}</Box>
                        <Box className="mt-20">{t("REVIEW_MESSEGE")}</Box>
                    </Box>
                )}
                {isVoteNow && (
                    <Box>
                        <Box className="mt-20">{t("VOTE_NOW")}</Box>
                        <Box className="mt-20">{t("VOTE_NOW_MESSEGE")}</Box>
                    </Box>
                )} */}
                <Box className="mt-20">{t("LERN_MESSAGE")}</Box>
                <Box className="mt-20">{t("LERN_MESSAGE_LINE_TWO")}</Box>
                <Box className="lg-mt-30">
                  {/*Commented for Demo*/}
                  {/* {isParticipateNow || learnathonUser && (
                          <Button
                            className="viewAll"
                            onClick={handleCardClick}
                          >
                            {t("Click here to now more")}
                          </Button>
                      )}
                  {isReviewNow && isReviewer && (
                          <Button
                            className="viewAll"
                            onClick={handleCardClick}
                          >
                            {t("REVIEW_NOW")}
                          </Button>
                      )}
                  {isVoteNow && (
                        <Button
                          className="viewAll"
                          onClick={handleCardClick}
                        >
                          {t("VOTE_NOW")}
                        </Button>
                    )} */}   
                    
                     {lernUser === "nulp-learn" ? (
                    <Button className="viewAll" onClick={handleCardClick}>
                      {t("Click here to know more")}
                    </Button>
                  ) : (
                    <Button className="viewAll" onClick={handleCardClick}>
                      {t("Click here to know more")}
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};

export default LernModal;
