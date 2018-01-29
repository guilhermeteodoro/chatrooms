const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')

const cache = {}

function send404 (response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' })
  response.write('Error 404: resource not found')
  response.end()
}

function sendFile (response, filePath, fileContents) {
  response.writeHead(200,
    { 'Content-Type': mime.lookup(path.basename(filePath)) }
  )

  response.end(fileContents)
}

function serveStatic (response, cache, absolutePath) {
  if (cache[absolutePath]) {
    return sendFile(response, absolutePath, cache[absolutePath])
  }

  fs.exists(absolutePath, function (exists) {
    if (!exists) {
      return send404(response)
    }

    fs.readFile(absolutePath, function (err, data) {
      if (err) {
        return send404(response)
      }

      cache[absolutePath] = data
      sendFile(response, absolutePath, cache[absolutePath])
    })
  })
}

const server = http.createServer(function (request, response) {
  let filePath

  if (request.url === '/') {
    filePath = 'public/index.html'
  } else {
    filePath = `public/${request.url}`
  }

  let absolutePath = `./${filePath}`

  serveStatic(response, cache, absolutePath)
})

server.listen(3000, function () {
  console.log('Server listening on port 3000')
})
