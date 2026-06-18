/* Mind-OS Global AI Sentiment Poll — backend (Google Apps Script)
   Хранит только 3 числа-счётчика (PropertiesService). Никаких IP, email,
   времени голосования или иных пользовательских данных не сохраняется.
   Отдаёт только процент по каждому варианту, не сырые количества. */

var ALLOWED_VOTES = ['for', 'neutral', 'against'];

function doGet(e) {
  return respond_();
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var vote = body.vote;
    if (ALLOWED_VOTES.indexOf(vote) !== -1) {
      var lock = LockService.getScriptLock();
      lock.waitLock(5000);
      try {
        var props = PropertiesService.getScriptProperties();
        var key = 'votes_' + vote;
        var current = parseInt(props.getProperty(key) || '0', 10);
        props.setProperty(key, String(current + 1));
      } finally {
        lock.releaseLock();
      }
    }
  } catch (err) {
    // некорректный запрос — просто игнорируем, отдаём текущие результаты
  }
  return respond_();
}

function respond_() {
  var props = PropertiesService.getScriptProperties();
  var f = parseInt(props.getProperty('votes_for') || '0', 10);
  var n = parseInt(props.getProperty('votes_neutral') || '0', 10);
  var a = parseInt(props.getProperty('votes_against') || '0', 10);
  var total = f + n + a;

  var result;
  if (total === 0) {
    result = { forPct: 0, neutralPct: 0, againstPct: 0 };
  } else {
    result = {
      forPct: Math.round((f / total) * 100),
      neutralPct: Math.round((n / total) * 100),
      againstPct: Math.round((a / total) * 100)
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
