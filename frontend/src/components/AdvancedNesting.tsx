import React, { useState, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Slider, Switch, FormControlLabel, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import LayersIcon from '@mui/icons-material/Layers';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

interface Part {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  grainDirection?: 'horizontal' | 'vertical' | 'none';
  canRotate: boolean;
}

interface Sheet {
  id: number;
  width: number;
  height: number;
  material: string;
  parts: PlacedPart[];
  waste: number;
}

interface PlacedPart extends Part {
  x: number;
  y: number;
  rotated: boolean;
  rotation: number;
}

interface NestingResult {
  sheets: Sheet[];
  efficiency: number;
  totalWaste: number;
  partsPlaced: number;
  partsUnplaced: Part[];
}

interface AdvancedNestingProps {
  parts?: Part[];
  onExport?: (result: NestingResult, format: 'dxf' | 'svg' | 'pdf') => void;
}

const AdvancedNesting: React.FC<AdvancedNestingProps> = ({ 
  parts: initialParts = [],
  onExport 
}) => {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [sheetWidth, setSheetWidth] = useState(48);
  const [sheetHeight, setSheetHeight] = useState(96);
  const [sheetMaterial, setSheetMaterial] = useState('3/4" Plywood');
  const [bladeWidth, setBladeWidth] = useState(0.125);
  const [edgeAllowance, setEdgeAllowance] = useState(0.25);
  const [allowRotation, setAllowRotation] = useState(true);
  const [anyAngleRotation, setAnyAngleRotation] = useState(false);
  const [nestingAlgorithm, setNestingAlgorithm] = useState<'guillotine' | 'true-shape' | 'hybrid'>('hybrid');
  const [nestingResult, setNestingResult] = useState<NestingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newPartDialog, setNewPartDialog] = useState(false);
  const [newPart, setNewPart] = useState<Partial<Part>>({
    width: 12,
    height: 24,
    quantity: 1,
    material: '3/4" Plywood',
    canRotate: true,
    grainDirection: 'horizontal'
  });

  const runNesting = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/nesting/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts,
          sheetDimensions: { width: sheetWidth, height: sheetHeight },
          settings: {
            bladeWidth,
            edgeAllowance,
            allowRotation,
            anyAngleRotation,
            algorithm: nestingAlgorithm
          }
        })
      });
      const result = await response.json();
      setNestingResult(result);
    } catch (error) {
      console.error('Nesting failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [parts, sheetWidth, sheetHeight, bladeWidth, edgeAllowance, allowRotation, anyAngleRotation, nestingAlgorithm]);

  const addPart = () => {
    if (newPart.name && newPart.width && newPart.height) {
      setParts([...parts, {
        id: `part-${Date.now()}`,
        name: newPart.name,
        width: newPart.width,
        height: newPart.height,
        quantity: newPart.quantity || 1,
        material: newPart.material || sheetMaterial,
        canRotate: newPart.canRotate ?? true,
        grainDirection: newPart.grainDirection
      }]);
      setNewPart({ width: 12, height: 24, quantity: 1, material: sheetMaterial, canRotate: true });
      setNewPartDialog(false);
    }
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const exportNesting = (format: 'dxf' | 'svg' | 'pdf') => {
    if (nestingResult && onExport) {
      onExport(nestingResult, format);
    }
  };

  const renderSheetPreview = (sheet: Sheet) => {
    const scale = 4;
    return (
      <Box sx={{ position: 'relative', width: sheet.width * scale, height: sheet.height * scale, border: '2px solid #333', bgcolor: '#f5f5f5', mb: 2 }}>
        {sheet.parts.map((part, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              left: part.x * scale,
              top: part.y * scale,
              width: (part.rotated ? part.height : part.width) * scale - bladeWidth * scale,
              height: (part.rotated ? part.width : part.height) * scale - bladeWidth * scale,
              bgcolor: part.material === '3/4" Plywood' ? '#8B4513' : '#DEB887',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              transform: `rotate(${part.rotation || 0}deg)`,
              transformOrigin: 'top left'
            }}
            title={`${part.name}: ${part.width}" x ${part.height}"`}
          >
            {part.name}
          </Box>
        ))}
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', px: 1 }}>
          Waste: {(sheet.waste * 100).toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <LayersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Advanced Nesting Optimizer
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Non-guillotine nesting with any-angle rotation support for maximum material efficiency.
      </Alert>

      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sheet Settings</Typography>
            
            <TextField
              label="Sheet Width (inches)"
              type="number"
              value={sheetWidth}
              onChange={(e) => setSheetWidth(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Sheet Height (inches)"
              type="number"
              value={sheetHeight}
              onChange={(e) => setSheetHeight(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Material</InputLabel>
              <Select value={sheetMaterial} onChange={(e) => setSheetMaterial(e.target.value)}>
                <MenuItem value="1/2\" Plywood">1/2" Plywood</MenuItem>
                <MenuItem value="3/4\" Plywood">3/4" Plywood</MenuItem>
                <MenuItem value="1/2\" MDF">1/2" MDF</MenuItem>
                <MenuItem value="3/4\" MDF">3/4" MDF</MenuItem>
                <MenuItem value="Melamine">Melamine</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Nesting Settings</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Algorithm</InputLabel>
              <Select value={nestingAlgorithm} onChange={(e) => setNestingAlgorithm(e.target.value as any)}>
                <MenuItem value="guillotine">Guillotine (Fast)</MenuItem>
                <MenuItem value="true-shape">True Shape (Optimal)</MenuItem>
                <MenuItem value="hybrid">Hybrid (Balanced)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Blade Width (inches)"
              type="number"
              value={bladeWidth}
              onChange={(e) => setBladeWidth(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ step: 0.001 }}
            />
            
            <TextField
              label="Edge Allowance (inches)"
              type="number"
              value={edgeAllowance}
              onChange={(e) => setEdgeAllowance(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={<Switch checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} />}
              label="Allow 90° Rotation"
            />
            
            <FormControlLabel
              control={<Switch checked={anyAngleRotation} onChange={(e) => setAnyAngleRotation(e.target.checked)} />}
              label="Any-Angle Rotation"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={runNesting}
              disabled={isLoading || parts.length === 0}
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Nesting...' : 'Run Nesting'}
            </Button>
          </Paper>
        </Grid>

        {/* Parts and Results */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`Parts (${parts.length})`} />
              <Tab label="Results" />
              <Tab label="3D Preview" />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => setNewPartDialog(true)} sx={{ mb: 2 }}>
                  Add Part
                </Button>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Width</TableCell>
                        <TableCell>Height</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Material</TableCell>
                        <TableCell>Grain</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.width}"</TableCell>
                          <TableCell>{part.height}"</TableCell>
                          <TableCell>{part.quantity}</TableCell>
                          <TableCell>{part.material}</TableCell>
                          <TableCell>
                            <Chip size="small" label={part.grainDirection || 'none'} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" color="error" onClick={() => removePart(part.id)}>Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                {nestingResult ? (
                  <>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" variant="body2">Sheets Needed</Typography>
                            <Typography variant="h4">{nestingResult.sheets.length}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" variant="body2">Efficiency</Typography>
                            <Typography variant="h4">{(nestingResult.efficiency * 100).toFixed(1)}%</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" variant="body2">Total Waste</Typography>
                            <Typography variant="h4">{(nestingResult.totalWaste * 100).toFixed(1)}%</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" variant="body2">Parts Placed</Typography>
                            <Typography variant="h4">{nestingResult.partsPlaced}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportNesting('dxf')} sx={{ mr: 1 }}>Export DXF</Button>
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportNesting('svg')} sx={{ mr: 1 }}>Export SVG</Button>
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportNesting('pdf')}>Export PDF</Button>
                    </Box>

                    {nestingResult.sheets.map((sheet, idx) => (
                      <Accordion key={idx}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Sheet {idx + 1} - {sheet.material} ({sheet.width}" x {sheet.height}")</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {renderSheetPreview(sheet)}
                          <Typography variant="body2">
                            Parts: {sheet.parts.length} | Waste: {(sheet.waste * 100).toFixed(1)}%
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                ) : (
                  <Typography color="textSecondary">Run nesting to see results</Typography>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Alert severity="info">
                  3D preview coming soon - will show stacked sheet visualization with rotation controls
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Part Dialog */}
      <Dialog open={newPartDialog} onClose={() => setNewPartDialog(false)}>
        <DialogTitle>Add Part</DialogTitle>
        <DialogContent>
          <TextField
            label="Part Name"
            fullWidth
            value={newPart.name || ''}
            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (inches)"
                type="number"
                fullWidth
                value={newPart.width}
                onChange={(e) => setNewPart({ ...newPart, width: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (inches)"
                type="number"
                fullWidth
                value={newPart.height}
                onChange={(e) => setNewPart({ ...newPart, height: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={newPart.quantity}
            onChange={(e) => setNewPart({ ...newPart, quantity: Number(e.target.value) })}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grain Direction</InputLabel>
            <Select
              value={newPart.grainDirection || 'none'}
              onChange={(e) => setNewPart({ ...newPart, grainDirection: e.target.value as any })}
            >
              <MenuItem value="horizontal">Horizontal</MenuItem>
              <MenuItem value="vertical">Vertical</MenuItem>
              <MenuItem value="none">No Grain</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={newPart.canRotate !== false} onChange={(e) => setNewPart({ ...newPart, canRotate: e.target.checked })} />}
            label="Allow Rotation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPartDialog(false)}>Cancel</Button>
          <Button onClick={addPart} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedNesting;