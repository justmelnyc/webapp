const PLUGIN_NAME = 'UploadHTMLPlugin'

// Posts each emitted .html asset to an apex/serve endpoint (uses global fetch, Node 18+)
class UploadHTMLPlugin {
  constructor({ endpoint, username, password }) {
    this.endpoint = endpoint
    this.username = username
    this.password = password
  }

  upload(version, html) {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64')
    console.log(`\n\nUploading version ${version} to apex/serve at ${this.endpoint}\n\n`)
    return fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app: 'webapp', version, html }),
    }).then((response) => {
      if (!response.ok) throw new Error(`Upload failed with status ${response.status}`)
      console.log(`\n\nSUCCESSFULLY uploaded version ${version} to ${this.endpoint}\n\n`)
    }).catch((err) => {
      console.log(`\n\nFAILED to upload version ${version} to ${this.endpoint}\n\n`, err)
    })
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise(PLUGIN_NAME, (compilation) => {
      const uploads = Object.keys(compilation.assets)
        .filter(filename => /\.html$/.test(filename))
        .map(filename => this.upload(
          filename.split('.')[0],
          compilation.assets[filename].source().toString(),
        ))
      return Promise.all(uploads)
    })
  }
}

module.exports = UploadHTMLPlugin
