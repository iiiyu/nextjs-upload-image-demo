# NextJS create a upload image api by itself and it supports Tinymce

If you build a website with NextJS as full stack web framework, perhaps you will encounter a need to upload a file.

But the NextJS's official website doesn't write how to do this.

So I investigated other developers' code to make a working version.

<!-- more -->

## Init Project

I will create new project base on last blog's [demo](https://github.com/iiiyu/nextjs-tinymce-demo). If you need to read it again, please click [here](https://iiiyu.com/2022/08/28/self-hosted-tinymce-6-x-in-nextjs-12-x-javascript-version/)

```bash
git clone https://github.com/iiiyu/nextjs-tinymce-demo.git nextjs-upload-image-demo
```

## Create the upload image folder

```bash
cd public
mkdir images
cd images
```

create the `public/images/.gitignore` file

```
# Ignore everything in this directory
*
# Except this file
!.gitignore
```

## Replace old nextjs server

For every images can be visit by custom domain name.
We need to define their route, so I find only one method is [Custom Server](https://nextjs.org/docs/advanced-features/custom-server) on NextJS.

1. Install express

```bash
yarn add express
```

2. Create the `server.js` file

```javascript
const express = require("express");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use("/images", express.static(__dirname + "/public/images"));

  server.all("*", (req, res) => {
    return handle(req, res);
  });
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

3. To run the custom server you'll need to update the scripts in `package.json` like so:

```json
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "lint": "next lint"
  }
```

## Create the API upload

Install formidable

```bash
yarn add formidable@v3
```

create the `pages/api/upload/file.js` file

```javascript
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const post = async (req, res) => {
  const form = formidable({
    uploadDir: "./public/images",
    keepExtensions: true,
  });
  form.parse(req, async function (err, fields, files) {
    // await saveFile(files.file);
    if (err) {
      res.status(500).json({ error: err });
      res.end();
      return;
    }

    if (files.file && files.file[0] && files.file[0].newFilename) {
      res.status(200).json({
        location:
          process.env.NEXTAUTH_URL + "/images/" + files.file[0].newFilename,
      });
      res.end();
    } else {
      res.status(500).json({ error: "No file uploaded" });
      res.end();
    }
  });
};

export default async (req, res) => {
  req.method === "POST"
    ? post(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? console.log("DELETE")
    : req.method === "GET"
    ? console.log("GET")
    : res.status(404).send("");
};
```

## The upload component

create the `components/upload/ImageUpload.jsx` file

```javascript
import { useState } from "react";

export function ImageUpload(props) {
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    const body = new FormData();
    body.append("file", image);
    fetch("/api/upload/file", {
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (props.onUpload) {
            props.onUpload(data);
          }
        }
      });
  };
  return (
    <div className="space-y-2">
      <img className="w-1/4" src={createObjectURL} />
      <div className="space-x-4">
        <input type="file" name="myImage" onChange={uploadToClient} />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
          onClick={uploadToServer}
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}
```

## Support TinyMCE

Update the `components/editor/CustomEditor.jsx` file

```javascript
import { Editor } from "@tinymce/tinymce-react";
import React, { useRef } from "react";

export function CustomEditor(props) {
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  return (
    <Editor
      tinymceScriptSrc={"/assets/libs/tinymce/tinymce.min.js"}
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={props.content}
      init={{
        selector: "textarea", // change this value according to your HTML
        images_upload_url: "/api/upload/file",
        automatic_uploads: true,
        height: 500,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
      onEditorChange={props.handleOnEditorChange}
    />
  );
}
```

## Index Show

Uses those components

`pages/index.js`

```javascript
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { CustomEditor } from "../components/editor/CustomEditor";
import { ImageUpload } from "../components/upload/ImageUpload";
import { useState } from "react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <main className={styles.main}>
        <div className="space-y-16">
          <div>
            <ImageUpload
              onUpload={(data) => {
                setImageUrl(data.location);
              }}
            />
            {imageUrl ? (
              <>
                <img className="w-1/4" src={imageUrl}></img>
              </>
            ) : (
              <></>
            )}
          </div>

          <div>
            <CustomEditor />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
```

![upload image](https://s2.loli.net/2022/10/02/ZDow2WVsUNtkqR5.png)

## One more thing

I supposed this method only support deploy to self host, it can't support deploy to vercel.

## Demo

[Demo](https://github.com/iiiyu/nextjs-upload-image-demo)
