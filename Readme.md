# LRC Converter

A small web page that turns timestamped lyrics (TXT) into a standard `.lrc` file. It runs entirely in the browser, so nothing is uploaded anywhere.

## Features

- Converts timestamped lyrics to LRC as you type
- Optional Title, Artist and Album tags
- Choice of precision: `[mm:ss.xx]` (standard) or `[mm:ss.xxx]`
- Load a sample,or open a `.txt` file from your computer
- Copy the result or download it as a `.lrc` file
- Animated video background

## Files

```
index.html   page structure
style.css    styling
script.js    conversion logic
bg.mp4       background video
```

## Usage

1. Put all the files in the same folder.
2. Open `index.html` in a browser.
3. Paste your timestamped lyrics into the Input box, or click **Open .txt file**.
4. Fill in Title, Artist and Album if you want them in the output.
5. Click **Copy** or **Download .lrc**.

No build step or dependencies are needed.

## Supported input formats

Each line should start with a time, followed by the lyric text:

```
0:12 First line
[00:17.80] Second line
1:05 - Third line
(1:30) Fourth line
1:02:03 Line with hours
[00:12][01:05] Line repeated at two times
```

Notes:

- Times can be written as `mm:ss`, `mm:ss.xx`, `h:mm:ss`, and may be wrapped in `[ ]`, `( )` or `< >`.
- A separator such as `-` or `:` after the time is removed.
- Several bracketed times on one line produce one LRC line per time.
- Output is sorted by time.
- Lines without a time are skipped, and the status message shows how many were skipped.
- Existing `[ti:]`, `[ar:]` and `[al:]` tags in the input are kept. Anything typed into the Title, Artist or Album fields takes priority.

## Background video

The video used is "Vibrant Abstract Geometric Cube Animation" by Nicola Narracci from Pexels, which is free to use under the [Pexels license](https://www.pexels.com/license/). Source: https://www.pexels.com/video/vibrant-abstract-geometric-cube-animation-33399381/
