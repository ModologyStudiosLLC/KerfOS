'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Carpenter as CarpenterIcon,
  Kitchen as KitchenIcon,
  Bathtub as BathtubIcon,
  MenuBook as BookIcon,
  Tv as TvIcon,
  Garage as GarageIcon,
  LocalLaundryService as LaundryIcon,
  Chair as ChairIcon,
  Home as HomeIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  ShoppingCart as CartIcon,
  ContentCopy as CopyIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Style colors
const STYLE_COLORS = {
  shaker: '#8B4513',
  flat_panel: '#2F4F4F',
  raised_panel: '#8B0000',
  slab: '#4682B4',
  beadboard: '#D2691E',
  louvered: '#556B2F',
  glass_front: '#708090',
  open_shelf: '#A0522D',
  barn_door: '#6B4423',
};

// Difficulty colors
const DIFFICULTY_COLORS = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
};

// Room icons
const ROOM_ICONS = {
  kitchen: KitchenIcon,
  bathroom: BathtubIcon,
  laundry: LaundryIcon,
  office: ChairIcon,
  living_room: HomeIcon,
  bedroom: ChairIcon,
  garage: GarageIcon,
  pantry: KitchenIcon,
  mudroom: HomeIcon,
  entertainment: TvIcon,
};

// Inspiration avatars
const INSPIRATION_AVATARS = {
  steve_ramsey: '🧔',
  april_wilkerson: '👩‍🔧',
  jon_peters: '👨‍🔧',
  marc_spagnuolo: '🧔‍♂���',
  jay_bates: '👨‍🔧',
  john_heisz: '👴',
  matt_cremona: '👨',
  frank_howarth: '🎬',
  patrick_sorrell: '🛠️',
  lexspeed: '⚡',
  cabinets_to_go: '🏪',
  cliffside_cabinets: '🏚️',
  barker_door: '🚪',
  conestoga: '🛒',
  decora: '✨',
  kraftmaid: '🏡',
  custom: '🎨',
};

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [styles, setStyles] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cutlistOpen, setCutlistOpen] = useState(false);
  const [cutlistData, setCutlistData] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [inspirationFilter, setInspirationFilter] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchFilters();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, styleFilter, roomFilter, difficultyFilter, inspirationFilter]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/templates/`);
      const data = await response.json();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [stylesRes, roomsRes, inspirationsRes] = await Promise.all([
        fetch(`${API_URL}/api/templates/styles`),
        fetch(`${API_URL}/api/templates/rooms`),
        fetch(`${API_URL}/api/templates/inspirations`),
      ]);
      setStyles(await stylesRes.json());
      setRooms(await roomsRes.json());
      setInspirations(await inspirationsRes.json());
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (styleFilter) {
      filtered = filtered.filter((t) => t.style === styleFilter);
    }

    if (roomFilter) {
      filtered = filtered.filter((t) => t.room_type === roomFilter);
    }

    if (difficultyFilter) {
      filtered = filtered.filter((t) => t.difficulty === difficultyFilter);
    }

    if (inspirationFilter) {
      filtered = filtered.filter((t) => t.inspiration === inspirationFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleViewDetails = (template) => {
    setSelectedTemplate(template);
    setDetailsOpen(true);
  };

  const handleViewCutlist = async (template) => {
    setSelectedTemplate(template);
    try {
      const response = await fetch(`${API_URL}/api/templates/${template.id}/cutlist`);
      const data = await response.json();
      setCutlistData(data);
      setCutlistOpen(true);
    } catch (error) {
      console.error('Error fetching cutlist:', error);
    }
  };

  const handleUseTemplate = async (template) => {
    // TODO: Create a new project from template
    console.log('Creating project from template:', template.id);
    alert(`Project creation from template "${template.name}" coming soon!`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStyleFilter('');
    setRoomFilter('');
    setDifficultyFilter('');
    setInspirationFilter('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading templates...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        🪵 Project Templates
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Pre-built cabinet designs inspired by popular YouTube woodworkers and high-end cabinet manufacturers
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Style</InputLabel>
              <Select
                value={styleFilter}
                label="Style"
                onChange={(e) => setStyleFilter(e.target.value)}
              >
                <MenuItem value="">All Styles</MenuItem>
                {styles.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Room</InputLabel>
              <Select
                value={roomFilter}
                label="Room"
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <MenuItem value="">All Rooms</MenuItem>
                {rooms.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="outlined" onClick={clearFilters} fullWidth>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredTemplates.length} of {templates.length} templates
      </Typography>

      {/* Template Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => {
          const RoomIcon = ROOM_ICONS[template.room_type] || CarpenterIcon;
          return (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* Header with style color */}
                <Box
                  sx={{
                    height: 8,
                    bgcolor: STYLE_COLORS[template.style] || '#8B4513',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title and Inspiration */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {template.name}
                    </Typography>
                    <Tooltip title={`Inspired by ${template.inspiration.replace('_', ' ')}`}>
                      <Typography variant="h5">
                        {INSPIRATION_AVATARS[template.inspiration] || '🛠️'}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {template.description.substring(0, 100)}...
                  </Typography>

                  {/* Chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    <Chip
                      size="small"
                      icon={<RoomIcon />}
                      label={template.room_type.replace('_', ' ')}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={template.style.replace('_', ' ')}
                      sx={{ bgcolor: STYLE_COLORS[template.style], color: 'white' }}
                    />
                    <Chip
                      size="small"
                      label={template.difficulty}
                      sx={{
                        bgcolor: DIFFICULTY_COLORS[template.difficulty],
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{template.estimated_hours}h</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        ${template.estimated_cost_low}-${template.estimated_cost_high}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {template.tags.slice(0, 3).map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewDetails(template)}
                    sx={{ mb: 1 }}
                  >
                    View Details
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleViewCutlist(template)}
                      sx={{ flex: 1 }}
                    >
                      Cut List
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => handleUseTemplate(template)}
                      sx={{ flex: 1 }}
                    >
                      Use Template
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedTemplate.name}
                </Typography>
                <Typography variant="h4">
                  {INSPIRATION_AVATARS[selectedTemplate.inspiration]}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedTemplate.description}
              </Typography>

              {selectedTemplate.inspiration_notes && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Inspiration:</strong> {selectedTemplate.inspiration_notes}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Style
                  </Typography>
                  <Chip
                    label={selectedTemplate.style.replace('_', ' ')}
                    sx={{ bgcolor: STYLE_COLORS[selectedTemplate.style], color: 'white' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Room Type
                  </Typography>
                  <Chip
                    icon={React.createElement(ROOM_ICONS[selectedTemplate.room_type] || CarpenterIcon)}
                    label={selectedTemplate.room_type.replace('_', ' ')}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Difficulty
                  </Typography>
                  <Chip
                    label={selectedTemplate.difficulty}
                    sx={{
                      bgcolor: DIFFICULTY_COLORS[selectedTemplate.difficulty],
                      color: 'white',
                      textTransform: 'capitalize',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Time
                  </Typography>
                  <Typography>{selectedTemplate.estimated_hours} hours</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Cost
                  </Typography>
                  <Typography>
                    ${selectedTemplate.estimated_cost_low} - ${selectedTemplate.estimated_cost_high}
                  </Typography>
                </Grid>
              </Grid>

              {/* Components */}
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    📋 Components ({selectedTemplate.components.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTemplate.components.map((comp, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem>
                          <ListItemText
                            primary={`${comp.name} (×${comp.quantity})`}
                            secondary={`${comp.width}" × ${comp.height}" × ${comp.depth}" | ${comp.material}`}
                          />
                        </ListItem>
                        {idx < selectedTemplate.components.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* Hardware */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    🔧 Hardware Needed ({selectedTemplate.hardware_needed.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTemplate.hardware_needed.map((hw, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem>
                          <ListItemText
                            primary={`${hw.name} (×${hw.quantity})`}
                            secondary={hw.type}
                          />
                        </ListItem>
                        {idx < selectedTemplate.hardware_needed.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* Joinery */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    🪚 Joinery Techniques
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTemplate.joinery.map((j) => (
                      <Chip key={j} label={j} icon={<BuildIcon />} />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Finishing */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    🎨 Finishing Suggestions
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTemplate.finishing_suggestions.map((finish, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <Typography>{idx + 1}</Typography>
                        </ListItemIcon>
                        <ListItemText primary={finish} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  setDetailsOpen(false);
                  handleViewCutlist(selectedTemplate);
                }}
              >
                View Cut List
              </Button>
              <Button
                variant="contained"
                startIcon={<CopyIcon />}
                onClick={() => handleUseTemplate(selectedTemplate)}
              >
                Use This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cut List Dialog */}
      <Dialog
        open={cutlistOpen}
        onClose={() => setCutlistOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {cutlistData && (
          <>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                📋 Cut List: {cutlistData.template_name}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {/* Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Total Components
                      </Typography>
                      <Typography variant="h5">{cutlistData.summary.total_components}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        3/4" Sheets Needed
                      </Typography>
                      <Typography variant="h5">{cutlistData.summary.estimated_3_4_sheets}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Lumber (Board Feet)
                      </Typography>
                      <Typography variant="h5">{cutlistData.summary.total_lumber_board_feet}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Est. Cost
                      </Typography>
                      <Typography variant="h5">{cutlistData.summary.estimated_cost_range}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Cut List by Material */}
              <Typography variant="h6" gutterBottom>
                Materials Breakdown
              </Typography>
              <List>
                {cutlistData.cut_list.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem>
                      <ListItemText
                        primary={item.sheet || item.lumber}
                        secondary={
                          item.pieces
                            ? `${item.pieces} pieces | ~${item.waste_pct}% waste`
                            : `${item.board_feet} board feet`
                        }
                      />
                      <IconButton
                        onClick={() => copyToClipboard(item.sheet || item.lumber)}
                        size="small"
                      >
                        <CopyIcon />
                      </IconButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {/* Hardware List */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Hardware List
              </Typography>
              <List>
                {cutlistData.hardware_needed.map((hw, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem>
                      <ListItemText
                        primary={`${hw.name} (×${hw.quantity})`}
                        secondary={hw.type}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {/* Joinery & Finishing */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Joinery</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cutlistData.joinery.map((j) => (
                      <Chip key={j} label={j} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Finishing</Typography>
                  <List dense>
                    {cutlistData.finishing.map((f, idx) => (
                      <ListItem key={idx} dense>
                        <ListItemText primary={f} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCutlistOpen(false)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<CartIcon />}
                onClick={() => {
                  // TODO: Open materials shopping list
                  alert('Shopping list feature coming soon!');
                }}
              >
                View Materials & Suppliers
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // TODO: Export cut list as PDF/CSV
                  alert('Export feature coming soon!');
                }}
              >
                Export Cut List
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
