// src/services/spotify/unifiedSpotifyBackend.ts

import { spotifyWebApi } from "./spotifyWebClient"

class UnifiedSpotifyBackend {
  //
  // --- Playback ---
  //

  async play(uri: string) {
    return spotifyWebApi.player.play(uri)
  }

  async resume() {
    return spotifyWebApi.player.resume()
  }

  async pause() {
    return spotifyWebApi.player.pause()
  }

  async stop() {
    // Spotify has no "stop", so we simulate by pausing
    return spotifyWebApi.player.pause()
  }

  async next() {
    return spotifyWebApi.player.next()
  }

  async previous() {
    return spotifyWebApi.player.previous()
  }

  async seek(positionMs: number) {
    return spotifyWebApi.player.seek(positionMs)
  }

  async setVolume(percent: number) {
    return spotifyWebApi.player.setVolume(percent)
  }

  //
  // --- Queue ---
  //

  async queue(uri: string) {
    return spotifyWebApi.player.addToQueue(uri)
  }

  async playNext(uri: string) {
    // Spotify has no "play next", so we simulate:
    // 1. Add to queue
    // 2. Skip to next track
    await spotifyWebApi.player.addToQueue(uri)
    return spotifyWebApi.player.next()
  }

  async list() {
    return spotifyWebApi.player.getQueue()
  }

  //
  // --- History ---
  //

  async history() {
    return spotifyWebApi.player.getRecentlyPlayed({ limit: 50 })
  }

  //
  // --- Now Playing ---
  //

  async nowPlaying() {
    return spotifyWebApi.player.getPlaybackState()
  }

  //
  // --- Lookup ---
  //

  async albumLookup(albumId: string) {
    return spotifyWebApi.player.getAlbum(albumId)
  }

  async artistLookup(artistId: string) {
    return spotifyWebApi.player.getArtist(artistId)
  }

  //
  // --- Devices ---
  //

  async devices() {
    return spotifyWebApi.player.getDevices()
  }

  //
  // --- Status ---
  //

  async status() {
    return spotifyWebApi.player.getPlaybackState()
  }
}

export const unifiedSpotifyBackend = new UnifiedSpotifyBackend()
