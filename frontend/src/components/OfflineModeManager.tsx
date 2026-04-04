'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Chip, Switch, FormControlLabel, Tabs, Tab, 
  Alert, Tooltip, IconButton, LinearProgress, Divider,
  Snackbar, Badge, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoIcon from '@mui/icons-material/Info';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface OfflineData {
  id: string;
  type: 'project' | 'template' | 'material' | 'hardware';
  name: string;
  data: any;
  savedAt: string;
  syncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  size: number;
}

interface SyncConflict {
  id: string;
  local: OfflineData;
  remote: any;
  conflictType: 'modified' | 'deleted';
}

interface OfflineManagerState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
  storageUsed: number;
  storageLimit: number;
}

const OfflineModeManager: React.FC = () => {
  const [state, setState] = useState<OfflineManagerState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    conflicts: [],
    storageUsed: 0,
    storageLimit: 50 * 1024 * 1024 // 50MB
  });

  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [syncDialog, setSyncDialog] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);

  // Register service worker and setup offline capabilities
  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setState(s => ({ ...s, isOnline: true }));
    const handleOffline = () => setState(s => ({ ...s, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Load offline data from IndexedDB
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    // In a real app, this would load from IndexedDB
    const mockData: OfflineData[] = [
      {
        id: '1',
        type: 'project',
        name: 'Kitchen Renovation',
        data: { /* project data */ },
        savedAt: new Date(Date.now() - 3600000).toISOString(),
        syncedAt: new Date(Date.now() - 7200000).toISOString(),
        syncStatus: 'synced',
        size: 125000
      },
      {
        id: '2',
        type: 'template',
        name: 'Base Cabinet Template',
        data: { /* template data */ },
        savedAt: new Date(Date.now() - 86400000).toISOString(),
        syncedAt: undefined,
        syncStatus: 'pending',
        size: 45000
      }
    ];
    setOfflineData(mockData);
    
    const totalSize = mockData.reduce((sum, d) => sum + d.size, 0);
    const pending = mockData.filter(d => d.syncStatus === 'pending').length;
    setState(s => ({ ...s, storageUsed: totalSize, pendingChanges: pending }));
  };

  const syncNow = useCallback(async () => {
    if (!state.isOnline || state.isSyncing) return;

    setState(s => ({ ...s, isSyncing: true }));

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update sync status
      setOfflineData(prev => prev.map(d => ({
        ...d,
        syncStatus: 'synced' as const,
        syncedAt: new Date().toISOString()
      })));

      setState(s => ({
        ...s,
        isSyncing: false,
        lastSync: new Date().toISOString(),
        pendingChanges: 0,
        conflicts: []
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setState(s => ({ ...s, isSyncing: false }));
    }
  }, [state.isOnline, state.isSyncing]);

  const resolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    // In a real app, this would resolve the conflict in IndexedDB
    setOfflineData(prev => prev.map(d => {
      if (d.id === conflictId) {
        return {
          ...d,
          syncStatus: 'synced' as const,
          syncedAt: new Date().toISOString()
        };
      }
      return d;
    }));
    setState(s => ({
      ...s,
      conflicts: s.conflicts.filter(c => c.id !== conflictId)
    }));
    setSyncDialog(false);
  };

  const deleteOfflineData = (id: string) => {
    setOfflineData(prev => prev.filter(d => d.id !== id));
    const deletedItem = offlineData.find(d => d.id === id);
    if (deletedItem) {
      setState(s => ({ ...s, storageUsed: s.storageUsed - deletedItem.size }));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const storagePercentage = (state.storageUsed / state.storageLimit) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Offline Mode & Sync
      </Typography>

      {/* Status Banner */}
      <Alert 
        severity={state.isOnline ? 'success' : 'warning'}
        icon={state.isOnline ? <WifiIcon /> : <WifiOffIcon />}
        sx={{ mb: 3 }}
        action={
          state.isOnline && state.pendingChanges > 0 && (
            <Button color="inherit" size="small" onClick={syncNow} startIcon={<CloudSyncIcon />}>
              Sync Now
            </Button>
          )
        }
      >
        {state.isOnline 
          ? `Online • ${state.pendingChanges} pending change${state.pendingChanges !== 1 ? 's' : ''} awaiting sync`
          : 'Offline • Changes will be saved locally and synced when back online'
        }
      </Alert>

      {/* Conflicts Alert */}
      {state.conflicts.length > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setSyncDialog(true)}>
              Resolve
            </Button>
          }
        >
          {state.conflicts.length} sync conflict{state.conflicts.length !== 1 ? 's' : ''} need{state.conflicts.length === 1 ? 's' : ''} resolution
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Status Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Status</Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {state.isOnline ? <WifiIcon color="success" /> : <WifiOffIcon color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary={state.isOnline ? 'Connected' : 'Offline'} 
                  secondary={state.isOnline ? 'All features available' : 'Limited functionality'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {state.isSyncing 
                    ? <CloudSyncIcon color="primary" className="rotating" /> 
                    : <CloudDoneIcon color="success" />}
                </ListItemIcon>
                <ListItemText 
                  primary={state.isSyncing ? 'Syncing...' : 'Last Sync'}
                  secondary={state.lastSync ? formatDate(state.lastSync) : 'Never'}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Storage Used
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={storagePercentage} 
              color={storagePercentage > 80 ? 'warning' : 'primary'}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">
              {formatBytes(state.storageUsed)} / {formatBytes(state.storageLimit)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={syncNow}
              disabled={!state.isOnline || state.isSyncing || state.pendingChanges === 0}
              startIcon={state.isSyncing ? undefined : <CloudSyncIcon />}
            >
              {state.isSyncing ? 'Syncing...' : `Sync ${state.pendingChanges} Change${state.pendingChanges !== 1 ? 's' : ''}`}
            </Button>
          </Paper>
        </Grid>

        {/* Offline Data List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`All (${offlineData.length})`} />
              <Tab label={`Pending (${offlineData.filter(d => d.syncStatus === 'pending').length})`} />
              <Tab label="Settings" />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <List>
                  {offlineData.map((item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <Box>
                          {item.syncStatus === 'pending' && (
                            <Tooltip title="Pending sync">
                              <WarningIcon color="warning" sx={{ mr: 1 }} />
                            </Tooltip>
                          )}
                          {item.syncStatus === 'synced' && (
                            <Tooltip title="Synced">
                              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                            </Tooltip>
                          )}
                          <IconButton edge="end" onClick={() => deleteOfflineData(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        {item.type === 'project' && '📁'}
                        {item.type === 'template' && '📋'}
                        {item.type === 'material' && '🪵'}
                        {item.type === 'hardware' && '🔧'}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            Saved: {formatDate(item.savedAt)}
                            {item.syncedAt && ` • Synced: ${formatDate(item.syncedAt)}`}
                            {' • '}{formatBytes(item.size)}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                {offlineData.filter(d => d.syncStatus === 'pending').length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    No pending changes
                  </Typography>
                ) : (
                  <List>
                    {offlineData.filter(d => d.syncStatus === 'pending').map((item) => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={`Saved offline: ${formatDate(item.savedAt)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Offline Settings</Typography>
                
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable offline mode"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Save projects locally for offline access
                </Typography>

                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-sync when online"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Automatically sync changes when connection is restored
                </Typography>

                <FormControlLabel
                  control={<Switch />}
                  label="Download all templates offline"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Keep all templates available offline (increases storage usage)
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Storage Management</Typography>
                
                <Button variant="outlined" startIcon={<DeleteIcon />} sx={{ mr: 1 }}>
                  Clear Cache
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />}>
                  Export Offline Data
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Conflict Resolution Dialog */}
      <Dialog open={syncDialog} onClose={() => setSyncDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Sync Conflicts</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            The following items have conflicting changes between your local device and the server.
          </Typography>

          <List>
            {state.conflicts.map((conflict) => (
              <ListItem key={conflict.id}>
                <ListItemText
                  primary={conflict.local.name}
                  secondary={`Conflict: ${conflict.conflictType}`}
                />
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                  onClick={() => resolveConflict(conflict.id, 'local')}
                >
                  Keep Local
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => resolveConflict(conflict.id, 'remote')}
                >
                  Use Server
                </Button>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => resolveConflict(conflict.id, 'merge')}
                >
                  Merge
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Sync Snackbar */}
      <Snackbar
        open={state.isSyncing}
        message="Syncing changes..."
        action={<LinearProgress sx={{ width: 100 }} />}
      />
    </Box>
  );
};

export default OfflineModeManager;