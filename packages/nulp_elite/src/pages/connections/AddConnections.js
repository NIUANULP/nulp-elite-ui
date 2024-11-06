import React, { useState, useEffect } from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Modal as BaseModal, makeStyles } from "@material-ui/core";
import { styled, css } from "@mui/system";
import PropTypes from "prop-types";
import { Button } from "@mui/base/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import * as util from "../../services/utilService";
import Header from "components/header";
import Footer from "components/Footer";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useTranslation } from "react-i18next";
import { useStore } from "configs/zustandStore";
import Pagination from "@mui/material/Pagination";
import Popover from "@mui/material/Popover";
import { Container } from "@mui/material";
import Alert from "@mui/material/Alert";
import Filter from "components/filter";
const axios = require("axios");
const designations = require("../../configs/designations.json");
const urlConfig = require("../../configs/urlConfig.json");
import Autocomplete from "@mui/material/Autocomplete";
import ToasterCommon from "../ToasterCommon";
import Grid from "@mui/material/Grid";
import Chat from "./chat";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FloatingChatIcon from "components/FloatingChatIcon";
const routeConfig = require("../../configs/routeConfig.json");
import { Loading } from "@shiksha/common-lib";

const AddConnections = () => {
  const [value, setValue] = React.useState("1");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showChat, setShowChat] = useState(false);
  const [buttonText, setButtonText] = useState("Invite");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("Tab1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [userSearchData, setUserSearchData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
 
  const [invitationAcceptedUsers, setInvitationAcceptedUsers] = useState();
  const [invitationNotAcceptedUsers, setInvitationNotAcceptedUsers] =
    useState();
  const [loggedInUserId, setLoggedInUserId] = useState();
  const location = useLocation();
  const [invitationReceiverByUser, setInvitationReceivedUserByIds] = useState([]);
  const [userChat, setUserChat] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState(false);
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState(
    t("HELLO_CONNECT_MESSAGE")
  );
  const setData = useStore((state) => state.setData);
  const [totalPages, setTotalPages] = useState(1);
  const [userQuerySearchData, setUserQuerySearchData] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userInfo, setUserInfo] = useState();
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [designationsList, setDesignationsList] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [showTableTwo, setShowTableTwo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const navigate = useNavigate();
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [blockedUserList, setBlockedUserList] = useState([]);
  const [blockUserIds, setBlockUserIds] = useState([]);
  const [openBlock, setOpenBlock] = useState(null);
  const handleUnblockClose = () => setOpenBlock(false);
  const [userIdToReject, setUserIdToReject] = useState(null);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getChat = async (userId) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sender_id: loggedInUserId,
      receiver_id: userId,
      is_accepted: true,
    });

    try {
      const url = `${
        urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
      }?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
        throw new Error(t("FAILED_TO_FETCH_CHAT"));
      }

      const responseData = await response.json();
      console.log("getChat", responseData.result);
      return responseData.result;
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
    } finally {
      setIsLoading(false);
    }
  };

  const getChatRequest = async (userId) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sender_id: loggedInUserId,
      receiver_id: userId,
      is_accepted: false,
      is_read: false,
    });

    try {
      const url = `${
        urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
      }?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
        throw new Error(t("FAILED_TO_FETCH_CHAT"));
      }

      const responseData = await response.json();
      console.log("getChatRequest", responseData.result);
      return responseData.result;
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopoverClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? "simple-popover" : undefined;

  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };
  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  useEffect(() => {
    setDesignationsList(designations);
    if (activeTab === "Tab2") {
      handleSearch();
    }
  }, [currentPage]);

  useEffect(() => {
    const _userId = util.userId();
    setLoggedInUserId(_userId);
    fetchUserInfo(_userId);
  }, []);

  const toggleChat = () => {
    setShowChat(!showChat);
    setButtonText(showChat ? t("INVITE") : t("SEND_INVITATION"));
  };

  useEffect(() => {
    onMyConnection();
  }, [loggedInUserId]);

  function handleClick(event) {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsModalOpen(false);
  };

  const handleSearch = async (selectedUserId = "") => {
    setIsLoading(true);
    setUserSearchData([]);
    setUserFilter([]);

    let filters = {
      status: "1",
    };
    if (selectedUserId) {
      filters.userId = selectedUserId;
    }
    const requestBody = {
      request: {
        filters: filters,
        // query: searchQuery,
        limit: 10,
        offset: 10 * (currentPage - 1),
        sort_by: {
          lastUpdatedOn: "desc",
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

      let responseData = await response.json();
      const TotalPage = Math.ceil(responseData?.result?.response?.count / 10);
      if (TotalPage <= 1000) {
        setTotalPages(TotalPage);
      } else {
        setTotalPages(1000);
      }
      console.log("responseData", responseData);
      console.log(
        "user list of all type user",
        invitationAcceptedUsers,
        invitationNotAcceptedUsers,
        invitationReceiverByUser
      );
      const allTypeOfUsers = [
        ...(invitationAcceptedUsers || []),
        ...(invitationNotAcceptedUsers || []),
        ...(invitationReceiverByUser || []),
      ]
        .filter((e) => e.userId)
        .map((e) => e.userId);
      console.log("allTypeOfUsers", allTypeOfUsers);
      const responseUserData = responseData?.result?.response?.content?.filter(
        function (el) {
          return !allTypeOfUsers.includes(el.userId);
        }
      );
      const userInfoPromises = responseUserData.map((item) =>
        fetchUserInfo(item.id)
      );
      const userInfoList = await Promise.all(userInfoPromises);

      // Add designation and bio to each item
      responseUserData.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });
      console.log("responseUserData", responseUserData);
      setUserSearchData(responseUserData);
      setUserFilter(responseUserData);
      console.log("responseSearchData", responseData);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const onUserQuerySearch = async () => {
    setIsLoading(true);
    setError(null);
    setUserQuerySearchData([]);
    const requestBody = {
      request: {
        filters: {
          status: "1",
        },
        query: searchQuery,
        sort_by: {
          lastUpdatedOn: "desc",
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

      let responseData = await response.json();

      // Fetch user info for all items concurrently
      const content = responseData?.result?.response?.content || [];
      const userInfoPromises = content.map((item) => fetchUserInfo(item.id));
      const userInfoList = await Promise.all(userInfoPromises);

      // Add designation add bio to each item
      content.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });
      setUserQuerySearchData(content);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (selectedUser) => {
    setSelectedUser(selectedUser);
  };
  const handleTextareaChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleSendClick = async () => {
    try {
      await sendChatRequestToUser(selectedUser.userId);
      handleClose();
      setShowModal(true);
    } catch (error) {
      console.error("Error sending chat request:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const userClick = (selectedUser) => {
    setSelectedUser(selectedUser);
    setShowChatModal(true);
  };
  const getConnections = async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sender_id: loggedInUserId,
      receiver_id: loggedInUserId,
      is_connection: true,
    });

    try {
      const url = `${
        urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
      }?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
        throw new Error(t("FAILED_TO_FETCH_CHAT"));
      }
      setInvitationReceivedUserByIds([]);
      setInvitationAcceptedUsers([]);
      setInvitationNotAcceptedUsers([]);
      const responseData = await response.json();
      console.log("getConnections", responseData.result);

      const invitationNotAcceptedUserIds = responseData.result
        .filter((res) => !res.is_accepted && res.sender_id === loggedInUserId)
        .map((res) => res.receiver_id);

      const sender = responseData.result
        .filter((res) => res.is_accepted && res.receiver_id === loggedInUserId)
        .map((res) => res.sender_id);
      const receiver = responseData.result
        .filter((res) => res.is_accepted && res.sender_id === loggedInUserId)
        .map((res) => res.receiver_id);
      const invitationAcceptedUserIds = sender.concat(receiver);

      const invitationReceivedUserIds = responseData.result
        .filter(
          (res) =>
            !res.is_accepted &&
            res.receiver_id == loggedInUserId &&
            res.sender_id !== loggedInUserId
        )
        .map((res) => res.sender_id);

      invitationReceivedUserIds.length > 0 &&
        getInvitationReceivedUserByIds(invitationReceivedUserIds);
      invitationNotAcceptedUserIds.length > 0 &&
        getInvitationNotAcceptedUserByIds(invitationNotAcceptedUserIds);
      invitationAcceptedUserIds.length > 0 &&
        getInvitationAcceptedUserByIds(invitationAcceptedUserIds);
    } catch (error) {
      console.error("Error fetching data:", error);

      showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitationNotAcceptedUserByIds = async (userIds) => {
    setIsLoading(true);
    setError(null);
    setInvitationNotAcceptedUsers([]);

    const requestBody = {
      request: {
        filters: {
          status: "1",
          userId: userIds,
        },
        // query: searchQuery,
        // pageNumber: currentPage,
        // pageSize: pageSize,
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
      setInvitationNotAcceptedUsers(content);
      handleOpen();
      handleClose();

      console.log(
        "InvitationNotAcceptedUsers",
        responseData.result.response.content
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
    console.log("invitationNotAcceptedUsers", invitationNotAcceptedUsers);
  };

  const getInvitationAcceptedUserByIds = async (userIds) => {
    setIsLoading(true);
    setError(null);
    setInvitationAcceptedUsers([]);

    const requestBody = {
      request: {
        filters: {
          status: "1",
          userId: userIds,
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
      const userList = responseData?.result?.response?.content || [];

      const userListWithChat = await Promise.all(
        userList.map(async (item) => {
          const userChat = await getChat(item.id);

          if (userChat?.length > 0) {
            // Find the latest chat message
            const latestChat = userChat.reduce((latest, current) => {
              return new Date(current.timestamp) > new Date(latest.timestamp)
                ? current
                : latest;
            });

            const allRead = userChat.every((chat) => {
              if (loggedInUserId !== chat.sender_id) {
                return chat.is_read;
              }
              return true;
            });
            item = {
              ...item,
              latestChat: latestChat.message,
              isRead: allRead,
            };
          } else {
            item = { ...item, latestChat: null, isRead: true };
          }

          return item;
        })
      );

      const userInfoPromises = userListWithChat.map((item) =>
        fetchUserInfo(item.id)
      );
      const userInfoList = await Promise.all(userInfoPromises);

      // Add designation and bio to each item
      userListWithChat.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });

      setInvitationAcceptedUsers(userListWithChat || []);
      console.log(
        "InvitationAcceptedUsers",
        responseData.result.response.content
      );
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitationReceivedUserByIds = async (userIds) => {
    setIsLoading(true);
    setError(null);
    setInvitationReceivedUserByIds([]);
    const requestBody = {
      request: {
        filters: {
          status: "1",
          userId: userIds,
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

      const userListWithChat = await Promise.all(
        content.map(async (item) => {
          const userChat = await getChatRequest(item.id);
          if (userChat?.length > 0) {
            item = { ...item, messageRequest: userChat[0]?.message };
          }
          return item;
        })
      );

      const userInfoPromises = userListWithChat.map((item) =>
        fetchUserInfo(item.id)
      );
      const userInfoList = await Promise.all(userInfoPromises);

      userListWithChat.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });

      setInvitationReceivedUserByIds(userListWithChat);
      handleOpen();
      handleClose();
      console.log(
        "getInvitationReceivedUserByIds",
        responseData.result.response.content
      );
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };
  const fetchBlockUserList = async () => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.GET_BLOCK_USER_LIST}?sender_id=${loggedInUserId}`;
      const responseData = await axios.get(url, {
        withCredentials: true,
      });
      if (Array.isArray(responseData.data.result)) {
        const senderIds = responseData.data.result
          .filter(({ is_blocked }) => is_blocked)
          .map(({ receiver_id }) => receiver_id);

        console.log("Blocked Sender IDs:", senderIds);
        setBlockUserIds(senderIds);
        if (senderIds?.length > 0) {
          getBlockedUserByIds(senderIds);
        }
      } else {
        console.error("responseData.data.result is not an array");
      }
    } catch (error) {
      console.error("Error fetching block user list:", error);
    }
  };

  const getBlockedUserByIds = async (userIds) => {
    setError(null);
    setBlockedUserList([]);
    const requestBody = {
      request: {
        filters: {
          status: "1",
          userId: userIds,
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

      content.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });

      setBlockedUserList(content);
      console.log("setBlockedUserList", responseData.result.response.content);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };
  const onMyConnection = () => {
    if (loggedInUserId) {
      getConnections();
    }
  };

  const handleAcceptedChatOpen = (userId, name, designation) => {
    const dataToSend = {
      userId: userId,
      fullName: name,
      designation: designation,
    };
    localStorage.setItem("userId", userId);
    localStorage.setItem("chatName", name);
    localStorage.setItem("designation", designation);
    setData(dataToSend);
    setSelectedUserName(name);
    getUserChat(userId);
    setIsModalOpen(true);
    setOpen(true);
    // return <Navigate to={`/message`} />;
  };

  const handleCloseChatHistoryModal = () => {
    setOpen(false);
  };

  const handleNotAcceptedChatOpen = () => {
    getUserChatNotAccepted();
  };

  const acceptChat = (userId) => {
    acceptChatInvitation(userId);
  };

  const rejectChat = (userId) => {
    rejectChatInvitation(userId);
  };

  const acceptChatInvitation = async (userId) => {
    setIsLoading(true);
    setError(null);

    const requestBody = {
      sender_id: userId,
      receiver_id: loggedInUserId,
    };

    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.ACCEPT_CHAT}`;
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
      console.log("acceptChatInvitation", responseData.result);
      onMyConnection();
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const rejectChatInvitation = async (userId) => {
    setIsLoading(true);
    setError(null);
    const requestBody = {
      sender_id: userId,
      receiver_id: loggedInUserId,
    };

    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.REJECT_CHAT}`;
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
      console.log("rejectChatInvitation", responseData.result);
      setUserIdToReject(null);
      onMyConnection();
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const getUserChat = async (userId) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sender_id: loggedInUserId,
      receiver_id: loggedInUserId,
      is_accepted: true,
      is_connection: true,
    });

    try {
      const url = `${
        urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
      }?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_CHAT"));
        throw new Error(t("FAILED_TO_FETCH_CHAT"));
      }

      const responseData = await response.json();
      console.log("getUserChat", responseData.result);
      const userChats = responseData.result.filter(
        (res) =>
          (res.sender_id === loggedInUserId && res.receiver_id === userId) ||
          (res.sender_id === userId && res.receiver_id === loggedInUserId)
      );
      setUserChat(userChats);
    } catch (error) {
      console.error("Error fetching data:", error);

      showErrorMessage(t("FAILED_TO_FETCH_CHAT"));

      // Open the toaster
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatRequestToUser = async (userId) => {
    setIsLoading(true);
    setError(null);

    const requestBody = {
      sender_id: loggedInUserId,
      receiver_id: userId,
      message: textValue,
      sender_email: "sender@gmail.com",
      receiver_email: "receiver@gmail.com",
    };

    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.SEND_CHATS}`;
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
      setSelectedUser("");
      console.log("sentChatRequest", response);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const onClickSearchedUser = (selectedUserId) => {
    // handlePopoverClose();
    const allTypeOfUsers = [
      ...(invitationAcceptedUsers || []),
      ...(invitationNotAcceptedUsers || []),
      ...(invitationReceiverByUser || []),
    ];
    if (activeTab === "Tab1") {
      if (
        allTypeOfUsers &&
        allTypeOfUsers.find((user) => user.userId === selectedUserId)
      ) {
        emptyOtherSectionsFromMyConnection(selectedUserId);
      } else {
        handleTabClick("Tab2");
        setValue("2");
        handleSearch(selectedUserId);
      }
    } else {
      if (
        allTypeOfUsers &&
        allTypeOfUsers.find((user) => user.userId === selectedUserId)
      ) {
        emptyOtherSectionsFromMyConnection(selectedUserId);
        handleTabClick("Tab1");
        setValue("1");
      } else {
        handleSearch(selectedUserId);
      }
    }
  };

  const emptyOtherSectionsFromMyConnection = (selectedUserId) => {
    if (
      invitationReceiverByUser &&
      invitationReceiverByUser.find((user) => user.userId === selectedUserId)
    ) {
      setInvitationReceivedUserByIds(
        invitationReceiverByUser.filter(
          (user) => user.userId === selectedUserId
        )
      );
      setInvitationAcceptedUsers([]);
      setInvitationNotAcceptedUsers([]);
    } else if (
      invitationAcceptedUsers &&
      invitationAcceptedUsers.find((user) => user.userId === selectedUserId)
    ) {
      setInvitationAcceptedUsers(
        invitationAcceptedUsers.filter((user) => user.userId === selectedUserId)
      );
      setInvitationReceivedUserByIds([]);
      setInvitationNotAcceptedUsers([]);
    } else if (
      invitationNotAcceptedUsers &&
      invitationNotAcceptedUsers.find((user) => user.userId === selectedUserId)
    ) {
      setInvitationNotAcceptedUsers(
        invitationNotAcceptedUsers.filter(
          (user) => user.userId === selectedUserId
        )
      );
      setInvitationAcceptedUsers([]);
      setInvitationReceivedUserByIds([]);
    }
  };
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

      setUserInfo(response.data.result);
      return response.data.result[0] || {};
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      console.error(error);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 3) {
      onUserQuerySearch(searchQuery);
    }
  }, [searchQuery]);
  const handleShowFullMessage = (itemId) => {
    setExpandedMessageId(itemId === expandedMessageId ? null : itemId);
  };
  const handleDesignationFilter = async (event) => {
    const userDesignation = await handleFilter(event);

    setUserIds(userDesignation);
    let filters = {
      status: "1",
    };
    if (userDesignation && userDesignation?.length > 0) {
      filters.userId = userDesignation;
      const responseUserData = await handleFilterChange(filters);
      setUserSearchData(responseUserData);
    }else if(event.length===0){
      const responseUserData = await handleFilterChange(filters);
      setUserSearchData(responseUserData);
    }
      else{
      filters.userId = "";
      const responseUserData = await handleFilterChange(filters);
    }
    
    
  };

  const handleUserNameFilter = async (event) => {
    let filters = {
      status: "1",
    };
    if (event) {
      filters.firstName = event;
    }
    const responseUserData = await handleFilterChange(filters);
    setUserSearchData(responseUserData);
  };

  const handleFilter = async (event) => {
    try {
      const url = `${urlConfig.URLS.POFILE_PAGE.USER_READ}`;
      const response = await axios.post(
        url,
        { designations: event },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setUserInfo(response.data.result);
      const newIds = response.data.result.map((item) => item.user_id);
      return newIds;
    } catch (error) {
      console.error(error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const handleFilterChange = async (filters) => {
    setIsLoading(true);
    setError(null);
    setUserSearchData([]);

    const requestBody = {
      request: {
        filters: filters,
        limit: 10,
        offset: 10 * (currentPage - 1),
        sort_by: {
          lastUpdatedOn: "desc",
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

      let responseData = await response.json();
      setTotalPages(Math.ceil(responseData?.result?.response?.count / 10));
      const responseUserData = responseData?.result?.response?.content;
      const userInfoPromises = responseUserData.map((item) =>
        fetchUserInfo(item.id)
      );
      const userInfoList = await Promise.all(userInfoPromises);

      // Add designation and bio to each item
      responseUserData.forEach((item, index) => {
        item.designation = userInfoList[index].designation || "";
        item.bio = userInfoList[index].bio || "";
      });

      setUserSearchData(responseUserData);
      return responseUserData;
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!autocompleteOpen) {
      setOptions([]);
    }
  }, [autocompleteOpen]);

  const fetchOptions = async (searchQuery) => {
    const requestBody = {
      request: {
        filters: {
          status: "1",
        },
        query: searchQuery,
        sort_by: {
          lastUpdatedOn: "desc",
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
        throw new Error("Failed to fetch data");
      }

      let responseData = await response.json();
      return responseData?.result?.response?.content || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 3) {
      const fetchedOptions = await fetchOptions(newInputValue);
      setOptions(fetchedOptions);
      setAutocompleteOpen(true);
    } else {
      setAutocompleteOpen(false);
    }
  };

  const getOptionLabel = (option) =>
    `${option.firstName}${option.lastName ? ` ${option.lastName}` : ""}`;

  const handleOnSelectSearchedUser = (event, user) => {
    onClickSearchedUser(user?.userId);
    console.log("Selected Option:", user);
  };
  const handleButtonClick = () => {
    setSelectedChatUser(null);
    setShowTableTwo(true);
  };
  const handleBackClick = () => {
    setShowTableTwo(false);
    handleTabClick("Tab1");
    setCurrentPage(1);
    onMyConnection();
    setSelectedChatUser(null);
  };
  const showMessages = (creatorId) => {
    if (isMobile) {
      navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT, {
        state: { senderUserId: loggedInUserId, receiverUserId: creatorId },
      });
    } else {
      setSelectedChatUser({
        senderUserId: loggedInUserId,
        receiverUserId: creatorId,
      });
      setSelectedUserId(creatorId);
    }
  };

  const handleRejectClick = (userId) => {
    setUserIdToReject(userId);
    setOpen(true);
  };

  const handleConfirmReject = () => {
    if (userIdToReject) {
      rejectChat(userIdToReject);
    }
    setOpen(false);
  };
  const handleUnblockedClick = (userId) => {
    setOpenBlock(userId);
  };
  const unBlockedUserChat = (userId) => {
    handleUnblockUser(userId);
    setOpenBlock(null);
  };
  const handleUnblockUser = async (receiverUserId) => {
    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.UNBLOCK}`;

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
  return (
    <Box>
      <Header />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Box>
      <Container maxWidth="xl" role="main" className="pt-0 xs-pb-62 pt-108">
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}

        {/* <Box textAlign="center" padding="10">
          <Box> */}
        <Grid
          container
          spacing={2}
          className="pt-8"
          style={{ paddingLeft: "16px" }}
        >
          <Grid
            item
            xs={12}
            md={4}
            lg={4}
            className="sm-p-25 left-container my-custom pr-16 xs-shadow-none"
            style={{ background: "#fff" }}
          >
            <Box
              className="d-flex my-15"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box className="h4-title">{t("CONNECTION")}</Box>
              {!showTableTwo ? (
                <Button
                  type="button"
                  className="custom-btn-default xs-mr-10"
                  onClick={() => {
                    setCurrentPage(1);
                    handleSearch();
                    handleButtonClick();
                  }}
                >
                  {t("ADD_NEW")}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleBackClick}
                  className="custom-btn-primary mr-5"
                >
                  {t("BACK")}
                </Button>
              )}
            </Box>
            <TabContext value={value} className="addConnection">
              {!showTableTwo ? (
                <>
                  <Box
                    sx={{ borderBottom: 1, borderColor: "divider" }}
                    className="addConnection"
                  >
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab
                        label={t("MY_CONNECTION")}
                        value="1"
                        style={{ fontSize: "12px", color: "#484848" }}
                        onClick={() => {
                          handleTabClick("Tab1");
                          setCurrentPage(1);
                          onMyConnection();
                        }}
                      />
                      <Tab
                        label={`${t("CONNECTION_REQUEST")} (${
                          invitationReceiverByUser?.length || 0
                        })`}
                        value="2"
                        style={{ fontSize: "12px", color: "#484848" }}
                        onClick={() => {
                          setOpen(false);
                          handleTabClick("Tab2");
                        }}
                      />
                      <Tab
                        label={t("BLOCKED_USERS")}
                        value="3"
                        style={{ fontSize: "12px", color: "#484848" }}
                        onClick={() => {
                          fetchBlockUserList();
                        }}
                      />
                    </TabList>
                  </Box>

                  <TabPanel value="1" style={{ padding: "0" }}>
                    <Box className="scroll-45">
                      {invitationReceiverByUser &&
                        invitationReceiverByUser.length === 0 &&
                        invitationAcceptedUsers &&
                        invitationAcceptedUsers.length === 0 &&
                        invitationNotAcceptedUsers &&
                        invitationNotAcceptedUsers.length === 0 && (
                          <Box marginLeft="150px">
                            <p>{t("NO_USERS_FOUND")}</p>
                          </Box>
                        )}
{isLoading ? (
                  <Loading message={t("LOADING")} />) :
                  <>
                      {invitationAcceptedUsers &&
                        invitationAcceptedUsers.map((item) => (
                          <List
                            sx={{}}
                            style={{ color: "green", cursor: "pointer" }}
                            className="connection-tab"
                            key={item.userId}
                          >
                            <ListItem
                              onClick={() => {
                                showMessages(item.userId);
                              }}
                              style={{
                                fontWeight:
                                  item.userId === selectedUserId
                                    ? "normal"
                                    : "normal",
                                color:
                                  item.userId === selectedUserId
                                    ? "black"
                                    : "inherit",
                                backgroundColor:
                                  item.userId === selectedUserId
                                    ? "#f4fbff"
                                    : "inherit",
                              }}
                            >
                              <ListItemText
                                primary={
                                  <>
                                    <span
                                      style={{
                                        color:
                                          item.userId === selectedUserId
                                            ? "black"
                                            : item.isRead === false
                                            ? "black"
                                            : "black",
                                        fontWeight:
                                          item.userId === selectedUserId
                                            ? "normal"
                                            : item.isRead === false
                                            ? "normal"
                                            : "normal",
                                      }}
                                    >
                                      {`${item.firstName} ${
                                        item.lastName ? item.lastName : " "
                                      }`}
                                    </span>
                                    <div
                                      style={{
                                        display: "inline",
                                        color: "#484848",
                                      }}
                                    >
                                      {" "}
                                      |{" "}
                                    </div>
                                    <div
                                      className="h6-title "
                                      style={{ display: "inline" }}
                                    >
                                      {item.designation}
                                    </div>
                                    {/* <span className="h6-title ">{` |  ${item.designation}`}</span> */}
                                  </>
                                }
                                secondary={
                                  <span className="h6-title ">
                                    {item.latestChat}
                                  </span>
                                }
                                onClick={() =>
                                  handleAcceptedChatOpen(
                                    item.userId,
                                    `${item.firstName}${
                                      item.lastName ? ` ${item.lastName}` : ""
                                    }`,
                                    item.designation
                                  )
                                }
                              />
                            </ListItem>
                            <Divider />
                          </List>
                        ))}

                      {invitationNotAcceptedUsers &&
                        invitationNotAcceptedUsers?.map((item) => (
                          <List
                            sx={{}}
                            style={{ fontSize: "14px", cursor: "pointer" }}
                            onClick={() => userClick(item)}
                            className="connection-tab"
                          >
                            <ListItem>
                              <ListItemText
                                primary={
                                  <span
                                    style={{ fontSize: "1rem", color: "#000" }}
                                  >
                                    {`${item.firstName} ${
                                      item.lastName ? item.lastName : " "
                                    }`}
                                    <div
                                      style={{
                                        display: "inline",
                                        color: "#484848",
                                      }}
                                    >
                                      {" "}
                                      |{" "}
                                    </div>
                                    <div
                                      className="h6-title "
                                      style={{ display: "inline" }}
                                    >
                                      {item.designation}
                                    </div>
                                  </span>
                                }
                              />
                            </ListItem>
                            <Box className="left-bx">
                              <custom-chip>{t("REQUEST_SENT")}</custom-chip>
                            </Box>
                            <Divider />
                          </List>
                        ))}
                        </>
              }
                      <div>
                        {showChatModal && (
                          <Modal
                            open={showChatModal}
                            onClose={handleCloseModal}
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            className="invite-popup"
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              pt: "10vh",
                              p: "0",
                            }}
                          >
                            <ModalContent sx={{ width: "80%" }}>
                              <div style={{ textAlign: "center" }}>
                                <h2 className="h5-title">
                                  {t("INVITATION_NOT_ACCEPTED")}
                                </h2>
                                <Button
                                  onClick={(e) => {
                                    setShowChatModal(false);
                                  }}
                                  className="custom-btn-default mb-10"
                                >
                                  {t("CLOSE")}
                                </Button>
                              </div>
                            </ModalContent>
                          </Modal>
                        )}
                      </div>
                    </Box>
                  </TabPanel>
                  <TabPanel value="2">
                    <Box className="scroll">
                      {invitationReceiverByUser.length ===0 && (
                        <Box marginTop="26px" marginLeft="163px">
                          {t("NO_CHAT_REQUEST")}
                        </Box>
                         
                      )}
                      {isLoading ? (
                  <Loading message={t("LOADING")} />) :
                      invitationReceiverByUser &&
                        invitationReceiverByUser.map((item) => (
                          <List
                            key={item.userId}
                            style={{ color: "gray", cursor: "pointer" }}
                          >
                            <ListItem className="connection-tab">
                              <ListItemText
                                style={{ color: "#000" }}
                                primary={
                                  <span
                                    style={{ fontSize: "1rem", color: "#000" }}
                                  >
                                    {`${item.firstName} ${
                                      item.lastName ? item.lastName : " "
                                    }`}
                                    <div
                                      style={{
                                        display: "inline",
                                        color: "#484848",
                                      }}
                                    >
                                      {" "}
                                      |{" "}
                                    </div>
                                    <div
                                      className="h6-title "
                                      style={{ display: "inline" }}
                                    >
                                      {item.designation}
                                    </div>
                                  </span>
                                }
                                secondary={
                                  item.messageRequest.length > 20 ? (
                                    <div
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "3px 10px",
                                        borderRadius: "5px",
                                        color: "#00000080",
                                        fontSize: "12px",
                                        marginTop: "10px",
                                      }}
                                    >
                                      {expandedMessageId === item.userId
                                        ? item.messageRequest
                                        : `${item.messageRequest.substring(
                                            0,
                                            20
                                          )}`}
                                      <span
                                        style={{
                                          color: "#0E7A9C",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          handleShowFullMessage(item.userId)
                                        }
                                      >
                                        {expandedMessageId === item.userId
                                          ? "read less"
                                          : "read more"}
                                      </span>
                                    </div>
                                  ) : (
                                    item.messageRequest
                                  )
                                }
                              />
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  marginTop: "10px",
                                }}
                              >
                                <Link
                                  href="#"
                                  underline="none"
                                  color="#004367"
                                  onClick={() => acceptChat(item.userId)}
                                  style={{ marginLeft: "10px" }}
                                >
                                  <CheckCircleOutlineIcon
                                    style={{
                                      fontSize: "22px",
                                      color: "#484848",
                                    }}
                                  />
                                </Link>
                                <span style={{ margin: "0 5px" }}></span>
                                <Link
                                  href="#"
                                  underline="none"
                                  color="#7d7a7a"
                                  onClick={() => handleRejectClick(item.userId)}
                                >
                                  <CancelOutlinedIcon
                                    style={{
                                      fontSize: "22px",
                                      color: "#484848",
                                    }}
                                  />
                                </Link>

                                <Dialog open={open} onClose={handleClose}>
                                  <DialogContent>
                                    <DialogContentText>
                                      {t(
                                        "ARE_YOU_SURE_YOU_WANT_TO_REJECT_THIS_REQUEST"
                                      )}
                                    </DialogContentText>
                                  </DialogContent>
                                  <DialogActions>
                                    <Button
                                      type="button"
                                      className="custom-btn-default"
                                      onClick={handleClose}
                                    >
                                      {t("CANCEL")}
                                    </Button>
                                    <Button
                                      onClick={handleConfirmReject}
                                      type="button"
                                      className="custom-btn-primary"
                                      autoFocus
                                    >
                                      {t("OK")}
                                    </Button>
                                  </DialogActions>
                                </Dialog>
                              </div>
                            </ListItem>
                            <Divider />
                          </List>
                        ))}
                    </Box>
                  </TabPanel>
                  <TabPanel value="3">
                    <Box>
                      {blockedUserList &&
                        blockedUserList.length === 0 &&(
                          <Box marginTop="26px" marginLeft="163px">
                            {t("NO_USERS_FOUND")}
                          </Box>
                        )
                        }
                    </Box>
                    <Box className="scroll">
                    {isLoading ? (
                  <Loading message={t("LOADING")} />) :
                      blockedUserList &&
                        blockedUserList.length > 0 &&
                        blockedUserList.map((item) => (
                          <List
                            sx={{}}
                            style={{ color: "green", cursor: "pointer" }}
                            className="connection-tab"
                            key={item.userId}
                          >
                            <ListItem
                              style={{
                                fontWeight: "normal",
                                color: "inherit",
                              }}
                            >
                              <ListItemText
                                primary={
                                  <span
                                    style={{ fontSize: "1rem", color: "#000" }}
                                  >
                                    {`${item.firstName} ${
                                      item.lastName ? item.lastName : " "
                                    }`}
                                    <div
                                      style={{
                                        display: "inline",
                                        color: "#484848",
                                      }}
                                    >
                                      {" "}
                                      |{" "}
                                    </div>
                                    <div
                                      className="h6-title "
                                      style={{ display: "inline" }}
                                    >
                                      {item.designation}
                                    </div>
                                  </span>
                                }
                              />
                              <Link
                                underline="none"
                                color="primary"
                                onClick={() =>
                                  handleUnblockedClick(item.userId)
                                }
                                style={{
                                  fontSize: "12px",
                                  color: "#0E7A9C",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                {t("UNBLOCK")}
                              </Link>
                              <Dialog
                                open={openBlock === item.userId}
                                onClose={handleClose}
                              >
                                <DialogContent>
                                  <DialogContentText>
                                    Are you sure you want to unblock this user?
                                  </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                  <Button
                                    type="button"
                                    className="custom-btn-default"
                                    onClick={handleUnblockClose}
                                  >
                                    {t("CANCEL")}
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      unBlockedUserChat(item.userId)
                                    }
                                    type="button"
                                    className="custom-btn-primary"
                                    autoFocus
                                  >
                                    {t("OK")}
                                  </Button>
                                </DialogActions>
                              </Dialog>
                            </ListItem>
                            <Divider />
                          </List>
                        ))}
                    </Box>
                  </TabPanel>
                </>
              ) : (
                <Box>
                  <Box
                    display="flex"
                    my={3}
                    justifyContent="center"
                    style={{ borderBottom: "solid 1px #ddd" }}
                  >
                    <Box className="h5-title xs-text-left">
                      {t("ADD_NEW_CONNECTION")}
                    </Box>
                  </Box>
                  <Autocomplete
                    id="autocomplete-input"
                    open={autocompleteOpen}
                    onClose={() => {
                      setAutocompleteOpen(false);
                    }}
                    icon={<CheckCircleOutlineIcon />}
                    options={options}
                    noOptionsText={t("NO_USERS_FOUND")}
                    getOptionLabel={getOptionLabel} // Adjust this based on your API response structure
                    getOptionKey={(option) => option.userId}
                    onChange={handleOnSelectSearchedUser}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("SEARCH_FOR_USER")}
                        className="searchUser"
                        variant="outlined"
                      />
                    )}
                  />
                  <div>
                    <Popover
                      id={id}
                      open={openPopover}
                      anchorEl={anchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      <Typography sx={{ p: 2 }}>
                      {isLoading ? (
                  <Loading message={t("LOADING")} />) :
                        userQuerySearchData &&
                          userQuerySearchData?.length > 0 &&
                          userQuerySearchData?.map((item) => (
                            <List
                              sx={{}}
                              style={{ color: "gray", cursor: "pointer" }}
                            >
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <span
                                      style={{
                                        fontSize: "1rem",
                                        color: "#000",
                                      }}
                                    >
                                      {`${item.firstName} ${
                                        item.lastName ? item.lastName : " "
                                      }`}
                                      <div
                                        style={{
                                          display: "inline",
                                          color: "#484848",
                                        }}
                                      >
                                        {" "}
                                        |{" "}
                                      </div>
                                      <div
                                        className="h6-title "
                                        style={{ display: "inline" }}
                                      >
                                        {item.designation}
                                      </div>
                                    </span>
                                  }
                                  // secondary={`${item.designation}`}
                                  onClick={() =>
                                    onClickSearchedUser(item.userId)
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </List>
                          ))}
                        {(!userQuerySearchData ||
                          userQuerySearchData.length === 0) && (
                          <Box>
                            <p>{t("NO_USERS_FOUND")}</p>
                          </Box>
                        )}
                      </Typography>
                    </Popover>
                  </div>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    className="filter-domain my-20 connection-tab"
                  >
                    {/* {userFilter && (
                          <Filter
                            options={userFilter.map((user) => user.firstName)}
                            label="Filter by Name"
                            onChange={handleUserNameFilter}
                            className="w-30"
                          />
                        )} */}

                    <Filter
                      options={designationsList}
                      label={t("FILTER_BY_DESIGNATION")}
                      onChange={handleDesignationFilter}
                      // isMulti={false}
                      className="w-30"
                    />
                  </Box>
                  <Box className="scroll">
                    {userSearchData && userSearchData.length > 0 ? (
                       userSearchData?.map((item) => (
                        <List
                        key={item.id} // Add key prop to each List element
                        sx={{ fontSize: "14px" }}
                        onClick={() => handleUserClick(item)}
                        >
                      <ListItem>
                    <ListItemText
                       className="inviteText"
                       primary={`${item.firstName}${item.lastName ? ` ${item.lastName}` : ""}`}
                       secondary={`${item.designation}`}
                     />
                    {item.id !== loggedInUserId && ( // Conditionally render the link
                       <Link
                        className="invite-text"
                        color="primary"
                        onClick={() => {
                        showMessages(item.userId);
                        }}
                       >
                       {t("INVITE")}
                      </Link>
                    )}
                  </ListItem>
                  <Divider />
                   </List>
                  ))
                  ) : (
                    <Typography variant="body1" align="center" sx={{ marginTop: 2 }}>
                      {t("NO_USERS_FOUND")}
                      </Typography>
                  )}

                  </Box>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </Box>
              )}
            </TabContext>
          </Grid>

          <Grid
            item
            xs={12}
            md={8}
            lg={8}
            className="pt-8 lg-mt-5 xs-hide addConnectChat pl-0"
          >
            {!isMobile && (
              <Box className="text-center">
                {!selectedChatUser ? (
                  <Box className="center-container">
                    <img src={require(`../../assets/chat.png`)} />
                    <Box className="demo-chat">{t("START_A_CONVERSATION")}</Box>
                    <Box className="demo-text">{t("CLICK_ON_ANY_CONTACT")}</Box>
                  </Box>
                ) : (
                  <Chat
                    key={selectedUser.userId}
                    senderUserId={selectedChatUser.senderUserId}
                    receiverUserId={selectedChatUser.receiverUserId}
                  />
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        {/* </Box>
        </Box> */}
      </Container>
      <FloatingChatIcon />
      </Box>
      <Footer />
    </Box>
  );
};

const Backdrop = React.forwardRef((props, ref) => {
  const { open, ...other } = props;
  return (
    <Fade in={open}>
      <div ref={ref} {...other} />
    </Fade>
  );
});

Backdrop.propTypes = {
  open: PropTypes.bool,
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled("div")(
  ({ theme }) => css`
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 0px;
    color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `
);

export default AddConnections;
