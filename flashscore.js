// ==UserScript==
// @name         flashscore
// @namespace    http://tampermonkey.net/
// @version      2025-07-30_06-05
// @description  try to take over the world!
// @author       Yongxin Wang
// @downloadURL  https://raw.githubusercontent.com/fefe982/TMScripts/refs/heads/master/flashscore.js
// @updateURL    https://raw.githubusercontent.com/fefe982/TMScripts/refs/heads/master/flashscore.js
// @match        https://www.flashscore.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flashscore.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_openInTab
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function () {
  "use strict";
  console.log("oops, tampermonkey: " + window.location.href);
  GM_addStyle(`.seoAdWrapper, .adsclick, #rc-top, iframe, .adsenvelope {
    display:none !important
}
.leftMenu__text, .bracket__name {
    text-wrap: wrap !important
}
.bracket {
    grid-template-rows: auto auto !important;
}
.bracket__participantRow {
    grid-template-rows: auto;
}
.bracket--doubles .bracket__participantRow {
    grid-template-rows: auto auto;
}`);
  const replaces = {
    tennis: {},
    "table-tennis": {},
    badminton: {},
  };
  const full_names = {
    "aizawa-tori": "相澤桃李",
    "akechi-hina": "明地陽菜",
    "an-jaehyun": "安宰贤",
    "an-se-young": "安洗莹",
    "aoyama-shuko": "青山修子",
    "bai-yan": "柏衍",
    "bao-li-jing": "鲍骊婧",
    "baek-ha-na": "白荷娜",
    "calderano-hugo": "雨果",
    "chae-yujung": "蔡侑玎",
    "chan-hao-ching": "詹皓晴",
    "chan-baldwin-ho-wah": "陈颢桦",
    "chan-nicole-gonzales": "詹又蓁",
    "chang-ching-hui": "张净惠",
    "chang-ko-chi": "张课琦",
    "chang-yu-an": "张玉安",
    "chen-boyang": "陈柏阳",
    "chen-cheng-kuan": "陈政宽",
    "chen-fanghui": "陈芳卉",
    "chen-qingchen": "陈清晨",
    "chen-su-yu": "陈肃谕",
    "chen-xingtong": "陈幸同",
    "chen-yan-fei": "陈妍妃",
    "chen-yi": "陈熠",
    "chen-yu-hsuan": "陈钰媗",
    "chen-yuanyu": "陈垣宇",
    "chen-yufei": "陈雨菲",
    "chen-zhi-ray": "陈子睿",
    "cheng-i-ching": "郑怡静",
    "cheng-xing": "程星",
    "chi-yu-jen": "戚又仁",
    "chiang-chien-wei": "江建苇",
    "chien-tung-chuan": "简彤娟",
    "chiu-hsiang-chieh": "邱相榤",
    "chiu-pin-chian": "邱品蒨",
    "cho-daeseong": "赵大成",
    "cho-seungmin": "赵胜敏",
    "choi-haeeun": "崔海恩",
    "choi-hyojoo": "崔孝珠",
    "choi-solgyu": "崔率圭",
    "chong-eudice": "张玮桓",
    "chou-tien-chen": "周天成",
    "cui-jie": "崔杰",
    "ding-ke-yun": "丁柯蕴",
    "doo-hoi-kem": "杜凯琹",
    "fan-ka-yan": "范嘉茵",
    "fan-shuhan": "范淑涵",
    "feng-yanzhe": "冯彦哲",
    "feng-yi-hsin": "冯翊新",
    "fukushima-yuki": "福島由紀",
    "gao-fangjie": "高昉洁",
    "gao-jia-xuan": "高家炫",
    "gao-xinyu": "高馨妤",
    "gunawan-jason": "吴英伦",
    "gunji-riko": "郡司莉子",
    "guo-hanyu": "郭涵煜",
    "guo-xinwa": "郭新娃",
    "hamada-kazuki": "濵田一輝",
    "han-feier": "韩菲儿",
    "han-qianxi": "韩千禧",
    "han-yue": "韩悦",
    "hara-nanako": "原菜那子",
    "harimoto-miwa": "張本美和",
    "harimoto-tomokazu": "張本智和",
    "hashimoto-honoka": "橋本帆乃香",
    "hatano-riku": "秦野陸",
    "hayata-hina": "早田ひな",
    "he-zhi-wei": "何志伟",
    "he-zhuojia": "何卓佳",
    "hibino-nao": "日比野菜緒",
    "hiramoto-ririna": "平本梨々菜",
    "hirano-miu": "平野美宇",
    "hirokami-rui": "廣上瑠依",
    "ho-kwan-kit": "何钧杰",
    "ho-ray": "何承叡",
    "hobara-sayaka": "保原彩夏",
    "hoki-takuro": "保木卓朗",
    "hontama-mai": "本玉真唯",
    "hozumi-eri": "穂積絵莉",
    "hsieh-su-wei": "谢淑薇",
    "hsieh-yi-en": "谢宜恩",
    "hsu-wen-chi": "许玟琪",
    "hsu-ya-ching": "许雅晴",
    "hsu-yu-hsiou": "许育修",
    "hu-ling-fang": "胡绫芳",
    "hu-zhe-an": "胡哲安",
    "huang-ching-ping": "黄瀞平",
    "huang-di": "黄荻",
    "huang-dongping": "黄东萍",
    "huang-ke-xin": "黄可欣",
    "huang-jui-hsuan": "黄睿璿",
    "huang-ping-hsien": "黄品衔",
    "huang-yan-cheng": "黄彦诚",
    "huang-yi-hua": "黄怡桦",
    "huang-youzheng": "黄友政",
    "huang-yu-hsun": "黄宥薰",
    "huang-yu-jie": "黃愉偼",
    "huang-yu-kai": "黄郁岂",
    "hung-en-tzu": "洪恩慈",
    "hung-hsin-en": "洪妡恩",
    "hung-kuei-chun": "洪魁骏",
    "hung-yi-ting": "洪毅婷",
    "hung-yu-en": "洪妤恩",
    "hsieh-pei-shan": "谢沛珊",
    "hsu-yin-hui": "许尹鏸",
    "imamura-masamichi": "今村昌倫",
    "ishii-sayaka": "石井さやか",
    "ishikawa-kokona": "石川心菜",
    "ito-aoi": "伊藤あおい",
    "ito-mima": "伊藤美誠",
    "iwanaga-rin": "岩永鈴",
    "jeon-hyeok-jin": "全奕陈",
    "jeong-na-eun": "郑那银",
    "jheng-yu-chieh": "郑宇倢",
    "jia-yifan": "贾一凡",
    "jiang-xinyu": "蒋欣玗",
    "jiang-zhenbang": "蒋振邦",
    "jin-yong": "真龙",
    "jin-yuquan": "金雨全",
    "joo-cheonhui": "朱芊曦",
    "kang-min-hyuk": "姜珉赫",
    "kao-cheng-jui": "高承睿",
    "kato-miyu": "加藤未唯",
    "kato-yuna": "加藤佑奈",
    "kawazoe-maiko": "川添麻依子",
    "keng-shuliang": "坑姝良",
    "ki-dong-ju": "奇东柱",
    "kihara-miyuu": "木原美悠",
    "kim-ga-eun": "金佳恩",
    "kim-hye-jeong": "金慧贞",
    "kim-nayeong": "金娜英",
    "kim-seongjin": "金成珍",
    "kim-seoyun": "金谞润",
    "kim-won-ho": "金元浩",
    "kiyose-riko": "清瀬璃子",
    "kobayashi-hiromu": "小林広夢",
    "kobayashi-yugo": "小林優吾",
    "kong-hee-yong": "孔熙容",
    "kong-tsz-lam": "江芷林",
    "konishi-haruna": "小西春七",
    "kuai-man": "蒯曼",
    "kumagai-kakeru": "熊谷翔",
    "kuo-guan-hong": "郭冠宏",
    "kuo-kuan-lin": "郭冠麟",
    "kwan-man-ho": "关文皓",
    "lai-po-yu": "赖柏佑",
    "lam-siu-hang": "林兆恒",
    "lam-yee-lok": "林依諾",
    "lee-cheuk-yiu": "李卓耀",
    "lee-chia-hao": "李佳豪",
    "lee-chia-hsin": "李佳馨",
    "lee-chih-chen": "李芷蓁",
    "lee-chun-hei-reginald": "李晋熙",
    "lee-daeun": "李达恩",
    "lee-eunhye": "李恩惠",
    "lee-fang-chih": "李芳至",
    "lee-fang-jen": "李芳任",
    "lee-jhe-huei": "李哲辉",
    "lee-jong-min": "李钟民",
    "lee-karen-man-hoi": "李凱敏",
    "lee-sangsu": "李尚洙",
    "lee-so-hee": "李昭希",
    "lee-yeon-woo": "李妍雨",
    "lei-lanxi": "雷兰曦",
    "leong-iok-chong": "梁钰聪",
    "li-hon-ming": "李漢銘",
    "li-hong-yi": "李泓毅",
    "li-yijing": "李怡婧",
    "li-yu-jhun": "李昱谆",
    "li-shifeng": "李诗沣",
    "li-zekai": "李泽楷",
    "liang-jingkun": "梁靖崑",
    "liang-ting-yu": "梁庭瑜",
    "liang-weikeng": "梁伟铿",
    "liao-cheng-ting": "廖振珽",
    "liao-jhuo-fu": "廖倬甫",
    "lim-jonghoon": "林钟勋",
    "lin-bing-wei": "林秉纬",
    "lin-chich-chun": "林芷均",
    "lin-chun-yi": "林俊易",
    "lin-gaoyuan": "林高远",
    "lin-hsiang-ti": "林湘缇",
    "lin-jhih-yun": "林芝昀",
    "lin-shidong": "林诗栋",
    "lin-xiao-min": "林筱闵",
    "lin-yen-chun": "林彦均",
    "lin-yun-ju": "林昀儒",
    "liu-chiao-yun": "刘巧芸",
    "liu-kuang-heng": "刘广珩",
    "liu-sheng-shu": "刘圣书",
    "lin-wan-ching": "林琬清",
    "liu-weishan": "刘炜珊",
    "liu-yang": "刘阳",
    "liu-yi": "刘毅",
    "lin-yu-chieh": "林煜杰",
    "lo-sin-yan-happy": "卢善恩",
    "lu-guangzu": "陆光祖",
    "lu-ming-che": "卢明哲",
    "lui-chun-wai": "吕俊玮",
    "lui-lok-lok": "吕乐乐",
    "luo-yi": "罗意",
    "lum-nicholas": "林文政",
    "luo-xumin": "罗徐敏",
    "ma-yexin": "马烨欣",
    "matsuda-ryuki": "松田龍樹",
    "matsui-keiichiro": "松居圭一郎",
    "matsumoto-mayu": "松本麻佑",
    "matsuyama-nami": "松山奈未",
    "matsushima-sora": "松島輝空",
    "midorikawa-hiroki": "緑川大輝",
    "mitsuhashi-kenya": "三橋健也",
    "miyazaki-tomoka": "宮崎友花",
    "mochizuki-shintaro": "望月慎太郎",
    "mori-sakura": "森さくら",
    "na-sung-seung": "罗圣胜",
    "nagasaki-miyu": "長崎美柚",
    "nakagawa-naoki": "中川直樹",
    "nakanishi-kie": "中西貴映",
    "naraoka-kodai": "奈良岡功大",
    "ng-ka-long-angus": "伍家朗",
    "ng-weng-chi": "吴颖嗣",
    "ng-wing-lam": "吴咏琳",
    "nidaira-natsuki": "仁平菜月",
    "ninomiya-makoto": "二宮真琴",
    "nishi-hiroki": "西大輝",
    "nishimoto-kenta": "西本拳太",
    "nishioka-yoshihito": "西岡良仁",
    "noguchi-rio": "野口莉央",
    "nomura-takumi": "野村拓海",
    "obayashi-takuma": "大林拓真",
    "odo-satsuki": "大藤沙月",
    "ogawa-shogo": "小川翔悟",
    "oh-junsung": "吴晙诚",
    "oikawa-mizuki": "及川瑞基",
    "okamura-hiroki": "岡村洋輝",
    "okuhara-nozomi": "奥原希望",
    "osaka-naomi": "大坂なおみ",
    "osawa-hina": "大澤陽奈",
    "osawa-kaho": "大澤佳歩",
    "otake-mizuki": "大竹望月",
    "park-gyuhyeon": "朴奎炫",
    "peng-yu-wei": "彭雨薇",
    "po-li-wei": "柏礼维",
    "pui-chi-wa": "裴梓桦",
    "pui-pang-fong": "裴鹏锋",
    "qian-tianyi": "钱天一",
    "ren-xiangyu": "任翔宇",
    "ren-yufei": "任钰菲",
    "ryu-hanna": "柳韩娜",
    "saito-natsu": "齋藤夏",
    "sakamoto-rei": "坂本怜",
    "sano-daisuke": "佐野大輔",
    "sato-hitomi": "佐藤瞳",
    "seo-seung-jae": "徐承宰",
    "shang-juncheng": "商竣程",
    "shen-shi-yao": "沈诗瑶",
    "shi-han": "石瀚",
    "shi-xunyao": "石洵瑶",
    "shi-yuqi": "石宇奇",
    "shibahara-ena": "柴原瑛菜",
    "shida-chiharu": "志田千陽",
    "shin-yubin": "申裕斌",
    "shinozuka-hiroto": "篠塚大登",
    "shimogami-yuichi": "霜上雄一",
    "sim-yu-jin": "沈有振",
    "su-ching-heng": "苏敬恒",
    "su-li-yang": "苏力扬",
    "su-tsz-tung": "苏籽童",
    "sugiyama-kaoru": "杉山薫",
    "suizu-manami": "水津愛美",
    "sun-fajing": "孙发京",
    "sun-liang-ching": "孙亮晴",
    "sun-wen-jun": "孙文骏",
    "sun-yingsha": "孙颖莎",
    "sung-shuo-yun": "宋硕芸",
    "sung-yu-hsuan": "宋祐媗",
    "tajima-naoki": "田島尚輝",
    "takahashi-asuka": "髙橋明日香",
    "takahashi-koo": "高橋洸士",
    "takahashi-miyu": "髙橋美優",
    "tamate-katsuki": "玉手勝輝",
    "tan-ning": "谭宁",
    "tanabe-mai": "田部真唯",
    "tanaka-yuji": "田中湧士",
    "tanaka-yuta": "田中佑汰",
    "tang-chun-man": "邓俊文",
    "tang-kai-wei": "唐凯威",
    "tang-qianhui": "汤千慧",
    "te-rigele": "特日格乐",
    "teng-chun-hsun": "邓淳薰",
    "ting-yen-chen": "丁彦宸",
    "togami-shunsuke": "戸上隼輔",
    "tsai-fu-cheng": "蔡富丞",
    "tsang-hiu-yan": "曾晓昕",
    "tse-ying-suet": "谢影雪",
    "tseng-chun-hsin": "曾俊欣",
    "tung-ciou-tong": "董秋彤",
    "uchijima-moyuka": "内島萌夏",
    "uda-yukiya": "宇田幸矢",
    "vong-kok-weng": "黄觉永",
    "wang-aoran": "王傲然",
    "wang-chan": "王灿",
    "wang-chang": "王昶",
    "wang-chi-lin": "王齐麟",
    "wang-chuqin": "王楚钦",
    "weng-hongyang": "翁泓阳",
    "wang-manyu": "王曼昱",
    "wang-meiling": "王美玲",
    "wang-po-wei": "王柏崴",
    "wang-szu-min": "王思敏",
    "wang-ting-ge": "王汀戈",
    "wang-tzu-wei": "王子维",
    "wang-xiaotong": "王晓彤",
    "wang-xinyu-2001": "王欣瑜",
    "wang-xiyu": "王曦雨",
    "wang-yafan": "王雅繁",
    "wang-yidi": "王艺迪",
    "wang-yu-yan": "王语嫣",
    "wang-zhiyi": "王祉怡",
    "wang-zhengxing": "王正行",
    "wang-zi-meng": "王子萌",
    "watanabe-koki": "渡邉航貴",
    "watanabe-yuta": "渡辺勇大",
    "wei-chun-wei": "魏俊纬",
    "wei-sijia": "韦思佳",
    "wei-yaxin": "魏雅欣",
    "wen-ruibo": "温瑞博",
    "wong-chak-lam-coleman": "黄泽林",
    "wong-chun-ting": "黄镇廷",
    "wong-hoi-tung": "黄凯彤",
    "woo-hyeonggyu": "禹衡圭",
    "wu-fang-hsien": "吴芳嫺",
    "wu-guan-xun": "吴冠勋",
    "wu-hsuan-yi": "吴轩毅",
    "wu-luoyu": "邬洛愉",
    "wu-meng-ying": "吴梦莹",
    "wu-yibing": "吴易昺",
    "xiang-peng": "向鹏",
    "xie-haonan": "谢浩南",
    "xu-haidong": "徐海东",
    "xu-yi": "徐奕",
    "xu-yi-fan": "徐一幡",
    "xu-yingbin": "徐瑛彬",
    "xue-fei": "薛飞",
    "yamaguchi-akane": "山口茜",
    "yamashita-kyohei": "山下恭平",
    "yang-po-chih": "杨博智",
    "yang-ching-tun": "杨景惇",
    "yang-chu-yun": "杨筑云",
    "yang-haeun": "梁夏银",
    "yang-po-han": "杨博涵",
    "yang-po-hsuan": "杨博轩",
    "yang-ya-yi": "杨亚依",
    "yang-yiyun": "杨屹韵",
    "yang-zhaoxuan": "杨钊煊",
    "yao-xinxin": "姚欣辛",
    "yau-mau-ying": "尤漫莹",
    "ye-hong-wei": "叶宏蔚",
    "yeh-yi-tian": "叶伊恬",
    "yen-yu-lin": "林彦妤",
    "yeung-nga-ting": "杨雅婷",
    "yeung-pui-lam": "杨霈霖",
    "yiu-kwan-to": "姚钧涛",
    "yokoi-sakura": "横井咲桜",
    "yoshimura-maharu": "吉村真晴",
    "yoshiyama-ryoichi": "吉山僚一",
    "you-xiaodi": "尤晓迪",
    "yu-chien-hui": "余芊慧",
    "yuan-licen": "袁励岑",
    "yuan-yue-1998": "袁悦",
    "yunchaokete-bu": "布云朝克特",
    "zeng-weihan": "曾维瀚",
    "zhang-chi": "张驰",
    "zhang-shuai": "张帅",
    "zhang-shuxian": "张殊贤",
    "zhang-zhizhen": "张之臻",
    "zhang-xiangyu": "张翔宇",
    "zheng-qinwen": "郑钦文",
    "zheng-saisai": "郑赛赛",
    "zhou-qihao": "周启豪",
    "zhou-yi": "周意",
    "zhu-chengzhu": "朱成竹",
    "zhu-lin": "朱琳",
    "zhu-sibing": "朱思冰",
    "zhu-xuan-chen": "朱轩辰",
    "zhu-yi-jun": "朱一珺",
    "zhu-yuling": "朱雨玲",
    "zhu-ziyu": "朱梓予",
    "zih-huang-ling": "黄姿菱",
    "Nishikori K.": "錦織圭",
    "Chen Meng": "陈梦",
    "Chen S-Y.": "陈思羽",
    "Fan S.": "范思琦",
    "Fan Z.": "樊振东",
    "Jeon J.": "田志希",
    "Lee H. Ch.": "李皓晴",
    "Li Y. J.": "李彦军",
    "Liang Y.": "梁俨苧",
    "Ma L.": "马龙",
    "Ni X.": "倪夏莲",
    "Qin Y.": "覃予萱",
    "Suh H.": "徐孝元",
    "Wen R.": "温瑞波",
    "Yokotani J.": "横谷晟",
    "Zeng B.": "曾蓓勋",
    "Zong G.": "纵歌曼",
    "Chen S. F.": "陈胜发",
    "Chen Xu Jun": "陈旭君",
    "Cheng Y.": "郑育沛",
    "Guo R. H.": "郭若涵",
    "He J. T.": "何济霆",
    "Higashino A.": "東野有紗",
    "Huang Y. Q.": "黄雅琼",
    "Kaneko Y.": "金子祐樹",
    "Kim S. Y.": "金昭映",
    "Konegawa M.": "古根川美桜",
    "Kurihara A.": "栗原あかり",
    "Lee Y. L.": "李幽琳",
    "Leung Y. Y.": "梁悦仪",
    "Li W. M.": "李汶妹",
    "Liu L.": "刘亮",
    "Lu C. Y.": "卢敬尧",
    "Lu Ming Che": "卢明哲",
    "Matsutomo M.": "松友美佐紀",
    "Nagahara W.": "永原和可那",
    "Ng Tsz Y.": "吴芷柔",
    "Ng W. Y.": "吴咏瑢",
    "Ohori A.": "大堀彩",
    "Pai Yu P.": "白驭珀",
    "Sato A.": "佐藤灯",
    "Shibata K.": "柴田一樹",
    "Shin S. C.": "申昇瓒",
    "Sun Y. H.": "孙昱瑆",
    "Tai T. Y.": "戴资颖",
    "Tsai R. L.": "蔡渃琳",
    "Tsuneyama K.": "常山幹太",
    "Wang Y. Q.": "汪郁乔",
    "Wang Y. Z.": "王眱祯",
    "Yamada N.": "山田尚輝",
    "Zhang Y. M.": "张艺曼",
    "Zheng S. W.": "郑思维",
    "Zheng Y.": "郑雨",
    "Zhou H. D.": "周昊东",
  };
  const tab_jobs = {};
  const pending_job = {};
  let timer = null;
  let num_jobs = 0;
  const startTimer = () => {
    if (timer) {
      return;
    }
    const check_pending_job = () => {
      if (num_jobs < 5) {
        for (const match in pending_job) {
          const href = pending_job[match];
          delete pending_job[match];
          num_jobs++;
          console.log(`opening ${href}`);
          tab_jobs[match] = GM_openInTab(href);
          break;
        }
      }
      if (pending_job) {
        timer = setTimeout(check_pending_job, 1000);
      } else {
        timer = null;
      }
    };
    check_pending_job();
  };
  function get_match_key(href) {
    const m = href.match(/match\/[^/]+\/[^/]+/);
    return m[0];
  }
  function get_player_key(href) {
    const m = href.match(/\/player\/(.*)\/(.*)\//);
    if (!m) {
      return ["", ""];
    }
    let key = m[1] + "/" + m[2];
    if (!(key in full_names)) {
      if (m[1] in full_names) {
        key = m[1];
      } else {
        key = "";
      }
    }
    return [key, m[1]];
  }

  function replace_name_player(p, play_info) {
    if ("mod" in p.attributes) {
      return;
    }
    const formatRank = (rank) => {
      return rank ? " (" + rank + ")" : "";
    };
    const formatRawName = (raw_nanme) => {
      return raw_name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };
    let rank = 0;
    let href = "";
    if (typeof play_info == "object") {
      rank = play_info.rank;
      href = play_info.href;
    } else {
      href = play_info;
    }
    const [key, raw_name] = get_player_key(href);
    let r = full_names[key];
    if (r) {
      r = formatRawName(raw_name) + " (" + r + ")" + formatRank(rank);
    } else {
      if (!raw_name) {
        return;
      }
      let old_name = full_names[p.textContent];
      old_name = old_name ? " [" + old_name + "]" : "";
      r = formatRawName(raw_name) + old_name + formatRank(rank);
    }
    p.setAttribute("mod", p.textContent);
    p.textContent = r;
  }

  const addMatchListener = (match, href) => {
    if (!(match in pending_job)) {
      const listener = GM_addValueChangeListener(match, (key, old_val, new_val) => {
        GM_removeValueChangeListener(listener);
        if (match in tab_jobs) {
          tab_jobs[match].close();
          delete tab_jobs[match];
          num_jobs--;
        }
        const eventRowLink = document.querySelector("a.eventRowLink[href='" + href + "']");
        for (const p of eventRowLink.parentElement.querySelectorAll("div.event__participant")) {
          replace_name_match(p, match, null);
        }
        updateEventStage(eventRowLink.parentElement.querySelector("div.event__time, div.event__stage--block"), match);
        console.log("listener for " + match + " fired", key, old_val, new_val);
      });
      console.log("create pending job", match);
      pending_job[match] = href;
      startTimer();
    }
  };
  function replace_name_match(p, match, href) {
    if ("mod" in p.attributes) {
      return;
    }
    const n = p.textContent;
    const v = GM_getValue(match);
    if (!v?.[n]) {
      console.log(match, v);
      if (!(match in tab_jobs) && href) {
        addMatchListener(match, href);
      }
      return false;
    }
    return replace_name_player(p, v[n]);
  }
  const updateEventStage = (tnode, match) => {
    let mnode;
    if (!match) {
      mnode = tnode.parentNode;
      while (mnode && !mnode.classList.contains("event__match")) {
        mnode = mnode.parentNode;
      }
      mnode = mnode?.querySelector(".eventRowLink");
      if (!mnode) {
        return;
      }
      match = get_match_key(mnode.href);
    }
    if (!match) {
      return;
    }
    const v = GM_getValue(match);
    if (!v?.stage) {
      return;
    }
    if (v.stage == "__null__") {
      return;
    }
    if (tnode && tnode.lastChild.textContent != v.stage) {
      tnode.appendChild(document.createElement("br"));
      tnode.appendChild(document.createTextNode(v.stage));
    }
  };
  const updateEventStageP = (node) => {
    for (const tnode of node.querySelectorAll("div.event__time, div.event__stage--block")) {
      updateEventStage(tnode);
    }
  };
  function replace_name(p, sport) {
    if (p.nodeType == 1 && (p.childNodes.length == 0 || p.childNodes[0].nodeType != 3)) {
      return;
    }
    if (!(sport in replaces)) {
      return;
    }
    if (
      window.location.href.startsWith("https://www.flashscore.com/favorites/") ||
      window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
      window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
      window.location.href.startsWith("https://www.flashscore.com/tennis/")
    ) {
      const match = p.parentNode.querySelector("a.eventRowLink");
      if (match != null) {
        replace_name_match(p, get_match_key(match.href), match.href);
      }
    }
    if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
      replace_name_match(p, get_match_key(p.parentNode.parentNode.href), null);
    }
  }
  let sport = "";
  function hanlde_draw_observer(node) {
    for (const p of node.querySelectorAll(".series")) {
      for (const player of p.parentNode.parentNode.querySelectorAll(".bracket__name")) {
        replace_name_match(player, get_match_key(p.href), null);
      }
      const height = p.parentNode.parentNode.childNodes[0].offsetHeight;
      p.parentNode.style.top = "calc(50% + " + height / 2 + "px)";
    }
  }
  const udpateElement = (node) => {
    if (window.location.href.startsWith("https://www.flashscore.com/favorites/")) {
      const children = node.getElementsByClassName("event__participant");
      for (const p of children) {
        const sport = p.parentElement.parentElement.classList[1];
        replace_name(p, sport);
      }
    } else if (window.location.href.startsWith("https://www.flashscore.com/draw/")) {
      hanlde_draw_observer(node);
    } else if (
      window.location.href.startsWith("https://www.flashscore.com/match/") ||
      window.location.href.startsWith("https://www.flashscore.com/player/") ||
      window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
      window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
      window.location.href.startsWith("https://www.flashscore.com/tennis/")
    ) {
      const sport_eles = document.body.querySelectorAll("body > sport");
      sport = sport_eles[0].getAttribute("name");
      const children = node.querySelectorAll(".participant__participantName:not(:has(.participant__participantName))");
      for (const p of children) {
        if (p.tagName == "A") {
          replace_name_player(p, p.href);
        } else {
          replace_name(p, sport);
        }
      }
      if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
        for (const p of node.querySelectorAll(".h2h__participantInner")) {
          replace_name(p, sport);
        }
        hanlde_draw_observer(node);
      } else {
        const children = node.getElementsByClassName("event__participant");
        for (const p of children) {
          replace_name(p, sport);
        }
      }
    }
    updateEventStageP(node);
    const children = node.getElementsByClassName("leftMenu__text");
    for (const p of children) {
      replace_name_player(p, p.parentElement.href);
    }
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == "characterData") {
        if (mutation.target.parentNode.classList.contains("event__stage--block")) {
          updateEventStage(mutation.target.parentNode);
        }
        continue;
      }
      if (mutation.type != "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType == node.ELEMENT_NODE) {
          udpateElement(node);
        } else if (node.nodeType == node.TEXT_NODE) {
          if (node.parentNode.classList.contains("event__stage--block")) {
            updateEventStage(node.parentNode);
          }
        }
      }
    }
  });

  observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
    if (window.location.href.indexOf("#") < 0) {
      return;
    }
    function wait_for_load() {
      const key = get_match_key(window.location.href);
      console.log(key);
      const val = { t: Date.now() };
      const children = document.querySelectorAll("div.duelParticipant a.participant__participantName");
      console.log(children);
      if (children.length == 0) {
        setTimeout(wait_for_load, 1000);
        return;
      }
      const match_time = document.querySelector("div.duelParticipant div.duelParticipant__startTime div").textContent;
      console.log(match_time);
      const m_time = /(\d+).(\d+).(\d+) (\d+):(\d+)/.exec(match_time);
      let date = 0;
      if (m_time) {
        date = new Date(m_time[3], m_time[2] - 1, m_time[1], m_time[4], m_time[5]).getTime();
      }
      if (!date) {
        return;
      }
      for (const p of children) {
        console.log(p);
        const href = p.attributes.href.value;
        const rank_ele = p.parentNode.parentNode.parentNode.querySelector(".participant__participantRank");
        let rank = 0;
        if (rank_ele) {
          rank = parseInt(rank_ele.childNodes[2].textContent);
        }
        console.log(href, rank);
        const player_key = p.attributes.mod?.value || p.textContent;
        val[player_key] = { href, rank };
        const [key] = get_player_key(href);
        if (key) {
          const player = GM_getValue("player/" + key, {});
          player.t = Math.max(player.t || 0, date);
          GM_setValue("player/" + key, player);
        }
      }
      const stage = document.querySelector(
        ".wcl-breadcrumbItem_CiWQ7:last-child .wcl-breadcrumbItemLabel_ogiBc"
      ).textContent;
      const stagesplit = stage.split(" - ");
      if (stagesplit.length > 1) {
        val.stage = stagesplit.pop();
      } else {
        val.stage = "__null__";
      }
      console.log(val);
      GM_setValue(key, val);
      console.log(key, GM_getValue(key));
    }
    wait_for_load();
  }
  udpateElement(document.body);
  for (const key of GM_listValues()) {
    if (key.startsWith("__")) {
      console.log("met special key: " + key);
      continue;
    }
    const v = GM_getValue(key);
    if (!("t" in v)) {
      console.log("Deleting key without timestamp: " + key + ", " + v);
      GM_deleteValue(key);
      continue;
    }
    if (key.startsWith("match/") && Date.now() - v.t > 1000 * 60 * 60 * 24 * 7) {
      console.log(`Deleting old value for key: ${key}`, v);
      GM_deleteValue(key);
    }
    // } else {
    //   console.log(`Keeping value for key: ${key}, ${(Date.now() - v.t) / 1000 / 60 / 60} hours old`, v);
    // }
  }
  for (const key in full_names) {
    if (!GM_getValue("player/" + key)) {
      console.log(`player ${key}, ${full_names[key]}, never met`);
    }
  }
  (function () {
    const exchangeSport = (mainhref, minorhref) => {
      const main = document.querySelector(`.menuTop__item[href="${mainhref}"]`);
      console.log(`.menuTop_item[a='${mainhref}']`);
      const minor = document.querySelector(`.menuMinority__item[href='${minorhref}']`);
      const mainminor = document.querySelector(`.menuMinority__item[href='${mainhref}']`);
      console.log(main, minor, mainminor);
      if (main && minor && mainminor) {
        mainminor.classList.remove("menuMinority__item--hidden");
        console.log("minor class", mainminor.classList);
        minor.classList.add("menuMinority__item--hidden");
        main.href = minorhref;
        console.log(main.children[0].children[0]);
        main.children[0].removeChild(main.children[0].children[0]);
        main.children[0].appendChild(minor.children[0].children[0]);
        main.setAttribute("data-sport-id", minor.getAttribute("data-sport-id"));
        main.children[1].textContent = minor.children[1].textContent;
        return true;
      }
      return false;
    };
    console.log("exchanging sports");
    const exchange = [
      ["/basketball/", "/badminton/"],
      ["/hockey/", "/table-tennis/"],
    ];
    for (const [mainhref, minorhref] of exchange) {
      exchangeSport(mainhref, minorhref);
    }
  })();
  window.addEventListener("beforeunload", () => {
    for (const match in tab_jobs) {
      tab_jobs[match].close();
      delete tab_jobs[match];
    }
  });
})();
