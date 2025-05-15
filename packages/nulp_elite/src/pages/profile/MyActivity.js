import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import NoResult from "pages/content/noResultFound";
import moment from "moment";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

const MyActivity = ({ activity }) => {
  function extractLocalImagePath(content) {
    if (typeof content !== "string") return null;
    const match = content.match(
      /<img\s+[^>]*src="(\/discussion-forum\/assets\/uploads\/files[^"]+)"/
    );
    return match?.[1] || null;
  }

  const formatDate = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const renderPostContent = (content) => {
    const imageUrl = extractLocalImagePath(content);
    return (
      <Box>
        <Box
          dangerouslySetInnerHTML={{ __html: content }}
          sx={{
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              margin: "8px 0",
            },
            "& p": {
              margin: "8px 0",
              lineHeight: 1.6,
            },
          }}
        />
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt="Post content"
            sx={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: 1,
              margin: "8px 0",
              objectFit: "contain",
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      {activity.length === 0 ? (
        <NoResult />
      ) : (
        activity.map((act) => (
          <Box
            key={act.pid}
            sx={{
              marginTop: "20px",
              mb: 3,
              p: 2,
              border: "1px solid #eee",
              borderRadius: 2,
              background: "#fff",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {formatDate(act.timestamp)}
              </Typography>
              <Tooltip title="View in discussion">
                <IconButton
                  size="small"
                  onClick={() =>
                    window.open(
                      `/discussion-forum/topic/${act.topic.slug}`,
                      "_blank"
                    )
                  }
                >
                  <OpenInNewOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Replied to: {act.topic.title}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8f9fa",
                  borderRadius: 1,
                  border: "1px solid #eee",
                }}
              >
                {renderPostContent(act.content)}
              </Box>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default MyActivity;
