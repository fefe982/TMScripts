// ==UserScript==
// @name         dbb_players
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://s01.d-bb.com/cgi-bin/sdb_conflate_card_material.cgi*
// @grant        GM_log
// ==/UserScript==
(function() {
    'use strict';
    var url=document.URL;
        var teams = {
        H  : [14],
        F  : [9],
        M  : [10],
        L  : [18],
        Bs : [15],
        E  : [13],
        Ys : [17],
        G  : [1],
        T  : [4],
        C  : [6],
        D  : [2],
        DB : [19]
    };
    
    var allplayers = [
['H','工藤','公康'],
['H','内川','聖一'],
['H','今宮','健太'],
['H','松田','宣浩'],
['H','中村','晃'],
['H','柳田','悠岐'],
['H','中田','賢一'],
['H','岩嵜','翔'],
['H','森福','允彦'],
['H','和田','毅'],
['H','長谷川','勇也'],
['H','武田','翔太'],
['H','鶴岡','慎也'],
['H','森','唯斗'],
['H','千賀','滉大'],
['H','バンデンハーク',''],
['H','本多','雄一'],
['H','攝津','正'],
['H','サファテ',''],
['H','スアレス',''],
['F','栗山','英樹'],
['F','大谷','翔平'],
['F','加藤','貴之'],
['F','メンドーサ',''],
['F','有原','航平'],
['F','増井','浩俊'],
['F','吉川','光夫'],
['F','高梨','裕稔'],
['F','谷元','圭介'],
['F','バース',''],
['F','マーティン',''],
['F','近藤','健介'],
['F','大野','奨太'],
['F','田中','賢介'],
['F','レアード',''],
['F','中田','翔'],
['F','西川','遥輝'],
['F','中島','卓也'],
['F','陽','岱鋼'],
['F','谷口','雄也'],
['M','伊東','勤'],
['M','大嶺','祐太'],
['M','石川','歩'],
['M','関谷','亮太'],
['M','涌井','秀章'],
['M','唐川','侑己'],
['M','古谷','拓哉'],
['M','西野','勇士'],
['M','南','昌輝'],
['M','益田','直也'],
['M','スタンリッジ',''],
['M','二木','康太'],
['M','田村','龍弘'],
['M','鈴木','大地'],
['M','ナバーロ',''],
['M','中村','奨吾'],
['M','細谷','圭'],
['M','清田','育宏'],
['M','デスパイネ',''],
['M','角中','勝也'],
['M','加藤','翔平'],
['M','岡田','幸文'],
['L','田邊','徳雄'],
['L','田辺','徳雄'],
['L','ポーリーノ',''],
['L','岸','孝之'],
['L','増田','達至'],
['L','菊池','雄星'],
['L','髙橋','光成'],
['L','多和田','真三郎'],
['L','野上','亮磨'],
['L','十亀','剣'],
['L','武隈','祥太'],
['L','森','友哉'],
['L','炭谷','銀仁朗'],
['L','金子','侑司'],
['L','鬼﨑','裕司'],
['L','渡辺','直人'],
['L','浅村','栄斗'],
['L','中村','剛也'],
['L','メヒア',''],
['L','栗山','巧'],
['L','秋山','翔吾'],
['Bs','福良','淳一'],
['Bs','松葉','貴大'],
['Bs','平野','佳寿'],
['Bs','金子','千尋'],
['Bs','西','勇輝'],
['Bs','東明','大貴'],
['Bs','ディクソン',''],
['Bs','山田','修義'],
['Bs','塚原','頌平'],
['Bs','若月','健矢'],
['Bs','中島','宏之'],
['Bs','安達','了一'],
['Bs','モレル',''],
['Bs','小谷野','栄一'],
['Bs','西野','真弘'],
['Bs','糸井','嘉男'],
['Bs','駿太',''],
['Bs','ボグセビック',''],
['Bs','T-岡田',''],
['E','梨田','昌孝'],
['E','松井','裕樹'],
['E','塩見','貴洋'],
['E','則本','昂大'],
['E','安樂','智大'],
['E','釜田','佳直'],
['E','美馬','学'],
['E','辛島','航'],
['E','福山','博之'],
['E','嶋','基宏'],
['E','足立','祐一'],
['E','茂木','栄五郎'],
['E','藤田','一也'],
['E','今江','敏晃'],
['E','銀次',''],
['E','ウィーラー',''],
['E','松井','稼頭央'],
['E','聖澤','諒'],
['E','岡島','豪郎'],
['E','島内','宏明'],
['Ys','真中','満'],
['Ys','由規',''],
['Ys','秋吉','亮'],
['Ys','原','樹理'],
['Ys','成瀬','善久'],
['Ys','杉浦','稔大'],
['Ys','石川','雅規'],
['Ys','館山','昌平'],
['Ys','小川','泰弘'],
['Ys','デイビーズ',''],
['Ys','ルーキ',''],
['Ys','山中','浩史'],
['Ys','西田','明央'],
['Ys','中村','悠平'],
['Ys','山田','哲人'],
['Ys','大引','啓次'],
['Ys','西浦','直亨'],
['Ys','川端','慎吾'],
['Ys','畠山','和洋'],
['Ys','今浪','隆博'],
['Ys','バレンティン',''],
['Ys','雄平',''],
['Ys','坂口','智隆'],
['G','高橋','由伸'],
['G','澤村','拓一'],
['G','大竹','寛'],
['G','菅野','智之'],
['G','マシソン',''],
['G','内海','哲也'],
['G','マイコラス',''],
['G','今村','信貴'],
['G','高木','勇人'],
['G','田口','麗斗'],
['G','阿部','慎之助'],
['G','小林','誠司'],
['G','脇谷','亮太'],
['G','坂本','勇人'],
['G','クルーズ',''],
['G','村田','修一'],
['G','ギャレット',''],
['G','長野','久義'],
['G','亀井','善行'],
['G','橋本','到'],
['G','立岡','宗一郎'],
['T','金本','知憲'],
['T','能見','篤史'],
['T','安藤','優也'],
['T','岩貞','祐太'],
['T','藤川','球児'],
['T','藤浪','晋太郎'],
['T','岩田','稔'],
['T','マテオ',''],
['T','髙橋','聡文'],
['T','青柳','晃洋'],
['T','メッセンジャー',''],
['T','岩崎','優'],
['T','原口','文仁'],
['T','鳥谷','敬'],
['T','北條','史也'],
['T','ゴメス',''],
['T','西岡','剛'],
['T','福留','孝介'],
['T','髙山','俊'],
['T','高山','俊'],
['T','江越','大賀'],
['T','中谷','将大'],
['C','緒方','孝市'],
['C','福井','優也'],
['C','九里','亜蓮'],
['C','黒田','博樹'],
['C','今村','猛'],
['C','岡田','明丈'],
['C','野村','祐輔'],
['C','中﨑','翔太'],
['C','中村','恭平'],
['C','ジョンソン',''],
['C','ジャクソン',''],
['C','ヘーゲンズ',''],
['C','會澤','翼'],
['C','石原','慶幸'],
['C','田中','広輔'],
['C','ルナ',''],
['C','新井','貴浩'],
['C','菊池','涼介'],
['C','エルドレッド',''],
['C','安部','友裕'],
['C','丸','佳浩'],
['C','松山','竜平'],
['C','鈴木','誠也'],
['D','谷繁','元信'],
['D','小笠原','慎之介'],
['D','田島','慎二'],
['D','又吉','克樹'],
['D','吉見','一起'],
['D','大野','雄大'],
['D','バルデス',''],
['D','若松','駿太'],
['D','ジョーダン',''],
['D','桂','依央利'],
['D','杉山','翔大'],
['D','エルナンデス',''],
['D','荒木','雅博'],
['D','高橋','周平'],
['D','福田','永将'],
['D','堂上','直倫'],
['D','平田','良介'],
['D','大島','洋平'],
['D','ナニータ',''],
['D','ビシエド',''],
['DB','ラミレス',''],
['DB','山口','俊'],
['DB','石田','健大'],
['DB','井納','翔一'],
['DB','山﨑','康晃'],
['DB','須田','幸太'],
['DB','今永','昇太'],
['DB','久保','康友'],
['DB','田中','健二朗'],
['DB','砂田','毅樹'],
['DB','モスコーソ',''],
['DB','ペトリック',''],
['DB','戸柱','恭孝'],
['DB','ロペス',''],
['DB','倉本','寿彦'],
['DB','白崎','浩之'],
['DB','石川','雄洋'],
['DB','エリアン',''],
['DB','宮﨑','敏郎'],
['DB','梶谷','隆幸'],
['DB','筒香','嘉智'],
['DB','桑原','将志'],
];
    if (url.match(/http:\/\/s01\.d-bb\.com\/cgi-bin\/sdb_conflate_card_material\.cgi.*/)) {
        $('#main_select > div > div.formation_list > form > table.list_table.list_sort > tbody > tr').each(function() {
            var item = $(this);
            if (!allplayers.some(function (v) {
                if (item.children('td:contains("' + v[1] + '")').length > 0 && item.children('td:has(img[src*="icon_col_team' + teams[v[0]][0] + '.gif"])').length > 0) {
                    return true;
                }
                return false;
            })) {
                item.css('background', "navy");
            }
        });
        //allplayers.forEach(function (v) {
        //    $('tr:contains("' + v[1] + '"):has(img[src*="icon_col_team' + teams[v[0]][0] + '.gif"])').css('background', "navy");
        //});
    }
})();