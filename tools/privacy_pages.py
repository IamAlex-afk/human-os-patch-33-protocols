"""Privacy policy in all 12 languages: privacy.html (English, the reference text) and <lang>/privacy.html.
Facts were checked against the code on 2026-10-07 (js/poll.js, js/storage.js, poll-backend/Code.gs, index.html):
- fonts are self-hosted (Inter) or the device's own (Japanese); no page loads anything from Google Fonts;
- the poll backend is contacted only when the visitor presses the vote button; its answer (percentages) is kept
  in the browser and shown from there on later visits; nothing else leaves the browser.
Names of interface elements ({poll}, {submit}) are read from js/translations/<lang>.js so they match the page.
    python tools/privacy_pages.py
"""
import os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.sep
SITE = 'https://iamalex-afk.github.io/human-os-patch-33-protocols/'
LANGS = ['en', 'ru', 'es', 'de', 'fr', 'ja', 'vi', 'th', 'pt', 'ko', 'it', 'hi']
UPDATED = '2026-10-07'
ISSUES = '<a href="https://github.com/IamAlex-afk/human-os-patch-33-protocols/issues" target="_blank" rel="noopener">GitHub Issues</a>'
ORCID = '<a href="https://orcid.org/0009-0002-7986-3812" target="_blank" rel="noopener">ORCID</a>'

# title, description, sub, short (html), [(h2, paragraph html) x10], back, footer, reference note
T = {
 'en': dict(
  title='Privacy Policy', desc='Mind-OS collects no personal data. No cookies, no tracking; the assessment runs in your browser. The full privacy policy in plain language.',
  sub='Last updated: {d} · Plain language, no legalese.',
  short='<strong>The short version:</strong> The assessment, tracker, and game collect nothing — no server, no database, no analytics, no cookies, no tracking. Everything you do there stays inside your own browser and never leaves your device. The one exception is the optional global poll: if you choose to vote, it sends your single choice to a minimal backend that stores only 3 aggregate counters (For/Neutral/Against) — no IP, email, timestamp, or per-vote record.',
  sec=[('What data we collect', '<strong>None, except 3 numbers if you vote in the poll.</strong> Mind-OS is a static website with no backend server for the assessment, tracker, or game. The optional global poll is the only feature with a backend — see below.'),
       ('Where your answers go', 'Your test answers, tracker entries, and language preference are saved only in your browser’s <code>localStorage</code> — a private storage area on your own device. It is never transmitted anywhere. You can erase it at any time by clearing your browser data or using the in-app reset buttons.'),
       ('Cookies', 'We use no cookies of any kind — not for analytics, not for advertising, not for sessions. There is nothing to consent to, because nothing is set.'),
       ('Tracking & analytics', 'There are no tracking pixels, no Google Analytics, no Facebook Pixel, no fingerprinting, and no third-party trackers. We do not know who you are or that you visited.'),
       ('The one exception: the global poll', 'The “{poll}” is entirely optional — the assessment works fully without it. If you choose to vote, your single choice (For/Neutral/Against) is sent to a minimal backend (Google Apps Script) that stores only 3 running totals, one per option. It does not store your IP address, email, timestamp, or any per-vote record — there is no way to link a vote back to you. The backend only ever returns percentages, never raw vote counts. The percentages it returns are saved in your browser; on later visits the page shows them from there and contacts no server.'),
       ('Third-party services', 'Fonts are served from this site itself or taken from your device; no page loads anything from Google Fonts. If you vote in the poll, your vote goes to a Google Apps Script backend as described above. The site is hosted on GitHub Pages. In each of these cases your browser connects to that company’s servers, which see your IP address as with any web request; we receive none of it and have no access to their logs. No other third-party service is contacted.'),
       ('Children', 'Mind-OS contains no harmful content and collects no data, so it poses no data risk to anyone, including minors. It is an educational reflection tool, not medical advice or a diagnosis.'),
       ('Your rights', 'Because we hold no data about you, there is nothing to request, export, or delete on our side. You have complete control: your data lives only on your device, and only you can access or remove it.'),
       ('How to verify this yourself', 'Open your browser’s developer tools (F12) → Network tab, and use the site. Taking the assessment, using the tracker, or playing the game sends no requests anywhere — all processing happens in the JavaScript running locally in your browser. The only request to another server appears when you click “{submit}”. The source code is openly viewable.'),
       ('Contact', 'Questions? Open an issue: {issues}.')],
  back='← Back to Mind-OS', footer='Mind-OS — AI Dependency Self-Assessment · Created by Aleksei Sergeevich Bitkin', ref=''),
 'ru': dict(
  title='Политика конфиденциальности', desc='Mind-OS не собирает личные данные. Без cookie и слежения; тест работает в вашем браузере. Полная политика конфиденциальности простым языком.',
  sub='Обновлено: {d} · Простым языком, без юридических оборотов.',
  short='<strong>Коротко:</strong> тест, трекер и игра ничего не собирают — нет сервера, базы данных, аналитики, cookie и слежения. Всё, что вы там делаете, остаётся в вашем браузере и не покидает устройство. Единственное исключение — необязательный глобальный опрос: если вы решите проголосовать, ваш единственный выбор отправляется на минимальный сервер, который хранит только 3 общих счётчика (За / Нейтрально / Против) — без IP, email, времени и записи о каждом голосе.',
  sec=[('Какие данные мы собираем', '<strong>Никаких, кроме 3 чисел, если вы голосуете в опросе.</strong> Mind-OS — статический сайт: у теста, трекера и игры нет сервера. Сервер есть только у необязательного глобального опроса — о нём ниже.'),
       ('Куда попадают ваши ответы', 'Ответы теста, записи трекера и выбранный язык сохраняются только в <code>localStorage</code> вашего браузера — это личное хранилище на вашем устройстве. Оно никуда не передаётся. Стереть его можно в любой момент: очистить данные браузера или нажать кнопки сброса на сайте.'),
       ('Cookie', 'Мы не используем cookie вообще — ни для аналитики, ни для рекламы, ни для сессий. Соглашаться не на что, потому что ничего не устанавливается.'),
       ('Слежение и аналитика', 'Нет пикселей слежения, Google Analytics, Facebook Pixel, цифровых отпечатков и сторонних трекеров. Мы не знаем, кто вы, и не знаем, что вы заходили.'),
       ('Единственное исключение: глобальный опрос', 'Блок «{poll}» полностью необязателен — тест работает и без него. Если вы решите проголосовать, ваш единственный выбор (За / Нейтрально / Против) отправляется на минимальный сервер (Google Apps Script), который хранит только 3 суммы — по одной на вариант. Он не хранит IP-адрес, email, время и запись о каждом голосе: связать голос с вами невозможно. Сервер возвращает только проценты, а не число голосов. Проценты, которые он вернул, сохраняются в вашем браузере; при следующих визитах страница показывает их оттуда и ни к какому серверу не обращается.'),
       ('Сторонние сервисы', 'Шрифты загружаются с самого сайта или берутся с вашего устройства; ни одна страница ничего не загружает с Google Fonts. Если вы голосуете в опросе, голос уходит на сервер Google Apps Script, как описано выше. Сайт размещён на GitHub Pages. В каждом из этих случаев ваш браузер соединяется с серверами этой компании, и они видят ваш IP-адрес, как при любом веб-запросе; мы этих данных не получаем и доступа к их журналам не имеем. К другим сторонним сервисам сайт не обращается.'),
       ('Дети', 'В Mind-OS нет вредного контента, и он не собирает данные, поэтому не создаёт риска для данных кого бы то ни было, включая несовершеннолетних. Это образовательный инструмент для саморефлексии, а не медицинский совет или диагноз.'),
       ('Ваши права', 'Поскольку мы не храним данных о вас, с нашей стороны нечего запрашивать, выгружать или удалять. Контроль полностью у вас: данные находятся только на вашем устройстве, и только вы можете их открыть или удалить.'),
       ('Как проверить это самому', 'Откройте инструменты разработчика в браузере (F12) → вкладка Network и пользуйтесь сайтом. Прохождение теста, трекер и игра не отправляют никаких запросов — вся обработка идёт в JavaScript у вас в браузере. Единственный запрос к чужому серверу появляется при нажатии «{submit}». Исходный код открыт.'),
       ('Контакт', 'Вопросы? Создайте обращение: {issues}.')],
  back='← Назад в Mind-OS', footer='Mind-OS — тест на зависимость от ИИ · Автор — Aleksei Sergeevich Bitkin', ref='Опорной считается английская версия этого текста.'),
 'es': dict(
  title='Política de privacidad', desc='Mind-OS no recoge datos personales. Sin cookies ni rastreo; el test funciona en tu navegador. La política de privacidad completa en lenguaje claro.',
  sub='Última actualización: {d} · En lenguaje claro, sin jerga legal.',
  short='<strong>En pocas palabras:</strong> el test, el registro y el juego no recogen nada: no hay servidor, base de datos, analítica, cookies ni rastreo. Todo lo que haces ahí se queda en tu navegador y no sale de tu dispositivo. La única excepción es la encuesta global opcional: si decides votar, se envía tu única elección a un servidor mínimo que guarda solo 3 contadores totales (A favor / Neutral / En contra), sin IP, correo, hora ni registro de cada voto.',
  sec=[('Qué datos recogemos', '<strong>Ninguno, salvo 3 números si votas en la encuesta.</strong> Mind-OS es un sitio estático: el test, el registro y el juego no tienen servidor. La encuesta global opcional es la única función con servidor; se explica más abajo.'),
       ('Adónde van tus respuestas', 'Tus respuestas del test, las entradas del registro y el idioma elegido se guardan solo en el <code>localStorage</code> de tu navegador, un almacenamiento privado en tu propio dispositivo. Nunca se transmite a ningún sitio. Puedes borrarlo cuando quieras limpiando los datos del navegador o con los botones de reinicio del sitio.'),
       ('Cookies', 'No usamos cookies de ningún tipo: ni de analítica, ni de publicidad, ni de sesión. No hay nada que aceptar, porque no se instala nada.'),
       ('Rastreo y analítica', 'No hay píxeles de seguimiento, Google Analytics, Facebook Pixel, huella digital ni rastreadores de terceros. No sabemos quién eres ni que nos has visitado.'),
       ('La única excepción: la encuesta global', 'La «{poll}» es totalmente opcional: el test funciona sin ella. Si decides votar, tu única elección (A favor / Neutral / En contra) se envía a un servidor mínimo (Google Apps Script) que guarda solo 3 totales, uno por opción. No guarda tu dirección IP, correo, hora ni ningún registro de cada voto: no hay forma de vincular un voto contigo. El servidor solo devuelve porcentajes, nunca el número de votos. Los porcentajes que devuelve se guardan en tu navegador; en visitas posteriores la página los muestra desde ahí y no contacta con ningún servidor.'),
       ('Servicios de terceros', 'Las fuentes se sirven desde este mismo sitio o se toman de tu dispositivo; ninguna página carga nada de Google Fonts. Si votas en la encuesta, tu voto va a un servidor de Google Apps Script, como se describe arriba. El sitio está alojado en GitHub Pages. En cada uno de estos casos tu navegador se conecta con los servidores de esa empresa, que ven tu dirección IP como en cualquier petición web; nosotros no recibimos esos datos ni tenemos acceso a sus registros. No se contacta con ningún otro servicio de terceros.'),
       ('Menores', 'Mind-OS no contiene contenido dañino y no recoge datos, por lo que no supone un riesgo de datos para nadie, incluidos los menores. Es una herramienta educativa de reflexión, no un consejo médico ni un diagnóstico.'),
       ('Tus derechos', 'Como no tenemos datos sobre ti, no hay nada que solicitar, exportar o borrar por nuestra parte. El control es tuyo: tus datos están solo en tu dispositivo y solo tú puedes verlos o eliminarlos.'),
       ('Cómo comprobarlo tú mismo', 'Abre las herramientas de desarrollo del navegador (F12) → pestaña Network y usa el sitio. Hacer el test, usar el registro o jugar no envía ninguna petición: todo se procesa en el JavaScript que se ejecuta en tu navegador. La única petición a otro servidor aparece al pulsar «{submit}». El código fuente es público.'),
       ('Contacto', '¿Preguntas? Abre una incidencia: {issues}.')],
  back='← Volver a Mind-OS', footer='Mind-OS — test de dependencia de la IA · Creado por Aleksei Sergeevich Bitkin', ref='La versión de referencia de este texto es la inglesa.'),
 'de': dict(
  title='Datenschutzerklärung', desc='Mind-OS erhebt keine personenbezogenen Daten. Keine Cookies, kein Tracking; der Test läuft in Ihrem Browser. Die vollständige Datenschutzerklärung in einfacher Sprache.',
  sub='Zuletzt aktualisiert: {d} · In einfacher Sprache, ohne Juristendeutsch.',
  short='<strong>Kurz gesagt:</strong> Test, Tracker und Spiel erheben nichts — kein Server, keine Datenbank, keine Analyse, keine Cookies, kein Tracking. Alles, was Sie dort tun, bleibt in Ihrem Browser und verlässt Ihr Gerät nicht. Die einzige Ausnahme ist die freiwillige globale Umfrage: Wenn Sie abstimmen, wird Ihre eine Auswahl an ein minimales Backend gesendet, das nur 3 Gesamtzähler speichert (Dafür / Neutral / Dagegen) — keine IP, keine E-Mail, keinen Zeitstempel und keinen Eintrag pro Stimme.',
  sec=[('Welche Daten wir erheben', '<strong>Keine, außer 3 Zahlen, wenn Sie an der Umfrage teilnehmen.</strong> Mind-OS ist eine statische Website: Test, Tracker und Spiel haben keinen Server. Nur die freiwillige globale Umfrage hat ein Backend — siehe unten.'),
       ('Wohin Ihre Antworten gehen', 'Ihre Testantworten, Tracker-Einträge und die gewählte Sprache werden nur im <code>localStorage</code> Ihres Browsers gespeichert — einem privaten Speicher auf Ihrem eigenen Gerät. Er wird nirgendwohin übertragen. Sie können ihn jederzeit löschen, indem Sie die Browserdaten löschen oder die Zurücksetzen-Schaltflächen der Website nutzen.'),
       ('Cookies', 'Wir verwenden keinerlei Cookies — weder für Analyse noch für Werbung oder Sitzungen. Es gibt nichts, dem Sie zustimmen müssten, weil nichts gesetzt wird.'),
       ('Tracking und Analyse', 'Es gibt keine Tracking-Pixel, kein Google Analytics, kein Facebook Pixel, kein Fingerprinting und keine Tracker von Dritten. Wir wissen nicht, wer Sie sind oder dass Sie die Seite besucht haben.'),
       ('Die einzige Ausnahme: die globale Umfrage', 'Die „{poll}“ ist völlig freiwillig — der Test funktioniert vollständig ohne sie. Wenn Sie abstimmen, wird Ihre eine Auswahl (Dafür / Neutral / Dagegen) an ein minimales Backend (Google Apps Script) gesendet, das nur 3 Summen speichert, eine pro Option. Es speichert weder Ihre IP-Adresse noch E-Mail, Zeitstempel oder einen Eintrag pro Stimme — eine Stimme lässt sich nicht auf Sie zurückführen. Das Backend gibt nur Prozentwerte zurück, nie die Zahl der Stimmen. Die zurückgegebenen Prozentwerte werden in Ihrem Browser gespeichert; bei späteren Besuchen zeigt die Seite sie von dort an und kontaktiert keinen Server.'),
       ('Dienste Dritter', 'Schriften werden von dieser Website selbst geladen oder stammen von Ihrem Gerät; keine Seite lädt etwas von Google Fonts. Wenn Sie abstimmen, geht Ihre Stimme wie oben beschrieben an ein Google-Apps-Script-Backend. Die Website wird auf GitHub Pages gehostet. In jedem dieser Fälle verbindet sich Ihr Browser mit den Servern des jeweiligen Unternehmens, die Ihre IP-Adresse wie bei jeder Webanfrage sehen; wir erhalten davon nichts und haben keinen Zugriff auf deren Protokolle. Weitere Dienste Dritter werden nicht kontaktiert.'),
       ('Kinder', 'Mind-OS enthält keine schädlichen Inhalte und erhebt keine Daten; es stellt daher für niemanden ein Datenrisiko dar, auch nicht für Minderjährige. Es ist ein Werkzeug zur Selbstreflexion mit Bildungscharakter, keine medizinische Beratung oder Diagnose.'),
       ('Ihre Rechte', 'Da wir keine Daten über Sie speichern, gibt es bei uns nichts anzufordern, zu exportieren oder zu löschen. Sie haben die volle Kontrolle: Ihre Daten liegen nur auf Ihrem Gerät, und nur Sie können darauf zugreifen oder sie entfernen.'),
       ('So prüfen Sie es selbst', 'Öffnen Sie die Entwicklertools Ihres Browsers (F12) → Tab „Network“ und nutzen Sie die Website. Test, Tracker und Spiel senden keine Anfragen — die gesamte Verarbeitung geschieht im JavaScript, das lokal in Ihrem Browser läuft. Die einzige Anfrage an einen fremden Server erscheint, wenn Sie auf „{submit}“ klicken. Der Quellcode ist offen einsehbar.'),
       ('Kontakt', 'Fragen? Eröffnen Sie ein Issue: {issues}.')],
  back='← Zurück zu Mind-OS', footer='Mind-OS — Selbsttest zur KI-Abhängigkeit · Erstellt von Aleksei Sergeevich Bitkin', ref='Maßgeblich ist die englische Fassung dieses Textes.'),
 'fr': dict(
  title='Politique de confidentialité', desc='Mind-OS ne collecte aucune donnée personnelle. Ni cookies ni suivi ; le test fonctionne dans votre navigateur. La politique de confidentialité complète, en langage clair.',
  sub='Dernière mise à jour : {d} · En langage clair, sans jargon juridique.',
  short='<strong>En bref :</strong> le test, le suivi et le jeu ne collectent rien — pas de serveur, pas de base de données, pas d’analyse d’audience, pas de cookies, pas de suivi. Tout ce que vous y faites reste dans votre navigateur et ne quitte pas votre appareil. La seule exception est le sondage mondial facultatif : si vous choisissez de voter, votre unique choix est envoyé à un serveur minimal qui ne conserve que 3 compteurs globaux (Pour / Neutre / Contre) — ni adresse IP, ni e-mail, ni horodatage, ni trace de chaque vote.',
  sec=[('Quelles données nous collectons', '<strong>Aucune, sauf 3 nombres si vous votez au sondage.</strong> Mind-OS est un site statique : le test, le suivi et le jeu n’ont pas de serveur. Le sondage mondial facultatif est la seule fonction dotée d’un serveur — voir plus bas.'),
       ('Où vont vos réponses', 'Vos réponses au test, vos entrées de suivi et la langue choisie sont enregistrées uniquement dans le <code>localStorage</code> de votre navigateur — un espace de stockage privé sur votre propre appareil. Il n’est jamais transmis. Vous pouvez l’effacer à tout moment en supprimant les données du navigateur ou avec les boutons de réinitialisation du site.'),
       ('Cookies', 'Nous n’utilisons aucun cookie — ni pour l’analyse, ni pour la publicité, ni pour les sessions. Il n’y a rien à accepter, puisque rien n’est déposé.'),
       ('Suivi et analyse d’audience', 'Il n’y a ni pixel de suivi, ni Google Analytics, ni Facebook Pixel, ni empreinte numérique, ni traceur tiers. Nous ne savons pas qui vous êtes ni que vous êtes venu.'),
       ('La seule exception : le sondage mondial', 'Le « {poll} » est entièrement facultatif — le test fonctionne sans lui. Si vous choisissez de voter, votre unique choix (Pour / Neutre / Contre) est envoyé à un serveur minimal (Google Apps Script) qui ne conserve que 3 totaux, un par option. Il ne conserve ni votre adresse IP, ni votre e-mail, ni l’heure, ni aucune trace de chaque vote : il est impossible de relier un vote à vous. Le serveur ne renvoie que des pourcentages, jamais le nombre de votes. Les pourcentages qu’il renvoie sont enregistrés dans votre navigateur ; lors des visites suivantes, la page les affiche à partir de là et ne contacte aucun serveur.'),
       ('Services tiers', 'Les polices sont servies par ce site lui-même ou proviennent de votre appareil ; aucune page ne charge quoi que ce soit depuis Google Fonts. Si vous votez au sondage, votre vote est envoyé à un serveur Google Apps Script, comme décrit ci-dessus. Le site est hébergé sur GitHub Pages. Dans chacun de ces cas, votre navigateur se connecte aux serveurs de l’entreprise concernée, qui voient votre adresse IP comme pour toute requête web ; nous n’en recevons rien et n’avons pas accès à leurs journaux. Aucun autre service tiers n’est contacté.'),
       ('Enfants', 'Mind-OS ne contient aucun contenu nuisible et ne collecte aucune donnée ; il ne présente donc aucun risque pour les données de quiconque, mineurs compris. C’est un outil éducatif de réflexion, pas un avis médical ni un diagnostic.'),
       ('Vos droits', 'Comme nous ne détenons aucune donnée vous concernant, il n’y a rien à demander, exporter ou supprimer de notre côté. Vous gardez le contrôle total : vos données se trouvent uniquement sur votre appareil, et vous seul pouvez y accéder ou les supprimer.'),
       ('Comment le vérifier vous-même', 'Ouvrez les outils de développement de votre navigateur (F12) → onglet Network, puis utilisez le site. Passer le test, utiliser le suivi ou jouer n’envoie aucune requête — tout le traitement se fait dans le JavaScript exécuté localement dans votre navigateur. La seule requête vers un autre serveur apparaît lorsque vous cliquez sur « {submit} ». Le code source est consultable librement.'),
       ('Contact', 'Des questions ? Ouvrez un ticket : {issues}.')],
  back='← Retour à Mind-OS', footer='Mind-OS — test de dépendance à l’IA · Créé par Aleksei Sergeevich Bitkin', ref='La version anglaise de ce texte fait référence.'),
 'ja': dict(
  title='プライバシーポリシー', desc='Mind-OSは個人データを収集しません。Cookieもトラッキングもなく、チェックはお使いのブラウザ内で動作します。わかりやすい言葉で書いたプライバシーポリシー全文です。',
  sub='最終更新：{d} · 専門用語を使わず、わかりやすく書いています。',
  short='<strong>要点：</strong>チェック、トラッカー、ゲームは何も収集しません。サーバー、データベース、アクセス解析、Cookie、トラッキングはありません。そこで行ったことはすべてお使いのブラウザ内に残り、端末の外に出ません。唯一の例外は任意のグローバル投票です。投票した場合、選んだ1つの選択肢だけが最小限のサーバーに送られ、そこには3つの合計（賛成／中立／反対）のみが保存されます。IPアドレス、メール、日時、個々の投票の記録は保存されません。',
  sec=[('収集するデータ', '<strong>投票した場合の3つの数値を除き、何も収集しません。</strong>Mind-OSは静的なウェブサイトで、チェック、トラッカー、ゲームにはサーバーがありません。サーバーがあるのは任意のグローバル投票だけです（下記参照）。'),
       ('回答の保存先', 'チェックの回答、トラッカーの記録、言語設定は、お使いのブラウザの<code>localStorage</code>にのみ保存されます。これは端末上のプライベートな保存領域で、どこにも送信されません。ブラウザのデータを消去するか、サイト内のリセットボタンを使えば、いつでも削除できます。'),
       ('Cookie', 'Cookieは一切使用していません。アクセス解析用、広告用、セッション用のいずれもありません。何も設定されないため、同意を求めるものもありません。'),
       ('トラッキングとアクセス解析', 'トラッキングピクセル、Google Analytics、Facebook Pixel、フィンガープリント、第三者のトラッカーはありません。当サイトは、あなたが誰か、訪問したかどうかを知りません。'),
       ('唯一の例外：グローバル投票', '「{poll}」は完全に任意で、チェックは投票なしでも利用できます。投票した場合、選んだ1つの選択肢（賛成／中立／反対）が最小限のサーバー（Google Apps Script）に送られ、選択肢ごとの合計3つだけが保存されます。IPアドレス、メール、日時、個々の投票の記録は保存されないため、投票をあなたに結びつけることはできません。サーバーが返すのは割合だけで、票数は返しません。返された割合はお使いのブラウザに保存され、次回以降はページがそこから表示するため、サーバーには接続しません。'),
       ('第三者のサービス', 'フォントはこのサイト自体から配信するか、お使いの端末のものを使用します。どのページもGoogle Fontsからは何も読み込みません。投票した場合、票は上記のとおりGoogle Apps Scriptのサーバーに送られます。サイトはGitHub Pagesでホストされています。いずれの場合も、お使いのブラウザは各社のサーバーに接続し、通常のウェブリクエストと同じくIPアドレスがそのサーバーに伝わりますが、当サイトはそれを受け取らず、各社のログにもアクセスできません。これ以外の第三者サービスには接続しません。'),
       ('子ども', 'Mind-OSには有害なコンテンツがなく、データも収集しないため、未成年を含め誰に対してもデータ上のリスクはありません。これは教育目的の振り返りツールであり、医療上の助言や診断ではありません。'),
       ('あなたの権利', '当サイトはあなたに関するデータを保持していないため、当サイト側で開示、エクスポート、削除を求める対象はありません。データはお使いの端末にのみあり、閲覧や削除ができるのはあなただけです。'),
       ('ご自身で確認する方法', 'ブラウザの開発者ツール（F12）→「Network」タブを開いてサイトを使ってみてください。チェック、トラッカー、ゲームではリクエストは一切送信されず、すべての処理はブラウザ内のJavaScriptで行われます。他のサーバーへのリクエストが現れるのは、「{submit}」を押したときだけです。ソースコードは公開されています。'),
       ('お問い合わせ', 'ご質問は Issue を作成してください：{issues}。')],
  back='← Mind-OSに戻る', footer='Mind-OS — AI依存度セルフチェック · 作成：Aleksei Sergeevich Bitkin', ref='この文書は英語版を正本とします。'),
 'vi': dict(
  title='Chính sách quyền riêng tư', desc='Mind-OS không thu thập dữ liệu cá nhân. Không cookie, không theo dõi; bài test chạy trong trình duyệt của bạn. Toàn văn chính sách quyền riêng tư bằng ngôn ngữ dễ hiểu.',
  sub='Cập nhật lần cuối: {d} · Viết bằng ngôn ngữ dễ hiểu, không thuật ngữ pháp lý.',
  short='<strong>Tóm tắt:</strong> bài test, nhật ký theo dõi và trò chơi không thu thập gì — không máy chủ, không cơ sở dữ liệu, không phân tích truy cập, không cookie, không theo dõi. Mọi thứ bạn làm ở đó nằm lại trong trình duyệt và không rời khỏi thiết bị của bạn. Ngoại lệ duy nhất là cuộc thăm dò toàn cầu (không bắt buộc): nếu bạn bỏ phiếu, lựa chọn duy nhất của bạn được gửi tới một máy chủ tối giản, nơi chỉ lưu 3 bộ đếm tổng (Ủng hộ / Trung lập / Phản đối) — không IP, email, thời gian hay bản ghi từng lá phiếu.',
  sec=[('Chúng tôi thu thập dữ liệu gì', '<strong>Không có gì, ngoài 3 con số nếu bạn bỏ phiếu trong cuộc thăm dò.</strong> Mind-OS là trang web tĩnh: bài test, nhật ký theo dõi và trò chơi không có máy chủ. Chỉ cuộc thăm dò toàn cầu (không bắt buộc) mới có máy chủ — xem bên dưới.'),
       ('Câu trả lời của bạn đi đâu', 'Câu trả lời bài test, các mục nhật ký và ngôn ngữ bạn chọn chỉ được lưu trong <code>localStorage</code> của trình duyệt — vùng lưu trữ riêng tư trên chính thiết bị của bạn. Nó không bao giờ được gửi đi đâu. Bạn có thể xóa bất cứ lúc nào bằng cách xóa dữ liệu trình duyệt hoặc dùng các nút đặt lại trên trang.'),
       ('Cookie', 'Chúng tôi không dùng bất kỳ cookie nào — không cho phân tích, quảng cáo hay phiên làm việc. Không có gì để đồng ý, vì không có gì được đặt.'),
       ('Theo dõi và phân tích', 'Không có pixel theo dõi, Google Analytics, Facebook Pixel, dấu vân tay trình duyệt hay trình theo dõi của bên thứ ba. Chúng tôi không biết bạn là ai và không biết bạn đã ghé thăm.'),
       ('Ngoại lệ duy nhất: cuộc thăm dò toàn cầu', '“{poll}” hoàn toàn không bắt buộc — bài test vẫn hoạt động đầy đủ khi không có nó. Nếu bạn bỏ phiếu, lựa chọn duy nhất của bạn (Ủng hộ / Trung lập / Phản đối) được gửi tới một máy chủ tối giản (Google Apps Script) chỉ lưu 3 tổng số, mỗi lựa chọn một tổng. Máy chủ không lưu địa chỉ IP, email, thời gian hay bản ghi từng lá phiếu — không có cách nào liên kết lá phiếu với bạn. Máy chủ chỉ trả về tỷ lệ phần trăm, không trả về số phiếu. Tỷ lệ mà máy chủ trả về được lưu trong trình duyệt của bạn; ở những lần truy cập sau, trang hiển thị từ đó và không liên hệ máy chủ nào.'),
       ('Dịch vụ bên thứ ba', 'Phông chữ được tải từ chính trang web này hoặc lấy từ thiết bị của bạn; không trang nào tải gì từ Google Fonts. Nếu bạn bỏ phiếu, lá phiếu được gửi tới máy chủ Google Apps Script như mô tả ở trên. Trang web được lưu trữ trên GitHub Pages. Trong mỗi trường hợp này, trình duyệt của bạn kết nối với máy chủ của công ty đó, và họ thấy địa chỉ IP của bạn như mọi yêu cầu web khác; chúng tôi không nhận được dữ liệu đó và không có quyền truy cập nhật ký của họ. Không có dịch vụ bên thứ ba nào khác được liên hệ.'),
       ('Trẻ em', 'Mind-OS không chứa nội dung có hại và không thu thập dữ liệu, nên không gây rủi ro dữ liệu cho bất kỳ ai, kể cả trẻ vị thành niên. Đây là công cụ tự nhìn lại mang tính giáo dục, không phải lời khuyên y tế hay chẩn đoán.'),
       ('Quyền của bạn', 'Vì chúng tôi không giữ dữ liệu nào về bạn nên phía chúng tôi không có gì để yêu cầu, xuất hay xóa. Bạn kiểm soát hoàn toàn: dữ liệu chỉ nằm trên thiết bị của bạn và chỉ bạn mới truy cập hoặc xóa được.'),
       ('Cách tự kiểm chứng', 'Mở công cụ dành cho nhà phát triển của trình duyệt (F12) → thẻ Network và dùng trang. Làm bài test, dùng nhật ký theo dõi hay chơi trò chơi không gửi yêu cầu nào — mọi xử lý diễn ra trong JavaScript chạy ngay trên trình duyệt của bạn. Yêu cầu duy nhất tới một máy chủ khác xuất hiện khi bạn bấm “{submit}”. Mã nguồn được công khai.'),
       ('Liên hệ', 'Có câu hỏi? Hãy mở một issue: {issues}.')],
  back='← Quay lại Mind-OS', footer='Mind-OS — bài tự đánh giá mức độ phụ thuộc AI · Tác giả: Aleksei Sergeevich Bitkin', ref='Bản tiếng Anh là bản gốc để đối chiếu.'),
 'th': dict(
  title='นโยบายความเป็นส่วนตัว', desc='Mind-OS ไม่เก็บข้อมูลส่วนบุคคล ไม่มีคุกกี้ ไม่มีการติดตาม แบบทดสอบทำงานในเบราว์เซอร์ของคุณ นโยบายความเป็นส่วนตัวฉบับเต็มในภาษาที่เข้าใจง่าย',
  sub='อัปเดตล่าสุด: {d} · เขียนด้วยภาษาที่เข้าใจง่าย ไม่ใช้ศัพท์กฎหมาย',
  short='<strong>สรุปสั้น ๆ:</strong> แบบทดสอบ ตัวติดตาม และเกม ไม่เก็บอะไรเลย ไม่มีเซิร์ฟเวอร์ ฐานข้อมูล ระบบวิเคราะห์ คุกกี้ หรือการติดตาม ทุกอย่างที่คุณทำอยู่ในเบราว์เซอร์ของคุณและไม่ออกจากอุปกรณ์ ข้อยกเว้นเดียวคือโพลระดับโลกซึ่งไม่บังคับ: หากคุณเลือกโหวต ระบบจะส่งตัวเลือกเดียวของคุณไปยังเซิร์ฟเวอร์ขนาดเล็กที่เก็บเพียงตัวนับรวม 3 ค่า (เห็นด้วย / เป็นกลาง / ไม่เห็นด้วย) ไม่มี IP อีเมล เวลา หรือบันทึกรายโหวต',
  sec=[('เราเก็บข้อมูลอะไร', '<strong>ไม่มี ยกเว้นตัวเลข 3 ค่าหากคุณโหวตในโพล</strong> Mind-OS เป็นเว็บไซต์แบบสแตติก แบบทดสอบ ตัวติดตาม และเกมไม่มีเซิร์ฟเวอร์ มีเพียงโพลระดับโลกซึ่งไม่บังคับเท่านั้นที่มีเซิร์ฟเวอร์ ดูรายละเอียดด้านล่าง'),
       ('คำตอบของคุณไปอยู่ที่ไหน', 'คำตอบแบบทดสอบ รายการในตัวติดตาม และภาษาที่เลือก ถูกบันทึกเฉพาะใน <code>localStorage</code> ของเบราว์เซอร์ ซึ่งเป็นพื้นที่จัดเก็บส่วนตัวบนอุปกรณ์ของคุณเอง ไม่มีการส่งออกไปที่ใด คุณลบได้ทุกเมื่อด้วยการล้างข้อมูลเบราว์เซอร์หรือใช้ปุ่มรีเซ็ตในเว็บไซต์'),
       ('คุกกี้', 'เราไม่ใช้คุกกี้ใด ๆ ทั้งสิ้น ไม่ว่าเพื่อการวิเคราะห์ โฆษณา หรือเซสชัน จึงไม่มีอะไรให้ต้องยินยอม เพราะไม่มีการตั้งค่าอะไรเลย'),
       ('การติดตามและการวิเคราะห์', 'ไม่มีพิกเซลติดตาม Google Analytics, Facebook Pixel การทำลายนิ้วมือเบราว์เซอร์ หรือตัวติดตามของบุคคลที่สาม เราไม่รู้ว่าคุณเป็นใครและไม่รู้ว่าคุณเข้ามาเยี่ยมชม'),
       ('ข้อยกเว้นเดียว: โพลระดับโลก', '“{poll}” ไม่บังคับเลย แบบทดสอบใช้งานได้ครบถ้วนโดยไม่ต้องโหวต หากคุณเลือกโหวต ตัวเลือกเดียวของคุณ (เห็นด้วย / เป็นกลาง / ไม่เห็นด้วย) จะถูกส่งไปยังเซิร์ฟเวอร์ขนาดเล็ก (Google Apps Script) ที่เก็บเพียงผลรวม 3 ค่า ค่าละหนึ่งตัวเลือก ไม่เก็บ IP อีเมล เวลา หรือบันทึกรายโหวต จึงไม่มีทางเชื่อมโยงโหวตกลับมาหาคุณได้ เซิร์ฟเวอร์ส่งกลับเฉพาะเปอร์เซ็นต์ ไม่ส่งจำนวนโหวต เปอร์เซ็นต์ที่ส่งกลับมาจะถูกบันทึกไว้ในเบราว์เซอร์ของคุณ เมื่อกลับมาครั้งต่อไปหน้าเว็บจะแสดงจากที่นั่นและไม่ติดต่อเซิร์ฟเวอร์ใด'),
       ('บริการของบุคคลที่สาม', 'ฟอนต์ให้บริการจากเว็บไซต์นี้เองหรือใช้ฟอนต์ในอุปกรณ์ของคุณ ไม่มีหน้าใดโหลดอะไรจาก Google Fonts หากคุณโหวต โหวตของคุณจะถูกส่งไปยังเซิร์ฟเวอร์ Google Apps Script ตามที่อธิบายข้างต้น เว็บไซต์นี้โฮสต์บน GitHub Pages ในแต่ละกรณี เบราว์เซอร์ของคุณจะเชื่อมต่อกับเซิร์ฟเวอร์ของบริษัทนั้น ซึ่งจะเห็น IP ของคุณเช่นเดียวกับคำขอเว็บทั่วไป เราไม่ได้รับข้อมูลนั้นและเข้าถึงบันทึกของพวกเขาไม่ได้ ไม่มีการติดต่อบริการของบุคคลที่สามอื่นใด'),
       ('เด็ก', 'Mind-OS ไม่มีเนื้อหาที่เป็นอันตรายและไม่เก็บข้อมูล จึงไม่มีความเสี่ยงด้านข้อมูลต่อผู้ใด รวมถึงผู้เยาว์ นี่เป็นเครื่องมือเพื่อการทบทวนตนเองเชิงการศึกษา ไม่ใช่คำแนะนำทางการแพทย์หรือการวินิจฉัย'),
       ('สิทธิ์ของคุณ', 'เนื่องจากเราไม่ได้เก็บข้อมูลเกี่ยวกับคุณ จึงไม่มีสิ่งใดให้ร้องขอ ส่งออก หรือลบจากฝั่งเรา คุณควบคุมได้เต็มที่: ข้อมูลอยู่บนอุปกรณ์ของคุณเท่านั้น และมีเพียงคุณที่เข้าถึงหรือลบได้'),
       ('วิธีตรวจสอบด้วยตนเอง', 'เปิดเครื่องมือสำหรับนักพัฒนาของเบราว์เซอร์ (F12) → แท็บ Network แล้วใช้งานเว็บไซต์ การทำแบบทดสอบ ใช้ตัวติดตาม หรือเล่นเกม ไม่ส่งคำขอใด ๆ การประมวลผลทั้งหมดเกิดขึ้นใน JavaScript ที่ทำงานในเบราว์เซอร์ของคุณ คำขอเดียวที่ส่งไปยังเซิร์ฟเวอร์อื่นจะปรากฏเมื่อคุณกด “{submit}” ซอร์สโค้ดเปิดให้ดูได้'),
       ('ติดต่อ', 'มีคำถาม? เปิด issue ได้ที่ {issues}')],
  back='← กลับไปที่ Mind-OS', footer='Mind-OS — แบบประเมินตนเองเรื่องการพึ่งพา AI · สร้างโดย Aleksei Sergeevich Bitkin', ref='ฉบับภาษาอังกฤษเป็นฉบับอ้างอิง'),
 'pt': dict(
  title='Política de privacidade', desc='O Mind-OS não coleta dados pessoais. Sem cookies e sem rastreamento; o teste roda no seu navegador. A política de privacidade completa em linguagem simples.',
  sub='Última atualização: {d} · Em linguagem simples, sem juridiquês.',
  short='<strong>Em resumo:</strong> o teste, o registro e o jogo não coletam nada — sem servidor, banco de dados, análise de acessos, cookies ou rastreamento. Tudo o que você faz ali fica no seu navegador e não sai do seu dispositivo. A única exceção é a enquete global opcional: se você decidir votar, sua única escolha é enviada a um servidor mínimo que guarda apenas 3 contadores totais (A favor / Neutro / Contra) — sem IP, e-mail, horário ou registro de cada voto.',
  sec=[('Que dados coletamos', '<strong>Nenhum, exceto 3 números se você votar na enquete.</strong> O Mind-OS é um site estático: o teste, o registro e o jogo não têm servidor. A enquete global opcional é a única função com servidor — veja abaixo.'),
       ('Para onde vão suas respostas', 'Suas respostas do teste, entradas do registro e o idioma escolhido ficam salvos apenas no <code>localStorage</code> do seu navegador — um armazenamento privado no seu próprio dispositivo. Ele nunca é transmitido. Você pode apagá-lo a qualquer momento limpando os dados do navegador ou usando os botões de reinício do site.'),
       ('Cookies', 'Não usamos nenhum tipo de cookie — nem de análise, nem de publicidade, nem de sessão. Não há nada para aceitar, porque nada é gravado.'),
       ('Rastreamento e análise', 'Não há pixels de rastreamento, Google Analytics, Facebook Pixel, impressão digital do navegador nem rastreadores de terceiros. Não sabemos quem você é nem que você visitou o site.'),
       ('A única exceção: a enquete global', 'A “{poll}” é totalmente opcional — o teste funciona sem ela. Se você decidir votar, sua única escolha (A favor / Neutro / Contra) é enviada a um servidor mínimo (Google Apps Script) que guarda apenas 3 totais, um por opção. Ele não guarda seu endereço IP, e-mail, horário nem registro de cada voto — não há como ligar um voto a você. O servidor só devolve porcentagens, nunca o número de votos. As porcentagens que ele devolve ficam salvas no seu navegador; nas visitas seguintes a página as mostra a partir dali e não contata nenhum servidor.'),
       ('Serviços de terceiros', 'As fontes são servidas pelo próprio site ou vêm do seu dispositivo; nenhuma página carrega nada do Google Fonts. Se você votar na enquete, seu voto vai para um servidor Google Apps Script, como descrito acima. O site é hospedado no GitHub Pages. Em cada um desses casos, seu navegador se conecta aos servidores dessa empresa, que veem seu endereço IP como em qualquer requisição web; nós não recebemos esses dados nem temos acesso aos registros deles. Nenhum outro serviço de terceiros é contatado.'),
       ('Crianças', 'O Mind-OS não tem conteúdo nocivo e não coleta dados, portanto não representa risco de dados para ninguém, inclusive menores. É uma ferramenta educativa de reflexão, não aconselhamento médico nem diagnóstico.'),
       ('Seus direitos', 'Como não guardamos dados sobre você, não há nada para solicitar, exportar ou apagar do nosso lado. O controle é todo seu: seus dados ficam apenas no seu dispositivo, e só você pode acessá-los ou removê-los.'),
       ('Como verificar você mesmo', 'Abra as ferramentas de desenvolvedor do navegador (F12) → aba Network e use o site. Fazer o teste, usar o registro ou jogar não envia nenhuma requisição — todo o processamento acontece no JavaScript executado no seu navegador. A única requisição a outro servidor aparece quando você clica em “{submit}”. O código-fonte é aberto para consulta.'),
       ('Contato', 'Dúvidas? Abra uma issue: {issues}.')],
  back='← Voltar ao Mind-OS', footer='Mind-OS — teste de dependência de IA · Criado por Aleksei Sergeevich Bitkin', ref='A versão em inglês deste texto é a de referência.'),
 'ko': dict(
  title='개인정보 처리방침', desc='Mind-OS는 개인정보를 수집하지 않습니다. 쿠키도 추적도 없으며, 테스트는 브라우저 안에서 작동합니다. 쉬운 말로 쓴 개인정보 처리방침 전문입니다.',
  sub='최종 업데이트: {d} · 법률 용어 없이 쉬운 말로 썼습니다.',
  short='<strong>요약:</strong> 테스트, 트래커, 게임은 아무것도 수집하지 않습니다. 서버, 데이터베이스, 분석 도구, 쿠키, 추적이 없습니다. 그곳에서 하는 모든 일은 브라우저 안에 남고 기기 밖으로 나가지 않습니다. 유일한 예외는 선택 사항인 글로벌 투표입니다. 투표하면 선택한 항목 하나만 최소한의 서버로 전송되고, 서버는 합계 3개(찬성 / 중립 / 반대)만 저장합니다. IP, 이메일, 시각, 개별 투표 기록은 저장하지 않습니다.',
  sec=[('수집하는 데이터', '<strong>투표할 경우의 숫자 3개 외에는 없습니다.</strong> Mind-OS는 정적 웹사이트로, 테스트·트래커·게임에는 서버가 없습니다. 서버가 있는 기능은 선택 사항인 글로벌 투표뿐입니다(아래 참조).'),
       ('답변이 저장되는 곳', '테스트 답변, 트래커 기록, 언어 설정은 브라우저의 <code>localStorage</code>에만 저장됩니다. 이는 사용자 기기에 있는 개인 저장 공간이며 어디로도 전송되지 않습니다. 브라우저 데이터를 지우거나 사이트의 초기화 버튼을 사용하면 언제든지 삭제할 수 있습니다.'),
       ('쿠키', '어떤 종류의 쿠키도 사용하지 않습니다. 분석용, 광고용, 세션용 모두 없습니다. 설정되는 것이 없으므로 동의할 것도 없습니다.'),
       ('추적 및 분석', '추적 픽셀, Google Analytics, Facebook Pixel, 핑거프린팅, 제3자 추적기가 없습니다. 저희는 사용자가 누구인지, 방문했는지 알지 못합니다.'),
       ('유일한 예외: 글로벌 투표', '“{poll}”는 완전히 선택 사항이며, 테스트는 투표 없이도 모두 작동합니다. 투표하면 선택한 항목 하나(찬성 / 중립 / 반대)가 최소한의 서버(Google Apps Script)로 전송되고, 서버는 항목별 합계 3개만 저장합니다. IP 주소, 이메일, 시각, 개별 투표 기록은 저장하지 않으므로 투표를 사용자와 연결할 방법이 없습니다. 서버는 비율만 반환하며 투표 수는 반환하지 않습니다. 서버가 반환한 비율은 브라우저에 저장되며, 이후 방문 시 페이지는 그 값을 보여 줄 뿐 어떤 서버에도 연결하지 않습니다.'),
       ('제3자 서비스', '글꼴은 이 사이트에서 직접 제공하거나 사용자 기기의 글꼴을 사용합니다. 어떤 페이지도 Google Fonts에서 아무것도 불러오지 않습니다. 투표하면 위에서 설명한 대로 Google Apps Script 서버로 전송됩니다. 사이트는 GitHub Pages에서 호스팅됩니다. 각 경우에 브라우저는 해당 회사의 서버에 연결되며, 일반적인 웹 요청과 마찬가지로 그 서버는 IP 주소를 볼 수 있습니다. 저희는 그 정보를 받지 않으며 해당 회사의 로그에 접근할 수 없습니다. 그 밖의 제3자 서비스에는 연결하지 않습니다.'),
       ('아동', 'Mind-OS에는 유해한 콘텐츠가 없고 데이터를 수집하지 않으므로, 미성년자를 포함해 누구에게도 데이터 위험이 없습니다. 이는 교육 목적의 자기 성찰 도구이며 의학적 조언이나 진단이 아닙니다.'),
       ('사용자의 권리', '저희는 사용자에 관한 데이터를 보유하지 않으므로 저희 쪽에 열람, 내보내기, 삭제를 요청할 대상이 없습니다. 데이터는 사용자의 기기에만 있으며, 사용자만 접근하거나 삭제할 수 있습니다.'),
       ('직접 확인하는 방법', '브라우저 개발자 도구(F12) → Network 탭을 열고 사이트를 사용해 보세요. 테스트, 트래커, 게임은 어떤 요청도 보내지 않으며 모든 처리는 브라우저에서 실행되는 JavaScript로 이루어집니다. 다른 서버로의 요청은 “{submit}”을 누를 때에만 나타납니다. 소스 코드는 공개되어 있습니다.'),
       ('문의', '질문이 있으면 이슈를 열어 주세요: {issues}.')],
  back='← Mind-OS로 돌아가기', footer='Mind-OS — AI 의존도 자가진단 · 제작: Aleksei Sergeevich Bitkin', ref='이 문서는 영어판을 기준으로 합니다.'),
 'it': dict(
  title='Informativa sulla privacy', desc='Mind-OS non raccoglie dati personali. Niente cookie né tracciamento; il test funziona nel tuo browser. L’informativa sulla privacy completa, in linguaggio semplice.',
  sub='Ultimo aggiornamento: {d} · In linguaggio semplice, senza legalese.',
  short='<strong>In breve:</strong> il test, il diario e il gioco non raccolgono nulla: niente server, database, statistiche, cookie o tracciamento. Tutto ciò che fai lì resta nel tuo browser e non lascia il tuo dispositivo. L’unica eccezione è il sondaggio globale facoltativo: se scegli di votare, la tua unica scelta viene inviata a un server minimo che conserva solo 3 contatori complessivi (A favore / Neutrale / Contro), senza IP, e-mail, orario o registro di ogni voto.',
  sec=[('Quali dati raccogliamo', '<strong>Nessuno, tranne 3 numeri se voti nel sondaggio.</strong> Mind-OS è un sito statico: il test, il diario e il gioco non hanno un server. Il sondaggio globale facoltativo è l’unica funzione con un server — vedi sotto.'),
       ('Dove vanno le tue risposte', 'Le risposte al test, le voci del diario e la lingua scelta vengono salvate solo nel <code>localStorage</code> del tuo browser, uno spazio privato sul tuo dispositivo. Non viene mai trasmesso. Puoi cancellarlo in qualsiasi momento eliminando i dati del browser o usando i pulsanti di reset del sito.'),
       ('Cookie', 'Non usiamo cookie di alcun tipo: né per le statistiche, né per la pubblicità, né per le sessioni. Non c’è nulla da accettare, perché non viene impostato nulla.'),
       ('Tracciamento e statistiche', 'Non ci sono pixel di tracciamento, Google Analytics, Facebook Pixel, fingerprinting né tracker di terze parti. Non sappiamo chi sei né che hai visitato il sito.'),
       ('L’unica eccezione: il sondaggio globale', 'Il “{poll}” è del tutto facoltativo: il test funziona anche senza. Se scegli di votare, la tua unica scelta (A favore / Neutrale / Contro) viene inviata a un server minimo (Google Apps Script) che conserva solo 3 totali, uno per opzione. Non conserva il tuo indirizzo IP, l’e-mail, l’orario né alcun registro di ogni voto: non c’è modo di collegare un voto a te. Il server restituisce solo percentuali, mai il numero dei voti. Le percentuali che restituisce vengono salvate nel tuo browser; nelle visite successive la pagina le mostra da lì e non contatta alcun server.'),
       ('Servizi di terze parti', 'I font sono serviti da questo stesso sito o presi dal tuo dispositivo; nessuna pagina carica nulla da Google Fonts. Se voti nel sondaggio, il voto va a un server Google Apps Script, come descritto sopra. Il sito è ospitato su GitHub Pages. In ognuno di questi casi il tuo browser si collega ai server di quell’azienda, che vedono il tuo indirizzo IP come per qualsiasi richiesta web; noi non riceviamo quei dati e non abbiamo accesso ai loro registri. Nessun altro servizio di terze parti viene contattato.'),
       ('Minori', 'Mind-OS non contiene contenuti dannosi e non raccoglie dati, quindi non comporta rischi per i dati di nessuno, minori compresi. È uno strumento educativo di riflessione, non un consiglio medico né una diagnosi.'),
       ('I tuoi diritti', 'Poiché non conserviamo dati su di te, da parte nostra non c’è nulla da richiedere, esportare o cancellare. Il controllo è tuo: i tuoi dati si trovano solo sul tuo dispositivo e solo tu puoi consultarli o rimuoverli.'),
       ('Come verificarlo da solo', 'Apri gli strumenti per sviluppatori del browser (F12) → scheda Network e usa il sito. Fare il test, usare il diario o giocare non invia alcuna richiesta: tutta l’elaborazione avviene nel JavaScript eseguito nel tuo browser. L’unica richiesta a un altro server compare quando clicchi su “{submit}”. Il codice sorgente è consultabile liberamente.'),
       ('Contatti', 'Domande? Apri una segnalazione: {issues}.')],
  back='← Torna a Mind-OS', footer='Mind-OS — test di dipendenza dall’IA · Creato da Aleksei Sergeevich Bitkin', ref='Fa fede la versione inglese di questo testo.'),
 'hi': dict(
  title='गोपनीयता नीति', desc='Mind-OS कोई निजी डेटा इकट्ठा नहीं करता। न कुकी, न ट्रैकिंग; टेस्ट आपके ब्राउज़र में चलता है। सरल भाषा में पूरी गोपनीयता नीति।',
  sub='अंतिम अपडेट: {d} · सरल भाषा में, क़ानूनी शब्दजाल के बिना।',
  short='<strong>संक्षेप में:</strong> टेस्ट, ट्रैकर और गेम कुछ भी इकट्ठा नहीं करते — न सर्वर, न डेटाबेस, न एनालिटिक्स, न कुकी, न ट्रैकिंग। वहाँ आप जो भी करते हैं वह आपके ब्राउज़र में ही रहता है और आपके डिवाइस से बाहर नहीं जाता। एकमात्र अपवाद वैकल्पिक ग्लोबल पोल है: अगर आप वोट देना चुनते हैं, तो आपकी एक पसंद एक छोटे सर्वर को भेजी जाती है जो केवल 3 कुल गिनतियाँ (पक्ष में / तटस्थ / विरोध में) रखता है — न IP, न ईमेल, न समय, न हर वोट का रिकॉर्ड।',
  sec=[('हम कौन-सा डेटा इकट्ठा करते हैं', '<strong>कोई नहीं, सिवाय 3 संख्याओं के अगर आप पोल में वोट देते हैं।</strong> Mind-OS एक स्टैटिक वेबसाइट है: टेस्ट, ट्रैकर और गेम का कोई सर्वर नहीं है। सर्वर केवल वैकल्पिक ग्लोबल पोल का है — नीचे देखें।'),
       ('आपके जवाब कहाँ जाते हैं', 'आपके टेस्ट के जवाब, ट्रैकर की एंट्री और चुनी हुई भाषा केवल आपके ब्राउज़र के <code>localStorage</code> में सेव होती हैं — यह आपके अपने डिवाइस पर एक निजी स्टोरेज है। इसे कहीं नहीं भेजा जाता। आप इसे कभी भी ब्राउज़र डेटा साफ़ करके या साइट के रीसेट बटन से मिटा सकते हैं।'),
       ('कुकी', 'हम किसी भी तरह की कुकी इस्तेमाल नहीं करते — न एनालिटिक्स के लिए, न विज्ञापन के लिए, न सेशन के लिए। सहमति देने जैसा कुछ नहीं है, क्योंकि कुछ सेट ही नहीं होता।'),
       ('ट्रैकिंग और एनालिटिक्स', 'कोई ट्रैकिंग पिक्सेल, Google Analytics, Facebook Pixel, फ़िंगरप्रिंटिंग या थर्ड-पार्टी ट्रैकर नहीं है। हमें नहीं पता कि आप कौन हैं या आप साइट पर आए थे।'),
       ('एकमात्र अपवाद: ग्लोबल पोल', '“{poll}” पूरी तरह वैकल्पिक है — टेस्ट इसके बिना भी पूरा काम करता है। अगर आप वोट देते हैं, तो आपकी एक पसंद (पक्ष में / तटस्थ / विरोध में) एक छोटे सर्वर (Google Apps Script) को भेजी जाती है जो केवल 3 कुल संख्याएँ रखता है, हर विकल्प की एक। यह आपका IP पता, ईमेल, समय या हर वोट का रिकॉर्ड नहीं रखता — वोट को आपसे जोड़ने का कोई तरीका नहीं है। सर्वर केवल प्रतिशत लौटाता है, वोटों की संख्या नहीं। सर्वर जो प्रतिशत लौटाता है वे आपके ब्राउज़र में सेव हो जाते हैं; अगली बार पेज उन्हें वहीं से दिखाता है और किसी सर्वर से संपर्क नहीं करता।'),
       ('थर्ड-पार्टी सेवाएँ', 'फ़ॉन्ट इसी साइट से दिए जाते हैं या आपके डिवाइस से लिए जाते हैं; कोई भी पेज Google Fonts से कुछ लोड नहीं करता। अगर आप पोल में वोट देते हैं, तो आपका वोट ऊपर बताए अनुसार Google Apps Script सर्वर को जाता है। साइट GitHub Pages पर होस्ट है। इनमें से हर मामले में आपका ब्राउज़र उस कंपनी के सर्वर से जुड़ता है, जो किसी भी वेब रिक्वेस्ट की तरह आपका IP पता देखते हैं; हमें वह जानकारी नहीं मिलती और उनके लॉग तक हमारी पहुँच नहीं है। किसी और थर्ड-पार्टी सेवा से संपर्क नहीं किया जाता।'),
       ('बच्चे', 'Mind-OS में कोई हानिकारक सामग्री नहीं है और यह डेटा इकट्ठा नहीं करता, इसलिए नाबालिगों सहित किसी के लिए भी डेटा का जोखिम नहीं है। यह आत्म-चिंतन का एक शैक्षिक टूल है, चिकित्सा सलाह या निदान नहीं।'),
       ('आपके अधिकार', 'चूँकि हमारे पास आपका कोई डेटा नहीं है, इसलिए हमारी ओर से माँगने, एक्सपोर्ट करने या मिटाने के लिए कुछ नहीं है। पूरा नियंत्रण आपके पास है: आपका डेटा केवल आपके डिवाइस पर रहता है और केवल आप ही उसे देख या हटा सकते हैं।'),
       ('ख़ुद कैसे जाँचें', 'अपने ब्राउज़र के डेवलपर टूल (F12) → Network टैब खोलें और साइट इस्तेमाल करें। टेस्ट देने, ट्रैकर चलाने या गेम खेलने पर कहीं कोई रिक्वेस्ट नहीं जाती — सारी प्रोसेसिंग आपके ब्राउज़र में चल रहे JavaScript में होती है। किसी दूसरे सर्वर को एकमात्र रिक्वेस्ट तब दिखती है जब आप “{submit}” दबाते हैं। सोर्स कोड खुले तौर पर देखा जा सकता है।'),
       ('संपर्क', 'सवाल हैं? एक issue खोलें: {issues}।')],
  back='← Mind-OS पर वापस जाएँ', footer='Mind-OS — AI निर्भरता सेल्फ़-टेस्ट · निर्माता: Aleksei Sergeevich Bitkin', ref='इस पाठ का अंग्रेज़ी संस्करण ही संदर्भ माना जाएगा।'),
}

CSS = """  :root { --bg:#0b100d; --surface:#131e18; --accent:#00e57a; --text:#ecf7f0; --text-dim:#b4cec0; --border:#1f3027; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',system-ui,sans-serif; line-height:1.7;
    padding:2rem 1.5rem; max-width:760px; margin:0 auto; }
  a { color:var(--accent); }
  h1 { font-size:2rem; margin-bottom:0.5rem; }
  .sub { color:var(--text-dim); margin-bottom:2.5rem; }
  h2 { color:var(--accent); font-size:1.25rem; margin:2rem 0 0.75rem; }
  p, li { color:var(--text); margin-bottom:0.75rem; }
  .highlight { background:rgba(0,229,122,0.1); border:1px solid var(--accent); border-radius:1rem; padding:1.5rem; margin:1.5rem 0; }
  .highlight strong { color:var(--accent); }
  .back { display:inline-block; margin-top:2.5rem; padding:0.75rem 2rem; background:var(--accent); color:#0b100d;
    border-radius:3rem; text-decoration:none; font-weight:700; }
  footer { margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--border); color:var(--text-dim); font-size:0.85rem; }
  code { background:var(--surface); padding:0.15rem 0.45rem; border-radius:0.35rem; font-size:0.9em; color:var(--accent); }
  .ref { color:var(--text-dim); font-size:0.9rem; }"""


def ui(lang, key):
    s = open(ROOT + f'js/translations/{lang}.js', encoding='utf-8-sig').read()
    m = re.search(r'^\s*' + key + r':\s*"((?:[^"\\]|\\.)*)"', s, re.M)
    v = m.group(1).replace('\\"', '"')
    return re.sub(r'^[^\w(]+', '', v).strip()          # drop a leading emoji


def url(lang):
    return SITE + ('' if lang == 'en' else lang + '/') + 'privacy.html'


def build(lang):
    t = T[lang]
    fill = lambda x: x.format(d=UPDATED, poll=ui(lang, 'pollTitle'), submit=ui(lang, 'submitPoll'), issues=ISSUES)
    alt = ''.join(f'<link rel="alternate" hreflang="{l}" href="{url(l)}">\n' for l in LANGS) + f'<link rel="alternate" hreflang="x-default" href="{url("en")}">\n'
    body = ''.join(f'\n  <h2>{h.replace("&", "&amp;")}</h2>\n  <p>{fill(p)}</p>\n' for h, p in t['sec'])
    ref = f'\n  <p class="ref">{t["ref"]} <a href="{url("en")}" hreflang="en">English</a></p>\n' if t['ref'] else ''
    page = (f'<!DOCTYPE html>\n<html lang="{lang}">\n<head>\n<meta charset="UTF-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            f'<title>{t["title"]} — Mind-OS</title>\n<meta name="description" content="{t["desc"]}">\n'
            f'<meta name="robots" content="index, follow">\n<link rel="canonical" href="{url(lang)}">\n{alt}'
            f'<style>\n{CSS}\n</style>\n</head>\n<body>\n  <h1>{t["title"]}</h1>\n  <p class="sub">{fill(t["sub"])}</p>\n\n'
            f'  <div class="highlight">\n    {fill(t["short"])}\n  </div>\n{body}{ref}\n'
            f'  <a class="back" href="./">{t["back"]}</a>\n\n  <footer>\n    {t["footer"]} · {ORCID}\n  </footer>\n</body>\n</html>\n')
    path = ROOT + ('' if lang == 'en' else lang + os.sep) + 'privacy.html'
    open(path, 'w', encoding='utf-8', newline='\n').write(page)
    return path


if __name__ == '__main__':
    for L in LANGS:
        assert len(T[L]['sec']) == 10, L
        build(L)
    print('privacy pages written:', len(LANGS))
