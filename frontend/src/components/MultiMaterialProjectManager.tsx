import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Switch, FormControlLabel, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Alert, Tooltip,
  IconButton, LinearProgress, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Badge, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LayersIcon from '@mui/icons-material/Layers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

interface Material {
  id: string;
  name: string;
  type: 'plywood' | 'mdf' | 'hardwood' | 'melamine' | 'laminate' | 'other';
  thickness: number;
  thicknessUnit: 'inches' | 'mm';
  actualThickness?: number;
  pricePerSheet?: number;
  sheetWidth: number;
  sheetHeight: number;
  grainDirection?: 'horizontal' | 'vertical' | 'none';
  color?: string;
  finish?: string;
  supplier?: string;
  notes?: string;
}

interface Part {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  materialId: string;
  edgeBanding?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  finish?: string;
  notes?: string;
}

interface MultiMaterialProject {
  id: string;
  name: string;
  description?: string;
  materials: Material[];
  parts: Part[];
  createdAt: string;
  updatedAt: string;
}

interface MaterialStats {
  totalSheets: number;
  totalCost: number;
  wastePercentage: number;
  materialBreakdown: { material: string; sheets: number; cost: number }[];
}

const MATERIAL_TYPES = {
  plywood: { label: 'Plywood', icon: '🪵', defaultThickness: 0.75 },
  mdf: { label: 'MDF', icon: '🟫', defaultThickness: 0.75 },
  hardwood: { label: 'Hardwood', icon: '🪵', defaultThickness: 0.75 },
  melamine: { label: 'Melamine', icon: '⬜', defaultThickness: 0.75 },
  laminate: { label: 'Laminate', icon: '🎨', defaultThickness: 0.0625 },
  other: { label: 'Other', icon: '📦', defaultThickness: 0.5 }
};

const MultiMaterialProjectManager: React.FC = () => {
  const [project, setProject] = useState<MultiMaterialProject>({
    id: 'project-1',
    name: 'New Multi-Material Project',
    materials: [],
    parts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [activeTab, setActiveTab] = useState(0);
  const [materialDialog, setMaterialDialog] = useState(false);
  const [partDialog, setPartDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    type: 'plywood',
    thickness: 0.75,
    thicknessUnit: 'inches',
    sheetWidth: 48,
    sheetHeight: 96
  });
  const [newPart, setNewPart] = useState<Partial<Part>>({
    quantity: 1
  });

  // Calculate stats
  const stats: MaterialStats = useMemo(() => {
    const materialMap = new Map(project.materials.map(m => [m.id, m]));
    const breakdown: Record<string, { sheets: number; cost: number }> = {};
    
    project.parts.forEach(part => {
      const material = materialMap.get(part.materialId);
      if (material) {
        const area = (part.width * part.height * part.quantity) / (material.sheetWidth * material.sheetHeight);
        if (!breakdown[material.name]) {
          breakdown[material.name] = { sheets: 0, cost: 0 };
        }
        breakdown[material.name].sheets += area;
        breakdown[material.name].cost += area * (material.pricePerSheet || 0);
      }
    });

    const materialBreakdown = Object.entries(breakdown).map(([material, data]) => ({
      material,
      sheets: Math.ceil(data.sheets * 1.1), // 10% waste factor
      cost: data.cost * 1.1
    }));

    return {
      totalSheets: materialBreakdown.reduce((sum, m) => sum + m.sheets, 0),
      totalCost: materialBreakdown.reduce((sum, m) => sum + m.cost, 0),
      wastePercentage: 10,
      materialBreakdown
    };
  }, [project]);

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.type) {
      const material: Material = {
        id: `material-${Date.now()}`,
        name: newMaterial.name,
        type: newMaterial.type as Material['type'],
        thickness: newMaterial.thickness || MATERIAL_TYPES[newMaterial.type as keyof typeof MATERIAL_TYPES].defaultThickness,
        thicknessUnit: newMaterial.thicknessUnit || 'inches',
        actualThickness: newMaterial.actualThickness,
        pricePerSheet: newMaterial.pricePerSheet,
        sheetWidth: newMaterial.sheetWidth || 48,
        sheetHeight: newMaterial.sheetHeight || 96,
        grainDirection: newMaterial.grainDirection,
        color: newMaterial.color,
        finish: newMaterial.finish,
        supplier: newMaterial.supplier,
        notes: newMaterial.notes
      };
      setProject({
        ...project,
        materials: [...project.materials, material],
        updatedAt: new Date().toISOString()
      });
      setNewMaterial({ type: 'plywood', thickness: 0.75, thicknessUnit: 'inches', sheetWidth: 48, sheetHeight: 96 });
      setMaterialDialog(false);
    }
  };

  const addPart = () => {
    if (newPart.name && newPart.materialId && newPart.width && newPart.height) {
      const part: Part = {
        id: `part-${Date.now()}`,
        name: newPart.name,
        width: newPart.width,
        height: newPart.height,
        quantity: newPart.quantity || 1,
        materialId: newPart.materialId,
        edgeBanding: newPart.edgeBanding,
        finish: newPart.finish,
        notes: newPart.notes
      };
      setProject({
        ...project,
        parts: [...project.parts, part],
        updatedAt: new Date().toISOString()
      });
      setNewPart({ quantity: 1 });
      setPartDialog(false);
    }
  };

  const deleteMaterial = (id: string) => {
    setProject({
      ...project,
      materials: project.materials.filter(m => m.id !== id),
      parts: project.parts.filter(p => p.materialId !== id),
      updatedAt: new Date().toISOString()
    });
  };

  const deletePart = (id: string) => {
    setProject({
      ...project,
      parts: project.parts.filter(p => p.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  // Import for useMemo
  const { useMemo } = React;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <LayersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Multi-Material Project Manager
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Design projects with multiple materials. Track costs, optimize material usage, and generate cut lists by material type.
      </Alert>

      <Grid container spacing={3}>
        {/* Project Info & Stats */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              label="Project Name"
              fullWidth
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={project.description || ''}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Materials</Typography>
                <Typography variant="h5">{project.materials.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Parts</Typography>
                <Typography variant="h5">{project.parts.length}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Total Sheets</Typography>
                <Typography variant="h5">{stats.totalSheets}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Est. Cost</Typography>
                <Typography variant="h5" color="primary">${stats.totalCost.toFixed(2)}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" gutterBottom>By Material:</Typography>
            {stats.materialBreakdown.map((item) => (
              <Box key={item.material} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{item.material}</Typography>
                <Typography variant="body2">{item.sheets} sheets (${item.cost.toFixed(0)})</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`Materials (${project.materials.length})`} />
              <Tab label={`Parts (${project.parts.length})`} />
              <Tab label="Cut List" />
              <Tab label="Cost Analysis" />
            </Tabs>

            {/* Materials Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setMaterialDialog(true)} sx={{ mb: 2 }}>
                  Add Material
                </Button>

                <Grid container spacing={2}>
                  {project.materials.map((material) => (
                    <Grid item xs={12} md={6} key={material.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1">
                              {MATERIAL_TYPES[material.type].icon} {material.name}
                            </Typography>
                            <Box>
                              <IconButton size="small" onClick={() => { setEditingMaterial(material); setMaterialDialog(true); }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => deleteMaterial(material.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {material.thickness}" {material.type} • {material.sheetWidth}" x {material.sheetHeight}"
                          </Typography>
                          {material.pricePerSheet && (
                            <Typography variant="body2">
                              ${material.pricePerSheet.toFixed(2)}/sheet
                            </Typography>
                          )}
                          {material.supplier && (
                            <Typography variant="body2" color="textSecondary">
                              Supplier: {material.supplier}
                            </Typography>
                          )}
                          {material.grainDirection && material.grainDirection !== 'none' && (
                            <Chip size="small" label={`Grain: ${material.grainDirection}`} sx={{ mt: 1 }} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Parts Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={() => setPartDialog(true)} 
                  sx={{ mb: 2 }}
                  disabled={project.materials.length === 0}
                >
                  Add Part
                </Button>

                {project.materials.length === 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Add materials first before adding parts.
                  </Alert>
                )}

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Part Name</TableCell>
                        <TableCell>Dimensions</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Material</TableCell>
                        <TableCell>Edge Banding</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {project.parts.map((part) => {
                        const material = project.materials.find(m => m.id === part.materialId);
                        return (
                          <TableRow key={part.id}>
                            <TableCell>{part.name}</TableCell>
                            <TableCell>{part.width}" x {part.height}"</TableCell>
                            <TableCell>{part.quantity}</TableCell>
                            <TableCell>{material?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              {part.edgeBanding && Object.values(part.edgeBanding).some(v => v) && (
                                <Chip size="small" label="Yes" />
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => deletePart(part.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Cut List Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                {project.materials.map((material) => {
                  const materialParts = project.parts.filter(p => p.materialId === material.id);
                  if (materialParts.length === 0) return null;
                  
                  return (
                    <Accordion key={material.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography>
                            {MATERIAL_TYPES[material.type].icon} {material.name}
                          </Typography>
                          <Chip size="small" label={`${materialParts.length} parts`} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Part</TableCell>
                              <TableCell>Width</TableCell>
                              <TableCell>Height</TableCell>
                              <TableCell>Qty</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {materialParts.map((part) => (
                              <TableRow key={part.id}>
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.width}"</TableCell>
                                <TableCell>{part.height}"</TableCell>
                                <TableCell>{part.quantity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            )}

            {/* Cost Analysis Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {stats.materialBreakdown.map((item) => (
                    <Grid item xs={12} md={4} key={item.material}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{item.material}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.sheets} sheets needed
                          </Typography>
                          <Typography variant="h4" color="primary">
                            ${item.cost.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6">Cost Optimization Tips</Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    • Consider using MDF for painted components to save ~30% on material costs.
                  </Typography>
                  <Typography variant="body2">
                    • Optimize cut layout to reduce waste - current waste factor is 10%.
                  </Typography>
                  <Typography variant="body2">
                    • Buying materials in bulk from the same supplier may qualify for discounts.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Material Dialog */}
      <Dialog open={materialDialog} onClose={() => { setMaterialDialog(false); setEditingMaterial(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add Material'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Material Name"
            fullWidth
            value={editingMaterial?.name || newMaterial.name || ''}
            onChange={(e) => editingMaterial 
              ? setEditingMaterial({ ...editingMaterial, name: e.target.value })
              : setNewMaterial({ ...newMaterial, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editingMaterial?.type || newMaterial.type}
                  onChange={(e) => editingMaterial
                    ? setEditingMaterial({ ...editingMaterial, type: e.target.value as Material['type'] })
                    : setNewMaterial({ ...newMaterial, type: e.target.value as Material['type'] })}
                >
                  {Object.entries(MATERIAL_TYPES).map(([key, val]) => (
                    <MenuItem key={key} value={key}>{val.icon} {val.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Thickness (inches)"
                type="number"
                fullWidth
                value={editingMaterial?.thickness || newMaterial.thickness}
                onChange={(e) => editingMaterial
                  ? setEditingMaterial({ ...editingMaterial, thickness: Number(e.target.value) })
                  : setNewMaterial({ ...newMaterial, thickness: Number(e.target.value) })}
                inputProps={{ step: 0.0625 }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Sheet Width (inches)"
                type="number"
                fullWidth
                value={editingMaterial?.sheetWidth || newMaterial.sheetWidth}
                onChange={(e) => editingMaterial
                  ? setEditingMaterial({ ...editingMaterial, sheetWidth: Number(e.target.value) })
                  : setNewMaterial({ ...newMaterial, sheetWidth: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Sheet Height (inches)"
                type="number"
                fullWidth
                value={editingMaterial?.sheetHeight || newMaterial.sheetHeight}
                onChange={(e) => editingMaterial
                  ? setEditingMaterial({ ...editingMaterial, sheetHeight: Number(e.target.value) })
                  : setNewMaterial({ ...newMaterial, sheetHeight: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Price per Sheet ($)"
            type="number"
            fullWidth
            value={editingMaterial?.pricePerSheet || newMaterial.pricePerSheet || ''}
            onChange={(e) => editingMaterial
              ? setEditingMaterial({ ...editingMaterial, pricePerSheet: Number(e.target.value) })
              : setNewMaterial({ ...newMaterial, pricePerSheet: Number(e.target.value) })}
            sx={{ mt: 2 }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Grain Direction</InputLabel>
            <Select
              value={editingMaterial?.grainDirection || newMaterial.grainDirection || 'none'}
              onChange={(e) => editingMaterial
                ? setEditingMaterial({ ...editingMaterial, grainDirection: e.target.value as any })
                : setNewMaterial({ ...newMaterial, grainDirection: e.target.value as any })}
            >
              <MenuItem value="none">No Grain</MenuItem>
              <MenuItem value="horizontal">Horizontal</MenuItem>
              <MenuItem value="vertical">Vertical</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Supplier"
            fullWidth
            value={editingMaterial?.supplier || newMaterial.supplier || ''}
            onChange={(e) => editingMaterial
              ? setEditingMaterial({ ...editingMaterial, supplier: e.target.value })
              : setNewMaterial({ ...newMaterial, supplier: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMaterialDialog(false); setEditingMaterial(null); }}>Cancel</Button>
          <Button onClick={addMaterial} variant="contained">
            {editingMaterial ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={partDialog} onClose={() => { setPartDialog(false); setEditingPart(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPart ? 'Edit Part' : 'Add Part'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Part Name"
            fullWidth
            value={editingPart?.name || newPart.name || ''}
            onChange={(e) => editingPart
              ? setEditingPart({ ...editingPart, name: e.target.value })
              : setNewPart({ ...newPart, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Material</InputLabel>
            <Select
              value={editingPart?.materialId || newPart.materialId || ''}
              onChange={(e) => editingPart
                ? setEditingPart({ ...editingPart, materialId: e.target.value })
                : setNewPart({ ...newPart, materialId: e.target.value })}
            >
              {project.materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>{MATERIAL_TYPES[m.type].icon} {m.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (inches)"
                type="number"
                fullWidth
                value={editingPart?.width || newPart.width || ''}
                onChange={(e) => editingPart
                  ? setEditingPart({ ...editingPart, width: Number(e.target.value) })
                  : setNewPart({ ...newPart, width: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (inches)"
                type="number"
                fullWidth
                value={editingPart?.height || newPart.height || ''}
                onChange={(e) => editingPart
                  ? setEditingPart({ ...editingPart, height: Number(e.target.value) })
                  : setNewPart({ ...newPart, height: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={editingPart?.quantity || newPart.quantity}
            onChange={(e) => editingPart
              ? setEditingPart({ ...editingPart, quantity: Number(e.target.value) })
              : setNewPart({ ...newPart, quantity: Number(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPartDialog(false); setEditingPart(null); }}>Cancel</Button>
          <Button onClick={addPart} variant="contained">
            {editingPart ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiMaterialProjectManager;