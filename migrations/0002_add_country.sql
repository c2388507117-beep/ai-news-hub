-- Phase 4: Global map expansion
-- Adds country field to attractions, seeds global landmarks
-- Apply with: wrangler d1 execute ai-news-hub-db --file=migrations/0002_add_country.sql
-- Remote:    wrangler d1 execute ai-news-hub-db --file=migrations/0002_add_country.sql --remote

-- Step 1: Add country column (SQLite allows ADD COLUMN with DEFAULT)
ALTER TABLE attractions ADD COLUMN country TEXT DEFAULT '中国';

-- Step 2: Update existing China rows explicitly (cleaner than relying on DEFAULT)
UPDATE attractions SET country = '中国' WHERE country IS NULL OR country = '中国';

-- Step 3: Foreign key check for existing visit_logs
PRAGMA foreign_keys = OFF;

-- Step 4: Global attractions
-- === Asia (excluding China) ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('东京', '浅草寺', '东京最古老寺庙，雷门与仲见世通商店街', 35.7148, 139.7967, '历史古迹', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('东京', '东京塔', '东京地标，333米高红色铁塔，夜景迷人', 35.6586, 139.7454, '人文艺术', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('东京', '涩谷十字路口', '世界最繁忙十字路口，东京潮流中心', 35.6595, 139.7004, '人文艺术', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('东京', '新宿御苑', '东京最大日式庭园，樱花季绝美', 35.6852, 139.7100, '自然风光', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('京都', '清水寺', '京都最古老寺庙之一，悬空舞台壮觀', 34.9949, 135.7850, '历史古迹', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('京都', '伏见稻荷大社', '千本朱红鸟居隧道，京都标志景观', 34.9671, 135.7727, '历史古迹', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('京都', '岚山竹林', '嵯峨野竹林小径，翠竹参天', 35.0170, 135.6713, '自然风光', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('大阪', '大阪城', '日本三大名城之一，丰臣秀吉所建', 34.6873, 135.5262, '历史古迹', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('大阪', '道顿堀', '大阪最繁华美食街，格力高跑者招牌', 34.6687, 135.5013, '美食街区', '日本');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('首尔', '景福宫', '朝鲜王朝正宫，首尔五大宫之首', 37.5796, 126.9770, '历史古迹', '韩国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('首尔', '南山首尔塔', '首尔地标，爱情锁墙与城市全景', 37.5512, 126.9882, '人文艺术', '韩国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('首尔', '明洞购物街', '首尔最著名购物区和美食街', 37.5609, 126.9862, '美食街区', '韩国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('首尔', '北村韩屋村', '传统韩屋聚落，首尔历史文化街区', 37.5800, 126.9850, '历史古迹', '韩国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('釜山', '海云台海水浴场', '韩国最著名海滩，釜山标志景点', 35.1586, 129.1604, '自然风光', '韩国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('曼谷', '大皇宫', '泰国皇家宫殿，玉佛寺所在地', 13.7500, 100.4914, '历史古迹', '泰国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('曼谷', '卧佛寺', '泰国最大寺庙，46米长卧佛', 13.7467, 100.4936, '历史古迹', '泰国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('曼谷', '乍都乍周末市场', '世界最大周末市场，超15000个摊位', 13.7999, 100.5503, '美食街区', '泰国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('普吉岛', '芭东海滩', '普吉岛最热闹海滩，水上活动丰富', 7.8957, 98.2957, '自然风光', '泰国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('清迈', '双龙寺', '清迈地标寺庙，山顶金色佛塔', 18.8056, 98.9215, '历史古迹', '泰国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('新加坡', '滨海湾金沙', '新加坡地标，空中花园无边泳池', 1.2834, 103.8607, '人文艺术', '新加坡');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('新加坡', '鱼尾狮公园', '新加坡标志，鱼尾狮雕像', 1.2868, 103.8545, '人文艺术', '新加坡');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('新加坡', '滨海湾花园', '超级树与花穹，未来感植物园', 1.2816, 103.8637, '自然风光', '新加坡');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('新加坡', '牛车水', '新加坡唐人街，美食与文化遗产', 1.2799, 103.8430, '美食街区', '新加坡');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('迪拜', '哈利法塔', '世界最高建筑，828米摩天大楼', 25.1972, 55.2744, '人文艺术', '阿联酋');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('迪拜', '帆船酒店', '世界唯一七星级酒店，迪拜地标', 25.1412, 55.1852, '人文艺术', '阿联酋');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('迪拜', '棕榈岛', '世界最大人工岛，棕榈树造型', 25.1124, 55.1390, '人文艺术', '阿联酋');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('阿布扎比', '谢赫扎耶德大清真寺', '世界最大清真寺之一，洁白大理石建筑', 24.4124, 54.4753, '历史古迹', '阿联酋');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('吴哥窟', '吴哥窟', '世界最大宗教建筑群，柬埔寨国宝', 13.4125, 103.8670, '历史古迹', '柬埔寨');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴厘岛', '海神庙', '巴厘岛标志，海中的印度教寺庙', -8.6212, 115.0868, '历史古迹', '印度尼西亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴厘岛', '乌布梯田', '德格拉朗梯田，热带丛林水稻梯田', -8.4393, 115.2770, '自然风光', '印度尼西亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('吉隆坡', '双子塔', '吉隆坡地标，452米高双塔', 3.1579, 101.7120, '人文艺术', '马来西亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('河内', '下龙湾', '海上桂林，石灰岩岛屿与碧绿海湾', 20.9101, 107.1839, '自然风光', '越南');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('孟买', '泰姬玛哈酒店', '印度标志性建筑，阿拉伯海畔的华丽酒店', 18.9217, 72.8320, '历史古迹', '印度');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('阿格拉', '泰姬陵', '世界七大奇迹之一，永恒的爱情丰碑', 27.1751, 78.0421, '历史古迹', '印度');

-- === Europe ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴黎', '埃菲尔铁塔', '巴黎地标，世界最著名铁塔', 48.8584, 2.2945, '人文艺术', '法国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴黎', '卢浮宫', '世界最大博物馆，蒙娜丽莎与维纳斯', 48.8606, 2.3376, '人文艺术', '法国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴黎', '凯旋门', '拿破仑为纪念胜利所建，香榭丽舍大街起点', 48.8738, 2.2950, '历史古迹', '法国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴黎', '塞纳河', '巴黎母亲河，两岸历史建筑与浪漫氛围', 48.8566, 2.3522, '自然风光', '法国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴黎', '凡尔赛宫', '法国王宫，镜厅与法式园林极致奢华', 48.8049, 2.1204, '历史古迹', '法国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伦敦', '大本钟', '伦敦标志，英国最著名钟楼', 51.5007, -0.1246, '人文艺术', '英国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伦敦', '伦敦塔桥', '泰晤士河上开合桥，伦敦地标', 51.5055, -0.0754, '人文艺术', '英国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伦敦', '大英博物馆', '世界三大博物馆之一，罗塞塔石碑', 51.5194, -0.1270, '人文艺术', '英国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伦敦', '伦敦眼', '泰晤士河畔巨型摩天轮，城市全景', 51.5033, -0.1197, '人文艺术', '英国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伦敦', '白金汉宫', '英国王室官邸，卫兵换岗仪式', 51.5014, -0.1419, '历史古迹', '英国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('罗马', '罗马斗兽场', '古罗马标志建筑，2000年历史竞技场', 41.8902, 12.4922, '历史古迹', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('罗马', '梵蒂冈圣彼得大教堂', '世界最大教堂，天主教圣地', 41.9022, 12.4534, '历史古迹', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('罗马', '特雷维喷泉', '罗马最著名喷泉，投币许愿圣地', 41.9009, 12.4833, '人文艺术', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('威尼斯', '圣马可广场', '威尼斯中心广场，拿破仑称欧洲客厅', 45.4342, 12.3386, '历史古迹', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('威尼斯', '叹息桥', '威尼斯标志性廊桥，浪漫传说', 45.4340, 12.3410, '人文艺术', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('佛罗伦萨', '圣母百花大教堂', '文艺复兴标志建筑，红色穹顶', 43.7731, 11.2560, '历史古迹', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('比萨', '比萨斜塔', '世界最著名斜塔，伽利略自由落体实验地', 43.7230, 10.3966, '历史古迹', '意大利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴塞罗那', '圣家堂', '高迪未完成杰作，世界最独特教堂', 41.4036, 2.1744, '人文艺术', '西班牙');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴塞罗那', '巴特罗之家', '高迪魔幻住宅，海洋元素建筑奇观', 41.3916, 2.1650, '人文艺术', '西班牙');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴塞罗那', '兰布拉大道', '巴塞罗那最著名步行街，波盖利亚市场', 41.3816, 2.1718, '美食街区', '西班牙');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('马德里', '普拉多博物馆', '世界顶级美术馆，戈雅与委拉斯开兹', 40.4138, -3.6921, '人文艺术', '西班牙');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('阿姆斯特丹', '运河带', '阿姆斯特丹标志，17世纪同心圆运河', 52.3667, 4.9000, '人文艺术', '荷兰');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('阿姆斯特丹', '梵高博物馆', '收藏梵高最多作品，向日葵与星空', 52.3584, 4.8811, '人文艺术', '荷兰');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('柏林', '勃兰登堡门', '德国统一象征，新古典主义凯旋门', 52.5163, 13.3777, '历史古迹', '德国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('柏林', '柏林墙遗址', '冷战标志，东边画廊涂鸦艺术', 52.5076, 13.4385, '历史古迹', '德国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('慕尼黑', '新天鹅堡', '迪士尼城堡原型，巴伐利亚童话城堡', 47.5576, 10.7497, '历史古迹', '德国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('慕尼黑', '皇家啤酒屋', '慕尼黑最著名啤酒馆，啤酒节发源地', 48.1372, 11.5795, '美食街区', '德国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('苏黎世', '苏黎世湖', '瑞士最大湖泊，阿尔卑斯山映照', 47.3175, 8.5570, '自然风光', '瑞士');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('因特拉肯', '少女峰', '阿尔卑斯山皇后，欧洲之巅火车站', 46.5369, 7.9627, '自然风光', '瑞士');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('日内瓦', '日内瓦湖大喷泉', '世界最高喷泉，日内瓦标志', 46.2074, 6.1555, '自然风光', '瑞士');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('维也纳', '美泉宫', '哈布斯堡王朝夏宫，巴洛克建筑杰作', 48.1849, 16.3123, '历史古迹', '奥地利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('布达佩斯', '渔人堡', '布达佩斯最佳观景台，多瑙河全景', 47.5025, 19.0366, '历史古迹', '匈牙利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('布拉格', '查理大桥', '中欧最古老石桥，布拉格灵魂所在', 50.0865, 14.4114, '历史古迹', '捷克');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('雅典', '雅典卫城', '古希腊文明象征，帕特农神庙', 37.9715, 23.7267, '历史古迹', '希腊');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('圣托里尼', '蓝顶教堂', '爱琴海标志，白墙蓝顶的浪漫', 36.4176, 25.4318, '人文艺术', '希腊');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('莫斯科', '红场', '俄罗斯心脏，克里姆林宫与圣瓦西里教堂', 55.7541, 37.6208, '历史古迹', '俄罗斯');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('圣彼得堡', '冬宫', '俄罗斯国立博物馆，沙皇宫殿', 59.9400, 30.3136, '人文艺术', '俄罗斯');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伊斯坦布尔', '圣索菲亚大教堂', '拜占庭建筑巅峰，教堂与清真寺合一', 41.0086, 28.9802, '历史古迹', '土耳其');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伊斯坦布尔', '蓝色清真寺', '六座宣礼塔，伊兹尼克蓝瓷砖装饰', 41.0054, 28.9768, '历史古迹', '土耳其');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伊斯坦布尔', '大巴扎', '世界最古老最大室内市场之一', 41.0107, 28.9728, '美食街区', '土耳其');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('卡帕多奇亚', '格雷梅露天博物馆', '火山岩雕凿的洞穴教堂与壁画', 38.6386, 34.8453, '历史古迹', '土耳其');

-- === North America ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('纽约', '自由女神像', '美国象征，纽约港的灯塔', 40.6892, -74.0445, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('纽约', '时代广场', '世界十字路口，霓虹灯海洋', 40.7580, -73.9855, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('纽约', '中央公园', '曼哈顿城市绿洲，都市中的自然', 40.7829, -73.9654, '自然风光', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('纽约', '帝国大厦', '纽约天际线标志，102层观景台', 40.7488, -73.9857, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('纽约', '布鲁克林大桥', '纽约最古老悬索桥，曼哈顿天际线', 40.7061, -73.9969, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('旧金山', '金门大桥', '世界最著名悬索桥，国际橙标志色', 37.8199, -122.4783, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('旧金山', '渔人码头', '旧金山最著名旅游区，海狮与酸面包', 37.8080, -122.4177, '美食街区', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('旧金山', '九曲花街', '世界最弯曲街道，花团锦簇的之字形', 37.8020, -122.4188, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('洛杉矶', '好莱坞标志', '洛杉矶地标，电影工业象征', 34.1341, -118.3215, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('洛杉矶', '环球影城', '好莱坞电影主题乐园，沉浸式体验', 34.1391, -118.3534, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('洛杉矶', '圣莫尼卡海滩', '洛杉矶标志海滩，66号公路终点', 34.0094, -118.4973, '自然风光', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('拉斯维加斯', '拉斯维加斯大道', '世界娱乐之都，霓虹灯与豪华酒店', 36.1146, -115.1728, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('大峡谷', '大峡谷国家公园', '世界自然奇迹，科罗拉多河切割峡谷', 36.1069, -112.1129, '自然风光', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('黄石', '黄石国家公园', '世界第一个国家公园，间歇泉与野生动物', 44.4280, -110.5885, '自然风光', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('华盛顿', '白宫', '美国总统官邸，权力中心', 38.8977, -77.0365, '历史古迹', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('华盛顿', '国家广场', '华盛顿纪念碑与林肯纪念堂轴线', 38.8895, -77.0353, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('芝加哥', '千禧公园云门', '芝加哥地标，豆子形状不锈钢雕塑', 41.8827, -87.6233, '人文艺术', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('尼亚加拉', '尼亚加拉大瀑布', '世界最壮观瀑布，美加边境奇观', 43.0799, -79.0747, '自然风光', '美国');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('多伦多', 'CN塔', '多伦多地标，553米高观景塔', 43.6426, -79.3871, '人文艺术', '加拿大');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('温哥华', '斯坦利公园', '温哥华最大城市公园，原始雨林与海景', 49.3043, -123.1445, '自然风光', '加拿大');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('班夫', '班夫国家公园', '加拿大最美国家公园，路易斯湖翡翠色', 51.4968, -115.9281, '自然风光', '加拿大');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('坎昆', '奇琴伊察', '玛雅文明金字塔，世界新七大奇迹', 20.6843, -88.5678, '历史古迹', '墨西哥');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('哈瓦那', '哈瓦那老城', '彩色殖民建筑与老爷车，时光凝固', 23.1367, -82.3586, '历史古迹', '古巴');

-- === South America ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('里约热内卢', '基督像', '世界新七大奇迹，科尔科瓦多山上基督像', -22.9519, -43.2105, '人文艺术', '巴西');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('里约热内卢', '科帕卡巴纳海滩', '世界最著名海滩，新月形白沙海岸', -22.9708, -43.1823, '自然风光', '巴西');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('里约热内卢', '面包山', '里约标志，缆车上山顶俯瞰全景', -22.9491, -43.1557, '自然风光', '巴西');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('伊瓜苏', '伊瓜苏大瀑布', '世界最宽瀑布，巴西阿根廷交界', -25.6953, -54.4367, '自然风光', '巴西');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('布宜诺斯艾利斯', '博卡区', '彩色铁皮屋与探戈的发源地', -34.6350, -58.3630, '人文艺术', '阿根廷');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('巴塔哥尼亚', '莫雷诺冰川', '世界最壮观冰川之一，活冰川奇观', -50.4825, -73.0522, '自然风光', '阿根廷');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('马丘比丘', '马丘比丘', '印加帝国失落之城，天空之城', -13.1631, -72.5450, '历史古迹', '秘鲁');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('复活节岛', '摩艾石像', '神秘巨石像，波利尼西亚文明之谜', -27.1167, -109.3667, '历史古迹', '智利');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('波哥大', '黄金博物馆', '世界最大黄金工艺品收藏，印第安文明', 4.6016, -74.0720, '人文艺术', '哥伦比亚');

-- === Africa ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('开罗', '吉萨金字塔', '世界七大奇迹唯一尚存，法老陵墓', 29.9792, 31.1342, '历史古迹', '埃及');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('开罗', '埃及博物馆', '图坦卡蒙宝藏，法老文物精华', 30.0478, 31.2336, '人文艺术', '埃及');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('卢克索', '帝王谷', '法老陵墓群，图坦卡蒙墓所在地', 25.7400, 32.6015, '历史古迹', '埃及');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('开普敦', '桌山', '开普敦地标，平顶山如桌布云', -33.9628, 18.4098, '自然风光', '南非');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('开普敦', '好望角', '非洲大陆西南端，大西洋与印度洋交汇', -34.3571, 18.4758, '自然风光', '南非');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('克鲁格', '克鲁格国家公园', '非洲最顶级野生动物保护区，Big Five', -24.0108, 31.4846, '自然风光', '南非');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('内罗毕', '马赛马拉', '全球最壮观野生动物迁徙，角马过河', -1.4850, 35.0100, '自然风光', '肯尼亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('乞力马扎罗', '乞力马扎罗山', '非洲最高峰，赤道上的雪冠', -3.0674, 37.3556, '自然风光', '坦桑尼亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('摩洛哥', '舍夫沙万', '蓝色山城，北非最浪漫小镇', 35.1688, -5.2636, '人文艺术', '摩洛哥');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('马拉喀什', '杰马夫纳广场', '摩洛哥最大露天市场，千夜一夜风情', 31.6258, -7.9891, '美食街区', '摩洛哥');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('塞舌尔', '拉迪格岛', '印度洋天堂海滩，巨型象龟栖息地', -4.3593, 55.8369, '自然风光', '塞舌尔');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('毛里求斯', '七色土', '彩虹色沙丘，火山地质奇观', -20.4167, 57.5000, '自然风光', '毛里求斯');

-- === Oceania ===
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('悉尼', '悉尼歌剧院', '世界最著名建筑之一，帆船造型', -33.8568, 151.2153, '人文艺术', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('悉尼', '悉尼海港大桥', '悉尼地标，可以攀登的衣架桥', -33.8523, 151.2108, '人文艺术', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('悉尼', '邦迪海滩', '悉尼最著名海滩，冲浪圣地', -33.8915, 151.2767, '自然风光', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('墨尔本', '大洋路', '世界最美海岸公路，十二门徒岩', -38.6220, 142.9941, '自然风光', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('大堡礁', '大堡礁', '世界最大珊瑚礁系统，潜水天堂', -18.2871, 147.6992, '自然风光', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('乌鲁鲁', '乌鲁鲁巨岩', '澳大利亚红色心脏，原住民圣地', -25.3444, 131.0369, '自然风光', '澳大利亚');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('皇后镇', '米尔福德峡湾', '新西兰最壮丽峡湾，世界第八大奇观', -44.6473, 167.9105, '自然风光', '新西兰');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('罗托鲁瓦', '地热公园', '新西兰地热奇观，间歇泉与泥浆池', -38.1368, 176.2497, '自然风光', '新西兰');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category, country) VALUES ('斐济', '丹娜努岛', '南太平洋天堂，碧蓝海水与白沙滩', -17.7646, 177.3910, '自然风光', '斐济');

PRAGMA foreign_keys = ON;
