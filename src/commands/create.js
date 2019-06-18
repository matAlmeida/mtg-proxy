const path = require('path')
const fs = require('fs')
const Jimp = require('jimp')
const HTML5ToPDF = require('html5-to-pdf')

const api = require('../services/api')

const template = path.join(__dirname, '..', 'assets', 'template.png')

module.exports = {
  name: 'create',
  run: async toolbox => {
    const { print, parameters, filesystem } = toolbox

    const { from, to } = parameters.options

    if (!from || !filesystem.exists(from)) {
      print.error(
        'You must suplie an existing source list with the cards you want using the parameter \'--from="<path to list>"\''
      )

      return
    }

    let exportPath = path.resolve('.')

    if (to) {
      exportPath = path.resolve(to)
    }

    if (!filesystem.exists(to)) {
      print.error(
        `> The folder '${to}' doesn't exists yet! We are creating one for you...`
      )

      fs.mkdirSync(exportPath)
    }

    if (filesystem.exists(from) === 'file') {
      print.success('Starting...\n')
      const listPath = filesystem.path(from)
      const list = filesystem.read(listPath, 'utf8').split(/\r?\n/)

      const cardsInfo = await Promise.all(
        list.map(async item => {
          const [quantity, ...name] = item.split(' ')
          if (name.length > 0) {
            const cardName = name.join(' ')

            const cardInfo = await api
              .get(`/cards/named?fuzzy=${cardName}`)
              .catch(e => {
                print.error('Something wrong happened:')
                print.error(cardName)
                print.error(e.response.data.details)

                process.exit(1)
              })

            const {
              name: fullName,
              mana_cost: manaCost,
              type_line: typeLine,
              oracle_text: oracleText,
              power,
              toughness
            } = cardInfo.data

            return {
              quantity,
              fullName,
              lowCaseName: fullName.replace(' ', '_').toLowerCase(),
              manaCost,
              typeLine: typeLine.replace('—', '-'),
              oracleText: oracleText.replace('—', '-'),
              power,
              toughness
            }
          }
        })
      )

      await Promise.all(
        cardsInfo.map(
          async (card, index) =>
            new Promise(async (resolve, reject) => {
              if (card) {
                const cardFile = path.join(
                  exportPath,
                  `${card.lowCaseName}.png`
                )
                cardsInfo[index].imagePath = cardFile

                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
                const image = await Jimp.read(template)

                image
                  .print(font, 82, 77, card.fullName)
                  .print(
                    font,
                    82,
                    77,
                    {
                      text: card.manaCost ? card.manaCost : '',
                      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                    },
                    640
                  )
                  .print(font, 82, 642, card.typeLine)
                  .print(
                    font,
                    82,
                    717,
                    { text: card.oracleText ? card.oracleText : '' },
                    640
                  )
                  .print(
                    font,
                    82,
                    1026,
                    {
                      text:
                        card.power && card.toughness
                          ? `${card.power} / ${card.toughness}`
                          : '',
                      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                    },
                    640
                  )
                  .resize(227, Jimp.AUTO)
                  .write(cardFile, e => {
                    if (e) reject(e)
                    print.success(`> ${card.fullName} is Ready!`)
                    resolve()
                  })
              }
            })
        )
      )

      print.success('\n> Creating PDF...')

      const cardsHtml = cardsInfo.reduce((allCards, card) => {
        const image = fs.readFileSync(card.imagePath)
        const base64image = image.toString('base64')

        const imageURI = `data:image/png;base64,${base64image}`

        const base = `<img class="card" src="${imageURI}" />`

        for (let i = 0; i < card.quantity; i++) {
          allCards.push(base)
        }

        return allCards
      }, [])

      const resultHtml = `<!DOCTYPE html>
      <html>
      <head>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      #grid {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-around;
      }

      .card {
        padding: 1.75em 0;
      }
      </style>
      </head>
      <body>
      <div id="grid">
      ${cardsHtml.join('\n')}
      </div>
      </body>
      </html>
      `

      const html5ToPDF = new HTML5ToPDF({
        inputBody: resultHtml,
        outputPath: path.join(exportPath, 'output.pdf'),
        options: {
          pageSize: 'A4',
          marginsType: 1
        }
      })

      await html5ToPDF.start()
      await html5ToPDF.build()
      await html5ToPDF.close()

      print.success('> PDF generated!')
      print.success('\n> Cleaning files...')

      cardsInfo.map(({ imagePath }) => fs.unlinkSync(imagePath))

      print.success('Done!')
    }
  }
}
