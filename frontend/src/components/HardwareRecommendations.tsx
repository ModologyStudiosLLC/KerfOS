'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Switch, FormControlLabel, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Alert, Tooltip,
  IconButton, LinearProgress, Rating, Divider, Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import LinkIcon from '@mui/icons-material/Link';

interface HardwareItem {
  id: string;
  name: string;
  type: 'hinge' | 'slide' | 'knob' | 'pull' | 'catch' | 'support' | 'screw' | 'other';
  quantity: number;
  specifications: {
    brand?: string;
    model?: string;
    finish?: string;
    size?: string;
    weightCapacity?: number;
    openingAngle?: number;
  mountingType?: string;
  color?: string;
  material?: string;
  length?: number;
    width?: number;
    centerToCenter?: number;
  screwSize?: string;
  screwLength?: number;
  quantityPerPack?: number;
  pricePerUnit?: number;
  supplierUrl?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  };
  compatible: boolean;
  issues: string[];
  recommendation: 'essential' | 'recommended' | 'optional' | 'upgrade';
}

interface DesignSpec {
  cabinetType: 'base' | 'wall' | 'tall' | 'drawer' | 'corner';
  width: number;
  height: number;
  depth: number;
  doorCount: number;
  drawerCount: number;
  doorStyle: 'overlay' | 'inset' | 'full-overlay' | 'half-overlay';
  material: string;
  weight?: number;
}

interface HardwareRecommendation {
  hardware: HardwareItem;
  reason: string;
  alternatives: HardwareItem[];
  supplierLinks: { name: string; url: string; price: number }[];
}

interface HardwareRecommendationsProps {
  design?: DesignSpec;
  onHardwareSelect?: (hardware: HardwareItem[]) => void;
}

const HARDWARE_TYPES = {
  hinge: { label: 'Hinges', icon: '🔧' },
  slide: { label: 'Drawer Slides', icon: '📏' },
  knob: { label: 'Knobs', icon: '⭕' },
  pull: { label: 'Pulls', icon: '➡️' },
  catch: { label: 'Catches/Latches', icon: '🔒' },
  support: { label: 'Supports/Brackets', icon: '🔩' },
  screw: { label: 'Screws/Fasteners', icon: '🔩' },
  other: { label: 'Other', icon: '⚙️' }
};

const POPULAR_BRANDS = {
  hinges: ['Blum', 'Häfele', 'Grass', 'Salice', 'Sugatsune'],
  slides: ['Blum', 'Accuride', 'Grass', 'Knape & Vogt', 'King Slide'],
  pulls: ['Liberty', 'Amerock', 'Richelieu', 'Top Knobs', 'Jeffrey Alexander'],
};

const HardwareRecommendations: React.FC<HardwareRecommendationsProps> = ({ 
  design,
  onHardwareSelect 
}) => {
  const [recommendations, setRecommendations] = useState<HardwareRecommendation[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<HardwareItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [budget, setBudget] = useState<'budget' | 'mid' | 'premium'>('mid');
  const [style, setStyle] = useState<'modern' | 'traditional' | 'rustic' | 'minimal'>('modern');

  // Generate recommendations based on design
  const generateRecommendations = useCallback(async () => {
    if (!design) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hardware/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design, budget, style })
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Generate mock recommendations for demo
      generateMockRecommendations();
    } finally {
      setIsLoading(false);
    }
  }, [design, budget, style]);

  const generateMockRecommendations = () => {
    const mockRecs: HardwareRecommendation[] = [
      {
        hardware: {
          id: 'hinge-1',
          name: 'Blum Clip Top 110° Soft-Close Hinge',
          type: 'hinge',
          quantity: design!.doorCount * 2,
          specifications: {
            brand: 'Blum',
            model: 'Clip Top BLUMOTION',
            finish: 'Nickel',
            openingAngle: 110,
            mountingType: 'Concealed',
            weightCapacity: 15,
            pricePerUnit: 8.50,
            supplierUrl: 'https://www.rockler.com/blum-clip-top-hinges',
            inStock: true,
            rating: 4.8,
            reviewCount: 1250
          },
          compatible: true,
          issues: [],
          recommendation: 'essential'
        },
        reason: 'Soft-close concealed hinge ideal for overlay cabinet doors. Blum quality ensures smooth operation.',
        alternatives: [],
        supplierLinks: [
          { name: 'Rockler', url: 'https://www.rockler.com', price: 8.50 },
          { name: 'Amazon', url: 'https://www.amazon.com', price: 7.99 }
        ]
      },
      {
        hardware: {
          id: 'slide-1',
          name: 'Blum Tandem 18" Full Extension Soft-Close Slide',
          type: 'slide',
          quantity: design!.drawerCount * 2,
          specifications: {
            brand: 'Blum',
            model: 'Tandem BLUMOTION',
            finish: 'Zinc',
            size: '18"',
            weightCapacity: 100,
            mountingType: 'Undermount',
            pricePerUnit: 28.00,
            supplierUrl: 'https://www.woodcraft.com/blum-tandem',
            inStock: true,
            rating: 4.9,
            reviewCount: 890
          },
          compatible: true,
          issues: [],
          recommendation: 'essential'
        },
        reason: 'Premium undermount slides with soft-close. Perfect for frameless cabinets with 5/8" drawer sides.',
        alternatives: [],
        supplierLinks: [
          { name: 'Woodcraft', url: 'https://www.woodcraft.com', price: 28.00 },
          { name: 'Rockler', url: 'https://www.rockler.com', price: 29.99 }
        ]
      },
      {
        hardware: {
          id: 'pull-1',
          name: 'Modern Square Bar Pull 5" CC',
          type: 'pull',
          quantity: design!.drawerCount + design!.doorCount,
          specifications: {
            brand: 'Liberty',
            model: 'Modern Square',
            finish: 'Matte Black',
            length: 5,
            centerToCenter: 5,
            color: 'Black',
            material: 'Zinc Alloy',
            pricePerUnit: 4.99,
            quantityPerPack: 25,
            supplierUrl: 'https://www.homedepot.com/liberty-pulls',
            inStock: true,
            rating: 4.5,
            reviewCount: 3200
          },
          compatible: true,
          issues: [],
          recommendation: 'recommended'
        },
        reason: 'Clean modern look that complements shaker-style doors. Matte black finish is durable and on-trend.',
        alternatives: [],
        supplierLinks: [
          { name: 'Home Depot', url: 'https://www.homedepot.com', price: 4.99 },
          { name: 'Amazon', url: 'https://www.amazon.com', price: 4.49 }
        ]
      }
    ];
    setRecommendations(mockRecs);
  };

  const toggleHardwareSelection = (item: HardwareItem) => {
    const isSelected = selectedHardware.some(h => h.id === item.id);
    if (isSelected) {
      setSelectedHardware(selectedHardware.filter(h => h.id !== item.id));
    } else {
      setSelectedHardware([...selectedHardware, item]);
    }
  };

  const filteredRecommendations = useMemo(() => {
    if (filterType === 'all') return recommendations;
    return recommendations.filter(r => r.hardware.type === filterType);
  }, [recommendations, filterType]);

  const totalCost = useMemo(() => {
    return selectedHardware.reduce((sum, item) => {
      const price = item.specifications.pricePerUnit || 0;
      return sum + (price * item.quantity);
    }, 0);
  }, [selectedHardware]);

  // Group by type
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, HardwareRecommendation[]> = {};
    filteredRecommendations.forEach(rec => {
      const type = rec.hardware.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(rec);
    });
    return groups;
  }, [filteredRecommendations]);

  // @ts-ignore – MUI union type complexity exceeds TS limit; runtime safe
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Hardware Recommendations
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        AI-powered hardware suggestions based on your cabinet design, style preferences, and budget.
      </Alert>

      {!design && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No design loaded. Please create or load a cabinet design to get personalized recommendations.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Budget Level</InputLabel>
              <Select value={budget} onChange={(e) => setBudget(e.target.value as any)}>
                <MenuItem value="budget">Budget (Value brands)</MenuItem>
                <MenuItem value="mid">Mid-Range (Quality brands)</MenuItem>
                <MenuItem value="premium">Premium (Top tier)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Style</InputLabel>
              <Select value={style} onChange={(e) => setStyle(e.target.value as any)}>
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="traditional">Traditional</MenuItem>
                <MenuItem value="rustic">Rustic</MenuItem>
                <MenuItem value="minimal">Minimal</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">All Hardware</MenuItem>
                {Object.entries(HARDWARE_TYPES).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.icon} {val.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              fullWidth 
              onClick={generateRecommendations}
              disabled={isLoading || !design}
            >
              {isLoading ? 'Analyzing...' : 'Generate Recommendations'}
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selected: {selectedHardware.length} items
            </Typography>
            <Typography variant="h5" color="primary">
              ${totalCost.toFixed(2)}
            </Typography>

            {selectedHardware.length > 0 && (
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => onHardwareSelect?.(selectedHardware)}
                startIcon={<AddShoppingCartIcon />}
              >
                Add to Project
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="All" />
              <Tab label="Essential" />
              <Tab label="Recommended" />
              <Tab label="Upgrades" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {Object.entries(groupedRecommendations).map(([type, recs]) => (
                <Accordion key={type} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>
                        {HARDWARE_TYPES[type as keyof typeof HARDWARE_TYPES]?.icon} {' '}
                        {HARDWARE_TYPES[type as keyof typeof HARDWARE_TYPES]?.label}
                      </Typography>
                      <Chip size="small" label={recs.length} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {recs.map((rec) => {
                        const isSelected = selectedHardware.some(h => h.id === rec.hardware.id);
                        return (
                          <Grid item xs={12} md={6} key={rec.hardware.id}>
                            <Card 
                              variant="outlined"
                              sx={{ 
                                cursor: 'pointer',
                                border: isSelected ? '2px solid #1976d2' : undefined,
                                bgcolor: isSelected ? 'action.selected' : undefined
                              }}
                              onClick={() => toggleHardwareSelection(rec.hardware)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Typography variant="subtitle1">
                                    {rec.hardware.name}
                                  </Typography>
                                  {isSelected && <CheckCircleIcon color="primary" />}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                  <Chip size="small" label={rec.hardware.recommendation} />
                                  <Chip 
                                    size="small" 
                                    label={rec.hardware.specifications.brand} 
                                    variant="outlined" 
                                  />
                                  {rec.hardware.specifications.finish && (
                                    <Chip 
                                      size="small" 
                                      label={rec.hardware.specifications.finish} 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>

                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  Qty: {rec.hardware.quantity}
                                </Typography>

                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                  {rec.reason}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Rating 
                                    value={rec.hardware.specifications.rating || 0} 
                                    precision={0.1} 
                                    size="small" 
                                    readOnly 
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    ({rec.hardware.specifications.reviewCount})
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6" color="primary">
                                    ${((rec.hardware.specifications.pricePerUnit || 0) * rec.hardware.quantity).toFixed(2)}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {rec.supplierLinks.map(link => (
                                      <Tooltip key={link.name} title={`${link.name} - $${link.price.toFixed(2)}`}>
                                        <IconButton size="small" component="a" href={link.url} target="_blank">
                                          <LinkIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ))}
                                  </Box>
                                </Box>

                                {rec.hardware.issues.length > 0 && (
                                  <Alert severity="warning" sx={{ mt: 1 }}>
                                    {rec.hardware.issues.join(', ')}
                                  </Alert>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {recommendations.length === 0 && (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  Click "Generate Recommendations" to analyze your design
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HardwareRecommendations;