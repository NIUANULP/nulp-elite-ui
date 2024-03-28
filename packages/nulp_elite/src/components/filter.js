import React from "react";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


export default function Filter({  }) {
  
  return (
    <Autocomplete
    disablePortal
    id="combo-box-demo"
    sx={{ width: '100%', background:'#fff'}}
    renderInput={(params) => <TextField {...params} label="Filter by Designation" />}
  />
  );
}
