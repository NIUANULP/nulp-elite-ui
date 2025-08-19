import React from "react";
import PropTypes from "prop-types";
import { Button, Alert, Modal } from "@mui/material";
import { useTranslation } from "react-i18next";
import Chat from "pages/connections/chat";

const ChatSection = ({
  chat,
  handleDirectConnect,
  _userId,
  creatorId,
  open,
  handleClose,
  isMobile,
}) => {
  const { t } = useTranslation();
  const chatClass = isMobile ? "lg-hide" : "xs-hide";

  if (chat.length === 0) {
    return (
      <div className={chatClass}>
        <Button
          onClick={handleDirectConnect}
          variant="contained"
          className="custom-btn-primary my-20"
          style={{ background: "#004367" }}
        >
          {t("CONNECT_WITH_CREATOR")}
        </Button>
      </div>
    );
  }

  if (chat[0]?.is_accepted === false) {
    return (
      <div className={chatClass}>
        <Alert severity="warning" style={{ margin: "10px 0" }}>
          {t("YOUR_CHAT_REQUEST_IS_PENDING")}
        </Alert>
        <Button
          variant="contained"
          className="custom-btn-primary my-20"
          style={{ background: "#a9b3f5" }}
          disabled
        >
          {t("CHAT_WITH_CREATOR")}
        </Button>
      </div>
    );
  }

  return chat[0]?.is_accepted === true ? (
    <div className={chatClass}>
      <Button
        onClick={handleDirectConnect}
        variant="contained"
        className="custom-btn-primary my-20"
        style={{ background: "#004367" }}
      >
        {t("CHAT_WITH_CREATOR")}
      </Button>
      {_userId && creatorId && (
        <Modal open={open} onClose={handleClose}>
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "35%",
              padding: "20px",
              boxShadow: "0 3px 5px rgba(0, 0, 0, 0.3)",
              outline: "none",
              borderRadius: 8,
              width: "90%",
              maxWidth: "700px",
              height: "80%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            className="contentCreator"
          >
            <Chat
              senderUserId={_userId}
              receiverUserId={creatorId}
              onChatSent={handleClose}
              onClose={handleClose}
              showCloseIcon={true}
            />
          </div>
        </Modal>
      )}
    </div>
  ) : null;
};

ChatSection.propTypes = {
  chat: PropTypes.arrayOf(
    PropTypes.shape({
      is_accepted: PropTypes.bool,
    })
  ).isRequired,
  handleDirectConnect: PropTypes.func.isRequired,
  _userId: PropTypes.string,
  creatorId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

ChatSection.defaultProps = {
  _userId: "",
  creatorId: "",
};

export default ChatSection;
