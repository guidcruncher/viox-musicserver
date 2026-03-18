// src/services/audioControl.ts

import { getLogger } from "../../logger"
import { historyRepository } from "../../repositories/historyRepository"
import { listenEventsRepository } from "../../repositories/listenEventsRepository"
import { listensRepository } from "../../repositories/listensRepository"
import { AudioBackend, AudioStatus, MediaItem } from "../../types/"
import { mpdClient } from "../mpd/mpdClient"
import { spotifyWebApi } from "../spotify/spotifyWebClient"
import { unifiedSpotifyBackend } from "../spotify/unifiedSpotifyBackend"
import { mediaItemResolver } from "./mediaItemResolver"

let activeBackend: AudioBackend | undefined = undefined
let sessionId: number | undefined = undefined
let currentTrack: MediaItem | undefined = undefined

function detectBackend(id?: string): AudioBackend {
  if (!id) return "spotify"
  return id.startsWith("spotify:") ? "spotify" : "mpd"
}

class AudioControl {
  getActiveBackend(): AudioBackend | undefined {
    return activeBackend
  }
  // --- Playback --

  endCurrentSession() {
    if (sessionId) {
      const listenId = listenEventsRepository.endSession(sessionId)
      const duration = listenEventsRepository.getDuration(sessionId)
      if (listenId && duration) {
        // Add duration to the listens table
        listensRepository.addDuration(listenId, duration)
      }
    }
  }

  async switchBackend(next: AudioBackend) {
    const log = getLogger()

    if (activeBackend && activeBackend !== next) {
      log.info(`Switching audio backend from ${activeBackend} to ${next}`)
      if (activeBackend === "spotify") {
        await spotifyWebApi.player.pause()
      } else if (activeBackend === "mpd") {
        await mpdClient.stop()
      }
    }
    log.info(`Active audio backend is now ${next}`)
    activeBackend = next
  }

  async play(item: MediaItem): Promise<MediaItem | undefined> {
    const log = getLogger()
    log.info(`Requested to play item: ${item.id}`)
    const backend = detectBackend(item.id ?? "")
    historyRepository.create(item)
    listensRepository.createOrUpsert(item)

    this.endCurrentSession()

    sessionId = listenEventsRepository.startSession(item.id)

    log.info(`Playing item ${JSON.stringify(item.id)} on backend ${backend}`)

    if (item.id.includes(":tunein")) {
      log.info(`Getting Tunein playback url for  ${item.id}`)
      const itemToPlay = await mediaItemResolver.getMediaItem(item.id, {})
      if (!itemToPlay) {
        log.error(`Error Getting Tunein playback url for  ${item.id}`)
        return
      }
      item.uri = itemToPlay.uri
      log.info(`Got Tunein playback url for  ${item.id} is ${itemToPlay.uri}`)
    }

    if (activeBackend && activeBackend != backend) {
      log.info(`Stopping playback on current backend ${activeBackend}`)
      await mpdClient.stop()
      await spotifyWebApi.player.pause()
    }

    await this.switchBackend(backend)

    if (backend === "spotify") {
      log.info(`Using Unified Spotify Backend to play item`)
      if (item.id) {
        currentTrack = item
        log.info(`Playing id ${item.id}`)
        await unifiedSpotifyBackend.play(item.id)
        return item
      }
      log.info(`Resuming playback on Spotify`)
      await unifiedSpotifyBackend.resume()
      currentTrack = item
      return item
    }

    if (backend === "mpd") {
      log.info(`Using MPD Client to play item`)
      if (item.id) {
        log.info(`Playing id ${item.id}`)
        await mpdClient.playUri(item.uri, item.img)
        currentTrack = item
        return item
      }

      log.info(`Resuming playback on MPD`)
      await mpdClient.play()
      currentTrack = item
      return item
    }

    log.error(`Could not determine backend to play item`)
  }

  async pause() {
    await unifiedSpotifyBackend.pause()
    await mpdClient.pause()
  }

  async resume() {
    switch (activeBackend) {
      case "spotify":
        return await unifiedSpotifyBackend.resume()
      case "mpd":
        return await mpdClient.resume()
    }
  }

  async stop() {
    await unifiedSpotifyBackend.stop()
    await mpdClient.stop()
    this.endCurrentSession()
    currentTrack = undefined
  }

  async next() {
    switch (activeBackend) {
      case "spotify":
        return await unifiedSpotifyBackend.next()
      case "mpd":
        return await mpdClient.next()
    }
  }

  async previous() {
    switch (activeBackend) {
      case "spotify":
        return await unifiedSpotifyBackend.previous()
      case "mpd":
        return await mpdClient.previous()
    }
  }

  async seek(positionMs: number) {
    switch (activeBackend) {
      case "spotify":
        await unifiedSpotifyBackend.seek(positionMs)
        break
      case "mpd":
        await mpdClient.seek(positionMs)
        break
    }
  }

  // --- Devices ---
  async devices() {
    return unifiedSpotifyBackend.devices()
  }

  // --- Status ---
  async status(): Promise<AudioStatus> {
    const spotify = await unifiedSpotifyBackend.status()
    const mpd = await mpdClient.status()

    const res: AudioStatus = {
      active: activeBackend,
      playing: false,
      currentTrack: undefined,
    }

    if (mpd) {
      if (mpd.state != "stop" && mpd.track) {
        res.playing = true
        res.active = "mpd"
        activeBackend = "mpd"
      }
    }

    if (spotify) {
      if (!spotify.paused && mpd.state == "stop" && spotify.track) {
        res.playing = true
        activeBackend = "spotify"
        res.active = "spotify"
      }
    }

    if (res.playing) {
      res.currentTrack = currentTrack
    }
    return res as AudioStatus
  }

  async playNext(id: string) {
    const backend = detectBackend(id)

    if (backend === "spotify") return unifiedSpotifyBackend.playNext(id)
    return mpdClient.playNext(id)
  }
}

export const audioControl = new AudioControl()
