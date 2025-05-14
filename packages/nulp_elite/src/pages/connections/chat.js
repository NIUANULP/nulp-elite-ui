import React, { useEffect, useState, useRef } from "react";
import { makeStyles } from "@mui/styles";
import {
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Box from "@mui/material/Box";
import * as util from "../../services/utilService";
const axios = require("axios");
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "configs/zustandStore";
import { IconButton, Menu, MenuItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import BlockIcon from "@mui/icons-material/Block";
import SendIcon from "@mui/icons-material/Send";
import { useTranslation } from "react-i18next";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Typography from "@mui/material/Typography";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import Modal from "@mui/material/Modal";
import Footer from "components/Footer";
import Header from "components/header";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
const moment = require("moment");
const timezone = require("moment-timezone");
import Picker from "emoji-picker-react";
const routeConfig = require("../../configs/routeConfig.json");
import CloseIcon from "@mui/icons-material/Close";
const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    background: "#FFF5E9",
  },
  chatHeader: {
    padding: "8px 11px",
    backgroundColor: "#FFE6C8 !important",
    color: "#484848",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    borderBottom: "1px solid #DDDDDD",
    background: "#fff5e9 !important",
  },
  messageInput: {
    display: "flex",
    alignItems: "center",
    padding: "8px",
    backgroundColor: "#f9fafc",
    marginTop: "10px",
  },
  senderMessage: {
    borderRadius: "5px",
    padding: "8px",
    margin: "25px 0",
    textAlign: "right",
    background: "#F1FAFF  !important",
    color: "#484848",
    fontSize: "16px",
    fontWeight: "400",
    marginLeft: "auto",
    // width: "16%",
    display: "inline-block",
  },
  receiverMessage: {
    margin: "13px 0",
    padding: "8px 12px",
    clear: "both",
    alignSelf: "flex-end",
    display: "table",
    borderRadius: "5px",
    color: "#212121",
    backgroundColor: "#fff !important",
    fontSize: "16px",
    fontWeight: "400",
  },
}));
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
const reasons = require("../../configs/blockReasons.json");
const Chat = ({
  senderUserId: propSenderUserId,
  receiverUserId: propReceiverUserId,
  onChatSent,
  onClose,
  showCloseIcon,
  postUrl,
}) => {
  console.log(showCloseIcon, "showCloseIcon");

  const { t } = useTranslation();
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const dataStore = useStore((state) => state.data);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // State to track if user is blocked
  const [showUnblockOption, setShowUnblockOption] = useState(false); // State to show/hide unblock option
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [receiverData, setReceiverData] = useState([]);
  const [eneteredtextValue, setEnteredTextValue] = useState("");
  const charLimit = 700;
  const [prefilledMessage, setPrefilledMessage] = useState(
    postUrl
      ? `Hello! I'd like to connect with you regarding the post: ${postUrl}`
      : "Hello! I'd like to connect with you."
  );
  const [textValue, setTextValue] = useState(
    postUrl
      ? `Hello! I'd like to connect with you regarding the post: ${postUrl}`
      : t("HELLO_CONNECT_MESSAGE")
  );

  console.log(postUrl, "postUrl------------>");
  const chatRef = useRef(null);

  const location = useLocation();
  const {
    senderUserId: routeSenderUserId,
    receiverUserId: routeReceiverUserId,
  } = location.state || {};
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const senderUserId = propSenderUserId || routeSenderUserId;
  const receiverUserId = propReceiverUserId || routeReceiverUserId;
  const _userId = util.userId();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [activePath, setActivePath] = useState(location.pathname);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleReasonChange = (event) => {
    const selectedReason = event.target.value;
    setReason(selectedReason);
    if (selectedReason !== "Other") {
      setCustomReason("");
    }
  };
  const handleConfirm = () => {
    if (reason === "Other") {
      handleBlockUserConfirmed(customReason);
    } else {
      handleBlockUserConfirmed(reason);
    }
  };
  useEffect(() => {
    setLoggedInUserId(_userId);
    if (receiverUserId) {
      fetchUserInfo(receiverUserId);
      fetchChats();
      fetchBlockUserStatus();
    }
  }, [receiverUserId, _userId]);

  useEffect(() => {
    if (messages.length > 0 && chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, message]);

  useEffect(() => {
    const getInvitationNotAcceptedUserByIds = async () => {
      const requestBody = {
        request: {
          filters: {
            status: "1",
            userId: [receiverUserId],
          },
        },
      };

      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.ADMIN.USER_SEARCH}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          showErrorMessage(t("FAILED_TO_FETCH_DATA"));
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }

        const responseData = await response.json();
        const content = responseData?.result?.response?.content || [];
        const userInfoPromises = content.map((item) => fetchUserInfo(item.id));
        const userInfoList = await Promise.all(userInfoPromises);

        // Add designation and bio to each item
        content.forEach((item, index) => {
          item.designation = userInfoList[index].designation || "";
          item.bio = userInfoList[index].bio || "";
        });
        setReceiverData(content);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };
    getInvitationNotAcceptedUserByIds();

    if (messages.length > 0) {
      fetchChats();
      setTextValue("");
    }
  }, [receiverUserId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserInfo = async (userId) => {
    try {
      const url = `${urlConfig.URLS.POFILE_PAGE.USER_READ}`;
      const response = await axios.post(
        url,
        { user_ids: [userId] },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.result[0] || {};
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      console.error(error);
    }
  };
  useEffect(() => {
    if (_userId) {
      // Fetch block user status when component mounts
      fetchBlockUserStatus();
      fetchChats();
      updateMessage();
    }
  }, [_userId]);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    if (_userId && !isBlocked && messages.length > 0) {
      const intervalId = setInterval(fetchChats, 2000);
      return () => clearInterval(intervalId);
    }
  }, [_userId, isBlocked, messages]);

  const fetchBlockUserStatus = async () => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.GET_BLOCK_USER}?sender_id=${_userId}&receiver_id=${receiverUserId}`;
      const response = await axios.get(url, {
        withCredentials: true,
      });
      const blockedUserId =
        response.data.result.length > 0
          ? response.data.result[0].sender_id
          : null;

      setIsBlocked(response.data.result.length > 0); // Update isBlocked state based on API response
      setShowUnblockOption(blockedUserId === _userId);
    } catch (error) {
      console.error("Error fetching block user status:", error);
      showErrorMessage(t("FAILED_TO_BLOCK_USER"));
    }
  };

  const fetchChats = async () => {
    try {
      if (receiverUserId) {
        const url = `${
          urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
        }?sender_id=${_userId}&receiver_id=${receiverUserId}&is_accepted=${true}`;

        // Check if the user is not blocked before fetching chats
        if (!isBlocked) {
          let attempts = 0;
          const maxAttempts = 2;
          let response;

          // Retry fetching chats until data is received or max attempts reached
          while (attempts < maxAttempts) {
            response = await axios.get(url, { withCredentials: true });
            if (response.data.result.length > 0) {
              break; // Exit loop if data is received
            }

            attempts++;
            await new Promise((res) => setTimeout(res, 1000)); // Wait 1 second before retrying
          }

          setMessages(response.data.result || []);

          if (response.data.result.length === 0) {
            console.log(
              t("HELLO_CONNECT_MESSAGE"),
              "t('HELLO_CONNECT_MESSAGE')"
            );
            setTextValue(
              postUrl
                ? `Hello! I'd like to connect with you regarding the post: ${postUrl}`
                : t("HELLO_CONNECT_MESSAGE")
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
    }
  };

  const sendMessage = async () => {
    if (textValue.trim() !== "") {
      try {
        const url = `${urlConfig.URLS.DIRECT_CONNECT.SEND_CHATS}`;
        console.log("Sending message:", textValue);

        await axios.post(
          url,
          {
            sender_id: loggedInUserId,
            receiver_id: receiverUserId,
            message: textValue,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("");
        setTextValue("");
        if (!messages.length > 0) {
          if (
            isMobile &&
            activePath === `${routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT}`
          ) {
            navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION);
          } else {
            window.location.reload();
          }
          if (onChatSent) {
            onChatSent();
          }
        }
        fetchChats(); // Fetch messages after sending a message
      } catch (error) {
        console.error("Error saving message:", error);
        showErrorMessage(t("FAILED_TO_SEND_CHAT"));
      }
    }
  };

  const updateMessage = async () => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.UPDATE_CHAT}`;
      console.log("updating message:", textValue);

      const data = await axios.put(
        url,
        {
          sender_id: _userId,
          receiver_id: receiverUserId,
          is_read: true,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating message:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const getTimeAgo = (timestamp) => {
    const timeZone = "Asia/Kolkata";
    const date = moment(timestamp).tz(timeZone);
    const now = moment().tz(timeZone);

    if (date.isSame(now, "day")) {
      return "Today";
    } else if (date.isSame(now.clone().subtract(1, "day"), "day")) {
      return "Yesterday";
    } else {
      return date.format("D MMMM YYYY");
    }
  };
  const getTime = (timestamp) => {
    const date = new Date(timestamp);
    const istTime = date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return istTime;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  const handleBlockUser = () => {
    handleDialogOpen();
  };

  const handleUnblockUser = async () => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.UNBLOCK}`;
      console.log("UnBlocking User");

      const data = await axios.post(
        url,
        {
          sender_id: loggedInUserId,
          receiver_id: receiverUserId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User unblocked successfully!");
      // Reload the page after unblocking the user
      if (data) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      showErrorMessage(t("FAILED_TO_UNBLOCK_USER"));
    }
  };

  const handleBlockUserConfirmed = async (reason) => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.BLOCK}`;

      await axios.post(
        url,
        {
          sender_id: loggedInUserId,
          receiver_id: receiverUserId,
          reason: reason,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setReason("");
      setDialogOpen(false);
      console.log("User blocked successfully!");
      // Reload the page after blocking the user
      window.location.reload();
    } catch (error) {
      console.error("Error blocking user:", error);
      showErrorMessage(t("FAILED_TO_BLOCK_USER"));
    }
    handleMenuClose(); // Close the menu after the action is completed
  };

  const handleTextareaChange = (event) => {
    setPrefilledMessage(event.target.value);
    setTextValue(event.target.value);
    const value = event.target.value;
    if (value.length <= charLimit) {
      setEnteredTextValue(value);
    }
  };
  const onEmojiClick = (event, emojiObject) => {
    const { emoji } = event;
    setTextValue((prevTextValue) => prevTextValue + emoji);
  };

  return (
    <>
      {/* <Header /> */}
      <div className={classes.chatContainer}>
        <div
          className={classes.chatHeader}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box className="d-flex" style={{ alignItems: "center" }}>
            {isMobile && (
              <IconButton onClick={handleGoBack} style={{ paddingLeft: "0" }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            {receiverData && receiverData?.length > 0 && (
              <Box
                sx={{
                  fontSize: "20px",
                  fontWeight: "500",
                  paddingLeft: "10px",
                  color: "#484848",
                  textAlign: "left",
                }}
              >
                {showCloseIcon && (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography className="h2-title chat-hed">
                        {receiverData[0].firstName} {receiverData[0].lastName}
                      </Typography>
                      <Box className="h5-title">
                        {receiverData[0].designation}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton onClick={onClose}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
                {!showCloseIcon && (
                  <Box>
                    <Typography className="h2-title chat-hed">
                      {receiverData[0].firstName} {receiverData[0].lastName}
                    </Typography>
                    <Box className="h5-title">
                      {receiverData[0].designation}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {receiverData && receiverData?.length > 0 && messages.length > 0 && (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              {!isBlocked && (
                <IconButton onClick={handleBlockUser} className="block-btn">
                  <BlockIcon
                    style={{ fontSize: "16px", paddingRight: "8px" }}
                  />
                  {t("BLOCK")}
                </IconButton>
              )}
              {showUnblockOption && (
                <IconButton onClick={handleUnblockUser} className="unblock-btn">
                  <BlockIcon
                    style={{ fontSize: "16px", paddingRight: "8px" }}
                  />
                  {t("UNBLOCK")}
                </IconButton>
              )}
            </Box>
          )}
        </div>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>
            <Box className="h3-title">{t("BLOCK_USER")}</Box>
          </DialogTitle>
          <DialogContent>
            <Box className="h5-title">
              {t("ARE_YOU_SURE_YOU_WANT_TO_BLOCK_THIS_USER")}
            </Box>
            <Box py={2}>
              <TextField
                select
                id="reason"
                name="reason"
                label={
                  <span>
                    {t("REASON")}
                    <span style={{ color: "red", marginLeft: "2px" }}>*</span>
                  </span>
                }
                variant="outlined"
                fullWidth
                value={reason}
                onChange={handleReasonChange}
              >
                {reasons.map((option) => (
                  <MenuItem key={option.option} value={option.option}>
                    {option.option}
                    {option.option !== "Other" && (
                      <Tooltip
                        title={option.description}
                        arrow
                        placement="bottom"
                        disableHoverListener={isMobile}
                        disableFocusListener={isMobile}
                        disableTouchListener={!isMobile}
                        interactive
                      >
                        <IconButton size="small" style={{ marginLeft: "8px" }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </MenuItem>
                ))}
              </TextField>
              {reason === "Other" && (
                <TextField
                  id="customReason"
                  name="customReason"
                  label={
                    <span>
                      {t("PLEASE_SPECIFY_REASON")}
                      <span style={{ color: "red", marginLeft: "2px" }}>*</span>
                    </span>
                  }
                  multiline
                  rows={3}
                  variant="outlined"
                  fullWidth
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{ marginTop: "16px" }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} className="custom-btn-default">
              {t("CANCEL")}
            </Button>
            <Button
              onClick={handleConfirm}
              className="custom-btn-primary"
              disabled={!reason || (reason === "Other" && !customReason)}
              style={{
                background:
                  !reason || (reason === "Other" && !customReason)
                    ? "rgba(0, 67, 103, 0.5)"
                    : "#004367",
              }}
            >
              {t("BLOCK")}
            </Button>
          </DialogActions>
        </Dialog>

        {receiverData && receiverData.length > 0 && !messages.length > 0 ? (
          <div className={classes.chat}>
            <Box
              className="h5-title my-15"
              style={{ color: "#484848", textAlign: "left" }}
            >
              {receiverData[0]?.bio}
              <Box className="my-15">
                {t("CONNECT_WITH_THEM_TO_GET_INSIGHTS")}
              </Box>
            </Box>
          </div>
        ) : messages.length > 0 ? (
          <div ref={chatRef} className={classes.chat}>
            <Alert severity="info" style={{ margin: "10px 0" }}>
              {t("YOUR_CHAT_WILL_DISAPPEAR")}
            </Alert>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: "right" }}>
                {index === 0 ||
                getTimeAgo(msg.timestamp) !==
                  getTimeAgo(messages[index - 1].timestamp) ? (
                  <div style={{ margin: "0 auto", textAlign: "center" }}>
                    <Box className="dayDisplay">
                      {getTimeAgo(msg.timestamp)}
                    </Box>
                  </div>
                ) : null}
                <div
                  className={
                    msg.sender_id === loggedInUserId
                      ? `${classes.senderMessage} ${classes.message}`
                      : `${classes.receiverMessage} ${classes.message}`
                  }
                >
                  <div>{msg.message}</div>
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#484848",
                        fontWeight: "400",
                      }}
                    >
                      {getTime(msg.timestamp)}
                    </div>
                    {msg.sender_id === loggedInUserId ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "13px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {msg.is_read ? (
                          <DoneAllIcon
                            style={{
                              color: "#00ebff",
                              fontSize: "15px",
                              paddingLeft: "6px",
                            }}
                          />
                        ) : (
                          <DoneAllIcon
                            style={{
                              color: "#bdbaba",
                              fontSize: "18px",
                              paddingRight: "10px",
                            }}
                          />
                        )}
                        {/* {msg.is_read ? "Read" : "Delivered"} */}
                      </div>
                    ) : null}
                  </Box>
                </div>
                {msg.is_accepted ? (
                  <div style={{ textAlign: "center" }}>
                    <Alert
                      className="my-10"
                      iconMapping={{
                        success: <CheckCircleOutlineIcon fontSize="inherit" />,
                      }}
                    >
                      {t("YOU_CHAT_ACCEPTED")}
                    </Alert>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {isBlocked ? (
          <Alert severity="warning" style={{ marginBottom: "10px" }}>
            {t("USER_BLOCKED_YOU_CANNOT")}
          </Alert>
        ) : (
          <>
            {receiverData &&
              receiverData.length > 0 &&
              !messages.length > 0 && (
                <Alert severity="info" style={{ margin: "10px 0" }}>
                  {t("SYSTEM_GENERATED_MESSAGE")}
                </Alert>
              )}
            <div
              className="d-flex sendMessag sendTextBox"
              style={{ position: "relative" }}
            >
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    left: "14px",
                    zIndex: 1,
                  }}
                >
                  <Picker
                    onEmojiClick={onEmojiClick}
                    pickerStyle={{ width: "100%" }}
                  />
                </div>
              )}
              <Button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ color: "#484848", cursor: "pointer" }}
              >
                <InsertEmoticonIcon />
              </Button>
              <TextField
                multiline
                minRows={2}
                maxRows={10}
                value={textValue}
                onChange={handleTextareaChange}
                disabled={isBlocked}
                placeholder="Enter your message here..."
                fullWidth
                sx={{ fontSize: "13px" }}
                inputProps={{ maxLength: charLimit }}
              />
              <Box
                mt={1}
                textAlign="right"
                sx={{
                  fontSize: "12px",
                  color: "#484848",
                  marginTop: "0px",
                  backgroundColor: "#ffffff",
                  padding: "25px",
                }}
              >
                {`${textValue.length}/${charLimit}`}
              </Box>
              <Button
                style={{ color: "#484848" }}
                onClick={sendMessage}
                disabled={isBlocked}
              >
                <SendIcon />
              </Button>
            </div>
          </>
        )}
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default Chat;
