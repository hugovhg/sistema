import { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AddPerson() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleAddPerson = async () => {
    if (!name.trim()) return;
    try {
      await window.electron.ipcRenderer.addPerson(name);
      navigate('/');
    } catch (err) {
      console.error('Failed to add person:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Add Person
      </Typography>
      <TextField
        fullWidth
        label="Person Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddPerson}
        fullWidth
      >
        Add
      </Button>
    </Container>
  );
}
