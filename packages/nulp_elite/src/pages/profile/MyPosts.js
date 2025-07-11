import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import NoResult from "pages/content/noResultFound";
import moment from "moment";

const formatDate = (timestamp) => {
  return moment(timestamp).fromNow();
};

function extractLocalImagePath(content) {
  if (typeof content !== "string") return null;

  const match = content.match(
    /<img\s+[^>]*src="(\/discussion-forum\/assets\/uploads\/files[^"]+)"/
  );

  return match?.[1] || null;
}
function getPreviewText(html, wordLimit = 20) {
  if (typeof html !== "string") return "";
  // Remove HTML tags
  const text = html.replace(/<[^>]+>/g, "");
  // Split into words and join the first `wordLimit`
  const words = text.split(/\s+/).slice(0, wordLimit).join(" ");
  return words + (text.split(/\s+/).length > wordLimit ? "..." : "");
}

const handleReadMore = (slug) => {
  window.location.href = `/discussion-forum/topic/${slug}`;
};

const MyPosts = ({ loading, error, posts }) => {
  const [search, setSearch] = useState("");
  const filteredPosts = posts.filter((post) => {
    const text =
      (post.topic?.title || "") +
      " " +
      (post.content ? post.content.replace(/<[^>]+>/g, "") : "");
    return text.toLowerCase().includes(search.toLowerCase());
  });
  const location = useLocation();
  const hidePaths = ["/webapp/contentList?1", "/webapp/contentList"];
  const shouldHideSearch = hidePaths.includes(location.pathname);

  //   console.log("posts", posts);
  return (
    <>
      {!shouldHideSearch && (
        <Box style={{ margin: "20px 0 20px -12px" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search"
            className="w-33"
            style={{ width: "100%", background: "#fff" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      )}
      {filteredPosts && filteredPosts?.length > 0 ? (

        <Box className="mt-10">

          {loading && <Typography>Loading posts...</Typography>}
          {!loading && error && <Typography color="error">{error}</Typography>}
          {!loading && !error && filteredPosts.length === 0 && <NoResult />}
          {!loading && !error && filteredPosts.length > 0 && (

            <Grid container spacing={3} className="m-12">

              {filteredPosts.map((post) => {
                let imageUrl = extractLocalImagePath(post.content);
                console.log("imageUrl", imageUrl);

                let fullImageUrl = null;

                if (imageUrl) {
                  fullImageUrl = imageUrl.startsWith("/")
                    ? imageUrl
                    : `${imageUrl}`;
                } else {
                  fullImageUrl = require("../../assets/discussion.png");
                }

                console.log("fullImageUrl", fullImageUrl);
                return (
                  <Grid item xs={12} sm={6} md={4} key={post.pid}>
                    <Card
                      sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}
                    >
                      {fullImageUrl && (
                        <CardMedia
                          component="img"
                          image={fullImageUrl}
                          alt="Post image"
                          sx={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      )}

                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatDate(post.timestamp)}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                          {post.topic?.title || "Untitled Topic"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {getPreviewText(post.content, 20)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {post.category?.name
                            ? `Category: ${post.category.name}`
                            : post.topic?.category?.name
                            ? `Category: ${post.topic.category.name}`
                            : ""}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            endIcon={<span>&#8594;</span>}
                            onClick={() => handleReadMore(post.topic?.slug)}
                            disabled={!post.topic?.slug}
                          >
                            Read More
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      ) : (
        <NoResult />
      )}
    </>
  );
};

export default MyPosts;
