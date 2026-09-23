# 速成查碼 · Quick Lookup

Type any Chinese word and see how to type it in **速成 (Quick)**, the input method many people in Hong Kong grew up with. The Cangjie radicals for each character tumble out of a physics-driven pile and land beneath the search box, and each character is read aloud in Cantonese.

## Motivation

Learning to type and write Traditional Chinese characters is declining, as Pinyin input and Simplified characters dominate modern digital communication.

To me, a language and the way we type it are both important intangible cultural heritage. I wanted to create a piece of interactive media that helps preserve them, and at the same time a tool to train myself in typing Chinese characters.

## Features

- **Quick code lookup:** type or paste any word and see each character's 速成 code (e.g. 我 → 竹戈 · `HI`), plus its full 倉頡 (Cangjie) code.
- **A living radical pile:** the 26 Cangjie keys (日月金木水火土竹戈十大中一弓人心手口尸廿山女田難卜重) fall and pile up with real physics ([Matter.js](https://brm.io/matter-js/)). Typing a character lifts its radicals out of the pile, and deleting it drops them back. You can also drag and throw them.
- **Cantonese pronunciation (粵):** characters are spoken as you type them. Click a character to hear it again, or tap a radical in the pile.
- **Light and dark mode**, and it works on mobile.
- About 17,600 characters: all of Big5 plus the Hong Kong Supplementary Character Set (HKSCS), including Cantonese characters such as 咩、啲、嘅、冇、嘢.

## How Quick (速成) works

速成 is a simplified form of 倉頡 (Cangjie). Every character has a Cangjie code of up to five radicals, and its Quick code is just the **first and last** of them:

| Character | Cangjie (倉頡) | Quick (速成) |
|---|---|---|
| 我 | 竹手戈 `HQI` | 竹戈 `HI` |
| 好 | 女弓木 `VND` | 女木 `VD` |
| 想 | 木山心 `DUP` | 木心 `DP` |

The codes follow **Cangjie 3**, the version used by the built-in Quick/Cangjie keyboards on macOS, Windows, iOS and Android.

## Run it locally

```sh
python3 serve.py
```

Then open <http://127.0.0.1:8741/>.

`serve.py` is a small static server with one extra endpoint, `/speak`. It uses the macOS Cantonese voice (Sinji) to turn a character into audio, because Chrome's built-in speech goes silent when triggered while typing with a Chinese input method. Without `serve.py` (for example, opened from any other static host), the page falls back to the browser's own speech.

## Credits

- **Cangjie 3 code table:** [Cangjie3-Plus 倉頡三代補完計畫](https://github.com/Arthurmcarthur/Cangjie3-Plus) (MIT License, © 朱邦復（發明）/倉頡之友·馬來西亞（修訂）/倉頡三代補完計劃（修訂）). The copyright notice is kept at the top of `cangjie.js`.
- **Physics:** [Matter.js](https://github.com/liabru/matter-js) (MIT License).
- **Fonts:** [LXGW WenKai TC 霞鶩文楷](https://github.com/lxgw/LxgwWenkaiTC) and [Noto Sans HK](https://fonts.google.com/noto/specimen/Noto+Sans+HK), both under the SIL Open Font License, served by Google Fonts.
- **Voice:** the macOS Cantonese voice Sinji (善怡), which is not distributed with this project.

## License

The code in this repository is released under the [MIT License](LICENSE). The Cangjie code data in `cangjie.js` keeps its own MIT license from Cangjie3-Plus.
