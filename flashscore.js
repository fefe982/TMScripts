// ==UserScript==
// @name         flashscore
// @namespace    http://tampermonkey.net/
// @version      2025-07-10_07-10
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

(function () {
  "use strict";
  console.log("oops, tampermonkey: " + window.location.href);
  let replaces = {
    tennis: {},
    "table-tennis": { "Calderano H.": "雨果", "Ni X.": "倪夏莲" },
    badminton: {},
  };
  let full_names = {
    "aizawa-tori": "相澤桃李",
    "an-jaehyun": "安宰贤",
    "an-se-young": "安洗莹",
    "aoyama-shuko": "青山修子",
    "bai-yan": "柏衍",
    "baek-ha-na": "白荷娜",
    "calderano-hugo": "雨果",
    "chan-hao-ching": "詹皓晴",
    "chan-baldwin-ho-wah": "陈颢桦",
    "chang-ching-hui": "张净惠",
    "chang-ko-chi": "张课琦",
    "chen-boyang": "陈柏阳",
    "chen-cheng-kuan": "陈政宽",
    "chen-fanghui": "陈芳卉",
    "chen-su-yu": "陈肃谕",
    "chen-xingtong": "陈幸同",
    "chen-yan-fei": "陈妍妃",
    "chen-yi": "陈熠",
    "chen-yuanyu": "陈垣宇",
    "chen-yufei": "陈雨菲",
    "chen-zhi-ray": "陈子睿",
    "cheng-i-ching": "郑怡静",
    "cheng-xing": "程星",
    "chiang-chien-wei": "江建苇",
    "chien-tung-chuan": "简彤娟",
    "chiu-hsiang-chieh": "邱相榤",
    "cho-daeseong": "赵大成",
    "cho-seungmin": "赵胜敏",
    "choi-haeeun": "崔海恩",
    "choi-hyojoo": "崔孝珠",
    "chong-eudice": "张玮桓",
    "chou-tien-chen": "周天成",
    "cui-jie": "崔杰",
    "doo-hoi-kem": "杜凯琹",
    "fan-shuhan": "范淑涵",
    "feng-yanzhe": "冯彦哲",
    "feng-yi-hsin": "冯翊新",
    "fukushima-yuki": "福島由紀",
    "gao-fangjie": "高昉洁",
    "guo-hanyu": "郭涵煜",
    "guo-xinwa": "郭新娃",
    "gao-xinyu": "高馨妤",
    "han-feier": "韩菲儿",
    "han-yue": "韩悦",
    "harimoto-miwa": "張本美和",
    "harimoto-tomokazu": "張本智和",
    "hashimoto-honoka": "橋本帆乃香",
    "hatano-riku": "秦野陸",
    "hayata-hina": "早田ひな",
    "he-zhi-wei": "何志伟",
    "he-zhuojia": "何卓佳",
    "hibino-nao": "日比野菜緒",
    "hirano-miu": "平野美宇",
    "ho-kwan-kit": "何钧杰",
    "ho-ray": "何承叡",
    "hontama-mai": "本玉真唯",
    "hozumi-eri": "穂積絵莉",
    "hsieh-su-wei": "谢淑薇",
    "hsieh-yi-en": "谢宜恩",
    "hsu-wen-chi": "许玟琪",
    "hsu-ya-ching": "许雅晴",
    "hsu-yu-hsiou": "许育修",
    "hu-ling-fang": "胡绫芳",
    "huang-ching-ping": "黄瀞平",
    "huang-di": "黄荻",
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
    "hung-yi-ting": "洪毅婷",
    "hung-yu-en": "洪妤恩",
    "hsieh-pei-shan": "谢沛珊",
    "hsu-yin-hui": "许尹鏸",
    "imamura-masamichi": "今村昌倫",
    "ishii-sayaka": "石井さやか",
    "ito-aoi": "伊藤あおい",
    "ito-mima": "伊藤美誠",
    "iwanaga-rin": "岩永鈴",
    "jheng-yu-chieh": "郑宇倢",
    "jia-yifan": "贾一凡",
    "jiang-xinyu": "蒋欣玗",
    "jin-yuquan": "金雨全",
    "joo-cheonhui": "朱芊曦",
    "kao-cheng-jui": "高承睿",
    "kato-miyu": "加藤未唯",
    "kihara-miyuu": "木原美悠",
    "kim-ga-eun": "金佳恩",
    "kim-hye-jeong": "金慧贞",
    "kim-nayeong": "金娜英",
    "kim-seongjin": "金成珍",
    "kim-seoyun": "金谞润",
    "kim-won-ho": "金元浩",
    "kong-hee-yong": "孔熙容",
    "kong-tsz-lam": "江芷林",
    "kuai-man": "蒯曼",
    "kuo-kuan-lin": "郭冠麟",
    "kwan-man-ho": "关文皓",
    "lai-po-yu": "赖柏佑",
    "lam-siu-hang": "林兆恒",
    "lam-yee-lok": "林依諾",
    "lee-chia-hao": "李佳豪",
    "lee-chia-hsin": "李佳馨",
    "lee-chih-chen": "李芷蓁",
    "lee-karen-man-hoi": "李凱敏",
    "lee-daeun": "李达恩",
    "lee-eunhye": "李恩惠",
    "lee-fang-chih": "李芳至",
    "lee-fang-jen": "李芳任",
    "lee-sangsu": "李尚洙",
    "lee-so-hee": "李昭希",
    "li-hon-ming": "李漢銘",
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
    "lin-chun-yi": "林俊易",
    "lin-gaoyuan": "林高远",
    "lin-hsiang-ti": "林湘缇",
    "lin-jhih-yun": "林芝昀",
    "lin-shidong": "林诗栋",
    "lin-yun-ju": "林昀儒",
    "liu-kuang-heng": "刘广珩",
    "liu-sheng-shu": "刘圣书",
    "liu-weishan": "刘炜珊",
    "liu-yang": "刘阳",
    "liu-yi": "刘毅",
    "lin-yu-chieh": "林煜杰",
    "lu-guangzu": "陆光祖",
    "lu-ming-che": "卢明哲",
    "lum-nicholas": "林文政",
    "luo-xumin": "罗徐敏",
    "ma-yexin": "马烨欣",
    "matsuda-ryuki": "松田龍樹",
    "matsumoto-mayu": "松本麻佑",
    "matsushima-sora": "松島輝空",
    "midorikawa-hiroki": "緑川大輝",
    "mitsuhashi-kenya": "三橋健也",
    "miyazaki-tomoka": "宮崎友花",
    "mochizuki-shintaro": "望月慎太郎",
    "mori-sakura": "森さくら",
    "nagasaki-miyu": "長崎美柚",
    "nakagawa-naoki": "中川直樹",
    "nakanishi-kie": "中西貴映",
    "naraoka-kodai": "奈良岡功大",
    "ng-wing-lam": "吴咏琳",
    "nidaira-natsuki": "仁平菜月",
    "ninomiya-makoto": "二宮真琴",
    "nishimoto-kenta": "西本拳太",
    "nishioka-yoshihito": "西岡良仁",
    "noguchi-rio": "野口莉央",
    "obayashi-takuma": "大林拓真",
    "odo-satsuki": "大藤沙月",
    "ogawa-shogo": "小川翔悟",
    "oh-junsung": "吴晙诚",
    "oikawa-mizuki": "及川瑞基",
    "okamura-hiroki": "岡村洋輝",
    "okuhara-nozomi": "奥原希望",
    "osaka-naomi": "大坂なおみ",
    "osawa-kaho": "大澤佳歩",
    "park-gyuhyeon": "朴奎炫",
    "po-li-wei": "柏礼维",
    "qian-tianyi": "钱天一",
    "ren-yufei": "任钰菲",
    "ryu-hanna": "柳韩娜",
    "saito-natsu": "齋藤夏",
    "sakamoto-rei": "坂本怜",
    "sano-daisuke": "佐野大輔",
    "sato-hitomi": "佐藤瞳",
    "seo-seung-jae": "徐承宰",
    "shi-han": "石瀚",
    "shi-xunyao": "石洵瑶",
    "shi-yuqi": "石宇奇",
    "shibahara-ena": "柴原瑛菜",
    "shin-yubin": "申裕斌",
    "shinozuka-hiroto": "篠塚大登",
    "su-ching-heng": "苏敬恒",
    "su-li-yang": "苏力扬",
    "suizu-manami": "水津愛美",
    "sun-fajing": "孙发京",
    "sun-liang-ching": "孙亮晴",
    "sun-yingsha": "孙颖莎",
    "sung-shuo-yun": "宋硕芸",
    "tajima-naoki": "田島尚輝",
    "takahashi-koo": "高橋洸士",
    "tan-ning": "谭宁",
    "tanabe-mai": "田部真唯",
    "tanaka-yuji": "田中湧士",
    "tanaka-yuta": "田中佑汰",
    "tang-kai-wei": "唐凯威",
    "tang-qianhui": "汤千慧",
    "te-rigele": "特日格乐",
    "teng-chun-hsun": "邓淳薰",
    "ting-yen-chen": "丁彦宸",
    "togami-shunsuke": "戸上隼輔",
    "tsai-fu-cheng": "蔡富丞",
    "tseng-chun-hsin": "曾俊欣",
    "tung-ciou-tong": "董秋彤",
    "uchijima-moyuka": "内島萌夏",
    "uda-yukiya": "宇田幸矢",
    "wang-aoran": "王傲然",
    "wang-chang": "王昶",
    "wang-chi-lin": "王齐麟",
    "wang-chuqin": "王楚钦",
    "wang-manyu": "王曼昱",
    "wang-meiling": "王美玲",
    "wang-po-wei": "王柏崴",
    "wang-xiaotong": "王晓彤",
    "wang-xinyu-2001": "王欣瑜",
    "wang-xiyu": "王曦雨",
    "wang-yidi": "王艺迪",
    "wang-zhiyi": "王祉怡",
    "wang-zhengxing": "王正行",
    "watanabe-koki": "渡邉航貴",
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
    "wu-yibing": "吴易昺",
    "xiang-peng": "向鹏",
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
    "yang-ya-yi": "杨亚依",
    "yang-yiyun": "杨屹韵",
    "yang-zhaoxuan": "杨钊煊",
    "yao-xinxin": "姚欣辛",
    "yen-yu-lin": "林彦妤",
    "yeung-nga-ting": "杨雅婷",
    "yeung-pui-lam": "杨霈霖",
    "yiu-kwan-to": "姚钧涛",
    "yokoi-sakura": "横井咲桜",
    "yoshimura-maharu": "吉村真晴",
    "yoshiyama-ryoichi": "吉山僚一",
    "yu-chien-hui": "余芊慧",
    "yuan-licen": "袁励岑",
    "yuan-yue-1998": "袁悦",
    "yunchaokete-bu": "布云朝克特",
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
    "zhu-yuling": "朱雨玲",
    "zhu-ziyu": "朱梓予",
    "Nishikori K.": "錦織圭",
    "Shang J.": "商竣程",
    "Wang Y.": "王雅繁",
    "Chang Y.": "张玉安",
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
    "Akechi H.": "明地陽菜",
    "Chan N. G.": "詹又蓁",
    "Chen Q. C.": "陈清晨",
    "Chen S. F.": "陈胜发",
    "Chen Xu Jun": "陈旭君",
    "Cheng Y.": "郑育沛",
    "Chi Y. J.": "戚又仁",
    "Chiu P.": "邱品蒨",
    "Gunawan J.": "吴英伦",
    "Guo R. H.": "郭若涵",
    "He J. T.": "何济霆",
    "Higashino A.": "東野有紗",
    "Hirokami R.": "廣上瑠依",
    "Hoki T.": "保木卓朗",
    "Huang Y. Q.": "黄雅琼",
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
    "Lee C. H. R.": "李晋熙",
    "Lee C. Y.": "李卓耀",
    "Lee J-H.": "李哲辉",
    "Lee Y. L.": "李幽琳",
    "Lei L. X.": "雷兰曦",
    "Leung Y. Y.": "梁悦仪",
    "Li W. M.": "李汶妹",
    "Lin C.": "林芷均",
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
    "Ohori A.": "大堀彩",
    "Pai Yu P.": "白驭珀",
    "Pui P. F.": "裴鹏锋",
    "Ren X. Y.": "任翔宇",
    "Sato A.": "佐藤灯",
    "Shibata K.": "柴田一樹",
    "Shida C.": "志田千陽",
    "Shin S. C.": "申昇瓒",
    "Sun Y. H.": "孙昱瑆",
    "sung-yu-hsuan": "宋祐媗",
    "Tai T. Y.": "戴资颖",
    "Tang Chun M.": "邓俊文",
    "Tsai R. L.": "蔡渃琳",
    "Tse Y. S.": "谢影雪",
    "Tsuneyama K.": "常山幹太",
    "Wang T. G.": "王汀戈",
    "Wang T. W.": "王子维",
    "Wang Y. Q.": "汪郁乔",
    "Wang Y. Z.": "王眱祯",
    "Watanabe Y.": "渡辺勇大",
    "Weng H. Y.": "翁泓阳",
    "Xie H. N.": "谢浩南",
    "Yamada N.": "山田尚輝",
    "Yang Po-Hsuan": "杨博轩",
    "Ye H. W.": "叶宏蔚",
    "Zeng W. H.": "曾维瀚",
    "Zhang Y. M.": "张艺曼",
    "Zheng S. W.": "郑思维",
    "Zheng Y.": "郑雨",
    "Zhou H. D.": "周昊东",
  };
  let nav_away = false;
  function get_match_key(href) {
    let m = href.match(/match\/[^/]+\/[^/]+/);
    return m[0];
  }
  function replace_name_player(p, href) {
    if (p.textContent.endsWith(")")) {
      return true;
    }
    let m = href.match(/\/player\/(.*)\/(.*)\//);
    if (!m) {
      return false;
    }
    let key = m[1] + "/" + m[2];
    let r = full_names[key];
    if (!r) {
      r = full_names[m[1]];
    }
    if (!r) {
      r = m[1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    if (full_names[p.textContent]) {
      r = r + " [" + full_names[p.textContent] + "]";
    }
    p.textContent = p.textContent + " (" + r + ")";
    return true;
  }
  function replace_name_match(p, match, href) {
    let n = p.textContent;
    if (!n || n.endsWith(")")) {
      return true;
    }
    let v = GM_getValue(match);
    console.log(match, v);
    if (!v) {
      console.log("attempt to nav to", href, nav_away);
      if (href) {
        GM_setValue("navback", true);
        if (!nav_away) {
          console.log("nav to", href);
          window.location.href = href;
          nav_away = true;
        }
      }
      return false;
    }
    let h = v[n];
    if (h == null) {
      console.log("attempt to nav to", href, v, n);
      if (href) {
        GM_setValue("navback", true);
        if (!nav_away) {
          console.log("nav to", href, v, n);
          window.location.href = href;
          nav_away = true;
        }
      }
      return false;
    }
    if (v.stage) {
      const tnode = p.parentNode.querySelector("div.event__time") || p.parentNode.querySelector("div.event__stage");
      if (tnode && !tnode.textContent.endsWith("]")) {
        tnode.textContent = tnode.textContent + " [" + v.stage + "]";
      }
    }
    return replace_name_player(p, h);
  }
  function replace_name(p, sport) {
    if (p.nodeType == 1 && (p.childNodes.length == 0 || p.childNodes[0].nodeType != 3)) {
      return;
    }
    let replace = replaces[sport];
    if (!replace) {
      return;
    }
    if (
      window.location.href.startsWith("https://www.flashscore.com/favorites/") ||
      window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
      window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
      window.location.href.startsWith("https://www.flashscore.com/tennis/")
    ) {
      let match = p.parentNode.querySelector("a.eventRowLink");
      if (match != null) {
        let flags = p.parentNode.querySelectorAll("span.flag");
        let href = null;
        if (replace[p.textContent]) {
          href = match.href;
        } else {
          for (let flag of flags) {
            let value = flag.attributes["title"].value;
            if (
              value == "China" ||
              value == "Taiwan" ||
              value == "Hong Kong" ||
              value == "Macao" ||
              value == "Japan" ||
              value == "South Korea"
            ) {
              href = match.href;
            }
          }
        }
        replace_name_match(p, get_match_key(match.href), href);
      }
    }
    if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
      replace_name_match(p, replace_name_match(p.parentNode.parentNode.href), null);
    }
  }
  let sport = "";
  let observer;
  function hanlde_draw_observer(node) {
    for (let p of node.querySelectorAll(".series")) {
      for (let player of p.parentNode.parentNode.querySelectorAll(".bracket__name")) {
        replace_name_match(player, get_match_key(p.href), null);
      }
      let height = p.parentNode.parentNode.childNodes[0].offsetHeight;
      p.parentNode.style.top = "calc(50% + " + height / 2 + "px)";
    }
  }
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
          for (let p of node.querySelectorAll("a.participant__participantName")) {
            replace_name_player(p, p.href);
          }
          for (let p of node.querySelectorAll(".h2h__participantInner")) {
            replace_name(p, sport);
          }
          hanlde_draw_observer(node);
        } else if (window.location.href.startsWith("https://www.flashscore.com/draw/")) {
          hanlde_draw_observer(node);
        } else if (
          window.location.href.startsWith("https://www.flashscore.com/player/") ||
          window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
          window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
          window.location.href.startsWith("https://www.flashscore.com/tennis/")
        ) {
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
      return;
    }
    function wait_for_load() {
      let key = get_match_key(window.location.href);
      console.log(key);
      let val = { t: Date.now() };
      let children = document.querySelectorAll("div.duelParticipant a.participant__participantName");
      console.log(children);
      if (children.length == 0) {
        setTimeout(wait_for_load, 1000);
        return;
      }
      let player_met = GM_getValue("__player_met", {});
      let match_time = document.querySelector("div.duelParticipant div.duelParticipant__startTime div").textContent;
      console.log(match_time);
      let m_time = /(\d+).(\d+).(\d+) (\d+):(\d+)/.exec(match_time);
      let date = 0;
      if (m_time) {
        date = new Date(m_time[3], m_time[2] - 1, m_time[1], m_time[4], m_time[5]).getTime();
      }
      for (let p of children) {
        console.log(p);
        let href = p.attributes.href.value;
        val[p.textContent] = href;
        let m = href.match(/\/player\/(.*)\/(.*)\//);
        if (!m || !date) {
          continue;
        }
        let key = m[1] + "/" + m[2];
        if (!(key in full_names)) {
          if (m[1] in full_names) {
            key = m[1];
          } else {
            key = "";
          }
        }
        if (key) {
          let odate = player_met[key] || 0;
          player_met[key] = Math.max(odate, date);
        }
      }
      let stage = document.querySelector(
        ".wcl-breadcrumbItem_CiWQ7:last-child .wcl-breadcrumbItemLabel_ogiBc"
      ).textContent;
      let stagesplit = stage.split(" - ");
      if (stagesplit.length == 2) {
        val.stage = stagesplit[1];
      }
      console.log(player_met);
      if (date) {
        GM_setValue("__player_met", player_met);
      }
      console.log(val);
      GM_setValue(key, val);
      if (GM_getValue("navback")) {
        GM_deleteValue("navback");
        history.back();
      }
    }
    wait_for_load();
  }
  if (
    window.location.href.startsWith("https://www.flashscore.com/match/") ||
    window.location.href.startsWith("https://www.flashscore.com/draw/") ||
    window.location.href.startsWith("https://www.flashscore.com/player/") ||
    window.location.href.startsWith("https://www.flashscore.com/badminton/") ||
    window.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
    window.location.href.startsWith("https://www.flashscore.com/tennis/")
  ) {
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
    replace_name_player(p, p.parentElement.href);
  }
  for (let key of GM_listValues()) {
    if (key.startsWith("__")) {
      console.log("met special key: " + key);
      continue;
    }
    let v = GM_getValue(key);
    if (!("t" in v)) {
      console.log("Deleting key without timestamp: " + key + ", " + v);
      GM_deleteValue(key);
      continue;
    }
    if (Date.now() - v.t > 1000 * 60 * 60 * 24 * 7) {
      console.log(`Deleting old value for key: ${key}`, v);
      GM_deleteValue(key);
    } else {
      console.log(`Keeping value for key: ${key}, ${(Date.now() - v.t) / 1000 / 60 / 60} hours old`, v);
    }
  }
  let player_met = GM_getValue("__player_met", {});
  for (let key in player_met) {
    if (!(key in full_names)) {
      console.log(
        `player ${key}, last met ${new Date(player_met[key]).toISOString()}, not found in full names, deleting`
      );
      delete player_met[key];
    } else if (Date.now() - player_met[key] > 1000 * 60 * 60 * 24 * 30) {
      console.log(
        `player ${key}, ${full_names[key]}, last met ${new Date(player_met[key]).toISOString()}, met ${
          (Date.now() - player_met[key]) / 1000 / 60 / 60 / 24
        } days ago`
      );
    }
  }
  GM_setValue("__player_met", player_met);
  for (let key in full_names) {
    if (!(key in player_met)) {
      console.log(`player ${key}, ${full_names[key]}, never met`);
    }
  }
})();
