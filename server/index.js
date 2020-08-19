const Koa = require('koa')
require('dotenv').config()
const { loadNuxt, build } = require('nuxt')
const { default: shopifyAuth } = require('@shopify/koa-shopify-auth')
const { verifyRequest } = require('@shopify/koa-shopify-auth')

const isDev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const { SHOPIFY_API_KEY, SHOPIFY_SECRET } = process.env

async function start() {
  const app = new Koa()

  // Instantiate nuxt.js
  const nuxt = await loadNuxt(isDev ? 'dev' : 'start')

  // Build in development
  if (isDev) {
    build(nuxt)
  }

  app.use(
    shopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_SECRET,
      scopes: ['write_orders, write_products'],
      accessMode: 'offline',
      afterAuth(ctx) {
        const { accessToken } = ctx.session

        console.log('We did it!', accessToken) // eslint-disable-line no-console

        ctx.redirect('/')
      },
    })
  )

  app.use(verifyRequest())

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, '0.0.0.0')
  console.log('Server listening on localhost:' + port) // eslint-disable-line no-console
}

start()
