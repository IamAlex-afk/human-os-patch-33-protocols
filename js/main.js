/* ====== Mind-OS Main Controller v3.0 ====== */

(function() {
  "use strict";

  /* ---------- Language handling ---------- */
  function getUrlLang() {
    var params = new URLSearchParams(window.location.search);
    return params.get("lang");
  }

  function setLang(lang) {
    if (!lang) return;
    CONFIG.DEFAULT_LANG = lang;
    if (window.I18n) I18n.setLang(lang);
    if (window.Quiz) Quiz.setLang(lang);
    document.documentElement.lang = lang;
    try { localStorage.setItem("mindos_lang", lang); } catch (e) {}
  }

  function detectLang() {
    var urlLang = getUrlLang();
    if (urlLang && CONFIG.SUPPORTED_LANGS.indexOf(urlLang) !== -1) return urlLang;
    try {
      var saved = localStorage.getItem("mindos_lang");
      if (saved && CONFIG.SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var browser = (navigator.language || navigator.userLanguage || "en").slice(0, 2);
    if (CONFIG.SUPPORTED_LANGS.indexOf(browser) !== -1) return browser;
    return "en";
  }

  /* ---------- Text updates ---------- */
  function updateAllText() {
    var t = I18n.t;
    var idMap = {
      "mainTitle": "mainTitle",
      "subheadText": "subhead",
      "infoTitle": "infoTitle",
      "infoPara1": "infoPara1",
      "infoPara2": "infoPara2",
      "infoPara3": "infoPara3",
      "infoDisclaimer": "infoDisclaimer",
      "axis1Title": "axis1Title",
      "axis1Desc": "axis1Desc",
      "axis1Hint": "axis1Hint",
      "axis2Title": "axis2Title",
      "axis2Desc": "axis2Desc",
      "axis2Hint": "axis2Hint",
      "axis3Title": "axis3Title",
      "axis3Desc": "axis3Desc",
      "axis3Hint": "axis3Hint",
      "fearTitle": "fearTitle",
      "fearDesc": "fearDesc",
      "fearHint": "fearHint",
      "trackerTitle": "trackerTitle",
      "trackerDesc": "trackerDesc",
      "trackerLowLabel": "trackerLowLabel",
      "trackerMidLabel": "trackerMidLabel",
      "trackerHighLabel": "trackerHighLabel",
      "saveBtn": "saveBtn",
      "resetBtn": "resetBtn",
      "gameTitle": "gameTitle",
      "gameDesc": "gameDesc",
      "gameBtnHuman": "gameBtnHuman",
      "gameBtnAI": "gameBtnAI",
      "gameNextBtn": "gameNextBtn",
      "gameRestartBtn": "gameRestartBtn",
      "gameScoreLabel": "gameScoreLabel",
      "gameFeedbackCorrect": "gameFeedbackCorrect",
      "gameFeedbackWrong": "gameFeedbackWrong",
      "gameFeedbackAI": "gameFeedbackAI",
      "gameFeedbackHuman": "gameFeedbackHuman",
      "pollTitle": "pollTitle",
      "pollDesc": "pollDesc",
      "pollFor": "pollFor",
      "pollNeutral": "pollNeutral",
      "pollAgainst": "pollAgainst",
      "submitPoll": "submitPoll",
      "pollResultsTitle": "pollResultsTitle",
      "pollBridge": "pollBridge",
      "ctaFirstReview": "ctaFirstReview",
      "ctaBarText": "ctaBarText",
      "footerText": "footerText",
      "bookLabel": "bookLabel",
      "submitBtn": "submitBtn",
      "shareBtn": "shareBtn",
      "resetTestBtn": "resetTestBtn",
      "prevBtn": "prevBtn",
      "nextBtn": "nextBtn",
      "alertIncomplete": "alertIncomplete",
      "progressText": "progressText",
      "overallProgressLabel": "overallProgressLabel",
      "overallProgressText": "overallProgressText",
      "trustNoSignup": "trustNoSignup",
      "trustLocal": "trustLocal",
      "trustAnonymous": "trustAnonymous",
      "howTitle": "howTitle",
      "howText": "howText",
      "protocolsTitle": "protocolsTitle",
      "protocolsDesc": "protocolsDesc",
      "faqTitle": "faqTitle",
      "faqQ1": "faqQ1",
      "faqA1": "faqA1",
      "faqQ2": "faqQ2",
      "faqA2": "faqA2",
      "faqQ3": "faqQ3",
      "faqA3": "faqA3",
      "faqQ4": "faqQ4",
      "faqA4": "faqA4",
      "faqQ5": "faqQ5",
      "faqA5": "faqA5",
      "faqQ6": "faqQ6",
      "faqA6": "faqA6",
      "faqQ7": "faqQ7",
      "faqA7": "faqA7",
      "faqQ8": "faqQ8",
      "faqA8": "faqA8",
      "donateText": "donateText",
      "overallTitle": "overallTitle",
      "overallPercentileLabel": "overallPercentileLabel",
      "aiFaqTitle": "aiFaqTitle",
      "faqAiWhatQ": "faqAiWhatQ",
      "faqAiWhatA": "faqAiWhatA",
      "faqAiHistoryQ": "faqAiHistoryQ",
      "faqAiHistoryA": "faqAiHistoryA",
      "faqAiHowWorkQ": "faqAiHowWorkQ",
      "faqAiHowWorkA": "faqAiHowWorkA",
      "faqAiTypesQ": "faqAiTypesQ",
      "faqAiTypesA": "faqAiTypesA",
      "faqAiDangerQ": "faqAiDangerQ",
      "faqAiDangerA": "faqAiDangerA",
      "fearResultTitle": "fearResultTitle",
      "scoreLabel": "scoreLabel",
      "reviewProgressText": "reviewProgressText",
      "noData": "noData",
      "trackerSummaryPrefix": "trackerSummaryPrefix",
      "trendIncreasing": "trendIncreasing",
      "trendDecreasing": "trendDecreasing",
      "trendStable": "trendStable"
    };

    var htmlIds = ["subheadText", "infoPara1", "infoPara2", "infoPara3", "infoDisclaimer", 
                   "axis1Desc", "axis1Hint", "axis2Desc", "axis2Hint", "axis3Desc", "axis3Hint",
                   "fearDesc", "fearHint", "trackerDesc", "gameDesc", "pollDesc", "pollBridge",
                   "ctaFirstReview", "howText", "protocolsDesc", "faqA1", "faqA2", "faqA3", "faqA4",
                   "faqA5", "faqA6", "faqA7", "faqA8", "donateText", "overallPercentileLabel",
                   "faqAiWhatA", "faqAiHistoryA", "faqAiHowWorkA", "faqAiTypesA", "faqAiDangerA",
                   "reviewProgressText", "trendIncreasing", "trendDecreasing", "trendStable"];

    for (var id in idMap) {
      var el = document.getElementById(id);
      if (!el) continue;
      var val = t(idMap[id]);
      if (val === undefined) continue;
      if (htmlIds.indexOf(id) !== -1) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }

    var bookLink = document.getElementById("bookLink");
    if (bookLink) {
      var url = t("bookUrl");
      if (url) bookLink.href = url;
    }
    var ctaBarLink = document.getElementById("ctaBarLink");
    if (ctaBarLink) {
      var url2 = t("bookUrl");
      if (url2) ctaBarLink.href = url2;
    }

    var dynTitle = document.getElementById("dynamicTitle");
    if (dynTitle) document.title = t("dynamicTitle") || document.title;
    var dynDesc = document.getElementById("dynamicDescription");
    if (dynDesc) dynDesc.content = t("dynamicDescription") || dynDesc.content;

    if (window.MindOSSeo && CONFIG.DEFAULT_LANG) {
      MindOSSeo.updateLang(CONFIG.DEFAULT_LANG);
    }
  }

  /* ---------- Dynamic rebuild ---------- */
  function rebuildDynamicContent() {
    updateAllText();

    if (window.Tracker) Tracker.render();
    if (window.Game) Game.init && Game.init();
    if (window.Poll) Poll.render && Poll.render();

    if (window.Quiz) {
      Quiz.build("q1", "q1Container", "a1Progress", "r1", CONFIG.MAX_AXIS);
      Quiz.build("q2", "q2Container", "a2Progress", "r2", CONFIG.MAX_AXIS);
      Quiz.build("q3", "q3Container", "a3Progress", "r3", CONFIG.MAX_AXIS);
      Quiz.build("fearQ", "qFearContainer", "fearProgress", "fearResult", CONFIG.FEAR_MAX);
      Quiz.updateOverallProgress();
    }

    if (Quiz && Quiz.isComplete && Quiz.isComplete()) {
      showOverallResults();
    }
  }

  function showOverallResults() {
    if (!Quiz || !Quiz.isComplete || !Quiz.isComplete()) return;
    var score = Quiz.getOverallScore();
    var arch = Quiz.getArchetype(score.pct);
    var block = document.getElementById("overallBlock");
    if (block) {
      block.style.display = "block";
      var archEl = document.getElementById("overallArchetype");
      var pctEl = document.getElementById("overallPercentile");
      var adviceEl = document.getElementById("overallAdvice");
      if (archEl) archEl.textContent = arch.name;
      if (pctEl) {
        var label = I18n.t("overallPercentileLabel") || "Better than {percentile}%";
        pctEl.textContent = label.replace("{percentile}", arch.percentile || 50);
      }
      if (adviceEl) adviceEl.textContent = arch.advice;
    }
    var resetBtn = document.getElementById("resetTestButton");
    if (resetBtn) resetBtn.style.display = "inline-flex";
  }

  /* ---------- Init ---------- */
  function init() {
    var lang = detectLang();
    setLang(lang);

    I18n.load(function(ok) {
      if (!ok) console.warn("[Mind-OS] i18n load failed");
      rebuildDynamicContent();
    });

    if (Quiz && Quiz.loadPersisted) Quiz.loadPersisted();

    var langSelect = document.getElementById("langSelect");
    if (langSelect) {
      langSelect.value = lang;
      langSelect.addEventListener("change", function(e) {
        var newLang = e.target.value;
        setLang(newLang);
        rebuildDynamicContent();
        var params = new URLSearchParams(window.location.search);
        params.set("lang", newLang);
        window.history.replaceState({}, "", "?" + params.toString());
      });
    }

    var resetBtn = document.getElementById("resetTestButton");
    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        if (Quiz && Quiz.resetTest) Quiz.resetTest();
      });
    }

    var shareBtn = document.getElementById("shareButton");
    if (shareBtn) {
      shareBtn.addEventListener("click", function() {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            text: I18n.t("shareBtn") || "My Mind-OS result",
            url: window.location.href
          }).catch(function(){});
        } else {
          alert("Share API not supported");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
