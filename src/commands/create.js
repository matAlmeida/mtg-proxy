const path = require('path')
const fs = require('fs')
const api = require('../services/api')
const Jimp = require('jimp')

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

    if (to && !filesystem.exists(to)) {
      print.error(
        `> The folder '${to}' doesn't exists yet! We are creating one for you...`
      )

      exportPath = path.resolve(to)

      fs.mkdirSync(exportPath)
    }

    if (filesystem.exists(from) === 'file') {
      print.success('Starting...')
      const listPath = filesystem.path(from)
      const list = filesystem.read(listPath, 'utf8').split(/\r?\n/)

      const cardsInfo = await Promise.all(
        list.map(async item => {
          const [quantity, ...name] = item.split(' ')
          const cardName = name.join(' ')

          const cardInfo = await api.get(cardName)

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
            manaCost,
            typeLine: typeLine.replace('—', '-'),
            oracleText: oracleText.replace('—', '-'),
            power,
            toughness
          }
        })
      )

      await Promise.all(
        cardsInfo.map(async card => {
          try {
            const cardLowName = card.fullName.replace(' ', '_').toLowerCase()
            const cardFile = path.join(exportPath, `${cardLowName}.png`)

            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
            const image = await Jimp.read(template)

            image
              .print(font, 82, 77, card.fullName)
              .print(
                font,
                82,
                77,
                {
                  text: card.manaCost,
                  alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                },
                640
              )
              .print(font, 82, 642, card.typeLine)
              .print(font, 82, 717, card.oracleText, 640)
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
              .write(cardFile)

            print.success(`> ${card.fullName} is Ready!`)
          } catch (error) {
            print.error(error)
          }
        })
      )

      print.success('Done!')
    }
  }
}
