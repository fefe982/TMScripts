// ==UserScript==
// @name         flashscore
// @namespace    http://tampermonkey.net/
// @version      2025-06-06_06-10
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
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    console.log("oops, tampermonkey: " + window.location.href);
    let replaces = {
        "tennis":{
            "Aoyama S.": "青山修子",
            "Bu Y.": "布云朝克特",
            "Chong E.": "张玮桓",
            "Gao X.": "高馨妤",
            "Guo H.": "郭涵煜",
            "Hibino N.": "日比野菜緒",
            "Hontama M.": "本玉真唯",
            "Hozumi E.": "穂積絵莉",
            "Hsieh S-W.": "谢淑薇",
            "Ishii S.": "石井さやか",
            "Jiang X.": "蒋欣玗",
            "Jin Y.": "金雨全",
            "Kato M.": "加藤未唯",
            "Li Z.": "李泽楷",
            "Ma Y.": "马烨欣",
            "Ninomiya M.": "二宮真琴",
            "Nishikori K.": "錦織圭",
            "Nishioka Y.": "西岡良仁",
            "Osaka N.": "大坂なおみ",
            "Ren Y.": "任钰菲",
            "Sakamoto R.": "坂本怜",
            "Shang J.": "商竣程",
            "Shi H.": "石瀚",
            "Sun F.": "孙发京",
            "Tang Q.": "汤千慧",
            "Te R.": "特日格乐",
            "Uchijima M.": "内島萌夏",
            "Wang A.": "王傲然",
            "Wang M.": "王美玲",
            "Wang Q.": "王蔷",
            "Wang Xin.": "王欣瑜",
            "Wang Xiy.": "王曦雨",
            "Wang Y.": "王雅繁",
            "Wei S.": "韦思佳",
            "Wong C.": "黄泽林",
            "Wu F.": "吴芳嫺",
            "Wu Y.": "吴易昺",
            "Xu Y.": "徐一幡",
            "Yang Y. Y.": "杨亚依",
            "Yao X.": "姚欣辛",
            "Yuan Y.": "袁悦",
            "Zhang S.": "张帅",
            "Zhang Z.": "张之臻",
            "Zheng Q.": "郑钦文",
            "Zheng S.": "郑赛赛",
            "Zhou Y.": "周意",
        },
        "table-tennis":{
            "Chan B. H. W.": "陈颢桦",
            "Chang Y.": "张玉安",
            "Chen Meng": "陈梦",
            "Chen S-Y.": "陈思羽",
            "Chen X.": "陈幸同",
            "Chen Y.": "陈熠/陈元宇",
            "Cheng I-C.": "郑怡静",
            "Chien T.": "简彤娟",
            "Doo H. K.": "杜凱琹",
            "Fan S.": "范思琦",
            "Fan Z.": "樊振东",
            "Feng Y.-H.": "冯翊新",
            "Harimoto M.": "張本美和",
            "Harimoto T.": "張本智和",
            "Hayata H.": "早田ひな",
            "He Z.": "何卓佳",
            "Hirano M.": "平野美宇",
            "Huang Y-H.": "黃怡樺",
            "Huang Y.": "黄友政",
            "Huang Y.-C.": "黄彦诚",
            "Ito M.": "伊藤美誠",
            "Jeon J.": "田志希",
            "Joo Cheonhui": "朱芊曦",
            "Kao C.-J.": "高承睿",
            "Kihara M.": "木原美悠",
            "Kim N.": "金娜英",
            "Kuai M.": "蒯曼",
            "Lam Y. L.": "林依諾",
            "Lee E.": "李恩惠",
            "Lee H. Ch.": "李皓晴",
            "Lee S.": "李尚洙",
            "Li Y. J.": "李彦军",
            "Li Y.-J.": "李昱谆",
            "Liang J.": "梁靖崑",
            "Liang Y.": "梁俨苧",
            "Liao C.-T.": "廖振珽",
            "Lin G.": "林高远",
            "Lin S.": "林诗栋",
            "Lin Y.-J.": "林昀儒",
            "Liu W.": "刘炜珊",
            "Lum N.": "林文政",
            "Ma L.": "马龙",
            "Matsushima S.": "松島輝空",
            "Mori S.": "森さくら",
            "Nagasaki M.": "長崎美柚",
            "Ni X.": "倪夏莲",
            "Qian T.": "钱天一",
            "Qin Y.": "覃予萱",
            "Shi X.": "石洵瑶",
            "Shinozuka H.": "篠塚大登",
            "Suh H.": "徐孝元",
            "Sun Y.": "孙颖莎",
            "Tanaka Y.": "田中佑汰",
            "Togami S.": "戸上隼輔",
            "Uda Y.": "宇田幸矢",
            "Wang C.": "王楚钦",
            "Wang M.": "王曼昱",
            "Wang X.": "王晓彤",
            "Wang Yidi": "王艺迪",
            "Wen R.": "温瑞波",
            "Wong Chun Ting": "黄镇廷",
            "Xiang P.": "向鹏",
            "Xu H.": "徐海东",
            "Xu Yi": "徐奕",
            "Xu Yingbin": "徐瑛彬",
            "Xue F.": "薛飞",
            "Yiu K. T.": "姚钧涛",
            "Yokotani J.": "横谷晟",
            "Yoshimura M.": "吉村真晴",
            "Yoshiyama R.": "吉山僚一",
            "Yuan L.": "袁励岑",
            "Zeng B.": "曾蓓勋",
            "Zhou Q.": "周启豪",
            "Zhu C.": "朱成竹",
            "Zhu Y.": "朱雨玲",
            "Zong G.": "纵歌曼",
        },
        "badminton": {
            "Akechi H.": "明地陽菜",
            "Baek H. N.": "白荷娜",
            "Chan N. G.": "詹又蓁",
            "Chang C. H.": "张净惠",
            "Chen B. Y.": "陈柏阳",
            "Chen C. K.": "陈政宽",
            "Chen F. H.": "陈芳卉",
            "Chen Q. C.": "陈清晨",
            "Chen S. F.": "陈胜发",
            "Chen Xu Jun": "陈旭君",
            "Chen Z. R.": "陈子睿",
            "Cheng X.": "程星",
            "Cheng Y.": "郑育沛",
            "Chi Y. J.": "戚又仁",
            "Chiang C.": "江建苇",
            "Chiu H. C.": "邱相榤",
            "Chiu P.": "邱品蒨",
            "Chou T. Ch.": "周天成",
            "Gao F. J.": "高昉洁",
            "Gunawan J.": "吴英伦",
            "Guo R. H.": "郭若涵",
            "Guo X. W.": "郭新娃",
            "Han Y.": "韩悦",
            "Hatano R.": "秦野陸",
            "He J. T.": "何济霆",
            "Higashino A.": "東野有紗",
            "Hirokami R.": "廣上瑠依",
            "Hoki T.": "保木卓朗",
            "Hu Ling F.": "胡绫芳",
            "Huang D.": "黄荻",
            "Huang Y. K.": "黄郁岂",
            "Huang Y. Q.": "黄雅琼",
            "Hung E-T.": "洪恩慈",
            "Hsieh P. S.": "谢沛珊",
            "Hsu W. Ch.": "许玟琪",
            "Hsu Y. H.": "许尹鏸",
            "Ishikawa K.": "石川心菜",
            "Iwanaga R.": "岩永鈴",
            "Jeon H. J.": "全奕陈",
            "Jia Y. F.": "贾一凡",
            "Jiang Z. B.": "蒋振邦",
            "Jheng Y. C.": "郑宇倢",
            "Kaneko Y.": "金子祐樹",
            "Kato Y.": "加藤佑奈",
            "Kawazoe M.": "川添麻依子",
            "Keng S. L.": "坑姝良",
            "Kim S. Y.": "金昭映",
            "Kobayashi Y.": "小林優吾",
            "Konegawa M.": "古根川美桜",
            "Kong H. Y.": "孔熙容",
            "Konishi H.": "小西春七",
            "Kurihara A.": "栗原あかり",
            "Lee C. C.": "李芷蓁",
            "Lee C. H.": "李佳豪",
            "Lee C. H. R.": "李晋熙",
            "Lee C. Y.": "李卓耀",
            "Lee F. C": "李芳至",
            "Lee F. J.": "李芳任",
            "Lee J-H.": "李哲辉",
            "Lee S. H.": "李昭希",
            "Lee Y. L.":"李幽琳",
            "Lei L. X.": "雷兰曦",
            "Leung Y. Y.": "梁悦仪",
            "Li Y. J.": "李怡婧",
            "Li S. F.": "李诗沣",
            "Li W. M.": "李汶妹",
            "Liang T. Y.": "梁庭瑜",
            "Liang W. K.": "梁伟铿",
            "Liao J.-F.": "廖倬甫",
            "Lin Bing-Wei": "林秉纬",
            "Lin C.": "林芷均",
            "Lin Chun-Yi": "林俊易",
            "Lin H. T.": "林湘缇",
            "Lin J. Y.": "林芝昀",
            "Lin Y. C.": "林煜杰",
            "Liu K. H.": "刘广珩",
            "Liu L.": "刘亮",
            "Liu S. S.": "刘圣书",
            "Liu Y.": "刘毅",
            "Lo S. Y. H.": "卢善恩",
            "Lu C. Y.": "卢敬尧",
            "Lu G. Z.": "陆光祖",
            "Lu Ming Che": "卢明哲",
            "Luo X. M.": "罗徐敏",
            "Matsumoto M.": "松本麻佑",
            "Matsutomo M.": "松友美佐紀",
            "Matsuyama N.": "松山奈未",
            "Midorikawa H.": "緑川大輝",
            "Mitsuhashi K.": "三橋健也",
            "Miyazaki T.": "宮崎友花",
            "Nagahara W.": "永原和可那",
            "Nakanishi K.": "中西貴映",
            "Naraoka K.": "奈良岡功大",
            "Ng Ka L. A.": "伍家朗",
            "Ng Tsz Y.": "吴芷柔",
            "Ng W. Y.": "吴咏瑢",
            "Nidaira N.": "仁平菜月",
            "Nishi H.": "西大輝",
            "Nishimoto K.": "西本拳太",
            "Obayashi T.": "大林拓真",
            "Ohori A.": "大堀彩",
            "Okamura H.": "岡村洋輝",
            "Okuhara N.": "奥原希望",
            "Pai Yu P.": "白驭珀",
            "Pui P. F.": "裴鹏锋",
            "Ren X. Y.": "任翔宇",
            "Saito N.": "齋藤夏",
            "Sato A.": "佐藤灯",
            "Shi Y. Q.": "石宇奇",
            "Shibata K.": "柴田一樹",
            "Shida C.": "志田千陽",
            "Shin S. C.": "申昇瓒",
            "Su C. H.": "苏敬恒",
            "Su L. Y.": "苏力扬",
            "Suizu M.": "水津愛美",
            "Sun Y. H.": "孙昱瑆",
            "Sung S. Y.": "宋硕芸",
            "Sung Y.": "宋祐媗",
            "Tai T. Y.": "戴资颖",
            "Takahashi K.": "高橋洸士",
            "Tan N.": "谭宁",
            "Tanaka Y.": "田中湧士",
            "Tang Chun M.": "邓俊文",
            "Teng Ch. H.": "邓淳薰",
            "Tsai R. L.": "蔡渃琳",
            "Tse Y. S.": "谢影雪",
            "Tsuneyama K.": "常山幹太",
            "Wang C.": "王昶",
            "Wang Chi-Lin": "王齐麟",
            "Wang P.": "王柏崴",
            "Wang T. G.": "王汀戈",
            "Wang T. W.": "王子维",
            "Wang Y. Q.": "汪郁乔",
            "Wang Y. Z.": "王眱祯",
            "Wang Z. X.": "王正行",
            "Wang Z. Y.": "王祉怡",
            "Watanabe K.": "渡邉航貴",
            "Watanabe Y.": "渡辺勇大",
            "Wei C. W.": "魏俊纬",
            "Wei Y. X.": "魏雅欣",
            "Weng H. Y.": "翁泓阳",
            "Wu H.": "吴轩毅",
            "Xie H. N.": "谢浩南",
            "Yamada N.": "山田尚輝",
            "Yamaguchi A.": "山口茜",
            "Yang C. T.": "杨景惇",
            "Yang C. Y.": "杨筑云",
            "Yang P. H.": "杨博涵",
            "Yang Po-Hsuan": "杨博轩",
            "Ye H. W.": "叶宏蔚",
            "Yen Yu L.": "林彦妤",
            "Yeung Nga T.": "杨雅婷",
            "Yeung P. L.": "杨霈霖",
            "Yu C. H.": "余芊慧",
            "Zeng W. H.": "曾维瀚",
            "Zhang C.": "张驰",
            "Zhang S. X.": "张殊贤",
            "Zhang Y. M.": "张艺曼",
            "Zheng S. W.": "郑思维",
            "Zheng Y.": "郑雨",
            "Zhou H. D.": "周昊东",
        }
    }
    let full_names = {
        "an-se-young": "安洗莹",
        "chen-boyang": "陈柏阳",
        "chen-fanghui": "陈芳卉",
        "chen-yufei": "陈雨菲",
        "cheng-xing": "程星",
        "chiu-hsiang-chieh": "邱相榤",
        "chou-tien-chen": "周天成",
        "cui-jie": "崔杰",
        "feng-yanzhe": "冯彦哲",
        "fukushima-yuki": "福島由紀",
        "gao-fangjie": "高昉洁",
        "guo-xinwa": "郭新娃",
        "han-yue": "韩悦",
        "hozumi-eri": "穂積絵莉",
        "hsu-wen-chi": "许玟琪",
        "hu-ling-fang": "胡绫芳",
        "huang-di": "黄荻",
        "hung-en-tzu": "洪恩慈",
        "hsieh-pei-shan": "谢沛珊",
        "iwanaga-rin": "岩永鈴",
        "jheng-yu-chieh": "郑宇倢",
        "jia-yifan": "贾一凡",
        "jiang-xinyu": "蒋欣玗",
        "kim-ga-eun": "金佳恩",
        "kim-hye-jeong": "金慧贞",
        "kim-won-ho": "金元浩",
        "kong-hee-yong": "孔熙容",
        "lee-chia-hao": "李佳豪",
        "li-yijing": "李怡婧",
        "li-shifeng": "李诗沣",
        "liang-weikeng": "梁伟铿",
        "lin-chun-yi": "林俊易",
        "lin-hsiang-ti": "林湘缇",
        "liu-kuang-heng": "刘广珩",
        "liu-sheng-shu": "刘圣书",
        "liu-yang": "刘阳",
        "liu-yi": "刘毅",
        "lu-guangzu": "陆光祖",
        "luo-xumin": "罗徐敏",
        "matsumoto-mayu": "松本麻佑",
        "midorikawa-hiroki": "緑川大輝",
        "mitsuhashi-kenya": "三橋健也",
        "miyazaki-tomoka": "宮崎友花",
        "nakanishi-kie": "中西貴映",
        "naraoka-kodai": "奈良岡功大",
        "nidaira-natsuki": "仁平菜月",
        "okamura-hiroki": "岡村洋輝",
        "saito-natsu": "齋藤夏",
        "seo-seung-jae": "徐承宰",
        "shi-yuqi": "石宇奇",
        "sung-shuo-yun": "宋硕芸",
        "tan-ning": "谭宁",
        "tanaka-yuji": "田中湧士",
        "te-rigele": "特日格乐",
        "teng-chun-hsun": "邓淳薰",
        "wang-aoran": "王傲然",
        "wang-chang": "王昶",
        "wang-chi-lin": "王齐麟",
        "wang-xinyu-2001": "王欣瑜",
        "wang-zhiyi": "王祉怡",
        "wang-zhengxing": "王正行",
        "watanabe-koki": "渡邉航貴",
        "wei-yaxin": "魏雅欣",
        "wu-fang-hsien": "吴芳嫺",
        "wu-yibing": "吴易昺",
        "yamaguchi-akane": "山口茜",
        "yamashita-kyohei": "山下恭平",
        "yang-chu-yun": "杨筑云",
        "yang-po-han": "杨博涵",
        "yeung-nga-ting": "杨雅婷",
        "yeung-pui-lam": "杨霈霖",
        "yu-chien-hui": "余芊慧",
        "yuan-yue-1998": "袁悦",
        "yunchaokete-bu": "布云朝克特",
        "zhang-chi": "张驰",
        "zhang-shuai": "张帅",
        "zhang-shuxian": "张殊贤",
        "zhang-zhizhen": "张之臻",
        "zheng-qinwen": "郑钦文",
        "zheng-saisai": "郑赛赛",
        "zhou-yi": "周意",
        "Aoyama S.": "青山修子",
        "Chong E.": "张玮桓",
        "Gao X.": "高馨妤",
        "Guo H.": "郭涵煜",
        "Hibino N.": "日比野菜緒",
        "Hontama M.": "本玉真唯",
        "Hsieh S-W.": "谢淑薇",
        "Ishii S.": "石井さやか",
        "Jin Y.": "金雨全",
        "Kato M.": "加藤未唯",
        "Li Z.": "李泽楷",
        "Ma Y.": "马烨欣",
        "Ninomiya M.": "二宮真琴",
        "Nishikori K.": "錦織圭",
        "Nishioka Y.": "西岡良仁",
        "Osaka N.": "大坂なおみ",
        "Ren Y.": "任钰菲",
        "Sakamoto R.": "坂本怜",
        "Shang J.": "商竣程",
        "Shi H.": "石瀚",
        "Sun F.": "孙发京",
        "Tang Q.": "汤千慧",
        "Uchijima M.": "内島萌夏",
        "Wang A.": "王傲然",
        "Wang M.": "王美玲",
        "Wang Q.": "王蔷",
        "Wang Xiy.": "王曦雨",
        "Wang Y.": "王雅繁",
        "Wei S.": "韦思佳",
        "Wong C.": "黄泽林",
        "Xu Y.": "徐一幡",
        "Yang Y. Y.": "杨亚依",
        "Yao X.": "姚欣辛",
        "Chan B. H. W.": "陈颢桦",
        "Chang Y.": "张玉安",
        "Chen Meng": "陈梦",
        "Chen S-Y.": "陈思羽",
        "Chen X.": "陈幸同",
        "Chen Y.": "陈熠/陈元宇",
        "Cheng I-C.": "郑怡静",
        "Chien T.": "简彤娟",
        "Doo H. K.": "杜凱琹",
        "Fan S.": "范思琦",
        "Fan Z.": "樊振东",
        "Feng Y.-H.": "冯翊新",
        "Harimoto M.": "張本美和",
        "Harimoto T.": "張本智和",
        "Hayata H.": "早田ひな",
        "He Z.": "何卓佳",
        "Hirano M.": "平野美宇",
        "Huang Y-H.": "黃怡樺",
        "Huang Y.": "黄友政",
        "Huang Y.-C.": "黄彦诚",
        "Ito M.": "伊藤美誠",
        "Jeon J.": "田志希",
        "Joo Cheonhui": "朱芊曦",
        "Kao C.-J.": "高承睿",
        "Kihara M.": "木原美悠",
        "Kim N.": "金娜英",
        "Kuai M.": "蒯曼",
        "Lam Y. L.": "林依諾",
        "Lee E.": "李恩惠",
        "Lee H. Ch.": "李皓晴",
        "Lee S.": "李尚洙",
        "Li Y. J.": "李彦军",
        "Li Y.-J.": "李昱谆",
        "Liang J.": "梁靖崑",
        "Liang Y.": "梁俨苧",
        "Liao C.-T.": "廖振珽",
        "Lin G.": "林高远",
        "Lin S.": "林诗栋",
        "Lin Y.-J.": "林昀儒",
        "Liu W.": "刘炜珊",
        "Lum N.": "林文政",
        "Ma L.": "马龙",
        "Matsushima S.": "松島輝空",
        "Mori S.": "森さくら",
        "Nagasaki M.": "長崎美柚",
        "Ni X.": "倪夏莲",
        "Qian T.": "钱天一",
        "Qin Y.": "覃予萱",
        "Shi X.": "石洵瑶",
        "Shinozuka H.": "篠塚大登",
        "Suh H.": "徐孝元",
        "Sun Y.": "孙颖莎",
        "Tanaka Y.": "田中佑汰",
        "Togami S.": "戸上隼輔",
        "Uda Y.": "宇田幸矢",
        "Wang C.": "王楚钦",
        "Wang M.": "王曼昱",
        "Wang X.": "王晓彤",
        "Wang Yidi": "王艺迪",
        "Wen R.": "温瑞波",
        "Wong Chun Ting": "黄镇廷",
        "Xiang P.": "向鹏",
        "Xu H.": "徐海东",
        "Xu Yi": "徐奕",
        "Xu Yingbin": "徐瑛彬",
        "Xue F.": "薛飞",
        "Yiu K. T.": "姚钧涛",
        "Yokotani J.": "横谷晟",
        "Yoshimura M.": "吉村真晴",
        "Yoshiyama R.": "吉山僚一",
        "Yuan L.": "袁励岑",
        "Zeng B.": "曾蓓勋",
        "Zhou Q.": "周启豪",
        "Zhu C.": "朱成竹",
        "Zhu Y.": "朱雨玲",
        "Zong G.": "纵歌曼",
        "Akechi H.": "明地陽菜",
        "Baek H. N.": "白荷娜",
        "Chan N. G.": "詹又蓁",
        "Chang C. H.": "张净惠",
        "Chen C. K.": "陈政宽",
        "Chen Q. C.": "陈清晨",
        "Chen S. F.": "陈胜发",
        "Chen Xu Jun": "陈旭君",
        "Chen Z. R.": "陈子睿",
        "Cheng Y.": "郑育沛",
        "Chi Y. J.": "戚又仁",
        "Chiang C.": "江建苇",
        "Chiu P.": "邱品蒨",
        "Gunawan J.": "吴英伦",
        "Guo R. H.": "郭若涵",
        "Hatano R.": "秦野陸",
        "He J. T.": "何济霆",
        "Higashino A.": "東野有紗",
        "Hirokami R.": "廣上瑠依",
        "Hoki T.": "保木卓朗",
        "Huang Y. K.": "黄郁岂",
        "Huang Y. Q.": "黄雅琼",
        "Hsu Y. H.": "许尹鏸",
        "Ishikawa K.": "石川心菜",
        "Jeon H. J.": "全奕陈",
        "Jiang Z. B.": "蒋振邦",
        "Kaneko Y.": "金子祐樹",
        "Kato Y.": "加藤佑奈",
        "Kawazoe M.": "川添麻依子",
        "Keng S. L.": "坑姝良",
        "Kim S. Y.": "金昭映",
        "Kobayashi Y.": "小林優吾",
        "Konegawa M.": "古根川美桜",
        "Konishi H.": "小西春七",
        "Kurihara A.": "栗原あかり",
        "Lee C. C.": "李芷蓁",
        "Lee C. H. R.": "李晋熙",
        "Lee C. Y.": "李卓耀",
        "Lee F. C": "李芳至",
        "Lee F. J.": "李芳任",
        "Lee J-H.": "李哲辉",
        "Lee S. H.": "李昭希",
        "Lee Y. L.":"李幽琳",
        "Lei L. X.": "雷兰曦",
        "Leung Y. Y.": "梁悦仪",
        "Li W. M.": "李汶妹",
        "Liang T. Y.": "梁庭瑜",
        "Liao J.-F.": "廖倬甫",
        "Lin Bing-Wei": "林秉纬",
        "Lin C.": "林芷均",
        "Lin J. Y.": "林芝昀",
        "Lin Y. C.": "林煜杰",
        "Liu L.": "刘亮",
        "Lo S. Y. H.": "卢善恩",
        "Lu C. Y.": "卢敬尧",
        "Lu Ming Che": "卢明哲",
        "Matsutomo M.": "松友美佐紀",
        "Matsuyama N.": "松山奈未",
        "Nagahara W.": "永原和可那",
        "Ng Ka L. A.": "伍家朗",
        "Ng Tsz Y.": "吴芷柔",
        "Ng W. Y.": "吴咏瑢",
        "Nishi H.": "西大輝",
        "Nishimoto K.": "西本拳太",
        "Obayashi T.": "大林拓真",
        "Ohori A.": "大堀彩",
        "Okuhara N.": "奥原希望",
        "Pai Yu P.": "白驭珀",
        "Pui P. F.": "裴鹏锋",
        "Ren X. Y.": "任翔宇",
        "Sato A.": "佐藤灯",
        "Shibata K.": "柴田一樹",
        "Shida C.": "志田千陽",
        "Shin S. C.": "申昇瓒",
        "Su C. H.": "苏敬恒",
        "Su L. Y.": "苏力扬",
        "Suizu M.": "水津愛美",
        "Sun Y. H.": "孙昱瑆",
        "Sung Y.": "宋祐媗",
        "Tai T. Y.": "戴资颖",
        "Takahashi K.": "高橋洸士",
        "Tang Chun M.": "邓俊文",
        "Tsai R. L.": "蔡渃琳",
        "Tse Y. S.": "谢影雪",
        "Tsuneyama K.": "常山幹太",
        "Wang P.": "王柏崴",
        "Wang T. G.": "王汀戈",
        "Wang T. W.": "王子维",
        "Wang Y. Q.": "汪郁乔",
        "Wang Y. Z.": "王眱祯",
        "Watanabe Y.": "渡辺勇大",
        "Wei C. W.": "魏俊纬",
        "Weng H. Y.": "翁泓阳",
        "Wu H.": "吴轩毅",
        "Xie H. N.": "谢浩南",
        "Yamada N.": "山田尚輝",
        "Yang C. T.": "杨景惇",
        "Yang Po-Hsuan": "杨博轩",
        "Ye H. W.": "叶宏蔚",
        "Yen Yu L.": "林彦妤",
        "Zeng W. H.": "曾维瀚",
        "Zhang Y. M.": "张艺曼",
        "Zheng S. W.": "郑思维",
        "Zheng Y.": "郑雨",
        "Zhou H. D.": "周昊东",
    }
    let nav_away = false;
    function replace_name_player(p, href) {
        if (p.textContent.endsWith(")")) {
            return true;
        }
        let m = href.match(/\/player\/(.*)\/(.*)\//)
        if (!m) {
            return false
        }
        let key = m[1] + "/" + m[2]
        let r = full_names[key]
        if (!r) {
            r = full_names[m[1]]
        }
        if (!r) {
            r = m[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }
        p.textContent = p.textContent + " (" + r + ")";
        return true
    }
    function replace_name_match(p, match, href) {
        let n = p.textContent
        if (n.endsWith(")")) {
            return true;
        }
        let v = GM_getValue(match)
        console.log(match, v)
        if (!v) {
            console.log("attempt to nav to", href)
            if (href) {
                GM_setValue("navback", true)
                if (!nav_away) {
                    console.log("nav to", href)
                    window.location.href = href
                    nav_away = true
                }
            }
            return false
        }
        let h = v[n]
        if (h == null) {
            console.log("attempt to nav to", href, v, n)
            if (href) {
                GM_setValue("navback", true)
                if (!nav_away) {
                   console.log("nav to", href, v, n)
                    window.location.href = href
                    nav_away = true
                }
            }
            return false
        }
        return replace_name_player(p, h);
    }
    function replace_name(p, sport) {
        if (p.nodeType == 1 && (p.childNodes.length != 1 || p.childNodes[0].nodeType != 3)) {
            return;
        }
        let replace = replaces[sport];
        if (!replace) {
            return;
        }
        if (window.location.href.startsWith("https://www.flashscore.com/favorites/")) {
            let match = p.parentNode.querySelector("a.eventRowLink")
            if (match != null) {
                let m = match.href.match(/match\/[^/]+\/[^/]+/)
                console.log(m[0])
                if (replace_name_match(p, m[0], match.href)) {
                    return
                }
            }
        }
        let r = replace[p.textContent];
        if (r) {
            p.textContent = p.textContent + " (" + r + ")";
        }
    }
    let sport = "";
    let observer;
    observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type != "childList") {
                continue;
            }
            for (let node of mutation.addedNodes) {
                if (node.nodeType != 1) {
                    continue;
                }
                let children = node.getElementsByClassName("leftMenu__text");
                for (let p of children) {
                    console.log("mutate left menu", p, p.parentElement.href);
                    replace_name_player(p, p.parentElement.href);
                }
                if (window.location.href.startsWith("https://www.flashscore.com/favorites/")) {
                    let children = node.getElementsByClassName("event__participant");
                    for (let p of children) {
                        let sport = p.parentElement.parentElement.classList[1];
                        console.log(sport);
                        replace_name(p, sport);
                    }
                } else if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
                    // console.log(node);
                    let children = node.getElementsByClassName("participant__participantName");
                    for (let p of children) {
                        console.log(p);
                        if (p.childNodes.length == 2 && p.childNodes[1].nodeType == 3) {
                            console.log(p.childNodes[1]);
                            replace_name(p.childNodes[1], sport);
                        }
                    }
                    children = node.querySelectorAll(".h2h__participantInner, .bracket__name");
                    for (let p of children) {
                        replace_name(p, sport);
                    }
                } else if (window.location.href.startsWith("https://www.flashscore.com/draw/")) {
                    let children = node.getElementsByClassName("bracket__name");
                    for (let p of children) {
                        replace_name(p, sport);
                    }
                } else if (window.location.href.startsWith("https://www.flashscore.com/player/")||
                           window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
                           window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
                           window.location.href.startsWith("https://www.flashscore.com/tennis/")) {
                    let children = node.getElementsByClassName("event__participant");
                    for (let p of children) {
                        replace_name(p, sport);
                    }
                }
            }
        }
    });

    observer.observe(document.body, { subtree: true, childList: true });
    if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
        if (window.location.href.indexOf("#") < 0) {
            return
        }
        let m = window.location.href.match(/match\/[^/]+\/[^/]+/)
        let key = m[0]
        console.log(m[0])
        let val = {t: Date.now()}
        let children = document.querySelectorAll("div.duelParticipant a.participant__participantName");
        console.log(children)
        for (let p of children) {
            console.log(p)
            val[p.textContent] = p.attributes.href.value
        }
        console.log(val)
        GM_setValue(key, val)
        if (GM_getValue("navback")) {
            GM_deleteValue("navback")
            history.back()
        }
    }
    if (window.location.href.startsWith("https://www.flashscore.com/match/") ||
        window.location.href.startsWith("https://www.flashscore.com/draw/") ||
        window.location.href.startsWith("https://www.flashscore.com/player/") ||
        window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
        window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
        window.location.href.startsWith("https://www.flashscore.com/tennis/")) {
        let sport_eles = document.body.querySelectorAll("body > sport");
        console.log(sport_eles.length);
        sport = sport_eles[0].getAttribute("name");
        console.log(sport);
        let children = document.querySelectorAll(".participant__participantName:not(:has(.participant__participantName))");
        for (let p of children) {
            if (p.tagName == "A") {
                replace_name_player(p, p.href);
            } else {
                replace_name(p, sport);
            }
        }
    }
    let children = document.getElementsByClassName("leftMenu__text");
    for (let p of children) {
        // console.log(p);
        // console.log(p.parentElement.href);
        replace_name_player(p, p.parentElement.href);
    }
    for (let key of GM_listValues()) {
        let v = GM_getValue(key);
        if (Date.now() - v.t > 1000 * 60 * 60 * 24 * 7) {
            console.log(`Deleting old value for key: ${key}`, v);
            GM_deleteValue(key);
        } else {
            console.log(`Keeping value for key: ${key}, ${(Date.now() - v.t)/1000/60/60} hours old`, v);
        }
    }
})();