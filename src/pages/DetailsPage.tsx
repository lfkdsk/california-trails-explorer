import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TerrainIcon from '@mui/icons-material/Terrain';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import { useDatabase } from '../contexts/DatabaseContext';
import MapComponent from '../components/MapComponent';

const DetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { executeQuery } = useDatabase();
  const [trail, setTrail] = useState<any | null>(null);
  const [similarTrails, setSimilarTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrailDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get trail details
        const trailResult = executeQuery('SELECT * FROM trails WHERE Unique_Id = ?', [id]);
        
        if (trailResult.length === 0) {
          setError('未找到该徒步路线');
          setLoading(false);
          return;
        }

        const trailData = trailResult[0];
        setTrail(trailData);

        // Get similar trails (same area, similar difficulty)
        const similarResults = executeQuery(`
          SELECT * FROM trail_summary 
          WHERE Area = ? 
          AND Unique_Id != ? 
          AND ABS(Difficulty - ?) <= 2
          ORDER BY Rating DESC
          LIMIT 4
        `, [trailData.Area, id, trailData.Difficulty]);

        setSimilarTrails(similarResults);
      } catch (err) {
        console.error('Error loading trail details:', err);
        setError('加载路线详情时出错');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTrailDetails();
    }
  }, [id, executeQuery]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trail) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || '未找到路线信息'}
        </Alert>
        <Button component={Link} to="/list" startIcon={<ArrowBackIcon />}>
          返回路线列表
        </Button>
      </Box>
    );
  }

  // Format difficulty text
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return '简单';
      case 3:
        return '中等';
      case 5:
        return '困难';
      case 7:
        return '极难';
      default:
        return '未知';
    }
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    if (!minutes) return '未知';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} 分钟`;
    } else if (mins === 0) {
      return `${hours} 小时`;
    } else {
      return `${hours} 小时 ${mins} 分钟`;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Button 
        component={Link} 
        to="/list" 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        返回路线列表
      </Button>

      {/* Hero Section */}
      <Paper 
        elevation={0} 
        className="glassmorphism"
        sx={{ 
          p: 0, 
          mb: 4, 
          overflow: 'hidden',
          position: 'relative',
          minHeight: '300px'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${trail.Cover_Photo || 'https://via.placeholder.com/1200x400?text=No+Image'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            opacity: 0.7,
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            {trail.Trail_Name}
          </Typography>
          <Typography variant="h6" component="p" gutterBottom>
            {trail.Area}, 加州
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={trail.Rating} precision={0.1} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {trail.Rating.toFixed(1)} ({trail.Review_Count.toLocaleString()} 条评论)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={getDifficultyText(trail.Difficulty)} 
              color={
                trail.Difficulty === 1 ? 'success' : 
                trail.Difficulty === 3 ? 'primary' : 
                trail.Difficulty === 5 ? 'warning' : 'error'
              }
            />
            <Chip 
              icon={<DirectionsWalkIcon />} 
              label={`${trail.Distance.toFixed(1)} 英里`} 
              variant="outlined" 
            />
            <Chip 
              icon={<TerrainIcon />} 
              label={`${trail.Elevation_Gain.toFixed(0)} 英尺海拔增益`} 
              variant="outlined" 
            />
            <Chip 
              icon={<AccessTimeIcon />} 
              label={`预计时间: ${formatDuration(trail.Est_Hike_Duration)}`} 
              variant="outlined" 
            />
            <Chip 
              icon={<FlagIcon />} 
              label={`${trail.Trail_Type || '未知路线类型'}`} 
              variant="outlined" 
            />
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column - Map and Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} className="glassmorphism" sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
            <Box sx={{ height: '400px' }}>
              <MapComponent 
                locations={[trail]} 
                height="100%" 
                zoom={14}
                center={{ lat: trail.Latitude, lng: trail.Longitude }}
                selectedTrail={trail}
              />
            </Box>
          </Paper>

          <Paper elevation={0} className="glassmorphism" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              路线详情
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>距离:</strong> {trail.Distance.toFixed(1)} 英里
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>海拔增益:</strong> {trail.Elevation_Gain.toFixed(0)} 英尺
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>路线类型:</strong> {trail.Trail_Type || '未知'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>难度级别:</strong> {getDifficultyText(trail.Difficulty)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>最高点:</strong> {trail.Highest_Point || '未知'} 英尺
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>预计徒步时间:</strong> {formatDuration(trail.Est_Hike_Duration)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>需要许可证:</strong> {trail.Permits ? '是' : '否'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>数据来源:</strong> {trail.Source}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                component="a"
                href={trail.Url}
                target="_blank"
                rel="noopener noreferrer"
              >
                在 AllTrails 上查看
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Similar Trails */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} className="glassmorphism" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              附近的路线
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {similarTrails.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {similarTrails.map((similarTrail) => (
                  <Card 
                    key={similarTrail.Unique_Id} 
                    elevation={0} 
                    sx={{ 
                      display: 'flex',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 100 }}
                      image={similarTrail.Cover_Photo || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={similarTrail.Trail_Name}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <CardContent sx={{ flex: '1 0 auto', py: 1 }}>
                        <Typography variant="subtitle1" component="div" noWrap>
                          {similarTrail.Trail_Name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={similarTrail.Rating} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {similarTrail.Rating.toFixed(1)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${similarTrail.Distance.toFixed(1)} 英里`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={getDifficultyText(similarTrail.Difficulty)} 
                            size="small"
                            color={
                              similarTrail.Difficulty === 1 ? 'success' : 
                              similarTrail.Difficulty === 3 ? 'primary' : 
                              similarTrail.Difficulty === 5 ? 'warning' : 'error'
                            }
                          />
                        </Box>
                      </CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                        <Button 
                          component={Link}
                          to={`/details/${similarTrail.Unique_Id}`}
                          size="small"
                        >
                          查看详情
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">
                未找到相似路线
              </Typography>
            )}
          </Paper>

          <Paper elevation={0} className="glassmorphism" sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              位置信息
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              <strong>区域:</strong> {trail.Area || '未知区域'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>州:</strong> {trail.State || '加州'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>国家:</strong> {trail.Country || '美国'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>坐标:</strong> {trail.Latitude.toFixed(6)}, {trail.Longitude.toFixed(6)}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined"
                component="a"
                href={`https://www.google.com/maps/search/?api=1&query=${trail.Latitude},${trail.Longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
              >
                在 Google 地图中打开
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetailsPage;