const PORT = 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const urlContinente = 'https://www.continente.pt/on/demandware.store/Sites-continente-Site/default/Search-UpdateGrid?q=[query]&start=[start]&sz=24'
const urlAuchan = 'https://www.auchan.pt/on/demandware.store/Sites-AuchanPT-Site/pt_PT/Search-UpdateGrid?q=[query]&prefn1=soldInStores&prefv1=000&start=[start]&sz=24'
const items = []
let hasNext = true
let start = 0

app.get('/search/:query', async (req, res) => {

    const query = req.params.query


    while (hasNext) {

        const tempUrl = urlAuchan.replace('[query]', query).replace('[start]', start)

        console.log(tempUrl)

        axios(tempUrl)
            .then(response => {
                const html = response.data.trim()

                if (html === '') {
                    console.log('html is empty')
                    hasNext = false
                } else if (start < 780) {
                    console.log('start: ' + start)
                    console.log('hasNext: ' + hasNext)
                    start = start + 24

                    const $ = cheerio.load(html)

                    $('.product', html).each(function () {
                        const product = $(this).attr('data-urls')
                        const title = $(this).find('.auc-product-tile__name').find('a').text()
                        const url = 'https://www.auchan.pt' + $(this).find('.auc-product-tile__name').find('a').attr('href')
                        const brand = $(this).find('.ct-tile--brand').text()
                        const quantity = $(this).find('.ct-tile--quantity').text()
                        const price = $(this).find('.price').find('span.value').attr('content')
                        const image = $(this).find('.image-container').find('img').attr('src')
                        items.push({
                            title,
                            url,
                            brand,
                            quantity,
                            price,
                            image
                        })
                    })
                } else {
                    console.log('Não parou onde devia')
                    console.log('"' + html + '"')
                    hasNext = false
                }
            }).catch(err => console.log(err))

        await sleep(500);
    }

    // console.log(urlContinente.replace('[query]', query))
    //
    // axios(urlContinente.replace('[query]', query))
    //     .then(response => {
    //         const html = response.data
    //         const $ = cheerio.load(html)
    //
    //         $('.product', html).each(function (){
    //             const title = $(this).find('.ct-tile--description').text()
    //             const url = $(this).find('.ct-tile--description').attr('href')
    //             const brand = $(this).find('.ct-tile--brand').text()
    //             const quantity = $(this).find('.ct-tile--quantity').text()
    //             const price = $(this).find('.value').attr('content')
    //             const image = $(this).find('.ct-tile-image').attr('data-src')
    //             items.push({
    //                 title,
    //                 url,
    //                 brand,
    //                 quantity,
    //                 price,
    //                 image
    //             })
    //
    //         })
    //
    //
    //
    //     }).catch(err => console.log(err))
    console.log(items)
    res.json(items)
})

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}