import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import * as util from "../../src/services/utilService";
import axios from "axios";



const FeedbackPopup = ({ open, onClose,contentId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
    const _userId = util.userId();


  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
      padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
      padding: theme.spacing(1),
    },
  }));
  // Mapping of checkbox names to labels
  const checkboxLabels = {
    conceptWell: "Understood the concept well",
    learningNeed: "Content responds to my learning need",
    interesting: "Content is interesting and fun",
    replicable: "Content is easily replicable in my city",
    inaccurate: "Content is inaccurate",
    displayed: "Content is not displayed properly",
    relevant: "Content is not relevant",
    understand: "Did not help me understand the concept",
    technical: "There is a technical problem",
    insufficient: "Content is insufficient or not there",
    other: "Other",
  };

  const ratingMessages = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const handleRatingChange = (event, newValue) => {
    const wholeNumberValue = Math.round(newValue);
    setRating(wholeNumberValue);
    setCheckboxes({});
    setAdditionalFeedback("");
    setShowTextBox(false);
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes((prev) => ({
      ...prev,
      [name]: checked,
    }));
    if (name === "other" && checked) {
      setShowTextBox(true);
    } else if (name === "other" && !checked) {
      setShowTextBox(false);
    }
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleAdditionalFeedbackChange = (event) => {
    setAdditionalFeedback(event.target.value);
  };

 const handleSubmit = async () => {
  try {
    let selectedCheckboxes = [];

    Object.keys(checkboxes).forEach((key) => {
      if (checkboxes[key] && checkboxLabels[key] !== 'Other') {
        selectedCheckboxes.push(checkboxLabels[key]);
      }
    });

    const url = "/custom_feedback/create";
    const request = {
      content_id: contentId,
      user_id: _userId,
      rating: rating,
      default_feedback: selectedCheckboxes, 
      other_feedback: additionalFeedback,
    };

    const response = await axios.post(url, request);
    console.log("response.data", response.data);

    console.log("Rating:", rating);
    console.log("Selected Checkboxes:", selectedCheckboxes);
    console.log("Additional Feedback:", additionalFeedback);

    onClose();
  } catch (error) {
    console.error("Error submitting feedback:", error);
  }
};



  const handleClose = () => {
    setOpen(false);
  };

  const renderCheckboxes = () => {
    if (rating >= 5) {
      return (
        <Box>
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Would you like to tell us more?
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["conceptWell"]}
                onChange={handleCheckboxChange}
                name="conceptWell"
              />
            }
            label="Understood the concept well"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["learningNeed"]}
                onChange={handleCheckboxChange}
                name="learningNeed"
              />
            }
            label="Content responds to my learning need"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["interesting"]}
                onChange={handleCheckboxChange}
                name="interesting"
              />
            }
            label="Content is interesting and fun"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["replicable"]}
                onChange={handleCheckboxChange}
                name="replicable"
              />
            }
            label="Content is easily replicable in my city"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["other"]}
                onChange={handleCheckboxChange}
                name="other"
              />
            }
            label="Other"
          />
          {showTextBox && (
            <TextField
              value={additionalFeedback}
              onChange={handleAdditionalFeedbackChange}
              placeholder="Please specify..."
              fullWidth
              multiline
              rows={4}
              style={{ marginTop: "10px" }}
            />
          )}
        </Box>
      );
    } else if (rating <= 4 && rating !== 0) {
      return (
        <Box>
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            What issues did you face?
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["inaccurate"]}
                onChange={handleCheckboxChange}
                name="inaccurate"
              />
            }
            label="Content is inaccurate"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["displayed"]}
                onChange={handleCheckboxChange}
                name="displayed"
              />
            }
            label="Content is not displayed properly"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["relevant"]}
                onChange={handleCheckboxChange}
                name="relevant"
              />
            }
            label="Content is not relevant"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["understand"]}
                onChange={handleCheckboxChange}
                name="understand"
              />
            }
            label="Did not help me understand the concept"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["technical"]}
                onChange={handleCheckboxChange}
                name="technical"
              />
            }
            label="There is a technical problem"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["insufficient"]}
                onChange={handleCheckboxChange}
                name="insufficient"
              />
            }
            label="Content is insufficient or not there"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxes["other"]}
                onChange={handleCheckboxChange}
                name="other"
              />
            }
            label="Other"
          />
          {showTextBox && (
            <TextField
              value={additionalFeedback}
              onChange={handleAdditionalFeedbackChange}
              placeholder="Please specify..."
              fullWidth
              multiline
              rows={4}
              style={{ marginTop: "10px" }}
            />
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <BootstrapDialog open={open} onClose={onClose} className="feedback-popup">
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Feedback
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box className="h5-title">Rate Us</Box>
        <Box>
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={handleRatingChange}
            icon={<StarIcon style={{ color: "gold" }} />}
            emptyIcon={<StarIcon style={{ color: "grey" }} />}
            precision={1}
          />
          <Typography variant="body1" style={{ marginLeft: "10px" }}>
            {rating} {rating === 1 ? "star" : "stars"}
          </Typography>
        </Box>
        <Typography
          className="h6-title"
          style={{ marginTop: "10px", fontStyle: "italic" }}
        >
          {ratingMessages[rating]}
        </Typography>
        {renderCheckboxes()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="custom-btn-default">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="custom-btn-primary">
          Submit
        </Button>
      </DialogActions>
    </BootstrapDialog>

    // <Dialog open={open} onClose={onClose}>
    //   <DialogTitle>Feedback</DialogTitle>
    //   <DialogContent>
    //     <Typography variant="h6">Rate Us</Typography>
    //     <Box>
    //       <Rating
    //         name="feedback-rating"
    //         value={rating}
    //         onChange={handleRatingChange}
    //         icon={<StarIcon style={{ color: "gold" }} />}
    //         emptyIcon={<StarIcon style={{ color: "grey" }} />}
    //         precision={1}
    //       />
    //       <Typography variant="body1" style={{ marginLeft: "10px" }}>
    //         {rating} {rating === 1 ? "star" : "stars"}
    //       </Typography>
    //     </Box>
    //     <Typography
    //       variant="body2"
    //       style={{ marginTop: "10px", fontStyle: "italic" }}
    //     >
    //       {ratingMessages[rating]}
    //     </Typography>
    //     {renderCheckboxes()}
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onClose} color="primary">
    //       Cancel
    //     </Button>
    //     <Button onClick={handleSubmit} color="primary">
    //       Submit
    //     </Button>
    //   </DialogActions>
    // </Dialog>
  );
};

export default FeedbackPopup;
