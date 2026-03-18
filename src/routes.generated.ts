// AUTO-GENERATED FILE — DO NOT EDIT
import { FastifyInstance } from "fastify"

import { audioNext as route0 } from "./routes/audio/audioNext"
import { audioPause as route1 } from "./routes/audio/audioPause"
import { audioPlay as route2 } from "./routes/audio/audioPlay"
import { audioPlayNext as route3 } from "./routes/audio/audioPlayNext"
import { audioPrevious as route4 } from "./routes/audio/audioPrevious"
import { audioResume as route5 } from "./routes/audio/audioResume"
import { audioState as route6 } from "./routes/audio/audioState"
import { audioStop as route7 } from "./routes/audio/audioStop"
import { streamRoute as route8 } from "./routes/audio/streamRoute"
import { getPresets as route9 } from "./routes/eq/getPresets"
import { getStatus as route10 } from "./routes/eq/getStatus"
import { loadPreset as route11 } from "./routes/eq/loadPreset"
import { setBand as route12 } from "./routes/eq/setBand"
import { setGain as route13 } from "./routes/eq/setGain"
import { addMedia as route14 } from "./routes/media/addMedia"
import { listMedia as route15 } from "./routes/media/listMedia"
import { mediaScannerRoutes as route16 } from "./routes/media/mediaScannerRoutes"
import { removeMedia as route17 } from "./routes/media/removeMedia"
import { podverseRoutes as route18 } from "./routes/podverse/podverseRoutes"
import { podverseSubscriptionRoutes as route19 } from "./routes/podverse/podverseSubscriptionRoutes"
import { radioRoutes as route20 } from "./routes/radio/radioRoutes"
import { searchRoutes as route21 } from "./routes/search/searchRoutes"
import { getStatus as route22 } from "./routes/snapserver/getStatus"
import { muteAllClients as route23 } from "./routes/snapserver/muteAllClients"
import { setClientVolume as route24 } from "./routes/snapserver/setClientVolume"
import { unmuteAllClients as route25 } from "./routes/snapserver/unmuteAllClients"
import { artistsRoutes as route26 } from "./routes/spotify/artistsRoutes"
import { getAlbum as route27 } from "./routes/spotify/getAlbum"
import { getEpisode as route28 } from "./routes/spotify/getEpisode"
import { getPlaylist as route29 } from "./routes/spotify/getPlaylist"
import { getShow as route30 } from "./routes/spotify/getShow"
import { getTrack as route31 } from "./routes/spotify/getTrack"
import { libraryAlbums as route32 } from "./routes/spotify/libraryAlbums"
import { libraryAudiobooks as route33 } from "./routes/spotify/libraryAudiobooks"
import { libraryConsolidated as route34 } from "./routes/spotify/libraryConsolidated"
import { libraryPlaylist as route35 } from "./routes/spotify/libraryPlaylist"
import { libraryShows as route36 } from "./routes/spotify/libraryShows"
import { libraryTracks as route37 } from "./routes/spotify/libraryTracks"
import { spotifyCallback as route38 } from "./routes/spotify/spotifyCallback"
import { spotifyCode as route39 } from "./routes/spotify/spotifyCode"
import { spotifyDevices as route40 } from "./routes/spotify/spotifyDevices"
import { spotifyLogin as route41 } from "./routes/spotify/spotifyLogin"
import { spotifyPlaylistTracks as route42 } from "./routes/spotify/spotifyPlaylistTracks"
import { spotifyRecommendations as route43 } from "./routes/spotify/spotifyRecommendations"
import { spotifyUser as route44 } from "./routes/spotify/spotifyUser"
import { configRoutes as route45 } from "./routes/utils/configRoutes"
import { qr as route46 } from "./routes/utils/qr"
import { version as route47 } from "./routes/utils/version"
import { migrationRoutes as route48 } from "./routes/youtube/migrationRoutes"
import { proxyRoute as route49 } from "./routes/youtube/proxyRoute"

export async function registerAllRoutes(app: FastifyInstance) {
  await app.register(route0, { prefix: "/api" })
  await app.register(route1, { prefix: "/api" })
  await app.register(route2, { prefix: "/api" })
  await app.register(route3, { prefix: "/api" })
  await app.register(route4, { prefix: "/api" })
  await app.register(route5, { prefix: "/api" })
  await app.register(route6, { prefix: "/api" })
  await app.register(route7, { prefix: "/api" })
  await app.register(route8, { prefix: "/api" })
  await app.register(route9, { prefix: "/api" })
  await app.register(route10, { prefix: "/api" })
  await app.register(route11, { prefix: "/api" })
  await app.register(route12, { prefix: "/api" })
  await app.register(route13, { prefix: "/api" })
  await app.register(route14, { prefix: "/api" })
  await app.register(route15, { prefix: "/api" })
  await app.register(route16, { prefix: "/api" })
  await app.register(route17, { prefix: "/api" })
  await app.register(route18, { prefix: "/api" })
  await app.register(route19, { prefix: "/api" })
  await app.register(route20, { prefix: "/api" })
  await app.register(route21, { prefix: "/api" })
  await app.register(route22, { prefix: "/api" })
  await app.register(route23, { prefix: "/api" })
  await app.register(route24, { prefix: "/api" })
  await app.register(route25, { prefix: "/api" })
  await app.register(route26, { prefix: "/api" })
  await app.register(route27, { prefix: "/api" })
  await app.register(route28, { prefix: "/api" })
  await app.register(route29, { prefix: "/api" })
  await app.register(route30, { prefix: "/api" })
  await app.register(route31, { prefix: "/api" })
  await app.register(route32, { prefix: "/api" })
  await app.register(route33, { prefix: "/api" })
  await app.register(route34, { prefix: "/api" })
  await app.register(route35, { prefix: "/api" })
  await app.register(route36, { prefix: "/api" })
  await app.register(route37, { prefix: "/api" })
  await app.register(route38, { prefix: "/api" })
  await app.register(route39, { prefix: "/api" })
  await app.register(route40, { prefix: "/api" })
  await app.register(route41, { prefix: "/api" })
  await app.register(route42, { prefix: "/api" })
  await app.register(route43, { prefix: "/api" })
  await app.register(route44, { prefix: "/api" })
  await app.register(route45, { prefix: "/api" })
  await app.register(route46, { prefix: "/api" })
  await app.register(route47, { prefix: "/api" })
  await app.register(route48, { prefix: "/api" })
  await app.register(route49, { prefix: "/api" })
}
