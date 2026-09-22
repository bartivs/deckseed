---
pagetitle: {{TITLE_YAML}}
lang: {{LANGUAGE_YAML}}
harness-theme: {{THEME_YAML}}
harness-theme-package: {{THEME_PACKAGE_YAML}}
audience: "Define the intended audience."
goal: "Define what the audience should understand or do."
core-message: "State the presentation's main idea in one sentence."
controls: true
progress: true
slideNumber: true
hash: true
transition: fade
width: 1600
height: 900
margin: 0.04
---

<div class="eyebrow">Presentation</div>

# {{TITLE}}

<p class="lead">Replace this copy with the presentation's main idea.</p>

<footer class="slide-footer">Use the arrow keys or Space to navigate.</footer>

---

<div class="eyebrow">Example</div>

# Compose slides from reusable primitives

<div class="card-grid">
<div class="card">
### Clear structure

Write slides in concise Pandoc Markdown.
</div>
<div class="card">
### Presentation theme

Customize the generated `theme.css` file.
</div>
<div class="card">
### Portable output

Navigation, print, fullscreen, and touch support come from Reveal.js.
</div>
</div>

<footer class="slide-footer">`content.md` is the approved source; `index.html` is generated.</footer>

---

<div class="eyebrow">Diagram example</div>

# Show a change, not another list

<div class="diagram-compare">
<div class="diagram-panel before">
<h3>Before</h3>
<div class="diagram-flow">
<div class="diagram-node actor">Individual work</div>
<div class="diagram-connector" aria-hidden="true">→</div>
<div class="diagram-node warning">Fragmented result</div>
</div>
</div>
<div class="diagram-shift" aria-hidden="true">⇒</div>
<div class="diagram-panel after">
<h3>After</h3>
<div class="diagram-flow">
<div class="diagram-node actor">Shared intent</div>
<div class="diagram-connector" aria-hidden="true">→</div>
<div class="diagram-node success">Governed result</div>
</div>
</div>
</div>

<footer class="slide-footer">Shared diagram primitives need no JavaScript or external assets.</footer>
