import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  TextField, 
  InputAdornment, 
  Pagination, 
  Slider, 
  Rating, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TerrainIcon from '@mui/icons-material/Terrain';
import StarIcon from '@mui/icons-material/Star';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useDatabase } from '../contexts/DatabaseContext';

const ListPage = () => {
  const { executeQuery } = useDatabase();
  const [filteredTrails, setFilteredTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 12;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState<number[]>([0, 100]);
  const [elevationRange, setElevationRange] = useState<number[]>([0, 10000]);
  const [rating, setRating] = useState<number>(0);
  const [trailTypes, setTrailTypes] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Sort states
  const [sortField, setSortField] = useState('Rating');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

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
    setLoading(true);
    
    // Build base query
    let countQuery = `
      SELECT COUNT(*) as count FROM trail_summary
      WHERE 1=1
    `;
    
    let dataQuery = `
      SELECT * FROM trail_summary
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Add search term filter
    if (searchTerm) {
      const searchFilter = ` AND (Trail_Name LIKE ? OR Area LIKE ?)`;
      countQuery += searchFilter;
      dataQuery += searchFilter;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // Add difficulty filter
    if (difficulty.length > 0) {
      const difficultyFilter = ` AND Difficulty_Category IN (${difficulty.map(() => '?').join(',')})`;
      countQuery += difficultyFilter;
      dataQuery += difficultyFilter;
      params.push(...difficulty);
    }
    
    // Add distance range filter
    const distanceFilter = ` AND Distance BETWEEN ? AND ?`;
    countQuery += distanceFilter;
    dataQuery += distanceFilter;
    params.push(distanceRange[0], distanceRange[1]);
    
    // Add elevation range filter
    const elevationFilter = ` AND Elevation_Gain BETWEEN ? AND ?`;
    countQuery += elevationFilter;
    dataQuery += elevationFilter;
    params.push(elevationRange[0], elevationRange[1]);
    
    // Add rating filter
    if (rating > 0) {
      const ratingFilter = ` AND Rating >= ?`;
      countQuery += ratingFilter;
      dataQuery += ratingFilter;
      params.push(rating);
    }
    
    // Add trail type filter
    if (trailTypes.length > 0) {
      const trailTypeFilter = ` AND Trail_Type_Category IN (${trailTypes.map(() => '?').join(',')})`;
      countQuery += trailTypeFilter;
      dataQuery += trailTypeFilter;
      params.push(...trailTypes);
    }
    
    // Add area filter
    if (selectedAreas.length > 0) {
      const areaFilter = ` AND Area IN (${selectedAreas.map(() => '?').join(',')})`;
      countQuery += areaFilter;
      dataQuery += areaFilter;
      params.push(...selectedAreas);
    }
    
    // Add sort
    dataQuery += ` ORDER BY ${sortField} ${sortDirection}`;
    
    // Add pagination
    const offset = (page - 1) * rowsPerPage;
    dataQuery += ` LIMIT ${rowsPerPage} OFFSET ${offset}`;
    
    // Execute count query
    const countResult = executeQuery(countQuery, [...params]);
    const totalCount = countResult[0]?.count || 0;
    setTotalPages(Math.ceil(totalCount / rowsPerPage));
    
    // Execute data query
    const dataParams = [...params];
    const results = executeQuery(dataQuery, dataParams);
    setFilteredTrails(results);
    setLoading(false);
  }, [
    executeQuery, 
    searchTerm, 
    difficulty, 
    distanceRange, 
    elevationRange, 
    rating, 
    trailTypes, 
    selectedAreas,
    sortField,
    sortDirection,
    page,
    rowsPerPage
  ]);

  useEffect(() => {
    loadTrails();
  }, [loadTrails, page, sortField, sortDirection]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
    handleSortClose();
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    handleFilterClose();
    loadTrails();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDifficulty([]);
    setDistanceRange([0, 100]);
    setElevationRange([0, 10000]);
    setRating(0);
    setTrailTypes([]);
    setSelectedAreas([]);
    setPage(1);
    handleFilterClose();
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

  const getSortLabel = () => {
    switch (sortField) {
      case 'Rating':
        return '评分';
      case 'Distance':
        return '距离';
      case 'Elevation_Gain':
        return '海拔增益';
      case 'Review_Count':
        return '评论数量';
      case 'Trail_Name':
        return '名称';
      default:
        return '评分';
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        浏览徒步路线
      </Typography>

      {/* Search and Filter Bar */}
      <Paper elevation={0} className="glassmorphism" sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="搜索路线名称或区域"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              fullWidth
            >
              筛选
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  width: 320,
                  maxHeight: '80vh',
                  overflow: 'auto',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
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
                <Button variant="contained" onClick={handleApplyFilters}>
                  应用筛选
                </Button>
              </Box>
            </Menu>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              fullWidth
            >
              排序: {getSortLabel()} {sortDirection === 'ASC' ? '↑' : '↓'}
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handleSort('Rating')}>
                <ListItemIcon>
                  <StarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>按评分排序</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSort('Distance')}>
                <ListItemIcon>
                  <DirectionsWalkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>按距离排序</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSort('Elevation_Gain')}>
                <ListItemIcon>
                  <TerrainIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>按海拔增益排序</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSort('Review_Count')}>
                <ListItemIcon>
                  {sortDirection === 'ASC' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>按评论数量排序</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSort('Trail_Name')}>
                <ListItemIcon>
                  <SortByAlphaIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>按名称排序</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">
          总计 {totalPages * rowsPerPage} 条路线，显示第 {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, totalPages * rowsPerPage)} 条
        </Typography>
      </Box>

      {/* Trail Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTrails.map((trail) => (
            <Grid item key={trail.Unique_Id} xs={12} sm={6} md={4} lg={3}>
              <Card elevation={0} className="trail-card h-full">
                <CardMedia
                  component="img"
                  height="140"
                  image={trail.Cover_Photo || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={trail.Trail_Name}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom noWrap title={trail.Trail_Name}>
                    {trail.Trail_Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom noWrap title={trail.Area}>
                    {trail.Area}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2" component="span">
                      {trail.Rating.toFixed(1)} ({trail.Review_Count.toLocaleString()} 条评论)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<DirectionsWalkIcon />} 
                      label={`${trail.Distance.toFixed(1)} 英里`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      icon={<TerrainIcon />} 
                      label={`${trail.Elevation_Gain.toFixed(0)} 英尺`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  <Chip 
                    label={trail.Difficulty_Category} 
                    size="small" 
                    color={
                      trail.Difficulty_Category === '简单' ? 'success' : 
                      trail.Difficulty_Category === '中等' ? 'primary' : 
                      trail.Difficulty_Category === '困难' ? 'warning' : 'error'
                    }
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={trail.Trail_Type_Category} 
                    size="small" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      component={Link}
                      to={`/details/${trail.Unique_Id}`}
                      variant="outlined" 
                      size="small"
                      fullWidth
                    >
                      查看详情
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            showFirstButton 
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ListPage;