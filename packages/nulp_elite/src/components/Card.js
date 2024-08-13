import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Divider } from "native-base";
import RandomImage from "../assets/cardRandomImgs.json";
import { useTranslation } from "react-i18next";
const processString = (str) => {
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};
export default function BoxCard({ items, index, onClick, continueLearning }) {
  const [imgUrl, setImgUrl] = useState();
  const [subdomain, setSubdomain] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    if (items.se_gradeLevels) {
      setSubdomain(processString(items.se_gradeLevels[0]));
    } else if (items.gradeLevel) {
      setSubdomain(processString(items.gradeLevel[0]));
    } else {
      setSubdomain(undefined);
    }
    setImgUrl(RandomImage.ImagePaths[index % 10 || 10]);
  }, [items, index]);

  const unixTimestampToHumanDate = (unixTimestamp) => {
    const dateObject = new Date(unixTimestamp);
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return dateObject.toLocaleDateString("en-GB", options);
  };

  if (items.content) {
    return (
      <Card
        className="cardBox"
        sx={{ position: "relative", cursor: "pointer" }}
        onClick={onClick}
      >
        <CardMedia
          className="card-media"
          image={
            subdomain
              ? require(`./../assets/cardBanner/${subdomain}.png`)
              : require("./../assets/cardBanner/management.png")
          }
          title="green iguana"
        />
        <div onClick={onClick} className="card-div"></div>
        <CardContent className="pb-0">
          {items.content.primaryCategory && (
            <Typography
              gutterBottom
              variant="h7"
              component="div"
              className="ribbonCard"
            >
              <Box className="cardCourses">{items.content.primaryCategory}</Box>
            </Typography>
          )}
          <Box className="card-img-container">
            <img
              src={
                items.content.appIcon
                  ? items.content.appIcon
                  : require("assets/default.png")
              }
              className="card-img"
              alt="Content App Icon"
            />
          </Box>
          {items.content.name && (
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              className="cardTitle mt-35"
            >
              {items.content.name}
            </Typography>
          )}

          {items.content.organisation &&
            items.content.organisation.length > 0 && (
              <Typography
                variant="body2"
                color="#5B5B5B"
                style={{
                  fontSize: "11px",
                  padding: "10px 0 0 0",
                  textAlign: "left",
                }}
              >
                <Box className="cardLabelEllips">
                  {items.content.organisation.length === 1
                    ? items.content.organisation[0]
                    : `${items.content.organisation[0]} + ${
                        items.content.organisation.length - 1
                      }`}
                </Box>
              </Typography>
            )}

          {items.enrolledDate && (
            <Typography
              variant="body2"
              color="#5B5B5B"
              style={{
                fontSize: "11px",
                padding: "10px 0 0 0",
                textAlign: "left",
              }}
            >
              <Box>
                {t("ENROLLED_ON")} :{" "}
                {unixTimestampToHumanDate(items.enrolledDate)}
              </Box>
            </Typography>
          )}
        </CardContent>
        {continueLearning === true && (
          <Box className="my-10 pl-20">
            <Typography
              style={{
                color: (() => {
                  if (items.status === 2) return "#065872";
                  else if (items.batch.status === 2) return "#FF0000";
                  else if (items.batch.status === 1) return "#579b00";
                })(),
                fontSize: "12px",
                textAlign: "left",
                fontWeight: "500",
              }}
            >
              {(() => {
                if (items.status === 2) return t("Completed");
                else if (items.batch.status === 2) return t("Expired");
                else if (items.batch.status === 1) return t("Ongoing");
              })()}
            </Typography>
          </Box>
        )}
      </Card>
    );
  }

  return (
    <Card
      className="cardBox"
      sx={{ position: "relative", cursor: "pointer" }}
      onClick={onClick}
    >
      <CardMedia
        className="card-media"
        image={
          subdomain
            ? require(`./../assets/cardBanner/${subdomain}.png`)
            : require("./../assets/cardBanner/management.png")
        }
        title="green iguana"
      />
      <div onClick={onClick} className="card-div"></div>
      <CardContent>
        {items.primaryCategory && (
          <Typography
            gutterBottom
            variant="h7"
            component="div"
            className="ribbonCard"
          >
            <Box className="cardCourses">{items.primaryCategory}</Box>
          </Typography>
        )}
        <Box className="card-img-container">
          <img
            src={items.appIcon ? items.appIcon : require("assets/default.png")}
            className="card-img"
            alt="App Icon"
          />
        </Box>
        {items.name && (
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            className="cardTitle mt-35"
          >
            {items.name}
          </Typography>
        )}
        {items.organisation && items.organisation.length > 0 && (
          <Typography
            variant="body2"
            color="#5B5B5B"
            style={{ fontSize: "11px", padding: "10px 0", textAlign: "left" }}
          >
            <Box className="cardLabelEllips">
              {items.organisation.length === 1
                ? items.organisation[0]
                : `${items.organisation[0]} + ${items.organisation.length - 1}`}
            </Box>
          </Typography>
        )}
      </CardContent>
      {(items?.board ||
        items?.gradeLevel ||
        items?.se_boards ||
        items?.se_gradeLevels) && (
        <>
          <Box className="textLeft mb-15 d-flex">
            {(items?.board || items?.se_boards) && (
              <Tooltip
                title={
                  Array.isArray(items?.board) && items.board.length === 1
                    ? items.board.join(", ")
                    : Array.isArray(items?.se_boards) &&
                      items.se_boards.length > 1
                    ? items.se_boards.join(", ")
                    : items?.se_boards?.[0] || ""
                }
                placement="top"
                className="labelOne cardLabelEllips"
              >
                <Button>
                  {Array.isArray(items?.board) && items.board.length === 1
                    ? items.board[0]
                    : Array.isArray(items?.board) && items.board.length > 1
                    ? `${items.board[0]} + ${items.board.length - 1}`
                    : Array.isArray(items?.se_boards) &&
                      items.se_boards.length === 1
                    ? items.se_boards[0]
                    : Array.isArray(items?.se_boards) &&
                      items.se_boards.length > 1
                    ? `${items.se_boards[0]} + ${items.se_boards.length - 1}`
                    : ""}
                </Button>
              </Tooltip>
            )}
            {(items.gradeLevel || items.se_gradeLevels) && (
              <Tooltip
                title={
                  Array.isArray(items?.gradeLevel) &&
                  items.gradeLevel.length > 1
                    ? items.gradeLevel.join(", ")
                    : items.gradeLevel?.[0] ||
                      (Array.isArray(items?.se_gradeLevels) &&
                      items.se_gradeLevels.length > 1
                        ? items.se_gradeLevels.join(", ")
                        : items.se_gradeLevels?.[0] || "")
                }
                placement="top"
                className="labeltwo cardLabelEllips"
              >
                <Button>
                  {Array.isArray(items?.gradeLevel) &&
                  items.gradeLevel.length === 1
                    ? items.gradeLevel[0]
                    : (Array.isArray(items?.gradeLevel) &&
                        `${items.gradeLevel[0]} + ${
                          items.gradeLevel.length - 1
                        }`) ||
                      (Array.isArray(items?.se_gradeLevels) &&
                        items.se_gradeLevels.length === 1)
                    ? items.se_gradeLevels[0]
                    : `${items.se_gradeLevels[0]} + ${
                        items.se_gradeLevels.length - 1
                      }`}
                </Button>
              </Tooltip>
            )}
          </Box>
        </>
      )}
    </Card>
  );
}
