import{_ as p,r as s,j as o}from"./index-CkdLaxN_.js";import{g as y}from"./tone-8cuZjeI-.js";const h=`
<div class="ggl-root">
  <main class="app-shell">
    <section class="topbar" aria-label="Transport and generation controls">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <div>
          <h1>Groove Grammar Lab</h1>
          <p>Educational drum machine for phrase-aware rhythm study</p>
        </div>
      </div>
      <div class="transport">
        <button id="playButton" class="primary-button" type="button" aria-label="Play or stop">
          <span id="playIcon" aria-hidden="true">Play</span>
        </button>
        <button id="generateButton" type="button">Generate</button>
        <button id="mutateButton" type="button">Mutate</button>
        <button id="analyzeButton" type="button">Analyze</button>
        <button id="compareButton" type="button">Compare</button>
        <span id="sampleStatus" class="sample-status" title="Audio engine status"></span>
      </div>
    </section>
    <section class="workbench">
      <aside class="control-panel" aria-label="Groove parameters">
        <div class="control-section">
          <label for="styleSelect">Style school</label>
          <select id="styleSelect"><option value="afrocuban">Afro-Cuban</option></select>
        </div>
        <div class="two-col">
          <div class="control-section">
            <label for="barsSelect">Phrase bars</label>
            <select id="barsSelect">
              <option value="1">1</option><option value="2">2</option><option value="4">4</option>
              <option value="8" selected>8</option><option value="16">16</option>
            </select>
          </div>
          <div class="control-section">
            <label for="meterSelect">Meter</label>
            <select id="meterSelect">
              <option value="2-4">2/4</option><option value="4-4" selected>4/4</option>
              <option value="3-4">3/4</option><option value="5-4">5/4</option>
              <option value="5-8">5/8</option><option value="6-8">6/8</option>
              <option value="7-8">7/8</option><option value="9-8">9/8</option>
              <option value="10-8">10/8</option><option value="11-8">11/8</option>
              <option value="12-8">12/8</option><option value="13-8">13/8</option>
            </select>
          </div>
        </div>
        <section class="style-info" aria-label="Selected rhythm information">
          <h2>Style info</h2><div id="styleInfo"></div>
        </section>
        <div class="slider-row"><label for="tempoRange">Tempo <output id="tempoOut">124</output></label>
          <input id="tempoRange" type="range" min="60" max="180" value="124" /></div>
        <div class="slider-row"><label for="complexityRange">Complexity <output id="complexityOut">55</output></label>
          <input id="complexityRange" type="range" min="0" max="100" value="55" /></div>
        <div class="slider-row"><label for="densityRange">Density <output id="densityOut">54</output></label>
          <input id="densityRange" type="range" min="10" max="100" value="54" /></div>
        <div class="slider-row"><label for="swingRange">Swing <output id="swingOut">12</output></label>
          <input id="swingRange" type="range" min="0" max="60" value="12" /></div>
        <div class="slider-row"><label for="humanRange">Humanize <output id="humanOut">18</output></label>
          <input id="humanRange" type="range" min="0" max="80" value="18" /></div>
        <div class="slider-row"><label for="masterRange">Master volume <output id="masterOut">72</output></label>
          <input id="masterRange" type="range" min="0" max="100" value="72" /></div>
        <fieldset class="toggle-list">
          <legend>Layers</legend>
          <label><input id="coreToggle" type="checkbox" checked /> Core beat</label>
          <label><input id="ornamentToggle" type="checkbox" checked /> Ornaments</label>
          <label><input id="fillToggle" type="checkbox" checked /> Fill layer</label>
          <label><input id="textureToggle" type="checkbox" checked /> Texture</label>
          <label><input id="accentToggle" type="checkbox" checked /> Accents</label>
        </fieldset>
        <fieldset class="mixer" aria-label="Per-track mixer">
          <legend>Mixer</legend>
          <div id="mixer" class="mixer-rows"></div>
        </fieldset>
        <section class="control-section library" aria-label="Patterns and export">
          <label for="presetSelect">Patterns &amp; export</label>
          <div class="preset-row">
            <select id="presetSelect" aria-label="Saved patterns">
              <option value="">Saved patterns…</option>
            </select>
          </div>
          <div class="library-actions">
            <button id="saveButton" type="button">Save</button>
            <button id="loadButton" type="button">Load</button>
            <button id="deleteButton" type="button">Delete</button>
          </div>
          <div class="library-actions">
            <button id="midiButton" type="button">Export MIDI</button>
            <button id="wavButton" type="button">Export WAV</button>
            <button id="shareButton" type="button">Copy link</button>
          </div>
        </section>
      </aside>
      <section class="main-panel" aria-label="Generated rhythm">
        <div class="stats-strip" id="statsStrip"></div>
        <div class="grid-shell">
          <div class="grid-head">
            <div>
              <h2 id="grooveTitle">Afro-Cuban 8-bar phrase</h2>
              <p id="grooveSubtitle">Stable pulse, clave orientation, call and response layers</p>
            </div>
            <div class="legend" aria-label="Grid legend">
              <span><i class="dot core"></i>core</span>
              <span><i class="dot ornament"></i>ornament</span>
              <span><i class="dot fill"></i>fill</span>
              <span><i class="dot ghost"></i>ghost</span>
              <span><i class="dot accent"></i>accent</span>
            </div>
          </div>
          <div id="grid" class="sequencer-grid" aria-label="Step grid"></div>
        </div>
        <div class="lower-panels">
          <section class="analysis-panel" aria-label="Explanation">
            <h2>Explanation mode</h2><div id="explanation"></div>
          </section>
          <section class="analysis-panel compact" aria-label="Phrase map">
            <h2>Phrase map</h2><div id="phraseMap" class="phrase-map"></div>
          </section>
          <section class="analysis-panel compact affinity-panel" aria-label="Rhythm affinity map">
            <h2>Rhythm affinity map</h2><div id="affinityMap" class="affinity-map"></div>
          </section>
        </div>
      </section>
    </section>
  </main>
</div>
`;let u=!1;async function g(n,t={}){var a;n.innerHTML=h,t.audioContext&&(window.__MELOS_GGL_AUDIO_CTX__=t.audioContext),u||(await p(()=>import("./rhythm-packs-PpkYLLjX.js"),[]),await p(()=>import("./ggl-core-D8UKpmjT.js"),[]),u=!0),(a=window.__MELOS_GGL_MOUNT__)==null||a.call(window);let e=null;return t.onPatternChange&&window.__MELOS_GGL_ON_PATTERN__&&(e=window.__MELOS_GGL_ON_PATTERN__(t.onPatternChange)),{getPattern(){var l;return((l=window.__MELOS_GGL_GET_PATTERN__)==null?void 0:l.call(window))??null},dispose(){e==null||e(),n.innerHTML=""}}}function x({onPatternChange:n}){const t=s.useRef(null),e=s.useRef(null),a=s.useRef(n);a.current=n;const[l,v]=s.useState(null);return s.useEffect(()=>{const d=t.current;if(!d)return;let r=!1;return(async()=>{try{const i=y().rawContext,b=await g(d,{audioContext:i,onPatternChange:m=>{var c;return(c=a.current)==null?void 0:c.call(a,m)}});r||(e.current=b)}catch(i){r||v(String(i.message??i))}})(),()=>{var i;r=!0,(i=e.current)==null||i.dispose(),e.current=null}},[]),o.jsxs("div",{className:"groove-host",children:[o.jsxs("div",{className:"groove-host__intro",children:[o.jsx("h1",{className:"lab__title",children:"Groove Grammar Lab"}),o.jsx("p",{className:"text-secondary lab__subtitle",children:"Освітня драм-машина. Спільний AudioContext із MELOS · pattern автоматично стікає в Hit DNA картку Composer's Lab."})]}),l&&o.jsxs("div",{className:"groove-host__err",children:["Помилка завантаження: ",l]}),o.jsx("div",{ref:t,className:"groove-host__mount"})]})}export{x as GrooveLab};
