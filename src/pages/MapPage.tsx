import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Slider, 
  TextField, 
  Button, 
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Card,
  CardContent,
  Rating
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TerrainIcon from '@mui/icons-material/Terrain';
import { useDatabase } from '../contexts/DatabaseContext';
import MapComponent from '../components/MapComponent';

const MapPage = () => {
  const { executeQuery } = useDatabase();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [filteredTrails, setFilteredTrails] = useState<any[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mapCenter, setMapCenter] = useState({ lat: 37.8, lng: -119.5 });
  const [mapZoom, setMapZoom] = useState(6);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState<number[]>([0, 100]);
  const [elevationRange, setElevationRange] = useState<number[]>([0, 10000]);
  const [rating, setRating] = useState<number>(0);
  const [trailTypes, setTrailTypes] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Filter options
  const [areas, setAreas] = useState<string[]>([]);
  const difficultyOptions = ['简单', '中等', '困难', '极难'];
  const trailTypeOptions = ['Loop', 'Out & Back', 'Point to Point'];

  useEffect(() => {
    // Load filter options
    const topAreas = executeQuery(`
      SELECT Area, COUNT(*) as count 
      FROM trails 
      GROUP BY Area 
      ORDER BY count DESC 
      LIMIT 50
    `).map(row => row.Area);
    setAreas(topAreas);

    // Initial data load
    loadTrails();
  }, [executeQuery]);

  const loadTrails = useCallback(() => {
    // Build base query
    let query = `
      SELECT * FROM trail_summary
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Add search term filter
    if (searchTerm) {
      query += ` AND (Trail_Name LIKE ? OR Area LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // Add difficulty filter
    if (difficulty.length > 0) {
      query += ` AND Difficulty_Category IN (${difficulty.map(() => '?').join(',')})`;
      params.push(...difficulty);
    }
    
    // Add distance range filter
    query += ` AND Distance BETWEEN ? AND ?`;
    params.push(distanceRange[0], distanceRange[1]);
    
    // Add elevation range filter
    query += ` AND Elevation_Gain BETWEEN ? AND ?`;
    params.push(elevationRange[0], elevationRange[1]);
    
    // Add rating filter
    if (rating > 0) {
      query += ` AND Rating >= ?`;
      params.push(rating);
    }
    
    // Add trail type filter
    if (trailTypes.length > 0) {
      query += ` AND Trail_Type_Category IN (${trailTypes.map(() => '?').join(',')})`;
      params.push(...trailTypes);
    }
    
    // Add area filter
    if (selectedAreas.length > 0) {
      query += ` AND Area IN (${selectedAreas.map(() => '?').join(',')})`;
      params.push(...selectedAreas);
    }
    
    // Add limit
    query += ` LIMIT 1000`;
    
    // Execute query
    const results = executeQuery(query, params);
    setFilteredTrails(results);
  }, [
    executeQuery, 
    searchTerm, 
    difficulty, 
    distanceRange, 
    elevationRange, 
    rating, 
    trailTypes, 
    selectedAreas
  ]);

  useEffect(() => {
    loadTrails();
  }, [loadTrails]);

  const handleTrailClick = (trail: any) => {
    setSelectedTrail(trail);
    setMapCenter({ lat: trail.Latitude, lng: trail.Longitude });
    setMapZoom(14);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/details/${id}`);
  };

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDifficulty([]);
    setDistanceRange([0, 100]);
    setElevationRange([0, 10000]);
    setRating(0);
    setTrailTypes([]);
    setSelectedAreas([]);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleTrailTypeChange = (value: string) => {
    setTrailTypes(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleAreaChange = (value: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const drawerWidth = 320;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      {/* Filter Button for Mobile */}
      {isMobile && (
        <Box sx={{ position: 'absolute', top: 80, left: 16, zIndex: 1000 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={handleToggleDrawer}
            sx={{ borderRadius: '20px' }}
          >
            筛选
          </Button>
        </Box>
      )}

      {/* Filter Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: isMobile ? 'fixed' : 'relative',
            height: isMobile ? '100%' : 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">筛选条件</Typography>
            {isMobile && (
              <IconButton onClick={handleToggleDrawer}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="搜索路线名称或区域"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>难度级别</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {difficultyOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                clickable
                color={difficulty.includes(option) ? 'primary' : 'default'}
                onClick={() => handleDifficultyChange(option)}
                variant={difficulty.includes(option) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            距离范围 ({distanceRange[0]} - {distanceRange[1]} 英里)
          </Typography>
          <Slider
            value={distanceRange}
            onChange={(_, newValue) => setDistanceRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            海拔增益 ({elevationRange[0]} - {elevationRange[1]} 英尺)
          </Typography>
          <Slider
            value={elevationRange}
            onChange={(_, newValue) => setElevationRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>最低评分</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            precision={0.5}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>路线类型</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {trailTypeOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                clickable
                color={trailTypes.includes(option) ? 'primary' : 'default'}
                onClick={() => handleTrailTypeChange(option)}
                variant={trailTypes.includes(option) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>

          <Typography variant="subtitle1" gutterBottom>热门区域</Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 3 }}>
            {areas.slice(0, 15).map((area) => (
              <Chip
                key={area}
                label={area}
                size="small"
                clickable
                color={selectedAreas.includes(area) ? 'primary' : 'default'}
                onClick={() => handleAreaChange(area)}
                variant={selectedAreas.includes(area) ? 'filled' : 'outlined'}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleResetFilters}>
              重置
            </Button>
            <Button variant="contained" onClick={loadTrails}>
              应用筛选
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              找到 {filteredTrails.length} 条路线
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ml: isMobile || !drawerOpen ? 0 : `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        {/* Map Container */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <MapComponent 
            locations={filteredTrails}
            height="100%"
            zoom={mapZoom}
            center={mapCenter}
            onMarkerClick={handleTrailClick}
            selectedTrail={selectedTrail}
          />
        </Box>

        {/* Selected Trail Info */}
        {selectedTrail && (
          <Card 
            elevation={3}
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              width: isMobile ? 'calc(100% - 32px)' : '400px',
              maxWidth: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              zIndex: 1000,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {selectedTrail.Trail_Name}
                </Typography>
                <IconButton size="small" onClick={() => setSelectedTrail(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTrail.Area}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={selectedTrail.Rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {selectedTrail.Rating.toFixed(1)} ({selectedTrail.Review_Count})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<DirectionsWalkIcon />} 
                  label={`${selectedTrail.Distance.toFixed(1)} 英里`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<TerrainIcon />} 
                  label={`${selectedTrail.Elevation_Gain.toFixed(0)} 英尺`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={selectedTrail.Difficulty_Category} 
                  size="small" 
                  color={
                    selectedTrail.Difficulty_Category === '简单' ? 'success' : 
                    selectedTrail.Difficulty_Category === '中等' ? 'primary' : 
                    selectedTrail.Difficulty_Category === '困难' ? 'warning' : 'error'
                  }
                />
                <Chip 
                  label={selectedTrail.Trail_Type_Category} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => handleViewDetails(selectedTrail.Unique_Id)}
              >
                查看详情
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MapPage;