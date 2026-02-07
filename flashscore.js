// ==UserScript==
// @name         flashscore
// @namespace    http://tampermonkey.net/
// @version      2025-09-09_07-06
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
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @noframes
// ==/UserScript==
/// <reference path="./tampermonkey.d.ts" />

(async function () /* NOSONAR */ {
  "use strict";
  console.log("oops, tampermonkey: " + globalThis.location.href);
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
}
.flag {
    z-index: 1;
}`);
  const /** @type {{[key: string]: {id?: string}}} */ replaces = {
      tennis: {},
      "table-tennis": {},
      badminton: {},
    };
  const get_sport_id = async (/** @type {string} */ sport) => {
    if (!(sport in replaces)) {
      return null;
    }
    if (replaces[sport].id) {
      return replaces[sport].id;
    }
    const sports = GM_getValue("__sports", {});
    if (!(sport in sports)) {
      sports[sport] = {};
    }
    if (!sports[sport].id) {
      const sport_id_resp = await GM.xmlHttpRequest({
        method: "GET",
        url: "http://localhost:5173/api/sport?sport=" + sport,
      });
      const sport_id = sport_id_resp.response;
      sports[sport].id = sport_id;
      GM_setValue("__sports", sports);
    }
    replaces[sport].id = sports[sport].id;
    return sports[sport].id;
  };
  const get_cached_value = (/** @type {string} */ key) => {
    const player = GM_getValue(key, {});
    if ("resp" in player) {
      console.log(`get_cached_value, player ${key}`);
      return player.resp;
    }
    console.log(`get_cached_value, player ${key} -- no cache`);
    return null;
  };
  const save_cache_value = (/** @type {string} */ key, /** @type {{}} */ value) => {
    const player = GM_getValue(key, {});
    player.resp = value || {};
    player.check_timestamp = Date.now();
    GM_setValue(key, player);
  };
  /**
   *
   * @param {string} key
   * @param {string} display
   * @param {string | undefined} [sport_id]
   * @returns
   */
  const get_player = async (key, display, sport_id) => {
    const cached = get_cached_value(key);
    if (cached) {
      return cached;
    }
    console.log(key, display, sport_id);
    let url = "http://localhost:5173/api/flashscore_player?key=" + encodeURIComponent(key);
    if (display) {
      url = url + "&display=" + encodeURIComponent(display);
    }
    if (sport_id) {
      url = url + "&sport=" + sport_id;
    }
    const resp = await GM.xmlHttpRequest({
      method: "GET",
      url: url,
      responseType: "json",
    });
    if (resp.response || sport_id) {
      save_cache_value(key, resp.response);
    }
    return resp.response || {};
  };
  const update_player = async (
    /** @type {{ key: any; display?: any; region?: any; sport?: any; last_seen?: number; }} */ player
  ) => {
    const /** @type GM.XmlHttpRequestResponse<object> */ resp = await GM.xmlHttpRequest({
        method: "POST",
        url: "http://localhost:5173/api/flashscore_player",
        data: JSON.stringify(player),
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "json",
      });
    save_cache_value(player.key, resp.response);
    return resp.response;
  };
  const get_doubles_rank = async (/** @type {string} */ key1, /** @type {string | null} */ key2) => {
    if (!key2) {
      key2 = null;
    } else if (key1 > key2) {
      const tmp = key1;
      key1 = key2;
      key2 = tmp;
    }
    const dkey = "doubles:" + key1 + ":" + key2;
    const cached = get_cached_value(dkey);
    if (cached) {
      return cached;
    }
    const /** @type GM.XmlHttpRequestResponse<object> */ resp = await GM.xmlHttpRequest({
        method: "GET",
        url:
          "http://localhost:5173/api/doubles_rank?player1=" +
          encodeURIComponent(key1) +
          "&player2=" +
          encodeURIComponent(key2 || ""),
        responseType: "json",
      });
    save_cache_value(dkey, resp.response);
    return resp.response || {};
  };
  /**
   * @type {{[key: string]: openInTabResponse}}
   */
  const tab_jobs = {};
  /**
   * @type {{[key: string]: string}}
   */
  const pending_job = {};
  /**
   * @type {ReturnType<typeof setTimeout> | null}
   */
  let timer = null;
  let num_jobs = 0;
  const startTimer = () => {
    if (timer) {
      return;
    }
    const check_pending_job = () => {
      if (num_jobs < 5) {
        const matches = Object.keys(pending_job);
        if (matches.length > 0) {
          const match = matches[0];
          const href = pending_job[match];
          delete pending_job[match];
          num_jobs++;
          console.log(`opening ${href}`);
          tab_jobs[match] = GM_openInTab(href);
        }
      } else {
        console.log(tab_jobs);
      }
      if (Object.keys(pending_job).length > 0) {
        timer = setTimeout(check_pending_job, 1000);
      } else {
        timer = null;
      }
    };
    check_pending_job();
  };
  const get_match_key = (/** @type {string} */ href) => {
    if (href.includes("?")) {
      const m = new RegExp(/(match\/[^/]+\/[^/]+\/[^/]+).*(mid=[0-9a-zA-Z]+)/).exec(href);
      if (m === null) {
        throw new Error("get_match_key failed, no match");
      }
      return m[1] + "/?" + m[2];
    } else {
      const m = new RegExp(/match\/[^/]+\/[^/]+/).exec(href);
      if (m === null) {
        throw new Error("get_match_key failed, no match");
      }
      return m[0];
    }
  };
  /**
   * @param {string} href
   */
  function get_player_key(href) {
    const m = new RegExp(/\/player\/(.*)\/(.*)\//).exec(href);
    if (!m) {
      return ["", "", ""];
    }
    const key = m[1] + "/" + m[2];
    const full_key = key;
    return [key, m[1], full_key];
  }

  const get_flag = (/** @type {HTMLElement} */ p) => {
    let flag_sel = "";
    if (p.classList.contains("event__participant--home1")) {
      flag_sel = ".event__logo--home1";
    } else if (p.classList.contains("event__participant--away1")) {
      flag_sel = ".event__logo--away1";
    } else if (p.classList.contains("event__participant--home2")) {
      flag_sel = ".event__logo--home2";
    } else if (p.classList.contains("event__participant--away2")) {
      flag_sel = ".event__logo--away2";
    } else if (p.classList.contains("event__participant--home")) {
      flag_sel = ".event__logo--home";
    } else if (p.classList.contains("event__participant--away")) {
      flag_sel = ".event__logo--away";
    }
    if (flag_sel) {
      const /** @type {HTMLElement | null | undefined} */ flag = p.parentElement?.querySelector(flag_sel);
      if (flag) {
        return flag.title;
      }
    }
    return "";
  };

  const get_idx = (/** @type {{ classList: { contains: (arg0: string) => any; }; }} */ p) => {
    let idx = -1;
    if (p.classList.contains("event__participant--home1")) {
      idx = 0;
    } else if (p.classList.contains("event__participant--away1")) {
      idx = 2;
    } else if (p.classList.contains("event__participant--home2")) {
      idx = 1;
    } else if (p.classList.contains("event__participant--away2")) {
      idx = 3;
    } else if (p.classList.contains("event__participant--home")) {
      idx = 0;
    } else if (p.classList.contains("event__participant--away")) {
      idx = 1;
    }
    return idx;
  };

  /**
   * @param {HTMLElement} p
   * @param {string |  { href: string; rank: number; }} play_info
   * @param {string} [sport_id]
   * @param {{ [x: string]: { href: any; }; } | undefined} [match_info]
   */
  async function replace_name_player(p, play_info, sport_id, match_info) {
    if ("mod" in p.attributes) {
      return;
    } else {
      p.setAttribute("mod", p.textContent);
    }
    const formatRank = (/** @type {string | number} */ rank) => {
      return rank ? " (" + rank + ")" : "";
    };
    const formatRawName = (/** @type {string} */ raw_name) => {
      return raw_name
        .split("-")
        .map((/** @type {string} */ word) => word.charAt(0).toUpperCase() + word.slice(1))
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
    const [, raw_name, full_key] = get_player_key(href);
    if (full_key == "") {
      return;
    }
    const flag = get_flag(p);
    const player_info_db = await get_player(full_key, p.textContent, sport_id);
    if (flag && player_info_db && player_info_db.region != flag) {
      await update_player({ key: full_key, display: p.textContent, region: flag });
    }
    let r = player_info_db?.translation;
    if (rank == 0) {
      const tennis_id = await get_sport_id("tennis");
      if (!p.classList.contains("event__participant--doubles")) {
        if (player_info_db.rank) {
          rank = player_info_db.rank;
        }
      } else if (sport_id == tennis_id) {
        if (player_info_db.drank) {
          rank = player_info_db.drank;
        }
      } else if (
        match_info &&
        (p.classList.contains("event__participant--home2") || p.classList.contains("event__participant--away2"))
      ) {
        let other_key = null;
        let other_class;
        let other_idx;
        if (p.classList.contains("event__participant--home2")) {
          other_class = ".event__participant--home1";
          other_idx = 0;
        } else {
          other_class = ".event__participant--away1";
          other_idx = 2;
        }
        const other = p.parentElement?.querySelector(other_class);
        if (!other) {
          throw new Error("other player not found");
        }
        let other_t = other.textContent;
        if ("mod" in other.attributes) {
          other_t = other.getAttribute("mod") || "";
        }
        const other_href = match_info[other_idx + "_" + other_t].href;
        [, , other_key] = get_player_key(other_href);
        const doubles_rank = await get_doubles_rank(full_key, other_key);
        if (doubles_rank) {
          rank = doubles_rank.rank;
        }
      }
    }
    if (r) {
      r = formatRawName(raw_name) + " (" + r + ")" + formatRank(rank);
    } else {
      r = formatRawName(raw_name) + formatRank(rank);
    }
    if (flag === "China") {
      p.style.color = "red";
    }
    p.setAttribute("mod", p.textContent);
    p.textContent = r;
  }

  const addMatchListener = (
    /** @type {string} */ match,
    /** @type {string} */ href,
    /** @type {string} */ sport_id
  ) => {
    if (!(match in pending_job)) {
      const listener = GM_addValueChangeListener(match, (key, old_val, new_val) => {
        GM_removeValueChangeListener(listener);
        if (match in tab_jobs) {
          tab_jobs[match].close();
          delete tab_jobs[match];
          num_jobs--;
        }
        const /** @type {HTMLAnchorElement | null} */ eventRowLink = document.querySelector(
            "a.eventRowLink[href='" + href + "']"
          );
        for (const p of eventRowLink?.parentElement?.querySelectorAll("div.event__participant") ?? []) {
          replace_name_match(/** @type {HTMLElement} */ (p), match, null, sport_id);
        }
        const /** @type {HTMLElement | null | undefined} */ stage_ele = eventRowLink?.parentElement?.querySelector(
            "div.event__time, div.event__stage--block"
          );
        if (stage_ele) {
          updateEventStage(stage_ele, match);
        }
        console.log("listener for " + match + " fired", key, old_val, new_val);
      });
      console.log("create pending job", match);
      pending_job[match] = href;
      startTimer();
    }
  };
  /**
   * @param {HTMLElement} p
   * @param {string} match
   * @param {string | null} href
   * @param {string} sport_id
   * @param {number=} [idx]
   */
  async function replace_name_match(p, match, href, sport_id, idx) {
    if ("mod" in p.attributes) {
      return;
    }
    const n = p.textContent;
    if (idx === undefined) {
      idx = get_idx(p);
    }
    const key = idx + "_" + n;
    const v = GM_getValue(match);
    if (!v?.[key]) {
      console.log(match, v);
      if (!(match in tab_jobs) && href) {
        addMatchListener(match, href, sport_id);
      }
      return false;
    }
    return await replace_name_player(p, v[key], sport_id, v);
  }
  /**
   * @param {HTMLElement} tnode
   * @param {string=} match
   * @returns
   */
  const updateEventStage = (tnode, match) => {
    let mnode;
    if (!match) {
      mnode = tnode.parentElement;
      while (mnode && !mnode.classList.contains("event__match")) {
        mnode = mnode.parentElement;
      }
      mnode = mnode?.querySelector(".eventRowLink");
      if (!mnode) {
        return;
      }
      match = get_match_key(/** @type {HTMLAnchorElement} */ (mnode).href);
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
    if (tnode && tnode.lastChild?.textContent != v.stage) {
      if (tnode.lastChild?.nodeType == 3) {
        tnode.appendChild(document.createElement("br"));
      }
      tnode.appendChild(document.createTextNode(v.stage));
    }
  };
  const updateEventStageP = (/** @type {HTMLElement} */ node) => {
    for (const tnode of node.querySelectorAll("div.event__time, div.event__stage--block")) {
      updateEventStage(/** @type {HTMLElement} */ (tnode));
    }
  };
  /**
   * @param {HTMLElement} p
   * @param {string} sport
   * @param {string} sport_id
   */
  function replace_name(p, sport, sport_id) {
    if (p.nodeType == 1 && (p.childNodes.length == 0 || p.childNodes[0].nodeType != 3)) {
      return;
    }
    if (!(sport in replaces)) {
      return;
    }
    if (
      globalThis.location.href.startsWith("https://www.flashscore.com/favorites/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/badminton/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/tennis/")
    ) {
      /**
       * @type {HTMLAnchorElement | null | undefined}
       */
      const match = p.parentNode?.querySelector("a.eventRowLink");
      if (match) {
        replace_name_match(p, get_match_key(match.href), match.href, sport_id);
      }
    }
    if (globalThis.location.href.startsWith("https://www.flashscore.com/match/")) {
      const a = p.closest("a");
      if (a) {
        replace_name_match(p, get_match_key(a.href), null, sport_id);
      }
    }
  }
  /**
   * @param {HTMLElement} node
   * @param {string} sport_id
   */
  function hanlde_draw_observer(node, sport_id) {
    for (const p of node.querySelectorAll(".series")) {
      p.parentElement?.parentElement?.querySelectorAll(".bracket__name").forEach((player, idx) => {
        replace_name_match(
          /** @type{HTMLElement} */ (player),
          get_match_key(/** @type {HTMLAnchorElement} */ (p).href),
          null,
          sport_id,
          idx
        );
        console.log(player);
      });
      const height =
        p.parentElement?.parentElement?.children[0] instanceof HTMLElement
          ? p.parentElement.parentElement.children[0].offsetHeight
          : 0;
      if (p.parentElement) {
        p.parentElement.style.top = "calc(50% + " + height / 2 + "px)";
      }
    }
  }
  const udpateElement = async (/** @type {HTMLElement} */ node) => {
    if (globalThis.location.href.startsWith("https://www.flashscore.com/favorites/")) {
      const children = node.getElementsByClassName("event__participant");
      for (const p of children) {
        const sport = p.parentElement?.parentElement?.classList[1] ?? "";
        const sport_id = await get_sport_id(sport);
        if (sport_id) {
          replace_name(/** @type {HTMLElement} */ (p), sport, sport_id);
        }
      }
    } else if (globalThis.location.href.startsWith("https://www.flashscore.com/draw/")) {
      const sport_eles = document.body.querySelectorAll("body > sport");
      const sport = sport_eles[0].getAttribute("name");
      if (!sport) {
        throw new Error("sport not found");
      }
      const sport_id = await get_sport_id(sport);
      hanlde_draw_observer(node, sport_id);
    } else if (
      globalThis.location.href.startsWith("https://www.flashscore.com/match/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/player/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/badminton/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/table-tennis/") ||
      globalThis.location.href.startsWith("https://www.flashscore.com/tennis/")
    ) {
      const sport_eles = document.body.querySelectorAll("body > sport");
      const sport = sport_eles[0].getAttribute("name");
      if (!sport) {
        throw new Error("sport not found");
      }
      const sport_id = await get_sport_id(sport);
      const children = node.querySelectorAll(".participant__participantName:not(:has(.participant__participantName))");
      for (const p of children) {
        if (p.tagName == "A") {
          replace_name_player(/** @type {HTMLElement} */ (p), /** @type {HTMLAnchorElement} */ (p).href, sport_id);
        } else {
          replace_name(/** @type {HTMLElement} */ (p), sport, sport_id);
        }
      }
      if (globalThis.location.href.startsWith("https://www.flashscore.com/match/")) {
        for (const p of node.querySelectorAll(".h2h__participantInner")) {
          replace_name(/** @type {HTMLElement} */ (p), sport, sport_id);
        }
      } else {
        const children = node.getElementsByClassName("event__participant");
        for (const p of children) {
          replace_name(/** @type {HTMLElement} */ (p), sport, sport_id);
        }
      }
      hanlde_draw_observer(node, sport_id);
    }
    updateEventStageP(node);
    const children = node.getElementsByClassName("leftMenu__text");
    for (const p of children) {
      replace_name_player(/** @type {HTMLElement} */ (p), /** @type {HTMLAnchorElement} */ (p.parentElement).href);
    }
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == "characterData") {
        if (mutation.target.parentElement?.classList.contains("event__stage--block")) {
          updateEventStage(mutation.target.parentElement);
        }
        continue;
      }
      if (mutation.type != "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType == node.ELEMENT_NODE) {
          udpateElement(/** @type {HTMLElement} */ (node));
        } else if (node.nodeType == node.TEXT_NODE) {
          if (node.parentElement?.classList?.contains("event__stage--block")) {
            updateEventStage(node.parentElement);
          }
        }
      }
    }
  });

  observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  if (globalThis.location.href.startsWith("https://www.flashscore.com/match/")) {
    async function wait_for_load() {
      const sport_eles = document.body.querySelectorAll("body > sport");
      const sport = sport_eles[0].getAttribute("name") || "";
      const sport_id = await get_sport_id(sport);
      const key = get_match_key(globalThis.location.href);
      console.log(key);
      /**
       * @type {{ t: number; stage?: string; [playerKey: `${number}_${string}`]: { href: string; rank: number }; }}
       */
      const val = { t: Date.now() };
      /**
       * @type {NodeListOf<HTMLAnchorElement>}
       */
      const children = document.querySelectorAll(
        "div.participant__participantNameWrapper a.participant__participantName"
      );
      console.log(children);
      if (children.length == 0) {
        setTimeout(wait_for_load, 1000);
        return;
      }
      const match_time =
        document.querySelector("div.duelParticipant div.duelParticipant__startTime div")?.textContent || "";
      console.log(match_time);
      const m_time = /(\d+).(\d+).(\d+) (\d+):(\d+)/.exec(match_time);
      let date = 0;
      if (m_time) {
        date = new Date(
          Number.parseFloat(m_time[3]),
          Number.parseFloat(m_time[2]) - 1,
          Number.parseFloat(m_time[1]),
          Number.parseFloat(m_time[4]),
          Number.parseFloat(m_time[5])
        ).getTime();
      }
      if (!date) {
        return;
      }
      await Promise.all(
        [...children].map(async (p, i) => {
          console.log(p);
          const href = p.href;
          const rank_ele = p.parentNode?.parentNode?.parentNode?.querySelector(".participant__participantRank");
          let rank = 0;
          if (rank_ele?.childNodes?.length && rank_ele.childNodes.length > 2) {
            rank = Number.parseInt(rank_ele.childNodes[2].textContent || "0");
          } else {
            let name_wrapper = p.parentElement;
            while (name_wrapper && !name_wrapper.classList.contains("participant__participantNameWrapper")) {
              name_wrapper = name_wrapper.parentElement;
              console.log("go up !!!!");
            }
            const rankAttr = name_wrapper?.attributes.getNamedItem("rank");
            if (rankAttr?.value !== undefined) {
              rank = Number.parseInt(rankAttr.value);
            }
          }
          console.log(href, rank);
          const player_key = p.attributes.getNamedItem("mod")?.value || p.textContent;
          val[`${i}_${player_key}`] = { href, rank };
          const [key, , full_key] = get_player_key(href);
          if (key) {
            const player = GM_getValue("player/" + key, {});
            player.t = Math.max(player.t || 0, date);
            GM_setValue("player/" + key, player);
          }
          await update_player({ key: full_key, display: player_key, sport: sport_id, last_seen: date });
        })
      );
      const stage =
        document.querySelector("li[class^=wcl-breadcrumbItem]:last-child [class^=wcl-breadcrumbItemLabel]")
          ?.textContent || "";
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
    await wait_for_load();
  }
  udpateElement(document.body);
  for (const key of GM_listValues()) {
    if (key.startsWith("__")) {
      console.log("met special key: " + key);
      continue;
    }
    const v = GM_getValue(key);
    if (!("t" in v || "check_timestamp" in v)) {
      console.log("Deleting key without timestamp: " + key + ", " + v);
      GM_deleteValue(key);
      continue;
    }
    if ("check_timestamp" in v && Date.now() - v.check_timestamp > 1000 * 60 * 60 * 24 * 7) {
      console.log(`Deleting key with old check_timestamp: ${key}`, v);
      GM_deleteValue(key);
    }
    if (key.startsWith("match/") && Date.now() - v.t > 1000 * 60 * 60 * 24 * 7) {
      console.log(`Deleting old value for key: ${key}`, v);
      GM_deleteValue(key);
    }
  }
  (function () {
    const exchangeSport = (/** @type {string} */ mainhref, /** @type {string} */ minorhref) => {
      /** @type {HTMLAnchorElement | null} */
      const main = document.querySelector(`.menuTop__item[href="${mainhref}"]`);
      /** @type {HTMLAnchorElement | null} */
      const minor = document.querySelector(`.menuMinority__item[href='${minorhref}']`);
      /** @type {HTMLAnchorElement | null} */
      const mainminor = document.querySelector(`.menuMinority__item[href='${mainhref}']`);
      if (main && minor && mainminor) {
        mainminor.classList.remove("menuMinority__item--hidden");
        minor.classList.add("menuMinority__item--hidden");
        main.href = minorhref;
        main.children[0].children[0].remove();
        main.children[0].appendChild(minor.children[0].children[0]);
        main.dataset.sportId = minor.dataset.sportId;
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
