# Housing news feeds — probe of 2026-10-06

Candidates for the `vivienda` topic of `lib/news-sources.mjs`, found and fetched on 2026-10-06 with
the registry's own `FEED_HEADERS`. Every feed listed under "Verified" answered HTTP 200, parsed as
RSS or Atom, carried at least five items and had published within the previous 30 days. The ones
marked **in registry** were added; the rest qualified and were left out, for the reason given, so a
later pass can start here instead of probing again.

## Verified

### Public broadcasters

| Feed | URL | Lang | Note |
|---|---|---|---|
| RTVE · Vivienda | https://www.rtve.es/rss/vivienda/1189.rss | es | **in registry** |
| 3Cat · Habitatge | https://api.3cat.cat/noticies?_format=rss&id=22310&origen=colleccio&items_pagina=31&sdom=img&version=2.0&cache=90&https=true&master=yes&perfils_extra=imatges_3catinfo | ca | **in registry** |
| Betevé · Habitatge | https://beteve.cat/economia/habitatge/feed/ | ca | Barcelona municipal broadcaster; city-level |

### National press

| Feed | URL | Lang | Note |
|---|---|---|---|
| El País · Vivienda | https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/economia/subsection/vivienda | es | **in registry**; tag feed `…/tag/vivienda_a` also works |
| El Mundo · Vivienda | https://www.elmundo.es/rss/economia/vivienda.xml | es | **in registry** |
| elDiario.es · Vivienda | https://www.eldiario.es/rss/focos/vivienda/ | es | **in registry**; dates wrapped in CDATA |
| El Español · Vivienda | https://www.elespanol.com/rss/invertia/observatorios/vivienda/ | es | **in registry**; dates wrapped in CDATA |
| 20minutos · Vivienda | https://www.20minutos.es/rss/vivienda/ | es | **in registry** |
| The Objective · Vivienda | https://theobjective.com/etiqueta/vivienda/feed/ | es | **in registry**; some tag noise |
| Europa Press · Vivienda | https://www.europapress.es/rss/rss.aspx?ch=00342 | es | **in registry**; wire agency, 10 items per fetch |
| Newtral · Vivienda | https://www.newtral.es/tag/vivienda/feed/ | es | **in registry**; fact-checks around the protests |
| El Confidencial · Vivienda | https://rss.elconfidencial.com/vivienda/ | es | Atom; mostly consumer and home-buying stories |
| El Confidencial · Inmobiliario | https://rss.elconfidencial.com/inmobiliario/ | es | Atom; five items only |
| El Periódico · Vivienda | https://www.elperiodico.com/es/rss/vivienda/rss.xml | es | Policy plus personal finance |
| Cinco Días · Vivienda | https://feeds.elpais.com/mrss-s/list/ep/site/cincodias.elpais.com/tag/vivienda_a | es | Business angle |
| Expansión · Inmobiliario | https://www.expansion.com/rss/googlenews/inmobiliario/mercado.xml | es | Business angle; its "Vivienda" feed is co-branded property listings |
| El Debate · Vivienda | https://www.eldebate.com/rss/economia/vivienda.xml | es | Mostly consumer and legal how-to |
| OKDiario · Vivienda | https://okdiario.com/economia/vivienda/feed | es | Headlines carry the outlet's political framing |
| El Independiente · Vivienda | https://www.elindependiente.com/economia/vivienda/feed/ | es | Slow: eight items in 30 days |
| Economía Digital · Vivienda | https://www.economiadigital.es/temas/vivienda/feed | es | Business outlet |
| Crónica Global · Vivienda | https://cronicaglobal.elespanol.com/rss/temas/vivienda/ | es | Barcelona; mixes in lifestyle pieces |
| La Gaceta · Vivienda | https://gaceta.es/tag/vivienda/feed/ | es | Headlines carry the outlet's political framing |
| infoLibre · Vivienda | https://www.infolibre.es/rss/category/tag/1000293/ | es | Includes opinion pieces |
| La Marea · Vivienda | https://www.lamarea.com/tags/vivienda/feed/ | es | Tags live under `/tags/`, not `/tag/` |
| Pikara Magazine · Vivienda | https://www.pikaramagazine.com/tag/vivienda/feed/ | es | Its general feed is already in the registry under LGTBI |
| Maldita.es · Vivienda | https://maldita.es/tag/vivienda/feed | es | Fact-checker; three items in 30 days |

### Catalan-language press

| Feed | URL | Lang | Note |
|---|---|---|---|
| Ara · Habitatge | https://www.ara.cat/rss/category/section/1042360/ | ca | **in registry**; dates wrapped in CDATA |
| VilaWeb · Habitatge | https://www.vilaweb.cat/etiqueta/habitatge/feed/ | ca | **in registry** |
| El Periódico · Habitatge | https://www.elperiodico.cat/rss/habitatge/rss.xml | ca | Slow: five items in 30 days |
| Directa · Habitatge | https://directa.cat/categories/habitatge/feed/ | ca | Cooperative outlet; strong protest coverage |
| Regió7 · Habitatge | https://www.regio7.cat/rss/tag/1530388/ | ca | Regional (Catalunya central) |

### Regional press

These mostly repeat their group's national copy, so the registry carries none yet. Vocento titles
share the pattern `https://www.<domain>/rss/2.0/?section=/economia/vivienda` (verified for
lasprovincias.es, diariosur.es, elcorreo.com, diariovasco.com, ideal.es, laverdad.es,
elcomercio.es, hoy.es, larioja.com, eldiariomontanes.es and elnortedecastilla.es); El Norte de
Castilla's rent subsection `?section=/vivienda/alquilar` is the most local of them. Prensa Ibérica
titles use topic tags, `https://<domain>/rss/tag/<id>/`: levante-emv.com 1166485,
diariodemallorca.es 1135898, laprovincia.es 1324882, farodevigo.es 1324880, lne.es 1176377,
informacion.es 1148613, elperiodicomediterraneo.com 1383840, laopinioncoruna.es 1239928,
laopiniondemalaga.es 1267724, laopiniondemurcia.es 1301116, laopiniondezamora.es 1123326,
elperiodicodearagon.com 1570096, elperiodicoextremadura.com 1383846 and diaridegirona.cat 1522307.
Grupo Noticias: deia.eus 1025338, noticiasdenavarra.com 1036178, noticiasdegipuzkoa.eus 1019606.

### Organisations

| Feed | URL | Lang | Note |
|---|---|---|---|
| Sindicat de Llogateres | https://sindicatdellogateres.org/es/feed/ | es | **in registry**; Catalan twin at `/feed/` |
| PAH | https://afectadosporlahipoteca.com/feed/ | es | **in registry** |
| PAH Barcelona | https://pahbarcelona.org/ca/feed/ | ca | Overlaps the national PAH; some posts are not about housing |
| Sindicato de Inquilinas de Málaga | https://inquilinatomalaga.org/feed/ | es | Local; acampada and march notices |
| Sindicato de Inquilinas de Zaragoza | https://sindicatoinquilinoszgz.wordpress.com/feed/ | es | Near-dormant: one post in 30 days, the rest from 2023 |
| Hàbitat3 | https://www.habitat3.cat/feed/ | ca | Social-housing federation; mostly its own news |
| COHABITAC | https://www.cohabitac.cat/feed/ | ca | One post in 30 days |
| Sostre Cívic | https://sostrecivic.coop/feed/ | ca | Housing cooperative |
| La Dinamo Fundació | https://ladinamofundacio.org/feed/ | ca | Cooperative housing and community land trusts |
| Observatori Metropolità de l'Habitatge de Barcelona | https://www.ohb.cat/feed/ | ca | Public observatory, not an NGO; one post in 30 days |

## Not usable on 2026-10-06

- **ABC**: `/rss/2.0/economia/inmobiliario/` newest item 15 June 2026; its vivienda feeds return no items.
- **La Vanguardia**: no housing feed in its RSS index; guessed housing URLs return 403.
- **Público**: no RSS feed at all; every URL returns 404.
- **CTXT**: its only feed is general, and it answers 403 behind a bot check.
- **La Razón**: feeds return 503; no housing section feed.
- **Blocked (403)**: El Economista, Vozpópuli, Cadena SER, Telecinco/Nius, EFE.
- **RTVE legacy** `rss/temas_vivienda.xml`: newest item June 2022, replaced by the 1189 feed.
- **Sindicato de Inquilinas de Madrid** `inquilinato.org/feed/`: newest post 28 July 2026.
- **Other tenants' unions**: Sevilla (no feed), Vigo (newest June 2026), València and Poder Inquilino (empty), Cádiz and Mallorca (404).
- **Commercial or off-topic**: property portals (idealista, fotocasa) by rule; Expansión's co-branded listings; Libertad Digital's sponsored investment feed; Periodista Digital; Levante-EMV's sponsored "Vivienda en València".
- **Catalan feeds that ignore the topic**: El Punt Avui and Nació Digital serve general news under a housing URL.
- **English**: nothing Spain-specific about housing was found.
