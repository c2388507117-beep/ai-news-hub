-- Seed attractions data for ChinaMap
-- Apply with: wrangler d1 execute ai-news-hub-db --file=scripts/seed-attractions.sql
-- Remote:    wrangler d1 execute ai-news-hub-db --file=scripts/seed-attractions.sql --remote

-- 北京
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '故宫博物院', '明清两代皇家宫殿，世界最大木结构建筑群', 39.9163, 116.3972, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '长城（八达岭）', '世界奇迹，明代长城最精华段', 40.3542, 116.0082, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '天坛公园', '明清帝王祭天场所，祈年殿为标志建筑', 39.8822, 116.4066, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '颐和园', '中国古典园林代表作，昆明湖与万寿山', 39.9950, 116.2689, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '天安门广场', '世界最大城市广场，国庆阅兵地', 39.9054, 116.3976, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '北海公园', '中国现存最古老皇家园林之一', 39.9289, 116.3883, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '798艺术区', '当代艺术聚集地，旧工厂改造的艺术区', 39.9850, 116.4950, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '恭王府', '清代规模最大的王府，和珅府邸', 39.9375, 116.3880, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '什刹海', '北京历史文化保护区，酒吧街和胡同游', 39.9419, 116.3870, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '簋街', '北京最著名美食街，24小时营业', 39.9410, 116.4280, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '香山公园', '京郊赏红叶胜地，秋季漫山红遍', 39.9900, 116.1790, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '国家博物馆', '世界最大博物馆之一，中华文物精华', 39.9052, 116.3973, '人文艺术');

-- 上海
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '外滩', '上海标志性景观，万国建筑博览群', 31.2400, 121.4900, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '东方明珠塔', '上海地标建筑，468米高电视塔', 31.2397, 121.4997, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '豫园', '明代江南古典园林，城隍庙相邻', 31.2270, 121.4910, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '迪士尼乐园', '中国大陆首座迪士尼主题乐园', 31.1440, 121.6580, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '南京路步行街', '中华第一商业街，购物天堂', 31.2320, 121.4750, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '陆家嘴金融中心', '上海CBD天际线，三件套地标建筑', 31.2400, 121.5050, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '武康路', '历史文化名街，老洋房与网红店', 31.2080, 121.4370, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '新天地', '石库门老建筑改造的时尚街区', 31.2190, 121.4740, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '上海博物馆', '中国古代艺术博物馆，青铜器收藏著称', 31.2280, 121.4770, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('上海', '田子坊', '弄堂里的创意艺术区，小店林立', 31.2110, 121.4710, '美食街区');

-- 广州
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '广州塔', '600米高小蛮腰电视塔，城市地标', 23.1067, 113.3244, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '沙面岛', '欧陆风情建筑群，领事馆历史遗址', 23.1090, 113.2450, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '陈家祠', '岭南建筑艺术明珠，广东民间工艺博物馆', 23.1320, 113.2580, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '白云山', '羊城第一秀，登顶可俯瞰广州全景', 23.1850, 113.2930, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '珠江夜游', '夜游珠江欣赏两岸灯光秀', 23.1150, 113.2550, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '越秀公园', '广州最大公园，五羊石像所在地', 23.1400, 113.2650, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '长隆野生动物世界', '亚洲最大野生动物主题公园', 23.0000, 113.3230, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '北京路步行街', '广州最古老商业街，千年古道遗址', 23.1260, 113.2680, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '上下九步行街', '西关风情骑楼商业街，广州老字号', 23.1170, 113.2460, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('广州', '圣心大教堂', '中国最大石结构哥特式教堂', 23.1160, 113.2540, '历史古迹');

-- 深圳
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '世界之窗', '浓缩世界著名景观的主题公园', 22.5430, 113.9780, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '欢乐海岸', '滨海商业综合体，水秀表演', 22.5280, 113.9860, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '梧桐山', '深圳最高峰，可俯瞰深圳全景及香港', 22.5790, 114.2140, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '大梅沙海滨公园', '深圳著名海滩，免费开放', 22.5990, 114.3080, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '莲花山公园', '山顶邓小平雕像，俯瞰市民中心', 22.5480, 114.0680, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '南头古城', '深圳城市原点，1700年历史古城', 22.5400, 113.9260, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '蛇口海上世界', '明华轮改造的综合商业区', 22.4890, 113.9140, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '华侨城创意园', '旧厂房改造的文化创意园区', 22.5400, 113.9840, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '东部华侨城', '综合性生态旅游度假区', 22.6180, 114.2610, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('深圳', '深圳湾公园', '滨海休闲带，骑行观海', 22.5150, 113.9580, '自然风光');

-- 成都
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '大熊猫繁育研究基地', '全球最大大熊猫人工繁育基地', 30.7340, 104.1450, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '宽窄巷子', '成都历史文化街区，清代古巷', 30.6680, 104.0550, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '锦里古街', '西蜀最古老商业街，三国文化主题', 30.6460, 104.0460, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '武侯祠', '纪念诸葛亮的祠堂，三国文化圣地', 30.6460, 104.0470, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '杜甫草堂', '诗圣杜甫故居，中国文学圣地', 30.6620, 104.0340, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '都江堰', '世界最古老水利工程之一，李冰父子建', 31.0100, 103.6200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '青城山', '道教发源地之一，青城天下幽', 30.8950, 103.5750, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '春熙路', '成都最繁华商业步行街', 30.6580, 104.0830, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '人民公园', '体验成都慢生活，鹤鸣茶社盖碗茶', 30.6630, 104.0580, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('成都', '文殊院', '川西著名佛教寺庙，香火旺盛', 30.6800, 104.0770, '历史古迹');

-- 重庆
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '洪崖洞', '重庆地标，悬崖上的吊脚楼夜景', 29.5630, 106.5780, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '解放碑', '重庆标志性纪念碑，商业中心', 29.5600, 106.5730, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '武隆天生三桥', '世界自然遗产，巨型天然石桥群', 29.3880, 107.7560, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '长江索道', '跨越长江的空中缆车，独特交通体验', 29.5600, 106.5800, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '磁器口古镇', '千年古镇，重庆小吃聚集地', 29.5830, 106.4550, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '南山一棵树观景台', '观赏重庆全景和夜景最佳位置', 29.5400, 106.5950, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '大足石刻', '世界文化遗产，唐宋时期摩崖石刻', 29.7030, 105.7030, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '朝天门广场', '两江交汇处，重庆标志性地标', 29.5680, 106.5890, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '十八梯传统风貌区', '老重庆城市记忆，新旧融合街区', 29.5550, 106.5690, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('重庆', '乌江画廊', '乌江两岸山水画卷，百里风光', 29.5000, 107.0000, '自然风光');

-- 杭州
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '西湖', '世界文化遗产，中国最著名湖泊景区', 30.2500, 120.1500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '灵隐寺', '千年古刹，中国最著名佛教寺院之一', 30.2450, 120.0980, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '雷峰塔', '西湖十景之一，白蛇传说地标', 30.2330, 120.1480, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '断桥残雪', '西湖十景之一，白娘子许仙相会处', 30.2580, 120.1620, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '龙井村', '西湖龙井原产地，茶文化体验', 30.2300, 120.1280, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '西溪湿地', '中国首个国家级湿地公园', 30.2660, 120.0630, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '宋城景区', '大型宋文化主题公园，千古情演出', 30.1740, 120.1070, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '京杭大运河', '世界最长人工运河，杭州段历史文化街区', 30.3100, 120.1400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '河坊街', '杭州历史文化街区，老字号小吃', 30.2480, 120.1700, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('杭州', '九溪烟树', '西湖最隐秘的自然美景，溪流潺潺', 30.2050, 120.1180, '自然风光');

-- 西安
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '兵马俑', '世界第八大奇迹，秦始皇陵陪葬坑', 34.3840, 109.2730, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '钟楼', '中国现存最大最完整钟楼，古都地标', 34.2610, 108.9420, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '鼓楼', '西安地标，古代报时中心', 34.2600, 108.9450, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '大雁塔', '唐代高僧玄奘译经之地，西安标志', 34.2180, 108.9610, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '西安城墙', '中国现存规模最大保存最完整古城墙', 34.2600, 108.9420, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '回民街', '西安著名美食街，回族风味小吃', 34.2630, 108.9370, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '华清宫', '唐代皇家温泉行宫，杨贵妃沐浴处', 34.3650, 109.2100, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '陕西历史博物馆', '中国第一座大型现代化国家博物馆', 34.2230, 108.9530, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '大唐不夜城', '唐文化主题步行街，夜景绚烂', 34.2170, 108.9600, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西安', '华山', '奇险天下第一山，长空栈道', 34.4800, 110.0900, '自然风光');

-- 武汉
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '黄鹤楼', '江南三大名楼之一，武汉地标', 30.5470, 114.3070, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '东湖绿道', '中国最大城中湖绿道，骑行天堂', 30.5400, 114.3700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '户部巷', '武汉小吃第一街，热干面豆皮', 30.5470, 114.3100, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '武汉长江大桥', '长江第一桥，公铁两用桥', 30.5480, 114.2880, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '武汉大学', '最美大学校园，樱花季盛景', 30.5320, 114.3630, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '古琴台', '伯牙绝弦故事发生地，知音文化', 30.5550, 114.2600, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '归元禅寺', '武汉四大佛寺之首，罗汉堂五百罗汉', 30.5400, 114.2520, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '江汉路步行街', '百年商业街，欧式建筑林立', 30.5730, 114.2880, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '武汉欢乐谷', '华中地区最大主题乐园', 30.5840, 114.3960, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武汉', '湖北省博物馆', '曾侯乙编钟所在地，越王勾践剑', 30.5610, 114.3620, '人文艺术');

-- 南京
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '夫子庙-秦淮河', '六朝金粉之地，中国历史文化名河', 32.0230, 118.7850, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '中山陵', '孙中山先生陵寝，紫金山风景区核心', 32.0640, 118.8480, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '明孝陵', '明太祖朱元璋陵寝，世界文化遗产', 32.0650, 118.8350, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '玄武湖', '中国最大皇家园林湖泊，金陵明珠', 32.0730, 118.7950, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '南京博物院', '中国三大博物馆之一，民国馆特色', 32.0400, 118.8260, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '总统府', '中国近代史重要遗址，两江总督府旧址', 32.0420, 118.7910, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '老门东', '南京老城南传统民居街区，小吃聚集', 32.0150, 118.7890, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '鸡鸣寺', '南京最古老梵刹，春季樱花胜地', 32.0580, 118.7900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '栖霞山', '金陵第一名秀山，秋季赏枫胜地', 32.1420, 118.9580, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '南京长江大桥', '新中国第一座自主设计建造的长江大桥', 32.1150, 118.7410, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('南京', '颐和路公馆区', '民国使馆公馆建筑群，最美梧桐大道', 32.0500, 118.7730, '人文艺术');

-- 苏州
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '拙政园', '中国四大名园之一，江南园林代表作', 31.3260, 120.6270, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '虎丘', '吴中第一名胜，苏轼题"到苏州不游虎丘乃憾事"', 31.3370, 120.5830, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '平江路', '苏州保存最完好古街，小桥流水人家', 31.3190, 120.6310, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '苏州博物馆', '贝聿铭设计，现代与传统融合建筑', 31.3250, 120.6280, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '寒山寺', '姑苏城外寒山寺，夜半钟声到客船', 31.3160, 120.5660, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '周庄古镇', '中国第一水乡，小桥流水人家', 31.1170, 120.8500, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '同里古镇', '江南六大古镇之一，退思园精美', 31.1700, 120.7260, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '狮子林', '苏州四大名园之一，假山王国', 31.3250, 120.6300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '金鸡湖', '苏州现代化城市景观，摩天轮夜景', 31.3180, 120.7000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('苏州', '山塘街', '白居易开凿七里山塘，姑苏第一名街', 31.3320, 120.5930, '美食街区');

-- 大理
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '洱海', '云南高原明珠，环海骑行圣地', 25.6000, 100.2300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '大理古城', '南诏国和大理国都城，文艺气息浓厚', 25.6800, 100.1700, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '苍山', '十九峰十八溪，索道俯瞰洱海全景', 25.6500, 100.1000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '崇圣寺三塔', '大理地标，千年古塔群', 25.7020, 100.1440, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '双廊古镇', '洱海东岸最美渔村，杨丽萍太阳宫', 25.9500, 100.2700, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '喜洲古镇', '白族民居建筑群，喜洲粑粑', 25.8500, 100.1200, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '蝴蝶泉', '白族爱情传说圣地，蝴蝶会奇观', 25.9170, 100.0830, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('大理', '沙溪古镇', '茶马古道上唯一幸存的古集市', 26.3500, 99.8500, '历史古迹');

-- 丽江
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '丽江古城', '世界文化遗产，小桥流水纳西风情', 26.8700, 100.2300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '玉龙雪山', '北半球最南端雪山，海拔5596米', 27.1000, 100.1800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '束河古镇', '比丽江古城更安静，茶马驿站', 26.9300, 100.2300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '泸沽湖', '高原明珠，摩梭人母系氏族文化', 27.7000, 100.7900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '虎跳峡', '世界最深峡谷之一，金沙江激流', 27.2000, 100.0500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '拉市海', '高原湿地公园，茶马古道骑马体验', 26.8900, 100.1500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '白沙古镇', '纳西文化发源地，白沙壁画', 26.9600, 100.2400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('丽江', '黑龙潭公园', '拍摄玉龙雪山倒影最佳位置', 26.8800, 100.2300, '自然风光');

-- 桂林
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '漓江', '桂林山水甲天下，漓江精华游', 25.2700, 110.2900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '阳朔西街', '洋人街，中西文化交融的步行街', 24.7800, 110.4900, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '象鼻山', '桂林城徽，象形山石的经典景观', 25.2780, 110.2960, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '龙脊梯田', '世界梯田之冠，壮族瑶族农耕奇观', 25.6800, 110.0500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '十里画廊', '阳朔最美骑行路线，沿途群峰竞秀', 24.7700, 110.5000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '两江四湖', '桂林环城水系，夜游船赏灯光秀', 25.2740, 110.2920, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '银子岩', '桂林最大溶洞，奇特的喀斯特地貌', 24.7500, 110.5200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('桂林', '兴坪古镇', '20元人民币背景图取景地', 24.9300, 110.5200, '历史古迹');

-- 三亚
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '亚龙湾', '天下第一湾，水清沙白', 18.2200, 109.6400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '天涯海角', '海南标志性景区，天涯石海角石', 18.3000, 109.3400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '南山寺', '南海观音108米圣像，佛教文化圣地', 18.2500, 109.1800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '蜈支洲岛', '中国最美潜水胜地，情人岛', 18.2700, 109.7300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '椰梦长廊', '三亚最美海岸线，日落美景', 18.2400, 109.4000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '鹿回头', '三亚城市地标，登顶俯瞰全景', 18.2300, 109.5200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '大小洞天', '琼崖八百年第一山水名胜', 18.3300, 109.2700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '第一市场', '三亚最大海鲜市场，海鲜加工一条街', 18.2500, 109.5100, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('三亚', '三亚国际免税城', '全球最大单体免税店，购物天堂', 18.2150, 109.1300, '美食街区');

-- 黄山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '黄山风景区', '五岳归来不看山，黄山归来不看岳', 30.1300, 118.1800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '宏村', '中国画里乡村，徽派建筑代表', 29.9500, 117.9900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '西递', '桃花源里人家，世界文化遗产古村落', 29.9000, 117.9900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '屯溪老街', '活着的清明上河图，徽州古街', 29.7160, 118.3200, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '歙县古城', '徽文化发源地，中国四大古城之一', 29.8600, 118.4200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '齐云山', '中国四大道教名山之一，白岳', 29.8100, 118.0200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '呈坎古村', '中国易经八卦古村落，始建于东汉', 29.8800, 118.2500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('黄山', '太平湖', '黄山脚下翡翠湖，水上运动胜地', 30.4800, 118.0800, '自然风光');

-- 张家界
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '武陵源风景名胜区', '世界自然遗产，三千奇峰', 29.3500, 110.5200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '天子山', '武陵源最高峰，云海石林奇观', 29.3600, 110.4700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '天门山', '世界最长索道，天门洞奇观', 29.0600, 110.4800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '玻璃栈道', '悬于峭壁的透明玻璃栈道，惊险刺激', 29.0500, 110.4700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '金鞭溪', '武陵源最美溪谷，徒步天堂', 29.3100, 110.5400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '杨家界', '武陵源核心景区，峰墙奇观', 29.3800, 110.5000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '黄龙洞', '亚洲最大溶洞，定海神针', 29.2600, 110.5400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('张家界', '百龙天梯', '世界最高户外电梯，垂直高差335米', 29.3700, 110.5100, '人文艺术');

-- 厦门
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '鼓浪屿', '世界文化遗产，万国建筑博览，钢琴之岛', 24.4500, 118.0700, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '厦门大学', '中国最美大学，面朝大海', 24.4420, 118.0920, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '曾厝垵', '中国最文艺渔村，小吃文创聚集', 24.4380, 118.1000, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '环岛路', '厦门最美海岸线，马拉松赛道', 24.4370, 118.1170, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '南普陀寺', '闽南佛教圣地，五老峰下', 24.4470, 118.0870, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '中山路步行街', '厦门最老牌商业街，骑楼建筑', 24.4530, 118.0820, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '胡里山炮台', '中国近代海防要塞，最大海岸炮', 24.4350, 118.1300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '沙坡尾', '厦门港发源地，艺术文创聚集区', 24.4460, 118.0780, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('厦门', '集美学村', '陈嘉庚创办，中西合璧建筑群', 24.5700, 118.1000, '人文艺术');

-- 青岛
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '栈桥', '青岛地标建筑，回澜阁', 36.0620, 120.3200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '崂山', '海上第一名山，道教名山', 36.2000, 120.6000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '八大关', '万国建筑博览区，秋季落叶美', 36.0500, 120.3500, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '五四广场', '青岛城市地标，五月的风雕塑', 36.0630, 120.3820, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '青岛啤酒博物馆', '了解青岛啤酒百年历史，原浆畅饮', 36.0920, 120.3550, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '信号山公园', '俯瞰青岛全景最佳位置', 36.0730, 120.3340, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '金沙滩', '中国沙质最细海滩，青岛最佳海滨', 35.9600, 120.2800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('青岛', '台东步行街', '青岛最热闹夜市，小吃购物天堂', 36.0770, 120.3520, '美食街区');

-- 洛阳
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '龙门石窟', '世界文化遗产，中国石刻艺术最高峰', 34.5600, 112.4700, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '白马寺', '中国第一古刹，佛教传入中国第一寺', 34.7230, 112.5920, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '洛阳老街', '洛阳老城十字街，水席不翻汤', 34.6800, 112.4700, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '关林庙', '三国关羽首级安葬地，武圣陵寝', 34.6100, 112.4800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '洛阳博物馆', '十三朝古都文物精华，唐三彩收藏', 34.6200, 112.4200, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '白云山', '中原第一峰，原始森林氧吧', 33.6800, 111.8300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '老君山', '道教圣地，老子归隐处，金顶道观群', 33.7200, 111.6200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '洛阳牡丹园', '洛阳牡丹甲天下，花开时节动京城', 34.6800, 112.4500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '天堂明堂', '隋唐洛阳城宫城遗址，武则天理政地', 34.6700, 112.4600, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('洛阳', '龙潭大峡谷', '中国嶂谷第一峡，地质奇观', 34.9200, 112.1200, '自然风光');

-- 敦煌
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '莫高窟', '世界文化遗产，东方艺术宝库', 40.0400, 94.8000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '鸣沙山月牙泉', '沙漠奇观，沙鸣泉绿千年不涸', 40.0800, 94.6700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '玉门关', '春风不度玉门关，汉代边关遗址', 40.3500, 93.8600, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '雅丹魔鬼城', '风蚀地貌奇观，如外星世界', 40.5000, 93.2500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '阳关遗址', '劝君更尽一杯酒，西出阳关无故人', 39.9500, 93.9500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '沙州夜市', '敦煌最大夜市，烤肉杏皮水', 40.1400, 94.6600, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '榆林窟', '莫高窟姊妹窟，西夏壁画精品', 40.1000, 95.8000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('敦煌', '敦煌博物馆', '丝路文物展示，了解敦煌历史', 40.1370, 94.6650, '人文艺术');

-- 拉萨
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '布达拉宫', '世界屋脊上的明珠，西藏地标', 29.6570, 91.1170, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '大昭寺', '藏传佛教最高圣殿，释迦牟尼12岁等身像', 29.6540, 91.1300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '八廓街', '拉萨最古老转经道，商业步行街', 29.6530, 91.1310, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '纳木错', '西藏三大圣湖之一，海拔4718米', 30.7000, 90.6500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '色拉寺', '拉萨三大寺之一，辩经仪式著名', 29.7000, 91.1400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '哲蚌寺', '藏传佛教最大寺院，雪顿节晒佛', 29.6700, 91.0500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '药王山', '拍摄布达拉宫最佳角度（50元背景）', 29.6570, 91.1120, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '罗布林卡', '西藏最大园林，历代达赖夏宫', 29.6500, 91.0900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('拉萨', '羊卓雍措', '西藏三大圣湖之一，碧蓝如翡翠', 28.9000, 90.6000, '自然风光');

-- 哈尔滨
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '冰雪大世界', '世界最大冰雪主题乐园', 45.7800, 126.5500, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '圣索菲亚大教堂', '远东最大东正教教堂，哈市地标', 45.7650, 126.6290, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '中央大街', '亚洲最长步行街，欧式建筑林立', 45.7770, 126.6180, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '太阳岛', '松花江北岸避暑胜地，俄罗斯风情', 45.7900, 126.5900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '松花江', '哈尔滨母亲河，冬季冰雪活动', 45.7700, 126.6200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '亚布力滑雪场', '中国最大滑雪场，冬奥会训练基地', 44.8000, 128.5500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '老道外', '中华巴洛克建筑群，哈尔滨美食天堂', 45.7800, 126.6400, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '东北虎林园', '世界最大东北虎人工饲养基地', 45.8200, 126.6000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('哈尔滨', '极地馆', '白鲸表演著名，极地动物展示', 45.7850, 126.5800, '人文艺术');

-- 呼和浩特
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '内蒙古博物院', '了解蒙古族历史文化最佳博物馆', 40.8330, 111.7580, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '大召寺', '呼和浩特最大藏传佛教寺庙', 40.8100, 111.6600, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '希拉穆仁草原', '典型高原草原，骑马射箭摔跤体验', 41.2600, 111.1000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '昭君墓', '王昭君青冢，汉匈和亲见证', 40.7200, 111.7300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '伊斯兰风情街', '阿拉伯风格建筑群，清真美食街', 40.8100, 111.6500, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '绥远将军衙署', '清代绥远城将军办公地，保存完好', 40.8200, 111.6800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '五塔寺', '金刚座舍利宝塔，蒙文天文图石刻', 40.8000, 111.6700, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('呼和浩特', '格根塔拉草原', '内蒙古规模最大草原旅游点', 41.5800, 111.8000, '自然风光');

-- 西双版纳
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '告庄西双景', '西双版纳标志性景区，星光夜市', 22.0150, 100.7950, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '曼听公园', '傣王御花园，千年历史', 22.0100, 100.8000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '中科院植物园', '中国最大热带植物园，万种植物', 21.9200, 101.2500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '野象谷', '亚洲象栖息地，近距离观察野象', 22.1700, 100.8500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '橄榄坝傣族园', '傣族村寨体验，泼水节活动', 21.8400, 100.9000, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '望天树景区', '世界最高树种，空中树冠走廊', 21.6000, 101.5800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '总佛寺', '西双版纳佛教最高管理机构', 22.0150, 100.8050, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('西双版纳', '基诺山寨', '中国第56个民族基诺族文化体验', 22.0300, 100.9600, '人文艺术');

-- 秦皇岛
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '山海关', '天下第一关，明长城东部起点', 39.9960, 119.7640, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '北戴河', '中国著名海滨避暑胜地', 39.8300, 119.4900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '老龙头', '长城唯一入海处，巨龙探海', 39.9600, 119.7900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '鸽子窝公园', '观海上日出最佳位置', 39.8500, 119.5200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '黄金海岸', '金色沙滩滑沙，国家级海洋自然保护区', 39.5700, 119.2500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '阿那亚', '海边孤独图书馆，文化艺术社区', 39.6400, 119.3300, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '角山长城', '长城沿山脊蜿蜒，险峻壮美', 40.0300, 119.7500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('秦皇岛', '燕塞湖', '塞外小桂林，湖光山色', 40.0200, 119.7000, '自然风光');

-- 承德
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '避暑山庄', '世界最大皇家园林，清代皇帝夏宫', 40.9900, 117.9400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '普陀宗乘之庙', '小布达拉宫，外八庙最大寺庙', 41.0100, 117.9300, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '普宁寺', '外八庙之一，世界最大木雕千手观音', 41.0200, 117.9500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '棒槌山', '承德地标，巨型丹霞石柱', 40.9900, 117.9700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '磬锤峰', '承德十大名山之首，国家森林公园', 40.9900, 117.9800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '双塔山', '两座石峰并立，峰顶有辽代古塔', 40.9700, 117.9100, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '须弥福寿之庙', '班禅行宫，藏式汉式融合建筑', 41.0150, 117.9350, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('承德', '塞罕坝', '世界最大人工林海，骑马滑草', 42.3700, 117.3000, '自然风光');

-- 邯郸
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '丛台公园', '邯郸地标，战国赵武灵王阅兵台', 36.6050, 114.4850, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '娲皇宫', '中国最大女娲祭祀地，悬空古建筑', 36.5100, 113.8100, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '京娘湖', '宋太祖赵匡胤千里送京娘故事地', 36.7300, 113.9200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '广府古城', '北方水城，杨式太极拳发源地', 36.7300, 114.7200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '赵王城遗址', '战国赵国王城遗址，国家重点文保', 36.5800, 114.4500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '响堂山石窟', '北齐石窟艺术代表，浮雕精美', 36.4800, 114.1400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '七步沟', '太行山峡谷景区，瀑布群', 36.8000, 113.8500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邯郸', '太行五指山', '天然巨佛奇观，红色旅游胜地', 36.6200, 113.7500, '自然风光');

-- 邢台
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '崆山白云洞', '华北最大溶洞群，地下奇观', 37.4500, 114.5000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '达活泉公园', '邢台最大公园，郭守敬纪念馆', 37.0730, 114.4800, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '邢台峡谷群', '太行山最绿最美峡谷群', 37.1000, 113.8000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '开元寺', '邢台最古老佛教寺院，唐代古刹', 37.0600, 114.5000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '清风楼', '邢台地标古建筑，明代建', 37.0700, 114.5050, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '前南峪', '太行山生态旅游示范区，抗大旧址', 37.1500, 113.9500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '天河山', '中国爱情山，牛郎织女传说发源地', 36.9800, 113.7800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '紫金山景区', '郭守敬少年求学地，太行山风光', 37.0000, 113.8200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('邢台', '扁鹊庙', '祭祀神医扁鹊，古建筑群', 37.3000, 114.1500, '历史古迹');

-- 石家庄
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '正定古城', '中国古建筑博物馆，九楼四塔八大寺', 38.1460, 114.5680, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '隆兴寺', '中国最大宋代佛教寺院，千手观音像', 38.1420, 114.5750, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '西柏坡', '新中国从这里走来，革命圣地', 38.3000, 114.0400, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '苍岩山', '悬空寺桥楼殿，卧虎藏龙取景地', 37.8200, 114.1200, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '赵州桥', '世界最古老石拱桥，隋代李春建', 37.7560, 114.7610, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '荣国府', '87版红楼梦拍摄地，宁荣街仿古建筑', 38.1500, 114.5600, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '柏林禅寺', '千年古刹，赵州茶禅文化', 37.7400, 114.7600, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('石家庄', '抱犊寨', '山顶小平原，南天门俯瞰省会全景', 38.0400, 114.3500, '自然风光');

-- 保定
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '野三坡', '京西小桂林，百里峡奇观', 39.6500, 115.2000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '白洋淀', '华北明珠，荷花世界芦苇荡', 38.8500, 116.0000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '直隶总督署', '中国保存最完整清代省级衙署', 38.8600, 115.4900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '白石山', '中国峰林地貌奇观，玻璃栈道', 39.2500, 114.7500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '狼牙山', '狼牙山五壮士跳崖地，红色旅游', 39.1500, 114.9000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '清西陵', '清朝最后一处帝王陵墓群', 39.3500, 115.3500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '满城汉墓', '中山靖王刘胜墓，金缕玉衣出土', 38.9500, 115.3200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('保定', '古莲花池', '中国北方最优秀古典园林之一', 38.8600, 115.4800, '历史古迹');

-- 正定
-- (正定已包含在石家庄的隆兴寺、正定古城、荣国府中，不再重复)

-- 凤凰
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '凤凰古城', '中国最美小城，沈从文笔下边城', 27.9500, 109.5800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '沱江泛舟', '泛舟沱江，观赏两岸吊脚楼', 27.9450, 109.5850, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '虹桥', '凤凰古城地标，风雨楼桥', 27.9480, 109.5800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '沈从文故居', '文学大师沈从文出生地', 27.9500, 109.5750, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '南华山', '凤凰古城制高点，俯瞰全城', 27.9400, 109.5780, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '奇梁洞', '天下第一奇洞，喀斯特溶洞奇观', 27.9800, 109.5600, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '凤凰小吃街', '血粑鸭酸汤鱼，湘西特色美食', 27.9500, 109.5820, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('凤凰', '南方长城', '中国南方唯一长城，苗疆边墙', 27.9200, 109.5500, '历史古迹');

-- 平遥
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '平遥古城', '中国保存最完好的四大古城之一', 37.2000, 112.1800, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '日升昌票号', '中国第一家银行，清代金融街', 37.2030, 112.1750, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '平遥县衙', '中国现存最完整古代县衙', 37.2000, 112.1720, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '文庙学宫', '中国现存最古老文庙大殿', 37.2020, 112.1820, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '市楼', '平遥古城中心地标建筑', 37.2020, 112.1780, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '协同庆票号', '五进院落地下金库，晋商文化', 37.2020, 112.1760, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '明清一条街', '平遥最繁华商业街，老字号林立', 37.2020, 112.1790, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('平遥', '又见平遥剧场', '大型情境体验剧，穿越平遥历史', 37.1930, 112.1680, '人文艺术');

-- 绍兴
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '鲁迅故里', '文学巨匠鲁迅故居，百草园三味书屋', 30.0000, 120.5800, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '沈园', '南宋著名园林，陆游唐婉爱情故事', 29.9970, 120.5900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '东湖', '浙江三大名湖之一，采石遗迹', 30.0100, 120.6100, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '柯岩风景区', '奇石文化，古越采石遗景', 30.0100, 120.5000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '兰亭', '王羲之兰亭序创作地，书法圣地', 29.9300, 120.5000, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '书圣故里', '王羲之故居，历史文化街区', 30.0050, 120.5850, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '安昌古镇', '江南水乡古镇，腊味酱货特产', 30.0800, 120.5000, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('绍兴', '绍兴老酒馆', '黄酒品尝体验，茴香豆配老酒', 30.0000, 120.5830, '美食街区');

-- 景德镇
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '古窑民俗博览区', '中国最大陶瓷博物馆，制瓷工艺展示', 29.3000, 117.2300, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '陶溪川文创街区', '老瓷厂改造的艺术街区，夜景迷人', 29.2950, 117.2500, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '中国陶瓷博物馆', '陶瓷收藏最全博物馆，千年瓷都历史', 29.2900, 117.2400, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '瑶里古镇', '瓷茶林古镇，明清徽派建筑群', 29.5500, 117.4500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '御窑厂遗址', '明清皇家瓷厂遗址，官窑瓷器', 29.3000, 117.2450, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '三宝国际瓷谷', '艺术家聚集地，陶瓷创意工坊', 29.2700, 117.2600, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '乐天陶社创意市集', '周六创意陶瓷市集，年轻艺术家', 29.2950, 117.2550, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('景德镇', '浮梁古城', '瓷茶文化源起地，千年浮梁县衙', 29.3500, 117.2200, '历史古迹');

-- 庐山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '庐山风景区', '世界文化景观，匡庐奇秀甲天下', 29.5700, 115.9800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '三叠泉', '庐山第一奇观，飞流直下三千尺', 29.5400, 115.9900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '含鄱口', '鄱阳湖日出最佳观景点', 29.5600, 115.9900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '美庐别墅', '蒋宋夏都官邸，国共谈判地', 29.5730, 115.9780, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '花径', '白居易咏诗处，桃花源记原型', 29.5750, 115.9700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '五老峰', '庐山主峰，五峰并峙如五老', 29.5400, 116.0100, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '庐山会议旧址', '中共三次庐山会议举办地', 29.5700, 115.9730, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('庐山', '龙首崖', '悬崖绝壁观景台，云海壮阔', 29.5650, 115.9650, '自然风光');

-- 泰山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '泰山风景区', '五岳之首，天下第一山', 36.2500, 117.1000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '玉皇顶', '泰山极顶1545米，观日出最佳', 36.2540, 117.1060, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '十八盘', '泰山最险登山道，1633级台阶', 36.2480, 117.0980, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '南天门', '泰山标志性建筑，登山终点', 36.2490, 117.1000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '岱庙', '历代帝王封禅泰山祭祀地', 36.1900, 117.1250, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '中天门', '泰山登山中途枢纽，索道上站', 36.2280, 117.0980, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '红门', '泰山经典徒步登山的起点', 36.2000, 117.1120, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('泰山', '天街', '南天门之上的山顶商业街', 36.2500, 117.1020, '美食街区');

-- 华山（已在西安里包含，不再重复）

-- 长白山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '天池', '中国最美火山口湖，海拔2189米', 42.0050, 128.0550, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '长白瀑布', '世界落差最大火山瀑布', 42.0500, 128.0800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '绿渊潭', '碧绿幽深潭水，幽静秀丽', 42.0300, 128.0700, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '地下森林', '原始森林谷底，负氧离子极高', 42.1000, 128.1000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '聚龙泉', '火山温泉群，温泉煮鸡蛋', 42.0400, 128.0650, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '魔界漂流', '冬季雾凇漂流，如梦如幻', 42.3200, 128.2000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '锦江木屋村', '长白山最后的木屋村落', 42.0800, 127.9500, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('长白山', '万达滑雪场', '亚洲最大滑雪场之一', 42.0800, 127.6000, '自然风光');

-- 乐山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '乐山大佛', '世界最大石刻弥勒佛坐像', 29.5450, 103.7730, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '峨眉山', '中国四大佛教名山之一，金顶云海', 29.5300, 103.3400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '金顶（峨眉山）', '峨眉之巅，云海日出佛光圣灯', 29.5200, 103.3400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '报国寺', '峨眉山入山第一寺，明代建筑', 29.5500, 103.4900, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '嘉阳小火车', '世界上唯一还在运行的蒸汽窄轨火车', 29.4500, 103.8500, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '峨眉山自然生态猴区', '野生猕猴群，与猴互动体验', 29.5400, 103.4000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '东方佛都', '巨型地宫石刻佛像群', 29.5400, 103.7800, '人文艺术');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('乐山', '罗城古镇', '中国唯一船形古镇', 29.4000, 104.0500, '历史古迹');

-- 九寨沟
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '九寨沟风景区', '人间仙境，童话世界，水景之王', 33.2500, 104.2300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '五花海', '九寨沟最美海子，五彩斑斓', 33.2300, 104.2400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '诺日朗瀑布', '中国最宽钙化瀑布，西游记取景地', 33.2600, 104.2100, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '五彩池', '九寨最小最艳丽的池子', 33.2100, 104.2300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '镜海', '无风时如镜面倒影', 33.2400, 104.2300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '熊猫海', '九寨沟著名海子，常有熊猫出没', 33.2200, 104.2400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '长海', '九寨最大最深海子，冬季冰封', 33.2800, 104.2000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('九寨沟', '珍珠滩瀑布', '西游记片尾曲取景地', 33.2400, 104.2200, '自然风光');

-- 武当山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '武当山风景区', '道教第一名山，太极拳发源地', 32.4000, 111.0000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '金殿', '武当之巅，全部铜铸鎏金建筑', 32.4100, 111.0200, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '紫霄宫', '武当山保存最完好皇家建筑群', 32.3850, 111.0100, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '南岩宫', '悬崖上的宫殿，龙头香', 32.3900, 111.0150, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '太子坡', '九曲黄河墙，武当山经典打卡地', 32.3800, 111.0000, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '玉虚宫', '武当山最大宫殿遗址', 32.4100, 110.9700, '历史古迹');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '逍遥谷', '武当山最美自然峡谷，猴群出没', 32.3950, 111.0050, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武当山', '武当武术表演', '观看正宗武当功夫表演', 32.4000, 111.0100, '人文艺术');

-- 都江堰（含在成都行程中，不重复）

-- 武夷山
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '武夷山风景区', '世界双遗产，碧水丹山', 27.6500, 117.9300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '九曲溪竹筏漂流', '武夷精华，乘竹筏观两岸奇峰', 27.6300, 117.9500, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '天游峰', '武夷第一胜地，登顶览九曲全景', 27.6400, 117.9300, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '大红袍景区', '岩茶之王大红袍母树所在地', 27.6700, 117.9100, '美食街区');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '一线天', '武夷最奇岩洞，裂隙奇观', 27.6200, 117.9400, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '虎啸岩', '武夷山著名岩景点，天成禅院', 27.6300, 117.9350, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '水帘洞', '武夷山最大岩洞，瀑布飞泻', 27.6800, 117.9000, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('武夷山', '武夷宫', '武夷山历史文化中心，仿宋古街', 27.6500, 117.9600, '历史古迹');

-- 峨眉山（已含在乐山）

-- 补充缺失的华山条目
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '华山风景区', '奇险天下第一山', 34.4800, 110.0900, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '长空栈道', '华山最险，悬崖绝壁上的栈道', 34.4800, 110.0850, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '鹞子翻身', '华山第二险，倒攀岩壁', 34.4820, 110.0830, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '东峰观日台', '华山观日出最佳地点', 34.4830, 110.0920, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '西峰（莲花峰）', '华山最美山峰，沉香劈山救母', 34.4750, 110.0800, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '南峰（落雁峰）', '华山极顶2154.9米', 34.4780, 110.0830, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '北峰（云台峰）', '智取华山故事发生地', 34.4950, 110.0880, '自然风光');
INSERT OR IGNORE INTO attractions (city, name, description, lat, lng, category) VALUES ('华山', '苍龙岭', '华山险道，韩愈投书处', 34.4850, 110.0860, '自然风光');
