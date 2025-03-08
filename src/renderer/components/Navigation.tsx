import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation(); // Get current route

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Service Manager
        </Typography>

        {/* Navigation Links */}
        <Box>
          <Button
            color={location.pathname === '/' ? 'secondary' : 'inherit'}
            component={Link}
            to="/"
          >
            Listar Servicios
          </Button>
          <Button
            color={
              location.pathname === '/create-service' ? 'secondary' : 'inherit'
            }
            component={Link}
            to="/create-service"
          >
            Crear Servicio
          </Button>
          <Button
            color={
              location.pathname === '/add-person' ? 'secondary' : 'inherit'
            }
            component={Link}
            to="/add-person"
          >
            Crear Persona
          </Button>
          <Button
            color={
              location.pathname === '/add-service-type'
                ? 'secondary'
                : 'inherit'
            }
            component={Link}
            to="/add-service-type"
          >
            Crear Tipo de Servicio
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
