'use client';
/**
 * Localization Component
 * Search for local suppliers by zip code
 * View nearby stores with distances, pricing tiers, and availability
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Slider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  Divider,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  DirectionsCar as CarIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';

interface LocalSupplier {
  id: string;
  supplier_key: string;
  name: string;
  type: string;
  distance_miles: number;
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
  categories: string[];
  price_tier: string;
  store_url: string;
  search_url: string;
  in_stock_probability: number | null;
}

interface SearchResults {
  zip_code: string;
  coordinates: [number, number];
  suppliers: LocalSupplier[];
  total_count: number;
  by_type: Record<string, number>;
  recommendations: string[];
}

interface Category {
  value: string;
  label: string;
}

interface StoreType {
  value: string;
  label: string;
}

const PRICE_TIER_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  budget: 'success',
  mid: 'warning',
  premium: 'error',
  varies: 'default',
};

const STORE_TYPE_ICONS: Record<string, React.ReactElement> = {
  big_box: <StoreIcon />,
  hardware_chain: <StoreIcon />,
  specialty_woodworking: <StarIcon />,
  lumber_yard: <InventoryIcon />,
  online: <ShippingIcon />,
};

export const Localization: React.FC = () => {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [priceComparisonItem, setPriceComparisonItem] = useState('');
  const [priceComparison, setPriceComparison] = useState<any>(null);

  // Fetch categories and store types on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, typeRes] = await Promise.all([
          fetch('/api/localization/categories'),
          fetch('/api/localization/store-types'),
        ]);
        const catData = await catRes.json();
        const typeData = await typeRes.json();
        setCategories(catData.categories || []);
        setStoreTypes(typeData.store_types || []);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleSearch = async () => {
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        radius: radius.toString(),
        max_results: '20',
      });

      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }
      if (selectedStoreTypes.length > 0) {
        params.append('store_types', selectedStoreTypes.join(','));
      }

      const response = await fetch(
        `/api/localization/suppliers/${zipCode}?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceComparison = async () => {
    if (!zipCode || !priceComparisonItem) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ item: priceComparisonItem });
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories[0]);
      }

      const response = await fetch(
        `/api/localization/price-comparison/${zipCode}?${params}`
      );

      if (!response.ok) throw new Error('Failed to compare prices');

      const data = await response.json();
      setPriceComparison(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse geocode to get zip code
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            const zip = data.address?.postcode?.slice(0, 5);
            if (zip) setZipCode(zip);
          } catch (err) {
            console.error('Geocoding failed:', err);
          }
        },
        (err) => {
          setError('Could not get your location');
        }
      );
    }
  };

  const openStoreLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📍 Local Supplier Finder
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Find woodworking suppliers near you, compare prices, and check availability
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter zip code"
                InputProps={{
                  startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                onClick={handleGetCurrentLocation}
                startIcon={<LocationIcon />}
                fullWidth
              >
                Use My Location
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography gutterBottom>
                Search Radius: {radius} miles
              </Typography>
              <Slider
                value={radius}
                onChange={(_, v) => setRadius(v as number)}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5mi' },
                  { value: 25, label: '25mi' },
                  { value: 50, label: '50mi' },
                  { value: 100, label: '100mi' },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || zipCode.length < 5}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                fullWidth
                size="large"
              >
                Search
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Store Types</InputLabel>
                <Select
                  multiple
                  value={selectedStoreTypes}
                  onChange={(e) => setSelectedStoreTypes(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {storeTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <>
          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {results.recommendations.map((rec, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                  {rec}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">{results.total_count}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Stores Found
                </Typography>
              </Paper>
            </Grid>
            {Object.entries(results.by_type).map(([type, count]) => (
              <Grid item xs={6} sm={3} key={type}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mb: 2 }}
          >
            <Tab label="All Stores" />
            <Tab label="By Category" />
            <Tab label="Price Comparison" />
          </Tabs>

          {/* All Stores Tab */}
          {activeTab === 0 && (
            <List>
              {results.suppliers.map((supplier) => (
                <Card key={supplier.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {STORE_TYPE_ICONS[supplier.type] || <StoreIcon />}
                          <Box>
                            <Typography variant="h6">{supplier.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {supplier.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CarIcon fontSize="small" color="action" />
                          <Typography>{supplier.distance_miles.toFixed(1)} mi</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Chip
                          label={supplier.price_tier}
                          color={PRICE_TIER_COLORS[supplier.price_tier] || 'default'}
                          size="small"
                          icon={<MoneyIcon />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {supplier.phone && (
                            <Tooltip title={supplier.phone}>
                              <IconButton size="small" href={`tel:${supplier.phone}`}>
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Visit Store">
                            <IconButton
                              size="small"
                              onClick={() => openStoreLink(supplier.store_url || supplier.search_url)}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {supplier.categories.map((cat) => (
                            <Chip key={cat} label={cat.replace('_', ' ')} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Grid>
                      {supplier.in_stock_probability && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            📦 In-stock probability: {Math.round(supplier.in_stock_probability * 100)}%
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}

          {/* By Category Tab */}
          {activeTab === 1 && (
            <Box>
              {selectedCategories.length > 0 ? (
                selectedCategories.map((category) => {
                  const suppliersInCategory = results.suppliers.filter((s) =>
                    s.categories.includes(category)
                  );
                  return (
                    <Accordion key={category} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                          {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} ({suppliersInCategory.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {suppliersInCategory.map((supplier) => (
                            <ListItem key={supplier.id}>
                              <ListItemText
                                primary={supplier.name}
                                secondary={`${supplier.distance_miles.toFixed(1)} mi • ${supplier.price_tier}`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={() => openStoreLink(supplier.store_url || supplier.search_url)}
                                >
                                  <OpenInNewIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              ) : (
                <Alert severity="info">
                  Select categories above to see stores grouped by category
                </Alert>
              )}
            </Box>
          )}

          {/* Price Comparison Tab */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compare Prices Across Suppliers
                </Typography>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Item to compare"
                      value={priceComparisonItem}
                      onChange={(e) => setPriceComparisonItem(e.target.value)}
                      placeholder="e.g., 3/4 inch plywood, cabinet hinges, drawer slides"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      onClick={handlePriceComparison}
                      disabled={loading || !priceComparisonItem}
                      startIcon={<CompareIcon />}
                      fullWidth
                    >
                      Compare
                    </Button>
                  </Grid>
                </Grid>

                {priceComparison && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Results for "{priceComparison.item}"
                    </Typography>

                    {priceComparison.local_stores?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Local Stores
                        </Typography>
                        <List dense>
                          {priceComparison.local_stores.map((store: any, i: number) => (
                            <ListItem key={i}>
                              <ListItemText
                                primary={store.store_name}
                                secondary={`${store.distance} mi • ${store.price_tier} pricing • ${Math.round(store.in_stock_probability * 100)}% in-stock`}
                              />
                              <Button
                                size="small"
                                href={store.search_link}
                                target="_blank"
                              >
                                Check Price
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {priceComparison.online_options?.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2">
                          Online Options
                        </Typography>
                        <List dense>
                          {priceComparison.online_options.map((option: any, i: number) => (
                            <ListItem key={i}>
                              <ListItemText
                                primary={option.name}
                                secondary={option.fast_shipping ? 'Fast shipping available' : 'Standard shipping'}
                              />
                              <Button
                                size="small"
                                href={option.search_link}
                                target="_blank"
                              >
                                Check Price
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {priceComparison.recommendations?.length > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {priceComparison.recommendations.map((rec: string, i: number) => (
                          <Typography key={i} variant="body2">{rec}</Typography>
                        ))}
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Links */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Links to Popular Suppliers
          </Typography>
          <Grid container spacing={1}>
            {[
              { name: 'Home Depot', url: 'https://www.homedepot.com', type: 'Big Box' },
              { name: "Lowe's", url: 'https://www.lowes.com', type: 'Big Box' },
              { name: 'Rockler', url: 'https://www.rockler.com', type: 'Specialty' },
              { name: 'Woodcraft', url: 'https://www.woodcraft.com', type: 'Specialty' },
              { name: 'McMaster-Carr', url: 'https://www.mcmaster.com', type: 'Online' },
              { name: 'Amazon', url: 'https://www.amazon.com', type: 'Online' },
            ].map((supplier) => (
              <Grid item key={supplier.name}>
                <Chip
                  label={`${supplier.name} (${supplier.type})`}
                  onClick={() => window.open(supplier.url, '_blank')}
                  variant="outlined"
                  icon={<OpenInNewIcon />}
                  clickable
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Localization;
