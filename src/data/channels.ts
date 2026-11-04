import type { Channel } from './types'

export const channels: Channel[] = [
  // ──────────────────────────── PRINCIPALES ────────────────────────────
  {
    id: 'la1',
    name: 'La 1',
    logo: '/logos/la1.svg',
    category: 'principales',
    epgId: 'La1.TV',
    web: 'https://www.rtve.es/play/videos/directo/la-1/',
    sources: [
      { type: 'hls', url: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8' },
      { type: 'hls', url: 'https://dghxc56urunop.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-zabn6k211oedh/La1ES.m3u8' },
      { type: 'iframe', url: 'https://www.rtve.es/play/videos/directo/la-1/' },
    ],
  },
  {
    id: 'la2',
    name: 'La 2',
    logo: '/logos/la2.svg',
    category: 'principales',
    epgId: 'La2.TV',
    web: 'https://www.rtve.es/play/videos/directo/la-2/',
    sources: [
      { type: 'hls', url: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main_dvr.m3u8' },
      { type: 'hls', url: 'https://d1yebix5w29z3v.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-haqfba85d1gvv/La2ES.m3u8' },
      { type: 'iframe', url: 'https://www.rtve.es/play/videos/directo/la-2/' },
    ],
  },
  {
    id: 'antena3',
    name: 'Antena 3',
    logo: '/logos/antena3.png',
    category: 'principales',
    epgId: 'Antena3.TV',
    web: 'https://www.atresplayer.com/directos/antena3/',
    sources: [
      { type: 'atres', url: 'antena3' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/antena3/' },
    ],
  },
  {
    id: 'lasexta',
    name: 'La Sexta',
    logo: '/logos/lasexta.png',
    category: 'principales',
    epgId: 'LaSexta.TV',
    web: 'https://www.atresplayer.com/directos/lasexta/',
    sources: [
      { type: 'atres', url: 'lasexta' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/lasexta/' },
    ],
  },
  {
    id: 'cuatro',
    name: 'Cuatro',
    logo: '/logos/cuatro.png',
    category: 'principales',
    epgId: 'Cuatro.TV',
    web: 'https://www.mitele.es/directo/cuatro',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/cuatro' },
    ],
  },
  {
    id: 'telecinco',
    name: 'Telecinco',
    logo: '/logos/telecinco.png',
    category: 'principales',
    epgId: 'Telecinco.TV',
    web: 'https://www.mitele.es/directo/telecinco',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/telecinco' },
    ],
  },

  // ──────────────────────────── INFORMATIVOS ────────────────────────────
  {
    id: '24h',
    name: '24 Horas',
    logo: '/logos/24h.png',
    category: 'informativos',
    epgId: '24Horas.TV',
    web: 'https://www.rtve.es/play/videos/directo/24h/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/1694255.m3u8' },
      { type: 'hls', url: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main_dvr.m3u8' },
      { type: 'hls', url: 'https://dpcj1q84r586o.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-zkqd2yaveiqbt/24HES.m3u8' },
    ],
  },
  {
    id: 'euronews',
    name: 'Euronews',
    logo: '/logos/euronews.jpg',
    category: 'informativos',
    epgId: 'Euronews.TV',
    web: 'https://es.euronews.com/live',
    sources: [
      { type: 'hls', url: 'https://euronews-live-spa-es.fast.rakuten.tv/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6571/bitok/eyJzdGlkIjoiMDA0YjY0NTMtYjY2MC00ZTZkLTlkNzEtMTk3YTM3ZDZhZWIxIiwibWt0IjoiZXMiLCJjaCI6NjU3MSwicHRmIjoxfQ==/26034/euronews-es.m3u8' },
      { type: 'youtube', url: 'https://www.youtube.com/channel/UCyoGb3SMlTlB8CLGVH4c8Rw/live' },
    ],
  },
  {
    id: '3catinfo',
    name: '3Cat Info',
    logo: '/logos/3catinfo.jpg',
    category: 'informativos',
    epgId: '324.TV',
    web: 'https://www.3cat.cat/3cat/directes/3catinfo-tv/',
    sources: [
      { type: 'hls', url: 'https://directes-tv-int.3catdirectes.cat/live-content/canal324-hls/master.m3u8' },
    ],
  },
  {
    id: 'elpais',
    name: 'El País',
    logo: '/logos/elpais.jpg',
    category: 'informativos',
    epgId: 'ElPais.TV',
    web: 'https://elpais.com',
    sources: [
      { type: 'hls', url: 'https://d2epgk1fomaa1g.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-9n8y4tw0bk3an/live/fast-channel-el-pais/fast-channel-el-pais.m3u8' },
      { type: 'youtube', url: 'https://www.youtube.com/channel/UCnsvJeZO4RigQ898WdDNoBw/live' },
    ],
  },
  {
    id: 'elconfidencial',
    name: 'El Confidencial',
    logo: '/logos/elconfidencial.jpg',
    category: 'informativos',
    epgId: 'ElConfidencial.TV',
    web: 'https://www.elconfidencial.com/television/',
    sources: [
      { type: 'hls', url: 'https://dgrfwaj8stp69.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-hmbd9k13g6zsa/live/fast-channel-elconfidencial/fast-channel-elconfidencial.m3u8' },
    ],
  },
  {
    id: 'negociostv',
    name: 'Negocios TV',
    logo: '/logos/negociostv.png',
    category: 'informativos',
    web: 'https://www.negocios.com/directo',
    sources: [
      { type: 'hls', url: 'https://streaming013.gestec-video.com/hls/negociostv.m3u8' },
      { type: 'youtube', url: 'https://www.youtube.com/channel/UCwd8Byi93KbnsYmCcKLExvQ/live' },
    ],
  },

  // ──────────────────────────── DEPORTES ────────────────────────────
  {
    id: 'teledeporte',
    name: 'Teledeporte',
    logo: '/logos/teledeporte.png',
    category: 'deportes',
    epgId: 'TDP.TV',
    web: 'https://www.rtve.es/play/videos/directo/tdp/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/1712295.m3u8' },
      { type: 'hls', url: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8' },
      { type: 'hls', url: 'https://d3fmp7j43g13qo.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-sxmelty1ewzcw/TeledeporteES.m3u8' },
    ],
  },
  {
    id: 'realmadridtv',
    name: 'Real Madrid TV',
    logo: '/logos/realmadridtv.png',
    category: 'deportes',
    epgId: 'RMTV.TV',
    web: 'https://www.realmadrid.com/real-madrid-tv',
    sources: [
      { type: 'hls', url: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8' },
    ],
  },
  {
    id: 'topbarca',
    name: 'Top Barça',
    logo: '/logos/topbarca.jpg',
    category: 'deportes',
    epgId: 'Top_Barça.TV',
    web: 'https://www.rakuten.tv/es/live_channels/top-barca-es',
    sources: [
      { type: 'hls', url: 'https://amg17560-fcb-amg17560c2-samsung-es-9803.playouts.now.amagi.tv/ts-eu-w1-n2/playlist/amg17560-fcbarcelona-topbarcaspanish-samsunges/playlist.m3u8' },
    ],
  },
  {
    id: 'gol',
    name: 'GOL',
    logo: '/logos/gol.png',
    category: 'deportes',
    epgId: 'GOL.TV',
    web: 'https://www.goltelevision.com/en-directo/gol_live',
    sources: [
      { type: 'web', url: 'https://www.goltelevision.com/en-directo/gol_live' },
    ],
  },
  {
    id: 'etbdeportes',
    name: 'ETB Deportes',
    logo: '/logos/etbdeportes.jpg',
    category: 'deportes',
    web: 'https://www.eitb.eus/es/deportes/deporte-en-directo/',
    sources: [
      { type: 'hls', url: 'https://multimedia.eitb.eus/live-content/oka1hd-hls/master.m3u8' },
      { type: 'hls', url: 'https://multimedia.eitb.eus/live-content/oka2hd-hls/master.m3u8' },
    ],
  },

  // ──────────────────────────── TEMÁTICOS ────────────────────────────
  {
    id: 'neox',
    name: 'Neox',
    logo: '/logos/neox.png',
    category: 'tematicos',
    epgId: 'Neox.TV',
    web: 'https://www.atresplayer.com/directos/neox/',
    sources: [
      { type: 'atres', url: 'neox' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/neox/' },
    ],
  },
  {
    id: 'nova',
    name: 'Nova',
    logo: '/logos/nova.png',
    category: 'tematicos',
    epgId: 'Nova.TV',
    web: 'https://www.atresplayer.com/directos/nova/',
    sources: [
      { type: 'atres', url: 'nova' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/nova/' },
    ],
  },
  {
    id: 'mega',
    name: 'Mega',
    logo: '/logos/mega.png',
    category: 'tematicos',
    epgId: 'Mega.TV',
    web: 'https://www.atresplayer.com/directos/mega/',
    sources: [
      { type: 'atres', url: 'mega' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/mega/' },
    ],
  },
  {
    id: 'atreseries',
    name: 'Atreseries',
    logo: '/logos/atreseries.png',
    category: 'tematicos',
    epgId: 'Atreseries.TV',
    web: 'https://www.atresplayer.com/directos/atreseries/',
    sources: [
      { type: 'atres', url: 'atreseries' },
      { type: 'web', url: 'https://www.atresplayer.com/directos/atreseries/' },
    ],
  },
  {
    id: 'fdf',
    name: 'FDF',
    logo: '/logos/fdf.png',
    category: 'tematicos',
    epgId: 'FDF.TV',
    web: 'https://www.mitele.es/directo/fdf',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/fdf' },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    logo: '/logos/energy.png',
    category: 'tematicos',
    epgId: 'Energy.TV',
    web: 'https://www.mitele.es/directo/energy',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/energy' },
    ],
  },
  {
    id: 'divinity',
    name: 'Divinity',
    logo: '/logos/divinity.png',
    category: 'tematicos',
    epgId: 'Divinity.TV',
    web: 'https://www.mitele.es/directo/divinity',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/divinity' },
    ],
  },
  {
    id: 'bemad',
    name: 'Be Mad',
    logo: '/logos/bemad.png',
    category: 'tematicos',
    epgId: 'Bemad.TV',
    web: 'https://www.mitele.es/directo/bemad',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/bemad' },
    ],
  },
  {
    id: 'dmax',
    name: 'DMAX',
    logo: '/logos/dmax.png',
    category: 'tematicos',
    epgId: 'DMax.TV',
    web: 'https://dmax.marca.com/en-directo',
    sources: [
      { type: 'web', url: 'https://dmax.marca.com/en-directo' },
    ],
  },
  {
    id: 'trece',
    name: 'TRECE',
    logo: '/logos/trece.png',
    category: 'tematicos',
    epgId: '13.TV',
    web: 'https://www.cope.es/directos/trece',
    sources: [
      { type: 'hls', url: 'https://play.cdn.enetres.net/091DB7AFBD77442B9BA2F141DCC182F5021/021/playlist.m3u8' },
    ],
  },
  {
    id: 'eltorotv',
    name: 'El Toro TV',
    logo: '/logos/eltorotv.png',
    category: 'tematicos',
    epgId: 'ElToroTV.TV',
    web: 'https://eltorotv.com/tv-en-directo',
    sources: [
      { type: 'hls', url: 'https://streaming-1.eltorotv.com/lb0/eltorotv-streaming-web/index.m3u8' },
      { type: 'hls', url: 'https://edge-nodo-002.streaming.hitcloser.net/eltorotv-streaming-web/index.m3u8' },
    ],
  },
  {
    id: 'larevuelta',
    name: 'La Revuelta',
    logo: '/logos/larevuelta.jpg',
    category: 'tematicos',
    web: 'https://www.rtve.es/play/videos/directo/canales-rtve/play-larevuelta/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/16464388.m3u8' },
    ],
  },
  {
    id: 'somoscine',
    name: 'Somos Cine',
    logo: '/logos/somoscine.jpg',
    category: 'tematicos',
    web: 'https://www.rtve.es/play/videos/directo/canales-rtve/play-cine/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/6909845.m3u8' },
    ],
  },
  {
    id: 'cuentame',
    name: 'Cuéntame',
    logo: '/logos/cuentame.jpg',
    category: 'tematicos',
    web: 'https://www.rtve.es/play/videos/directo/canales-rtve/play-cuentame/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/6909843.m3u8' },
    ],
  },
  {
    id: 'cocina',
    name: 'Cocina RTVE',
    logo: '/logos/cocina.jpg',
    category: 'tematicos',
    web: 'https://www.rtve.es/play/videos/directo/canales-rtve/play-cocina/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/16656232.m3u8' },
    ],
  },

  // ──────────────────────────── INFANTILES ────────────────────────────
  {
    id: 'clan',
    name: 'Clan TVE',
    logo: '/logos/clan.png',
    category: 'infantiles',
    epgId: 'Clan.TV',
    web: 'https://www.rtve.es/play/videos/directo/clan/',
    sources: [
      { type: 'hls', url: 'https://ztnr.rtve.es/ztnr/5466990.m3u8' },
      { type: 'hls', url: 'https://rtvelivestream.rtve.es/rtvesec/clan/clan_main_dvr.m3u8' },
      { type: 'hls', url: 'https://d1wca51iywzyn1.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-e2jakfg63mh4b/ClanES.m3u8' },
    ],
  },
  {
    id: 'boing',
    name: 'Boing',
    logo: '/logos/boing.png',
    category: 'infantiles',
    epgId: 'Boing.TV',
    web: 'https://www.mitele.es/directo/boing',
    sources: [
      { type: 'web', url: 'https://www.mitele.es/directo/boing' },
    ],
  },
  {
    id: 'disneychannel',
    name: 'Disney Channel',
    logo: '/logos/disneychannel.png',
    category: 'infantiles',
    web: 'https://www.youtube.com/@disneychannelES/streams',
    sources: [
      { type: 'youtube', url: 'https://www.youtube.com/channel/UCayRpbmAiiuU50OpDPVSjwA/live' },
    ],
  },
  {
    id: 'pocoyo',
    name: 'Pocoyó',
    logo: '/logos/pocoyo.jpg',
    category: 'infantiles',
    web: 'https://www.pocoyo.com',
    sources: [
      { type: 'youtube', url: 'https://www.youtube.com/channel/UCnB5W_ZJgiDFnklejRGADxw/live' },
    ],
  },

  // ──────────────────────────── AUTONÓMICOS ────────────────────────────
  {
    id: 'tv3',
    name: 'TV3',
    logo: '/logos/tv3.png',
    category: 'autonomicos',
    epgId: 'TV3.TV',
    web: 'https://www.3cat.cat/3cat/directes/tv3/',
    sources: [
      { type: 'hls', url: 'https://directes-tv-int.3catdirectes.cat/live-content/tvi-hls/master.m3u8' },
      { type: 'hls', url: 'https://directes-tv-es.3catdirectes.cat/live-content/tvi-hls/master.m3u8' },
    ],
  },
  {
    id: 'etb1',
    name: 'ETB 1',
    logo: '/logos/etb1.png',
    category: 'autonomicos',
    epgId: 'ETB1.TV',
    web: 'https://www.eitb.eus/es/television/etb1/directo/',
    sources: [
      { type: 'hls', url: 'https://multimedia.eitb.eus/live-content/etb1hd-hls/master.m3u8' },
    ],
  },
  {
    id: 'etb2',
    name: 'ETB 2',
    logo: '/logos/etb2.png',
    category: 'autonomicos',
    epgId: 'ETB2.TV',
    web: 'https://www.eitb.eus/es/television/etb2/directo/',
    sources: [
      { type: 'hls', url: 'https://multimedia.eitb.eus/live-content/etb2hd-hls/master.m3u8' },
    ],
  },
  {
    id: 'canalsur',
    name: 'Canal Sur',
    logo: '/logos/canalsur.png',
    category: 'autonomicos',
    epgId: 'CanalSur.TV',
    web: 'https://www.canalsur.es/television',
    sources: [
      { type: 'hls', url: 'https://dfk2a268yviz9.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-ddiii1m6jt6of/CanalSurAndaluciaES.m3u8' },
    ],
  },
  {
    id: 'telemadrid',
    name: 'Telemadrid',
    logo: '/logos/telemadrid.png',
    category: 'autonomicos',
    epgId: 'Telemadrid.TV',
    web: 'https://www.telemadrid.es/emision-en-directo/',
    sources: [
      { type: 'hls', url: 'https://telemadrid-23-secure2.akamaized.net/master.m3u8' },
      { type: 'web', url: 'https://www.telemadrid.es/emision-en-directo/' },
    ],
  },
  {
    id: 'apunt',
    name: 'À Punt',
    logo: '/logos/apunt.png',
    category: 'autonomicos',
    epgId: 'APunt.TV',
    web: 'https://www.apuntmedia.es/directe/',
    sources: [
      { type: 'hls', url: 'https://bcovlive-a.akamaihd.net/8499d938ef904e39b58a4adec2ddeada/eu-west-1/6057955885001/playlist_dvr.m3u8' },
      { type: 'web', url: 'https://www.apuntmedia.es/directe/' },
    ],
  },
  {
    id: 'tvg',
    name: 'TVG',
    logo: '/logos/tvg.png',
    category: 'autonomicos',
    epgId: 'TVG.TV',
    web: 'https://www.crtvg.es/tvg',
    sources: [
      { type: 'hls', url: 'https://crtvg-europa.flumotion.cloud/playlist.m3u8' },
    ],
  },
  {
    id: 'tvg2',
    name: 'TVG 2',
    logo: '/logos/tvg2.png',
    category: 'autonomicos',
    web: 'https://www.crtvg.es/tvg',
    sources: [
      { type: 'hls', url: 'https://crtvg-tvg2.flumotion.cloud/playlist.m3u8' },
    ],
  },
  {
    id: 'ib3',
    name: 'IB3',
    logo: '/logos/ib3.png',
    category: 'autonomicos',
    web: 'https://ib3.org/directe',
    sources: [
      { type: 'web', url: 'https://ib3.org/directe' },
    ],
  },
  {
    id: 'canalextremadura',
    name: 'Canal Extremadura',
    logo: '/logos/canalextremadura.png',
    category: 'autonomicos',
    web: 'https://www.canalextremadura.es/',
    sources: [
      { type: 'hls', url: 'https://canalextremadura-live.flumotion.cloud/canalextremadura/live_all/playlist.m3u8' },
    ],
  },
  {
    id: 'aragontv',
    name: 'Aragón TV',
    logo: '/logos/aragontv.png',
    category: 'autonomicos',
    web: 'https://www.cartv.es/aragontv/directo',
    sources: [
      { type: 'hls', url: 'https://cartv.streaming.aranova.es/hls/live/aragontv_canal1.m3u8' },
    ],
  },
  {
    id: 'tvcanaria',
    name: 'TV Canaria',
    logo: '/logos/tvcanaria.png',
    category: 'autonomicos',
    web: 'https://cdn.rtvc.es/en-directo/',
    sources: [
      { type: 'hls', url: 'https://d1oyt3v08gcy18.cloudfront.net/index-events.m3u8' },
    ],
  },
  {
    id: 'cmm',
    name: 'CMM',
    logo: '/logos/cmm.png',
    category: 'autonomicos',
    web: 'https://www.cmmedia.es/',
    sources: [
      { type: 'hls', url: 'https://cdnapisec.kaltura.com/p/2288691/sp/228869100/playManifest/entryId/1_gnz6ity9/protocol/https/format/applehttp/flavorIds/1_a9gxgxzy,1_v71ryg4b,1_vbfvtjw6,1_obo1bqsx,1_3shk3s5d/a.m3u8' },
    ],
  },
  {
    id: 'sx3',
    name: 'SX3',
    logo: '/logos/sx3.jpg',
    category: 'autonomicos',
    web: 'https://www.3cat.cat/3cat/directes/sx3/',
    sources: [
      { type: 'hls', url: 'https://directes-tv-int.3catdirectes.cat/live-content/super3-hls/master.m3u8' },
      { type: 'hls', url: 'https://directes-tv-es.3catdirectes.cat/live-content/super3-hls/master.m3u8' },
    ],
  },
]
