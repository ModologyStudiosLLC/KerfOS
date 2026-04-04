'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Switch, FormControlLabel, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Alert, Tooltip,
  IconButton, Badge, LinearProgress, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StraightenIcon from '@mui/icons-material/Straighten';
import PaletteIcon from '@mui/icons-material/Palette';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface EdgeBandingItem {
  id: string;
  partName: string;
  edge: 'top' | 'bottom' | 'left' | 'right';
  length: number;
  material: string;
  thickness: string;
  color: string;
  finish: 'pre-glued' | 'unglued' | 'iron-on';
}

interface EdgeBandingSummary {
  totalLength: number;
  totalCost: number;
  rollsNeeded: number;
  byMaterial: { [key: string]: number };
  byColor: { [key: string]: number };
  byThickness: { [key: string]: number };
}

interface BandingOption {
  material: string;
  thickness: string;
  color: string;
  pricePerFoot: number;
  rollLength: number;
  inStock: boolean;
}

interface EdgeBandingProps {
  parts?: { name: string; width: number; height: number; edgesToBand: string[] }[];
  onBandingUpdate?: (items: EdgeBandingItem[]) => void;
}

const BANDING_OPTIONS: BandingOption[] = [
  { material: 'PVC', thickness: '1mm', color: 'White', pricePerFoot: 0.15, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '2mm', color: 'White', pricePerFoot: 0.25, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '1mm', color: 'Black', pricePerFoot: 0.15, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '2mm', color: 'Black', pricePerFoot: 0.25, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '1mm', color: 'Oak', pricePerFoot: 0.18, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '1mm', color: 'Maple', pricePerFoot: 0.18, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '1mm', color: 'Walnut', pricePerFoot: 0.20, rollLength: 250, inStock: true },
  { material: 'PVC', thickness: '1mm', color: 'Cherry', pricePerFoot: 0.20, rollLength: 250, inStock: true },
  { material: 'Wood Veneer', thickness: '1/32"', color: 'Red Oak', pricePerFoot: 0.45, rollLength: 100, inStock: true },
  { material: 'Wood Veneer', thickness: '1/32"', color: 'White Oak', pricePerFoot: 0.50, rollLength: 100, inStock: true },
  { material: 'Wood Veneer', thickness: '1/32"', color: 'Maple', pricePerFoot: 0.45, rollLength: 100, inStock: true },
  { material: 'Wood Veneer', thickness: '1/32"', color: 'Walnut', pricePerFoot: 0.55, rollLength: 100, inStock: true },
  { material: 'Wood Veneer', thickness: '1/32"', color: 'Cherry', pricePerFoot: 0.55, rollLength: 100, inStock: true },
  { material: 'Melamine', thickness: '1/2mm', color: 'White', pricePerFoot: 0.10, rollLength: 300, inStock: true },
  { material: 'Melamine', thickness: '1/2mm', color: 'Black', pricePerFoot: 0.10, rollLength: 300, inStock: true },
  { material: 'ABS', thickness: '1mm', color: 'White', pricePerFoot: 0.20, rollLength: 250, inStock: false },
  { material: 'ABS', thickness: '2mm', color: 'White', pricePerFoot: 0.30, rollLength: 250, inStock: false },
];

const EDGE_COLORS: Record<string, string> = {
  'White': '#FFFFFF',
  'Black': '#1a1a1a',
  'Oak': '#c4a35a',
  'Maple': '#f5e6c8',
  'Walnut': '#5d4037',
  'Cherry': '#a52a2a',
  'Red Oak': '#b8860b',
  'White Oak': '#d4a574',
};

const EdgeBanding: React.FC<EdgeBandingProps> = ({ parts: initialParts = [], onBandingUpdate }) => {
  const [bandingItems, setBandingItems] = useState<EdgeBandingItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('PVC');
  const [selectedThickness, setSelectedThickness] = useState('1mm');
  const [selectedColor, setSelectedColor] = useState('White');
  const [selectedFinish, setSelectedFinish] = useState<'pre-glued' | 'unglued' | 'iron-on'>('pre-glued');
  const [activeTab, setActiveTab] = useState(0);
  const [previewPart, setPreviewPart] = useState<{ name: string; width: number; height: number; edges: string[] } | null>(null);

  // Calculate summary
  const summary: EdgeBandingSummary = useMemo(() => {
    const byMaterial: Record<string, number> = {};
    const byColor: Record<string, number> = {};
    const byThickness: Record<string, number> = {};
    let totalLength = 0;
    let totalCost = 0;

    bandingItems.forEach(item => {
      const option = BANDING_OPTIONS.find(
        o => o.material === item.material && o.thickness === item.thickness && o.color === item.color
      );
      const cost = option ? item.length * option.pricePerFoot : 0;
      
      totalLength += item.length;
      totalCost += cost;
      byMaterial[item.material] = (byMaterial[item.material] || 0) + item.length;
      byColor[item.color] = (byColor[item.color] || 0) + item.length;
      byThickness[item.thickness] = (byThickness[item.thickness] || 0) + item.length;
    });

    const avgRollLength = 250; // Default roll length
    const rollsNeeded = Math.ceil(totalLength / avgRollLength);

    return { totalLength, totalCost, rollsNeeded, byMaterial, byColor, byThickness };
  }, [bandingItems]);

  // Auto-generate banding from parts
  const generateBandingFromParts = useCallback(() => {
    const items: EdgeBandingItem[] = [];
    initialParts.forEach(part => {
      part.edgesToBand.forEach(edge => {
        const length = edge === 'top' || edge === 'bottom' ? part.width : part.height;
        items.push({
          id: `${part.name}-${edge}`,
          partName: part.name,
          edge: edge as 'top' | 'bottom' | 'left' | 'right',
          length,
          material: selectedMaterial,
          thickness: selectedThickness,
          color: selectedColor,
          finish: selectedFinish
        });
      });
    });
    setBandingItems(items);
    onBandingUpdate?.(items);
  }, [initialParts, selectedMaterial, selectedThickness, selectedColor, selectedFinish, onBandingUpdate]);

  const addBandingItem = (partName: string, edge: 'top' | 'bottom' | 'left' | 'right', length: number) => {
    const newItem: EdgeBandingItem = {
      id: `${partName}-${edge}-${Date.now()}`,
      partName,
      edge,
      length,
      material: selectedMaterial,
      thickness: selectedThickness,
      color: selectedColor,
      finish: selectedFinish
    };
    setBandingItems([...bandingItems, newItem]);
    onBandingUpdate?.([...bandingItems, newItem]);
  };

  const removeBandingItem = (id: string) => {
    const newItems = bandingItems.filter(item => item.id !== id);
    setBandingItems(newItems);
    onBandingUpdate?.(newItems);
  };

  const updateBandingItem = (id: string, updates: Partial<EdgeBandingItem>) => {
    const newItems = bandingItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setBandingItems(newItems);
    onBandingUpdate?.(newItems);
  };

  const filteredOptions = useMemo(() => {
    return BANDING_OPTIONS.filter(
      opt => opt.material === selectedMaterial && opt.thickness === selectedThickness
    );
  }, [selectedMaterial, selectedThickness]);

  const renderPartPreview = () => {
    if (!previewPart) return null;
    const { name, width, height, edges } = previewPart;
    const scale = 3;
    
    return (
      <Box sx={{ position: 'relative', width: width * scale, height: height * scale, margin: 'auto' }}>
        {/* Main part */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: '#DEB887',
          border: '1px solid #8B4513'
        }} />
        
        {/* Edge indicators */}
        {edges.includes('top') && (
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            bgcolor: EDGE_COLORS[selectedColor], border: '1px solid #333'
          }} />
        )}
        {edges.includes('bottom') && (
          <Box sx={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            bgcolor: EDGE_COLORS[selectedColor], border: '1px solid #333'
          }} />
        )}
        {edges.includes('left') && (
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
            bgcolor: EDGE_COLORS[selectedColor], border: '1px solid #333'
          }} />
        )}
        {edges.includes('right') && (
          <Box sx={{ 
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 4,
            bgcolor: EDGE_COLORS[selectedColor], border: '1px solid #333'
          }} />
        )}
        
        <Typography variant="caption" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <StraightenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Edge Banding Optimizer
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Calculate edge banding requirements, compare materials, and generate shopping lists.
      </Alert>

      <Grid container spacing={3}>
        {/* Material Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Banding Selection
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Material</InputLabel>
              <Select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
                <MenuItem value="PVC">PVC</MenuItem>
                <MenuItem value="Wood Veneer">Wood Veneer</MenuItem>
                <MenuItem value="Melamine">Melamine</MenuItem>
                <MenuItem value="ABS">ABS</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Thickness</InputLabel>
              <Select value={selectedThickness} onChange={(e) => setSelectedThickness(e.target.value)}>
                {selectedMaterial === 'PVC' && (
                  <>
                    <MenuItem value="1mm">1mm</MenuItem>
                    <MenuItem value="2mm">2mm</MenuItem>
                  </>
                )}
                {selectedMaterial === 'Wood Veneer' && (
                  <MenuItem value='1/32"'>1/32&quot;</MenuItem>
                )}
                {selectedMaterial === 'Melamine' && (
                  <MenuItem value="1/2mm">1/2mm</MenuItem>
                )}
                {selectedMaterial === 'ABS' && (
                  <>
                    <MenuItem value="1mm">1mm</MenuItem>
                    <MenuItem value="2mm">2mm</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Color</InputLabel>
              <Select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                {filteredOptions.map(opt => (
                  <MenuItem key={opt.color} value={opt.color}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, height: 20, 
                        bgcolor: EDGE_COLORS[opt.color] || '#888',
                        border: '1px solid #333',
                        borderRadius: 1
                      }} />
                      {opt.color}
                      {!opt.inStock && <Chip size="small" label="Out of Stock" color="warning" />}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Finish Type</InputLabel>
              <Select value={selectedFinish} onChange={(e) => setSelectedFinish(e.target.value as any)}>
                <MenuItem value="pre-glued">Pre-Glued (Iron-On)</MenuItem>
                <MenuItem value="unglued">Unglued (Apply Adhesive)</MenuItem>
                <MenuItem value="iron-on">Self-Adhesive</MenuItem>
              </Select>
            </FormControl>

            {initialParts.length > 0 && (
              <Button variant="contained" fullWidth onClick={generateBandingFromParts}>
                Generate from Parts
              </Button>
            )}
          </Paper>

          {/* Summary */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Total Length</Typography>
                <Typography variant="h6">{summary.totalLength.toFixed(1)} ft</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Estimated Cost</Typography>
                <Typography variant="h6">${summary.totalCost.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Rolls Needed</Typography>
                <Typography variant="h6">{summary.rollsNeeded} rolls</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" gutterBottom>By Material:</Typography>
            {Object.entries(summary.byMaterial).map(([mat, len]) => (
              <Chip key={mat} size="small" label={`${mat}: ${len.toFixed(1)} ft`} sx={{ m: 0.5 }} />
            ))}

            <Typography variant="body2" sx={{ mt: 1 }} gutterBottom>By Color:</Typography>
            {Object.entries(summary.byColor).map(([color, len]) => (
              <Chip 
                key={color} 
                size="small" 
                label={`${color}: ${len.toFixed(1)} ft`}
                sx={{ m: 0.5, bgcolor: EDGE_COLORS[color] || '#888' }}
              />
            ))}
          </Paper>
        </Grid>

        {/* Banding List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`Items (${bandingItems.length})`} />
              <Tab label="Shopping List" />
              <Tab label="Tips" />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                {bandingItems.length === 0 ? (
                  <Typography color="textSecondary">
                    No banding items. Use "Generate from Parts" or add manually.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Part</TableCell>
                          <TableCell>Edge</TableCell>
                          <TableCell>Length</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bandingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.partName}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.edge} />
                            </TableCell>
                            <TableCell>{item.length.toFixed(1)} ft</TableCell>
                            <TableCell>{item.material}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ 
                                  width: 16, height: 16,
                                  bgcolor: EDGE_COLORS[item.color] || '#888',
                                  border: '1px solid #333',
                                  borderRadius: '50%'
                                }} />
                                {item.color}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => removeBandingItem(item.id)}>
                                <RemoveIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Shopping List</Typography>
                
                {Object.entries(summary.byMaterial).map(([material, length]) => {
                  const options = BANDING_OPTIONS.filter(o => o.material === material);
                  const avgPrice = options.reduce((sum, o) => sum + o.pricePerFoot, 0) / options.length;
                  const rolls = Math.ceil(length / (options[0]?.rollLength || 250));
                  
                  return (
                    <Card key={material} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{material}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total: {length.toFixed(1)} linear feet
                        </Typography>
                        <Typography variant="body2">
                          Recommended: {rolls} roll(s) @ ${avgPrice.toFixed(2)}/ft
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Est. ${((length * avgPrice) || (rolls * avgPrice * 250)).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}

                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  Export Shopping List
                </Button>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Application Tips</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>Pre-Glued Banding:</strong> Use a household iron on medium-high heat. 
                      Apply firm pressure and move slowly along the edge. Trim excess with a router or sharp utility knife.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Temperature:</strong> Keep iron at 280-320°F (138-160°C) for best adhesion.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Material Guide</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>PVC (1mm):</strong> Best for painted cabinets, flexible, easy to apply, economical.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>PVC (2mm):</strong> Thicker, more durable, better impact resistance, slight edge rounding needed.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Wood Veneer:</strong> Natural wood look, can be stained to match, premium appearance.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Melamine:</strong> Matches melamine panels, economical, best for interior applications.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EdgeBanding;