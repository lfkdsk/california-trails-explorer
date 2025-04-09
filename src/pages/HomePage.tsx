import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Container, Paper } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TerrainIcon from '@mui/icons-material/Terrain';
import StarIcon from '@mui/icons-material/Star';
import { useDatabase } from '../contexts/DatabaseContext';
import MapComponent from '../components/MapComponent';

const HomePage = () => {
  const { executeQuery } = useDatabase();
  const [featuredTrails, setFeaturedTrails] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTrails: 0,
    avgRating: 0,
    avgLength: 0,
    avgElevation: 0,
  });

  useEffect(() => {
    // Get featured trails (high rating, high review count)
    const trails = executeQuery(`
      SELECT * FROM trail_summary 
      WHERE Rating >= 4.7 AND Review_Count > 1000
      ORDER BY Review_Count DESC
      LIMIT 6
    `);
    setFeaturedTrails(trails);

    // Get statistics
    const totalTrails = executeQuery('SELECT COUNT(*) as count FROM trails')[0].count;
    const avgRating = executeQuery('SELECT AVG(Rating) as avg FROM trails')[0].avg;
    const avgLength = executeQuery('SELECT AVG(Distance) as avg FROM trails')[0].avg;
    const avgElevation = executeQuery('SELECT AVG(Elevation_Gain) as avg FROM trails')[0].avg;

    setStats({
      totalTrails,
      avgRating,
      avgLength,
      avgElevation,
    });
  }, [executeQuery]);

  // Get all trail coordinates for the map
  const trailLocations = executeQuery(`
    SELECT Unique_Id, Trail_Name, Latitude, Longitude, Rating, Difficulty_Category 
    FROM trail_summary
    LIMIT 1000
  `);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }} className="text-center">
        <Typography variant="h2" component="h1" gutterBottom className="text-4xl font-bold mb-4">
          探索加州徒步路线
        </Typography>
        <Typography variant="h5" component="p" gutterBottom className="text-xl text-gray-600 mb-8">
          发现超过 {stats.totalTrails.toLocaleString()} 条精彩徒步路线，规划您的下一次户外冒险
        </Typography>

        <Grid container spacing={4} className="mb-8">
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="glassmorphism h-full">
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  浏览地图
                </Typography>
                <Typography variant="body1" paragraph>
                  在交互式地图上查看所有徒步路线，按位置、难度和长度筛选。
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapComponent 
                    locations={trailLocations} 
                    height="300px" 
                    zoom={6} 
                    center={{ lat: 37.8, lng: -119.5 }} 
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    component={Link} 
                    to="/map" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    fullWidth
                  >
                    打开完整地图
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="glassmorphism h-full">
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  徒步数据统计
                </Typography>
                <Typography variant="body1" paragraph>
                  加州徒步路线的主要数据统计和分析。
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2, flexGrow: 1 }}>
                  <Grid item xs={6}>
                    <Card elevation={0} className="glassmorphism">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          总路线数
                        </Typography>
                        <Typography variant="h4">
                          {stats.totalTrails.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card elevation={0} className="glassmorphism">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          平均评分
                        </Typography>
                        <Typography variant="h4">
                          {stats.avgRating.toFixed(1)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card elevation={0} className="glassmorphism">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          平均长度
                        </Typography>
                        <Typography variant="h4">
                          {stats.avgLength.toFixed(1)} 英里
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card elevation={0} className="glassmorphism">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          平均海拔增益
                        </Typography>
                        <Typography variant="h4">
                          {stats.avgElevation.toFixed(0)} 英尺
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Button 
                  component={Link} 
                  to="/analysis" 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  fullWidth
                >
                  查看详细分析
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h4" component="h2" gutterBottom className="text-2xl font-bold mt-12 mb-6">
          精选徒步路线
        </Typography>
        <Grid container spacing={3}>
          {featuredTrails.map((trail) => (
            <Grid item key={trail.Unique_Id} xs={12} sm={6} md={4}>
              <Card elevation={0} className="trail-card h-full">
                <CardMedia
                  component="img"
                  height="140"
                  image={trail.Cover_Photo || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={trail.Trail_Name}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {trail.Trail_Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {trail.Area}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2" component="span">
                      {trail.Rating.toFixed(1)} ({trail.Review_Count.toLocaleString()} 条评论)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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

        <Box sx={{ mt: 6, mb: 4 }} className="text-center">
          <Button 
            component={Link}
            to="/list"
            variant="contained" 
            color="primary" 
            size="large"
          >
            浏览所有路线
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;