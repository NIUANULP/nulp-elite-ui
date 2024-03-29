import React from "react";
import { Button } from '@mui/base/Button';


export default function Search({  }) {
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
    <input type="text" placeholder="Search..." style={{ flex: 1, marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CACACA' }} />
    <Button style={{ padding:'11px 16px 11px 16px', borderRadius: '4px', backgroundColor: '#004367', color: 'white', border: '1px', cursor: 'pointer' ,fontSize:'12px'}}>Search</Button>
  </div>
  );
}
