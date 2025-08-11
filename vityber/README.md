Web VRM Vtuber Demo
===================

What this ZIP contains (default, minimal demo)
- index.html — entry page
- app.js — minimal three.js + three-vrm loader and simple demo logic
- assets/model.vrm — **PLACEHOLDER** (not a real VRM). Replace with a real .vrm model.
- README.md — this file

Important notes
- I could not include a real, generated .vrm model in this demo due to size and generation constraints.
  Please download or export a VRM (for example from VRoid Hub, or export from VRoid Studio) and place the .vrm file at `assets/model.vrm`.
- Run via a local server or HTTPS. Example (python):
  - python -m http.server 8000
  - Open https://localhost:8000 or http://127.0.0.1:8000 in a modern browser (Chrome / Edge / Firefox)
- The demo uses CDN links for three.js and three-vrm. Internet is required to fetch those libraries when you run the demo.
- If you want Live2D instead of VRM, tell me and I can prepare a Live2D scaffold instead.
- To add MediaPipe face/hand tracking you can include the official MediaPipe JS libs and map landmarks to VRM bones. I can integrate that as a follow-up.

How to replace the placeholder model
1. Get a VRM file (e.g., export from VRoid Studio or download a free sample VRM).
2. Place the file as `assets/model.vrm` (overwrite placeholder).
3. Open the page and click "Start Camera & Load Model".

License
-------
This scaffold is MIT-like: you may use and modify it. No warranty provided.
