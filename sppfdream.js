var selector_mypage = '#naviheader > ul > li:nth-child(1) > a';
var actions = [
    [/main%2Farena%2Fmain%2Fmatch_result_flash%3F/, 'flashJT', '#tween_b_root'],
    [/main%2Farena%2Fmain%2Fselect_tactics%3F/, 'formJ', 'form[action*="main%2Farena%2Fmain%2Fplayball_exe%3F"]'],
    [/main%2Farena%2Fmain%3F/, 'aJ', '#arena_back > div.arena_btn_only > a'],
    [/main%2Fscout%2Fmain%2Fboss%3F/, 'aJ', 'a#shortCut'],
    [/main%2Fscout%2Fmain%2Fboss_result%3/, 'list', [
        ['aJ', 'a#shortCut']]],
    [/main%2Fscout%2Fmain%2Fconfirm%3F/, 'aJ', '#bg_scout a:contains("決定する")'],
    [/main%2Fscout%2Fmain%2Ffield%3F/, 'list', [
        ['aJ', 'a#shortCut'],
        ['aJ', selector_mypage]]],
    [/main%2Farena%2Fmain%2Fgame_detail%3F/, 'list', [
        ['aJ', '#arena_body a:contains("次の試合へ")'],
        ['aJ', selector_mypage]]],
    [/main%2Fscout%2Fmain%2Fscout_flash/, 'flashJT', '#tween_b_root'],
    [/main%2Fscout%2Fmain%2Fspecial%3/, 'list', [
        ['aJ', '#bg_scout a:contains("挑戦する")']]],
    [/main%2Fscout%2Fmain%2Fspecial_result%3/, 'list', [
        ['aJ', 'a#shortCut']]],
    [/main%2Fscout%2Fmain%3F/, 'list', [
        ['aJ', 'a#shortCut'],
        ['aJ', '#bg_scout a:contains("最新エリア")']]],
    [/main%2Fgacha%2Fmain%2F%3Faction_eventgacha/, 'formJ', 'form[action*="main%2Ffree_gacha_exe%3"]:last()'], 
    [/main%2Fgacha%2Fmain%2Findex%2F/, 'list', [
        ['aJ', '#howto_icon_back_gacha > a.enable']]],
    [/main%2Fgacha%2Fmain%2Fmulti_result%3/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
    [/main%2Fgacha%2Fmain%2Fresult%3F/, 'list', [
        ['aJ', 'div.gacha_frame:first() form:last()']]],
    [/main%2Fmission2016%2Fmain/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
    [/main%2Fmypage/, 'list', [
        ['aJ', '#news_user_info_area a:contains("プレゼントが来ています")'],
        ['aJ', '#news_user_info_area a:contains("達成しているミッションがあります")'],
        ['aJ', '#news_user_info_area a:contains("開けていない金箱が")'],
        ['aJ', '#news_user_info_area a:contains("いま無料ガチャが引けます")'],
        ['funcR', function() {
            var match_res = $('div.scout_cost_area').text().match(/([0-9]*)\s*\/\s*([0-9]*)/);
            var ap = match_res ? +match_res[1] : 0;
            if (ap > 10) {
                return $('#basic_menu_area a[href*="main%2Fscout%2Fmain"]').clickJ().length > 0;
            }
            return false;
        }],
        ['funcR', function() {
            if ($('div.arena_cost_area > img[src*="icon_playcost.png"]').length > 0) {
                return $('#basic_menu_area a[href*="main%2Farena%2Fmain"]').clickJ().length > 0;
            };
            return false;
        }],
        ['hold']]],
    [/main%2Fpresent%2Fevent%2Freceive%2Fmain/, 'list', [
        ['formJ', '#shortCutForm'],
        ['aJ', selector_mypage]]],
    [/main%2Fpresent%2Freceive%2Fmain%2Fbulk_list/, 'list', [
        ['formJ', '#shortCutForm'],
        ['aJ', selector_mypage]]],
    [/main%2Fpresent%2Freceive%2Fmain%2Fgacha_result/, 'aJ', '#shortCut'],
    [/main%2Fpresent%2Freceive%2Fmain%3F/, 'list', [
        ['aJ', '#shortCutForm a[href*="main%2Fpresent%2Freceive%2Fmain%2Freceive_exe"]'],
        ['formJ', '#shortCutForm'],
        ['aJ', '#d9-main a:regexText(期限あり(.*[^0].*))'],
        ['aJ', '#d9-main a:regexText(期限なし(.*[^0].*))']]],
    [/main%2Freinforce%2Fmain%2Findex%2F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
    //[/main%2Freinforce%2Fmain%2Fwith_item%3F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
    [/main%2Freinforce%2Fmain%2Fitem_use_confirm/, 'formJ', 'form[action*="main%2Freinforce%2Fmain%2Fitem_use_execute"]'],
    [/main%2Freward%2Fmain%2Freward_swf%3F/, 'flashJT', '#tween_b_root'],
    [/main%2Freward%2Fmain/, 'list', [
        ['aJ', '#shortCutForm input[type="submit"]:last()'],
        ['aJ', selector_mypage]]],
    [/%2Fflash%2F/, 'flashJT', '#tween_b_root'],
    [/(swf|flash)%3F/, 'flashJT', '#tween_b_root'],
    [/XXXXXXXXXXXXX/]
];