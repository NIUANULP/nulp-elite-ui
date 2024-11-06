import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close"; 
import { useNavigate } from "react-router-dom";
import * as util from "../services/utilService";
const urlConfig = require("../configs/urlConfig.json");
import { useTranslation } from "react-i18next";

const NotificationPopup = ({ open, handleClose, updateNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const _userId = util.userId();
  const navigate = useNavigate();
  const [NotificationCount , setNotificationCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.NOTIFICATION.READ}${_userId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data?.result?.feeds) {
          const sortedNotifications = data.result.feeds.sort((a, b) => {
            if (a.status === "unread" && b.status !== "unread") return -1;
            if (a.status !== "unread" && b.status === "unread") return 1;
            return 0;
          });
          setNotifications(sortedNotifications);
          updateNotificationCount(
            sortedNotifications.filter((notif) => notif.status === "unread").length
          );
           setNotificationCount(
            sortedNotifications.filter((notif) => notif.status === "unread").length
          );
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (open) {
      fetchNotifications();
    }
  }, [open, _userId, updateNotificationCount]);

  const handleNotificationClick = async (notificationId, status, actionType) => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.NOTIFICATION.UPDATE}`;
      const requestBody = {
        request: {
          ids: [notificationId], 
          userId: _userId,
        },
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result?.responseCode === "OK") {
        if (actionType === "certificateUpdate") {
          navigate("/webapp/profile");
        }
      } else {
        console.error("Failed to update notification:", result);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const handleDeleteNotification = async (notificationIds) => {
    try {
      const url =`${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.NOTIFICATION.DELETE}`;
      const requestBody = {
        request: {
          ids: notificationIds,
          userId: _userId,
          category: "group-feed",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result?.responseCode === "OK") {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => !notificationIds.includes(notif.id))
        );
        updateNotificationCount(notifications.length - notificationIds.length);
      } else {
        console.error("Failed to delete notifications:", result);
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleClearAllNotifications = () => {
    const allNotificationIds = notifications.map((notification) => notification.id);
    handleDeleteNotification(allNotificationIds);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {NotificationCount} {t("NEW_NOTIFICATIONS")}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {notifications.length > 0 ? (
          <List>
            {notifications.map((notification) => {
              const { id, action, status, createdOn } = notification;
              const { description, title, type } = JSON.parse(action.template.data);

              return (
                <ListItem
                  key={id}
                  divider
                  button
                  onClick={() => handleNotificationClick(id, status, action.type)} 
                >
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                          {formatDate(createdOn)}
                        </Typography>
                        {title}
                      </>
                    }
                    secondary={description}
                    primaryTypographyProps={{
                      style: status === "unread" ? { fontWeight: "bold" } : {},
                    }}
                    secondaryTypographyProps={{
                      style: status === "unread" ? { fontWeight: "bold" } : {},
                    }}
                  />
                  <IconButton
                    edge="end"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDeleteNotification([id]); 
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography>{t("NO_NOTIFICATIONS_FOUND")}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClearAllNotifications} color="secondary">
        {t("CLEAR_ALL")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup;
