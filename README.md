# 速成查碼 · Quick Lookup

Type any Chinese word and see how to type it in **速成 (Quick)**, the input method many people in Hong Kong grew up with. The Cangjie radicals for each character tumble out of a physics-driven pile and land beneath the search box. You can also practise writing each character stroke by stroke, and read how Quick came to be.

<p align="center">
  <a href="https://www.carrielau.com/learn-quick-input/">
    <img src="https://img.shields.io/badge/%E2%96%B6%20Try%20it%20live-%E9%80%9F%E6%88%90%E6%9F%A5%E7%A2%BC-111111?style=for-the-badge" alt="▶ Try it live: 速成查碼" />
  </a>
  <br />
  <sub>No Chinese keyboard? Tap one of the example words to see it in action.</sub>
</p>

> 🚧 Work in progress: actively being built, so expect changes.

![Practising the stroke order of 香, five strokes in](screenshots/stroke.png)
![Radicals raining down onto the pile](screenshots/radical-rain.png)

## Motivation

Learning to type and write Traditional Chinese characters is declining, as Pinyin input and Simplified characters dominate modern digital communication.

To me, a language and the way we type it are both important intangible cultural heritage. I wanted to create a piece of interactive media that helps preserve them, and at the same time a tool to train myself in typing Chinese characters.

Beyond heritage, a recent conversation with a friend reminded me how cool it is to speak and type in Cantonese again.

## Features

- **Quick code lookup:** type any Chinese word to see its Quick code, with the full Cangjie code alongside.
- **A living radical pile:** each character's radicals tumble into a physics-driven pile below the search box.
- **Stroke practice:** press ✏️ next to a result to watch the stroke order, then write the character yourself on a 米字格 practice grid, with feedback on each stroke.
- **History page:** a timeline from the legend of 倉頡 to Quick, plus the 24 Cangjie radicals and how Quick shortens Cangjie codes.
- **Bilingual:** switch between Traditional Chinese and English. The site remembers your choice and otherwise follows your browser's language.
- **Light and dark mode**

## How Quick (速成) works

速成 is a simplified form of 倉頡 (Cangjie). Every character has a Cangjie code of up to five radicals, and its Quick code is just the **first and last** of them:

| Character | Cangjie (倉頡) | Quick (速成) |
|---|---|---|
| 我 | 竹手戈 `HQI` | 竹戈 `HI` |
| 好 | 女弓木 `VND` | 女木 `VD` |
| 想 | 木山心 `DUP` | 木心 `DP` |

The codes follow **Cangjie 3**, the version used by the built-in Quick/Cangjie keyboards on macOS, Windows, iOS and Android.

## Run it locally

It's a plain static site, so any static server works:

```sh
python3 -m http.server 8741
```

Then open <http://127.0.0.1:8741/>.

## Credits

- **Cangjie 3 code table:** [Cangjie3-Plus 倉頡三代補完計畫](https://github.com/Arthurmcarthur/Cangjie3-Plus) (MIT License, © 朱邦復（發明）/倉頡之友·馬來西亞（修訂）/倉頡三代補完計劃（修訂）). The copyright notice is kept at the top of `cangjie.js`.
- **Physics:** [Matter.js](https://github.com/liabru/matter-js) (MIT License).
- **Stroke practice:** [Hanzi Writer](https://github.com/chanind/hanzi-writer) (MIT License).
- **Stroke data:** [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data), derived from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) and Arphic's fonts (Arphic Public License).
- **Fonts:** [LXGW WenKai TC 霞鶩文楷](https://github.com/lxgw/LxgwWenkaiTC) and [Noto Sans HK](https://fonts.google.com/noto/specimen/Noto+Sans+HK), both under the SIL Open Font License, served by Google Fonts.

## License

The code in this repository is released under the [MIT License](LICENSE). The Cangjie code data in `cangjie.js` keeps its own MIT license from Cangjie3-Plus.
