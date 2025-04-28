import React from "react";
import { Box, Typography } from "@mui/material";

const MyActivity = ({ activity }) => (
  <Box>
    {activity.length === 0 ? (
      <Typography>No activity yet.</Typography>
    ) : (
      activity.map((act) => (
        <Box
          key={act.id}
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #eee",
            borderRadius: 2,
            background: "#fff",
          }}
        >
          <Typography variant="body2">{act.activity}</Typography>
          <Typography variant="caption" color="text.secondary">
            {act.date}
          </Typography>
        </Box>
      ))
    )}
  </Box>
);

export default MyActivity;
