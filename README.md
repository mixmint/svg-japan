<h1 align="center">
<br>
SVG Japan
<br>
</h1>

<h4 align="center">A native JavaScript-built plugin that generates an interactive SVG-formatted map of Japan.</h4>

<p align="center">
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/ka215/svg-japan?style=flat-square">
<img alt="GitHub all releases" src="https://img.shields.io/github/downloads/ka215/svg-japan/total">
<img alt="GitHub" src="https://img.shields.io/github/license/ka215/svg-japan">
</p>

<p align="center">
<a href="#features">Features</a> •
<a href="#quick-start">Quick Start</a> •
<a href="#usage">Usage</a> •
<a href="#supported-devices">Supported Devices</a> •
<a href="#documentation">Documentation</a> •
<a href="#demonstration">Demonstration</a> •
<a href="#creators">Creators</a> •
<a href="#copyright-and-license">License</a>
</p>

![screenshot](https://raw.githubusercontent.com/mixmint/svg-japan/main/assets/svg-japan.png)

## Features

* Multiple types of Japanese maps can be generated.
* The presence or absence of a map border can be switch.
* Regions can be defined by freely grouping prefectures.
* All prefectures can be unified in one color.
* Normal and active colors can be set for each prefecture and region.
* The tip helper can be pop up when on mouse over.
* You can get the event fired on JavaScript when the prefecture is clicked.
* Allows for automatic or predefined prefecture linking.

## Quick Start

Several quick start options are available:

* Clone this repository
```bash
git clone https://github.com/ka215/svg-japan.git
```

## Usage

1. Include this plugin script into your HTML.
```HTML
<script src="/path/to/svg-japan.min.js"></script>
```
2. Then mark up the element where you want to insert the map.
```HTML
<div id="my-map-container"></div>
```
3. Finally, instantiate the plugin class in your script.
```js
svgJapan({ element: "#my-map-container" })
```

Alternatively, you can create the container element in JavaScript.
```js
var map = svgJapan()

document.body.appendChild( map.map_container )
```

It is desirable to execute the dispatcher function after the files of this plugin are completely loaded.
To do this, a structure that waits for the DOM content to finish loading, such as:
```js
document.addEventListener( 'DOMContentLoaded', function() {

svgJapan()

}, false)
```

## Supported Devices

Please refer to the target device definition of JS transpiling (excerpt from "babel.config.js" below):
```
targets: {
chrome: "67",
edge: "17",
firefox: "60",
ie: "11",
safari: "11.1",
},
```

## Documentation

You can control the behavior of the generated Japan map by specifying options when running the plugin. An example of an option specification is shown below.
```
svgJapan({
element: "#my-map-container",
type: "dense",
regionality: true,
stroked: true,
strokeColor: "#001830",
autoLinker: true,
autoLinkBaseUrl: "/tags",
prefLinks: {
    "13": {
    url: "https://yourdomain.com/tokyo", 
    target: "_blank", 
    rel: "nofollow"
    }
},
width: "100%",
height: "max-content"
})
```

## Options

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th align="center">Option name (key)</th>
                <th align="center">Value type</th>
                <th align="center">Initial value</th>
                <th align="left">explanation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td align="center"><strong>element</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center">–</td>
                <td align="left">Selector of the parent element where the map of Japan will be inserted</td>
            </tr>
            <tr>
                <td align="center"><strong>type</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center"><code>"full"</code></td>
                <td align="left"><strong>full</strong>:&nbsp;Generate a panoramic map of Japan<br /><strong>dense</strong>:&nbsp;Generate a dense map of Japan<br /><strong>deform</strong>:&nbsp;Generate a deformed map of Japan</td>
            </tr>
            <tr>
                <td align="center"><strong>stroked</strong></td>
                <td align="center"><em>Boolean</em></td>
                <td align="center"><code>true</code></td>
                <td align="left">Whether to draw a border on the map</td>
            </tr>
            <tr>
                <td align="center"><strong>strokeColor</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center"><code>"#333333"</code></td>
                <td align="left">Border color</td>
            </tr>
            <tr>
                <td align="center"><strong>activeColor</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center"><code>"#d70035"</code></td>
                <td align="left">Prefecture color when hovered over</td>
            </tr>
            <tr>
                <td align="center"><strong>withTips</strong></td>
                <td align="center"><em>Boolean</em></td>
                <td align="center"><code>true</code></td>
                <td align="left">Displays a tooltip on mouseover</td>
            </tr>
            <tr>
                <td align="center"><strong>regionality</strong></td>
                <td align="center"><em>Boolean</em></td>
                <td align="center"><code>false</code></td>
                <td align="left">Enable regional display</td>
            </tr>
            <tr>
                <td align="center"><strong>regions</strong></td>
                <td align="center"><em>Array(Object)</em></td>
                <td align="center"><code>null</code></td>
                <td align="left">Region definition. The "Eight Regional Divisions" are defined as the initial preset.</td>
            </tr>
            <tr>
                <td align="center"><strong>uniformly</strong></td>
                <td align="center"><em>Boolean</em></td>
                <td align="center"><code>false</code></td>
                <td align="left">Whether to fill the map with a single, uniform color. This setting takes precedence over the "regions" and "prefColors" settings.</td>
            </tr>
            <tr>
                <td align="center"><strong>uniformColor</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center"><code>"#c0c0c0"</code></td>
                <td align="left">unified color</td>
            </tr>
            <tr>
                <td align="center"><strong>prefColors</strong></td>
                <td align="center"><em>Object</em></td>
                <td align="center"><code>{}</code></td>
                <td align="left">The standard color for each prefecture.<br /><code>"Tokyo": "#777777",...</code><br />Specify the prefecture names in English (uppercase) as keys, and the corresponding colors as values, using key-value pairs.</td>
            </tr>
            <tr>
                <td align="center"><strong>width</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center">–</td>
                <td align="left">The width of the map display. If not specified, it defaults to "max-content".</td>
            </tr>
            <tr>
                <td align="center"><strong>height</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center">–</td>
                <td align="left">The vertical height of the map display. If not specified, it defaults to "max-content".</td>
            </tr>
            <tr>
                <td align="center"><strong>autoLinker</strong></td>
                <td align="center"><em>Boolean</em></td>
                <td align="center"><code>false</code></td>
                <td align="left">If <code>true</code>, each prefecture becomes a clickable link. URLs are generated automatically based on <code>autoLinkBaseUrl</code> and the English name of the prefecture (lowercase, hyphenated).</td>
            </tr>
            <tr>
                <td align="center"><strong>autoLinkBaseUrl</strong></td>
                <td align="center"><em>String</em></td>
                <td align="center">–</td>
                <td align="left">Base URL for <code>autoLinker</code>. For example: with <code>autoLinkBaseUrl: "/tags"</code>, clicking on <em>Aomori</em> leads to <code>/tags/aomori</code>.</td>
            </tr>
            <tr>
                <td align="center"><strong>prefLinks</strong></td>
                <td align="center"><em>Object</em></td>
                <td align="center"><code>{}</code></td>
                <td align="left">Custom link overrides for prefectures. Keys are prefecture IDs (e.g. <code>"13"</code> for Tokyo). Each entry can define <code>{ url, target, rel }</code>. Overrides <code>autoLinker</code> for that prefecture.</td>
            </tr>
        </tbody>
    </table>
</div>

## Demonstration

The shortcut is to use it for the time being.

[DEMO](https://ka2.org/svg-japan/)

## Creators

**ka2 (Katsuhiko Maeno)**
- <https://ka2.org/>

If you liked using this app or it has helped you in any way, I'd like you send me an email at ka2@ka2.org about anything you'd want to say about this software. I'd really appreciate it!

## Copyright and license

Code and documentation copyright 2020 the [ka2](https://ka2.org/). Code released under the [MIT License](https://raw.githubusercontent.com/ka215/svg-japan/main/LICENSE).
