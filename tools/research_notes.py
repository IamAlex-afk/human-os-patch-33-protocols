"""'What research says' blocks for protocols.html and poll.html, in 12 languages.
Every statement was checked against the primary source on 2026-10-07 (abstract on the publisher / arXiv / Crossref page):
  risko    Risko & Gilbert, "Cognitive Offloading", Trends in Cognitive Sciences 20(9), 2016
  sparrow  Sparrow, Liu, Wegner, "Google Effects on Memory", Science 333, 2011 - abstract: more likely to encode "where" than "what"
  lee      Lee et al., CHI 2025 - 319 knowledge workers; higher confidence in GenAI ~ less critical thinking, self-confidence ~ more
  gerlich  Gerlich, Societies 15(1):6, 2025 - 666 participants; negative correlation AI tool use / critical thinking (a correction exists)
  kosmyna  Kosmyna et al., arXiv:2506.08872 - 54 participants, 3 groups, LLM group weakest connectivity; preprint, not peer reviewed
  pew      Pew Research Center, 2025-04-03 - 17% public / 56% experts positive; 51% public / 15% experts more concerned than excited;
           5,410 US adults (Aug 12-18, 2024), 1,013 AI experts (Aug 14 - Oct 31, 2024)
Each item is (text, source key). Do not add a number or claim that is not in the list above.
"""
SRC = {
    'risko': ('Risko & Gilbert, Trends in Cognitive Sciences, 2016', 'https://doi.org/10.1016/j.tics.2016.07.002'),
    'sparrow': ('Sparrow, Liu & Wegner, Science, 2011', 'https://doi.org/10.1126/science.1207745'),
    'lee': ('Lee et al., CHI 2025', 'https://doi.org/10.1145/3706598.3713778'),
    'gerlich': ('Gerlich, Societies, 2025', 'https://doi.org/10.3390/soc15010006'),
    'kosmyna': ('Kosmyna et al., arXiv:2506.08872', 'https://arxiv.org/abs/2506.08872'),
    'pew': ('Pew Research Center, 2025', 'https://www.pewresearch.org/internet/2025/04/03/how-the-us-public-and-ai-experts-view-artificial-intelligence/'),
}
ORDER = {'protocols.html': ['risko', 'sparrow', 'lee', 'gerlich', 'kosmyna'], 'poll.html': ['pew', 'pew']}

# per language: page -> (heading, [item texts in ORDER], closing note)
N = {
 'en': {
  'protocols.html': ('What research says', [
    '“Cognitive offloading” is the research term for handing a mental task to something outside your head: a note, a search engine, an AI assistant.',
    'When people expect to be able to look information up later, they remember where to find it better than the information itself.',
    'In a survey of 319 knowledge workers, more confidence in generative AI went together with less critical thinking, and more confidence in oneself with more.',
    'In a study of 666 people, frequent use of AI tools was associated with lower critical-thinking scores. This is a correlation: it does not prove that AI is the cause.',
    'In an experiment with 54 participants writing essays, the group using an AI assistant showed the weakest brain connectivity of the three groups. This is a preprint that has not been peer-reviewed.'],
    'The field is young: these studies are small or based on self-reports. The 33 protocols are the author’s own practice built on these ideas, not a tested treatment.'),
  'poll.html': ('What large surveys show', [
    '17% of US adults said AI will have a positive effect on the country over the next 20 years; among AI experts the figure was 56%.',
    '51% of adults were more concerned than excited about the growing use of AI; among experts, 15%. The surveys covered 5,410 US adults (August 2024) and 1,013 AI experts (August–October 2024).'],
    'Our poll is different: anyone can vote, so it is not a representative sample. It shows the mood of this site’s visitors.'),
 },
 'ru': {
  'protocols.html': ('Что говорят исследования', [
    '«Когнитивная разгрузка» — научный термин: человек передаёт умственную задачу чему-то вне головы — заметке, поисковику, ИИ-ассистенту.',
    'Когда люди рассчитывают позже найти информацию, они лучше запоминают, где её искать, чем саму информацию.',
    'В опросе 319 работников умственного труда большее доверие к генеративному ИИ сочеталось с меньшим критическим мышлением, а большая уверенность в себе — с большим.',
    'В исследовании с участием 666 человек частое использование ИИ-инструментов было связано с более низкими показателями критического мышления. Это корреляция: она не доказывает, что причина в ИИ.',
    'В эксперименте с 54 участниками, писавшими эссе, у группы с ИИ-ассистентом связность мозговой активности была самой слабой из трёх групп. Это препринт, он не прошёл рецензирование.'],
    'Область молодая: эти исследования небольшие или основаны на самоотчётах. 33 протокола — авторская практика, построенная на этих идеях, а не проверенное лечение.'),
  'poll.html': ('Что показывают большие опросы', [
    '17% взрослых жителей США сказали, что ИИ положительно повлияет на страну в ближайшие 20 лет; среди экспертов по ИИ — 56%.',
    '51% взрослых испытывают по поводу распространения ИИ больше беспокойства, чем воодушевления; среди экспертов — 15%. Опрошены 5410 взрослых жителей США (август 2024) и 1013 экспертов по ИИ (август–октябрь 2024).'],
    'Наш опрос устроен иначе: голосовать может любой, поэтому это не репрезентативная выборка. Он показывает настроение посетителей этого сайта.'),
 },
 'es': {
  'protocols.html': ('Qué dice la investigación', [
    'La «descarga cognitiva» es el término científico para delegar una tarea mental en algo externo: una nota, un buscador, un asistente de IA.',
    'Cuando las personas esperan poder consultar la información más tarde, recuerdan mejor dónde encontrarla que la información en sí.',
    'En una encuesta a 319 trabajadores del conocimiento, más confianza en la IA generativa se asoció con menos pensamiento crítico, y más confianza en uno mismo con más.',
    'En un estudio con 666 personas, el uso frecuente de herramientas de IA se asoció con puntuaciones más bajas de pensamiento crítico. Es una correlación: no demuestra que la IA sea la causa.',
    'En un experimento con 54 participantes que escribían ensayos, el grupo que usó un asistente de IA mostró la conectividad cerebral más débil de los tres grupos. Es un preprint que no ha pasado revisión por pares.'],
    'El campo es joven: estos estudios son pequeños o se basan en autoinformes. Los 33 protocolos son la práctica propia del autor construida sobre estas ideas, no un tratamiento probado.'),
  'poll.html': ('Qué muestran las grandes encuestas', [
    'El 17 % de los adultos de EE. UU. dijo que la IA tendrá un efecto positivo en el país en los próximos 20 años; entre los expertos en IA, el 56 %.',
    'El 51 % de los adultos siente más preocupación que entusiasmo por el uso creciente de la IA; entre los expertos, el 15 %. Se encuestó a 5.410 adultos de EE. UU. (agosto de 2024) y a 1.013 expertos en IA (agosto–octubre de 2024).'],
    'Nuestra encuesta es distinta: puede votar cualquiera, así que no es una muestra representativa. Muestra el ánimo de quienes visitan este sitio.'),
 },
 'de': {
  'protocols.html': ('Was die Forschung sagt', [
    '„Kognitives Offloading“ ist der Fachbegriff dafür, eine Denkaufgabe an etwas außerhalb des Kopfes abzugeben: eine Notiz, eine Suchmaschine, einen KI-Assistenten.',
    'Wenn Menschen erwarten, eine Information später nachschlagen zu können, merken sie sich besser, wo sie zu finden ist, als die Information selbst.',
    'In einer Befragung von 319 Wissensarbeitern ging mehr Vertrauen in generative KI mit weniger kritischem Denken einher, mehr Selbstvertrauen dagegen mit mehr.',
    'In einer Studie mit 666 Personen hing häufige Nutzung von KI-Werkzeugen mit niedrigeren Werten im kritischen Denken zusammen. Das ist eine Korrelation: Sie beweist nicht, dass KI die Ursache ist.',
    'In einem Experiment mit 54 Teilnehmenden, die Essays schrieben, zeigte die Gruppe mit KI-Assistent die schwächste Hirnkonnektivität der drei Gruppen. Es handelt sich um einen Preprint ohne Peer-Review.'],
    'Das Forschungsfeld ist jung: Diese Studien sind klein oder beruhen auf Selbstauskünften. Die 33 Protokolle sind die eigene Praxis des Autors auf Basis dieser Ideen, keine geprüfte Behandlung.'),
  'poll.html': ('Was große Umfragen zeigen', [
    '17 % der Erwachsenen in den USA sagten, KI werde sich in den nächsten 20 Jahren positiv auf das Land auswirken; unter KI-Fachleuten waren es 56 %.',
    '51 % der Erwachsenen sind über die zunehmende Nutzung von KI eher besorgt als begeistert; unter Fachleuten 15 %. Befragt wurden 5.410 Erwachsene in den USA (August 2024) und 1.013 KI-Fachleute (August–Oktober 2024).'],
    'Unsere Umfrage ist anders: Jeder kann abstimmen, sie ist also keine repräsentative Stichprobe. Sie zeigt die Stimmung der Besucher dieser Website.'),
 },
 'fr': {
  'protocols.html': ('Ce que dit la recherche', [
    'Le « délestage cognitif » est le terme scientifique qui désigne le fait de confier une tâche mentale à un support extérieur : une note, un moteur de recherche, un assistant IA.',
    'Quand on s’attend à pouvoir retrouver une information plus tard, on retient mieux l’endroit où la trouver que l’information elle-même.',
    'Dans une enquête auprès de 319 travailleurs du savoir, une plus grande confiance dans l’IA générative allait de pair avec moins d’esprit critique, et une plus grande confiance en soi avec davantage.',
    'Dans une étude portant sur 666 personnes, l’usage fréquent d’outils d’IA était associé à des scores d’esprit critique plus faibles. C’est une corrélation : elle ne prouve pas que l’IA en soit la cause.',
    'Dans une expérience où 54 participants rédigeaient des essais, le groupe utilisant un assistant IA présentait la connectivité cérébrale la plus faible des trois groupes. Il s’agit d’une prépublication non évaluée par les pairs.'],
    'Le domaine est jeune : ces études sont de petite taille ou reposent sur des auto-déclarations. Les 33 protocoles sont la pratique personnelle de l’auteur, construite sur ces idées, et non un traitement validé.'),
  'poll.html': ('Ce que montrent les grandes enquêtes', [
    '17 % des adultes américains estiment que l’IA aura un effet positif sur le pays dans les 20 prochaines années ; parmi les experts en IA, 56 %.',
    '51 % des adultes se disent plus inquiets qu’enthousiastes face à l’usage croissant de l’IA ; parmi les experts, 15 %. Les enquêtes ont porté sur 5 410 adultes américains (août 2024) et 1 013 experts en IA (août–octobre 2024).'],
    'Notre sondage est différent : tout le monde peut voter, ce n’est donc pas un échantillon représentatif. Il montre l’état d’esprit des visiteurs de ce site.'),
 },
 'ja': {
  'protocols.html': ('研究でわかっていること', [
    '「認知的オフロード」とは、頭の中で行う作業をメモ、検索エンジン、AIアシスタントなど外部のものに任せることを指す研究用語です。',
    '後で調べられると思っていると、人は情報そのものよりも「どこで見つかるか」をよく覚えます。',
    '知識労働者319人への調査では、生成AIへの信頼が高いほど批判的思考が少なく、自分自身への自信が高いほど批判的思考が多いという関連が見られました。',
    '666人を対象とした研究では、AIツールを頻繁に使うことと批判的思考のスコアの低さに関連が見られました。これは相関であり、AIが原因だと証明するものではありません。',
    '54人がエッセイを書く実験では、AIアシスタントを使ったグループの脳の結合性が3グループの中で最も弱いという結果でした。これは査読前のプレプリントです。'],
    'この分野はまだ新しく、これらの研究は小規模か自己申告に基づいています。33のプロトコルはこうした考え方をもとにした著者自身の実践であり、検証済みの治療法ではありません。'),
  'poll.html': ('大規模調査が示すこと', [
    '米国の成人の17%が、今後20年間でAIは国に良い影響を与えると答えました。AIの専門家では56%でした。',
    'AIの利用拡大について、成人の51%が期待より懸念のほうが大きいと答え、専門家では15%でした。調査対象は米国の成人5,410人（2024年8月）とAI専門家1,013人（2024年8月〜10月）です。'],
    '当サイトの投票はこれとは異なり、誰でも投票できるため代表性のある標本ではありません。このサイトの訪問者の気持ちを示すものです。'),
 },
 'vi': {
  'protocols.html': ('Nghiên cứu nói gì', [
    '“Giảm tải nhận thức” là thuật ngữ khoa học chỉ việc giao một nhiệm vụ trí óc cho thứ gì đó bên ngoài bộ não: một ghi chú, công cụ tìm kiếm, trợ lý AI.',
    'Khi biết rằng sau này có thể tra lại thông tin, con người nhớ nơi tìm thông tin tốt hơn là nhớ chính thông tin đó.',
    'Trong một khảo sát với 319 người lao động tri thức, càng tin tưởng AI tạo sinh thì tư duy phản biện càng ít, còn càng tự tin vào bản thân thì tư duy phản biện càng nhiều.',
    'Trong một nghiên cứu với 666 người, việc dùng công cụ AI thường xuyên có liên quan đến điểm tư duy phản biện thấp hơn. Đây là mối tương quan: nó không chứng minh AI là nguyên nhân.',
    'Trong một thí nghiệm với 54 người viết bài luận, nhóm dùng trợ lý AI có mức kết nối não yếu nhất trong ba nhóm. Đây là bản thảo chưa qua bình duyệt.'],
    'Lĩnh vực này còn mới: các nghiên cứu trên có quy mô nhỏ hoặc dựa trên tự báo cáo. 33 giao thức là thực hành riêng của tác giả dựa trên những ý tưởng này, không phải phương pháp điều trị đã được kiểm chứng.'),
  'poll.html': ('Các khảo sát lớn cho thấy gì', [
    '17% người trưởng thành ở Mỹ cho rằng AI sẽ tác động tích cực đến đất nước trong 20 năm tới; trong giới chuyên gia AI, con số này là 56%.',
    '51% người trưởng thành lo ngại nhiều hơn là hào hứng trước việc AI được dùng ngày càng nhiều; ở chuyên gia là 15%. Khảo sát gồm 5.410 người trưởng thành ở Mỹ (tháng 8/2024) và 1.013 chuyên gia AI (tháng 8–10/2024).'],
    'Cuộc thăm dò của chúng tôi thì khác: ai cũng có thể bỏ phiếu nên đây không phải mẫu đại diện. Nó cho thấy tâm trạng của những người ghé thăm trang này.'),
 },
 'th': {
  'protocols.html': ('งานวิจัยบอกอะไร', [
    '“การผ่องถ่ายภาระทางความคิด” (cognitive offloading) เป็นคำทางวิชาการ หมายถึงการส่งงานทางความคิดให้สิ่งที่อยู่นอกสมอง เช่น บันทึก เครื่องมือค้นหา หรือผู้ช่วย AI',
    'เมื่อคนคาดว่าจะค้นข้อมูลได้ในภายหลัง พวกเขาจะจำได้ว่าหาข้อมูลได้ที่ไหน ดีกว่าจำตัวข้อมูลเอง',
    'ในการสำรวจคนทำงานด้านความรู้ 319 คน ความเชื่อมั่นใน AI เชิงสร้างสรรค์ที่สูงกว่าสัมพันธ์กับการคิดเชิงวิพากษ์ที่น้อยลง ส่วนความมั่นใจในตนเองที่สูงกว่าสัมพันธ์กับการคิดเชิงวิพากษ์ที่มากขึ้น',
    'ในการศึกษากับผู้เข้าร่วม 666 คน การใช้เครื่องมือ AI บ่อยสัมพันธ์กับคะแนนการคิดเชิงวิพากษ์ที่ต่ำกว่า นี่เป็นความสัมพันธ์ ไม่ได้พิสูจน์ว่า AI เป็นสาเหตุ',
    'ในการทดลองกับผู้เข้าร่วม 54 คนที่เขียนเรียงความ กลุ่มที่ใช้ผู้ช่วย AI มีการเชื่อมต่อของสมองอ่อนที่สุดในสามกลุ่ม งานนี้เป็นฉบับก่อนตีพิมพ์ที่ยังไม่ผ่านการประเมินโดยผู้ทรงคุณวุฒิ'],
    'สาขานี้ยังใหม่ งานวิจัยเหล่านี้มีขนาดเล็กหรืออาศัยการรายงานตนเอง โปรโตคอล 33 ข้อเป็นแนวปฏิบัติของผู้เขียนเองที่สร้างจากแนวคิดเหล่านี้ ไม่ใช่วิธีรักษาที่ผ่านการทดสอบแล้ว'),
  'poll.html': ('ผลสำรวจขนาดใหญ่บอกอะไร', [
    'ผู้ใหญ่ในสหรัฐฯ 17% กล่าวว่า AI จะส่งผลดีต่อประเทศในอีก 20 ปีข้างหน้า ส่วนในกลุ่มผู้เชี่ยวชาญด้าน AI ตัวเลขคือ 56%',
    'ผู้ใหญ่ 51% รู้สึกกังวลมากกว่าตื่นเต้นกับการใช้ AI ที่เพิ่มขึ้น ส่วนผู้เชี่ยวชาญคือ 15% การสำรวจครอบคลุมผู้ใหญ่ในสหรัฐฯ 5,410 คน (สิงหาคม 2024) และผู้เชี่ยวชาญด้าน AI 1,013 คน (สิงหาคม–ตุลาคม 2024)'],
    'โพลของเราต่างออกไป ใครก็โหวตได้ จึงไม่ใช่กลุ่มตัวอย่างที่เป็นตัวแทน ผลนี้แสดงความรู้สึกของผู้เข้าชมเว็บไซต์นี้'),
 },
 'pt': {
  'protocols.html': ('O que diz a pesquisa', [
    '“Descarga cognitiva” é o termo científico para entregar uma tarefa mental a algo fora da cabeça: uma anotação, um buscador, um assistente de IA.',
    'Quando as pessoas esperam poder consultar a informação mais tarde, lembram melhor onde encontrá-la do que a informação em si.',
    'Numa pesquisa com 319 trabalhadores do conhecimento, mais confiança na IA generativa esteve associada a menos pensamento crítico, e mais confiança em si mesmo a mais.',
    'Num estudo com 666 pessoas, o uso frequente de ferramentas de IA esteve associado a pontuações mais baixas de pensamento crítico. É uma correlação: não prova que a IA seja a causa.',
    'Num experimento com 54 participantes escrevendo redações, o grupo que usou um assistente de IA mostrou a conectividade cerebral mais fraca dos três grupos. É um preprint que não passou por revisão por pares.'],
    'A área é nova: esses estudos são pequenos ou baseados em autorrelato. Os 33 protocolos são a prática do próprio autor construída sobre essas ideias, não um tratamento testado.'),
  'poll.html': ('O que mostram as grandes pesquisas', [
    '17% dos adultos dos EUA disseram que a IA terá um efeito positivo no país nos próximos 20 anos; entre especialistas em IA, 56%.',
    '51% dos adultos estão mais preocupados do que animados com o uso crescente da IA; entre especialistas, 15%. Foram ouvidos 5.410 adultos dos EUA (agosto de 2024) e 1.013 especialistas em IA (agosto–outubro de 2024).'],
    'Nossa enquete é diferente: qualquer pessoa pode votar, então não é uma amostra representativa. Ela mostra o ânimo de quem visita este site.'),
 },
 'ko': {
  'protocols.html': ('연구가 말하는 것', [
    '‘인지적 오프로딩’은 머릿속에서 할 일을 메모, 검색 엔진, AI 어시스턴트 같은 외부 수단에 맡기는 것을 가리키는 연구 용어입니다.',
    '나중에 찾아볼 수 있다고 기대하면, 사람들은 정보 자체보다 그 정보를 어디서 찾을 수 있는지를 더 잘 기억합니다.',
    '지식 노동자 319명을 대상으로 한 설문에서, 생성형 AI에 대한 신뢰가 높을수록 비판적 사고가 적었고 자기 자신에 대한 확신이 높을수록 비판적 사고가 많았습니다.',
    '666명을 대상으로 한 연구에서, AI 도구를 자주 사용하는 것은 낮은 비판적 사고 점수와 관련이 있었습니다. 이는 상관관계이며 AI가 원인이라는 증거는 아닙니다.',
    '54명이 에세이를 쓴 실험에서, AI 어시스턴트를 사용한 그룹의 뇌 연결성이 세 그룹 중 가장 약했습니다. 이 연구는 동료 심사를 거치지 않은 프리프린트입니다.'],
    '이 분야는 아직 초기 단계이며, 이 연구들은 규모가 작거나 자기 보고에 기반합니다. 33개 프로토콜은 이러한 생각을 바탕으로 한 저자 자신의 실천법이며 검증된 치료법이 아닙니다.'),
  'poll.html': ('대규모 설문조사가 보여 주는 것', [
    '미국 성인의 17%가 앞으로 20년 동안 AI가 나라에 긍정적인 영향을 줄 것이라고 답했습니다. AI 전문가 중에서는 56%였습니다.',
    '성인의 51%는 AI 사용 확대에 대해 기대보다 우려가 더 크다고 답했고, 전문가 중에서는 15%였습니다. 조사 대상은 미국 성인 5,410명(2024년 8월)과 AI 전문가 1,013명(2024년 8월~10월)입니다.'],
    '이 사이트의 투표는 다릅니다. 누구나 투표할 수 있으므로 대표성 있는 표본이 아닙니다. 이 사이트 방문자들의 분위기를 보여 줍니다.'),
 },
 'it': {
  'protocols.html': ('Cosa dice la ricerca', [
    '“Scarico cognitivo” (cognitive offloading) è il termine scientifico per indicare l’affidare un compito mentale a qualcosa di esterno: un appunto, un motore di ricerca, un assistente IA.',
    'Quando le persone si aspettano di poter ritrovare un’informazione più tardi, ricordano meglio dove trovarla che l’informazione stessa.',
    'In un’indagine su 319 lavoratori della conoscenza, una maggiore fiducia nell’IA generativa si associava a meno pensiero critico, e una maggiore fiducia in sé stessi a più pensiero critico.',
    'In uno studio su 666 persone, l’uso frequente di strumenti di IA era associato a punteggi più bassi di pensiero critico. È una correlazione: non dimostra che la causa sia l’IA.',
    'In un esperimento con 54 partecipanti impegnati a scrivere saggi, il gruppo che usava un assistente IA mostrava la connettività cerebrale più debole dei tre gruppi. È un preprint non sottoposto a revisione paritaria.'],
    'Il campo è giovane: questi studi sono piccoli o basati su autovalutazioni. I 33 protocolli sono la pratica personale dell’autore costruita su queste idee, non un trattamento verificato.'),
  'poll.html': ('Cosa mostrano i grandi sondaggi', [
    'Il 17% degli adulti statunitensi ha detto che l’IA avrà un effetto positivo sul Paese nei prossimi 20 anni; tra gli esperti di IA, il 56%.',
    'Il 51% degli adulti è più preoccupato che entusiasta per l’uso crescente dell’IA; tra gli esperti, il 15%. Sono stati intervistati 5.410 adulti statunitensi (agosto 2024) e 1.013 esperti di IA (agosto–ottobre 2024).'],
    'Il nostro sondaggio è diverso: può votare chiunque, quindi non è un campione rappresentativo. Mostra l’umore di chi visita questo sito.'),
 },
 'hi': {
  'protocols.html': ('शोध क्या कहता है', [
    '“कॉग्निटिव ऑफ़लोडिंग” शोध का शब्द है: इसका मतलब है कोई मानसिक काम दिमाग़ के बाहर की किसी चीज़ को सौंप देना — नोट, सर्च इंजन या AI असिस्टेंट।',
    'जब लोगों को उम्मीद होती है कि जानकारी बाद में खोजी जा सकती है, तो वे जानकारी से ज़्यादा यह याद रखते हैं कि वह कहाँ मिलेगी।',
    '319 नॉलेज वर्कर्स के एक सर्वे में, जनरेटिव AI पर ज़्यादा भरोसा कम आलोचनात्मक सोच से जुड़ा था, और ख़ुद पर ज़्यादा भरोसा ज़्यादा आलोचनात्मक सोच से।',
    '666 लोगों के एक अध्ययन में, AI टूल का बार-बार इस्तेमाल आलोचनात्मक सोच के कम अंकों से जुड़ा पाया गया। यह सह-संबंध है: इससे यह साबित नहीं होता कि कारण AI है।',
    'निबंध लिखने वाले 54 प्रतिभागियों के एक प्रयोग में, AI असिस्टेंट इस्तेमाल करने वाले समूह की मस्तिष्क कनेक्टिविटी तीनों समूहों में सबसे कमज़ोर थी। यह एक प्रीप्रिंट है जिसकी पीयर रिव्यू नहीं हुई है।'],
    'यह क्षेत्र नया है: ये अध्ययन छोटे हैं या आत्म-रिपोर्ट पर आधारित हैं। 33 प्रोटोकॉल इन विचारों पर बना लेखक का अपना अभ्यास है, कोई परखा हुआ इलाज नहीं।'),
  'poll.html': ('बड़े सर्वे क्या दिखाते हैं', [
    'अमेरिका के 17% वयस्कों ने कहा कि अगले 20 वर्षों में AI का देश पर सकारात्मक असर होगा; AI विशेषज्ञों में यह आँकड़ा 56% था।',
    '51% वयस्क AI के बढ़ते इस्तेमाल को लेकर उत्साह से ज़्यादा चिंता महसूस करते हैं; विशेषज्ञों में 15%। सर्वे में 5,410 अमेरिकी वयस्क (अगस्त 2024) और 1,013 AI विशेषज्ञ (अगस्त–अक्टूबर 2024) शामिल थे।'],
    'हमारा पोल अलग है: कोई भी वोट दे सकता है, इसलिए यह प्रतिनिधि नमूना नहीं है। यह इस साइट पर आने वालों का रुझान दिखाता है।'),
 },
}


def block(lang, page):
    """HTML of the block for this page, or '' when the page has none."""
    if page not in ORDER:
        return ''
    h, items, note = N[lang][page]
    keys = ORDER[page]
    assert len(items) == len(keys), (lang, page)
    lis = []
    for k, (txt, key) in enumerate(zip(items, keys)):
        last_of_source = k == len(keys) - 1 or keys[k + 1] != key      # one link per source
        name, href = SRC[key]
        link = f' <a href="{href}" target="_blank" rel="noopener">{name.replace("&", "&amp;")}</a>' if last_of_source else ''
        lis.append(f'      <li>{txt}{link}</li>')
    return ('<section class="info-box research-notes" id="research-section">\n'
            f'    <h2>{h}</h2>\n    <ul>\n' + '\n'.join(lis) + '\n    </ul>\n'
            f'    <p class="research-note">{note}</p>\n  </section>')
