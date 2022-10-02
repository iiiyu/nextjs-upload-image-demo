import formidable from 'formidable'


export const config = {
  api: {
    bodyParser: false,
  },
}

const post = async (req, res) => {
  const form = formidable({
    uploadDir: './public/images',
    keepExtensions: true,
  })
  form.parse(req, async function (err, fields, files) {
    // await saveFile(files.file);
    if (err) {
      res.status(500).json({ error: err })
      res.end()
      return
    }

    if (files.file && files.file[0] && files.file[0].newFilename) {
      res.status(200).json({ location: process.env.NEXTAUTH_URL + '/images/' + files.file[0].newFilename })
      res.end()
    } else {
      res.status(500).json({ error: 'No file uploaded' })
      res.end()
    }

  })
}

export default async (req, res) => {
  req.method === 'POST'
    ? post(req, res)
    : req.method === 'PUT'
      ? console.log('PUT')
      : req.method === 'DELETE'
        ? console.log('DELETE')
        : req.method === 'GET'
          ? console.log('GET')
          : res.status(404).send('')
}
