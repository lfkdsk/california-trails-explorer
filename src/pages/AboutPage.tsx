import { Box, Typography, Paper, Grid, Divider, Card, CardContent, Link } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorageIcon from '@mui/icons-material/Storage';

const AboutPage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        关于本项目
      </Typography>
      
      <Paper elevation={0} className="glassmorphism" sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          项目介绍
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          加州徒步路线可视化应用是一个交互式Web应用，旨在帮助用户探索和发现加州的徒步路线。
          本应用基于超过11,000条来自AllTrails的徒步路线数据，提供了地图视图、详细信息、筛选功能和数据分析。
        </Typography>
        <Typography variant="body1" paragraph>
          无论您是寻找简单的短途徒步，还是具有挑战性的长距离路线，本应用都能帮助您找到适合的选择。
          您可以根据难度、长度、海拔增益、评分和地理位置等因素筛选路线，查看详细信息，并在地图上浏览所有路线。
        </Typography>
      </Paper>

      <Paper elevation={0} className="glassmorphism" sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          数据来源
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          本应用使用的数据来自AllTrails，包含了加州地区的11,129条徒步路线信息。数据收集于2024年5月，
          包括路线名称、位置、长度、难度、海拔增益、评分、评论数量等详细信息。
        </Typography>
        <Typography variant="body1" paragraph>
          原始数据来源：
          <Link href="https://github.com/Bhuemann/AllTrailsDataExporter" target="_blank" rel="noopener noreferrer">
            AllTrails Data Exporter
          </Link>
        </Typography>
        <Typography variant="body1" paragraph>
          数据已经过处理和优化，以提高查询性能和用户体验。我们对数据进行了清洗、分类和索引，
          以便在前端应用中高效地进行搜索和筛选操作。
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        技术栈
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} className="glassmorphism h-100">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">前端框架</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • React 18 - 用户界面库
              </Typography>
              <Typography variant="body2" paragraph>
                • TypeScript - 类型安全的JavaScript
              </Typography>
              <Typography variant="body2" paragraph>
                • Material UI - UI组件库
              </Typography>
              <Typography variant="body2" paragraph>
                • React Router - 路由管理
              </Typography>
              <Typography variant="body2" paragraph>
                • Tailwind CSS - 实用工具优先的CSS框架
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} className="glassmorphism h-100">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MapIcon sx={{ mr: 1 }} />
                <Typography variant="h6">地图与可视化</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • Google Maps JavaScript API - 地图显示
              </Typography>
              <Typography variant="body2" paragraph>
                • @react-google-maps/api - React地图组件
              </Typography>
              <Typography variant="body2" paragraph>
                • Chart.js - 数据可视化图表
              </Typography>
              <Typography variant="body2" paragraph>
                • React-Chartjs-2 - Chart.js的React包装器
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} className="glassmorphism h-100">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">数据存储</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • sql.js - WebAssembly版SQLite
              </Typography>
              <Typography variant="body2" paragraph>
                • SQLite数据库 - 结构化数据存储
              </Typography>
              <Typography variant="body2" paragraph>
                • 索引优化 - 提高查询性能
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} className="glassmorphism h-100">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataObjectIcon sx={{ mr: 1 }} />
                <Typography variant="h6">构建工具</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • Vite - 现代前端构建工具
              </Typography>
              <Typography variant="body2" paragraph>
                • ESLint - 代码质量检查
              </Typography>
              <Typography variant="body2" paragraph>
                • PostCSS - CSS转换工具
              </Typography>
              <Typography variant="body2" paragraph>
                • npm - 包管理器
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} className="glassmorphism h-100">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">数据分析</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • Python - 数据处理和分析
              </Typography>
              <Typography variant="body2" paragraph>
                • Pandas - 数据操作和分析
              </Typography>
              <Typography variant="body2" paragraph>
                • Plotly - 交互式可视化
              </Typography>
              <Typography variant="body2" paragraph>
                • SQLite - 数据库管理
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} className="glassmorphism" sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          功能特点
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              地图视图
            </Typography>
            <Typography variant="body2" paragraph>
              • 在Google地图上显示所有徒步路线
            </Typography>
            <Typography variant="body2" paragraph>
              • 标记聚类以处理密集区域
            </Typography>
            <Typography variant="body2" paragraph>
              • 点击标记查看路线详情
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              列表视图
            </Typography>
            <Typography variant="body2" paragraph>
              • 分页浏览所有徒步路线
            </Typography>
            <Typography variant="body2" paragraph>
              • 多种排序选项（评分、距离、海拔等）
            </Typography>
            <Typography variant="body2" paragraph>
              • 路线卡片显示关键信息
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              筛选功能
            </Typography>
            <Typography variant="body2" paragraph>
              • 按难度、长度、海拔增益筛选
            </Typography>
            <Typography variant="body2" paragraph>
              • 按评分和路线类型筛选
            </Typography>
            <Typography variant="body2" paragraph>
              • 按区域和名称搜索
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              数据分析
            </Typography>
            <Typography variant="body2" paragraph>
              • 难度分布饼图
            </Typography>
            <Typography variant="body2" paragraph>
              • 长度与海拔增益散点图
            </Typography>
            <Typography variant="body2" paragraph>
              • 热门区域柱状图
            </Typography>
            <Typography variant="body2" paragraph>
              • 评分分布分析
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} 加州徒步路线可视化 | 使用React、TypeScript和sql.js构建
        </Typography>
      </Box>
    </Box>
  );
};

export default AboutPage;