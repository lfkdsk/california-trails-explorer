import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useDatabase } from '../contexts/DatabaseContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Scatter } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `analysis-tab-${index}`,
    'aria-controls': `analysis-tabpanel-${index}`,
  };
}

const AnalysisPage = () => {
  const { executeQuery } = useDatabase();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrails: 0,
    avgRating: 0,
    avgLength: 0,
    avgElevation: 0,
    difficultyDistribution: {
      labels: [] as string[],
      data: [] as number[],
    },
    trailTypeDistribution: {
      labels: [] as string[],
      data: [] as number[],
    },
    lengthDistribution: {
      labels: [] as string[],
      data: [] as number[],
    },
    ratingDistribution: {
      labels: [] as string[],
      data: [] as number[],
    },
    topAreas: {
      labels: [] as string[],
      data: [] as number[],
    },
    lengthVsElevation: {
      data: [] as {x: number, y: number, difficulty: number}[],
    },
    ratingVsReviews: {
      data: [] as {x: number, y: number}[],
    }
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const loadAnalysisData = async () => {
      setLoading(true);

      try {
        // Basic statistics
        const totalTrails = executeQuery('SELECT COUNT(*) as count FROM trails')[0].count;
        const avgRating = executeQuery('SELECT AVG(Rating) as avg FROM trails')[0].avg;
        const avgLength = executeQuery('SELECT AVG(Distance) as avg FROM trails')[0].avg;
        const avgElevation = executeQuery('SELECT AVG(Elevation_Gain) as avg FROM trails')[0].avg;

        // Difficulty distribution
        const difficultyData = executeQuery(`
          SELECT Difficulty_Category as label, COUNT(*) as count 
          FROM trails 
          GROUP BY Difficulty_Category
          ORDER BY 
            CASE 
              WHEN Difficulty_Category = '简单' THEN 1
              WHEN Difficulty_Category = '中等' THEN 2
              WHEN Difficulty_Category = '困难' THEN 3
              WHEN Difficulty_Category = '极难' THEN 4
              ELSE 5
            END
        `);

        // Trail type distribution
        const trailTypeData = executeQuery(`
          SELECT Trail_Type_Category as label, COUNT(*) as count 
          FROM trails 
          GROUP BY Trail_Type_Category
          ORDER BY count DESC
        `);

        // Length distribution
        const lengthData = executeQuery(`
          SELECT Length_Category as label, COUNT(*) as count 
          FROM trails 
          GROUP BY Length_Category
          ORDER BY 
            CASE 
              WHEN Length_Category = '短距离 (<3英里)' THEN 1
              WHEN Length_Category = '中等距离 (3-7英里)' THEN 2
              WHEN Length_Category = '长距离 (7-15英里)' THEN 3
              WHEN Length_Category = '超长距离 (>15英里)' THEN 4
              ELSE 5
            END
        `);

        // Rating distribution
        const ratingData = executeQuery(`
          SELECT ROUND(Rating * 2) / 2 as rating_bin, COUNT(*) as count
          FROM trails
          WHERE Rating > 0
          GROUP BY rating_bin
          ORDER BY rating_bin
        `);

        // Top areas
        const topAreasData = executeQuery(`
          SELECT Area as label, COUNT(*) as count 
          FROM trails 
          GROUP BY Area
          ORDER BY count DESC
          LIMIT 10
        `);

        // Length vs Elevation with difficulty
        const lengthVsElevationData = executeQuery(`
          SELECT Distance as x, Elevation_Gain as y, Difficulty
          FROM trails
          WHERE Distance <= 50 AND Elevation_Gain <= 10000
          LIMIT 1000
        `);

        // Rating vs Reviews
        const ratingVsReviewsData = executeQuery(`
          SELECT Rating as y, Review_Count as x
          FROM trails
          WHERE Rating > 0 AND Review_Count > 0 AND Review_Count <= 5000
          LIMIT 1000
        `);

        setStats({
          totalTrails,
          avgRating,
          avgLength,
          avgElevation,
          difficultyDistribution: {
            labels: difficultyData.map(d => d.label),
            data: difficultyData.map(d => d.count),
          },
          trailTypeDistribution: {
            labels: trailTypeData.map(d => d.label),
            data: trailTypeData.map(d => d.count),
          },
          lengthDistribution: {
            labels: lengthData.map(d => d.label),
            data: lengthData.map(d => d.count),
          },
          ratingDistribution: {
            labels: ratingData.map(d => d.rating_bin.toString()),
            data: ratingData.map(d => d.count),
          },
          topAreas: {
            labels: topAreasData.map(d => d.label),
            data: topAreasData.map(d => d.count),
          },
          lengthVsElevation: {
            data: lengthVsElevationData.map(d => ({
              x: d.x,
              y: d.y,
              difficulty: d.Difficulty
            })),
          },
          ratingVsReviews: {
            data: ratingVsReviewsData.map(d => ({
              x: d.x,
              y: d.y
            })),
          }
        });
      } catch (err) {
        console.error('Error loading analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, [executeQuery]);

  // Chart configurations
  const difficultyChartData = {
    labels: stats.difficultyDistribution.labels,
    datasets: [
      {
        label: '路线数量',
        data: stats.difficultyDistribution.data,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const trailTypeChartData = {
    labels: stats.trailTypeDistribution.labels,
    datasets: [
      {
        label: '路线数量',
        data: stats.trailTypeDistribution.data,
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lengthChartData = {
    labels: stats.lengthDistribution.labels,
    datasets: [
      {
        label: '路线数量',
        data: stats.lengthDistribution.data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const ratingChartData = {
    labels: stats.ratingDistribution.labels,
    datasets: [
      {
        label: '路线数量',
        data: stats.ratingDistribution.data,
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topAreasChartData = {
    labels: stats.topAreas.labels,
    datasets: [
      {
        label: '路线数量',
        data: stats.topAreas.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lengthVsElevationChartData = {
    datasets: [
      {
        label: '简单',
        data: stats.lengthVsElevation.data.filter(d => d.difficulty === 1),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: '中等',
        data: stats.lengthVsElevation.data.filter(d => d.difficulty === 3),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: '困难',
        data: stats.lengthVsElevation.data.filter(d => d.difficulty === 5),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
      },
      {
        label: '极难',
        data: stats.lengthVsElevation.data.filter(d => d.difficulty === 7),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const ratingVsReviewsChartData = {
    datasets: [
      {
        label: '评分与评论数量关系',
        data: stats.ratingVsReviews.data,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '',
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '距离 (英里)',
        },
      },
      y: {
        title: {
          display: true,
          text: '海拔增益 (英尺)',
        },
      },
    },
  };

  const reviewsScatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '评论数量',
        },
        type: 'logarithmic' as const,
      },
      y: {
        title: {
          display: true,
          text: '评分',
        },
        min: 0,
        max: 5,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        加州徒步路线数据分析
      </Typography>
      <Typography variant="body1" paragraph>
        基于 {stats.totalTrails.toLocaleString()} 条徒步路线数据的统计分析和可视化。
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="stats-card">
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
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="stats-card">
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
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="stats-card">
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
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="stats-card">
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

      {/* Tabs for different chart categories */}
      <Paper elevation={0} className="glassmorphism">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="analysis tabs"
        >
          <Tab label="难度分布" {...a11yProps(0)} />
          <Tab label="路线类型" {...a11yProps(1)} />
          <Tab label="长度分布" {...a11yProps(2)} />
          <Tab label="评分分布" {...a11yProps(3)} />
          <Tab label="热门区域" {...a11yProps(4)} />
          <Tab label="长度与海拔" {...a11yProps(5)} />
          <Tab label="评分与评论" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            难度级别分布
          </Typography>
          <Typography variant="body2" paragraph>
            加州徒步路线按难度级别的分布情况，展示不同难度级别的路线数量。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Pie data={difficultyChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            路线类型分布
          </Typography>
          <Typography variant="body2" paragraph>
            加州徒步路线按类型的分布情况，包括环线、往返和点对点路线。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Pie data={trailTypeChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            路线长度分布
          </Typography>
          <Typography variant="body2" paragraph>
            加州徒步路线按长度范围的分布情况，展示不同长度范围的路线数量。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Bar options={barOptions} data={lengthChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            评分分布
          </Typography>
          <Typography variant="body2" paragraph>
            加州徒步路线的评分分布情况，展示不同评分范围的路线数量。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Bar options={barOptions} data={ratingChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            热门徒步区域
          </Typography>
          <Typography variant="body2" paragraph>
            加州最热门的徒步区域，按照区域内路线数量排序。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Bar options={barOptions} data={topAreasChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            路线长度与海拔增益关系
          </Typography>
          <Typography variant="body2" paragraph>
            散点图展示路线长度与海拔增益之间的关系，按难度级别分类。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Scatter options={scatterOptions} data={lengthVsElevationChartData} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            评分与评论数量关系
          </Typography>
          <Typography variant="body2" paragraph>
            散点图展示路线评分与评论数量之间的关系，探索用户评价模式。
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 400 }}>
            <Scatter options={reviewsScatterOptions} data={ratingVsReviewsChartData} />
          </Box>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          分析结论
        </Typography>
        <Typography variant="body1" paragraph>
          通过对加州 {stats.totalTrails.toLocaleString()} 条徒步路线的分析，我们可以得出以下结论：
        </Typography>
        <Typography variant="body1" component="ul" sx={{ pl: 2 }}>
          <li>中等难度的路线数量最多，占总数的很大一部分。</li>
          <li>往返型路线是最常见的路线类型，其次是环线。</li>
          <li>大多数路线的长度在 3-7 英里之间，适合半日徒步。</li>
          <li>路线评分普遍较高，大多数路线的评分在 4.5 分以上。</li>
          <li>路线长度与海拔增益呈正相关关系，但难度级别的影响更为显著。</li>
          <li>评论数量较多的路线通常评分较高，表明热门路线往往质量更好。</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalysisPage;