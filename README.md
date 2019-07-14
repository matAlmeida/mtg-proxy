# mtg-proxy

![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/matalmeida/mtg-proxy.svg)
![NPM](https://img.shields.io/npm/l/mtg-proxy.svg)
![NPM Downloads](https://img.shields.io/npm/dt/mtg-proxy.svg)

Create proxy cards for MTG with a clean visual

# Usage

Download the CLI

```sh
$ npm i -g mtg-proxy
```

Create a file with a cards list, with the following format:

```txt
4 Battle Screech
1 Veteran Armorer
```

Now you can create your proxies just running:

```sh
$ mtg-proxy ./my-card-list.txt ./export-folder
```

Note: The `export folder` is a optional argument

Now you has your output:

<p align="center">
<img src="https://raw.githubusercontent.com/matAlmeida/mtg-proxy/master/docs/battle_screech.png" height="300" />
&nbsp &nbsp
<img src="https://raw.githubusercontent.com/matAlmeida/mtg-proxy/master/docs/veteran_armorer.png" height="300" />
</p>

# Roadmap

- [x] Create cards from MOL list
- [x] Fix proxies sizes to fit in sleeves/shields
- [x] Create a PDF with the right size to use as proxie and all cards by list quantity
- [ ] Create cards from MTGA list

# License

MIT
