import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";

const SocialShareButtons = ({ shareUrl, isMobileView = false }) => {
  const shareClass = isMobileView
    ? "my-20 lg-hide social-icons"
    : "xs-hide mb-10";

  return (
    <Box className={shareClass}>
      <FacebookShareButton url={shareUrl} className="pr-5">
        <FacebookIcon size={32} round={true} />
      </FacebookShareButton>
      <WhatsappShareButton url={shareUrl} className="pr-5">
        <WhatsappIcon size={32} round={true} />
      </WhatsappShareButton>
      <LinkedinShareButton url={shareUrl} className="pr-5">
        <LinkedinIcon size={32} round={true} />
      </LinkedinShareButton>
      <TwitterShareButton url={shareUrl} className="pr-5">
        <img
          src={require("../assets/twitter.png")}
          alt="Twitter"
          style={{ width: 32, height: 32 }}
        />
      </TwitterShareButton>
    </Box>
  );
};

SocialShareButtons.propTypes = {
  shareUrl: PropTypes.string.isRequired,
  isMobileView: PropTypes.bool,
};

SocialShareButtons.defaultProps = {
  isMobileView: false,
};

export default SocialShareButtons;
