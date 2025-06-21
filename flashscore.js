// ==UserScript==
// @name         flashscore
// @namespace    http://tampermonkey.net/
// @version      2025-06-21_09-37
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
    "an-se-young": "安洗莹",
    "baek-ha-na": "白荷娜",
    "calderano-hugo": "雨果",
    "chan-baldwin-ho-wah": "陳顥樺",
    "chen-boyang": "陈柏阳",
    "chen-fanghui": "陈芳卉",
    "chen-yi": "陈熠",
    "chen-yuanyu": "陈元宇",
    "chen-yufei": "陈雨菲",
    "cheng-xing": "程星",
    "chiu-hsiang-chieh": "邱相榤",
    "choi-hyojoo": "崔孝珠",
    "chong-eudice": "张玮桓",
    "chou-tien-chen": "周天成",
    "cui-jie": "崔杰",
    "doo-hoi-kem": "杜凱琹",
    "fan-shuhan": "范淑涵",
    "feng-yanzhe": "冯彦哲",
    "feng-yi-hsin": "冯翊新",
    "fukushima-yuki": "福島由紀",
    "gao-fangjie": "高昉洁",
    "guo-xinwa": "郭新娃",
    "han-feier": "韩菲儿",
    "han-yue": "韩悦",
    "harimoto-miwa": "張本美和",
    "harimoto-tomokazu": "張本智和",
    "hayata-hina": "早田ひな",
    "he-zhuojia": "何卓佳",
    "ho-kwan-kit": "何鈞傑",
    "hozumi-eri": "穂積絵莉",
    "hsieh-su-wei": "谢淑薇",
    "hsu-wen-chi": "许玟琪",
    "hsu-yu-hsiou": "许尹鏸",
    "hu-ling-fang": "胡绫芳",
    "huang-di": "黄荻",
    "huang-youzheng": "黄友政",
    "hung-en-tzu": "洪恩慈",
    "hsieh-pei-shan": "谢沛珊",
    "iwanaga-rin": "岩永鈴",
    "jheng-yu-chieh": "郑宇倢",
    "jia-yifan": "贾一凡",
    "jiang-xinyu": "蒋欣玗",
    "joo-cheonhui": "朱芊曦",
    "kao-cheng-jui": "高承睿",
    "kato-miyu": "加藤未唯",
    "kihara-miyuu": "木原美悠",
    "kim-ga-eun": "金佳恩",
    "kim-hye-jeong": "金慧贞",
    "kim-nayeong": "金娜英",
    "kim-won-ho": "金元浩",
    "kong-hee-yong": "孔熙容",
    "kong-tsz-lam": "江芷林",
    "lam-yee-lok": "林依諾",
    "lee-chia-hao": "李佳豪",
    "lee-karen-man-hoi": "李凱敏",
    "lee-eunhye": "李恩惠",
    "lee-so-hee": "李昭希",
    "li-hon-ming": "李漢銘",
    "li-yijing": "李怡婧",
    "li-shifeng": "李诗沣",
    "liang-weikeng": "梁伟铿",
    "lim-jonghoon": "林钟勋",
    "lin-chun-yi": "林俊易",
    "lin-hsiang-ti": "林湘缇",
    "liu-kuang-heng": "刘广珩",
    "liu-sheng-shu": "刘圣书",
    "liu-weishan": "刘炜珊",
    "liu-yang": "刘阳",
    "liu-yi": "刘毅",
    "lu-guangzu": "陆光祖",
    "luo-xumin": "罗徐敏",
    "ma-yexin": "马烨欣",
    "matsumoto-mayu": "松本麻佑",
    "matsushima-sora": "松島輝空",
    "midorikawa-hiroki": "緑川大輝",
    "mitsuhashi-kenya": "三橋健也",
    "miyazaki-tomoka": "宮崎友花",
    "nagasaki-miyu": "長崎美柚",
    "nakanishi-kie": "中西貴映",
    "naraoka-kodai": "奈良岡功大",
    "ng-wing-lam": "吳詠琳",
    "nidaira-natsuki": "仁平菜月",
    "ninomiya-makoto": "二宮真琴",
    "odo-satsuki": "大藤沙月",
    "oh-junsung": "吴晙诚",
    "okamura-hiroki": "岡村洋輝",
    "osaka-naomi": "大坂なおみ",
    "qian-tianyi": "钱天一",
    "ryu-hanna": "柳韩娜",
    "saito-natsu": "齋藤夏",
    "sakamoto-rei": "坂本怜",
    "sato-hitomi": "佐藤瞳",
    "seo-seung-jae": "徐承宰",
    "shi-xunyao": "石洵瑶",
    "shi-yuqi": "石宇奇",
    "shin-yubin": "申裕斌",
    "shinozuka-hiroto": "篠塚大登",
    "sun-fajing": "孙发京",
    "sung-shuo-yun": "宋硕芸",
    "tan-ning": "谭宁",
    "tanaka-yuji": "田中湧士",
    "tanaka-yuta": "田中佑汰",
    "te-rigele": "特日格乐",
    "teng-chun-hsun": "邓淳薰",
    "togami-shunsuke": "戸上隼輔",
    "wang-aoran": "王傲然",
    "wang-chang": "王昶",
    "wang-chi-lin": "王齐麟",
    "wang-meiling": "王美玲",
    "wang-xiaotong": "王晓彤",
    "wang-xinyu-2001": "王欣瑜",
    "wang-xiyu": "王曦雨",
    "wang-zhiyi": "王祉怡",
    "wang-zhengxing": "王正行",
    "watanabe-koki": "渡邉航貴",
    "wei-yaxin": "魏雅欣",
    "wen-ruibo": "温瑞博",
    "wong-chun-ting": "黃鎮廷",
    "wu-fang-hsien": "吴芳嫺",
    "wu-yibing": "吴易昺",
    "xiang-peng": "向鹏",
    "xu-haidong": "徐海东",
    "xu-yi": "徐奕",
    "xu-yi-fan": "徐一幡",
    "xu-yingbin": "徐瑛彬",
    "xue-fei": "薛飞",
    "yamaguchi-akane": "山口茜",
    "yamashita-kyohei": "山下恭平",
    "yang-chu-yun": "杨筑云",
    "yang-po-han": "杨博涵",
    "yang-ya-yi": "杨亚依",
    "yang-yiyun": "杨屹韵",
    "yang-zhaoxuan": "杨钊煊",
    "yao-xinxin": "姚欣辛",
    "yeung-nga-ting": "杨雅婷",
    "yeung-pui-lam": "杨霈霖",
    "yiu-kwan-to": "姚鈞濤",
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
    "zhu-ziyu": "朱梓予",
    "Aoyama S.": "青山修子",
    "Gao X.": "高馨妤",
    "Guo H.": "郭涵煜",
    "Hibino N.": "日比野菜緒",
    "Hontama M.": "本玉真唯",
    "Ishii S.": "石井さやか",
    "Jin Y.": "金雨全",
    "Li Z.": "李泽楷",
    "Nishikori K.": "錦織圭",
    "Nishioka Y.": "西岡良仁",
    "Ren Y.": "任钰菲",
    "Shang J.": "商竣程",
    "Shi H.": "石瀚",
    "Tang Q.": "汤千慧",
    "Uchijima M.": "内島萌夏",
    "Wang Q.": "王蔷",
    "Wang Y.": "王雅繁",
    "Wei S.": "韦思佳",
    "Wong C.": "黄泽林",
    "Chang Y.": "张玉安",
    "Chen Meng": "陈梦",
    "Chen S-Y.": "陈思羽",
    "Chen X.": "陈幸同",
    "Cheng I-C.": "郑怡静",
    "Chien T.": "简彤娟",
    "Fan S.": "范思琦",
    "Fan Z.": "樊振东",
    "Hirano M.": "平野美宇",
    "Huang Y-H.": "黃怡樺",
    "Huang Y.-C.": "黄彦诚",
    "Ito M.": "伊藤美誠",
    "Jeon J.": "田志希",
    "Kuai M.": "蒯曼",
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
    "Lum N.": "林文政",
    "Ma L.": "马龙",
    "Mori S.": "森さくら",
    "Ni X.": "倪夏莲",
    "Qin Y.": "覃予萱",
    "Suh H.": "徐孝元",
    "Sun Y.": "孙颖莎",
    "Uda Y.": "宇田幸矢",
    "Wang C.": "王楚钦",
    "Wang M.": "王曼昱",
    "Wang Yidi": "王艺迪",
    "Wen R.": "温瑞波",
    "Yokotani J.": "横谷晟",
    "Zeng B.": "曾蓓勋",
    "Zhu Y.": "朱雨玲",
    "Zong G.": "纵歌曼",
    "Akechi H.": "明地陽菜",
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
    "Lee Y. L.": "李幽琳",
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
  };
  let nav_away = false;
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
    if (n.endsWith(")")) {
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
              value == "Japan" ||
              value == "South Korea"
            ) {
              href = match.href;
            }
          }
        }
        let m = match.href.match(/match\/[^/]+\/[^/]+/);
        console.log(m[0]);
        replace_name_match(p, m[0], href);
      }
    }
    if (window.location.href.startsWith("https://www.flashscore.com/match/")) {
      let m = p.parentNode.parentNode.href.match(/match\/[^/]+\/[^/]+/);
      console.log(m[0]);
      replace_name_match(p, m[0], null);
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
          for (let p of node.querySelectorAll("a.participant__participantName")) {
            replace_name_player(p, p.href);
          }
          for (let p of node.querySelectorAll(".h2h__participantInner")) {
            replace_name(p, sport);
          }
        } else if (window.location.href.startsWith("https://www.flashscore.com/draw/")) {
          let children = node.getElementsByClassName("bracket__name");
          for (let p of children) {
            replace_name(p, sport);
          }
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
      let m = /match\/[^/]+\/[^/]+/.exec(window.location.href);
      let key = m[0];
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
    // console.log(p);
    // console.log(p.parentElement.href);
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
    } else {
      console.log(
        `player ${key}, ${full_names[key]}, last met ${new Date(player_met[key]).toISOString()}, met ${
          (Date.now() - player_met[key]) / 1000 / 60 / 60 / 24
        } days ago`
      );
    }
  }
  for (let key in full_names) {
    if (!(key in player_met)) {
      console.log(`player ${key}, ${full_names[key]}, never met`);
    }
  }
})();
