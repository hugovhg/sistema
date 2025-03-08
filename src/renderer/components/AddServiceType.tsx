import { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AddServiceType() {
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const handleAddServiceType = async () => {
    if (!type.trim()) return;
    try {
      await window.electron.ipcRenderer.addServiceType(type);
      navigate('/');
    } catch (err) {
      console.error('Failed to add service type:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Add Service Type
      </Typography>
      <TextField
        fullWidth
        label="Service Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddServiceType}
        fullWidth
      >
        Add
      </Button>
    </Container>
  );
}
