# FFT Binary Stream Protocol Specification
Version: 1.0  
Transport: WebSocket (binary)  
Payload: Float32Array(64)

## 1. Overview
This document defines the binary protocol used by the AudioService FFT stream ( located at /api/fft).  
Clients receive real‑time FFT magnitude frames derived from a 1024‑point real FFT at 48 kHz.

The protocol is optimized for:
- Low latency
- Zero JSON overhead
- Deterministic frame size
- Efficient GPU/Canvas rendering

---

## 2. Transport
- Protocol: WebSocket
- Direction: Server → Client (unidirectional)
- Message type: Binary (`ArrayBuffer`)
- Frame rate: Depends on audio chunk rate (typically 30–120 FPS)

---

## 3. Frame Format

Each message contains:

```
Float32Array(64)
```

### 3.1 Size

```
64 bins × 4 bytes = 256 bytes
```

### 3.2 Data Type
- IEEE‑754 32‑bit float
- Little‑endian (native JavaScript format)

---

## 4. Frequency Mapping

The FFT is computed using:

- Sample rate: **48,000 Hz**
- FFT size: **1024**
- Bin resolution:  

```
48000 / 1024 = 46.875 Hz per bin
```

Only the **first 64 bins** are transmitted:

| Bin | Frequency (Hz) |
|-----|----------------|
| 0   | 0              |
| 1   | 46.875         |
| 2   | 93.75          |
| …   | …              |
| 63  | 2960           |

This covers the **low‑frequency spectrum** (bass + mids).

---

## 5. Magnitude Processing

The server applies:

1. **Real FFT transform**  
2. **Magnitude calculation**  

```
sqrt(real² + imag²)
```

3. **Noise gate**  

```
Values `< 0.012` → `0`
```

4. **Noise subtraction**  

```
mag = mag - 0.012
```

5. **Gain scaling**  

```
mag = mag * 1.5
```

### 5.1 Output Range
- Theoretical max: ~1536  
- Typical real‑world: 0 → 50  

---

## 6. Client Responsibilities
- Set `binaryType = "arraybuffer"`
- Interpret payload as `Float32Array(64)`
- Render values as needed (bars, radial, waveform, spectrogram, etc.)

---

## 7. Versioning
This protocol is versioned independently of the SDK.  
Breaking changes will increment the major version.

```
v1.0 — Current binary format
```

---

## 8. License
This protocol is part of your internal audio visualization system and may be licensed as needed.

