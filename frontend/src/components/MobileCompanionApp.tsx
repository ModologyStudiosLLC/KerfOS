import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Tabs, Tab, TextField, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  Avatar, IconButton, Badge, BottomNavigation, BottomNavigationAction,
  Drawer, Toolbar, AppBar, Divider, Alert, LinearProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BuildIcon from '@mui/icons-material/Build';

interface Project {
  id: string;
  name: string;
  type: 'kitchen' | 'bathroom' | 'closet' | 'garage' | 'other';
  status: 'draft' | 'in_progress' | 'complete';
  progress: number;
  lastModified: string;
  partsCount: number;
  estimatedCost?: number;
}

interface MobileCompanionAppProps {
  onProjectSelect?: (projectId: string) => void;
  onBarcodeScan?: (barcode: string) => void;
}

const PROJECT_ICONS: Record<string, string> = {
  kitchen: '🍳',
  bathroom: '🚿',
  closet: '👕',
  garage: '🚗',
  other: '📦'
};

const MobileCompanionApp: React.FC<MobileCompanionAppProps> = ({
  onProjectSelect,
  onBarcodeScan
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Kitchen Renovation',
      type: 'kitchen',
      status: 'in_progress',
      progress: 65,
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      partsCount: 42,
      estimatedCost: 3250
    },
    {
      id: '2',
      name: 'Master Bathroom Vanity',
      type: 'bathroom',
      status: 'draft',
      progress: 15,
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      partsCount: 18,
      estimatedCost: 1200
    },
    {
      id: '3',
      name: 'Garage Storage System',
      type: 'garage',
      status: 'complete',
      progress: 100,
      lastModified: new Date(Date.now() - 604800000).toISOString(),
      partsCount: 24,
      estimatedCost: 890
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'complete': return 'success';
      case 'in_progress': return 'primary';
      case 'draft': return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f5f5',
      maxWidth: '100%',
      mx: 'auto'
    }}>
      {/* App Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Modology Cabinet Designer
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 0 && (
          /* Projects Tab */
          <>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              sx={{ mb: 2 }}
            >
              New Project
            </Button>

            <List>
              {filteredProjects.map((project) => (
                <Card key={project.id} sx={{ mb: 2 }} onClick={() => onProjectSelect?.(project.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {PROJECT_ICONS[project.type]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">{project.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {project.partsCount} parts • {formatDate(project.lastModified)}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={project.status.replace('_', ' ')}
                        color={getStatusColor(project.status) as any}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ mb: 1 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        {project.progress}% complete
                      </Typography>
                      {project.estimatedCost && (
                        <Typography variant="body2" color="primary">
                          Est. ${project.estimatedCost}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          </>
        )}

        {activeTab === 1 && (
          /* Calculator Tab */
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Quick Calculator
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Calculate materials and costs on the go while shopping.
            </Alert>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sheet Material</InputLabel>
              <Select defaultValue="3/4-plywood">
                <MenuItem value="1/2-plywood">1/2" Plywood</MenuItem>
                <MenuItem value="3/4-plywood">3/4" Plywood</MenuItem>
                <MenuItem value="1/2-mdf">1/2" MDF</MenuItem>
                <MenuItem value="3/4-mdf">3/4" MDF</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Width (in)" type="number" fullWidth defaultValue={48} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Height (in)" type="number" fullWidth defaultValue={96} />
              </Grid>
            </Grid>

            <TextField
              label="Price per Sheet"
              type="number"
              fullWidth
              InputProps={{ startAdornment: '$' }}
              sx={{ mt: 2, mb: 2 }}
              defaultValue={65}
            />

            <Button variant="contained" fullWidth>
              Calculate
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary">
              Enter dimensions to calculate material needs and costs.
            </Typography>
          </Paper>
        )}

        {activeTab === 2 && (
          /* Scanner Tab */
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              <QrCodeScannerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Barcode Scanner
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Scan hardware or material barcodes to add to your project.
            </Alert>

            <Box
              sx={{
                width: '100%',
                height: 300,
                bgcolor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                mb: 2
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 64, color: 'white' }} />
            </Box>

            <Button variant="contained" fullWidth startIcon={<QrCodeScannerIcon />}>
              Scan Barcode
            </Button>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Point camera at a barcode to automatically identify and add items.
            </Typography>
          </Paper>
        )}

        {activeTab === 3 && (
          /* Shopping List Tab */
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Shopping List
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText 
                  primary="3/4" Plywood" 
                  secondary="3 sheets - Kitchen Renovation"
                />
                <ListItemSecondaryAction>
                  <Chip label="$195" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText 
                  primary="Blum Hinges" 
                  secondary="8 pairs - Kitchen Renovation"
                />
                <ListItemSecondaryAction>
                  <Chip label="$68" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText 
                  primary="Edge Banding" 
                  secondary="50 ft - Kitchen Renovation"
                />
                <ListItemSecondaryAction>
                  <Chip label="$15" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">$278</Typography>
            </Box>

            <Button variant="contained" fullWidth>
              Export to Store App
            </Button>
          </Paper>
        )}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        showLabels
        sx={{ borderTop: 1, borderColor: 'divider' }}
      >
        <BottomNavigationAction label="Projects" icon={<FolderIcon />} />
        <BottomNavigationAction label="Calculator" icon={<CalculateIcon />} />
        <BottomNavigationAction label="Scanner" icon={<QrCodeScannerIcon />} />
        <BottomNavigationAction label="Shopping" icon={<ShoppingCartIcon />} />
      </BottomNavigation>

      {/* Side Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Modology</Typography>
            <Typography variant="body2">Cabinet Designer</Typography>
          </Box>
          <Divider />
          <List>
            <ListItem button>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><FolderIcon /></ListItemIcon>
              <ListItemText primary="Templates" />
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Version 1.0.0
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MobileCompanionApp;